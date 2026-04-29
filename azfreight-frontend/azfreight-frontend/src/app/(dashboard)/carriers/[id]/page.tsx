'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCarrier, updateCarrier } from '@/lib/api/carriers';
import type { Carrier } from '@/types';
import Loading from '@/components/loading';
import { TRANSPORT_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const TRANSPORT_KEYS = ['road_tir', 'sea', 'air', 'rail'] as const;

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
  });

  useEffect(() => {
    getCarrier(id)
      .then((c) => {
        setCarrier(c);
        setForm({
          companyName: c.companyName || '',
          transportTypes: c.transportTypes || [],
          taxId: c.taxId || '',
          country: c.country || '',
          city: c.city || '',
          phone: c.phone || '',
          email: c.email || '',
          notes: c.notes || '',
        });
      })
      .catch(() => router.push('/carriers'))
      .finally(() => setLoading(false));
  }, [id, router]);

  function updateField(field: string, value: string) {
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

  if (!editing) {
    return (
      <div className="max-w-3xl">
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
                {(carrier.transportTypes || []).map((t) => (
                  <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    {TRANSPORT_LABELS[t] || t}
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
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
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
        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? t('carrierDetail.saving') : t('carrierDetail.saveChanges')}</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
