'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listShipments } from '@/lib/api/shipments';
import { get } from '@/lib/api-client';
import type { Shipment, ShipmentStatus } from '@/types';
import StatusBadge from '@/components/status-badge';
import { TRANSPORT_LABELS } from '@/lib/constants';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

const STATUS_CARD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  request: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_transit: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  customs: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUS_ORDER: ShipmentStatus[] = ['request', 'confirmed', 'in_transit', 'customs', 'delivered', 'cancelled'];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<{ code: string; rate: number }[]>([]);
  const [ratesDate, setRatesDate] = useState('');

  useEffect(() => {
    get<{ date: string; rates: { code: string; name: string; rate: number }[] }>('/cbar/rates')
      .then((res) => {
        setRatesDate(res.date);
        setRates(res.rates.filter((r) => ['USD', 'EUR', 'RUB', 'TRY', 'GBP', 'GEL'].includes(r.code)));
      })
      .catch(() => {});
    listShipments({ limit: 1000 })
      .then((res) => setShipments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const counts: Record<string, number> = {};
  STATUS_ORDER.forEach((s) => (counts[s] = 0));
  shipments.forEach((s) => {
    counts[s.status] = (counts[s.status] || 0) + 1;
  });

  const recent = [...shipments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {STATUS_ORDER.map((status) => {
          const style = STATUS_CARD_STYLES[status];
          return (
            <div key={status} className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
              <div className={`text-2xl font-bold ${style.text}`}>{counts[status]}</div>
              <div className="text-sm text-slate-500 mt-1">{t('statuses.' + status)}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.recentShipments')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('dashboard.refNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.client')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.route')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('requestsList.transport')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('shipmentsList.created')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/shipments/${s.id}`)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{s.referenceNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{s.client?.companyName || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {s.originCity}, {s.originCountry} → {s.destinationCity}, {s.destinationCountry}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{TRANSPORT_LABELS[s.transportType] || s.transportType}</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    {t('dashboard.noShipmentsYet')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* CBAR Currency Rates */}
      {rates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t('dashboard.currencyRates') === 'dashboard.currencyRates' ? 'CBAR Exchange Rates (AZN)' : t('dashboard.currencyRates')}</h2>
            <span className="text-xs text-slate-400">{ratesDate}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {rates.map((r) => (
              <div key={r.code} className="text-center">
                <div className="text-xs text-slate-500 mb-1">{r.code}/AZN</div>
                <div className="text-lg font-bold text-slate-900">{r.rate.toFixed(4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
