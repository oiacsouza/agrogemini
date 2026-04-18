import React from 'react';
import { useLab } from '../../context/LabContext';

const LIGHT = {
  admin:    { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  tecnico:  { bg: '#dbeafe', color: '#1d4ed8', dot: '#2563eb' },
  viewer:   { bg: '#f1f5f9', color: '#475569', dot: '#64748b' },
  ativo:    { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  inativo:  { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
  ativa:    { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  inativa:  { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
  concluido:{ bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  alerta:   { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  processando:{ bg: '#dbeafe', color: '#1d4ed8', dot: '#2563eb' },
};

const DARK = {
  admin:    { bg: '#14532d', color: '#4ade80', dot: '#16a34a' },
  tecnico:  { bg: '#1e3a5f', color: '#60a5fa', dot: '#2563eb' },
  viewer:   { bg: '#1e293b', color: '#94a3b8', dot: '#64748b' },
  ativo:    { bg: '#14532d', color: '#4ade80', dot: '#16a34a' },
  inativo:  { bg: '#4c1515', color: '#f87171', dot: '#dc2626' },
  ativa:    { bg: '#14532d', color: '#4ade80', dot: '#16a34a' },
  inativa:  { bg: '#4c1515', color: '#f87171', dot: '#dc2626' },
  concluido:{ bg: '#052e16', color: '#4ade80', dot: '#16a34a' },
  alerta:   { bg: '#422006', color: '#fbbf24', dot: '#eab308' },
  processando:{ bg: '#0c1a3a', color: '#60a5fa', dot: '#2563eb' },
};

export function Badge({ type, t }) {
  let isDark = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useLab();
    isDark = ctx.isDark;
  } catch {
    // rendered outside LabProvider — safe fallback
  }

  const MAP = isDark ? DARK : LIGHT;
  const cfg = MAP[type] ?? { bg: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569', dot: '#64748b' };

  // Resolve label: prefer translation, fallback to raw type string
  const label = t?.portal?.permissions?.[type] ?? t?.portal?.dashboard?.status?.[type] ?? type;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
      <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '9999px', background: cfg.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
