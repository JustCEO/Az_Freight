'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getShipmentRequest,
  updateRequestStatus,
  convertRequest,
  assignCarrierToRequest,
  type ShipmentRequestDetail,
} from '@/lib/api/shipment-requests';
import { listCarriers } from '@/lib/api/carriers';
import { DOC_TYPE_LABELS } from '@/lib/cargo-requirements';
import type { Carrier, PaginatedResponse } from '@/types';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [request, setRequest] = useState<ShipmentRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Назначение перевозчика
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState('');
  const [assigningCarrier, setAssigningCarrier] = useState(false);

  const TRANSPORT_LABELS: Record<string, string> = {
    road_tir: t('transport.road_tir'), sea: t('transport.sea'), air: t('transport.air'), rail: t('transport.rail'), multimodal: t('transport.multimodal'),
  };

  const CARGO_TYPE_LABELS: Record<string, string> = {
    electronics: t('cargoTypes.electronics'), food_beverage: t('cargoTypes.food_beverage'), food: t('cargoTypes.food'),
    clothing_textile: t('cargoTypes.clothing_textile'), clothing: t('cargoTypes.clothing'),
    chemicals: t('cargoTypes.chemicals'), machinery: t('cargoTypes.machinery'),
    pharma: t('cargoTypes.pharma'), automotive: t('cargoTypes.automotive'),
    construction: t('cargoTypes.construction'), furniture: t('cargoTypes.furniture'),
    oil_gas: t('cargoTypes.oil_gas'), alcohol_tobacco: t('cargoTypes.alcohol_tobacco'),
    animals: t('cargoTypes.animals'), plants: t('cargoTypes.plants'),
    vehicles: t('cargoTypes.vehicles'), other: t('cargoTypes.other'),
  };

  useEffect(() => {
    getShipmentRequest(id).then(setRequest).catch(() => {}).finally(() => setLoading(false));
    listCarriers({ limit: 100 }).then((res: PaginatedResponse<Carrier>) => setCarriers(res.data.filter(c => c.isActive))).catch(() => {});
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    try {
      const updated = await updateRequestStatus(id, { status });
      setRequest((prev) => prev ? { ...prev, ...updated } : null);
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleConvert = async () => {
    setActionLoading(true);
    try {
      await convertRequest(id);
      setRequest((prev) => prev ? { ...prev, status: 'converted' } : null);
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleAssignCarrier = async () => {
    if (!selectedCarrierId) return;
    setAssigningCarrier(true);
    try {
      const updated = await assignCarrierToRequest(id, selectedCarrierId);
      setRequest(updated);
      setSelectedCarrierId('');
    } catch { /* ignore */ }
    setAssigningCarrier(false);
  };

  if (loading) return <Loading />;
  if (!request) return <p className="text-slate-500">{t('requestDetail.notFound')}</p>;

  const specs = request.specialRequirements as Record<string, boolean> | null;
  const transportTypes = request.transportTypes || [];
  const transportOrder = request.transportOrder || transportTypes;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700 mb-2">&larr; {t('common.back')}</button>
          <h1 className="text-2xl font-bold text-slate-900">{t('requestDetail.requestFrom')} {request.requesterName}</h1>
          <p className="text-sm text-slate-500">{request.requesterEmail} &middot; {new Date(request.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {request.status !== 'converted' && request.status !== 'rejected' && (
            <>
              {request.status === 'new' && (
                <button onClick={() => handleStatusChange('reviewing')} disabled={actionLoading} className="btn-primary text-sm disabled:opacity-50">
                  {t('requestDetail.startReview')}
                </button>
              )}
              {request.status === 'reviewing' && (
                <button onClick={() => handleStatusChange('quoted')} disabled={actionLoading} className="btn-primary text-sm disabled:opacity-50">
                  {t('requestDetail.markQuoted')}
                </button>
              )}
              {(request.status === 'quoted' || request.status === 'reviewing') && (
                <button onClick={handleConvert} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {t('requestDetail.convertToShipment')}
                </button>
              )}
              <button onClick={() => handleStatusChange('rejected')} disabled={actionLoading} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50">
                {t('requestDetail.reject')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('requestForm.steps.contact')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex"><dt className="w-32 text-slate-500">{t('common.name')}</dt><dd className="text-slate-900">{request.requesterName}</dd></div>
            <div className="flex"><dt className="w-32 text-slate-500">{t('common.email')}</dt><dd className="text-slate-900">{request.requesterEmail}</dd></div>
            {request.requesterPhone && <div className="flex"><dt className="w-32 text-slate-500">{t('common.phone')}</dt><dd className="text-slate-900">{request.requesterPhone}</dd></div>}
            {request.companyName && <div className="flex"><dt className="w-32 text-slate-500">{t('common.company')}</dt><dd className="text-slate-900">{request.companyName}</dd></div>}
            {request.voen && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.voen')}</dt><dd className="text-slate-900">{request.voen}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('requestForm.steps.route')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.originCountry')}</dt><dd className="text-slate-900">{request.originCity}, {request.originCountry}</dd></div>
            <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.destinationCountry')}</dt><dd className="text-slate-900">{request.destinationCity}, {request.destinationCountry}</dd></div>
            <div className="flex">
              <dt className="w-32 text-slate-500">{t('requestsList.transport')}</dt>
              <dd className="text-slate-900">
                {transportOrder.length > 1
                  ? transportOrder.map((tp, i) => `${i + 1}. ${TRANSPORT_LABELS[tp] || tp}`).join(' → ')
                  : TRANSPORT_LABELS[transportOrder[0]] || transportOrder[0] || '—'
                }
              </dd>
            </div>
            {request.preferredDate && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.preferredDate')}</dt><dd className="text-slate-900">{new Date(request.preferredDate).toLocaleDateString()}</dd></div>}
            {request.isUrgent && <div className="flex"><dt className="w-32 text-slate-500">{t('requestDetail.priority')}</dt><dd className="text-red-600 font-medium">{t('requestForm.urgentShipment')}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('requestForm.steps.cargo')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex"><dt className="w-32 text-slate-500">{t('tracking.type')}</dt><dd className="text-slate-900">{CARGO_TYPE_LABELS[request.cargoType] || request.cargoType}</dd></div>
            {request.cargoSubtype && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.cargoSubtype')}</dt><dd className="text-slate-900">{request.cargoSubtype}</dd></div>}
            <div className="flex"><dt className="w-32 text-slate-500">{t('common.description')}</dt><dd className="text-slate-900">{request.cargoDescription}</dd></div>
            {request.weightKg && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.weight')}</dt><dd className="text-slate-900">{request.weightKg} kg</dd></div>}
            {request.volumeCbm && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.volume')}</dt><dd className="text-slate-900">{request.volumeCbm} CBM</dd></div>}
            {request.packageCount && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.packages')}</dt><dd className="text-slate-900">{request.packageCount}</dd></div>}
            {request.declaredValue && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.declaredValue')}</dt><dd className="text-slate-900">{request.declaredValue} {request.currency}</dd></div>}
            {request.incoterms && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.incoterms')}</dt><dd className="text-slate-900">{request.incoterms}</dd></div>}
            {request.hsCode && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.hsCode')}</dt><dd className="text-slate-900">{request.hsCode}</dd></div>}
            {specs?.isHazmat && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.hazardous')}</dt><dd className="text-red-600">{t('common.yes')}</dd></div>}
            {specs?.needsRefrigeration && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.refrigeration')}</dt><dd className="text-blue-600">{t('common.required')}</dd></div>}
            {specs?.isFragile && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.fragile')}</dt><dd className="text-amber-600">{t('common.yes')}</dd></div>}
            {specs?.needsCustomsClearance && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.customsClearance')}</dt><dd className="text-slate-900">{t('requestDetail.clearanceNeeded')}</dd></div>}
            {specs?.isGroupage && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.groupageLcl')}</dt><dd className="text-slate-900">LCL</dd></div>}
            {specs?.isStackable && <div className="flex"><dt className="w-32 text-slate-500">{t('requestForm.stackable')}</dt><dd className="text-slate-900">{t('common.yes')}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('requestForm.documentsTitle')} ({request.documents.length})</h2>
          {request.documents.length === 0 ? (
            <p className="text-sm text-slate-500">{t('requestDetail.noDocuments')}</p>
          ) : (
            <div className="space-y-2">
              {request.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 text-sm bg-slate-50 rounded-lg px-4 py-2">
                  <span className="flex-1 truncate text-slate-700">{doc.originalName}</span>
                  <span className="text-xs text-slate-400">{DOC_TYPE_LABELS[doc.docType] || doc.docType}</span>
                  <span className="text-xs text-slate-400">{(Number(doc.sizeBytes) / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Назначение перевозчика */}
      {request.status !== 'converted' && request.status !== 'rejected' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('carriers.assign')}</h2>
          {request.carrier && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                {t('carriers.assigned')}: <span className="font-semibold">{request.carrier.companyName}</span>
              </p>
            </div>
          )}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('carriers.selectCarrier')}</label>
              <select
                value={selectedCarrierId}
                onChange={(e) => setSelectedCarrierId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">{t('carriers.selectCarrier')}</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName} ({c.transportTypes.join(', ')})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAssignCarrier}
              disabled={!selectedCarrierId || assigningCarrier}
              className="btn-primary disabled:opacity-50"
            >
              {assigningCarrier ? t('requestDetail.assigning') : t('carriers.assign')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
