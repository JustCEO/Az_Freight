'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/api/clients';
import { useTranslation } from '@/lib/i18n';

export default function NewClientPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    taxId: '',
    voen: '',
    address: '',
    country: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    paymentTermsDays: '',
    creditLimit: '',
    notes: '',
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { companyName: form.companyName };
      if (form.taxId) body.taxId = form.taxId;
      if (form.voen) body.voen = form.voen;
      if (form.address) body.address = form.address;
      if (form.country) body.country = form.country;
      if (form.city) body.city = form.city;
      if (form.phone) body.phone = form.phone;
      if (form.email) body.email = form.email;
      if (form.website) body.website = form.website;
      if (form.paymentTermsDays) body.paymentTermsDays = parseInt(form.paymentTermsDays);
      if (form.creditLimit) body.creditLimit = parseFloat(form.creditLimit);
      if (form.notes) body.notes = form.notes;

      const client = await createClient(body);
      router.push(`/clients/${client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newClient.failedToCreate'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('newClient.clientInformation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">{t('newClient.companyNameRequired')}</label>
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required />
            </div>
            <div><label className="label-field">{t('newClient.taxId')}</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('requestForm.voen')}</label><input type="text" value={form.voen} onChange={(e) => updateField('voen', e.target.value)} className="input-field" placeholder="1234567890" maxLength={10} /></div>
            <div><label className="label-field">{t('common.email')}</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('common.phone')}</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('newClient.website')}</label><input type="text" value={form.website} onChange={(e) => updateField('website', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('clientsList.country')}</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('clientsList.city')}</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">{t('newClient.address')}</label><input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('newClient.paymentTermsDays')}</label><input type="number" value={form.paymentTermsDays} onChange={(e) => updateField('paymentTermsDays', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">{t('newClient.creditLimit')}</label><input type="number" step="0.01" value={form.creditLimit} onChange={(e) => updateField('creditLimit', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">{t('common.notes')}</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? t('newClient.creating') : t('newClient.createClient')}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
