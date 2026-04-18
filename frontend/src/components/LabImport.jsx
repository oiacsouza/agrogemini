import React, { useState, useCallback } from 'react';
import { UploadCloud, Upload, UserPlus, ChevronDown } from 'lucide-react';
import { Modal } from './ui/Modal';
import { toast } from './ui/Toast';
import { mockClients } from '../mockData';
import { InputField } from './ui/InputField';
import { useLab } from '../context/LabContext';
import { useLabTheme } from './lab/useLabTheme';

const emptyClient = { name: '', email: '' };

export function LabImport({ t }) {
  const { isDark } = useLab();
  const im = t.portal.import;
  const C = useLabTheme();

  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = `${im.fieldName} é obrigatório.`;
    if (!form.email.trim()) e.email = `${im.fieldEmail} é obrigatório.`;
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
      toast.success(`${im.fieldName} "${form.name}" cadastrado e selecionado!`);
      setShowModal(false); setForm(emptyClient); setErrors({}); setLoading(false);
    }, 600);
  };

  // Stable onChange handlers to avoid closure issues
  const handleNameChange = useCallback((e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, name: v }));
    setErrors(p => ({ ...p, name: undefined }));
  }, []);

  const handleEmailChange = useCallback((e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, email: v }));
    setErrors(p => ({ ...p, email: undefined }));
  }, []);

  return (
    <div style={{ maxWidth: '48rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} color="#10b981" />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{im.cardTitle}</h3>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Client selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.5rem' }}>{im.clientLabel}</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                  style={{
                    width: '100%',
                    border: `1px solid ${C.border}`,
                    borderRadius: '0.5rem',
                    padding: '0.5rem 2rem 0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    background: C.inputBg,
                    color: selectedClient ? C.text : C.textMuted,
                    appearance: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="" style={{ background: C.optionBg, color: C.textMuted }}>{im.clientPlaceholder}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} style={{ background: C.optionBg, color: C.text }}>
                      {c.name} — {c.email}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
              </div>
              <button
                onClick={() => { setForm(emptyClient); setErrors({}); setShowModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: isDark ? '#0d2b1f' : '#f0fdf4', color: '#10b981', border: `1px solid ${isDark ? '#134e2e' : '#bbf7d0'}`, borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}
              >
                <UserPlus size={15} /> {im.registerClient}
              </button>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            style={{ border: '2px dashed #10b981', borderRadius: '1.25rem', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: C.dropBg, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.11)'}
            onMouseLeave={e => e.currentTarget.style.background = C.dropBg}
          >
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(16,185,129,0.12)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UploadCloud size={32} color="#10b981" />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: C.text, margin: '0 0 0.375rem' }}>{im.dragDrop}</h4>
            <p style={{ fontSize: '0.875rem', color: C.textMuted, margin: '0 0 1.25rem' }}>{im.orClick}</p>
            <button style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 2rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', width: '12rem' }}>
              {im.selectFiles}
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: C.textMuted, fontWeight: 500 }}>{im.featuresFooter}</p>
          </div>
        </div>
      </div>

      {/* Register Client Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={im.registerClientTitle} width="28rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputField
            label={`${im.fieldName} *`}
            placeholder="Ex. João Silva"
            value={form.name}
            onChange={handleNameChange}
            error={errors.name}
          />
          <InputField
            label={`${im.fieldEmail} *`}
            type="email"
            placeholder="Ex. joao@fazenda.com"
            value={form.email}
            onChange={handleEmailChange}
            error={errors.email}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>{im.cancel}</button>
            <button onClick={handleRegister} disabled={loading}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: loading ? '#a7f3d0' : '#10b981', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? im.registering : im.register}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
