import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, laboratorioService, dashboardService, amostraService } from '../services/api';
import { mockLabs, mockSamples } from '../mockData';

const LabContext = createContext(null);

// Default stats (used as fallback while loading)
const defaultStats = { total_amostras: 0, processadas_hoje: 0, pendentes: 0, laudos_emitidos: 0 };

export function LabProvider({ children }) {
  // ── Labs ────────────────────────────────────────────────────────────────────
  const [labs, setLabs] = useState([]);
  const [activeLab, setActiveLabState] = useState(null);
  const [labsLoading, setLabsLoading] = useState(true);

  // ── User ────────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = authService.getUser();
    if (stored) {
      return {
        id: stored.id,
        name: `${stored.nome} ${stored.sobrenome}`,
        initials: `${stored.nome?.[0] || ''}${stored.sobrenome?.[0] || ''}`,
        role: stored.tipo_usuario === 'ADM' ? 'Administrador' :
              stored.tipo_usuario === 'UE' ? 'Analista' :
              stored.tipo_usuario === 'UP' ? 'Produtor' : 'Usuário',
        permission: stored.tipo_usuario === 'ADM' ? 'admin' :
                    stored.tipo_usuario === 'UE' ? 'admin' : 'viewer',
        email: stored.email,
        tipo_usuario: stored.tipo_usuario,
      };
    }
    return { name: 'Usuário', initials: 'U', role: 'Visitante', permission: 'viewer' };
  });

  // ── Dashboard stats ─────────────────────────────────────────────────────────
  const [activeStats, setActiveStats] = useState(defaultStats);
  const [activeSamples, setActiveSamples] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // ── Load labs on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    async function loadLabs() {
      if (!authService.isAuthenticated()) {
        setLabs(mockLabs);
        setActiveLabState(mockLabs[0]);
        setLabsLoading(false);
        return;
      }

      try {
        const data = await laboratorioService.getMyLabs();
        if (data && data.length > 0) {
          // Map backend data to the format the UI expects
          const mapped = data.map(l => ({
            id: l.id,
            name: l.nome,
            city: l.cidade_endereco || l.email,
            type: 'lab',
            active: l.ativo === 'Y',
            // keep the raw data too
            _raw: l,
          }));
          setLabs(mapped);

          // Restore previously selected lab or default to first
          try {
            const stored = sessionStorage.getItem('activeLab');
            if (stored) {
              const parsed = JSON.parse(stored);
              const match = mapped.find(l => l.id === parsed.id);
              setActiveLabState(match || mapped[0]);
            } else {
              setActiveLabState(mapped[0]);
            }
          } catch {
            setActiveLabState(mapped[0]);
          }
        } else {
          // No labs found — use mock
          setLabs(mockLabs);
          setActiveLabState(mockLabs[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar laboratórios:', err);
        setLabs(mockLabs);
        setActiveLabState(mockLabs[0]);
      } finally {
        setLabsLoading(false);
      }
    }

    loadLabs();
  }, []);

  // ── Load stats + samples when activeLab changes ────────────────────────────
  const loadDashboardData = useCallback(async (lab) => {
    if (!lab || !authService.isAuthenticated()) return;

    const labId = lab.id;
    if (typeof labId !== 'number') {
      // Fallback to mock for string IDs (old mock format)
      setActiveStats(defaultStats);
      setActiveSamples(mockSamples);
      return;
    }

    setStatsLoading(true);
    try {
      const [stats, samples] = await Promise.all([
        dashboardService.getStats(labId).catch(() => defaultStats),
        amostraService.getAll(labId, 20).catch(() => []),
      ]);
      setActiveStats(stats);
      setActiveSamples(samples);
    } catch {
      setActiveStats(defaultStats);
      setActiveSamples(mockSamples);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeLab) {
      loadDashboardData(activeLab);
    }
  }, [activeLab, loadDashboardData]);

  // ── Load current user from API ──────────────────────────────────────────────
  useEffect(() => {
    async function loadUser() {
      if (!authService.isAuthenticated()) return;
      try {
        const u = await authService.me();
        if (u) {
          setCurrentUser({
            id: u.id,
            name: `${u.nome} ${u.sobrenome}`,
            initials: `${u.nome?.[0] || ''}${u.sobrenome?.[0] || ''}`,
            role: u.tipo_usuario === 'ADM' ? 'Administrador' :
                  u.tipo_usuario === 'UE' ? 'Analista' :
                  u.tipo_usuario === 'UP' ? 'Produtor' : 'Usuário',
            permission: u.tipo_usuario === 'ADM' ? 'admin' :
                        u.tipo_usuario === 'UE' ? 'admin' : 'viewer',
            email: u.email,
            tipo_usuario: u.tipo_usuario,
          });
        }
      } catch {
        // Token might be invalid
      }
    }
    loadUser();
  }, []);

  // ── Setters ─────────────────────────────────────────────────────────────────
  const setActiveLab = (lab) => {
    setActiveLabState(lab);
    try { sessionStorage.setItem('activeLab', JSON.stringify(lab)); } catch { /* ignore */ }
  };

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  const refreshDashboard = () => loadDashboardData(activeLab);

  return (
    <LabContext.Provider value={{
      activeLab, setActiveLab,
      labs,
      labsLoading,
      currentUser,
      isDark, toggleDark,
      activeStats,
      activeSamples,
      statsLoading,
      refreshDashboard,
    }}>
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used inside <LabProvider>');
  return ctx;
}
