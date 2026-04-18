import React, { useState, useCallback } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/Toast';
import { InputField } from '../ui/InputField';
import { useLab } from '../../context/LabContext';
import { mockEmployees } from '../../mockData';
import { useLabTheme } from './useLabTheme';

const emptyForm = { name: '', role: '', email: '', permission: 'tecnico' };
const PERMISSIONS = ['admin', 'tecnico', 'viewer'];

export function LabEmployees({ t }) {
  const { isDark } = useLab();
  const e = t.portal.employees;
  const C = useLabTheme();

  const [employees, setEmployees] = useState(mockEmployees);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = `${e.fieldName} é obrigatório.`;
    if (!form.email.trim()) errs.email = `${e.fieldEmail} é obrigatório.`;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido.';
    else if (employees.some(emp => emp.email === form.email)) errs.email = 'Email já cadastrado.';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const initials = form.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      setEmployees(prev => [...prev, { id: `e-${Date.now()}`, ...form, initials, status: 'ativo' }]);
      toast.success(`${e.title} cadastrado!`);
      setModal(false); setForm(emptyForm); setErrors({}); setLoading(false);
    }, 600);
  };

  const handleDelete = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setConfirmDelete(null);
    toast.success(`${e.title} removido.`);
  };

  // Stable onChange handlers — one per field
  const handleNameChange = useCallback((ev) => {
    const v = ev.target.value;
    setForm(p => ({ ...p, name: v }));
    setErrors(p => ({ ...p, name: undefined }));
  }, []);

  const handleRoleChange = useCallback((ev) => {
    const v = ev.target.value;
    setForm(p => ({ ...p, role: v }));
  }, []);

  const handleEmailChange = useCallback((ev) => {
    const v = ev.target.value;
    setForm(p => ({ ...p, email: v }));
    setErrors(p => ({ ...p, email: undefined }));
  }, []);

  const headers = [e.headers.name, e.headers.role, e.headers.email, e.headers.permission, e.headers.status, ''];

  return (
    <div style={{ maxWidth: '200rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>{e.title}</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>{employees.length} {e.registered}</p>
          </div>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErrors({}); setModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <Plus size={16} /> {e.newEmployee}
        </button>
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
            {employees.map(emp => (
              <tr key={emp.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={ev => ev.currentTarget.style.background = C.bgAlt}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{emp.initials}</div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>{emp.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{emp.role}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{emp.email}</td>
                <td style={{ padding: '1rem 1.25rem' }}><Badge type={emp.permission} t={t} /></td>
                <td style={{ padding: '1rem 1.25rem' }}><Badge type={emp.status} t={t} /></td>
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={e.newEmployee}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputField
            label={`${e.fieldName} *`} placeholder="Ex. Rafael Matos"
            value={form.name} onChange={handleNameChange} error={errors.name}
          />
          <InputField
            label={e.fieldRole} placeholder="Ex. Analista Sênior"
            value={form.role} onChange={handleRoleChange} error={errors.role}
          />
          <InputField
            label={`${e.fieldEmail} *`} type="email" placeholder="Ex. funcionario@lab.com"
            value={form.email} onChange={handleEmailChange} error={errors.email}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{e.fieldPermission}</label>
            <select
              value={form.permission}
              onChange={ev => setForm(p => ({ ...p, permission: ev.target.value }))}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, boxSizing: 'border-box' }}
            >
              {PERMISSIONS.map(p => (
                <option key={p} value={p} style={{ background: C.inputBg, color: C.text }}>
                  {t.portal.permissions[p] ?? p}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>{e.cancel}</button>
            <button onClick={handleSave} disabled={loading}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: loading ? '#a7f3d0' : '#10b981', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? e.registering : e.register}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={e.confirmDelete} width="24rem">
        <p style={{ fontSize: '0.875rem', color: C.textMuted, marginBottom: '1.25rem' }}>{e.confirmDeleteMsg}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>{e.cancel}</button>
          <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>{e.remove}</button>
        </div>
      </Modal>
    </div>
  );
}
