'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getShipment, getTimeline, updateShipmentStatus } from '@/lib/api/shipments';
import { listCustomStatuses, assignCustomStatus } from '@/lib/api/custom-statuses';
import type { Shipment, ShipmentStatusLog, CustomStatus } from '@/types';
import StatusBadge from '@/components/status-badge';
import Loading from '@/components/loading';
import { TRANSPORT_LABELS, STATUS_TRANSITIONS, STATUS_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const STATUS_BTN_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-600 hover:bg-blue-700 text-white',
  in_transit: 'bg-amber-500 hover:bg-amber-600 text-white',
  customs: 'bg-orange-500 hover:bg-orange-600 text-white',
  delivered: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  cancelled: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<ShipmentStatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Кастомные статусы
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [selectedCustomStatus, setSelectedCustomStatus] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [updatingCustom, setUpdatingCustom] = useState(false);

  useEffect(() => {
    Promise.all([getShipment(id), getTimeline(id)])
      .then(([s, tl]) => { setShipment(s); setTimeline(tl); })
      .catch(() => router.push('/shipments'))
      .finally(() => setLoading(false));
    listCustomStatuses().then(setCustomStatuses).catch(() => {});
  }, [id, router]);

  async function handleStatusChange(newStatus: string) {
    if (!shipment) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateShipmentStatus(id, newStatus, statusComment || undefined);
      setShipment(updated);
      setStatusComment('');
      const tl = await getTimeline(id);
      setTimeline(tl);
    } catch { /* ignore */ }
    setUpdatingStatus(false);
  }

  async function handleCustomStatusAssign() {
    if (!shipment) return;
    setUpdatingCustom(true);
    try {
      await assignCustomStatus(id, {
        customStatusId: selectedCustomStatus || undefined,
        customStatusNote: customNote || undefined,
      });
      const updated = await getShipment(id);
      setShipment(updated);
      setCustomNote('');
    } catch { /* ignore */ }
    setUpdatingCustom(false);
  }

  if (loading || !shipment) return <Loading />;

  const transitions = STATUS_TRANSITIONS[shipment.status] || [];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{shipment.referenceNumber}</h2>
              <StatusBadge status={shipment.status} />
              {shipment.customStatus && (
                <StatusBadge
                  status={shipment.customStatus.name}
                  customColor={shipment.customStatus.color}
                  customLabel={shipment.customStatus.name}
                />
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {TRANSPORT_LABELS[shipment.transportType] || shipment.transportType}
              </span>
            </div>
            <p className="text-sm text-slate-500">{t('shipmentsList.created')} {new Date(shipment.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/shipments/${id}/cmr`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              onClick={(e) => {
                e.preventDefault();
                const token = localStorage.getItem('accessToken');
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/shipments/${id}/cmr`, {
                  headers: { Authorization: `Bearer ${token}` },
                }).then(r => r.blob()).then(b => {
                  const url = URL.createObjectURL(b);
                  const a = document.createElement('a');
                  a.href = url; a.download = `CMR-${shipment.referenceNumber}.pdf`; a.click();
                  URL.revokeObjectURL(url);
                });
              }}
            >
              CMR
            </a>
            {shipment.transportType === 'sea' && (
              <a
                href="#"
                className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                onClick={(e) => {
                  e.preventDefault();
                  const token = localStorage.getItem('accessToken');
                  fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/shipments/${id}/bl`, {
                    headers: { Authorization: `Bearer ${token}` },
                  }).then(r => r.blob()).then(b => {
                    const url = URL.createObjectURL(b);
                    const a = document.createElement('a');
                    a.href = url; a.download = `BL-${shipment.referenceNumber}.pdf`; a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
              >
                {t('shipmentDetail.billOfLading')}
              </a>
            )}
            <button onClick={() => router.push('/shipments')} className="btn-secondary text-sm">
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('requestsList.route')}</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{shipment.originCountry}</div>
              <div className="text-sm text-slate-500">{shipment.originCity}</div>
              {shipment.originAddress && <div className="text-xs text-slate-400">{shipment.originAddress}</div>}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{shipment.destinationCountry}</div>
              <div className="text-sm text-slate-500">{shipment.destinationCity}</div>
              {shipment.destinationAddress && <div className="text-xs text-slate-400">{shipment.destinationAddress}</div>}
            </div>
          </div>
        </div>

        {/* Cargo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('requestForm.steps.cargo')}</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('common.description')}</dt>
              <dd className="font-medium">{shipment.cargoDescription || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('requestForm.weight')}</dt>
              <dd className="font-medium">{shipment.cargoWeight ? `${shipment.cargoWeight} kg` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('requestForm.volume')}</dt>
              <dd className="font-medium">{shipment.cargoVolume ? `${shipment.cargoVolume} m³` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('requestForm.packages')}</dt>
              <dd className="font-medium">{shipment.packageCount ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Financials */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('newShipment.financials')}</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('newShipment.clientRate')}</dt>
              <dd className="font-medium">{shipment.clientRate != null ? `${shipment.clientRate} ${shipment.currency}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('newShipment.carrierRate')}</dt>
              <dd className="font-medium">{shipment.carrierRate != null ? `${shipment.carrierRate} ${shipment.currency}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('reports.profit')}</dt>
              <dd className={`font-medium ${shipment.profit != null && shipment.profit > 0 ? 'text-emerald-600' : shipment.profit != null && shipment.profit < 0 ? 'text-red-600' : ''}`}>
                {shipment.profit != null ? `${shipment.profit} ${shipment.currency}` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('requestForm.currency')}</dt>
              <dd className="font-medium">{shipment.currency}</dd>
            </div>
          </dl>
        </div>

        {/* Parties */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('shipmentDetail.parties')}</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('shipmentsList.client')}</dt>
              <dd className="font-medium">{shipment.client?.companyName || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('shipmentsList.carrier')}</dt>
              <dd className="font-medium">{shipment.carrier?.companyName || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('shipmentDetail.assignedManager')}</dt>
              <dd className="font-medium">{shipment.assignedTo?.name || '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('shipmentDetail.dates')}</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('shipmentsList.created')}</dt>
              <dd className="font-medium">{new Date(shipment.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('newShipment.eta')}</dt>
              <dd className="font-medium">{shipment.eta ? new Date(shipment.eta).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('shipmentDetail.atd')}</dt>
              <dd className="font-medium">{shipment.atd ? new Date(shipment.atd).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('shipmentDetail.ata')}</dt>
              <dd className="font-medium">{shipment.ata ? new Date(shipment.ata).toLocaleString() : '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Status Transition */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('shipmentDetail.updateStatus')}</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="label-field">{t('shipmentDetail.comment')}</label>
              <input
                type="text"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="input-field"
                placeholder="Add a comment..."
              />
            </div>
            <div className="flex gap-2">
              {transitions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${STATUS_BTN_STYLES[s] || 'bg-slate-500 hover:bg-slate-600 text-white'}`}
                >
                  {STATUS_LABELS[s] || s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Status */}
      {customStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('customStatuses.assignStatus')}</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="label-field">{t('common.status')}</label>
              <select
                value={selectedCustomStatus || shipment.customStatusId || ''}
                onChange={(e) => setSelectedCustomStatus(e.target.value)}
                className="input-field"
              >
                <option value="">{t('shipmentDetail.none')}</option>
                {customStatuses.map((cs) => (
                  <option key={cs.id} value={cs.id}>{cs.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="label-field">{t('customStatuses.statusNote')}</label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="input-field"
                placeholder="Status note..."
              />
            </div>
            <button
              onClick={handleCustomStatusAssign}
              disabled={updatingCustom}
              className="btn-primary disabled:opacity-50"
            >
              {updatingCustom ? t('shipmentDetail.updating') : t('shipmentDetail.setStatus')}
            </button>
          </div>
          {shipment.customStatusNote && (
            <p className="text-sm text-slate-500 mt-2">{t('common.notes')}: {shipment.customStatusNote}</p>
          )}
        </div>
      )}

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
                      <span className="font-medium text-slate-700">{entry.changedBy?.name || 'System'}</span>
                      {' · '}
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
