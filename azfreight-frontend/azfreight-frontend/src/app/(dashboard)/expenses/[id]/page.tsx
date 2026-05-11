'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getExpense, updateExpense, deleteExpense, type Expense } from '@/lib/api/expenses';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';
import DocumentsSection from '@/components/documents-section';

const CATEGORIES = ['customs_duty', 'storage', 'insurance', 'port_charges', 'bank_fee', 'transport', 'documentation', 'vat', 'other'];

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: '', description: '', amount: '', vatRate: '' });

  const load = useCallback(async () => {
    try {
      const data = await getExpense(id);
      setExpense(data);
      setForm({
        category: data.category,
        description: data.description || '',
        amount: String(data.amount),
        vatRate: String(data.vatRate || 0),
      });
    } catch {
      router.push('/expenses');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateExpense(id, {
        category: form.category,
        description: form.description || undefined,
        amount: Number(form.amount),
        vatRate: Number(form.vatRate),
      });
      setEditing(false);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      router.push('/expenses');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  if (loading) return <Loading />;
  if (!expense) return null;

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div className="max-w-2xl">
      <Link href="/expenses" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← {t('expenses.title')}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Expense Detail</h1>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
              <button onClick={handleDelete} className="btn-danger text-sm">Delete</button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Category</p>
            {editing ? (
              <select className={inputCls} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            ) : (
              <p className="font-medium text-slate-900">{expense.category.replace('_', ' ')}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-medium text-slate-900">{new Date(expense.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Description</p>
            {editing ? (
              <input className={inputCls} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            ) : (
              <p className="font-medium text-slate-900">{expense.description || '—'}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Shipment</p>
            <p className="font-medium text-slate-900">
              {expense.shipment ? (
                <Link href={`/shipments/${expense.shipmentId}`} className="text-blue-600 hover:text-blue-700">
                  {expense.shipment.referenceNumber}
                </Link>
              ) : expense.shipmentId}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Amount</p>
            {editing ? (
              <input type="number" step="0.01" className={inputCls} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            ) : (
              <p className="font-medium text-slate-900">{Number(expense.amount).toFixed(2)} {expense.currency}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">VAT Rate / Amount</p>
            {editing ? (
              <input type="number" className={inputCls} value={form.vatRate} onChange={(e) => setForm((p) => ({ ...p, vatRate: e.target.value }))} />
            ) : (
              <p className="font-medium text-slate-900">{expense.vatRate}% ({Number(expense.vatAmount || 0).toFixed(2)} {expense.currency})</p>
            )}
          </div>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <p className="text-lg font-bold text-slate-900">
            Total: {(Number(expense.amount) + Number(expense.vatAmount || 0)).toFixed(2)} {expense.currency}
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Created {new Date(expense.createdAt).toLocaleString()}
          {expense.createdBy && ` by ${expense.createdBy.name}`}
        </div>
      </div>

      <DocumentsSection entityType="expense" entityId={id} documentTypes={['receipt', 'invoice', 'customs_document', 'other']} />
    </div>
  );
}
