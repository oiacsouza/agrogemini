import React, { useState } from 'react';
import { Leaf, LayoutDashboard, Upload, FileSpreadsheet, Search, Bell } from 'lucide-react';
import { LabDashboard } from './LabDashboard';
import { LabImport } from './LabImport';
import { LabSamples } from './LabSamples';
import { LabSampleDetail } from './LabSampleDetail';

export function LabPortal({ onLogout, t }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <LabDashboard t={t} onViewDetails={() => setActiveTab('detail')} />;
      case 'import':   return <LabImport t={t} />;
      case 'samples':  return <LabSamples t={t} onViewDetails={() => setActiveTab('detail')} />;
      case 'detail':   return <LabSampleDetail t={t} onBack={() => setActiveTab('samples')} />;
      default:         return <LabDashboard t={t} onViewDetails={() => setActiveTab('detail')} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.portal.sidebar.dashboard },
    { id: 'import',    icon: Upload,          label: t.portal.sidebar.importSample },
    { id: 'samples',   icon: FileSpreadsheet, label: t.portal.sidebar.samples }
  ];

  const pageTitle = {
    dashboard: t.portal.dashboard.title,
    import:    t.portal.import.title,
    samples:   t.portal.sidebar.samples,
    detail:    t.portal.sidebar.samples,
  }[activeTab];

  const pageSubtitle = {
    dashboard: t.portal.dashboard.subtitle,
    import:    t.portal.import.subtitle,
    samples:   t.portal.dashboard.recentSamplesText,
    detail:    t.portal.detail.subtitle,
  }[activeTab];

  const SIDEBAR_W = 256; // 16rem = w-64
  const HEADER_H  = 73;  // fixed header height in px

  return (
    // Full viewport using position:fixed to bypass any parent height issues
    <div style={{ position: 'fixed', inset: 0, display: 'flex', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>

      {/* ── Sidebar ─────────────────────── */}
      <div style={{ width: SIDEBAR_W, minWidth: SIDEBAR_W, height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a', borderRight: '1px solid #1e293b', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onLogout}>
            <div style={{ background: '#10b981', padding: '0.375rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '1.125rem', lineHeight: 1.25 }}>AgroGemini</div>
              <div style={{ color: '#94a3b8', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{t.nav.labPortal}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id || (activeTab === 'detail' && id === 'samples');
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'left', transition: 'all 0.15s',
                  background: isActive ? '#10b981' : 'transparent',
                  color: isActive ? 'white' : '#94a3b8',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = 'white'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Support Box */}
        <div style={{ padding: '1rem', flexShrink: 0 }}>
          <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #334155' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{t.portal.sidebar.help}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{t.portal.sidebar.helpText}</div>
            <button style={{ width: '100%', background: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
              {t.portal.sidebar.documentation}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────── */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Header — FIXED HEIGHT */}
        <div style={{
          height: HEADER_H, minHeight: HEADER_H, maxHeight: HEADER_H,
          background: 'white', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2rem', flexShrink: 0, boxSizing: 'border-box', zIndex: 10,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a', lineHeight: 1.35 }}>{pageTitle}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>{pageSubtitle}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={15} />
              <input
                type="text"
                placeholder={t.portal.topbar.searchPlaceholder}
                style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', background: '#f8fafc', width: '13rem', boxSizing: 'border-box' }}
              />
            </div>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#94a3b8' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', width: '0.5rem', height: '0.5rem', background: '#ef4444', borderRadius: '9999px', border: '2px solid white', display: 'block' }}></span>
            </button>
          </div>
        </div>

        {/* Scrollable Content — takes remaining height exactly */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', boxSizing: 'border-box', minHeight: 0 }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
