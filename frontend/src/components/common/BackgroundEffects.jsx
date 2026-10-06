// src/components/common/BackgroundEffects.jsx
// Soft ambient illumination tailored for a professional online learning platform.

import { useTheme } from '../../context/ThemeContext';

function BackgroundEffects() {
  const { activeThemeMeta } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-500">
      {/* Soft ambient gradient orbs */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-[160px] animate-orb-1"
        style={{ backgroundColor: 'var(--orb1-color)' }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full blur-[160px] animate-orb-2"
        style={{ backgroundColor: 'var(--orb2-color)' }}
      />
    </div>
  );
}

export default BackgroundEffects;

