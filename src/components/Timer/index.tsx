import { ipcRenderer } from 'electron'
import React, { useState } from 'react'
import IpcMessages from '../../constants/ipcMessages'
import useInterval from '../../utils/useInterval'
import { Progress, TaskTitle } from './styles'
import {
  COOLDOWN_DURATION,
  CSS_ANIMATION_CORRECTION_FACTOR,
  TICKS_PER_SECOND,
} from '../../constants/constants'
import { TaskViewContainer } from '../shared/styles'

const Timer = ({ duration, name }: { duration: number; name: string }) => {
  const [taskProgress, setProgress] = useState(0)
  const [cooldownProgress, setCooldownProgress] = useState(0)

  useInterval(() => {
    setProgress(Math.min(duration * TICKS_PER_SECOND * 60, taskProgress + 1))
    if (taskProgress >= duration * TICKS_PER_SECOND * 60) {
      setCooldownProgress(cooldownProgress + 1)
      if (cooldownProgress >= COOLDOWN_DURATION * TICKS_PER_SECOND * 60) {
        ipcRenderer.send(IpcMessages.EndTask)
      }
    }
  }, 1000 / TICKS_PER_SECOND)

  return (
    <>
      <Progress
        isComplete={cooldownProgress > 0}
        value={taskProgress}
        max={duration * TICKS_PER_SECOND * 60}
      />
      <TaskTitle>{name}</TaskTitle>
      {cooldownProgress > 0 && (
        <TaskViewContainer
          fadeInDuration={COOLDOWN_DURATION * CSS_ANIMATION_CORRECTION_FACTOR}
        />
      )}
    </>
  )
}

export default Timer
