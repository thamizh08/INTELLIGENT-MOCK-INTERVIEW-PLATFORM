// src/context/ThemeContext.jsx
// Provider & hook for managing the 6 professional formal themes tailored for premier online learning platforms.

import { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  {
    id: 'dark',
    name: 'Corporate Dark',
    icon: '🏛️',
    badge: 'Slate Indigo',
    bgClass: 'bg-[#0f172a]',
    accentColor: '#4f46e5',
    description: 'Executive dark slate theme with refined indigo accents'
  },
  {
    id: 'light',
    name: 'Campus Light',
    icon: '☀️',
    badge: 'Pure Academic',
    bgClass: 'bg-[#f8fafc]',
    accentColor: '#2563eb',
    description: 'Crisp corporate light theme inspired by top universities'
  },
  {
    id: 'midnight',
    name: 'Executive Navy',
    icon: '🌌',
    badge: 'Oxford Navy',
    bgClass: 'bg-[#091122]',
    accentColor: '#3b82f6',
    description: 'Deep navy professional study theme with cobalt accents'
  },
  {
    id: 'warm',
    name: 'Harvard Ivory',
    icon: '📜',
    badge: 'Campus Ivory',
    bgClass: 'bg-[#faf8f5]',
    accentColor: '#c2410c',
    description: 'Warm academic ivory theme with rich terracotta tones'
  },
  {
    id: 'emerald',
    name: 'Cambridge Forest',
    icon: '🌲',
    badge: 'Academic Emerald',
    bgClass: 'bg-[#081f1a]',
    accentColor: '#10b981',
    description: 'Deep formal forest dark theme with emerald highlights'
  },
  {
    id: 'nordic',
    name: 'Nordic Minimal',
    icon: '⚖️',
    badge: 'Minimal Slate',
    bgClass: 'bg-[#f3f4f6]',
    accentColor: '#0f172a',
    description: 'Executive monochrome minimalist light interface'
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
    return 'dark';
  });

  const setTheme = (newTheme) => {
    if (THEMES.some(t => t.id === newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('app_theme', newTheme);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const activeThemeMeta = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, activeThemeMeta }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

