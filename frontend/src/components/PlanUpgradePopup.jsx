import React, { useEffect, useState } from 'react';
import { Crown, Zap, X } from 'lucide-react';
import { ConfettiBurst } from './ui/ConfettiBurst';

function getIsDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(getIsDarkMode);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return undefined;
    const observer = new MutationObserver(() => setIsDark(getIsDarkMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/**
 * PlanUpgradePopup — shown when a FREE user tries to access premium features.
 *
 * For producers: shown on first load, hides crop/correction sections on decline.
 * For labs: shown when hitting 5-sample limit.
 *
 * Props:
 *   isOpen     — boolean
 *   onClose    — called when user declines
 *   onUpgrade  — called when user clicks upgrade
 *   variant    — 'produtor' | 'laboratorio'
 */
export function PlanUpgradePopup({ isOpen, onClose, onUpgrade, variant = 'produtor' }) {
  const isDark = useIsDarkMode();
  const [isCelebrating, setIsCelebrating] = useState(false);

  if (!isOpen) return null;

  const isLab = variant === 'laboratorio';

  const title = isLab
    ? 'Limite de amostras atingido!'
    : 'Desbloqueie recursos premium!';

  const description = isLab
    ? 'Você atingiu o limite de 5 amostras do plano gratuito. Faça upgrade para continuar cadastrando amostras ilimitadas.'
    : 'Com o plano Premium, você tem acesso à Melhor Recomendação de Cultura e Plano de Correção completo para suas análises.';

  const features = isLab
    ? ['Amostras ilimitadas', 'Gestão de filiais', 'API de integração', 'Suporte 24/7']
    : ['Recomendação de cultura ideal', 'Plano de correção detalhado', 'Relatórios em PDF', 'Suporte prioritário'];
  const C = isDark
    ? {
      overlayBg: 'rgba(0,0,0,0.6)',
      panelBg: '#0f172a',
      panelBorder: 'rgba(16,185,129,0.3)',
      panelShadow: '0 24px 64px rgba(0,0,0,0.5)',
      closeBg: '#1e293b',
      closeText: '#64748b',
      title: '#f1f5f9',
      description: '#94a3b8',
      featureBg: '#1e293b',
      featureText: '#cbd5e1',
      secondaryBorder: '#334155',
      secondaryText: '#64748b',
    }
    : {
      overlayBg: 'rgba(15,23,42,0.45)',
      panelBg: '#ffffff',
      panelBorder: 'rgba(16,185,129,0.35)',
      panelShadow: '0 24px 64px rgba(2,6,23,0.18)',
      closeBg: '#f1f5f9',
      closeText: '#64748b',
      title: '#0f172a',
      description: '#64748b',
      featureBg: '#f8fafc',
      featureText: '#334155',
      secondaryBorder: '#cbd5e1',
      secondaryText: '#475569',
    };

  const handleUpgrade = () => {
    setIsCelebrating(true);
    window.setTimeout(() => {
      setIsCelebrating(false);
      onUpgrade?.();
    }, 480);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.overlayBg, backdropFilter: 'blur(6px)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{
        background: C.panelBg, borderRadius: 24,
        border: `1px solid ${C.panelBorder}`,
        width: '90vw', maxWidth: 440,
        padding: '36px 32px 28px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: C.panelShadow,
        animation: 'upgradePopIn 0.3s ease',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: C.closeBg, border: 'none', borderRadius: 8,
            padding: 6, cursor: 'pointer', color: C.closeText,
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(245,158,11,0.2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Crown size={32} color="#f59e0b" />
        </div>

        <h2 style={{
          color: C.title, fontSize: '1.35rem', fontWeight: 800,
          margin: '0 0 8px',
        }}>
          {title}
        </h2>

        <p style={{
          color: C.description, fontSize: '0.85rem', lineHeight: 1.6,
          margin: '0 0 24px', maxWidth: 340, marginInline: 'auto',
        }}>
          {description}
        </p>

        {/* Feature list */}
        <div style={{
          background: C.featureBg, borderRadius: 16, padding: '16px 20px',
          marginBottom: 24, textAlign: 'left',
        }}>
          {features.map((feat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: i < features.length - 1 ? 12 : 0,
              fontSize: '0.82rem', color: C.featureText,
            }}>
              <Zap size={14} color="#10b981" style={{ flexShrink: 0 }} />
              {feat}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={handleUpgrade}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', marginBottom: 10,
            boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Crown size={18} />
          Fazer Upgrade
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px',
            borderRadius: 14, border: `1px solid ${C.secondaryBorder}`,
            background: 'transparent', color: C.secondaryText,
            fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Agora não
        </button>
      </div>

      <ConfettiBurst active={isCelebrating} onDone={() => setIsCelebrating(false)} />

      <style>{`
        @keyframes upgradePopIn {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  );
}
