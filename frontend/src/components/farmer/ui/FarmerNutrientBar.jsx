import React from 'react';

/**
 * FarmerNutrientBar
 * Horizontal progress bar for a single nutrient.
 *
 * @param {{ name: string, current: number, max: number, color: string, isDark?: boolean }} props
 */
export function FarmerNutrientBar({ name, current, max, color, isDark = false }) {
  const pct = Math.min(100, Math.round((current / max) * 100));

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151' }}>
          {name}
        </span>
        <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500 }}>
          {current}/{max}
        </span>
      </div>
      <div style={{
        height:       8,
        background:   isDark ? '#334155' : '#f3f4f6',
        borderRadius: 99,
        overflow:     'hidden',
      }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          background: `linear-gradient(90deg, ${color}bb, ${color})`,
          borderRadius: 99,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}
