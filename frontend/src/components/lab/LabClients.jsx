import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, FileText, FlaskConical, Loader2, Plus, Search } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useLab } from '../../context/LabContext';
import { useLabTheme } from './useLabTheme';
import { laboratorioService } from '../../services/api';

function mapClientForUi(user) {
  const name = `${user.nome || ''} ${user.sobrenome || ''}`.trim() || user.email;
  const initials = `${user.nome?.[0] || ''}${user.sobrenome?.[0] || ''}`.toUpperCase()
    || name.slice(0, 2).toUpperCase();

  return {
    id: user.id,
    name,
    email: user.email,
    phone: user.telefone || 'Sem contato',
    totalReports: user.total_laudos || 0,
    lastReport: user.ultimo_laudo ? new Date(user.ultimo_laudo).toLocaleDateString('pt-BR') : '-',
    status: user.ativo === 'Y' ? 'ativo' : 'inativo',
    initials,
    reports: []
  };
}

export function LabClients({ onViewProfile, t }) {
  const { activeLab } = useLab();
  const C = useLabTheme();
  const c = t.portal.clients;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadClients() {
      if (!activeLab?.id) return;
      setLoading(true);
      try {
        const data = await laboratorioService.getClientes(activeLab.id);
        if (Array.isArray(data)) {
          setClients(data.map(mapClientForUi));
        }
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, [activeLab]);

  const resetCreateForm = () => {
    setClientName('');
    setClientEmail('');
    setCreateError('');
    setCreating(false);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setIsCreateOpen(false);
    resetCreateForm();
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreateError('');

    const fullName = clientName.trim();
    const email = clientEmail.trim();

    if (!activeLab?.id) {
      setCreateError('Selecione um laboratório antes de cadastrar um cliente.');
      return;
    }

    if (!fullName || !email) {
      setCreateError('Informe nome e email do cliente.');
      return;
    }

    const [nome, ...rest] = fullName.split(/\s+/);
    const sobrenome = rest.join(' ') || ' ';

    setCreating(true);
    try {
      const created = await laboratorioService.addCliente(activeLab.id, {
        nome,
        sobrenome,
        email,
      });
      const mapped = mapClientForUi(created);
      setClients(prev => {
        const withoutDuplicate = prev.filter(client => client.id !== mapped.id);
        return [mapped, ...withoutDuplicate];
      });
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (err) {
      setCreateError(err?.detail || 'Não foi possível cadastrar o cliente.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = clients.filter(cl => {
    const nameMatch = (cl.name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (cl.email || '').toLowerCase().includes(search.toLowerCase());
    const matchSearch = nameMatch || emailMatch;
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
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.55rem 0.8rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: '#10b981',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Plus size={16} /> Novo cliente
          </button>
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
            {loading ? (
               <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: C.textMuted, fontSize: '0.875rem' }}>Carregando clientes...</td></tr>
            ) : (
              filtered.map(cl => (
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
              ))
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: C.textMuted, fontSize: '0.875rem' }}>{c.empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} title="Novo cliente" width="28rem">
        <form onSubmit={handleCreateClient} style={{ display: 'grid', gap: '1rem' }}>
          {createError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}>
              <AlertCircle size={16} /> {createError}
            </div>
          )}

          <label style={{ display: 'grid', gap: '0.375rem', color: C.label, fontSize: '0.8125rem', fontWeight: 700 }}>
            Nome do cliente
            <input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Ex: João Silva"
              disabled={creating}
              style={{ border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.65rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.375rem', color: C.label, fontSize: '0.8125rem', fontWeight: 700 }}>
            Email
            <input
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="cliente@email.com"
              disabled={creating}
              style={{ border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.65rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={creating}
              style={{ border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.6rem 0.9rem', background: C.surface, color: C.textSecondary, cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 700, fontFamily: 'inherit' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              style={{ border: 'none', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', background: '#10b981', color: '#fff', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 700, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              {creating && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
              {creating ? 'Cadastrando...' : 'Cadastrar cliente'}
            </button>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </form>
      </Modal>
    </div>
  );
}
