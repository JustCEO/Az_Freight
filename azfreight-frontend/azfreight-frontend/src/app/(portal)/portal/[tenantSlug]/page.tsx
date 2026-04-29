'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTenantInfo, type TenantInfo } from '@/lib/api/portal';
import { useTranslation } from '@/lib/i18n';

export default function TenantLandingPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getTenantInfo(tenantSlug).then(setTenant).catch(() => {});
  }, [tenantSlug]);

  const themeColor = tenant?.portalThemeColor || '#2563EB';

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero секция с градиентом */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center py-20 px-4 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 50%, ${themeColor}99 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Лого или иконка */}
          {(tenant?.portalLogoUrl || tenant?.logoUrl) ? (
            <img
              src={tenant.portalLogoUrl || tenant.logoUrl || ''}
              alt={tenant?.name || ''}
              className="h-20 w-auto mx-auto mb-8 drop-shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-sm">
            {tenant?.name || t('common.loading')}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-12 leading-relaxed">
            {tenant?.portalWelcomeText || t('portal.welcomeDefault')}
          </p>

          {/* Two paths: new request + existing client login */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-2">{t('portalAuth.submitRequest')}</h2>
              <p className="text-sm text-white/70 mb-4">{t('portalAuth.submitRequestDesc')}</p>
              <Link
                href={`/portal/${tenantSlug}/request`}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-white font-bold text-sm transition-all hover:scale-105 shadow-lg"
                style={{ color: themeColor }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {t('portal.submitRequest')}
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-2">{t('portalAuth.clientLogin')}</h2>
              <p className="text-sm text-white/70 mb-4">{t('portalAuth.clientLoginDesc')}</p>
              <Link
                href={`/portal/${tenantSlug}/login`}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-white/20 text-white font-bold text-sm border border-white/30 transition-all hover:bg-white/30 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                {t('portalAuth.clientLogin')}
              </Link>
            </div>
          </div>

          <Link
            href={`/portal/${tenantSlug}/track`}
            className="inline-flex items-center justify-center gap-3 px-8 py-3 rounded-xl bg-white/15 backdrop-blur-sm text-white font-medium text-sm border border-white/30 transition-all hover:bg-white/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {t('portal.trackShipment')}
          </Link>
        </div>
      </div>
    </div>
  );
}
