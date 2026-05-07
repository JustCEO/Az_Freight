'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createExpense } from '@/lib/api/expenses';
import { useTranslation } from '@/lib/i18n';

const CATEGORIES = ['customs_duty', 'storage', 'insurance', 'port_charges', 'bank_fee', 'transport', 'documentation', 'vat', 'other'];

export default function NewExpensePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    shipmentId: '', category: 'other', description: '', amount: '',
    vatRate: '18', currency: 'USD', date: new Date().toISOString().slice(0, 10), notes: '',
  });

  const amount = Number(form.amount) || 0;
  const vatRate = Number(form.vatRate) || 0;
  const vatAmount = amount * vatRate / 100;
  const total = amount + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shipmentId) { setError('Shipment is required'); return; }
    setLoading(true);
    setError('');
    try {
      await createExpense({
        shipmentId: form.shipmentId,
        category: form.category,
        description: form.description || undefined,
        amount: amount,
        vatRate: vatRate,
        currency: form.currency,
        date: form.date,
      });
      router.push('/expenses');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="max-w-2xl">
      <Link href="/expenses" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← {t('expenses.title')}
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Expense</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className={labelCls}>Shipment ID *</label>
          <input className={inputCls} value={form.shipmentId} onChange={(e) => setForm((p) => ({ ...p, shipmentId: e.target.value }))}
            placeholder="Paste shipment ID" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`expenses.categories.${c}`) === `expenses.categories.${c}` ? c.replace('_', ' ') : t(`expenses.categories.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <input className={inputCls} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Amount *</label>
            <input type="number" step="0.01" min="0" className={inputCls} value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
          </div>
          <div>
            <label className={labelCls}>VAT %</label>
            <input type="number" min="0" max="100" className={inputCls} value={form.vatRate}
              onChange={(e) => setForm((p) => ({ ...p, vatRate: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select className={inputCls} value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="AZN">AZN</option>
              <option value="TRY">TRY</option>
              <option value="RUB">RUB</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-1 text-right text-sm">
          <div className="text-slate-600">VAT Amount: <span className="font-semibold">{vatAmount.toFixed(2)} {form.currency}</span></div>
          <div className="text-lg font-bold text-slate-900">Total: {total.toFixed(2)} {form.currency}</div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Create Expense'}
          </button>
          <Link href="/expenses" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
