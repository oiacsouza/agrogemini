import React, { useEffect, useState } from 'react';
import { X, Crown, Leaf, FlaskConical, Sparkles, Check, Zap } from 'lucide-react';
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
 * PlanModal — shown when user clicks "Explorar a plataforma" on the landing page.
 * Displays 4 plan options: Produtor Free, Produtor Premium, Lab Free, Lab Premium.
 */
export function PlanModal({
  isOpen,
  onClose,
  onSelectPlan,
  t: _t,
  initialTab = 'produtor',
  contextTitle = '',
  contextMessage = '',
}) {
  const isDark = useIsDarkMode();
  const [selectedTabOverride, setSelectedTabOverride] = useState(null);
  const [isCelebratingUpgrade, setIsCelebratingUpgrade] = useState(false);
  const selectedTab = selectedTabOverride || initialTab;
  const C = isDark
    ? {
      overlayBg: 'rgba(0,0,0,0.6)',
      panelBg: '#0f172a',
      panelBorder: '#1e293b',
      panelShadow: '0 32px 80px rgba(0,0,0,0.5)',
      title: '#f1f5f9',
      subtitle: '#64748b',
      closeBg: '#1e293b',
      closeText: '#94a3b8',
      contextTitle: '#f8fafc',
      contextText: '#cbd5e1',
      tabTrackBg: '#1e293b',
      tabInactiveText: '#94a3b8',
      cardBg: '#1e293b',
      cardBorder: '#334155',
      cardTitle: '#f1f5f9',
      price: '#f1f5f9',
      priceNote: '#64748b',
      featureText: '#cbd5e1',
      limitedText: '#475569',
      limitedIcon: '#475569',
      neutralButtonBg: '#334155',
      neutralButtonText: '#ffffff',
      upgradeInfoText: '#d1fae5',
      upgradeInfoBg: 'rgba(16,185,129,0.1)',
    }
    : {
      overlayBg: 'rgba(15,23,42,0.45)',
      panelBg: '#ffffff',
      panelBorder: '#e2e8f0',
      panelShadow: '0 24px 64px rgba(2,6,23,0.16)',
      title: '#0f172a',
      subtitle: '#64748b',
      closeBg: '#f1f5f9',
      closeText: '#64748b',
      contextTitle: '#1e293b',
      contextText: '#475569',
      tabTrackBg: '#f1f5f9',
      tabInactiveText: '#64748b',
      cardBg: '#ffffff',
      cardBorder: '#e2e8f0',
      cardTitle: '#0f172a',
      price: '#0f172a',
      priceNote: '#64748b',
      featureText: '#334155',
      limitedText: '#94a3b8',
      limitedIcon: '#94a3b8',
      neutralButtonBg: '#e2e8f0',
      neutralButtonText: '#0f172a',
      upgradeInfoText: '#065f46',
      upgradeInfoBg: 'rgba(16,185,129,0.12)',
    };

  const handleClose = () => {
    setSelectedTabOverride(null);
    setIsCelebratingUpgrade(false);
    onClose?.();
  };

  const handleSelectPlan = (planId) => {
    const finalize = () => {
      setSelectedTabOverride(null);
      onSelectPlan?.(planId);
    };

    if (String(planId).includes('premium')) {
      setIsCelebratingUpgrade(true);
      window.setTimeout(() => {
        setIsCelebratingUpgrade(false);
        finalize();
      }, 520);
      return;
    }

    finalize();
  };

  if (!isOpen) return null;

  const plans = {
    produtor: [
      {
        id: 'produtor_free',
        name: 'Produtor Free',
        price: 'Grátis',
        priceNote: 'para sempre',
        icon: <Leaf size={24} />,
        color: '#10b981',
        features: [
          'Acesso ao portal do produtor',
          'Visualização de amostras',
          'Resultados básicos de análise',
          'Dados de pH e nutrientes',
        ],
        limited: [
          'Sem recomendação de cultura',
          'Sem plano de correção',
        ],
        cta: 'Começar Grátis',
        popular: false,
      },
      {
        id: 'produtor_premium',
        name: 'Produtor Premium',
        price: 'R$ 49',
        priceNote: '/mês',
        icon: <Crown size={24} />,
        color: '#f59e0b',
        features: [
          'Tudo do plano Free',
          'Melhor Recomendação de Cultura',
          'Plano de Correção completo',
          'Relatórios avançados em PDF',
          'Suporte prioritário',
          'Histórico completo de análises',
        ],
        limited: [],
        cta: 'Assinar Premium',
        popular: true,
      },
    ],
    laboratorio: [
      {
        id: 'lab_free',
        name: 'Laboratório Free',
        price: 'Grátis',
        priceNote: 'até 5 uploads',
        icon: <FlaskConical size={24} />,
        color: '#6366f1',
        features: [
          'Envio de até 5 uploads de amostra',
          'Dashboard básico',
          'Importação de dados',
          'Geração de laudos',
        ],
        limited: [
          'Sem gestão de filiais',
          'Limite de 5 uploads',
        ],
        cta: 'Começar Grátis',
        popular: false,
      },
      {
        id: 'lab_premium',
        name: 'Laboratório Premium',
        price: 'R$ 1.299',
        priceNote: '/mês',
        icon: <Sparkles size={24} />,
        color: '#8b5cf6',
        features: [
          'Amostras ilimitadas',
          'Dashboard avançado com tendências',
          'Gestão de filiais',
          'API de integração',
          'Gestão de funcionários',
          'Suporte dedicado 24/7',
          'Relatórios customizados',
        ],
        limited: [],
        cta: 'Assinar Premium',
        popular: true,
      },
    ],
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.overlayBg, backdropFilter: 'blur(8px)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{
        background: C.panelBg, borderRadius: 24,
        border: `1px solid ${C.panelBorder}`,
        width: '90vw', maxWidth: 780,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: C.panelShadow,
        animation: 'planModalIn 0.3s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 32px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ color: C.title, fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>
              Escolha seu plano
            </h2>
            <p style={{ color: C.subtitle, fontSize: '0.875rem', margin: 0 }}>
              Selecione o perfil e plano ideal para você
            </p>
          </div>
          <button onClick={handleClose} style={{
            background: C.closeBg, border: 'none', borderRadius: 10,
            padding: 8, cursor: 'pointer', display: 'flex',
            color: C.closeText,
          }}>
            <X size={18} />
          </button>
        </div>

        {contextMessage && (
          <div style={{
            margin: '18px 32px 0',
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid rgba(245,158,11,0.35)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(16,185,129,0.08))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={15} color="#f59e0b" />
              <span style={{ color: C.contextTitle, fontWeight: 700, fontSize: '0.85rem' }}>
                {contextTitle || 'Limite do plano gratuito atingido'}
              </span>
            </div>
            <p style={{ color: C.contextText, fontSize: '0.8rem', margin: 0, lineHeight: 1.45 }}>
              {contextMessage}
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 4,
          margin: '24px 32px 0',
          background: C.tabTrackBg, borderRadius: 12, padding: 4,
        }}>
          {[
            { id: 'produtor', label: '🌱 Produtor', icon: Leaf },
            { id: 'laboratorio', label: '🧪 Laboratório', icon: FlaskConical },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTabOverride(tab.id)}
              style={{
                flex: 1, padding: '10px 16px',
                borderRadius: 10, border: 'none',
                background: selectedTab === tab.id ? '#10b981' : 'transparent',
                color: selectedTab === tab.id ? '#fff' : C.tabInactiveText,
                fontWeight: 700, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20, padding: '24px 32px 32px',
        }}>
          {plans[selectedTab].map(plan => {
            const isUpgradeFocus = contextMessage && selectedTab === 'laboratorio' && plan.id === 'lab_premium';
            const isPopular = plan.popular || isUpgradeFocus;

            return (
              <div
                key={plan.id}
                style={{
                  background: isPopular
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1))'
                  : C.cardBg,
                  border: isPopular
                  ? '2px solid rgba(16,185,129,0.4)'
                  : `1px solid ${C.cardBorder}`,
                  borderRadius: 20, padding: '28px 24px',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: 16, right: -28,
                    background: '#10b981', color: '#fff',
                    fontSize: '0.65rem', fontWeight: 800,
                    padding: '4px 36px', transform: 'rotate(45deg)',
                    letterSpacing: '0.5px',
                  }}>
                    {isUpgradeFocus ? 'RECOMENDADO' : 'POPULAR'}
                  </div>
                )}

                {/* Plan icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${plan.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: plan.color, marginBottom: 16,
                }}>
                  {plan.icon}
                </div>

                <h3 style={{ color: C.cardTitle, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px' }}>
                  {plan.name}
                </h3>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ color: C.price, fontSize: '2rem', fontWeight: 900 }}>
                    {plan.price}
                  </span>
                  <span style={{ color: C.priceNote, fontSize: '0.85rem', marginLeft: 4 }}>
                    {plan.priceNote}
                  </span>
                </div>

                {/* Features */}
                <div style={{ marginBottom: 20 }}>
                  {plan.features.map((feat, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 10, fontSize: '0.82rem', color: C.featureText,
                    }}>
                      <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
                      {feat}
                    </div>
                  ))}
                  {plan.limited.map((feat, i) => (
                    <div key={`l-${i}`} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 10, fontSize: '0.82rem', color: C.limitedText,
                    }}>
                      <X size={14} color={C.limitedIcon} style={{ flexShrink: 0 }} />
                      {feat}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: 12, border: 'none',
                    background: isPopular
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : C.neutralButtonBg,
                    color: isPopular ? '#fff' : C.neutralButtonText, fontWeight: 700,
                    fontSize: '0.875rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: isPopular ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {isPopular && <Zap size={16} />}
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {isCelebratingUpgrade && (
          <div style={{
            margin: '0 32px 18px',
            border: '1px solid rgba(16,185,129,0.35)',
            background: C.upgradeInfoBg,
            borderRadius: 12,
            padding: '0.65rem 0.8rem',
            color: C.upgradeInfoText,
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}>
            <Sparkles size={14} color="#34d399" />
            Upgrade confirmado na demo.
          </div>
        )}
      </div>

      <ConfettiBurst active={isCelebratingUpgrade} onDone={() => setIsCelebratingUpgrade(false)} />

      <style>{`
        @keyframes planModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
