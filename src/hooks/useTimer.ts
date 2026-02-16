import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useTimer() {
  const { activeShift } = useApp();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeShift) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(activeShift.startTime).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000)); // seconds
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    elapsed,
    formattedTime: formatTime(elapsed),
    isActive: !!activeShift,
  };
}
