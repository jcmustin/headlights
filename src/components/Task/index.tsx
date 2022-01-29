import { ipcRenderer } from 'electron'
import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import IpcMessages from '../../constants/ipcMessages'
import States from '../../constants/states'
import { Input, StartTaskButton, InputContainer } from './styles'
import { TaskViewContainer } from '../shared/styles'
import * as Mousetrap from 'mousetrap'

const TaskView: () => JSX.Element = () => {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const history = useHistory()

  useEffect(() => {
    ipcRenderer.on(IpcMessages.StartTask, () => {
      history.push(States.Timer)
    })
    Mousetrap.bind('mod+enter', () => {
      onStartTask()
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
    if (!name || !duration) return
    ipcRenderer.send(IpcMessages.CueStartTask, {
      name,
      duration: parseFloat(duration) * 60,
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
