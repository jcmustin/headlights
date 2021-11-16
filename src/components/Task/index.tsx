import { ipcRenderer } from 'electron';
import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IpcMessages from '../../constants/ipcMessages';
import States from '../../constants/states';
import { DurationInput, NameInput, StartTaskButton, TaskView } from './styles';

const Task: () => JSX.Element = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const history = useHistory();

  useEffect(() => {
    ipcRenderer.on(IpcMessages.StartTask, () => {
      history.push(States.Timer);
    });
  }, []);

  const onNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const onDurationChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: newDuration } = event.target;
    if (/^[0-9]*\.?[0-9]*$/.test(newDuration)) {
      setDuration(newDuration);
    }
  };

  const onStartTask = () => {
    ipcRenderer.send(IpcMessages.CueStartTask, { name, duration });
  };

  return (
    <TaskView>
      <NameInput type="text" value={name} onChange={onNameChange} autoFocus />
      <DurationInput type="text" value={duration} onChange={onDurationChange} />
      <StartTaskButton type="submit" onClick={onStartTask}>
        Start
      </StartTaskButton>
    </TaskView>
  );
};

export default Task;
