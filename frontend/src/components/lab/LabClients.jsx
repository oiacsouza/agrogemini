import React, { useState } from 'react';
import { FlaskConical, Search, ChevronRight, FileText } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useLab } from '../../context/LabContext';
import { mockClients } from '../../mockData';

export function LabClients({ onViewProfile }) {
  const { isDark } = useLab();
  const C = isDark
    ? { surface: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', inputBg: '#1e293b', bgAlt: '#1e293b', selectBg: '#1e293b' }
    : { surface: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', inputBg: '#ffffff',  bgAlt: '#f8fafc',  selectBg: '#ffffff'  };

  const [clients]      = useState(mockClients);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ maxWidth: '64rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>Clientes</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>{clients.length} clientes cadastrados</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
              style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, width: '13rem', boxSizing: 'border-box' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.selectBg, color: C.text, cursor: 'pointer' }}>
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
              {['CLIENTE', 'EMAIL', 'LAUDOS', 'ÚLTIMO LAUDO', 'STATUS', ''].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{c.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{c.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{c.email}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600, color: C.text }}>
                    <FileText size={14} color="#10b981" />{c.totalReports}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{c.lastReport}</td>
                <td style={{ padding: '1rem 1.25rem' }}><Badge type={c.status} /></td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button onClick={() => onViewProfile(c)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600, fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Ver Perfil <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: C.textMuted, fontSize: '0.875rem' }}>Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
