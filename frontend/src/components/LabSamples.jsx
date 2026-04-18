import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useLab } from '../context/LabContext';
import { useLabTheme } from './lab/useLabTheme';
import { Badge } from './ui/Badge';

export function LabSamples({ t, onViewDetails }) {
  const { activeSamples, isDark } = useLab();
  const C = useLabTheme();

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
    <div style={{ maxWidth: '200rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={18} color="#10b981" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: C.text }}>{t.portal.dashboard.recentSamples}</div>
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
                      <Badge type={s.status} t={t} />
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
