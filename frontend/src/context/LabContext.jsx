import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, laboratorioService, dashboardService, amostraService } from '../services/api';
import { mockLabs, mockSamples, mockLabUploadPlan } from '../mockData';
import { useDataMode } from './DataModeContext';

const LabContext = createContext(null);

// Default stats (used as fallback while loading)
const defaultStats = {
  total: 0,
  processed: 0,
  pending: 0,
  health: 0,
  total_amostras: 0,
  processadas_hoje: 0,
  pendentes: 0,
  laudos_emitidos: 0,
};
const PLAN_USAGE_STORAGE_KEY = 'agrogemini_lab_upload_plan_usage';

const BACKEND_STATUS_MAP = {
  RECEBIDA: 'processando',
  EM_ANALISE: 'processando',
  PROCESSANDO: 'processando',
  LAUDO_GERADO: 'concluido',
  CONCLUIDA: 'concluido',
  CONCLUIDO: 'concluido',
  APROVADA: 'concluido',
  ALERTA: 'alerta',
  REJEITADA: 'alerta',
  PENDENTE: 'alerta',
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function getInitials(name = '') {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
  return initials || 'CL';
}

function formatDisplayDate(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toLocaleDateString('pt-BR');
  }
  return String(value).slice(0, 10);
}

function statusToBadgeType(rawStatus = '') {
  const fromMap = BACKEND_STATUS_MAP[String(rawStatus).toUpperCase()];
  if (fromMap) return fromMap;
  if (['concluido', 'alerta', 'processando'].includes(rawStatus)) return rawStatus;
  return 'processando';
}

function deriveHealthFromStatus(rawStatus, index = 0) {
  const normalized = String(rawStatus || '').toUpperCase();
  if (['LAUDO_GERADO', 'CONCLUIDA', 'CONCLUIDO', 'APROVADA'].includes(normalized)) {
    return 86;
  }
  if (['ALERTA', 'REJEITADA', 'PENDENTE'].includes(normalized)) {
    return 62;
  }
  return 74 + (index % 6);
}

function normalizeSample(sample, index = 0) {
  const producerName = sample?.producer
    || sample?.cliente_nome
    || sample?.solicitante_nome
    || 'Cliente';
  const rawStatus = sample?.status || sample?.situacao || 'RECEBIDA';
  const health = Number(sample?.health ?? sample?.indice_saude ?? deriveHealthFromStatus(rawStatus, index));

  return {
    id: sample?.id || `sample-${index}-${sample?.codigo_interno || sample?.codigo_barras || Date.now()}`,
    date: formatDisplayDate(sample?.date || sample?.data_entrada || sample?.data_coleta || sample?.criado_em),
    producer: producerName,
    initials: sample?.initials || getInitials(producerName),
    field: sample?.field || sample?.talhao_identificacao || sample?.propriedade || sample?.tipo_amostra || 'Talhão principal',
    status: statusToBadgeType(rawStatus),
    health: clamp(Number.isFinite(health) ? health : 72, 35, 99),
    _raw: sample,
  };
}

function normalizeSamples(samples = []) {
  if (!Array.isArray(samples)) return [];
  return samples.map((sample, index) => normalizeSample(sample, index));
}

function computeAverageHealth(samples = []) {
  if (!samples.length) return 0;
  const total = samples.reduce((acc, s) => acc + (Number(s.health) || 0), 0);
  return Math.round(total / samples.length);
}

function normalizeStats(stats = {}, samples = []) {
  const total = Number(stats?.total ?? stats?.total_amostras ?? samples.length ?? 0);
  const processed = Number(
    stats?.processed
    ?? stats?.processadas_hoje
    ?? stats?.laudos_emitidos
    ?? Math.round(total * 0.35)
  );
  const pending = Number(
    stats?.pending
    ?? stats?.pendentes
    ?? Math.max(0, total - processed)
  );
  const health = Number(stats?.health ?? stats?.saude_media ?? computeAverageHealth(samples));
  const laudosEmitidos = Number(stats?.laudos_emitidos ?? processed);

  return {
    total,
    processed,
    pending,
    health: clamp(Number.isFinite(health) ? health : 0, 0, 100),
    total_amostras: total,
    processadas_hoje: processed,
    pendentes: pending,
    laudos_emitidos: laudosEmitidos,
  };
}

function mapLabForUi(lab, index = 0) {
  const typeFromIndex = index === 0 ? 'matriz' : 'filial';
  return {
    id: lab?.id ?? `lab-${index + 1}`,
    name: lab?.name || lab?.nome || `Laboratório ${index + 1}`,
    city: lab?.city || lab?.cidade_endereco || lab?.email || 'Brasil',
    type: lab?.type || typeFromIndex,
    active: typeof lab?.active === 'boolean' ? lab.active : (lab?.ativo !== 'N'),
    _raw: lab,
  };
}

function getMockDashboardData() {
  const normalizedSamples = normalizeSamples(mockSamples);
  return {
    samples: normalizedSamples,
    stats: normalizeStats({
      total_amostras: normalizedSamples.length,
      processadas_hoje: Math.max(1, Math.round(normalizedSamples.length * 0.4)),
      pendentes: normalizedSamples.filter(sample => sample.status === 'processando').length,
      laudos_emitidos: normalizedSamples.filter(sample => sample.status === 'concluido').length,
      health: computeAverageHealth(normalizedSamples),
    }, normalizedSamples),
  };
}

function normalizeUserType(value) {
  return String(value || '').trim().toUpperCase();
}

function resolveUserPlan({ plano, plano_ativo: planoAtivo, tipo_usuario: tipoUsuario } = {}, fallback = 'FREE') {
  const normalizedPlan = String(plano || planoAtivo || '').toUpperCase();
  const normalizedType = normalizeUserType(tipoUsuario);

  if (normalizedPlan === 'PREMIUM') return 'PREMIUM';
  if (normalizedType === 'UP' || normalizedType === 'ADM') return 'PREMIUM';
  if (normalizedPlan === 'FREE') return 'FREE';
  return fallback;
}

function resolveUserRole(tipoUsuario) {
  const normalizedType = normalizeUserType(tipoUsuario);
  if (normalizedType === 'ADM') return 'Administrador';
  if (normalizedType === 'UE') return 'Produtor';
  if (normalizedType === 'UP') return 'Lab Premium';
  if (normalizedType === 'UC') return 'Lab Free';
  return 'Usuário';
}

function resolveUserPermission(tipoUsuario) {
  const normalizedType = normalizeUserType(tipoUsuario);
  if (normalizedType === 'ADM' || normalizedType === 'UP') return 'admin';
  return 'viewer';
}

export function LabProvider({ children }) {
  const { dataMode } = useDataMode();

  // ── Labs ────────────────────────────────────────────────────────────────────
  const [labs, setLabs] = useState([]);
  const [activeLab, setActiveLabState] = useState(null);
  const [labsLoading, setLabsLoading] = useState(true);
  const [activeDataSource, setActiveDataSource] = useState('mock'); // mock | real | fallback
  const [dataModeMessage, setDataModeMessage] = useState('Modo Demo / Mock ativo.');

  // ── User ────────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = authService.getUser();
    if (stored) {
      const tipoUsuario = normalizeUserType(stored.tipo_usuario);
      return {
        id: stored.id,
        name: `${stored.nome} ${stored.sobrenome}`,
        initials: `${stored.nome?.[0] || ''}${stored.sobrenome?.[0] || ''}`,
        role: resolveUserRole(tipoUsuario),
        permission: resolveUserPermission(tipoUsuario),
        email: stored.email,
        tipo_usuario: tipoUsuario,
        plano: resolveUserPlan(stored),
      };
    }
    return { name: 'Usuário', initials: 'U', role: 'Visitante', permission: 'viewer', plano: 'FREE' };
  });

  // ── Plan ────────────────────────────────────────────────────────────────────
  const [userPlan, setUserPlan] = useState(null);
  const [labUploadPlan, setLabUploadPlan] = useState(() => {
    const fallback = { ...mockLabUploadPlan };
    if (typeof window === 'undefined') return fallback;

    try {
      const stored = window.sessionStorage.getItem(PLAN_USAGE_STORAGE_KEY);
      if (!stored) return fallback;
      const parsed = JSON.parse(stored);
      const limit = Number.isFinite(parsed?.limite_uploads)
        ? parsed.limite_uploads
        : fallback.limite_uploads;
      const used = Number.isFinite(parsed?.uploads_realizados)
        ? Math.max(0, parsed.uploads_realizados)
        : fallback.uploads_realizados;
      return {
        plano_atual: parsed?.plano_atual || fallback.plano_atual,
        limite_uploads: limit,
        uploads_realizados: Math.min(used, limit),
      };
    } catch {
      return fallback;
    }
  });

  // ── Dashboard stats ─────────────────────────────────────────────────────────
  const [activeStats, setActiveStats] = useState(defaultStats);
  const [activeSamples, setActiveSamples] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // ── Helper: is user a producer? ─────────────────────────────────────────────
  const normalizedUserType = normalizeUserType(currentUser.tipo_usuario);
  const isProducer = normalizedUserType === 'UE';
  const isAdmin = normalizedUserType === 'ADM';
  const isLabPremiumByType = normalizedUserType === 'UP';
  const isPremium = currentUser.plano === 'PREMIUM' || isLabPremiumByType || isAdmin;
  const uploadLimit = Number.isFinite(labUploadPlan?.limite_uploads)
    ? labUploadPlan.limite_uploads
    : mockLabUploadPlan.limite_uploads;
  const uploadsUsed = Math.min(labUploadPlan?.uploads_realizados || 0, uploadLimit);
  const uploadsRemaining = Math.max(0, uploadLimit - uploadsUsed);
  const uploadUsagePercent = uploadLimit > 0
    ? Math.min(100, (uploadsUsed / uploadLimit) * 100)
    : 0;
  const isUploadLimitReached = !isPremium && uploadsRemaining <= 0;
  const setDataSourceInfo = useCallback((source, message) => {
    setActiveDataSource(source);
    setDataModeMessage(message || '');
  }, []);
  const resolveInitialLab = useCallback((availableLabs = []) => {
    if (!availableLabs.length) return null;
    if (typeof window === 'undefined') return availableLabs[0];
    try {
      const stored = window.sessionStorage.getItem('activeLab');
      if (!stored) return availableLabs[0];
      const parsed = JSON.parse(stored);
      return availableLabs.find(lab => lab.id === parsed.id) || availableLabs[0];
    } catch {
      return availableLabs[0];
    }
  }, []);

  // ── Load labs on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadLabs() {
      setLabsLoading(true);

      // Producers don't own labs — skip lab loading
      if (isProducer) {
        if (cancelled) return;
        setLabs([]);
        setActiveLabState(null);
        setDataSourceInfo(dataMode === 'real' ? 'real' : 'mock', '');
        setLabsLoading(false);
        return;
      }

      const fallbackLabs = mockLabs.map(mapLabForUi);
      if (dataMode === 'mock') {
        if (cancelled) return;
        setLabs(fallbackLabs);
        setActiveLabState(resolveInitialLab(fallbackLabs));
        setDataSourceInfo('mock', 'Modo Demo / Mock ativo.');
        setLabsLoading(false);
        return;
      }

      try {
        if (!authService.isAuthenticated()) throw new Error('Usuário não autenticado');
        const data = await laboratorioService.getMyLabs();
        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapLabForUi);
          setLabs(mapped);
          setActiveLabState(resolveInitialLab(mapped));
          setDataSourceInfo('real', 'Dados reais do backend ativos.');
        } else {
          setLabs(fallbackLabs);
          setActiveLabState(resolveInitialLab(fallbackLabs));
          setDataSourceInfo('fallback', 'Backend sem laboratórios retornados. Exibindo dados mockados para manter a demo.');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Erro ao carregar laboratórios:', err);
        setLabs(fallbackLabs);
        setActiveLabState(resolveInitialLab(fallbackLabs));
        setDataSourceInfo('fallback', 'Não foi possível carregar dados reais. Exibindo dados mockados para estabilidade da apresentação.');
      } finally {
        if (cancelled) return;
        setLabsLoading(false);
      }
    }

    loadLabs();
    return () => { cancelled = true; };
  }, [dataMode, isProducer, resolveInitialLab, setDataSourceInfo]);

  // ── Load plan info ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadPlan() {
      if (dataMode === 'mock') return;
      if (!authService.isAuthenticated()) return;
      try {
        const plan = await authService.mePlan();
        setUserPlan(plan);
        if (plan?.plano) {
          setCurrentUser(prev => ({
            ...prev,
            plano: resolveUserPlan(
              { plano: plan.plano, plano_ativo: plan.plano_ativo, tipo_usuario: prev.tipo_usuario },
              prev.plano || 'FREE',
            ),
          }));
        }
      } catch {
        // Plan endpoint might not be available
      }
    }
    loadPlan();
  }, [dataMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.sessionStorage.setItem(PLAN_USAGE_STORAGE_KEY, JSON.stringify(labUploadPlan));
    } catch {
      // Ignore storage failures in private mode or restricted contexts
    }
  }, [labUploadPlan]);

  useEffect(() => {
    setLabUploadPlan(prev => {
      const nextPlan = isPremium ? 'PREMIUM' : 'FREE';
      if (prev.plano_atual === nextPlan) return prev;
      return { ...prev, plano_atual: nextPlan };
    });
  }, [isPremium]);

  // ── Load stats + samples when activeLab changes ────────────────────────────
  const loadDashboardData = useCallback(async (lab) => {
    const mockData = getMockDashboardData();

    if (dataMode === 'mock') {
      setActiveSamples(mockData.samples);
      setActiveStats(mockData.stats);
      return;
    }

    if (!authService.isAuthenticated()) {
      setActiveSamples(mockData.samples);
      setActiveStats(mockData.stats);
      setDataSourceInfo('fallback', 'Sessão não autenticada para backend. Exibindo dados mockados.');
      return;
    }

    // For producers in real mode, derive stats from own samples
    if (isProducer && currentUser.id) {
      setStatsLoading(true);
      try {
        const samples = await amostraService.getByCliente(currentUser.id);
        const normalizedSamples = normalizeSamples(samples);
        const stats = normalizeStats({
          total_amostras: normalizedSamples.length,
          processadas_hoje: normalizedSamples.filter(s => s.status === 'concluido').length,
          pendentes: normalizedSamples.filter(s => s.status === 'processando').length,
          laudos_emitidos: normalizedSamples.filter(s => s.status === 'concluido').length,
          health: computeAverageHealth(normalizedSamples),
        }, normalizedSamples);
        setActiveSamples(normalizedSamples);
        setActiveStats(stats);
        setDataSourceInfo('real', 'Dados reais do backend ativos.');
      } catch {
        setActiveStats(mockData.stats);
        setActiveSamples(mockData.samples);
        setDataSourceInfo('fallback', 'Falha ao carregar amostras reais. Dados mockados exibidos para continuidade da demo.');
      } finally {
        setStatsLoading(false);
      }
      return;
    }

    if (!lab) {
      setActiveStats(mockData.stats);
      setActiveSamples(mockData.samples);
      return;
    }

    const labId = lab.id;
    if (typeof labId !== 'number') {
      setActiveStats(mockData.stats);
      setActiveSamples(mockData.samples);
      setDataSourceInfo('fallback', 'Laboratório sem ID numérico para consulta real. Exibindo dados mockados.');
      return;
    }

    setStatsLoading(true);
    try {
      const [stats, samples] = await Promise.all([
        dashboardService.getStats(labId),
        amostraService.getAll(labId, 20),
      ]);
      const normalizedSamples = normalizeSamples(samples);
      const normalizedStats = normalizeStats(stats, normalizedSamples);
      setActiveStats(normalizedStats);
      setActiveSamples(normalizedSamples);
      setDataSourceInfo('real', 'Dados reais do backend ativos.');
    } catch {
      setActiveStats(mockData.stats);
      setActiveSamples(mockData.samples);
      setDataSourceInfo('fallback', 'Falha ao buscar dados reais do laboratório. Exibindo dados mockados.');
    } finally {
      setStatsLoading(false);
    }
  }, [dataMode, isProducer, currentUser.id, setDataSourceInfo]);

  useEffect(() => {
    if (isProducer) {
      loadDashboardData(null);
    } else if (activeLab) {
      loadDashboardData(activeLab);
    }
  }, [activeLab, loadDashboardData, isProducer]);

  // ── Load current user from API ──────────────────────────────────────────────
  useEffect(() => {
    async function loadUser() {
      if (dataMode === 'mock') return;
      if (!authService.isAuthenticated()) return;
      try {
        const u = await authService.me();
        if (u) {
          const tipoUsuario = normalizeUserType(u.tipo_usuario);
          setCurrentUser(prev => ({
            ...prev,
            id: u.id,
            name: `${u.nome} ${u.sobrenome}`,
            initials: `${u.nome?.[0] || ''}${u.sobrenome?.[0] || ''}`,
            role: resolveUserRole(tipoUsuario),
            permission: resolveUserPermission(tipoUsuario),
            email: u.email,
            tipo_usuario: tipoUsuario,
            plano: resolveUserPlan({ ...u, tipo_usuario: tipoUsuario }, prev.plano || 'FREE'),
            plano_ativo: u.plano_ativo,
          }));
        }
      } catch {
        // Token might be invalid
      }
    }
    loadUser();
  }, [dataMode]);

  // ── Setters ─────────────────────────────────────────────────────────────────
  const setActiveLab = (lab) => {
    setActiveLabState(lab);
    if (typeof window === 'undefined') return;
    try { window.sessionStorage.setItem('activeLab', JSON.stringify(lab)); } catch { /* ignore */ }
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
  const registerSampleUploads = (count = 1) => {
    const safeCount = Math.max(0, Number(count) || 0);
    if (!safeCount) return;

    setLabUploadPlan(prev => {
      const limit = Number.isFinite(prev?.limite_uploads)
        ? prev.limite_uploads
        : mockLabUploadPlan.limite_uploads;

      if (isPremium) {
        return {
          ...prev,
          plano_atual: 'PREMIUM',
          uploads_realizados: (prev?.uploads_realizados || 0) + safeCount,
        };
      }

      return {
        ...prev,
        plano_atual: 'FREE',
        limite_uploads: limit,
        uploads_realizados: Math.min(limit, (prev?.uploads_realizados || 0) + safeCount),
      };
    });
  };
  const activateDemoPremiumPlan = () => {
    setCurrentUser(prev => ({ ...prev, plano: 'PREMIUM', role: 'Lab Premium' }));
    setLabUploadPlan(prev => ({ ...prev, plano_atual: 'PREMIUM' }));

    try {
      const storedUser = authService.getUser();
      if (!storedUser) return;
      const updatedUser = { ...storedUser, plano: 'PREMIUM' };
      window.localStorage.setItem('agrogemini_user', JSON.stringify(updatedUser));
    } catch {
      // Ignore storage sync errors
    }
  };

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
      dataMode,
      activeDataSource,
      dataModeMessage,
      isUsingFallbackData: activeDataSource === 'fallback',
      // New plan-related values
      userPlan,
      isProducer,
      isAdmin,
      isPremium,
      // Upload plan demo values
      uploadPlan: isPremium ? 'PREMIUM' : 'FREE',
      uploadLimit,
      uploadsUsed,
      uploadsRemaining,
      uploadUsagePercent,
      isUploadLimitReached,
      registerSampleUploads,
      activateDemoPremiumPlan,
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
