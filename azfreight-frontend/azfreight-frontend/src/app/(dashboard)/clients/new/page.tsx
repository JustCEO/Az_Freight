'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/api/clients';

export default function NewClientPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    taxId: '',
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
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">Company Name *</label>
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required />
            </div>
            <div><label className="label-field">Tax ID</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Email</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Phone</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Website</label><input type="text" value={form.website} onChange={(e) => updateField('website', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Country</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">City</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">Address</label><input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Payment Terms (days)</label><input type="number" value={form.paymentTermsDays} onChange={(e) => updateField('paymentTermsDays', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Credit Limit</label><input type="number" step="0.01" value={form.creditLimit} onChange={(e) => updateField('creditLimit', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">Notes</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating...' : 'Create Client'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
