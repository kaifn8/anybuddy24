import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('anybuddy-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  // Default to light mode — don't follow system preference to avoid unexpected dark mode
  return 'light';
}

// Apply theme on initial page load (runs once, before any component mounts)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('anybuddy-theme');
  if (stored === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('anybuddy-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  return { theme, setTheme, toggleTheme, isDark };
}
