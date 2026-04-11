import React, { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/Toast';
import { useLab } from '../../context/LabContext';
import { mockEmployees } from '../../mockData';

const emptyForm = { name: '', role: '', email: '', permission: 'tecnico' };
const PERMISSIONS = ['admin', 'tecnico', 'viewer'];

export function LabEmployees() {
  const { isDark } = useLab();
  const C = isDark
    ? { surface: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', inputBg: '#1e293b', label: '#94a3b8', bgAlt: '#1e293b', dangerBg: '#2d1515', dangerBorder: '#7f1d1d' }
    : { surface: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', inputBg: '#ffffff',  label: '#374151', bgAlt: '#f8fafc',  dangerBg: '#fef2f2', dangerBorder: '#fecaca' };

  const [employees, setEmployees] = useState(mockEmployees);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Nome é obrigatório.';
    if (!form.email.trim()) e.email = 'Email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido.';
    else if (employees.some(emp => emp.email === form.email)) e.email = 'Email já cadastrado.';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const initials = form.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      setEmployees(prev => [...prev, { id: `e-${Date.now()}`, ...form, initials, status: 'ativo' }]);
      toast.success('Funcionário cadastrado!');
      setModal(false); setForm(emptyForm); setErrors({}); setLoading(false);
    }, 600);
  };

  const handleDelete = (id) => { setEmployees(prev => prev.filter(e => e.id !== id)); setConfirmDelete(null); toast.success('Funcionário removido.'); };

  const inputStyle = (hasErr) => ({ width: '100%', border: `1px solid ${hasErr ? '#f87171' : C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, boxSizing: 'border-box' });

  const Field = ({ label, fkey, type = 'text', placeholder }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{label}</label>
      <input type={type} value={form[fkey]} placeholder={placeholder}
        onChange={e => { setForm(p => ({ ...p, [fkey]: e.target.value })); setErrors(p => ({ ...p, [fkey]: undefined })); }}
        style={inputStyle(errors[fkey])} />
      {errors[fkey] && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors[fkey]}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: '60rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>Funcionários</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>{employees.length} funcionários cadastrados</p>
          </div>
        </div>
        <button onClick={() => { setForm(emptyForm); setErrors({}); setModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={16} /> Novo Funcionário
        </button>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
              {['FUNCIONÁRIO', 'CARGO', 'EMAIL', 'PERMISSÃO', 'STATUS', ''].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgAlt}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{emp.initials}</div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>{emp.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{emp.role}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{emp.email}</td>
                <td style={{ padding: '1rem 1.25rem' }}><Badge type={emp.permission} /></td>
                <td style={{ padding: '1rem 1.25rem' }}><Badge type={emp.status} /></td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button onClick={() => setConfirmDelete(emp.id)} style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: '0.5rem', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'inline-flex', color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Novo Funcionário">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Nome *" fkey="name" placeholder="Ex. Rafael Matos" />
          <Field label="Cargo" fkey="role" placeholder="Ex. Analista Sênior" />
          <Field label="Email *" fkey="email" type="email" placeholder="Ex. funcionario@lab.com" />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>Permissão</label>
            <select value={form.permission} onChange={e => setForm(p => ({ ...p, permission: e.target.value }))}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, boxSizing: 'border-box' }}>
              {PERMISSIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
            <button onClick={handleSave} disabled={loading}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: loading ? '#a7f3d0' : '#10b981', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar remoção" width="24rem">
        <p style={{ fontSize: '0.875rem', color: C.textMuted, marginBottom: '1.25rem' }}>Deseja remover este funcionário?</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
          <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Remover</button>
        </div>
      </Modal>
    </div>
  );
}
