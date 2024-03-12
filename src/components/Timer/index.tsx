import React, { useEffect, useState } from 'react'
import IpcMessage from '../../constants/ipcMessage'
import useInterval from '../../utils/useInterval'
import { Progress, TaskTitle } from './styles'
import {
  COOLDOWN_DURATION,
  CSS_ANIMATION_CORRECTION_FACTOR,
  TICKS_PER_SECOND,
} from '../../constants/constants'
import { TaskViewContainer } from '../shared/styles'
import { createIpcRendererInterface } from '../../utils/IpcInterface'
import { DateTime } from 'luxon'

const Timer = ({ durationInMinutes, name }: { durationInMinutes: number; name: string }) => {
  const [startTime] = useState(DateTime.now())
  const [taskProgress, setTaskProgress] = useState(0)
  const [cooldownStart, setCooldownStart] = useState<DateTime | undefined>(undefined)

  const ipcRenderer = createIpcRendererInterface()


  useInterval(() => {
    const now = DateTime.now()
    setTaskProgress(Math.floor(now.diff(startTime, 'seconds').seconds * TICKS_PER_SECOND))
    if (taskProgress >= durationInMinutes * 60 * TICKS_PER_SECOND) {
      if (!cooldownStart) {
        setCooldownStart(now)
      }
      else if (now.diff(cooldownStart, 'seconds').seconds > COOLDOWN_DURATION) {
        ipcRenderer.send({
          channel: IpcMessage.EndTask,
          param: { name, duration: durationInMinutes },
        })
      }
    }
  }, 1000 / TICKS_PER_SECOND)

  return (
    <>
      <Progress
        isComplete={cooldownStart !== undefined}
        value={taskProgress}
        max={durationInMinutes * 60 * TICKS_PER_SECOND}
      />
      <TaskTitle>{name}</TaskTitle>
      {cooldownStart && (
        <TaskViewContainer
          fadeInDuration={COOLDOWN_DURATION * CSS_ANIMATION_CORRECTION_FACTOR}
        />
      )}
    </>
  )
}

export default Timer
