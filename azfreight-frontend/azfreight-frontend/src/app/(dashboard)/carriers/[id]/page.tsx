'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCarrier, updateCarrier } from '@/lib/api/carriers';
import type { Carrier } from '@/types';
import Loading from '@/components/loading';
import { TRANSPORT_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const TRANSPORT_KEYS = ['road_tir', 'sea', 'air', 'rail'] as const;
const SEA_FREIGHT_TYPES = ['CONTAINERS', 'BREAKBULK', 'BOTH'];

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
    // New fields
    seaFreightType: '', hasWarehouse: false,
    customClearance: false, taxResidenceDTA: '', complianceCert: '',
    contractNumber: '', contractStart: '', contractEnd: '', contractDetails: '', creditTermDays: '',
    contactPerson: '', contactEmail: '',
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
      // New fields
      if (form.seaFreightType) body.seaFreightType = form.seaFreightType;
      body.hasWarehouse = form.hasWarehouse;
      body.customClearance = form.customClearance;
      if (form.taxResidenceDTA) body.taxResidenceDTA = form.taxResidenceDTA;
      if (form.complianceCert) body.complianceCert = form.complianceCert;
      if (form.contractNumber) body.contractNumber = form.contractNumber;
      if (form.contractStart) body.contractStart = form.contractStart;
      if (form.contractEnd) body.contractEnd = form.contractEnd;
      if (form.contractDetails) body.contractDetails = form.contractDetails;
      if (form.creditTermDays) body.creditTermDays = parseInt(form.creditTermDays);
      if (form.contactPerson) body.contactPerson = form.contactPerson;
      if (form.contactEmail) body.contactEmail = form.contactEmail;
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

  if (!editing) {
    return (
      <div className="max-w-3xl">
        <div className="space-y-6">
          {/* Basic Info */}
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
              <div><dt className="text-slate-500">{t('carrierDetail.taxId')}</dt><dd className="font-medium">{carrier.taxId || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('common.email')}</dt><dd className="font-medium">{carrier.email || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('common.phone')}</dt><dd className="font-medium">{carrier.phone || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.country')}</dt><dd className="font-medium">{carrier.country || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.city')}</dt><dd className="font-medium">{carrier.city || '—'}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.rating')}</dt><dd className="font-medium">{carrier.rating ?? '—'}</dd></div>
              <div><dt className="text-slate-500">{t('carrierDetail.totalShipments')}</dt><dd className="font-medium">{carrier.totalShipments}</dd></div>
              <div className="md:col-span-2"><dt className="text-slate-500">{t('common.notes')}</dt><dd className="font-medium">{carrier.notes || '—'}</dd></div>
            </dl>
          </div>

          {/* Location & Logistics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Location & Logistics</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">Sea Freight Type</dt><dd className="font-medium">{String(rec.seaFreightType || '—')}</dd></div>
              <div>
                <dt className="text-slate-500">Has Warehouse</dt>
                <dd><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rec.hasWarehouse ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{rec.hasWarehouse ? 'Yes' : 'No'}</span></dd>
              </div>
              <div><dt className="text-slate-500">Country</dt><dd className="font-medium">{carrier.country || '—'}</dd></div>
            </dl>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Compliance</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Custom Clearance</dt>
                <dd><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rec.customClearance ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{rec.customClearance ? 'Yes' : 'No'}</span></dd>
              </div>
              <div><dt className="text-slate-500">Tax Residence (DTA)</dt><dd className="font-medium">{String(rec.taxResidenceDTA || '—')}</dd></div>
              <div><dt className="text-slate-500">Compliance Certificate</dt><dd className="font-medium">{String(rec.complianceCert || '—')}</dd></div>
            </dl>
          </div>

          {/* Contract */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Contract</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">Contract Number</dt><dd className="font-medium">{String(rec.contractNumber || '—')}</dd></div>
              <div><dt className="text-slate-500">Contract Start</dt><dd className="font-medium">{rec.contractStart ? new Date(String(rec.contractStart)).toLocaleDateString() : '—'}</dd></div>
              <div><dt className="text-slate-500">Contract End</dt><dd className="font-medium">{rec.contractEnd ? new Date(String(rec.contractEnd)).toLocaleDateString() : '—'}</dd></div>
              <div><dt className="text-slate-500">Credit Term Days</dt><dd className="font-medium">{rec.creditTermDays != null ? String(rec.creditTermDays) : '—'}</dd></div>
              <div className="md:col-span-2"><dt className="text-slate-500">Contract Details</dt><dd className="font-medium whitespace-pre-wrap">{String(rec.contractDetails || '—')}</dd></div>
            </dl>
          </div>

          {/* Primary Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Primary Contact</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-500">Contact Person</dt><dd className="font-medium">{String(rec.contactPerson || '—')}</dd></div>
              <div><dt className="text-slate-500">Contact Email</dt><dd className="font-medium">{String(rec.contactEmail || '—')}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        {/* Basic Info Edit */}
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
            <div><label className="label-field">{t('carrierDetail.taxId')}</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.email')}</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.phone')}</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierDetail.country')}</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('carrierDetail.city')}</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">{t('common.notes')}</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        {/* Location & Logistics Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Location & Logistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Sea Freight Type</label>
              <select value={form.seaFreightType} onChange={(e) => updateField('seaFreightType', e.target.value)} className="input-field">
                <option value="">Select...</option>
                {SEA_FREIGHT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="label-field mb-0">Has Warehouse</label>
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

        {/* Compliance Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 pt-5">
              <label className="label-field mb-0">Custom Clearance</label>
              <button
                type="button"
                onClick={() => updateField('customClearance', !form.customClearance)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.customClearance ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.customClearance ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div><label className="label-field">Tax Residence (DTA)</label><input type="text" value={form.taxResidenceDTA} onChange={(e) => updateField('taxResidenceDTA', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Compliance Certificate</label><input type="text" value={form.complianceCert} onChange={(e) => updateField('complianceCert', e.target.value)} className="input-field" /></div>
          </div>
        </div>

        {/* Contract Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Contract</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-field">Contract Number</label><input type="text" value={form.contractNumber} onChange={(e) => updateField('contractNumber', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Contract Start</label><input type="date" value={form.contractStart} onChange={(e) => updateField('contractStart', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Contract End</label><input type="date" value={form.contractEnd} onChange={(e) => updateField('contractEnd', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Credit Term Days</label><input type="number" value={form.creditTermDays} onChange={(e) => updateField('creditTermDays', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">Contract Details</label><textarea value={form.contractDetails} onChange={(e) => updateField('contractDetails', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        {/* Primary Contact Edit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-field">Contact Person</label><input type="text" value={form.contactPerson} onChange={(e) => updateField('contactPerson', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Contact Email</label><input type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} className="input-field" /></div>
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
