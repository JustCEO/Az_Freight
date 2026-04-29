'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User } from '@/types';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '@/lib/api/auth';
import { clearTokens, isAuthenticated } from '@/lib/api-client';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const doLogout = useCallback(() => {
    clearTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isAuthenticated()) {
      timeoutRef.current = setTimeout(doLogout, SESSION_TIMEOUT_MS);
    }
  }, [doLogout]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    resetTimer();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

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

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setUser(res.user);
    resetTimer();
    if (res.user.preferredLocale) {
      localStorage.setItem('locale', res.user.preferredLocale);
      window.dispatchEvent(new Event('locale-changed'));
    }
  }, [resetTimer]);

  const register = useCallback(async (data: { tenantName: string; tenantSlug: string; name: string; email: string; password: string }) => {
    const res = await apiRegister(data);
    setUser(res.user);
    resetTimer();
  }, [resetTimer]);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    doLogout();
  }, [doLogout]);

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
