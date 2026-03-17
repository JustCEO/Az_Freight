'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTenantInfo, type TenantInfo } from '@/lib/api/portal';
import Loading from '@/components/loading';

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantInfo(tenantSlug)
      .then(setTenant)
      .catch(() => setError('Company not found'))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

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
      <header className="bg-white border-b border-slate-200 px-8 py-4">
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
            <span className="text-lg font-bold text-slate-900">{tenant.name}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/portal/${tenantSlug}/request`} className="text-slate-600 hover:text-slate-900">
              Submit Request
            </Link>
            <Link href={`/portal/${tenantSlug}/track`} className="text-slate-600 hover:text-slate-900">
              Track Shipment
            </Link>
            <Link href={`/portal/${tenantSlug}/login`} className="text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-8">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        Powered by AzFreight
      </footer>
    </div>
  );
}
