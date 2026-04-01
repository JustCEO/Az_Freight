'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClient, updateClient } from '@/lib/api/clients';
import type { Client } from '@/types';
import Loading from '@/components/loading';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '', taxId: '', voen: '', address: '', country: '', city: '',
    phone: '', email: '', website: '', paymentTermsDays: '', creditLimit: '', notes: '',
  });

  useEffect(() => {
    getClient(id)
      .then((c) => {
        setClient(c);
        setForm({
          companyName: c.companyName || '',
          taxId: c.taxId || '',
          voen: c.voen || '',
          address: c.address || '',
          country: c.country || '',
          city: c.city || '',
          phone: c.phone || '',
          email: c.email || '',
          website: c.website || '',
          paymentTermsDays: c.paymentTermsDays?.toString() || '',
          creditLimit: c.creditLimit?.toString() || '',
          notes: c.notes || '',
        });
      })
      .catch(() => router.push('/clients'))
      .finally(() => setLoading(false));
  }, [id, router]);

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
      const updated = await updateClient(id, body);
      setClient(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !client) return <Loading />;

  if (!editing) {
    return (
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">{client.companyName}</h2>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="btn-primary text-sm">Edit</button>
              <button onClick={() => router.push('/clients')} className="btn-secondary text-sm">Back</button>
            </div>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-500">Tax ID</dt><dd className="font-medium">{client.taxId || '—'}</dd></div>
            <div><dt className="text-slate-500">VOEN</dt><dd className="font-medium">{client.voen || '—'}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{client.email || '—'}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{client.phone || '—'}</dd></div>
            <div><dt className="text-slate-500">Website</dt><dd className="font-medium">{client.website || '—'}</dd></div>
            <div><dt className="text-slate-500">Country</dt><dd className="font-medium">{client.country || '—'}</dd></div>
            <div><dt className="text-slate-500">City</dt><dd className="font-medium">{client.city || '—'}</dd></div>
            <div className="md:col-span-2"><dt className="text-slate-500">Address</dt><dd className="font-medium">{client.address || '—'}</dd></div>
            <div><dt className="text-slate-500">Payment Terms</dt><dd className="font-medium">{client.paymentTermsDays ? `${client.paymentTermsDays} days` : '—'}</dd></div>
            <div><dt className="text-slate-500">Credit Limit</dt><dd className="font-medium">{client.creditLimit ?? '—'}</dd></div>
            <div className="md:col-span-2"><dt className="text-slate-500">Notes</dt><dd className="font-medium">{client.notes || '—'}</dd></div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{client.isActive ? 'Active' : 'Inactive'}</span></dd>
            </div>
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="label-field">Company Name *</label><input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="input-field" required /></div>
            <div><label className="label-field">Tax ID</label><input type="text" value={form.taxId} onChange={(e) => updateField('taxId', e.target.value)} className="input-field" /></div>
            <div><label className="label-field">VOEN (Vergi ödəyicisinin eyniləşdirmə nömrəsi)</label><input type="text" value={form.voen} onChange={(e) => updateField('voen', e.target.value)} className="input-field" placeholder="1234567890" maxLength={10} /></div>
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
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
