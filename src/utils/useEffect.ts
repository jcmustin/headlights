// source: https://github.com/streamich/react-use/blob/master/src/useInterval.ts */
import { useEffect, useRef } from 'react';

const useInterval = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any[]) => void,
  delay?: number | null
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedCallback = useRef<(...args: any[]) => void>(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => savedCallback.current(), delay || 0);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [delay]);
};

export default useInterval;
