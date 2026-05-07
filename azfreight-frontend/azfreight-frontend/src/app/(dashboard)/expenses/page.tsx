'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listExpenses, type Expense } from '@/lib/api/expenses';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const CATEGORY_COLORS: Record<string, string> = {
  customs_duty: 'bg-purple-100 text-purple-700',
  storage: 'bg-blue-100 text-blue-700',
  insurance: 'bg-emerald-100 text-emerald-700',
  port_charges: 'bg-amber-100 text-amber-700',
  bank_fee: 'bg-slate-100 text-slate-700',
  transport: 'bg-cyan-100 text-cyan-700',
  documentation: 'bg-pink-100 text-pink-700',
  vat: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-600',
};

export default function ExpensesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listExpenses().then(setExpenses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalVat = expenses.reduce((s, e) => s + Number(e.vatAmount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('expenses.title')}</h1>
        <Link href="/expenses/new" className="btn-primary text-sm">+ {t('expenses.new') === 'expenses.new' ? 'New Expense' : t('expenses.new')}</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">{t('expenses.totalExpenses')}</p>
          <p className="text-2xl font-bold text-slate-900">{totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">{t('expenses.totalVat') === 'expenses.totalVat' ? 'Total VAT' : t('expenses.totalVat')}</p>
          <p className="text-2xl font-bold text-slate-900">{totalVat.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('expenses.date') === 'expenses.date' ? 'Date' : t('expenses.date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('expenses.category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('expenses.description') === 'expenses.description' ? 'Description' : t('expenses.description')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('expenses.amount')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">VAT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('nav.shipments')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.map((exp) => (
              <tr key={exp.id} onClick={() => router.push(`/expenses/${exp.id}`)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-700">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.other}`}>
                    {t(`expenses.categories.${exp.category}`) === `expenses.categories.${exp.category}` ? exp.category : t(`expenses.categories.${exp.category}`)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{exp.description || '—'}</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">{Number(exp.amount).toFixed(2)} {exp.currency}</td>
                <td className="px-6 py-4 text-sm text-right text-slate-600">{exp.vatAmount ? Number(exp.vatAmount).toFixed(2) : '—'}</td>
                <td className="px-6 py-4 text-sm text-blue-600">{exp.shipment?.referenceNumber || '—'}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">{t('expenses.noExpenses') === 'expenses.noExpenses' ? 'No expenses' : t('expenses.noExpenses')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
