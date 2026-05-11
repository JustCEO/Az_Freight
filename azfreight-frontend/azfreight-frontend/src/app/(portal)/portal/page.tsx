'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export default function PortalPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [hasToken, setHasToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('portalToken');
    if (token) {
      setHasToken(true);
      router.replace('/portal/shipments');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking && hasToken) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C6.5 3 2 6.5 2 6.5L5 18h14l3-11.5S17.5 3 12 3zM2 21h20M7 18v3M17 18v3" />
          </svg>
          <h1 className="text-2xl font-bold text-slate-900">AzFreight</h1>
          <p className="text-slate-500 mt-1">{t('portalAuth.clientPortal') === 'portalAuth.clientPortal' ? 'Client Portal' : t('portalAuth.clientPortal')}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-4">
            To access the client portal, use the link provided by your logistics company. The URL format is:
          </p>
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm font-mono text-slate-700 mb-4">
            /portal/<span className="text-blue-600">your-company</span>
          </div>
          <p className="text-xs text-slate-400">
            If you received a magic link via email, click it to sign in automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
