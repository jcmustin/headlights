import React, { useState } from 'react';
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

  useInterval(() => {
    setProgress(progress + 1);
  }, 1000);

  return (
    <div>
      <Progress value={progress} max={duration * 60} />
      <TaskTitle>{taskTitle}</TaskTitle>
    </div>
  );
};

export default Timer;
