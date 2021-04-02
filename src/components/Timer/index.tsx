import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import States from '../../constants/states';
import useInterval from '../../utils/useEffect';
import { Progress, TaskTitle } from './styles';

const Timer = ({
  duration,
  taskTitle,
}: {
  duration: number;
  taskTitle: string;
}) => {
  const [progress, setProgress] = useState(0);
  const history = useHistory();
  useEffect(() => {
    ipcRenderer.on('end-task', (_) => {
      history.push(States.Task);
    });
  }, [history]);

  useInterval(() => {
    setProgress(progress + 1);
    if (progress >= duration * 60) {
      ipcRenderer.send('cue-end-task');
    }
  }, 1000);

  return (
    <div>
      <Progress value={progress} max={duration * 60} />
      <TaskTitle>{taskTitle}</TaskTitle>
    </div>
  );
};

export default Timer;
