// ─────────────────────────────────────────────────────────────────────────────
// Farmer Portal – centralised mock data & shared constants
// ─────────────────────────────────────────────────────────────────────────────

/** All possible report statuses. */
export const REPORT_STATUS = /** @type {const} */ ({
  ANALISADO:  'analisado',
  ATUALIZADO: 'atualizado',
  PENDENTE:   'pendente',
});

/**
 * Visual config for each status key.
 * `label` is the PT fallback – components should prefer t.farmerPortal.status[key].
 */
export const STATUS_CONFIG = {
  analisado:  { bg: '#dcfce7', color: '#16a34a', darkBg: '#14532d30', darkColor: '#4ade80' },
  atualizado: { bg: '#dbeafe', color: '#2563eb', darkBg: '#1e3a5f30', darkColor: '#60a5fa' },
  pendente:   { bg: '#fef9c3', color: '#ca8a04', darkBg: '#4a3a0030', darkColor: '#facc15' },
};

/** Nutrient bar color palette. */
export const NUTRIENT_COLORS = {
  fosforo:  '#ef4444',
  potassio: '#f97316',
  calcio:   '#eab308',
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock farms & reports list
// ─────────────────────────────────────────────────────────────────────────────
export const mockFarms = [
  {
    id: 'farm1',
    name: 'Fazenda Santa Maria',
    expanded: true,
    reports: [
      { id: 'r1', title: 'Análise Solo – Talhão Norte', date: '15 Mar 2026', time: '09:30', field: 'Talhão A1', status: 'analisado'  },
      { id: 'r2', title: 'Análise Solo – Talhão Sul',   date: '14 Mar 2026', time: '14:15', field: 'Talhão B2', status: 'analisado'  },
      { id: 'r3', title: 'Análise Solo – Área Oeste',   date: '12 Mar 2026', time: '11:00', field: 'Talhão C3', status: 'atualizado' },
    ],
  },
  {
    id: 'farm2',
    name: 'Fazenda Boa Esperança',
    expanded: true,
    reports: [
      { id: 'r4', title: 'Análise Solo – Safra 2026',     date: '10 Mar 2026', time: '08:45', field: 'Talhão D1', status: 'analisado' },
      { id: 'r5', title: 'Análise Solo – Plantio Direto', date: '08 Mar 2026', time: '16:20', field: 'Talhão E2', status: 'pendente'  },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock report detail
// ─────────────────────────────────────────────────────────────────────────────
export const mockReportDetail = {
  id: 'r1',
  farmName: 'Fazenda Santa Maria',
  field: 'Talhão A1',
  date: '15 Mar 2026',
  score: 78,
  scorePct: 78,

  ph: 5.8,
  nutrients: 72,
  organic: 3.2,

  limitations: ['baixoFosforo', 'requerCal'],     // keys → translated in component

  cropRecommendation: {
    name: 'Soja',
    matchPct: 92,
    descriptionKey: 'sojaDesc',                    // key → translated
  },

  correctionPlan: [
    { titleKey: 'calTitle',   descKey: 'calDesc'   },
    { titleKey: 'gypTitle',   descKey: 'gypDesc'   },
    { titleKey: 'fertTitle',  descKey: 'fertDesc'  },
  ],

  nutrientBars: [
    { nameKey: 'fosforo',  current: 45, max: 85, color: NUTRIENT_COLORS.fosforo  },
    { nameKey: 'potassio', current: 68, max: 80, color: NUTRIENT_COLORS.potassio },
    { nameKey: 'calcio',   current: 52, max: 70, color: NUTRIENT_COLORS.calcio   },
  ],
};
