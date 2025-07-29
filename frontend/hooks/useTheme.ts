import { useState, useEffect } from 'react';

export function useTheme() {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      setMode(savedTheme);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return {
    mode: mode === 'dark',
    toggleMode
  };
}
