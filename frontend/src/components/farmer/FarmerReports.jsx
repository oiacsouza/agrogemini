import React, { useRef, useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Leaf, Plus } from 'lucide-react';
import { useFarmerTheme } from './hooks/useFarmerTheme';
import { FarmerReportCard } from './ui/FarmerReportCard';
import { FarmerPortalHeader } from './ui/FarmerPortalHeader';
import { fazendaService, laudoService, amostraService, authService } from '../../services/api';

/**
 * FarmerReports - Screen 1 of the rural producer portal.
 *
 * Route: #/farmer/reports
 */
export function FarmerReports({ t, isDark = false, toggleDark, lang, setLang, onViewReport, onLogout, onGoToLab }) {
  const tk = useFarmerTheme(isDark);
  const fp = t.farmerPortal;

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadFarmsAndReports() {
      setLoading(true);
      setError('');
      try {
        const user = authService.getUser();
        if (!user) return;

        const [farmsResult, reportsResult, samplesResult] = await Promise.allSettled([
          fazendaService.getAll(),
          laudoService.getByCliente(user.id),
          amostraService.getByCliente(user.id),
        ]);
        const userFarms = farmsResult.status === 'fulfilled' && Array.isArray(farmsResult.value)
          ? farmsResult.value
          : [];
        let userReports = reportsResult.status === 'fulfilled' && Array.isArray(reportsResult.value)
          ? reportsResult.value
          : [];
        const userSamples = samplesResult.status === 'fulfilled' && Array.isArray(samplesResult.value)
          ? samplesResult.value
          : [];
        if (reportsResult.status === 'rejected') {
          setError(reportsResult.reason?.detail || 'Nao foi possivel carregar os laudos do produtor.');
        }

        if (!userReports.length && userSamples.length) {
          const reportResults = await Promise.allSettled(
            userSamples.map(sample => laudoService.getByAmostra(sample.id))
          );
          userReports = reportResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
        }

        const farmNames = new Set(userFarms.map(farm => farm.nome).filter(Boolean));
        userSamples.forEach(sample => {
          farmNames.add(sample.propriedade || sample.talhao_identificacao || sample.tipo_amostra || 'Sem propriedade');
        });
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
              field: report.propriedade || 'Talhao Principal',
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

  const handleAttachPdf = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Selecione um arquivo PDF para anexar como laudo.');
      return;
    }

    const attachedAt = new Date();
    const pdfUrl = URL.createObjectURL(file);
    const report = {
      id: `pdf-${attachedAt.getTime()}`,
      title: file.name.replace(/\.pdf$/i, ''),
      field: 'PDF anexado pelo produtor',
      date: attachedAt.toLocaleDateString('pt-BR'),
      time: attachedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'anexado',
      score: 0,
      localPdfUrl: pdfUrl,
      fileName: file.name,
      _raw: {
        id: `pdf-${attachedAt.getTime()}`,
        numero_laudo: file.name.replace(/\.pdf$/i, ''),
        propriedade: 'Laudos anexados',
        data_emissao: attachedAt.toISOString(),
        status: 'ANEXADO',
        localPdfUrl: pdfUrl,
        fileName: file.name,
      },
    };

    setError('');
    setFarms(prev => {
      const existing = prev.find(farm => farm.id === 'attached-pdfs');
      if (existing) {
        return prev.map(farm => farm.id === 'attached-pdfs'
          ? { ...farm, expanded: true, reports: [report, ...farm.reports] }
          : farm
        );
      }
      return [
        {
          id: 'attached-pdfs',
          name: 'Laudos anexados',
          expanded: true,
          reports: [report],
        },
        ...prev,
      ];
    });
  };

  const openReportPdf = (report) => {
    const pdfUrl = report.localPdfUrl || report.pdf_path || report._raw?.pdf_path;
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const filtered = farms
    .map(farm => ({
      ...farm,
      reports: farm.reports.filter(report =>
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.field.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(farm => farm.reports.length > 0 || search === '');

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
        background: tk.headerBg,
        padding: '16px 20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: tk.headerShadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: tk.textPrimary, margin: 0 }}>
            {fp.title}
          </h1>
          <button
            id="fr-new-btn"
            type="button"
            aria-label="Anexar laudo em PDF"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: tk.green,
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
              flexShrink: 0,
            }}
          >
            <Plus size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleAttachPdf}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tk.textMuted }}
          />
          <input
            id="fr-search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={fp.search}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px 10px 40px',
              borderRadius: 12,
              border: `1.5px solid ${tk.inputBorder}`,
              background: tk.inputBg,
              fontSize: '0.875rem',
              color: tk.textPrimary,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, paddingBottom: 14 }}>
          <button
            id="fr-filter-btn"
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: `1.5px solid ${tk.inputBorder}`,
              background: tk.headerBg,
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: tk.textSecondary,
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={14} />
            {fp.filters}
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 120px',
        maxWidth: 960,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
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
            <div style={{ textAlign: 'center', padding: '40px', color: tk.textSecondary }}>
              {error || 'Nenhuma fazenda ou laudo encontrado.'}
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
                  borderRadius: 12,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Leaf size={18} color={tk.greenText} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: tk.textPrimary }}>
                    {farm.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: tk.textSecondary, fontWeight: 500 }}>
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
                  onDownload={(report.localPdfUrl || report.pdf_path || report._raw?.pdf_path) ? () => openReportPdf(report) : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: tk.bottomBarBg,
        padding: '16px 20px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 10,
      }}>
        <button
          id="fr-link-btn"
          type="button"
          onClick={onGoToLab}
          style={{
            width: '100%',
            maxWidth: 540,
            padding: '16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
            letterSpacing: '0.2px',
            fontFamily: 'inherit',
          }}
        >
          Acessar Portal do Laboratorio
        </button>
      </div>
    </div>
  );
}
