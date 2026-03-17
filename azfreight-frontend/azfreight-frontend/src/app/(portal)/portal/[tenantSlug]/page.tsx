'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTenantInfo, type TenantInfo } from '@/lib/api/portal';

export default function TenantLandingPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [tenant, setTenant] = useState<TenantInfo | null>(null);

  useEffect(() => {
    getTenantInfo(tenantSlug).then(setTenant).catch(() => {});
  }, [tenantSlug]);

  const themeColor = tenant?.portalThemeColor || '#2563EB';

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center max-w-2xl">
        {(tenant?.portalLogoUrl || tenant?.logoUrl) && (
          <img
            src={tenant.portalLogoUrl || tenant.logoUrl || ''}
            alt={tenant?.name || ''}
            className="h-16 w-auto mx-auto mb-6"
          />
        )}
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {tenant?.name || 'Loading...'}
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          {tenant?.portalWelcomeText || 'Your trusted logistics partner. Submit a shipment request to get started.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/portal/${tenantSlug}/request`}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white font-semibold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Submit Shipment Request
          </Link>
          <Link
            href={`/portal/${tenantSlug}/track`}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 font-semibold text-lg transition-colors hover:bg-slate-50"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Track Shipment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
        {[
          { title: 'Road / TIR', desc: 'International road transport with TIR carnet coverage' },
          { title: 'Sea Freight', desc: 'Container and bulk sea freight worldwide' },
          { title: 'Air Freight', desc: 'Express and standard air cargo services' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
