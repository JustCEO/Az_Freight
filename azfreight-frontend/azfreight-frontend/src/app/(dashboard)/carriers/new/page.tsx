'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createCarrier } from '@/lib/api/carriers';
import { useTranslation } from '@/lib/i18n';

const TRANSPORT_KEYS = ['road_tir', 'sea', 'air', 'rail'] as const;

export default function NewCarrierPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    transportTypes: [] as string[],
    taxId: '',
    country: '',
    city: '',
    phone: '',
    email: '',
    notes: '',
  });

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

      const carrier = await createCarrier(body);
      router.push(`/carriers/${carrier.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newCarrier.failedToCreate'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newCarrier.carrierInformation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">{t('newCarrier.companyNameRequired')}</label>
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">{t('newCarrier.transportTypes')}</label>
              <div className="flex gap-4 mt-1">
                {TRANSPORT_KEYS.map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.transportTypes.includes(key)}
                      onChange={() => toggleTransport(key)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{t(`transport.${key}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><label className="label-field">{t('newCarrier.taxId')}</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.email')}</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.phone')}</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('newCarrier.country')}</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('newCarrier.city')}</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">{t('common.notes')}</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? t('newCarrier.creating') : t('newCarrier.createCarrier')}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
