import React, { useState, useEffect } from 'react';
import {
  Users, FlaskConical, Leaf, FileSpreadsheet,
  Building2, TrendingUp, Shield, Eye,
  Loader2, AlertCircle, LogOut, Sun, Moon
} from 'lucide-react';
import { authService } from '../../services/api';

/**
 * AdminDashboard — Full-access admin panel with system-wide stats.
 */
export function AdminDashboard({ t, onLogout, onNavigateAs }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const { api } = await import('../../services/api');
      const res = await api.get('/api/v1/admin/dashboard');
      setData(res);
    } catch (err) {
      setError(err?.detail || 'Erro ao carregar dashboard admin');
    } finally {
      setLoading(false);
    }
  };

  const user = authService.getUser();

  const statCards = data ? [
    { label: 'Total Usuários', value: data.total_usuarios, icon: Users, color: '#6366f1' },
    { label: 'Produtores', value: data.total_produtores, icon: Leaf, color: '#10b981' },
    { label: 'Labs Premium', value: data.total_lab_premium, icon: FlaskConical, color: '#8b5cf6' },
    { label: 'Labs Free', value: data.total_lab_free, icon: FlaskConical, color: '#64748b' },
    { label: 'Amostras', value: data.total_amostras, icon: FileSpreadsheet, color: '#f59e0b' },
    { label: 'Laudos', value: data.total_laudos, icon: TrendingUp, color: '#ec4899' },
    { label: 'Laboratórios', value: data.total_laboratorios, icon: Building2, color: '#06b6d4' },
    { label: 'Fazendas', value: data.total_fazendas, icon: Leaf, color: '#84cc16' },
  ] : [];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 70, minHeight: 70,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#10b981', padding: 8, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem' }}>
              AgroGemini Admin
            </div>
            <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Painel de Administração
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Quick navigation */}
          <button
            onClick={() => onNavigateAs?.('lab')}
            style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }}
          >
            <Eye size={14} /> Portal Lab
          </button>
          <button
            onClick={() => onNavigateAs?.('farmer')}
            style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }}
          >
            <Eye size={14} /> Portal Produtor
          </button>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#10b981', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.7rem', fontWeight: 700,
            }}>
              {user?.nome?.[0] || 'A'}
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600 }}>
                {user?.nome || 'Admin'}
              </div>
              <div style={{ color: '#10b981', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Administrador
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', padding: 4, display: 'flex',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 size={32} color="#10b981" style={{ animation: 'authSpin 0.8s linear infinite' }} />
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '16px 20px', color: '#fca5a5',
            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem',
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {data && (
          <>
            {/* Stat cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16, marginBottom: 32,
            }}>
              {statCards.map((card, i) => (
                <div key={i} style={{
                  background: '#1e293b', borderRadius: 16,
                  padding: '20px 18px', border: '1px solid #334155',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#334155';
                }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${card.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 800 }}>
                    {card.value?.toLocaleString('pt-BR') ?? '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              Acesso Rápido
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 14,
            }}>
              {[
                { label: 'Visualizar Portal do Laboratório', desc: 'Acessar como supervisor', icon: FlaskConical, color: '#6366f1', action: 'lab' },
                { label: 'Visualizar Portal do Produtor', desc: 'Acessar como supervisor', icon: Leaf, color: '#10b981', action: 'farmer' },
                { label: 'Gerenciar Usuários', desc: 'Lista completa de usuários', icon: Users, color: '#f59e0b', action: 'users' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => onNavigateAs?.(item.action)}
                  style={{
                    background: '#1e293b', border: '1px solid #334155',
                    borderRadius: 14, padding: '18px 16px',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${item.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <item.icon size={22} color={item.color} />
                  </div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.875rem' }}>
                      {item.label}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes authSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
