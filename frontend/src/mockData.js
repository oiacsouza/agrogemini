export const mockSamples = [
  { id: 1, date: '2026-03-18', producer: 'João Silva', initials: 'JS', producerColor: 'bg-[#10b981]', field: 'Talhão Norte', status: 'concluido', health: 85 },
  { id: 2, date: '2026-03-18', producer: 'Maria Santos', initials: 'MS', producerColor: 'bg-[#10b981]', field: 'Campo Sul', status: 'alerta', health: 62 },
  { id: 3, date: '2026-03-17', producer: 'Pedro Costa', initials: 'PC', producerColor: 'bg-[#10b981]', field: 'Área Central', status: 'concluido', health: 91 },
  { id: 4, date: '2026-03-17', producer: 'Ana Oliveira', initials: 'AO', producerColor: 'bg-[#10b981]', field: 'Talhão Oeste', status: 'processando', health: 78 },
  { id: 5, date: '2026-03-16', producer: 'Carlos Pereira', initials: 'CP', producerColor: 'bg-[#10b981]', field: 'Fazenda Leste', status: 'concluido', health: 88 },
  { id: 6, date: '2026-03-16', producer: 'Lucia Ferreira', initials: 'LF', producerColor: 'bg-[#10b981]', field: 'Propriedade A', status: 'alerta', health: 58 },
  { id: 7, date: '2026-03-15', producer: 'Roberto Lima', initials: 'RL', producerColor: 'bg-[#10b981]', field: 'Área B3', status: 'concluido', health: 82 },
  { id: 8, date: '2026-03-15', producer: 'Helena Cruz', initials: 'HC', producerColor: 'bg-[#10b981]', field: 'Campo Norte', status: 'processando', health: 75 },
];

export const mockNutrientData = [
  { name: 'N', current: 85, optimal: 90 },
  { name: 'P', current: 72, optimal: 80 },
  { name: 'K', current: 88, optimal: 85 },
  { name: 'Ca', current: 78, optimal: 75 },
  { name: 'Mg', current: 82, optimal: 85 }
];

export const mockTrendData = [
  { month: 'Oct', samples: 250, health: 78 },
  { month: 'Nov', samples: 320, health: 80 },
  { month: 'Dec', samples: 290, health: 79 },
  { month: 'Jan', samples: 360, health: 82 },
  { month: 'Feb', samples: 410, health: 84 },
  { month: 'Mar', samples: 195, health: 82 }
];
