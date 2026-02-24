import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useTimer() {
  const { activeShift } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live clock — always ticking
  useEffect(() => {
    const tick = () => setCurrentTime(new Date());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed timer — counts from actual shift start time
  useEffect(() => {
    if (!activeShift) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(activeShift.startTime).getTime();

    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };

    updateElapsed(); // run immediately so no 0-second flash
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatElapsed = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const formatClock = (date: Date): string => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return {
    elapsed,
    formattedTime: formatElapsed(elapsed),   // elapsed since shift start (e.g. 01:23:45)
    currentTime: formatClock(currentTime),    // real clock (e.g. 14:32:15)
    shiftStartTime: activeShift
      ? `${pad(new Date(activeShift.startTime).getHours())}:${pad(new Date(activeShift.startTime).getMinutes())}`
      : null,
    isActive: !!activeShift,
  };
}
