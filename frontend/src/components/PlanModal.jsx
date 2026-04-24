import React, { useState } from 'react';
import { X, Crown, Leaf, FlaskConical, Sparkles, Check, Zap } from 'lucide-react';

/**
 * PlanModal — shown when user clicks "Explorar a plataforma" on the landing page.
 * Displays 4 plan options: Produtor Free, Produtor Premium, Lab Free, Lab Premium.
 */
export function PlanModal({ isOpen, onClose, onSelectPlan, t }) {
  const [selectedTab, setSelectedTab] = useState('produtor');

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
        priceNote: 'até 5 amostras',
        icon: <FlaskConical size={24} />,
        color: '#6366f1',
        features: [
          'Cadastro de até 5 amostras',
          'Dashboard básico',
          'Importação de dados',
          'Geração de laudos',
        ],
        limited: [
          'Sem gestão de filiais',
          'Limite de 5 amostras',
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{
        background: '#0f172a', borderRadius: 24,
        border: '1px solid #1e293b',
        width: '90vw', maxWidth: 780,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        animation: 'planModalIn 0.3s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 32px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>
              Escolha seu plano
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              Selecione o perfil e plano ideal para você
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#1e293b', border: 'none', borderRadius: 10,
            padding: 8, cursor: 'pointer', display: 'flex',
            color: '#94a3b8',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 4,
          margin: '24px 32px 0',
          background: '#1e293b', borderRadius: 12, padding: 4,
        }}>
          {[
            { id: 'produtor', label: '🌱 Produtor', icon: Leaf },
            { id: 'laboratorio', label: '🧪 Laboratório', icon: FlaskConical },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                flex: 1, padding: '10px 16px',
                borderRadius: 10, border: 'none',
                background: selectedTab === tab.id ? '#10b981' : 'transparent',
                color: selectedTab === tab.id ? '#fff' : '#94a3b8',
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
          {plans[selectedTab].map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1))'
                  : '#1e293b',
                border: plan.popular
                  ? '2px solid rgba(16,185,129,0.4)'
                  : '1px solid #334155',
                borderRadius: 20, padding: '28px 24px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: 16, right: -28,
                  background: '#10b981', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '4px 36px', transform: 'rotate(45deg)',
                  letterSpacing: '0.5px',
                }}>
                  POPULAR
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

              <h3 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px' }}>
                {plan.name}
              </h3>

              <div style={{ marginBottom: 20 }}>
                <span style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 900 }}>
                  {plan.price}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: 4 }}>
                  {plan.priceNote}
                </span>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 20 }}>
                {plan.features.map((feat, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 10, fontSize: '0.82rem', color: '#cbd5e1',
                  }}>
                    <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
                    {feat}
                  </div>
                ))}
                {plan.limited.map((feat, i) => (
                  <div key={`l-${i}`} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 10, fontSize: '0.82rem', color: '#475569',
                  }}>
                    <X size={14} color="#475569" style={{ flexShrink: 0 }} />
                    {feat}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => onSelectPlan?.(plan.id)}
                style={{
                  width: '100%', padding: '12px 16px',
                  borderRadius: 12, border: 'none',
                  background: plan.popular
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : '#334155',
                  color: '#fff', fontWeight: 700,
                  fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: plan.popular ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {plan.popular && <Zap size={16} />}
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes planModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
