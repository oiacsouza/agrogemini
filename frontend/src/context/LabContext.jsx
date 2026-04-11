import React, { createContext, useContext, useState } from 'react';
import { mockLabs, mockSamples } from '../mockData';

const LabContext = createContext(null);

// Per-lab dashboard stats (simulate different data per unit)
const labStats = {
  'matriz':   { total: '1,802', processed: 23, pending: 4,  health: 82 },
  'filial-1': { total: '420',   processed: 11, pending: 2,  health: 79 },
  'filial-2': { total: '210',   processed: 6,  pending: 1,  health: 88 },
  'filial-3': { total: '95',    processed: 2,  pending: 3,  health: 71 },
};

// Per-lab samples (first N from mockSamples, different slice per lab)
const labSampleSlices = {
  'matriz':   mockSamples,
  'filial-1': mockSamples.slice(0, 4),
  'filial-2': mockSamples.slice(2, 6),
  'filial-3': mockSamples.slice(4, 8),
};

export function LabProvider({ children }) {
  const [activeLab, setActiveLabState] = useState(() => {
    try {
      const stored = sessionStorage.getItem('activeLab');
      return stored ? JSON.parse(stored) : mockLabs[0];
    } catch {
      return mockLabs[0];
    }
  });

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const [currentUser] = useState({
    name: 'Dr. Rafael Matos',
    initials: 'RM',
    role: 'Analista Sênior',
    permission: 'admin',
  });

  const setActiveLab = (lab) => {
    setActiveLabState(lab);
    try { sessionStorage.setItem('activeLab', JSON.stringify(lab)); } catch { /* ignore */ }
  };

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  const activeStats   = labStats[activeLab.id]   ?? labStats['matriz'];
  const activeSamples = labSampleSlices[activeLab.id] ?? mockSamples;

  return (
    <LabContext.Provider value={{
      activeLab, setActiveLab,
      labs: mockLabs,
      currentUser,
      isDark, toggleDark,
      activeStats,
      activeSamples,
    }}>
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used inside <LabProvider>');
  return ctx;
}
