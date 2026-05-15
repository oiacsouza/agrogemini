import React, { useState, useEffect } from 'react';
import {
  Users, FlaskConical, Leaf, FileSpreadsheet,
  Building2, TrendingUp, Shield, Eye,
  Loader2, AlertCircle, LogOut, Play, Code2
} from 'lucide-react';
import { adminService, authService } from '../../services/api';

/**
 * AdminDashboard — Full-access admin panel with system-wide stats.
 */
export function AdminDashboard({ t, onLogout, onNavigateAs }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiPath, setApiPath] = useState('/api/v1/auth/me');
  const [apiPayload, setApiPayload] = useState('');
  const [apiResult, setApiResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState([]);
  const [checksResult, setChecksResult] = useState(null);
  const [checksLoading, setChecksLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, catalog] = await Promise.all([
        adminService.getDashboard(),
        adminService.getOpenApi(),
      ]);
      setData(dashboard);
      setEndpoints(catalog?.endpoints || []);
    } catch (err) {
      setError(err?.detail || 'Erro ao carregar dashboard admin');
    } finally {
      setLoading(false);
    }
  };

  const user = authService.getUser();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const runApiRequest = async () => {
    const path = apiPath.trim();
    if (!path.startsWith('/api/')) {
      setApiResult({ status: 'Bloqueado', body: { detail: 'Use apenas caminhos internos iniciando com /api/.' } });
      return;
    }

    setApiLoading(true);
    try {
      let parsedBody;
      if (apiPayload.trim()) {
        parsedBody = JSON.parse(apiPayload);
      }

      const res = await fetch(`${apiBase}${path}`, {
        method: apiMethod,
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          ...(parsedBody ? { 'Content-Type': 'application/json' } : {}),
        },
        body: parsedBody ? JSON.stringify(parsedBody) : undefined,
      });
      const text = await res.text();
      let body;
      try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      const result = { status: res.status, body };
      setApiResult(result);
      setApiHistory(prev => [{ method: apiMethod, path, status: res.status, at: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 8));
    } catch (err) {
      setApiResult({ status: 'Erro', body: { detail: err.message || 'Falha ao executar request.' } });
    } finally {
      setApiLoading(false);
    }
  };

  const runSystemChecks = async () => {
    setChecksLoading(true);
    try {
      setChecksResult(await adminService.runSystemChecks());
    } catch (err) {
      setChecksResult({ status: 'failed', checks: [], detail: err?.detail || 'Falha ao executar checks.' });
    } finally {
      setChecksLoading(false);
    }
  };

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
                { label: 'Gerenciar Usuários (Pessoas)', desc: 'Lista completa de todos os perfis', icon: Users, color: '#f59e0b', action: 'users' },
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

            <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, margin: '32px 0 16px' }}>
              Console de APIs
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)',
              gap: 16,
            }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#f1f5f9', fontWeight: 700 }}>
                  <Code2 size={18} color="#10b981" /> Testar endpoint
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <select value={apiMethod} onChange={e => setApiMethod(e.target.value)}
                    style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', borderRadius: 8, padding: '8px 10px', fontWeight: 700 }}>
                    {['GET', 'POST', 'PUT', 'DELETE'].map(method => <option key={method}>{method}</option>)}
                  </select>
                  <input value={apiPath} onChange={e => setApiPath(e.target.value)} placeholder="/api/v1/..."
                    style={{ flex: 1, background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155', borderRadius: 8, padding: '8px 10px' }} />
                </div>
                <textarea value={apiPayload} onChange={e => setApiPayload(e.target.value)} placeholder='{"campo":"valor"}'
                  style={{ width: '100%', minHeight: 110, boxSizing: 'border-box', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: 10, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.8rem' }} />
                <button onClick={runApiRequest} disabled={apiLoading}
                  style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 12px', fontWeight: 800, cursor: apiLoading ? 'not-allowed' : 'pointer' }}>
                  {apiLoading ? <Loader2 size={15} style={{ animation: 'authSpin 0.8s linear infinite' }} /> : <Play size={15} />} Executar
                </button>
                <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 10 }}>
                  Token atual: {authService.getToken() ? `${authService.getToken().slice(0, 18)}...` : 'sem token'}
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 10 }}>
                  Resposta {apiResult?.status ? `HTTP ${apiResult.status}` : ''}
                </div>
                <pre style={{ minHeight: 148, maxHeight: 260, overflow: 'auto', margin: 0, background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 8, padding: 10, fontSize: '0.75rem' }}>
                  {apiResult ? JSON.stringify(apiResult.body, null, 2) : 'Execute uma chamada para visualizar a resposta.'}
                </pre>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 10 }}>Endpoints</div>
                <div style={{ maxHeight: 180, overflow: 'auto' }}>
                  {endpoints.slice(0, 80).map((ep, i) => (
                    <button key={`${ep.method}-${ep.path}-${i}`} onClick={() => { setApiMethod(ep.method); setApiPath(ep.path); }}
                      style={{ width: '100%', display: 'flex', gap: 8, background: 'transparent', border: 'none', borderBottom: '1px solid #334155', color: '#94a3b8', padding: '7px 0', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem' }}>
                      <strong style={{ color: '#10b981', width: 52 }}>{ep.method}</strong><span>{ep.path}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 10 }}>Histórico</div>
                {apiHistory.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Nenhuma chamada ainda.</div>
                ) : apiHistory.map((item, i) => (
                  <div key={`${item.at}-${i}`} style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '6px 0', borderBottom: '1px solid #334155' }}>
                    {item.at} · {item.method} {item.path} · {item.status}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 700 }}>Checks Automatizados</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>Autenticação, guards e exposição básica de APIs.</div>
                </div>
                <button onClick={runSystemChecks} disabled={checksLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#334155', border: '1px solid #475569', color: '#f1f5f9', borderRadius: 8, padding: '8px 12px', fontWeight: 800, cursor: checksLoading ? 'not-allowed' : 'pointer' }}>
                  {checksLoading ? <Loader2 size={15} style={{ animation: 'authSpin 0.8s linear infinite' }} /> : <Play size={15} />} Rodar checks
                </button>
              </div>
              {checksResult && (
                <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                  <div style={{ color: checksResult.status === 'passed' ? '#10b981' : '#f87171', fontWeight: 800, fontSize: '0.85rem' }}>
                    Status: {checksResult.status} · Falhas: {checksResult.failed ?? 0}
                  </div>
                  {(checksResult.checks || []).map(check => (
                    <div key={check.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.78rem', borderTop: '1px solid #334155', paddingTop: 8 }}>
                      <span>{check.label}</span>
                      <strong style={{ color: check.status === 'passed' ? '#10b981' : '#f87171' }}>{check.status}</strong>
                    </div>
                  ))}
                </div>
              )}
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
