import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Droplets, Leaf, TrendingUp, AlertCircle, Download, Share2, CheckCircle, Lock } from 'lucide-react';
import { mockReportDetail }      from './data/farmerMockData';
import { useFarmerTheme }        from './hooks/useFarmerTheme';
import { FarmerNutrientBar }     from './ui/FarmerNutrientBar';
import { FarmerInsightChip }     from './ui/FarmerInsightChip';
import { PlanUpgradePopup }      from '../PlanUpgradePopup';
import { authService }           from '../../services/api';

/**
 * FarmerReportDetail – Screen 2 of the rural producer portal.
 *
 * Route: #/farmer/report/:id
 *
 * @param {{ t: object, isDark: boolean, report?: object, onBack: () => void }} props
 */
export function FarmerReportDetail({ t, isDark = false, report, onBack }) {
  const tk  = useFarmerTheme(isDark);
  const fp  = t.farmerPortal;
  const fpd = fp.detail;

  // Use the passed report or fall back to mock data
  const d = report ? { ...mockReportDetail, ...report } : mockReportDetail;

  const [downloading, setDownloading] = useState(false);
  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1600);
  };

  // Plan-based visibility
  const user = authService.getUser();
  const isPremium = user?.plano === 'PREMIUM' || user?.tipo_usuario === 'ADM';
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [declinedUpgrade, setDeclinedUpgrade] = useState(false);

  // Show popup for free producers on first load
  useEffect(() => {
    if (!isPremium && user?.tipo_usuario === 'UE') {
      const dismissed = sessionStorage.getItem('upgrade_popup_dismissed');
      if (!dismissed) {
        setShowUpgradePopup(true);
      } else {
        setDeclinedUpgrade(true);
      }
    }
  }, [isPremium, user?.tipo_usuario]);

  const showPremiumSections = isPremium || (!declinedUpgrade && !showUpgradePopup);

  return (
    <div style={{
      background:    tk.pageBg,
      minHeight:     '100dvh',
      fontFamily:    "'Inter', sans-serif",
      display:       'flex',
      flexDirection: 'column',
      width:         '100%',
    }}>

      {/* ── Hero Header ──────────────────────────────────────── */}
      <div style={{
        background: tk.heroBg,
        padding:    '20px 20px 28px',
        position:   'relative',
        overflow:   'hidden',
      }}>
        {/* Decorative blobs */}
        <span style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'block', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'block', pointerEvents: 'none' }} />

        {/* Limit width on large screens */}
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Back */}
          <button
            id="frd-back-btn"
            onClick={onBack}
            style={{
              background:    'rgba(255,255,255,0.2)',
              border:        'none',
              borderRadius:  10,
              padding:       8,
              cursor:        'pointer',
              marginBottom:  18,
              display:       'inline-flex',
              alignItems:    'center',
              backdropFilter:'blur(4px)',
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </button>

          {/* Farm name + score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ color: '#fff', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', fontWeight: 800, margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {d.farmName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <MapPin size={13} /><span>{d.field}</span>
                <span style={{ margin: '0 2px' }}>•</span>
                <span>{d.date}</span>
              </div>
            </div>

            {/* Score badge */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{d.score}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{fpd.good}</div>
            </div>
          </div>

          {/* Score bar */}
          <div style={{ marginTop: 16, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${d.scorePct}%`, background: '#fff', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ──────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Key Insights card */}
          <SectionCard tk={tk}>
            <SectionTitle icon={<TrendingUp size={16} color={tk.greenText} />} label={fpd.keyInsights} tk={tk} />

            <div style={{ display: 'flex', gap: 10 }}>
              <FarmerInsightChip
                icon={<Droplets size={18} color={tk.chipPh.text} />}
                label={fp.phTitle || "pH Level"}
                value={d.ph}
                sub={fpd.phLabel}
                bg={tk.chipPh.bg}
                textColor={tk.chipPh.text}
                subColor={tk.textSecondary}
              />
              <FarmerInsightChip
                icon={<Leaf size={18} color={tk.chipNutr.text} />}
                label={fp.nutrientsTitle || "Nutrients"}
                value={`${d.nutrients}%`}
                sub={fpd.nutrientsLabel}
                bg={tk.chipNutr.bg}
                textColor={tk.chipNutr.text}
                subColor={tk.textSecondary}
              />
              <FarmerInsightChip
                icon={<span style={{ fontSize: '1.2rem' }}>🌱</span>}
                label={fp.organicTitle || "Organic"}
                value={`${d.organic}%`}
                sub={fpd.organicLabel}
                bg={tk.chipOrg.bg}
                textColor={tk.chipOrg.text}
                subColor={tk.textSecondary}
              />
            </div>

            {/* Limitations */}
            {d.limitations?.length > 0 && (
              <div style={{ background: tk.limitBg, border: `1px solid ${tk.limitBorder}`, borderRadius: 10, padding: '10px 14px', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <AlertCircle size={14} color={tk.limitDot} />
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: tk.limitText }}>{fpd.limitations}</span>
                </div>
                {d.limitations.map((key, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: tk.limitText, marginBottom: i < d.limitations.length - 1 ? 4 : 0 }}>
                    <span style={{ color: tk.limitDot, fontWeight: 700 }}>•</span>
                    {fpd.limitacoes?.[key] ?? key}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {showPremiumSections && (
          <div style={{ background: tk.cropBg, borderRadius: 16, padding: '18px 16px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'block', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={16} color="#34d399" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#d1fae5' }}>{fpd.cropRec}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
                {d.cropRecommendation.name}
              </span>
              <span style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={12} /> {d.cropRecommendation.matchPct}% {fpd.match}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 12, margin: '0 0 12px' }}>
              {fpd.cropDescs?.[d.cropRecommendation.descriptionKey] ?? ''}
            </p>

            <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${d.cropRecommendation.matchPct}%`, background: '#34d399', borderRadius: 99 }} />
            </div>
          </div>
          )}

          {showPremiumSections && (
          <SectionCard tk={tk}>
            <SectionTitle icon={<Leaf size={16} color={tk.greenText} />} label={fpd.correctionPlan} tk={tk} />

            {d.correctionPlan.map((item, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i < d.correctionPlan.length - 1 ? 14 : 0,
                  marginBottom:  i < d.correctionPlan.length - 1 ? 14 : 0,
                  borderBottom:  i < d.correctionPlan.length - 1 ? `1px solid ${tk.divider}` : 'none',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: tk.textPrimary, marginBottom: 4 }}>
                  {fpd.correctionItems?.[item.titleKey] ?? item.titleKey}
                </div>
                <div style={{ fontSize: '0.8rem', color: tk.textSecondary, lineHeight: 1.5 }}>
                  {fpd.correctionItems?.[item.descKey] ?? item.descKey}
                </div>
              </div>
            ))}

            {/* Nutrient bars */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: tk.textSecondary, marginBottom: 12 }}>
                {fpd.nutrientPriorities}
              </div>
              {d.nutrientBars.map((bar, i) => (
                <FarmerNutrientBar
                  key={i}
                  name={fpd.nutrientNames?.[bar.nameKey] ?? bar.nameKey}
                  current={bar.current}
                  max={bar.max}
                  color={bar.color}
                  isDark={isDark}
                />
              ))}
            </div>
          </SectionCard>
          )}

          {/* Premium lock banner for free users */}
          {!isPremium && declinedUpgrade && (
            <div style={{
              background: tk.cardBg, borderRadius: 16, padding: '24px 20px',
              marginBottom: 14, border: `1px solid ${tk.cardBorder}`,
              textAlign: 'center',
            }}>
              <Lock size={32} color={tk.textMuted} style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: tk.textPrimary, marginBottom: 6 }}>
                Conteúdo Premium
              </div>
              <div style={{ fontSize: '0.82rem', color: tk.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
                Recomendação de Cultura e Plano de Correção estão disponíveis no plano Premium.
              </div>
              <button
                onClick={() => setShowUpgradePopup(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  padding: '10px 24px', fontWeight: 700, fontSize: '0.85rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Ver planos
              </button>
            </div>
          )}


        </div>
      </div>

      {/* ── Fixed Bottom Actions ──────────────────────────── */}
      <div style={{
        position:  'fixed',
        bottom:    0,
        left:      0,
        right:     0,
        background: tk.bottomBarBg,
        padding:   '16px 16px 28px',
        display:   'flex',
        justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 720 }}>
          <button
            id="frd-download-btn"
            onClick={handleDownload}
            style={{
              flex:           1,
              padding:        '14px',
              borderRadius:   14,
              background:     isDark ? 'transparent' : '#fff',
              color:          tk.greenText,
              fontWeight:     700,
              fontSize:       '0.9rem',
              border:         `2px solid ${tk.greenText}`,
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
              transition:     'opacity 0.2s',
              opacity:        downloading ? 0.7 : 1,
            }}
          >
            <Download size={16} /> {downloading ? fpd.downloading : fpd.download}
          </button>
          <button
            id="frd-share-btn"
            style={{
              flex:           1,
              padding:        '14px',
              borderRadius:   14,
              background:     'linear-gradient(135deg, #16a34a, #15803d)',
              color:          '#fff',
              fontWeight:     700,
              fontSize:       '0.9rem',
              border:         'none',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
              boxShadow:      '0 4px 14px rgba(22,163,74,0.35)',
            }}
          >
            <Share2 size={16} /> {fpd.share}
          </button>
        </div>
        </div>
      </div>

      {/* Plan upgrade popup for free producers */}
      <PlanUpgradePopup
        isOpen={showUpgradePopup}
        onClose={() => {
          setShowUpgradePopup(false);
          setDeclinedUpgrade(true);
          sessionStorage.setItem('upgrade_popup_dismissed', 'true');
        }}
        onUpgrade={() => {
          setShowUpgradePopup(false);
          window.location.hash = 'register';
        }}
        variant="produtor"
      />
    </div>
  );
}

// ── Local shared sub-components ───────────────────────────────────────────────

function SectionCard({ tk, children }) {
  return (
    <div style={{
      background:   tk.cardBg,
      borderRadius: 16,
      padding:      '18px 16px',
      marginBottom: 14,
      boxShadow:    tk.shadow,
      border:       `1px solid ${tk.cardBorder}`,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, label, tk }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {icon}
      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: tk.textPrimary }}>{label}</span>
    </div>
  );
}
