import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/Toast';
import { InputField } from '../ui/InputField';
import { useLab } from '../../context/LabContext';
import { useLabTheme } from './useLabTheme';
import { usuarioService } from '../../services/api';

const emptyForm = { nome: '', sobrenome: '', email: '', senha: '', tipo_usuario: 'UC', ativo: 'Y' };
const PERMISSIONS = [
  { value: 'ADM', label: 'Admin' },
  { value: 'UE',  label: 'Usuário Empresa' },
  { value: 'UP',  label: 'Usuário Produtor' },
  { value: 'UC',  label: 'Usuário Comum' }
];

export function LabUsers({ t }) {
  const { isDark } = useLab();
  const C = useLabTheme();

  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load Users from API
  const fetchUsers = useCallback(async () => {
    try {
      const data = await usuarioService.getAll();
      setUsers(data);
    } catch (err) {
      toast.error('Erro ao buscar usuários.');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const validate = () => {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório.';
    if (!form.sobrenome.trim()) errs.sobrenome = 'Sobrenome é obrigatório.';
    if (!form.email.trim()) errs.email = 'Email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido.';
    
    if (!isEdit && !form.senha) {
      errs.senha = 'Senha é obrigatória para novos usuários.';
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      if (isEdit) {
        // Se a senha estiver em branco na edição, não enviar
        const payload = { ...form };
        if (!payload.senha) delete payload.senha;
        
        await usuarioService.update(form.id, payload);
        toast.success('Usuário atualizado!');
      } else {
        await usuarioService.create(form);
        toast.success('Usuário criado!');
      }
      setModal(false); 
      setForm(emptyForm); 
      setErrors({});
      fetchUsers();
    } catch (err) {
      toast.error(err.detail || 'Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await usuarioService.delete(id);
      setConfirmDelete(null);
      toast.success('Usuário removido com sucesso.');
      fetchUsers();
    } catch (err) {
      toast.error('Erro ao remover usuário.');
    }
  };

  const openNew = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setErrors({});
    setModal(true);
  };

  const openEdit = (user) => {
    setForm({ ...user, senha: '' });
    setIsEdit(true);
    setErrors({});
    setModal(true);
  };

  return (
    <div style={{ maxWidth: '200rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#10b981" />
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, margin: 0 }}>Gerenciamento de Usuários</h3>
            <p style={{ fontSize: '0.75rem', color: C.textMuted, margin: 0 }}>{users.length} cadastrados</p>
          </div>
        </div>
        <button
          onClick={openNew}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bgAlt }}>
              {['Nome', 'Email', 'Tipo', 'Criado em', 'Ações'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 800, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={ev => ev.currentTarget.style.background = C.bgAlt}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {u.nome[0]}{u.sobrenome[0]}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>{u.nome} {u.sobrenome}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{u.email}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{u.tipo_usuario}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: C.textMuted }}>{new Date(u.criado_em).toLocaleDateString()}</td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(u)} style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'inline-flex', color: C.text }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(u.id)} style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: '0.5rem', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'inline-flex', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
                <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: C.textMuted, fontSize: '0.875rem' }}>Nenhum usuário encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <InputField
                label="Nome *" placeholder="Ex. Rafael"
                value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} error={errors.nome}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Sobrenome *" placeholder="Ex. Matos"
                value={form.sobrenome} onChange={(e) => setForm({...form, sobrenome: e.target.value})} error={errors.sobrenome}
              />
            </div>
          </div>
          <InputField
            label="Email *" type="email" placeholder="Ex. usuario@gemini.com"
            value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} error={errors.email}
          />
          <InputField
            label={isEdit ? "Nova Senha (opcional)" : "Senha *"} type="password" placeholder="******"
            value={form.senha} onChange={(e) => setForm({...form, senha: e.target.value})} error={errors.senha}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>Tipo de Usuário *</label>
            <select
              value={form.tipo_usuario}
              onChange={(e) => setForm({...form, tipo_usuario: e.target.value})}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', background: C.inputBg, color: C.text, boxSizing: 'border-box' }}
            >
              {PERMISSIONS.map(p => (
                <option key={p.value} value={p.value} style={{ background: C.inputBg, color: C.text }}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
            <button onClick={handleSave} disabled={loading}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: loading ? '#a7f3d0' : '#10b981', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão" width="24rem">
        <p style={{ fontSize: '0.875rem', color: C.textMuted, marginBottom: '1.25rem' }}>Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>Cancelar</button>
          <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Remover</button>
        </div>
      </Modal>
    </div>
  );
}
