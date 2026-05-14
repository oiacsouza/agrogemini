import React, { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Mail, Hash } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/Toast';
import { useLab } from '../../context/LabContext';
import { useLabTheme } from './useLabTheme';
import { laboratorioService } from '../../services/api';

const emptyForm = { name: '', city: '', state: '', email: '', cnpj: '', manager: '' };

export function LabBranches({ t }) {
  const { isDark } = useLab();
  const C = useLabTheme();
  const b = t.portal.branches;

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      try {
        const data = await laboratorioService.getMyLabs();
        if (Array.isArray(data)) {
          setBranches(data.map(l => ({
            id: l.id,
            name: l.nome,
            email: l.email,
            cnpj: l.cnpj,
            city: l.cidade_endereco || 'Sede',
            state: 'GO',
            employees: 0,
            samples: 0,
            status: l.ativo === 'Y' ? 'ativa' : 'inativa'
          })));
        }
      } catch (err) {
        console.error('Error loading branches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBranches();
  }, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setModal(true); };
  const openEdit = (br) => { 
    setEditTarget(br.id); 
    setForm({ 
      name: br.name, 
      city: br.city, 
      state: br.state, 
      email: br.email || '', 
      cnpj: br.cnpj || '', 
      manager: br.manager || '' 
    }); 
    setModal(true); 
  };

  const handleSave = async () => {
    const cnpjDigits = form.cnpj.replace(/\D/g, '');
    if (!form.name.trim() || !form.email.trim() || !form.cnpj.trim()) { 
      toast.error('Nome, Email e CNPJ são obrigatórios.'); 
      return; 
    }
    if (cnpjDigits.length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos.');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        nome: form.name,
        email: form.email,
        cnpj: cnpjDigits,
        ativo: 'Y'
      };

      if (editTarget) {
        const updated = await laboratorioService.update(editTarget, payload);
        setBranches(prev => prev.map(br => br.id === editTarget ? { 
          ...br, 
          name: updated.nome, 
          email: updated.email, 
          cnpj: updated.cnpj,
          status: updated.ativo === 'Y' ? 'ativa' : 'inativa'
        } : br));
        toast.success(`${b.title} atualizada!`);
      } else {
        const newLab = await laboratorioService.create(payload);
        
        setBranches(prev => [...prev, { 
          id: newLab.id, 
          name: newLab.nome, 
          email: newLab.email,
          cnpj: newLab.cnpj,
          city: form.city || 'Sede', 
          state: form.state || 'GO', 
          employees: 0, 
          samples: 0, 
          status: newLab.ativo === 'Y' ? 'ativa' : 'inativa'
        }]);
        toast.success(`${b.title} cadastrada!`);
      }
      setModal(false);
    } catch (err) {
      console.error('Save error', err);
      toast.error(err.detail || 'Erro ao salvar os dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await laboratorioService.delete(id);
      setBranches(prev => prev.filter(br => br.id !== id));
      toast.success(`${b.title} removida.`);
    } catch (err) {
      console.error('Delete error', err);
      toast.error(err.detail || 'Erro ao remover. Verifique se existem dependências ativas.');
    } finally {
      setConfirmDelete(null); 
    }
  };

  const inputStyle = { width: '100%', border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '200rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>{b.title}</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>{b.subtitle}</p>
          </div>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={16} /> {b.newBranch}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: C.textMuted }}>Carregando unidades...</div>
        ) : (
          branches.map(br => (
            <div key={br.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '3rem', height: '3rem', background: C.iconBg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={22} color="#10b981" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: C.text }}>{br.name}</span>
                  <Badge type={br.status} t={t} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.textMuted }}><MapPin size={13} />{br.city}, {br.state}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.textMuted }}><Mail size={13} />{br.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.textMuted }}><Hash size={13} />{br.cnpj}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => openEdit(br)} style={{ background: C.btnBg, border: `1px solid ${C.btnBorder}`, borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: C.textMuted }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => setConfirmDelete(br.id)} style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: '#ef4444' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
        {!loading && branches.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: C.textMuted }}>{b.empty}</div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editTarget ? b.editBranch : b.newBranch}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{b.fieldName} *</label>
            <input value={form.name} placeholder="Ex. Filial Campinas" onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>Email *</label>
              <input value={form.email} type="email" placeholder="Ex. filial@lab.com" onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>CNPJ *</label>
              <input value={form.cnpj} placeholder="Ex. 00.000.000/0001-00" onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{b.fieldCity} *</label>
              <input value={form.city} placeholder="Ex. Campinas" onChange={e => setForm(p => ({ ...p, city: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{b.fieldState}</label>
              <input value={form.state} placeholder="Ex. SP" onChange={e => setForm(p => ({ ...p, state: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setModal(false)} disabled={saving} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>{b.cancel}</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: saving ? '#a7f3d0' : '#10b981', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>{editTarget ? b.save : b.register}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={b.confirmDelete} width="24rem">
        <p style={{ fontSize: '0.875rem', color: C.textMuted, marginBottom: '1.25rem' }}>{b.confirmDeleteMsg}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>{b.cancel}</button>
          <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>{b.remove}</button>
        </div>
      </Modal>
    </div>
  );
}
