'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/lib/api/invoices';
import { listClients } from '@/lib/api/clients';
import { listShipments } from '@/lib/api/shipments';
import type { Client, Shipment } from '@/types';

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    invoiceNumber: '',
    clientId: '',
    shipmentId: '',
    amount: '',
    currency: 'USD',
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      listClients({ limit: 500 }),
      listShipments({ limit: 500 }),
    ]).then(([c, s]) => {
      setClients(c.data);
      setShipments(s.data);
    });
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.invoiceNumber || !form.clientId || !form.amount || !form.issuedDate || !form.dueDate) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await createInvoice({
        invoiceNumber: form.invoiceNumber,
        clientId: form.clientId,
        shipmentId: form.shipmentId || undefined,
        amount: parseFloat(form.amount),
        currency: form.currency,
        issuedDate: form.issuedDate,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
      });
      router.push('/invoices');
    } catch {
      setError('Failed to create invoice');
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 mb-6">New Invoice</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Invoice Number *</label>
            <input type="text" value={form.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label-field">Client *</label>
            <select value={form.clientId} onChange={(e) => update('clientId', e.target.value)} className="input-field" required>
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Shipment (optional)</label>
            <select value={form.shipmentId} onChange={(e) => update('shipmentId', e.target.value)} className="input-field">
              <option value="">None</option>
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>{s.referenceNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Currency</label>
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="input-field">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="AZN">AZN</option>
              <option value="TRY">TRY</option>
              <option value="RUB">RUB</option>
            </select>
          </div>
          <div>
            <label className="label-field">Amount *</label>
            <input type="number" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label-field">Issued Date *</label>
            <input type="date" value={form.issuedDate} onChange={(e) => update('issuedDate', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label-field">Due Date *</label>
            <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} className="input-field" required />
          </div>
        </div>

        <div>
          <label className="label-field">Notes</label>
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-field" rows={3} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/invoices')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
