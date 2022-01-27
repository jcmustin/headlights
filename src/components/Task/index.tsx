import { ipcRenderer } from 'electron';
import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IpcMessages from '../../constants/ipcMessages';
import States from '../../constants/states';
import { Input, StartTaskButton, InputContainer } from './styles';
import { TaskViewContainer } from '../shared/styles';

const TaskView: () => JSX.Element = () => {
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
    ipcRenderer.send(IpcMessages.CueStartTask, {
      name,
      duration: parseFloat(duration) * 60,
    });
  };

  return (
    <TaskViewContainer>
      <InputContainer>
        <Input
          spellCheck={false}
          type="text"
          value={name}
          onChange={onNameChange}
          autoFocus
        />
      </InputContainer>
      <InputContainer>
        <Input
          spellCheck={false}
          type="text"
          value={duration}
          onChange={onDurationChange}
        />
      </InputContainer>
      <StartTaskButton type="submit" onClick={onStartTask}>
        Start
      </StartTaskButton>
    </TaskViewContainer>
  );
};

export default TaskView;
