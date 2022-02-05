import { ipcRenderer } from 'electron'
import React, { ChangeEventHandler, useEffect, useState } from 'react'
import IpcMessages from '../../constants/ipcMessages'
import { Input, StartTaskButton, InputContainer } from './styles'
import { TaskViewContainer } from '../shared/styles'
import Mousetrap from 'mousetrap'
import View from '../../constants/view'
import { createTask } from '../../models/Task'
import { Status } from '../../constants/status'

const TaskView: React.FC<{
  name: string
  duration: number
}> = ({ duration: activeTaskDuration, name: activeTaskName = '' }) => {
  const [name, setName] = useState(activeTaskName)
  const [duration, setDuration] = useState(
    activeTaskDuration ? activeTaskDuration.toString() : '',
  )

  useEffect(() => {
    Mousetrap.bind('mod+enter', () => {
      onStartTask()
    })
    Mousetrap.bind('alt+s', (e) => {
      e.preventDefault()
      ipcRenderer.send(IpcMessages.CueSetView, View.Schedule)
    })
    return () => {
      Mousetrap.unbind('mod+enter')
    }
  }, [name, duration])

  const onNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value)
  }

  const onDurationChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: newDuration } = event.target
    if (/^[0-9]*\.?[0-9]*$/.test(newDuration)) {
      setDuration(newDuration)
    }
  }

  const onStartTask = () => {
    if (!name.length || !duration) return
    ipcRenderer.send(IpcMessages.StartTask, {
      name,
      duration,
    })
  }

  return (
    <TaskViewContainer>
      <InputContainer>
        <Input
          spellCheck={false}
          type="text"
          value={name}
          onChange={onNameChange}
          autoFocus
          className="mousetrap"
        />
      </InputContainer>
      <InputContainer>
        <Input
          spellCheck={false}
          type="text"
          value={duration}
          onChange={onDurationChange}
          className="mousetrap"
        />
      </InputContainer>
      <StartTaskButton
        type="submit"
        disabled={!name || !duration}
        onClick={onStartTask}
      >
        Start
      </StartTaskButton>
    </TaskViewContainer>
  )
}

export default TaskView
