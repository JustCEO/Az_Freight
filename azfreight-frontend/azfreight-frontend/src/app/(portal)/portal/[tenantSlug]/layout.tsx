'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTenantInfo, type TenantInfo } from '@/lib/api/portal';
import Loading from '@/components/loading';

const LOCALE_FLAGS: Record<string, string> = { az: 'AZ', ru: 'RU', en: 'EN' };

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    getTenantInfo(tenantSlug)
      .then(setTenant)
      .catch(() => setError('Company not found'))
      .finally(() => setLoading(false));

    const saved = localStorage.getItem('locale');
    if (saved) setLocale(saved);
  }, [tenantSlug]);

  const changeLocale = (l: string) => {
    setLocale(l);
    localStorage.setItem('locale', l);
    window.dispatchEvent(new Event('locale-changed'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Not Found</h1>
          <p className="text-slate-500">{error || 'Company portal not found'}</p>
        </div>
      </div>
    );
  }

  if (!tenant.portalEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Disabled</h1>
          <p className="text-slate-500">This company portal is currently disabled.</p>
        </div>
      </div>
    );
  }

  const themeColor = tenant.portalThemeColor || '#2563EB';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href={`/portal/${tenantSlug}`} className="flex items-center gap-3">
            {(tenant.portalLogoUrl || tenant.logoUrl) ? (
              <img
                src={tenant.portalLogoUrl || tenant.logoUrl || ''}
                alt={tenant.name}
                className="h-8 w-auto"
              />
            ) : (
              <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: themeColor }}>
                {tenant.name.charAt(0)}
              </div>
            )}
            <span className="text-lg font-bold text-slate-900 hidden sm:inline">{tenant.name}</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 text-sm">
            <Link href={`/portal/${tenantSlug}/request`} className="text-slate-600 hover:text-slate-900">
              Submit Request
            </Link>
            <Link href={`/portal/${tenantSlug}/track`} className="text-slate-600 hover:text-slate-900">
              Track
            </Link>
            {/* Переключатель языка */}
            <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
              {Object.entries(LOCALE_FLAGS).map(([key, flag]) => (
                <button
                  key={key}
                  onClick={() => changeLocale(key)}
                  className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                    locale === key
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-8">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        Powered by AzFreight
      </footer>
    </div>
  );
}
