import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

let _addToast = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  _addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { success: <CheckCircle2 size={18} />, error: <XCircle size={18} />, info: <Info size={18} /> };
  const colors = { success: { bg: '#10b981', border: '#059669' }, error: { bg: '#ef4444', border: '#dc2626' }, info: { bg: '#3b82f6', border: '#2563eb' } };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(({ id, msg, type }) => (
        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: colors[type].bg, color: 'white', borderRadius: '0.625rem', padding: '0.75rem 1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minWidth: '16rem', maxWidth: '22rem', animation: 'toastIn 0.3s ease', border: `1px solid ${colors[type].border}` }}>
          {icons[type]}
          <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{msg}</span>
          <button onClick={() => setToasts(prev => prev.filter(t => t.id !== id))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

export const toast = {
  success: (msg) => _addToast?.(msg, 'success'),
  error:   (msg) => _addToast?.(msg, 'error'),
  info:    (msg) => _addToast?.(msg, 'info'),
};
