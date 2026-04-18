import React, { useState } from 'react';
import { FlaskConical, Search, ChevronRight, FileText } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useLab } from '../../context/LabContext';
import { mockClients } from '../../mockData';
import { useLabTheme } from './useLabTheme';

export function LabClients({ onViewProfile, t }) {
  const { isDark } = useLab();
  const C = useLabTheme();
  const c = t.portal.clients;

  const [clients] = useState(mockClients);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filtered = clients.filter(cl => {
    const matchSearch = cl.name.toLowerCase().includes(search.toLowerCase()) || cl.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || cl.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const headers = [c.headers.client, c.headers.email, c.headers.reports, c.headers.lastReport, c.headers.status, ''];

  return (
    <div style={{ maxWidth: '200rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>{c.title}</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>{clients.length} {c.registered}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={c.searchPlaceholder}
              style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, width: '13rem', boxSizing: 'border-box' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.selectBg, color: C.text, cursor: 'pointer' }}>
            <option value="todos">{c.filterAll}</option>
            <option value="ativo">{c.filterActive}</option>
            <option value="inativo">{c.filterInactive}</option>
          </select>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
              {headers.map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(cl => (
              <tr key={cl.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{cl.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>{cl.name}</div>
                      <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{cl.phone}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{cl.email}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600, color: C.text }}>
                    <FileText size={14} color="#10b981" />{cl.totalReports}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{cl.lastReport}</td>
                <td style={{ padding: '1rem 1.25rem' }}><Badge type={cl.status} t={t} /></td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button onClick={() => onViewProfile(cl)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600, fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {c.viewProfile} <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: C.textMuted, fontSize: '0.875rem' }}>{c.empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
