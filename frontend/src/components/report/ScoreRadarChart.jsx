// src/components/report/ScoreRadarChart.jsx
// Theme-adaptive Recharts radar visualization that reads CSS variables for colors.

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

function ScoreRadarChart({ overallScores }) {
  const [colors, setColors] = useState({
    grid: '#1e293b',
    label: '#38bdf8',
    muted: '#64748b',
    accent: '#00f3ff',
    bg: '#08090e',
  });

  // Read CSS custom properties to recolor chart per active theme
  useEffect(() => {
    function readThemeColors() {
      const style = getComputedStyle(document.documentElement);
      setColors({
        grid: style.getPropertyValue('--border-color').trim() || '#1e293b',
        label: style.getPropertyValue('--accent-primary').trim() || '#38bdf8',
        muted: style.getPropertyValue('--text-muted').trim() || '#64748b',
        accent: style.getPropertyValue('--accent-primary').trim() || '#00f3ff',
        bg: style.getPropertyValue('--bg-main').trim() || '#08090e',
      });
    }

    readThemeColors();

    // Re-read on theme change (observed via attribute mutation on <html>)
    const observer = new MutationObserver(readThemeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const data = [
    { subject: 'Technical Depth', score: overallScores.technicalDepth },
    { subject: 'Communication', score: overallScores.communication },
    { subject: 'Problem Solving', score: overallScores.problemSolving },
    { subject: 'Confidence', score: overallScores.confidence },
  ];

  return (
    <div className="w-full h-72 py-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke={colors.grid} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: colors.label, fontFamily: 'JetBrains Mono, monospace' }} />
          <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: colors.muted }} axisLine={false} />
          <Radar
            dataKey="score"
            stroke={colors.accent}
            strokeWidth={2}
            fill={colors.accent}
            fillOpacity={0.3}
            dot={{ r: 4, fill: colors.accent, stroke: colors.bg, strokeWidth: 2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreRadarChart;
