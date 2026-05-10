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

  useEffect(() => {
    const click = (e) => { if (open && !ref.current?.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', click);
    return () => window.removeEventListener('mousedown', click);
  }, [open]);

  if (!labs.length) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          background: isDark ? '#1e293b' : '#f8fafc',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '0.5rem', padding: '0.45rem 0.75rem',
          cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
        }}
      >
        <Building2 size={16} color="#10b981" />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
          {activeLab?.name || t.portal.header.selectLab}
        </span>
        <ChevronDown size={14} color="#94a3b8" />
      </button>
      
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
          width: '16rem', background: isDark ? '#1e293b' : '#fff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          zIndex: 50, overflow: 'hidden', padding: '0.375rem'
        }}>
          {labs.map(lab => (
            <button
              key={lab.id}
              onClick={() => { setActiveLab(lab); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: 'none',
                background: activeLab?.id === lab.id ? (isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4') : 'transparent',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
              }}
            >
              <div style={{ width: '2.25rem', height: '2.25rem', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} color="#10b981" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>{lab.name}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{lab.city}</div>
              </div>
              {activeLab?.id === lab.id && <CheckCircle2 size={14} color="#10b981" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inner portal (needs context) ─────────────────────────────────────────────
function PortalInner({ onLogout, t, lang, setLang, activeTab, onNavigate }) {
  const {
    currentUser,
    isDark,
    toggleDark,
    isProducer,
    labsLoading,
    activeLab,
  } = useLab();
  const [activeClient, setActiveClient] = useState(null);
  const C = useLabTheme();

  const handleSetTab = (tab) => { onNavigate(tab); setActiveClient(null); };

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

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.portal.menu.dashboard },
    { id: 'import',    icon: Upload,          label: t.portal.menu.import },
    { id: 'samples',   icon: FileSpreadsheet, label: t.portal.menu.samples },
    { id: 'clients',   icon: FlaskConical,    label: t.portal.menu.clients },
    { id: 'employees', icon: Users,           label: t.portal.menu.employees },
    { id: 'branches',  icon: Building2,       label: t.portal.menu.branches },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside style={{ width: '17rem', background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>
            <Leaf color="white" size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: C.text }}>AgroGemini</span>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: C.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0 0.5rem 0.75rem' }}>Menu principal</div>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSetTab(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.875rem', borderRadius: '0.625rem', border: 'none',
                background: activeTab === item.id ? (isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4') : 'transparent',
                color: activeTab === item.id ? '#10b981' : C.textSecondary,
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.875rem'
              }}
            >
              <item.icon size={18} />
              {item.label}
              {activeTab === item.id && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} />}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.75rem', background: C.bgAlt }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
              {currentUser.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.6875rem', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.role}</div>
            </div>
            <button onClick={onLogout} style={{ padding: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '5rem', background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             {!isProducer && <LabSwitcher t={t} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
              <input placeholder={t.portal.header.search} style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', border: `1px solid ${C.border}`, borderRadius: '0.625rem', background: C.bgAlt, color: C.text, fontSize: '0.875rem', outline: 'none', width: '16rem' }} />
            </div>

            <button 
              onClick={() => {
                const nextLang = lang === 'pt' ? 'en' : lang === 'en' ? 'es' : 'pt';
                setLang(nextLang);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Globe size={15} /> {lang.toUpperCase()}
            </button>

            <button onClick={toggleDark} style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.625rem', border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, cursor: 'pointer' }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ position: 'relative' }}>
              <button style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.625rem', border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, cursor: 'pointer' }}>
                <Bell size={18} />
              </button>
              <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '0.5rem', height: '0.5rem', background: '#ef4444', borderRadius: '50%', border: `2px solid ${C.surface}` }} />
            </div>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            {activeTab === 'dashboard' && <LabDashboard t={t} onNavigate={handleSetTab} />}
            {activeTab === 'import'    && <LabImport t={t} />}
            {activeTab === 'samples'   && <LabSamples t={t} onViewDetail={() => handleSetTab('sample-detail')} />}
            {activeTab === 'sample-detail' && <LabSampleDetail t={t} />}
            {activeTab === 'clients'   && <LabClients t={t} onViewProfile={(cl) => { setActiveClient(cl); handleSetTab('client-profile'); }} />}
            {activeTab === 'client-profile' && <LabClientProfile client={activeClient} t={t} onBack={() => handleSetTab('clients')} />}
            {activeTab === 'employees' && <LabEmployees t={t} />}
            {activeTab === 'branches'  && <LabBranches t={t} />}
            {activeTab === 'users'     && <LabUsers t={t} />}
          </div>
        </main>
      </div>
      <ToastContainer isDark={isDark} />
    </div>
  );
}

// ── Wrapper (mount context) ──────────────────────────────────────────────────
export function LabPortal(props) {
  return (
    <LabProvider>
      <PortalInner {...props} />
    </LabProvider>
  );
}
