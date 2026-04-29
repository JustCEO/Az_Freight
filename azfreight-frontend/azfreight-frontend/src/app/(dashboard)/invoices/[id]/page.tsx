'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvoice, updateInvoiceStatus, recordPayment } from '@/lib/api/invoices';
import type { Invoice } from '@/types';
import StatusBadge from '@/components/status-badge';
import Loading from '@/components/loading';
import { INVOICE_STATUS_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const INVOICE_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'partially_paid', 'overdue', 'cancelled'],
  partially_paid: ['paid', 'overdue'],
  overdue: ['paid', 'partially_paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

const INV_BTN_STYLES: Record<string, string> = {
  sent: 'bg-blue-600 hover:bg-blue-700 text-white',
  paid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  partially_paid: 'bg-amber-500 hover:bg-amber-600 text-white',
  overdue: 'bg-red-500 hover:bg-red-600 text-white',
  cancelled: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Частичная оплата
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    getInvoice(id)
      .then(setInvoice)
      .catch(() => router.push('/invoices'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleStatusChange(newStatus: string) {
    if (!invoice) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateInvoiceStatus(id, newStatus);
      setInvoice(updated);
    } catch { /* ignore */ }
    setUpdatingStatus(false);
  }

  async function handleRecordPayment() {
    if (!invoice || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError(t('invoiceDetail.enterValidAmount'));
      return;
    }
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const updated = await recordPayment(id, amount, paymentDate);
      setInvoice(updated);
      setPaymentAmount('');
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : t('invoiceDetail.failedToRecordPayment'));
    }
    setPaymentLoading(false);
  }

  if (loading || !invoice) return <Loading />;

  const transitions = INVOICE_STATUS_TRANSITIONS[invoice.status] || [];
  const paidAmount = Number(invoice.paidAmount) || 0;
  const totalAmount = Number(invoice.amount) || 0;
  const remaining = totalAmount - paidAmount;
  const paidPercent = totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{invoice.invoiceNumber}</h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-slate-500">{t('invoiceDetail.created')} {new Date(invoice.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={() => router.push('/invoices')} className="btn-secondary text-sm">
            {t('invoiceDetail.backToList')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('invoiceDetail.details')}</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.client')}</dt>
              <dd className="font-medium">{invoice.client?.companyName || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.shipment')}</dt>
              <dd className="font-medium">{invoice.shipment?.referenceNumber || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.amount')}</dt>
              <dd className="font-medium text-lg">{totalAmount.toLocaleString()} {invoice.currency}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.currency')}</dt>
              <dd className="font-medium">{invoice.currency}</dd>
            </div>
          </dl>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('invoiceDetail.dates')}</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.issued')}</dt>
              <dd className="font-medium">{new Date(invoice.issuedDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.due')}</dt>
              <dd className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.paid')}</dt>
              <dd className="font-medium">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('invoiceDetail.created')}</dt>
              <dd className="font-medium">{new Date(invoice.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {/* Прогресс оплаты */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('invoiceDetail.paymentProgress')}</h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">{t('invoiceDetail.paidLabel')}: <span className="font-medium text-slate-900">{paidAmount.toLocaleString()} {invoice.currency}</span></span>
            <span className="text-slate-500">{t('invoiceDetail.remaining')}: <span className="font-medium text-slate-900">{remaining.toLocaleString()} {invoice.currency}</span></span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${paidPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{paidPercent.toFixed(0)}% {t('invoiceDetail.paidPercent')}</p>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('common.notes')}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Форма частичной оплаты */}
      {(invoice.status === 'partially_paid' || invoice.status === 'sent' || invoice.status === 'overdue') && remaining > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('invoiceDetail.recordPayment')}</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('invoiceDetail.amount')} ({invoice.currency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remaining}
                value={paymentAmount}
                onChange={(e) => { setPaymentAmount(e.target.value); setPaymentError(''); }}
                placeholder={`Max: ${remaining.toLocaleString()}`}
                className="input-field w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('invoiceDetail.paymentDate')}</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="input-field w-44"
              />
            </div>
            <button
              onClick={handleRecordPayment}
              disabled={paymentLoading || !paymentAmount}
              className="btn-primary disabled:opacity-50"
            >
              {paymentLoading ? t('invoiceDetail.recording') : t('invoiceDetail.recordPayment')}
            </button>
          </div>
          {paymentError && <p className="text-sm text-red-600 mt-2">{paymentError}</p>}
        </div>
      )}

      {/* Status Transition */}
      {transitions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">{t('invoiceDetail.updateStatus')}</h3>
          <div className="flex gap-2">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${INV_BTN_STYLES[s] || 'bg-slate-500 hover:bg-slate-600 text-white'}`}
              >
                {INVOICE_STATUS_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
