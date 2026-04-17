'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '@/lib/api/auth';
import { clearTokens, isAuthenticated } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { tenantName: string; tenantSlug: string; name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    getMe()
      .then((u) => {
        setUser(u);
        if (u.preferredLocale) {
          localStorage.setItem('locale', u.preferredLocale);
          window.dispatchEvent(new Event('locale-changed'));
        }
      })
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setUser(res.user);
    if (res.user.preferredLocale) {
      localStorage.setItem('locale', res.user.preferredLocale);
      window.dispatchEvent(new Event('locale-changed'));
    }
  }, []);

  const register = useCallback(async (data: { tenantName: string; tenantSlug: string; name: string; email: string; password: string }) => {
    const res = await apiRegister(data);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearTokens();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
