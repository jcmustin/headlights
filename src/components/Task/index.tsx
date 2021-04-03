import { ipcRenderer } from 'electron';
import React, { ChangeEventHandler, useDebugValue, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IpcMessages from '../../constants/ipcMessages';
import States from '../../constants/states';
import { DurationInput, NameInput, StartTaskButton, TaskView } from './styles';

const Task: () => JSX.Element = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const history = useHistory();

  const onNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const onDurationChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: newDuration } = event.target;
    if (/^[0-9]*\.?[0-9]*$/.test(newDuration)) {
      setDuration(newDuration);
    }
  };

  ipcRenderer.on(IpcMessages.StartTask, () => {
    history.push(States.Timer);
  });

  const onStartTask = () => {
    ipcRenderer.send(IpcMessages.CueStartTask, { name, duration });
  };

  return (
    <TaskView>
      <NameInput
        type="text"
        placeholder="task"
        value={name}
        onChange={onNameChange}
      />
      <DurationInput
        type="text"
        placeholder="duration"
        value={duration}
        onChange={onDurationChange}
      />
      <StartTaskButton type="submit" onClick={onStartTask}>
        Start
      </StartTaskButton>
    </TaskView>
  );
};

export default Task;
