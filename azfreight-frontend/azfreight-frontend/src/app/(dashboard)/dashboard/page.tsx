'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listShipments } from '@/lib/api/shipments';
import type { Shipment, ShipmentStatus } from '@/types';
import StatusBadge from '@/components/status-badge';
import { TRANSPORT_LABELS } from '@/lib/constants';
import Loading from '@/components/loading';

const STATUS_CARD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  request: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_transit: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  customs: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUS_ORDER: ShipmentStatus[] = ['request', 'confirmed', 'in_transit', 'customs', 'delivered', 'cancelled'];
const STATUS_LABELS_DASH: Record<string, string> = {
  request: 'Requests',
  confirmed: 'Confirmed',
  in_transit: 'In Transit',
  customs: 'Customs',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function DashboardPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
              <div className="text-sm text-slate-500 mt-1">{STATUS_LABELS_DASH[status]}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Shipments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ref #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
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
                    No shipments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
