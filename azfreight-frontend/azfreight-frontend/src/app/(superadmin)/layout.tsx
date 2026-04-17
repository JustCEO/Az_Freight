'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, clearTokens } from '@/lib/api-client';
import { getMe } from '@/lib/api/auth';
import { useTenantSwitch } from '@/context/tenant-switch-context';
import { useTranslation } from '@/lib/i18n';

interface TenantSummary { id: string; name: string; slug: string; isActive: boolean; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function fetchTenants(): Promise<TenantSummary[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token) return [];
  const res = await fetch(`${API_URL}/superadmin/tenants`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  return res.json();
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { activeTenantId, activeTenantName, switchTenant, clearSwitch } = useTenantSwitch();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [showTenantPicker, setShowTenantPicker] = useState(false);

  useEffect(() => {
    if (pathname === '/superadmin/login') {
      setLoading(false);
      setAuthenticated(false);
      return;
    }
    const token = getToken();
    if (!token) { router.replace('/superadmin/login'); return; }

    getMe()
      .then((user) => {
        if ((user as unknown as { role: string }).role !== 'superadmin') {
          clearTokens(); router.replace('/superadmin/login');
        } else {
          setAuthenticated(true);
          fetchTenants().then(setTenants);
        }
      })
      .catch(() => { clearTokens(); router.replace('/superadmin/login'); })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (pathname === '/superadmin/login') return <>{children}</>;
  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100"><div className="text-gray-500 text-lg">{t('common.loading')}</div></div>;
  if (!authenticated) return null;

  const handleLogout = () => { clearSwitch(); clearTokens(); router.replace('/superadmin/login'); };

  const handleViewAsTenant = (tenant: TenantSummary) => {
    switchTenant(tenant.id, tenant.name);
    setShowTenantPicker(false);
    router.push('/dashboard');
  };

  const navItems = [
    { label: t('superadmin.dashboard'), href: '/superadmin/dashboard', icon: '📊' },
    { label: t('superadmin.tenants'), href: '/superadmin/tenants', icon: '🏢' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-wide">AzFreight</h1>
          <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tenant Switcher */}
        <div className="px-4 py-3 border-t border-gray-700">
          <button
            onClick={() => setShowTenantPicker(!showTenantPicker)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🔄</span>
            <span className="flex-1 text-left truncate">
              {activeTenantId ? activeTenantName : t('superadmin.switchTenant')}
            </span>
          </button>
          {showTenantPicker && (
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
              {activeTenantId && (
                <button onClick={() => { clearSwitch(); setShowTenantPicker(false); }} className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-gray-800 rounded">
                  ✕ {t('superadmin.exitTenantView')}
                </button>
              )}
              {tenants.filter((t) => t.isActive).map((tenant) => (
                <button key={tenant.id} onClick={() => handleViewAsTenant(tenant)} className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-800 ${activeTenantId === tenant.id ? 'text-blue-400 bg-gray-800' : 'text-gray-400'}`}>
                  {tenant.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <span>🚪</span><span>{t('auth.signIn') === 'Sign in' ? 'Logout' : 'Выйти'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {activeTenantId && (
          <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium px-4 py-3 rounded-lg">
            <span>{t('superadmin.viewingAs')}: <strong>{activeTenantName}</strong></span>
            <button onClick={() => { clearSwitch(); router.push('/superadmin/dashboard'); }} className="text-amber-700 hover:text-amber-900 font-medium underline">
              {t('superadmin.exitTenantView')}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
