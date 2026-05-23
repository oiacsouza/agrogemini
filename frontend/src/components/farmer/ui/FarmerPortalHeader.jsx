import React from 'react';
import { Sun, Moon, Globe, Leaf, LogOut } from 'lucide-react';
import { useFarmerTheme } from '../hooks/useFarmerTheme';

export function FarmerPortalHeader({ lang, setLang, isDark, toggleDark, onLogout }) {
  const tk = useFarmerTheme(isDark);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: tk.headerBg,
      borderBottom: `1px solid ${tk.cardBorder}`,
      boxShadow: tk.headerShadow,
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div
        onClick={onLogout}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'opacity 0.2s ease' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        title="Voltar para a página inicial"
      >
        <div style={{ width: 28, height: 28, background: tk.green, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf size={16} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: tk.textPrimary, userSelect: 'none' }}>
          AgroGemini
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleDark}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: tk.textSecondary, display: 'flex', alignItems: 'center', padding: 4 }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div style={{ position: 'relative' }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              appearance: 'none',
              background: tk.inputBg,
              border: `1px solid ${tk.inputBorder}`,
              color: tk.textPrimary,
              padding: '4px 24px 4px 8px',
              borderRadius: 6,
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <Globe size={12} color={tk.textSecondary} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        <button
          onClick={onLogout}
          title="Sair"
          style={{ background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, cursor: 'pointer', color: tk.textSecondary, display: 'flex', alignItems: 'center', padding: '6px', borderRadius: 6, marginLeft: 6 }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
