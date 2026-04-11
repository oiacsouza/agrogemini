import React, { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Users, FlaskConical } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/Toast';
import { useLab } from '../../context/LabContext';
import { mockBranches } from '../../mockData';

const emptyForm = { name: '', city: '', state: '', manager: '' };

export function LabBranches() {
  const { isDark } = useLab();
  const C = isDark
    ? { surface: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', inputBg: '#1e293b', label: '#94a3b8', iconBg: '#0d2b1f', btnBorder: '#1e293b', btnBg: '#1e293b', dangerBg: '#2d1515', dangerBorder: '#7f1d1d' }
    : { surface: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', inputBg: '#ffffff',  label: '#374151', iconBg: '#f0fdf4', btnBorder: '#e2e8f0', btnBg: '#f8fafc', dangerBg: '#fef2f2', dangerBorder: '#fecaca' };

  const [branches, setBranches] = useState(mockBranches);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setModal(true); };
  const openEdit   = (b)  => { setEditTarget(b.id); setForm({ name: b.name, city: b.city, state: b.state, manager: b.manager }); setModal(true); };

  const handleSave = () => {
    if (!form.name.trim() || !form.city.trim()) { toast.error('Nome e cidade são obrigatórios.'); return; }
    if (editTarget) {
      setBranches(prev => prev.map(b => b.id === editTarget ? { ...b, ...form } : b));
      toast.success('Filial atualizada com sucesso!');
    } else {
      setBranches(prev => [...prev, { id: `filial-${Date.now()}`, ...form, employees: 0, samples: 0, status: 'ativa' }]);
      toast.success('Filial cadastrada com sucesso!');
    }
    setModal(false);
  };

  const handleDelete = (id) => { setBranches(prev => prev.filter(b => b.id !== id)); setConfirmDelete(null); toast.success('Filial removida.'); };

  const inputStyle = { width: '100%', border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '56rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>Filiais</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>Gerencie as filiais vinculadas à matriz</p>
          </div>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={16} /> Nova Filial
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {branches.map(b => (
          <div key={b.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '3rem', height: '3rem', background: C.iconBg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={22} color="#10b981" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: C.text }}>{b.name}</span>
                <Badge type={b.status} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.textMuted }}><MapPin size={13} />{b.city}, {b.state}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.textMuted }}><Users size={13} />{b.employees} funcionários</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: C.textMuted }}><FlaskConical size={13} />{b.samples} amostras</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button onClick={() => openEdit(b)} style={{ background: C.btnBg, border: `1px solid ${C.btnBorder}`, borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: C.textMuted }}>
                <Pencil size={15} />
              </button>
              <button onClick={() => setConfirmDelete(b.id)} style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', color: '#ef4444' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {branches.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: C.textMuted }}>Nenhuma filial cadastrada.</div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editTarget ? 'Editar Filial' : 'Nova Filial'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[['Nome da Filial *', 'name', 'Ex. Filial Campinas'], ['Cidade *', 'city', 'Ex. Campinas'], ['Estado', 'state', 'Ex. SP'], ['Responsável', 'manager', 'Ex. João Silva']].map(([label, key, ph]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>{label}</label>
              <input value={form[key]} placeholder={ph} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
            <button onClick={handleSave} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>{editTarget ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar remoção" width="24rem">
        <p style={{ fontSize: '0.875rem', color: C.textMuted, marginBottom: '1.25rem' }}>Tem certeza que deseja remover esta filial?</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
          <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Remover</button>
        </div>
      </Modal>
    </div>
  );
}
