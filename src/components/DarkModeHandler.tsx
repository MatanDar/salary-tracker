import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function DarkModeHandler() {
  const { settings } = useApp();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return null;
}
