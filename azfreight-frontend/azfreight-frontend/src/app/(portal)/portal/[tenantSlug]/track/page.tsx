'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const STATUS_COLORS: Record<string, string> = {
  request: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-amber-100 text-amber-700',
  customs: 'bg-orange-100 text-orange-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};


interface TrackResult {
  id: string;
  referenceNumber: string;
  status: string;
  transportType: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  eta: string | null;
  createdAt: string;
  customStatus?: { id: string; name: string; color: string } | null;
  customStatusNote?: string | null;
  statusLogs: {
    id: string;
    oldStatus: string;
    newStatus: string;
    comment: string | null;
    createdAt: string;
  }[];
}

export default function TrackPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError(t('tracking.enterNumber'));
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/public/${tenantSlug}/track?ref=${encodeURIComponent(trackingNumber.trim())}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: t('tracking.notFound') }));
        throw new Error(err.message);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tracking.notFound'));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">{t('tracking.title')}</h1>

      {/* Форма поиска */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('tracking.referenceNumber')}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => { setTrackingNumber(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder={t('tracking.placeholder')}
            className="input-field flex-1"
          />
          <button onClick={handleTrack} disabled={loading} className="btn-primary whitespace-nowrap disabled:opacity-50">
            {loading ? t('common.loading') : t('tracking.trackButton')}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* Результат */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Карточка отправки */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{result.referenceNumber}</h2>
              <div className="flex items-center gap-2">
                {result.customStatus ? (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: result.customStatus.color }}
                  >
                    {result.customStatus.name}
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[result.status] || 'bg-slate-100 text-slate-600'}`}>
                    {t('statuses.' + result.status)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Маршрут */}
              <div>
                <dt className="text-slate-500 mb-1">{t('tracking.route')}</dt>
                <dd className="font-medium text-slate-900">
                  {result.originCity}, {result.originCountry} → {result.destinationCity}, {result.destinationCountry}
                </dd>
              </div>

              {/* Тип транспорта */}
              <div>
                <dt className="text-slate-500 mb-1">{t('tracking.type')}</dt>
                <dd className="font-medium text-slate-900">
                  {t('transport.' + result.transportType)}
                </dd>
              </div>

              {/* ETA */}
              {result.eta && (
                <div>
                  <dt className="text-slate-500 mb-1">{t('tracking.eta')}</dt>
                  <dd className="font-medium text-slate-900">{new Date(result.eta).toLocaleDateString()}</dd>
                </div>
              )}

              {/* Дата создания */}
              <div>
                <dt className="text-slate-500 mb-1">{t('shipmentsList.created')}</dt>
                <dd className="font-medium text-slate-900">{new Date(result.createdAt).toLocaleDateString()}</dd>
              </div>
            </div>

            {result.customStatusNote && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">{result.customStatusNote}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {result.statusLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('tracking.timeline')}</h3>
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />
                <div className="space-y-4">
                  {result.statusLogs.map((entry) => (
                    <div key={entry.id} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.oldStatus] || 'bg-slate-100 text-slate-600'}`}>
                            {t('statuses.' + entry.oldStatus)}
                          </span>
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.newStatus] || 'bg-slate-100 text-slate-600'}`}>
                            {t('statuses.' + entry.newStatus)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                        {entry.comment && <p className="text-sm text-slate-600 mt-1">{entry.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
