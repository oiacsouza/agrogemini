// ── Amostras ──────────────────────────────────────────────────────────────
export const mockSamples = [
  { id: 1, date: '2026-03-18', producer: 'João Silva',    initials: 'JS', producerColor: 'bg-[#10b981]', field: 'Talhão Norte',   status: 'concluido',  health: 85 },
  { id: 2, date: '2026-03-18', producer: 'Maria Santos',  initials: 'MS', producerColor: 'bg-[#10b981]', field: 'Campo Sul',       status: 'alerta',     health: 62 },
  { id: 3, date: '2026-03-17', producer: 'Pedro Costa',   initials: 'PC', producerColor: 'bg-[#10b981]', field: 'Área Central',    status: 'concluido',  health: 91 },
  { id: 4, date: '2026-03-17', producer: 'Ana Oliveira',  initials: 'AO', producerColor: 'bg-[#10b981]', field: 'Talhão Oeste',   status: 'processando',health: 78 },
  { id: 5, date: '2026-03-16', producer: 'Carlos Pereira',initials: 'CP', producerColor: 'bg-[#10b981]', field: 'Fazenda Leste',  status: 'concluido',  health: 88 },
  { id: 6, date: '2026-03-16', producer: 'Lucia Ferreira',initials: 'LF', producerColor: 'bg-[#10b981]', field: 'Propriedade A',  status: 'alerta',     health: 58 },
  { id: 7, date: '2026-03-15', producer: 'Roberto Lima',  initials: 'RL', producerColor: 'bg-[#10b981]', field: 'Área B3',        status: 'concluido',  health: 82 },
  { id: 8, date: '2026-03-15', producer: 'Helena Cruz',   initials: 'HC', producerColor: 'bg-[#10b981]', field: 'Campo Norte',    status: 'processando',health: 75 },
];

// ── Gráficos ──────────────────────────────────────────────────────────────
export const mockNutrientData = [
  { name: 'N', current: 85, optimal: 90 },
  { name: 'P', current: 72, optimal: 80 },
  { name: 'K', current: 88, optimal: 85 },
  { name: 'Ca',current: 78, optimal: 75 },
  { name: 'Mg',current: 82, optimal: 85 },
];

export const mockTrendData = [
  { month: 'Out', samples: 250, health: 78 },
  { month: 'Nov', samples: 320, health: 80 },
  { month: 'Dez', samples: 290, health: 79 },
  { month: 'Jan', samples: 360, health: 82 },
  { month: 'Fev', samples: 410, health: 84 },
  { month: 'Mar', samples: 195, health: 82 },
];

// ── Laboratórios (Matriz + Filiais) ───────────────────────────────────────
export const mockLabs = [
  { id: 'matriz',   name: 'AgroGemini Matriz',     city: 'São Paulo, SP',    type: 'matriz',  active: true  },
  { id: 'filial-1', name: 'Filial Campinas',        city: 'Campinas, SP',    type: 'filial',  active: true  },
  { id: 'filial-2', name: 'Filial Ribeirão Preto',  city: 'Ribeirão Preto, SP', type: 'filial', active: true },
  { id: 'filial-3', name: 'Filial Bauru',           city: 'Bauru, SP',       type: 'filial',  active: false },
];

// ── Clientes ──────────────────────────────────────────────────────────────
export const mockClients = [
  {
    id: 'c1', name: 'João Silva',     email: 'joao@fazendanorte.com.br',  phone: '(11) 98765-4321',
    totalReports: 12, lastReport: '2026-03-18', status: 'ativo', initials: 'JS',
    reports: [
      { id: 'r1', date: '2026-03-18', field: 'Talhão Norte',  status: 'concluido',  health: 85 },
      { id: 'r2', date: '2026-01-10', field: 'Talhão Sul',    status: 'concluido',  health: 79 },
      { id: 'r3', date: '2025-11-05', field: 'Área B2',       status: 'concluido',  health: 91 },
    ],
  },
  {
    id: 'c2', name: 'Maria Santos',   email: 'maria@camposul.agro',        phone: '(14) 99012-3456',
    totalReports: 7,  lastReport: '2026-03-18', status: 'ativo', initials: 'MS',
    reports: [
      { id: 'r4', date: '2026-03-18', field: 'Campo Sul',     status: 'alerta',     health: 62 },
      { id: 'r5', date: '2026-02-01', field: 'Lote A1',       status: 'concluido',  health: 74 },
    ],
  },
  {
    id: 'c3', name: 'Pedro Costa',    email: 'pedro@agrocentral.com',      phone: '(16) 97654-3210',
    totalReports: 5,  lastReport: '2026-03-17', status: 'ativo', initials: 'PC',
    reports: [
      { id: 'r6', date: '2026-03-17', field: 'Área Central',  status: 'concluido',  health: 91 },
    ],
  },
  {
    id: 'c4', name: 'Ana Oliveira',   email: 'ana@talhaoeste.com.br',      phone: '(17) 98888-7777',
    totalReports: 3,  lastReport: '2026-03-17', status: 'ativo', initials: 'AO',
    reports: [
      { id: 'r7', date: '2026-03-17', field: 'Talhão Oeste',  status: 'processando',health: 78 },
    ],
  },
  {
    id: 'c5', name: 'Carlos Pereira', email: 'carlos@fazendaleste.agro',   phone: '(18) 91234-5678',
    totalReports: 9,  lastReport: '2026-03-16', status: 'inativo', initials: 'CP',
    reports: [
      { id: 'r8', date: '2026-03-16', field: 'Fazenda Leste', status: 'concluido',  health: 88 },
    ],
  },
  {
    id: 'c6', name: 'Lucia Ferreira', email: 'lucia@propriedadea.com',     phone: '(11) 95555-1234',
    totalReports: 4,  lastReport: '2026-03-16', status: 'ativo', initials: 'LF',
    reports: [
      { id: 'r9', date: '2026-03-16', field: 'Propriedade A', status: 'alerta',     health: 58 },
    ],
  },
];

// ── Funcionários ──────────────────────────────────────────────────────────
export const mockEmployees = [
  { id: 'e1', name: 'Dr. Rafael Matos',    role: 'Analista Sênior',  email: 'rafael@agrogemini.com',  permission: 'admin',   status: 'ativo',   initials: 'RM' },
  { id: 'e2', name: 'Camila Rodrigues',    role: 'Técnica de Lab',   email: 'camila@agrogemini.com',  permission: 'tecnico', status: 'ativo',   initials: 'CR' },
  { id: 'e3', name: 'Fernando Lima',       role: 'Analista Júnior',  email: 'fernando@agrogemini.com',permission: 'tecnico', status: 'ativo',   initials: 'FL' },
  { id: 'e4', name: 'Beatriz Souza',       role: 'Estagiária',       email: 'beatriz@agrogemini.com', permission: 'viewer',  status: 'ativo',   initials: 'BS' },
  { id: 'e5', name: 'Marcos Andrade',      role: 'Técnico de Campo', email: 'marcos@agrogemini.com',  permission: 'tecnico', status: 'inativo', initials: 'MA' },
];

// ── Filiais ───────────────────────────────────────────────────────────────
export const mockBranches = [
  { id: 'filial-1', name: 'Filial Campinas',       city: 'Campinas',       state: 'SP', manager: 'Dr. Rafael Matos', employees: 8,  samples: 420, status: 'ativa'   },
  { id: 'filial-2', name: 'Filial Ribeirão Preto', city: 'Ribeirão Preto', state: 'SP', manager: 'Camila Rodrigues', employees: 5,  samples: 210, status: 'ativa'   },
  { id: 'filial-3', name: 'Filial Bauru',          city: 'Bauru',          state: 'SP', manager: 'Fernando Lima',    employees: 3,  samples: 95,  status: 'inativa' },
];
