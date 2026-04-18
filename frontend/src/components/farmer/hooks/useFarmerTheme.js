/**
 * useFarmerTheme
 * Returns a flat token object resolved for light or dark mode.
 * All farmer portal components import from here instead of hard-coding colours.
 */
export function useFarmerTheme(isDark = false) {
  return {
    // ── Surfaces ──────────────────────────────────────────────
    pageBg:       isDark ? '#0f172a' : '#f1f5f9',
    headerBg:     isDark ? '#1e293b' : '#ffffff',
    cardBg:       isDark ? '#1e293b' : '#ffffff',
    cardBorder:   isDark ? '#334155' : '#f0f0f0',
    inputBg:      isDark ? '#0f172a' : '#f9fafb',
    inputBorder:  isDark ? '#334155' : '#e5e7eb',

    // ── Text ──────────────────────────────────────────────────
    textPrimary:  isDark ? '#f1f5f9' : '#111827',
    textSecondary:isDark ? '#94a3b8' : '#6b7280',
    textMuted:    isDark ? '#64748b' : '#9ca3af',

    // ── Brand / Accent ─────────────────────────────────────────
    green:        '#16a34a',
    greenLight:   isDark ? '#14532d' : '#f0fdf4',
    greenBorder:  isDark ? '#166534' : '#bbf7d0',
    greenText:    isDark ? '#4ade80' : '#16a34a',

    // ── Dividers / Shadows ─────────────────────────────────────
    divider:      isDark ? '#1e293b' : '#f3f4f6',
    shadow:       isDark ? '0 1px 6px rgba(0,0,0,0.4)' : '0 1px 6px rgba(0,0,0,0.06)',
    headerShadow: isDark ? '0 1px 0 #1e293b' : '0 1px 0 #f0f0f0',

    // ── Farm row ───────────────────────────────────────────────
    farmRowBg:    isDark ? '#14532d22' : '#f0fdf4',
    farmRowBorder:isDark ? '#166534'   : '#bbf7d0',

    // ── Hero gradient (detail screen) ──────────────────────────
    heroBg: 'linear-gradient(145deg, #16a34a 0%, #15803d 60%, #166534 100%)',

    // ── Insight chips ──────────────────────────────────────────
    chipPh:       { bg: isDark ? '#0c2a3f' : '#f0f9ff', text: isDark ? '#60a5fa' : '#0369a1' },
    chipNutr:     { bg: isDark ? '#052e16' : '#f0fdf4', text: isDark ? '#4ade80' : '#15803d' },
    chipOrg:      { bg: isDark ? '#3a1a00' : '#fff7ed', text: isDark ? '#fb923c' : '#c2410c' },

    // ── Limitation box ─────────────────────────────────────────
    limitBg:      isDark ? '#3a2000' : '#fffbeb',
    limitBorder:  isDark ? '#92400e' : '#fde68a',
    limitText:    isDark ? '#fbbf24' : '#92400e',
    limitDot:     isDark ? '#fbbf24' : '#d97706',

    // ── Crop rec card ──────────────────────────────────────────
    cropBg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',

    // ── Bottom bar ─────────────────────────────────────────────
    bottomBarBg: isDark
      ? 'linear-gradient(to top, #0f172a 80%, transparent)'
      : 'linear-gradient(to top, #fff 80%, transparent)',
  };
}
