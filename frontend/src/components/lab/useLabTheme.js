import { useLab } from '../../context/LabContext';

export function useLabTheme() {
  const { isDark } = useLab();

  return isDark
    ? {
        // Base structure
        bg: '#020617',
        surface: '#0f172a',
        border: '#1e293b',
        header: '#0f172a',
        
        // Text
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        label: '#94a3b8',
        
        // Forms & Inputs
        inputBg: '#1e293b',
        optionBg: '#1e293b',
        selectBg: '#1e293b',
        dropBg: 'rgba(16,185,129,0.07)',
        
        // Backgrounds & Surfaces (cards, hovering rows)
        bgAlt: '#1e293b',
        trendBg: '#1e293b',
        barBg: '#1e293b',
        iconBg: '#0d2b1f',
        
        // General Buttons
        btnBg: '#1e293b',
        btnBorder: '#1e293b',
        
        // Danger action styling
        dangerBg: '#2d1515',
        dangerBorder: '#7f1d1d',
        
        // Charts and Data
        gridStroke: '#1e293b',
        tooltipBg: '#1e293b',
        tooltipBorder: '#334155',
        lineHealth: '#94a3b8',

        // LabPortal specifics
        modalOverlay: 'rgba(0,0,0,0.65)'
      }
    : {
        // Base structure
        bg: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        header: '#ffffff',
        
        // Text
        text: '#0f172a',
        textMuted: '#64748b',
        label: '#374151',
        
        // Forms & Inputs
        inputBg: '#ffffff',
        optionBg: '#ffffff',
        selectBg: '#ffffff',
        dropBg: 'rgba(16,185,129,0.04)',
        
        // Backgrounds & Surfaces (cards, hovering rows)
        bgAlt: '#f8fafc',
        trendBg: '#f1f5f9',
        barBg: '#f1f5f9',
        iconBg: '#f0fdf4',
        
        // General Buttons
        btnBg: '#f8fafc',
        btnBorder: '#e2e8f0',
        
        // Danger action styling
        dangerBg: '#fef2f2',
        dangerBorder: '#fecaca',
        
        // Charts and Data
        gridStroke: '#e2e8f0',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e2e8f0',
        lineHealth: '#0f172a',

        // LabPortal specifics
        modalOverlay: 'rgba(0,0,0,0.45)'
      };
}
