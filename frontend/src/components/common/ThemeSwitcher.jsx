// src/components/common/ThemeSwitcher.jsx
// Interactive dropdown component to switch between the 4 adaptive themes.

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

function ThemeSwitcher() {
  const { theme, setTheme, themes, activeThemeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-theme-border bg-theme-surface text-theme-text text-xs font-mono font-medium hover:border-theme-accent transition-all shadow-sm group focus:outline-none"
        title="Switch UI Theme"
      >
        <span className="text-sm">{activeThemeMeta.icon}</span>
        <span className="hidden sm:inline-block font-semibold">{activeThemeMeta.name}</span>
        <span className="w-2 h-2 rounded-full transition-all" style={{ backgroundColor: activeThemeMeta.accentColor }}></span>
        <svg
          className={`w-3.5 h-3.5 text-theme-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-theme-border bg-theme-surface/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-theme-muted border-b border-theme-border/50 mb-1">
            Select Adaptive Theme (6)
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg transition-all text-xs ${
                    isSelected
                      ? 'bg-theme-accent/15 border border-theme-accent/40 text-theme-text'
                      : 'hover:bg-theme-card text-theme-muted hover:text-theme-text'
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-semibold font-mono text-xs">
                      <span>{t.name}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accentColor }}></span>
                    </div>
                    <p className="text-[10px] text-theme-muted line-clamp-1 mt-0.5 leading-tight font-sans">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
