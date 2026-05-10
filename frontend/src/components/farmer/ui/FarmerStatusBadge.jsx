import React from 'react';

const STATUS_CONFIG = {
  concluido: { bg: '#dcfce7', color: '#166534', darkBg: '#052c16', darkColor: '#4ade80' },
  processando: { bg: '#fef9c3', color: '#854d0e', darkBg: '#422006', darkColor: '#facc15' },
  alerta: { bg: '#fee2e2', color: '#991b1b', darkBg: '#450a0a', darkColor: '#f87171' },
  pendente: { bg: '#f1f5f9', color: '#475569', darkBg: '#1e293b', darkColor: '#94a3b8' },
};

/**
 * FarmerStatusBadge
 * Renders a pill badge for report status.
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
