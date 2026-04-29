'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function PortalLoginPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const tenantSlug = params.tenantSlug as string;
  const tokenParam = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [verifying, setVerifying] = useState(!!tokenParam);

  useEffect(() => {
    if (!tokenParam) return;
    setVerifying(true);
    fetch(`${API_URL}/portal/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenParam }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || 'Token invalid');
        const data = await res.json();
        localStorage.setItem('portalToken', data.accessToken);
        localStorage.setItem('portalClient', JSON.stringify(data.client));
        router.push(`/portal/shipments`);
      })
      .catch((err) => {
        setError(err.message || t('portalAuth.linkExpired'));
        setVerifying(false);
      });
  }, [tokenParam, router, t]);

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/portal/auth/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSlug, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed');
      }
      setLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">{t('portalAuth.loginTitle')}</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {linkSent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-sm text-slate-700">{t('portalAuth.linkSent')}</p>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">{t('portalAuth.enterEmail')}</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-full" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? t('common.loading') : t('portalAuth.sendLink')}
            </button>
          </form>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-4 text-center">
        <Link href={`/portal/${tenantSlug}/request`} className="text-blue-600 hover:text-blue-800">
          {t('portalAuth.submitRequest')}
        </Link>
      </p>
    </div>
  );
}
