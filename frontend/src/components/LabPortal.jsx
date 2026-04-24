import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf, LayoutDashboard, Upload, FileSpreadsheet,
  Search, Bell, Building2, Users, FlaskConical,
  ChevronDown, CheckCircle2, LogOut, Sun, Moon, Globe
} from 'lucide-react';
import { LabProvider, useLab } from '../context/LabContext';
import { ToastContainer } from './ui/Toast';
import { LabDashboard }      from './LabDashboard';
import { LabImport }         from './LabImport';
import { LabSamples }        from './LabSamples';
import { LabSampleDetail }   from './LabSampleDetail';
import { LabBranches }       from './lab/LabBranches';
import { LabEmployees }      from './lab/LabEmployees';
import { LabUsers }          from './lab/LabUsers';
import { LabClients }        from './lab/LabClients';
import { LabClientProfile }  from './lab/LabClientProfile';
import { useLabTheme }       from './lab/useLabTheme';

// ── Lab Switcher dropdown ────────────────────────────────────────────────────
function LabSwitcher({ t }) {
  const { activeLab, setActiveLab, labs, isDark } = useLab();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Guard: producers may not have an activeLab
  if (!activeLab) return null;

  const D = isDark
    ? { btn: '#1e293b', btnBorder: '#334155', btnText: '#f1f5f9', drop: '#0f172a', dropBorder: '#1e293b', sectionBg: '#1e293b', sectionBorder: '#334155', hoverBg: '#1e293b', activeBg: '#0d2b1f', itemText: '#f1f5f9' }
    : { btn: '#f8fafc', btnBorder: '#e2e8f0', btnText: '#0f172a', drop: '#ffffff', dropBorder: '#e2e8f0', sectionBg: '#f8fafc', sectionBorder: '#f1f5f9', hoverBg: '#f8fafc', activeBg: '#f0fdf4', itemText: '#0f172a' };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: D.btn, border: `1px solid ${D.btnBorder}`, borderRadius: '0.5rem', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: D.btnText, maxWidth: '16rem' }}>
        <Building2 size={14} color="#10b981" />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{activeLab.name}</span>
        <ChevronDown size={13} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, background: D.drop, border: `1px solid ${D.dropBorder}`, borderRadius: '0.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', width: '18rem', zIndex: 1000, overflow: 'hidden' }}>
          {/* Matriz section header */}
          <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', background: D.sectionBg, borderBottom: `1px solid ${D.sectionBorder}` }}>
            {t.portal.labSwitcher.matriz}
          </div>
          {labs.filter(l => l.type === 'matriz').map(lab => (
            <button key={lab.id} onClick={() => { setActiveLab(lab); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.625rem 1rem', background: activeLab.id === lab.id ? D.activeBg : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { if (activeLab.id !== lab.id) e.currentTarget.style.background = D.hoverBg; }}
              onMouseLeave={e => { if (activeLab.id !== lab.id) e.currentTarget.style.background = 'transparent'; }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: D.itemText }}>{lab.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{lab.city}</div>
              </div>
              {activeLab.id === lab.id && <CheckCircle2 size={15} color="#10b981" />}
            </button>
          ))}

          {/* Branches section header */}
          <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', background: D.sectionBg, borderTop: `1px solid ${D.sectionBorder}`, borderBottom: `1px solid ${D.sectionBorder}` }}>
            {t.portal.labSwitcher.branches}
          </div>
          {labs.filter(l => l.type === 'filial').map(lab => (
            <button key={lab.id} onClick={() => { setActiveLab(lab); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.625rem 1rem', background: activeLab.id === lab.id ? D.activeBg : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', opacity: lab.active ? 1 : 0.5 }}
              onMouseEnter={e => { if (activeLab.id !== lab.id) e.currentTarget.style.background = D.hoverBg; }}
              onMouseLeave={e => { if (activeLab.id !== lab.id) e.currentTarget.style.background = 'transparent'; }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: D.itemText }}>{lab.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{lab.city}{!lab.active && ` — ${t.portal.labSwitcher.inactive}`}</div>
              </div>
              {activeLab.id === lab.id && <CheckCircle2 size={15} color="#10b981" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Language Switcher ────────────────────────────────────────────────────────
function LangSwitcher({ lang, setLang, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const C = isDark
    ? { bg: '#1e293b', border: '#334155', text: '#f1f5f9', hover: '#334155' }
    : { bg: '#ffffff',  border: '#e2e8f0', text: '#0f172a', hover: '#f8fafc' };

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const LANGS = [{ code: 'pt', label: 'Português' }, { code: 'en', label: 'English' }, { code: 'es', label: 'Español' }];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: isDark ? '#1e293b' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0.5rem', padding: '0.375rem 0.625rem', cursor: 'pointer', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = '#10b981'; }}
        onMouseLeave={e => { e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b'; e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0'; }}>
        <Globe size={15} />
        <span>{lang.toUpperCase()}</span>
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 0.4rem)', right: 0, background: C.bg, border: `1px solid ${C.border}`, borderRadius: '0.625rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 1000, minWidth: '7.5rem' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              style={{ display: 'block', width: '100%', padding: '0.5rem 0.875rem', textAlign: 'left', background: lang === l.code ? (isDark ? '#0d2b1f' : '#f0fdf4') : 'transparent', color: lang === l.code ? '#10b981' : C.text, fontWeight: lang === l.code ? 700 : 500, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = C.hover; }}
              onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent'; }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inner portal (needs context) ─────────────────────────────────────────────
function PortalInner({ onLogout, t, lang, setLang, activeTab, onNavigate }) {
  const { currentUser, isDark, toggleDark, isProducer, isPremium, labsLoading, activeLab } = useLab();
  const [activeClient, setActiveClient] = useState(null);
  const C = useLabTheme();

  const handleSetTab = (tab) => { onNavigate(tab); setActiveClient(null); };

  // Show loading while labs are loading (prevents null access crashes)
  if (labsLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #1e293b', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Carregando portal...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <LabDashboard t={t} onViewDetails={() => handleSetTab('detail')} />;
      case 'import':    return <LabImport t={t} />;
      case 'samples':   return <LabSamples t={t} onViewDetails={() => handleSetTab('detail')} />;
      case 'detail':    return <LabSampleDetail t={t} onBack={() => handleSetTab('samples')} />;
      case 'branches':  return <LabBranches t={t} />;
      case 'employees': return <LabEmployees t={t} />;
      case 'usuarios':  return <LabUsers t={t} />;
      case 'clients':
        return activeClient
          ? <LabClientProfile client={activeClient} onBack={() => setActiveClient(null)} onViewDetail={() => handleSetTab('detail')} t={t} />
          : <LabClients onViewProfile={setActiveClient} t={t} />;
      default: return <LabDashboard t={t} onViewDetails={() => handleSetTab('detail')} />;
    }
  };

  const pageTitles = {
    dashboard: t.portal.dashboard.title,
    import:    t.portal.import.title,
    samples:   t.portal.sidebar.samples,
    detail:    t.portal.sidebar.samples,
    branches:  t.portal.branches.title,
    employees: t.portal.employees.title,
    usuarios:  'Usuários',
    clients:   activeClient ? activeClient.name : t.portal.clients.title,
  };

  const pageSubtitles = {
    dashboard: t.portal.dashboard.subtitle,
    import:    t.portal.import.subtitle,
    samples:   t.portal.dashboard.recentSamplesText,
    detail:    t.portal.detail.subtitle,
    branches:  t.portal.branches.subtitle,
    employees: `${t.portal.employees.registered}`,
    usuarios:  'Gerencie os usuários do sistema',
    clients:   activeClient ? t.portal.clients.historySubtitle : t.portal.clients.registered,
  };

  // Build nav sections based on user role and plan
  const buildNavSections = () => {
    // Producers see limited nav (only dashboard + samples)
    if (isProducer) {
      return [{
        label: t.portal.sidebar.sectionMain,
        items: [
          { id: 'dashboard', icon: LayoutDashboard, label: t.portal.sidebar.dashboard },
          { id: 'samples',   icon: FileSpreadsheet, label: t.portal.sidebar.samples },
        ],
      }];
    }

    const mainItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: t.portal.sidebar.dashboard },
      { id: 'import',    icon: Upload,          label: t.portal.sidebar.importSample },
      { id: 'samples',   icon: FileSpreadsheet, label: t.portal.sidebar.samples },
    ];

    const manageItems = [];
    // Only show Filiais for premium labs
    if (isPremium) {
      manageItems.push({ id: 'branches',  icon: Building2,   label: t.portal.sidebar.branches });
    }
    manageItems.push({ id: 'usuarios',  icon: Users,       label: 'Usuários' });
    manageItems.push({ id: 'employees', icon: Users,       label: t.portal.sidebar.employees });
    manageItems.push({ id: 'clients',   icon: FlaskConical, label: t.portal.sidebar.clients });

    return [
      { label: t.portal.sidebar.sectionMain, items: mainItems },
      { label: t.portal.sidebar.sectionManage, items: manageItems },
    ];
  };

  const navSections = buildNavSections();

  const SIDEBAR_W = 260;
  const HEADER_H  = 73;

  // Permission label via locales
  const permLabel = t.portal.permissions?.[currentUser.permission] ?? currentUser.permission;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar ─── */}
      <div style={{ width: SIDEBAR_W, minWidth: SIDEBAR_W, height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a', borderRight: '1px solid #1e293b', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem', flexShrink: 0, borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }} onClick={() => { window.location.hash = 'landing'; onLogout(); }}>          
            <div style={{ background: '#10b981', padding: '0.375rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem', lineHeight: 1.25 }}>AgroGemini</div>
              <div style={{ color: '#64748b', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{t.nav.labPortal}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {navSections.map(section => (
            <div key={section.label}>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.375rem' }}>{section.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {section.items.map(({ id, icon: Icon, label }) => {
                  const isActive = activeTab === id || (activeTab === 'detail' && id === 'samples') || (activeClient && activeTab === 'clients' && id === 'clients');
                  return (
                    <button key={id} onClick={() => handleSetTab(id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s', background: isActive ? '#10b981' : 'transparent', color: isActive ? 'white' : '#94a3b8' }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = 'white'; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}>
                      <Icon size={16} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '9999px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>{currentUser.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{permLabel}</div>
            </div>
            <button onClick={onLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.25rem', display: 'flex' }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─── */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', background: C.bg }}>

        {/* Header */}
        <div style={{ height: HEADER_H, minHeight: HEADER_H, maxHeight: HEADER_H, background: C.header, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.75rem', flexShrink: 0, boxSizing: 'border-box', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: C.text, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitles[activeTab]}</div>
              <div style={{ fontSize: '0.75rem', color: C.textMuted, marginTop: '0.1rem' }}>{pageSubtitles[activeTab]}</div>
            </div>
            <LabSwitcher t={t} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={14} />
              <input type="text" placeholder={t.portal.topbar.searchPlaceholder}
                style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', fontSize: '0.8125rem', outline: 'none', background: C.inputBg, color: C.text, width: '11rem', boxSizing: 'border-box' }} />
            </div>

            {/* Language switcher */}
            <LangSwitcher lang={lang} setLang={setLang} isDark={isDark} />

            {/* Dark mode toggle */}
            <button onClick={toggleDark}
              style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = '#10b981'; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Bell */}
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', color: C.textMuted }}>
              <Bell size={19} />
              <span style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', width: '0.45rem', height: '0.45rem', background: '#ef4444', borderRadius: '9999px', border: `1.5px solid ${C.header}`, display: 'block' }} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', boxSizing: 'border-box', minHeight: 0, background: C.bg }}>
          {renderContent()}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export function LabPortal({ onLogout, t, lang, setLang, activeTab, onNavigate }) {
  return (
    <LabProvider>
      <PortalInner 
        onLogout={onLogout} 
        t={t} 
        lang={lang} 
        setLang={setLang} 
        activeTab={activeTab}
        onNavigate={onNavigate}
      />
    </LabProvider>
  );
}
