import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Leaf, Plus } from 'lucide-react';
import { useFarmerTheme }    from './hooks/useFarmerTheme';
import { FarmerReportCard }  from './ui/FarmerReportCard';
import { FarmerPortalHeader }from './ui/FarmerPortalHeader';
import { fazendaService, laudoService, authService } from '../../services/api';

/**
 * FarmerReports  – Screen 1 of the rural producer portal.
 *
 * Route: #/farmer/reports
 */
export function FarmerReports({ t, isDark = false, toggleDark, lang, setLang, onViewReport, onLogout, onGoToLab }) {
  const tk = useFarmerTheme(isDark);
  const fp = t.farmerPortal;

  const [farms,  setFarms]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadFarmsAndReports() {
      setLoading(true);
      try {
        const user = authService.getUser();
        if (!user) return;

        // Fetch user's farms and reports
        const [userFarms, userReports] = await Promise.all([
          fazendaService.getAll(),
          laudoService.getByCliente(user.id)
        ]);

        // Merge them for display
        const mapped = userFarms.map(farm => ({
          id: farm.id,
          name: farm.nome,
          expanded: true,
          reports: userReports
            .filter(r => r.propriedade === farm.nome)
            .map(r => ({
              id: r.id,
              title: `Laudo #${r.numero_laudo}`,
              field: r.propriedade || 'Talhão Principal',
              date: r.data_emissao,
              status: r.status.toLowerCase(),
              score: 85, // Fallback score
              _raw: r
            }))
        }));
        setFarms(mapped);
      } catch (err) {
        console.error('Error loading farmer data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmsAndReports();
  }, []);

  const toggleFarm = (id) =>
    setFarms(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));

  const filtered = farms
    .map(farm => ({
      ...farm,
      reports: farm.reports.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.field.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(f => f.reports.length > 0 || search === '');

  return (
    <div style={{
      background:     tk.pageBg,
      minHeight:      '100dvh',
      display:        'flex',
      flexDirection:  'column',
      fontFamily:     "'Inter', sans-serif",
      width:          '100%',
    }}>
      <FarmerPortalHeader lang={lang} setLang={setLang} isDark={isDark} toggleDark={toggleDark} onLogout={onLogout} />

      {/* ── Sticky Header ───────────────────────────────────── */}
      <div style={{
        background:  tk.headerBg,
        padding:     '16px 20px 0',
        position:    'sticky',
        top:         0,
        zIndex:      10,
        boxShadow:   tk.headerShadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: tk.textPrimary, margin: 0 }}>
            {fp.title}
          </h1>
          <button
            id="fr-new-btn"
            aria-label={fp.linkReport}
            style={{
              background:   tk.green,
              color:        '#fff',
              border:       'none',
              borderRadius: '50%',
              width:        38,
              height:       38,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              cursor:       'pointer',
              boxShadow:    '0 2px 8px rgba(22,163,74,0.3)',
              flexShrink:   0,
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tk.textMuted }}
          />
          <input
            id="fr-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={fp.search}
            style={{
              width:        '100%',
              boxSizing:    'border-box',
              padding:      '10px 12px 10px 40px',
              borderRadius: 12,
              border:       `1.5px solid ${tk.inputBorder}`,
              background:   tk.inputBg,
              fontSize:     '0.875rem',
              color:        tk.textPrimary,
              outline:      'none',
              fontFamily:   'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, paddingBottom: 14 }}>
          <button
            id="fr-filter-btn"
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              border:       `1.5px solid ${tk.inputBorder}`,
              background:   tk.headerBg,
              borderRadius: 20,
              padding:      '6px 14px',
              fontSize:     '0.8rem',
              fontWeight:   600,
              color:        tk.textSecondary,
              cursor:       'pointer',
            }}
          >
            <SlidersHorizontal size={14} />
            {fp.filters}
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ─────────────────────────────────── */}
      <div style={{
        flex:       1,
        overflowY:  'auto',
        padding:    '16px 16px 120px',
        maxWidth:   960,
        width:      '100%',
        margin:     '0 auto',
        boxSizing:  'border-box',
      }}>
        <p style={{
          fontSize:      '0.7rem',
          fontWeight:    700,
          color:         tk.textMuted,
          letterSpacing: 1,
          marginBottom:  12,
          textTransform: 'uppercase',
        }}>
          {loading ? 'Carregando fazendas...' : fp.myFarms}
        </p>

        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
          gap:                 '0 24px',
        }}>
          {!loading && filtered.length === 0 && (
             <div style={{ textAlign: 'center', padding: '40px', color: tk.textSecondary }}>
                Nenhuma fazenda ou laudo encontrado.
             </div>
          )}
          {filtered.map(farm => (
            <div key={farm.id} style={{ marginBottom: 20 }}>
              <button
                id={`fr-farm-${farm.id}`}
                onClick={() => toggleFarm(farm.id)}
                style={{
                  width:          '100%',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  background:     tk.farmRowBg,
                  border:         `1.5px solid ${tk.farmRowBorder}`,
                  borderRadius:   12,
                  padding:        '12px 16px',
                  cursor:         'pointer',
                  marginBottom:   10,
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
                  ? <ChevronUp   size={18} color={tk.textSecondary} />
                  : <ChevronDown size={18} color={tk.textSecondary} />
                }
              </button>

              {farm.expanded && farm.reports.map(report => (
                <FarmerReportCard
                  key={report.id}
                  report={report}
                  t={t}
                  isDark={isDark}
                  onView={() => onViewReport?.(report)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position:   'fixed',
        bottom:     0,
        left:       0,
        right:      0,
        background: tk.bottomBarBg,
        padding:    '16px 20px 24px',
        display:    'flex',
        justifyContent: 'center',
        gap: 10,
      }}>
        <button
          id="fr-link-btn"
          onClick={onGoToLab}
          style={{
            width:        '100%',
            maxWidth:     540,
            padding:      '16px',
            borderRadius: 16,
            background:   'linear-gradient(135deg, #16a34a, #15803d)',
            color:        '#fff',
            fontWeight:   700,
            fontSize:     '1rem',
            border:       'none',
            cursor:       'pointer',
            boxShadow:    '0 4px 16px rgba(22,163,74,0.35)',
            letterSpacing:'0.2px',
            fontFamily:   'inherit',
          }}
        >
          🧪 Acessar Portal do Laboratório
        </button>
      </div>
    </div>
  );
}
