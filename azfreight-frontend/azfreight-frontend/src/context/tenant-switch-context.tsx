'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface TenantSwitchContextValue {
  activeTenantId: string | null;
  activeTenantName: string | null;
  switchTenant: (id: string, name: string) => void;
  clearSwitch: () => void;
}

const TenantSwitchContext = createContext<TenantSwitchContextValue>({
  activeTenantId: null,
  activeTenantName: null,
  switchTenant: () => {},
  clearSwitch: () => {},
});

export function TenantSwitchProvider({ children }: { children: ReactNode }) {
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [activeTenantName, setActiveTenantName] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('activeTenantId');
    const name = localStorage.getItem('activeTenantName');
    if (id && name) {
      setActiveTenantId(id);
      setActiveTenantName(name);
    }
  }, []);

  const switchTenant = useCallback((id: string, name: string) => {
    setActiveTenantId(id);
    setActiveTenantName(name);
    localStorage.setItem('activeTenantId', id);
    localStorage.setItem('activeTenantName', name);
  }, []);

  const clearSwitch = useCallback(() => {
    setActiveTenantId(null);
    setActiveTenantName(null);
    localStorage.removeItem('activeTenantId');
    localStorage.removeItem('activeTenantName');
  }, []);

  return (
    <TenantSwitchContext.Provider value={{ activeTenantId, activeTenantName, switchTenant, clearSwitch }}>
      {children}
    </TenantSwitchContext.Provider>
  );
}

export function useTenantSwitch() {
  return useContext(TenantSwitchContext);
}
