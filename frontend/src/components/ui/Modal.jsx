import React from 'react';
import { X } from 'lucide-react';
import { useLab } from '../../context/LabContext';

export function Modal({ isOpen, onClose, title, children, width = '32rem' }) {
  const { isDark } = useLab();
  const C = isDark
    ? { bg: '#0f172a', border: '#1e293b', text: '#f1f5f9', textMuted: '#94a3b8', overlay: 'rgba(0,0,0,0.65)' }
    : { bg: '#ffffff',  border: '#e2e8f0', text: '#0f172a', textMuted: '#94a3b8', overlay: 'rgba(0,0,0,0.45)' };

  if (!isOpen) return null;

  const handleKey = (e) => { if (e.key === 'Escape') onClose(); };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.overlay, backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={handleKey}
    >
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '1rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', width, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', animation: 'modalIn 0.2s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '0.25rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}
