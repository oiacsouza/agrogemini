import React from 'react';
import { useLab } from '../../context/LabContext';

const LIGHT = {
  admin:    { label: 'Admin',    bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  tecnico:  { label: 'Técnico',  bg: '#dbeafe', color: '#1d4ed8', dot: '#2563eb' },
  viewer:   { label: 'Viewer',   bg: '#f1f5f9', color: '#475569', dot: '#64748b' },
  ativo:    { label: 'Ativo',    bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  inativo:  { label: 'Inativo',  bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
  ativa:    { label: 'Ativa',    bg: '#dcfce7', color: '#15803d', dot: '#16a34a' },
  inativa:  { label: 'Inativa',  bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626' },
};

const DARK = {
  admin:    { label: 'Admin',    bg: '#14532d', color: '#4ade80', dot: '#16a34a' },
  tecnico:  { label: 'Técnico',  bg: '#1e3a5f', color: '#60a5fa', dot: '#2563eb' },
  viewer:   { label: 'Viewer',   bg: '#1e293b', color: '#94a3b8', dot: '#64748b' },
  ativo:    { label: 'Ativo',    bg: '#14532d', color: '#4ade80', dot: '#16a34a' },
  inativo:  { label: 'Inativo',  bg: '#4c1515', color: '#f87171', dot: '#dc2626' },
  ativa:    { label: 'Ativa',    bg: '#14532d', color: '#4ade80', dot: '#16a34a' },
  inativa:  { label: 'Inativa',  bg: '#4c1515', color: '#f87171', dot: '#dc2626' },
};

export function Badge({ type }) {
  let isDark = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useLab();
    isDark = ctx.isDark;
  } catch {
    // rendered outside LabProvider (shouldn't happen but safe fallback)
  }

  const MAP = isDark ? DARK : LIGHT;
  const cfg = MAP[type] ?? { label: type, bg: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569', dot: '#64748b' };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
      <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '9999px', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
