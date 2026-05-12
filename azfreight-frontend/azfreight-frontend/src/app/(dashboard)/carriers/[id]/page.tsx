'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCarrier, updateCarrier } from '@/lib/api/carriers';
import type { Carrier } from '@/types';
import Loading from '@/components/loading';
import DocumentsSection from '@/components/documents-section';
import { TRANSPORT_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const TRANSPORT_KEYS = ['road_tir', 'sea', 'air', 'rail'] as const;
const SEA_FREIGHT_TYPES = ['CONTAINERS', 'BREAKBULK', 'BOTH'];
const ASSESSMENT_STATUSES = ['IN_PROGRESS', 'APPROVED', 'REJECTED'];

const ASSESSMENT_BADGE: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function CarrierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;

  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '', transportTypes: [] as string[], taxId: '', country: '', city: '', phone: '', email: '', notes: '',
    // Sea freight
    seaFreightType: '', hasWarehouse: false,
    // Compliance
    customClearance: false, taxResidenceDTA: '', complianceCert: '',
    // Contract
    contractNumber: '', contractStart: '', contractEnd: '', contractDetails: '', creditTermDays: '',
    // Contact
    contactPerson: '', contactEmail: '',
    // AVL Assessment
    assessmentStatus: '', rejectedReason: '', assessmentDate: '', isBlacklisted: false, blacklistReason: '',
    // Extra
    ogLicense: '', insuranceLimit: '',
  });

  useEffect(() => {
    getCarrier(id)
      .then((c) => {
        setCarrier(c);
        const rec = c as unknown as Record<string, unknown>;
        setForm({
          companyName: c.companyName || '',
          transportTypes: c.transportTypes || [],
          taxId: c.taxId || '',
          country: c.country || '',
          city: c.city || '',
          phone: c.phone || '',
          email: c.email || '',
          notes: c.notes || '',
          seaFreightType: (rec.seaFreightType as string) || '',
          hasWarehouse: !!rec.hasWarehouse,
          customClearance: !!rec.customClearance,
          taxResidenceDTA: (rec.taxResidenceDTA as string) || '',
          complianceCert: (rec.complianceCert as string) || '',
          contractNumber: (rec.contractNumber as string) || '',
          contractStart: rec.contractStart ? String(rec.contractStart).slice(0, 10) : '',
          contractEnd: rec.contractEnd ? String(rec.contractEnd).slice(0, 10) : '',
          contractDetails: (rec.contractDetails as string) || '',
          creditTermDays: rec.creditTermDays != null ? String(rec.creditTermDays) : '',
          contactPerson: (rec.contactPerson as string) || '',
          contactEmail: (rec.contactEmail as string) || '',
          assessmentStatus: (rec.assessmentStatus as string) || '',
          rejectedReason: (rec.rejectedReason as string) || '',
          assessmentDate: rec.assessmentDate ? String(rec.assessmentDate).slice(0, 10) : '',
          isBlacklisted: !!rec.isBlacklisted,
          blacklistReason: (rec.blacklistReason as string) || '',
          ogLicense: (rec.ogLicense as string) || '',
          insuranceLimit: rec.insuranceLimit != null ? String(rec.insuranceLimit) : '',
        });
      })
      .catch(() => router.push('/carriers'))
      .finally(() => setLoading(false));
  }, [id, router]);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTransport(value: string) {
    setForm((prev) => ({
      ...prev,
      transportTypes: prev.transportTypes.includes(value)
        ? prev.transportTypes.filter((t) => t !== value)
        : [...prev.transportTypes, value],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        companyName: form.companyName,
        transportTypes: form.transportTypes,
      };
      if (form.taxId) body.taxId = form.taxId;
      if (form.country) body.country = form.country;
      if (form.city) body.city = form.city;
      if (form.phone) body.phone = form.phone;
      if (form.email) body.email = form.email;
      if (form.notes) body.notes = form.notes;
      // Sea freight
      if (form.seaFreightType) body.seaFreightType = form.seaFreightType;
      body.hasWarehouse = form.hasWarehouse;
      // Compliance
      body.customClearance = form.customClearance;
      if (form.taxResidenceDTA) body.taxResidenceDTA = form.taxResidenceDTA;
      if (form.complianceCert) body.complianceCert = form.complianceCert;
      // Contract
      if (form.contractNumber) body.contractNumber = form.contractNumber;
      if (form.contractStart) body.contractStart = form.contractStart;
      if (form.contractEnd) body.contractEnd = form.contractEnd;
      if (form.contractDetails) body.contractDetails = form.contractDetails;
      if (form.creditTermDays) body.creditTermDays = parseInt(form.creditTermDays);
      if (form.insuranceLimit) body.insuranceLimit = parseFloat(form.insuranceLimit);
      // Contact
      if (form.contactPerson) body.contactPerson = form.contactPerson;
      if (form.contactEmail) body.contactEmail = form.contactEmail;
      // AVL Assessment
      if (form.assessmentStatus) body.assessmentStatus = form.assessmentStatus;
      if (form.rejectedReason) body.rejectedReason = form.rejectedReason;
      if (form.assessmentDate) body.assessmentDate = form.assessmentDate;
      body.isBlacklisted = form.isBlacklisted;
      if (form.blacklistReason) body.blacklistReason = form.blacklistReason;
      // Extra
      if (form.ogLicense) body.ogLicense = form.ogLicense;

      const updated = await updateCarrier(id, body);
      setCarrier(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('carrierDetail.failedToUpdate'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !carrier) return <Loading />;

  const rec = carrier as unknown as Record<string, unknown>;
  const assessmentStatus = (rec.assessmentStatus as string) || '';
  const isBlacklisted = !!rec.isBlacklisted;
  const hasSea = (carrier.transportTypes || []).includes('sea');

  /* ─── READ-ONLY VIEW ─── */
  if (!editing) {
    return (
      <div className="max-w-3xl">
        <div className="space-y-6">

          {/* Blacklisted banner */}
          {isBlacklisted && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex items-center gap-3 text-red-700 font-medium">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" /></svg>
              {t('avlVendors.blacklistedWarning')}
            </div>
          )}

          {/* Company */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{carrier.companyName}</h2>
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="btn-primary text-sm">{t('common.edit')}</button>
                <button onClick={() => router.push('/carriers')} className="btn-secondary text-sm">{t('common.back')}</button>
              </div>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2">
                <dt className="text-slate-500">{t('carrierDetail.transportTypes')}</dt>
                <dd className="flex gap-1 mt-1">
                  {(carrier.transportTypes || []).map((tp) => (
                    <span key={tp} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {TRANSPORT_LABELS[tp] || tp}
                    </span>
                  ))}
                </dd>
              </div>
              <div><dt className="text-slate-500">{t('carrierDetail.country')}</dt><dd className="font-medium">{carrier.country || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.rating')}</dt><dd className="font-medium">{carrier.rating ?? '—'}</dd></div>
              <div><dt className="text-slate-500">{t('avlVendors.ogLicense')}</dt><dd className="font-medium">{String(rec.ogLicense || '—')}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.taxId')}</dt><dd className="font-medium">{carrier.taxId || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('common.email')}</dt><dd className="font-medium">{carrier.email || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('common.phone')}</dt><dd className="font-medium">{carrier.phone || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.city')}</dt><dd className="font-medium">{carrier.city || '—'}</dd></div>
              <div className="md:col-span-2"><dt className="text-slate-500">{t('common.notes')}</dt><dd className="font-medium">{carrier.notes || '—'}</dd></div>
            </dl>
          </div>

          {/* AVL Assessment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('avlVendors.assessment')}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">{t('avlVendors.assessmentStatus')}</dt>
                <dd className="mt-1">
                  {assessmentStatus ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ASSESSMENT_BADGE[assessmentStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {t(`avlVendors.status.${assessmentStatus}`)}
                    </span>
                  ) : '—'}
                </dd>
              </div>
              {assessmentStatus === 'REJECTED' && (
                <div><dt className="text-slate-500">{t('avlVendors.rejectedReason')}</dt><dd className="font-medium">{String(rec.rejectedReason || '—')}</dd></div>
              )}
              <div><dt className="text-slate-500">{t('avlVendors.assessmentDate')}</dt><dd className="font-medium">{rec.assessmentDate ? new Date(String(rec.assessmentDate)).toLocaleDateString() : '—'}</dd></div>
              <div>
                <dt className="text-slate-500">{t('avlVendors.blacklisted')}</dt>
                <dd className="mt-1">
                  {isBlacklisted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{t('common.yes')}</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{t('common.no')}</span>
                  )}
                </dd>
              </div>
              {isBlacklisted && (
                <div><dt className="text-slate-500">{t('avlVendors.blacklistReason')}</dt><dd className="font-medium">{String(rec.blacklistReason || '—')}</dd></div>
              )}
            </dl>
          </div>

          {/* Sea Freight (only if sea in transportTypes) */}
          {hasSea && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('transport.sea')}</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><dt className="text-slate-500">{t('carrierCrm.seaFreightType.CONTAINERS') ? 'Sea Freight Type' : 'Sea Freight Type'}</dt><dd className="font-medium">{rec.seaFreightType ? t(`carrierCrm.seaFreightType.${rec.seaFreightType}`) : '—'}</dd></div>
                <div>
                  <dt className="text-slate-500">{t('carrierCrm.hasWarehouse')}</dt>
                  <dd><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rec.hasWarehouse ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{rec.hasWarehouse ? t('common.yes') : t('common.no')}</span></dd>
                </div>
              </dl>
            </div>
          )}

          {/* Compliance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('documents.types.compliance') || 'Compliance'}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">{t('carrierCrm.customClearance')}</dt>
                <dd><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rec.customClearance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{rec.customClearance ? t('common.yes') : t('common.no')}</span></dd>
              </div>
              <div><dt className="text-slate-500">{t('carrierCrm.taxResidence')}</dt><dd className="font-medium">{String(rec.taxResidenceDTA || '—')}</dd></div>
              <div><dt className="text-slate-500">{t('carrierCrm.complianceCert')}</dt><dd className="font-medium">{String(rec.complianceCert || '—')}</dd></div>
            </dl>
          </div>

          {/* Contract */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('documents.types.contract') || 'Contract'}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">{t('clientCrm.contractNumber')}</dt><dd className="font-medium">{String(rec.contractNumber || '—')}</dd></div>
              <div><dt className="text-slate-500">{t('clientCrm.contractStart')}</dt><dd className="font-medium">{rec.contractStart ? new Date(String(rec.contractStart)).toLocaleDateString() : '—'}</dd></div>
              <div><dt className="text-slate-500">{t('clientCrm.contractEnd')}</dt><dd className="font-medium">{rec.contractEnd ? new Date(String(rec.contractEnd)).toLocaleDateString() : '—'}</dd></div>
              <div><dt className="text-slate-500">{t('clientCrm.creditTerm')}</dt><dd className="font-medium">{rec.creditTermDays != null ? String(rec.creditTermDays) : '—'}</dd></div>
              <div><dt className="text-slate-500">{t('avlVendors.insuranceLimit')}</dt><dd className="font-medium">{rec.insuranceLimit != null ? String(rec.insuranceLimit) : '—'}</dd></div>
              <div className="md:col-span-2"><dt className="text-slate-500">{t('clientCrm.contractDetails')}</dt><dd className="font-medium whitespace-pre-wrap">{String(rec.contractDetails || '—')}</dd></div>
            </dl>
          </div>

          {/* Primary Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('carrierCrm.contactPerson')}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">{t('carrierCrm.contactPerson')}</dt><dd className="font-medium">{String(rec.contactPerson || '—')}</dd></div>
              <div><dt className="text-slate-500">{t('carrierCrm.contactEmail')}</dt><dd className="font-medium">{String(rec.contactEmail || '—')}</dd></div>
            </dl>
          </div>

          {/* Activity (read-only) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('common.status')}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">{t('avlVendors.mostRecentShipment')}</dt><dd className="font-medium">{rec.mostRecentShipmentDate ? new Date(String(rec.mostRecentShipmentDate)).toLocaleDateString() : '—'}</dd></div>
              <div><dt className="text-slate-500">{t('avlVendors.totalShipments')}</dt><dd className="font-medium">{carrier.totalShipments ?? '—'}</dd></div>
            </dl>
          </div>

          <DocumentsSection entityType="carrier" entityId={id} documentTypes={['contract', 'certificate', 'license', 'insurance', 'compliance', 'other']} />
        </div>
      </div>
    );
  }

  /* ─── EDIT VIEW ─── */
  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        {/* Company Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('carrierDetail.editCarrier')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="label-field">{t('carrierDetail.companyNameRequired')}</label><input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required /></div>
            <div className="md:col-span-2">
              <label className="label-field">{t('carrierDetail.transportTypes')}</label>
              <div className="flex gap-4 mt-1">
                {TRANSPORT_KEYS.map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.transportTypes.includes(key)} onChange={() => toggleTransport(key)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">{t(`transport.${key}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><label className="label-field">{t('carrierDetail.country')}</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierDetail.rating')}</label><dd className="text-sm font-medium text-slate-700 mt-1">{carrier.rating ?? '—'}</dd></div>
            <div><label className="label-field">{t('avlVendors.ogLicense')}</label><input type="text" value={form.ogLicense} onChange={(e) => updateField('ogLicense', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierDetail.taxId')}</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.email')}</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.phone')}</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierDetail.city')}</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">{t('common.notes')}</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        {/* AVL Assessment Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('avlVendors.assessment')}</h3>

          {form.isBlacklisted && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-red-700 text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" /></svg>
              {t('avlVendors.blacklistedWarning')}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">{t('avlVendors.assessmentStatus')}</label>
              <select value={form.assessmentStatus} onChange={(e) => updateField('assessmentStatus', e.target.value)} className="input-field">
                <option value="">—</option>
                {ASSESSMENT_STATUSES.map((s) => <option key={s} value={s}>{t(`avlVendors.status.${s}`)}</option>)}
              </select>
            </div>
            {form.assessmentStatus === 'REJECTED' && (
              <div>
                <label className="label-field">{t('avlVendors.rejectedReason')}</label>
                <input type="text" value={form.rejectedReason} onChange={(e) => updateField('rejectedReason', e.target.value)} className="input-field" />
              </div>
            )}
            <div>
              <label className="label-field">{t('avlVendors.assessmentDate')}</label>
              <input type="date" value={form.assessmentDate} onChange={(e) => updateField('assessmentDate', e.target.value)} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="label-field mb-0">{t('avlVendors.blacklisted')}</label>
              <button
                type="button"
                onClick={() => updateField('isBlacklisted', !form.isBlacklisted)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isBlacklisted ? 'bg-red-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isBlacklisted ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {form.isBlacklisted && (
              <div className="md:col-span-2">
                <label className="label-field">{t('avlVendors.blacklistReason')}</label>
                <input type="text" value={form.blacklistReason} onChange={(e) => updateField('blacklistReason', e.target.value)} className="input-field" />
              </div>
            )}
          </div>
        </div>

        {/* Sea Freight Edit (only if sea in transportTypes) */}
        {form.transportTypes.includes('sea') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('transport.sea')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Sea Freight Type</label>
                <select value={form.seaFreightType} onChange={(e) => updateField('seaFreightType', e.target.value)} className="input-field">
                  <option value="">—</option>
                  {SEA_FREIGHT_TYPES.map((s) => <option key={s} value={s}>{t(`carrierCrm.seaFreightType.${s}`)}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="label-field mb-0">{t('carrierCrm.hasWarehouse')}</label>
                <button
                  type="button"
                  onClick={() => updateField('hasWarehouse', !form.hasWarehouse)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.hasWarehouse ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.hasWarehouse ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('documents.types.compliance') || 'Compliance'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 pt-5">
              <label className="label-field mb-0">{t('carrierCrm.customClearance')}</label>
              <button
                type="button"
                onClick={() => updateField('customClearance', !form.customClearance)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.customClearance ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.customClearance ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div><label className="label-field">{t('carrierCrm.taxResidence')}</label><input type="text" value={form.taxResidenceDTA} onChange={(e) => updateField('taxResidenceDTA', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierCrm.complianceCert')}</label><input type="text" value={form.complianceCert} onChange={(e) => updateField('complianceCert', e.target.value)} className="input-field" /></div>
          </div>
        </div>

        {/* Contract Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('documents.types.contract') || 'Contract'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-field">{t('clientCrm.contractNumber')}</label><input type="text" value={form.contractNumber} onChange={(e) => updateField('contractNumber', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('clientCrm.contractStart')}</label><input type="date" value={form.contractStart} onChange={(e) => updateField('contractStart', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('clientCrm.contractEnd')}</label><input type="date" value={form.contractEnd} onChange={(e) => updateField('contractEnd', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('clientCrm.creditTerm')}</label><input type="number" value={form.creditTermDays} onChange={(e) => updateField('creditTermDays', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('avlVendors.insuranceLimit')}</label><input type="number" value={form.insuranceLimit} onChange={(e) => updateField('insuranceLimit', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">{t('clientCrm.contractDetails')}</label><textarea value={form.contractDetails} onChange={(e) => updateField('contractDetails', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        {/* Primary Contact Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('carrierCrm.contactPerson')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-field">{t('carrierCrm.contactPerson')}</label><input type="text" value={form.contactPerson} onChange={(e) => updateField('contactPerson', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierCrm.contactEmail')}</label><input type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} className="input-field" /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? t('carrierDetail.saving') : t('carrierDetail.saveChanges')}</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
