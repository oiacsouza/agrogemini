import React from 'react';
import { ArrowLeft, Mail, Phone, FileText, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useLab } from '../../context/LabContext';

export function LabClientProfile({ client, onBack, onViewDetail }) {
  const { isDark } = useLab();
  const C = isDark
    ? { surface: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', bgAlt: '#1e293b', barBg: '#1e293b' }
    : { surface: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', bgAlt: '#f8fafc',  barBg: '#f1f5f9' };

  const getStatusStyle = (s) => ({
    concluido:   { icon: <CheckCircle2 size={12}/>, cls: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' } },
    alerta:      { icon: <AlertCircle   size={12}/>, cls: { bg: '#fef9c3', color: '#a16207', border: '#fde68a' } },
    processando: { icon: <TrendingUp    size={12}/>, cls: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' } },
  }[s] ?? { icon: null, cls: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' } });

  const statusLabels = { concluido: 'Concluído', alerta: 'Alerta', processando: 'Processando' };

  const HealthBar = ({ value }) => {
    const color = value > 80 ? '#10b981' : value > 70 ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '6rem', height: '0.5rem', background: C.barBg, borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '9999px' }} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.text, minWidth: '2rem' }}>{value}%</span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '56rem' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: '#10b981', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
        <ArrowLeft size={16} /> Voltar para Clientes
      </button>

      {/* Profile Card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>{client.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: C.text, margin: 0 }}>{client.name}</h2>
            <Badge type={client.status} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: C.textMuted }}><Mail size={14} />{client.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: C.textMuted }}><Phone size={14} />{client.phone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: C.textMuted }}><FileText size={14} />{client.totalReports} laudos</span>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>Histórico de Laudos</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>Todos os laudos associados a este cliente</p>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
              {['DATA', 'TALHÃO', 'STATUS', 'SAÚDE DO SOLO', ''].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {client.reports.map(r => {
              const { icon, cls } = getStatusStyle(r.status);
              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: C.textMuted, fontWeight: 500 }}>{r.date}</td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: C.text, fontWeight: 600 }}>{r.field}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: cls.bg, color: cls.color, fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', border: `1px solid ${cls.border}` }}>
                      {icon}{statusLabels[r.status]}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><HealthBar value={r.health} /></td>
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                    <button onClick={() => onViewDetail(r)} style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Ver Detalhe
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
