import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { useLab } from '../context/LabContext';

export function LabSamples({ t, onViewDetails }) {
  const { activeSamples, isDark } = useLab();
  const C = isDark
    ? { surface: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', bgAlt: '#1e293b', barBg: '#1e293b' }
    : { surface: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', bgAlt: '#f8fafc',  barBg: '#f1f5f9' };

  const getStatusStyle = (s) => ({
    concluido:   { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
    alerta:      { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
    processando: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  }[s] ?? { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' });

  const statusIcons = {
    concluido:   <CheckCircle2 size={11} />,
    alerta:      <AlertCircle  size={11} />,
    processando: <TrendingUp   size={11} />,
  };

  const statusLabels = {
    concluido:   t.portal.dashboard.status.concluido,
    alerta:      t.portal.dashboard.status.alerta,
    processando: t.portal.dashboard.status.processando,
  };

  const HealthBar = ({ value }) => {
    const color = value > 80 ? '#10b981' : value > 70 ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '6rem', height: '0.4rem', background: C.barBg, borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '9999px' }} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.text }}>{value}%</span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '64rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={18} color="#10b981" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: C.text }}>Amostras Analisadas</div>
            <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{t.portal.dashboard.recentSamplesText}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
                {[t.portal.dashboard.headers.date, t.portal.dashboard.headers.producer,
                  t.portal.dashboard.headers.field, t.portal.dashboard.headers.status,
                  t.portal.dashboard.headers.health, ''].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSamples.map(s => {
                const sc = getStatusStyle(s.status);
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: C.textMuted, fontWeight: 500 }}>{s.date}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>{s.producer}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{s.field}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: sc.bg, color: sc.color, fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '9999px', border: `1px solid ${sc.border}` }}>
                        {statusIcons[s.status]}{statusLabels[s.status]}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><HealthBar value={s.health} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <button onClick={onViewDetails} style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {t.portal.dashboard.viewDetails}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
