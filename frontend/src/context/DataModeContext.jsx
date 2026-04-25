import React, { createContext, useContext, useMemo, useState } from 'react';

const DATA_MODE_STORAGE_KEY = 'agrogemini_data_mode';
const DataModeContext = createContext(null);

export function DataModeProvider({ children }) {
  const [dataMode, setDataModeState] = useState(() => {
    if (typeof window === 'undefined') return 'mock';
    const stored = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
    return stored === 'real' ? 'real' : 'mock';
  });

  const setDataMode = (nextMode) => {
    const normalized = nextMode === 'real' ? 'real' : 'mock';
    setDataModeState(normalized);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DATA_MODE_STORAGE_KEY, normalized);
    }
  };

  const toggleDataMode = () => {
    setDataMode(dataMode === 'mock' ? 'real' : 'mock');
  };

  const value = useMemo(() => ({
    dataMode,
    isMockMode: dataMode === 'mock',
    isRealMode: dataMode === 'real',
    setDataMode,
    toggleDataMode,
  }), [dataMode]);

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const ctx = useContext(DataModeContext);
  if (!ctx) throw new Error('useDataMode must be used inside <DataModeProvider>');
  return ctx;
}
