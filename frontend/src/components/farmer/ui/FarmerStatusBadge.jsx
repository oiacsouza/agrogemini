import React from 'react';
import { STATUS_CONFIG } from '../data/farmerMockData';

/**
 * FarmerStatusBadge
 * Renders a pill badge for report status.
 *
 * @param {{ status: string, label: string, isDark?: boolean }} props
 *   - status  → key in STATUS_CONFIG
 *   - label   → translated text (from t.farmerPortal.status[status])
 *   - isDark  → use dark-mode palette variant
 */
export function FarmerStatusBadge({ status, label, isDark = false }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pendente;
  const bg = isDark ? cfg.darkBg : cfg.bg;
  const color = isDark ? cfg.darkColor : cfg.color;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: bg, color: color, fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
      <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '9999px', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}
