import React, { useState, useEffect } from 'react';
import {
  Search, SlidersHorizontal, ChevronUp, ChevronDown, Leaf, Plus,
  ClipboardList, BarChart3, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useFarmerTheme } from './hooks/useFarmerTheme';
import { FarmerReportCard } from './ui/FarmerReportCard';
import { FarmerPortalHeader } from './ui/FarmerPortalHeader';
import { fazendaService, laudoService, authService } from '../../services/api';

/**
 * FarmerReports - producer portal overview.
 *
 * Route: #/farmer/reports
 */
export function FarmerReports({ t, isDark = false, toggleDark, lang, setLang, onViewReport, onLogout, onGoToLab }) {
  const tk = useFarmerTheme(isDark);
  const fp = t.farmerPortal;

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFarmsAndReports() {
      setLoading(true);
      setError('');

      try {
        const user = authService.getUser();
        if (!user) return;

        const [farmsResult, reportsResult] = await Promise.allSettled([
          fazendaService.getAll(),
          laudoService.getByCliente(user.id),
        ]);

        const userFarms = farmsResult.status === 'fulfilled' && Array.isArray(farmsResult.value)
          ? farmsResult.value
          : [];
        const userReports = reportsResult.status === 'fulfilled' && Array.isArray(reportsResult.value)
          ? reportsResult.value
          : [];

        if (reportsResult.status === 'rejected') {
          setError(reportsResult.reason?.detail || 'Nao foi possivel carregar os laudos do produtor.');
        }

        const farmNames = new Set(userFarms.map(farm => farm.nome).filter(Boolean));
        userReports.forEach(report => {
          farmNames.add(report.propriedade || report.razao_social || 'Sem propriedade');
        });

        const mapped = Array.from(farmNames).map((farmName, index) => ({
          id: userFarms.find(farm => farm.nome === farmName)?.id || `report-farm-${index}`,
          name: farmName,
          expanded: true,
          reports: userReports
            .filter(report => (report.propriedade || report.razao_social || 'Sem propriedade') === farmName)
            .map(report => ({
              id: report.id,
              title: `Laudo #${report.numero_laudo}`,
              field: report.propriedade || 'Talhao principal',
              date: report.data_emissao ? new Date(report.data_emissao).toLocaleDateString('pt-BR') : '-',
              time: report.data_emissao
                ? new Date(report.data_emissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : '',
              status: String(report.status || 'RASCUNHO').toLowerCase(),
              score: 85,
              _raw: report,
            })),
        }));

        setFarms(mapped);
      } catch (err) {
        console.error('Error loading farmer data:', err);
        setError(err?.detail || 'Nao foi possivel carregar o portal do produtor.');
      } finally {
        setLoading(false);
      }
    }

    loadFarmsAndReports();
  }, []);

  const toggleFarm = (id) =>
    setFarms(prev => prev.map(farm => farm.id === id ? { ...farm, expanded: !farm.expanded } : farm));

  const filtered = farms
    .map(farm => ({
      ...farm,
      reports: farm.reports.filter(report =>
        (statusFilter === 'all' || report.status === statusFilter) &&
        (
          report.title.toLowerCase().includes(search.toLowerCase()) ||
          report.field.toLowerCase().includes(search.toLowerCase())
        )
      ),
    }))
    .filter(farm => farm.reports.length > 0 || (search === '' && statusFilter === 'all'));

  const allReports = farms.flatMap(farm => farm.reports.map(report => ({ ...report, farmName: farm.name })));
  const completedReports = allReports.filter(report =>
    ['concluido', 'concluído', 'aprovado', 'finalizado'].includes(report.status)
  ).length;
  const pendingReports = allReports.length - completedReports;
  const averageScore = allReports.length
    ? Math.round(allReports.reduce((sum, report) => sum + (Number(report.score) || 0), 0) / allReports.length)
    : 0;
  const latestReport = allReports[0];

  const statusOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'rascunho', label: 'Rascunho' },
    { id: 'concluido', label: 'Concluidos' },
    { id: 'aprovado', label: 'Aprovados' },
  ];

  return (
    <div style={{
      background: tk.pageBg,
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      width: '100%',
    }}>
      <FarmerPortalHeader lang={lang} setLang={setLang} isDark={isDark} toggleDark={toggleDark} onLogout={onLogout} />

      <div style={{
        maxWidth: 1120,
        width: '100%',
        margin: '0 auto',
        padding: '24px 16px 0',
        boxSizing: 'border-box',
      }}>
        <section style={{
          background: isDark
            ? 'linear-gradient(135deg, #122033 0%, #163422 58%, #3b2f14 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 56%, #fff7ed 100%)',
          border: `1px solid ${tk.cardBorder}`,
          borderRadius: 8,
          padding: 24,
          boxShadow: tk.shadow,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 20,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: tk.greenText,
              background: tk.greenLight,
              border: `1px solid ${tk.greenBorder}`,
              borderRadius: 999,
              padding: '6px 10px',
              fontSize: '0.76rem',
              fontWeight: 800,
              marginBottom: 14,
            }}>
              <Leaf size={14} /> Portal do produtor
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', lineHeight: 1.08, fontWeight: 900, color: tk.textPrimary, margin: '0 0 10px' }}>
              {fp.title}
            </h1>
            <p style={{ color: tk.textSecondary, fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 660 }}>
              Acompanhe seus laudos, encontre talhoes rapidamente e transforme os resultados do laboratorio em decisoes claras para a proxima operacao no campo.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button id="fr-new-btn" type="button" onClick={onGoToLab} aria-label={fp.linkReport} style={primaryButtonStyle}>
                <Plus size={17} /> Vincular nova analise
              </button>
              <button type="button" onClick={() => { setSearch(''); setStatusFilter('all'); }} style={secondaryButtonStyle(tk)}>
                <ClipboardList size={17} /> Ver todos os laudos
              </button>
            </div>
          </div>

          <div style={{
            background: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.78)',
            border: `1px solid ${tk.cardBorder}`,
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
            minHeight: 180,
          }}>
            <div>
              <div style={{ color: tk.textMuted, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Proxima acao sugerida
              </div>
              <div style={{ color: tk.textPrimary, fontSize: '1rem', fontWeight: 800, marginTop: 8 }}>
                {pendingReports > 0 ? 'Revisar laudos pendentes' : latestReport ? 'Revisar recomendacao mais recente' : 'Enviar primeira analise'}
              </div>
              <p style={{ color: tk.textSecondary, fontSize: '0.82rem', lineHeight: 1.5, margin: '6px 0 0' }}>
                {latestReport ? `${latestReport.title} em ${latestReport.farmName}` : 'Cadastre uma amostra para liberar o acompanhamento da sua area.'}
              </p>
            </div>
            <button
              type="button"
              onClick={latestReport ? () => onViewReport?.({ ...latestReport._raw, ...latestReport }) : onGoToLab}
              style={{ ...secondaryButtonStyle(tk), width: '100%', justifyContent: 'space-between' }}
            >
              Abrir acao <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginTop: 14,
        }}>
          <SummaryCard tk={tk} icon={<ClipboardList size={18} />} label="Laudos" value={allReports.length} tone="#2563eb" />
          <SummaryCard tk={tk} icon={<CheckCircle2 size={18} />} label="Concluidos" value={completedReports} tone="#16a34a" />
          <SummaryCard tk={tk} icon={<AlertTriangle size={18} />} label="Pendentes" value={pendingReports} tone="#f59e0b" />
          <SummaryCard tk={tk} icon={<BarChart3 size={18} />} label="Media tecnica" value={averageScore ? `${averageScore}%` : '-'} tone="#7c3aed" />
        </div>

        <div style={{
          background: tk.headerBg,
          border: `1px solid ${tk.cardBorder}`,
          borderRadius: 8,
          padding: 14,
          marginTop: 14,
          boxShadow: tk.shadow,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: 12,
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tk.textMuted }} />
            <input
              id="fr-search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={fp.search}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px 10px 40px',
                borderRadius: 8,
                border: `1.5px solid ${tk.inputBorder}`,
                background: tk.inputBg,
                fontSize: '0.875rem',
                color: tk.textPrimary,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {statusOptions.map(option => (
              <button
                key={option.id}
                id={option.id === 'all' ? 'fr-filter-btn' : undefined}
                type="button"
                onClick={() => setStatusFilter(option.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: `1.5px solid ${statusFilter === option.id ? tk.greenBorder : tk.inputBorder}`,
                  background: statusFilter === option.id ? tk.greenLight : tk.headerBg,
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: statusFilter === option.id ? tk.greenText : tk.textSecondary,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {option.id === 'all' && <SlidersHorizontal size={14} />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '18px 16px 40px',
        maxWidth: 1120,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          color: tk.textMuted,
          letterSpacing: 1,
          marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          {loading ? 'Carregando fazendas...' : fp.myFarms}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
          gap: '0 24px',
        }}>
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '42px 24px',
              color: tk.textSecondary,
              background: tk.cardBg,
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 8,
              gridColumn: '1 / -1',
            }}>
              <ClipboardList size={34} color={tk.textMuted} style={{ marginBottom: 12 }} />
              <div style={{ color: tk.textPrimary, fontWeight: 800, marginBottom: 6 }}>Nenhum resultado encontrado</div>
              <div>{error || 'Ajuste a busca ou os filtros para encontrar seus laudos.'}</div>
            </div>
          )}

          {filtered.map(farm => (
            <div key={farm.id} style={{ marginBottom: 20 }}>
              <button
                id={`fr-farm-${farm.id}`}
                type="button"
                onClick={() => toggleFarm(farm.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: tk.farmRowBg,
                  border: `1.5px solid ${tk.farmRowBorder}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Leaf size={18} color={tk.greenText} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: tk.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {farm.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: tk.textSecondary, fontWeight: 600, flexShrink: 0 }}>
                    ({farm.reports.length} {fp.samples})
                  </span>
                </div>
                {farm.expanded
                  ? <ChevronUp size={18} color={tk.textSecondary} />
                  : <ChevronDown size={18} color={tk.textSecondary} />
                }
              </button>

              {farm.expanded && farm.reports.map(report => (
                <FarmerReportCard
                  key={report.id}
                  report={report}
                  t={t}
                  isDark={isDark}
                  onView={() => onViewReport?.({ ...report._raw, ...report })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '11px 14px',
  borderRadius: 8,
  background: 'linear-gradient(135deg, #16a34a, #15803d)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: '0.88rem',
  fontFamily: 'inherit',
  boxShadow: '0 8px 22px rgba(22, 163, 74, 0.22)',
};

function secondaryButtonStyle(tk) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 13px',
    borderRadius: 8,
    background: tk.inputBg,
    color: tk.textPrimary,
    border: `1px solid ${tk.inputBorder}`,
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: '0.86rem',
    fontFamily: 'inherit',
  };
}

function SummaryCard({ tk, icon, label, value, tone }) {
  return (
    <div style={{
      background: tk.cardBg,
      border: `1px solid ${tk.cardBorder}`,
      borderRadius: 8,
      padding: 14,
      boxShadow: tk.shadow,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ color: tk.textSecondary, fontSize: '0.78rem', fontWeight: 800 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone, background: `${tone}18` }}>
          {icon}
        </div>
      </div>
      <div style={{ color: tk.textPrimary, fontSize: '1.55rem', fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}
