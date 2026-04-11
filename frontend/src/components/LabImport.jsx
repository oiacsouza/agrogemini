import React, { useState } from 'react';
import { UploadCloud, Upload, UserPlus, ChevronDown } from 'lucide-react';
import { Modal } from './ui/Modal';
import { toast } from './ui/Toast';
import { mockClients } from '../mockData';
import { useLab } from '../context/LabContext';

const emptyClient = { name: '', email: '' };

export function LabImport({ t }) {
  const { isDark } = useLab();
  const C = isDark
    ? { surface: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', inputBg: '#1e293b', label: '#94a3b8', dropBg: 'rgba(16,185,129,0.07)' }
    : { surface: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', inputBg: '#f8fafc',  label: '#374151', dropBg: 'rgba(16,185,129,0.04)' };

  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Nome é obrigatório.';
    if (!form.email.trim()) e.email = 'Email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido.';
    else if (clients.some(c => c.email === form.email)) e.email = 'Este email já está cadastrado.';
    return e;
  };

  const handleRegister = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const initials = form.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const newClient = { id: `c-${Date.now()}`, ...form, phone: '', totalReports: 0, lastReport: '-', status: 'ativo', initials, reports: [] };
      setClients(prev => [...prev, newClient]);
      setSelectedClient(newClient.id);
      toast.success(`Cliente "${form.name}" cadastrado e selecionado!`);
      setShowModal(false); setForm(emptyClient); setErrors({}); setLoading(false);
    }, 600);
  };

  const inputStyle = (hasErr) => ({
    width: '100%', border: `1px solid ${hasErr ? '#f87171' : C.border}`, borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none',
    background: C.inputBg, color: C.text, boxSizing: 'border-box',
  });

  const Field = ({ label, fkey, type = 'text', placeholder }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{label}</label>
      <input type={type} value={form[fkey]} placeholder={placeholder}
        onChange={e => { setForm(p => ({ ...p, [fkey]: e.target.value })); setErrors(p => ({ ...p, [fkey]: undefined })); }}
        style={inputStyle(errors[fkey])}
      />
      {errors[fkey] && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors[fkey]}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: '48rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} color="#10b981" />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{t.portal.import.cardTitle}</h3>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Client selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.5rem' }}>Cliente</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                  style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: selectedClient ? C.text : C.textMuted, appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                  <option value="" style={{ color: '#94a3b8' }}>Selecionar cliente existente...</option>
                  {clients.map(c => <option key={c.id} value={c.id} style={{ color: '#0f172a' }}>{c.name} — {c.email}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
              </div>
              <button onClick={() => { setForm(emptyClient); setErrors({}); setShowModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: isDark ? '#0d2b1f' : '#f0fdf4', color: '#10b981', border: `1px solid ${isDark ? '#134e2e' : '#bbf7d0'}`, borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}>
                <UserPlus size={15} /> Cadastrar Cliente
              </button>
            </div>
          </div>

          {/* Drop Zone */}
          <div style={{ border: '2px dashed #10b981', borderRadius: '1.25rem', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: C.dropBg, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.11)'}
            onMouseLeave={e => e.currentTarget.style.background = C.dropBg}>
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(16,185,129,0.12)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UploadCloud size={32} color="#10b981" />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: C.text, margin: '0 0 0.375rem' }}>{t.portal.import.dragDrop}</h4>
            <p style={{ fontSize: '0.875rem', color: C.textMuted, margin: '0 0 1.25rem' }}>{t.portal.import.orClick}</p>
            <button style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 2rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', width: '12rem' }}>
              {t.portal.import.selectFiles}
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: C.textMuted, fontWeight: 500 }}>{t.portal.import.featuresFooter}</p>
          </div>
        </div>
      </div>

      {/* Register Client Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Cadastrar Novo Cliente" width="28rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Nome *" fkey="name" placeholder="Ex. João Silva" />
          <Field label="Email *" fkey="email" type="email" placeholder="Ex. joao@fazenda.com" />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
            <button onClick={handleRegister} disabled={loading}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: loading ? '#a7f3d0' : '#10b981', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
