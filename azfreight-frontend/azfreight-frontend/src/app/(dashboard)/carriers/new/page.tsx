'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createCarrier } from '@/lib/api/carriers';

const TRANSPORT_OPTIONS = [
  { value: 'road_tir', label: 'Road/TIR' },
  { value: 'sea', label: 'Sea' },
  { value: 'air', label: 'Air' },
  { value: 'rail', label: 'Rail' },
];

export default function NewCarrierPage() {
  const router = useRouter();
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
      setError(err instanceof Error ? err.message : 'Failed to create carrier');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Carrier Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">Company Name *</label>
              <input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">Transport Types</label>
              <div className="flex gap-4 mt-1">
                {TRANSPORT_OPTIONS.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.transportTypes.includes(o.value)}
                      onChange={() => toggleTransport(o.value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><label className="label-field">Tax ID</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Email</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Phone</label><input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">Country</label><input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">City</label><input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input-field" /></div>
            <div className="md:col-span-2"><label className="label-field">Notes</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className="input-field" rows={3} /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating...' : 'Create Carrier'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
