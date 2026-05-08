'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getShipment, getTimeline } from '@/lib/api/shipments';
import type { Shipment, ShipmentStatusLog } from '@/types';
import StatusBadge from '@/components/status-badge';
import Loading from '@/components/loading';
import { TRANSPORT_LABELS } from '@/lib/constants';

export default function PortalShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<ShipmentStatusLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getShipment(id), getTimeline(id)])
      .then(([s, t]) => { setShipment(s); setTimeline(t); })
      .catch(() => router.push('/portal/shipments'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !shipment) return <Loading />;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{shipment.referenceNumber}</h2>
              <StatusBadge status={shipment.status} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {TRANSPORT_LABELS[shipment.transportType] || shipment.transportType}
              </span>
            </div>
            <p className="text-sm text-slate-500">Created {new Date(shipment.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => router.push('/portal/shipments')} className="btn-secondary text-sm">
            Back to list
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Route</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{shipment.originCountry}</div>
              <div className="text-sm text-slate-500">{shipment.originCity}</div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{shipment.destinationCountry}</div>
              <div className="text-sm text-slate-500">{shipment.destinationCity}</div>
            </div>
          </div>
        </div>

        {/* Cargo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Cargo</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Description</dt>
              <dd className="font-medium">{shipment.cargoDescription || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Weight</dt>
              <dd className="font-medium">{shipment.weightKg ? `${shipment.weightKg} kg` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Volume</dt>
              <dd className="font-medium">{shipment.volumeCbm ? `${shipment.volumeCbm} m³` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Packages</dt>
              <dd className="font-medium">{shipment.packageCount ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Dates</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">ETA</dt>
              <dd className="font-medium">{shipment.eta ? new Date(shipment.eta).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">ATD</dt>
              <dd className="font-medium">{shipment.atd ? new Date(shipment.atd).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">ATA</dt>
              <dd className="font-medium">{shipment.ata ? new Date(shipment.ata).toLocaleString() : '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Timeline</h3>
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-500">No status changes yet</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />
            <div className="space-y-4">
              {timeline.map((entry) => (
                <div key={entry.id} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.oldStatus} />
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <StatusBadge status={entry.newStatus} />
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                    {entry.comment && <p className="mt-1 text-sm text-slate-600">{entry.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
