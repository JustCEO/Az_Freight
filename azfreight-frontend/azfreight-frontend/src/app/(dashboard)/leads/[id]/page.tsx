'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLead, updateLead, convertLead, deleteLead, type Lead } from '@/lib/api/leads';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-amber-100 text-amber-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-700',
};

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    getLead(id).then(setLead).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    try {
      const updated = await updateLead(id, { status: newStatus as Lead['status'] });
      setLead({ ...lead, ...updated });
    } catch { /* ignore */ }
  };

  const handleConvert = async () => {
    if (!lead) return;
    setConverting(true);
    try {
      const result = await convertLead(id);
      router.push(`/clients/${result.client.id}`);
    } catch { /* ignore */ }
    setConverting(false);
  };

  const handleDelete = async () => {
    try {
      await deleteLead(id);
      router.push('/leads');
    } catch { /* ignore */ }
  };

  if (loading) return <Loading />;
  if (!lead) return <div className="text-center py-8 text-slate-500">Lead not found</div>;

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.push('/leads')} className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        &larr; {t('leads.title')}
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.contactName}</h1>
          <p className="text-slate-500">{lead.companyName || lead.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={lead.status === 'CONVERTED'}
            className="input-field text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t('leads.' + s)}</option>
            ))}
          </select>
          {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
            <button onClick={handleConvert} disabled={converting} className="btn-primary text-sm">
              {converting ? t('common.loading') : t('leads.convertToClient')}
            </button>
          )}
          <button onClick={handleDelete} className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('leads.contactInfo')}</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">{t('common.name')}</dt><dd className="font-medium">{lead.contactName}</dd></div>
            <div><dt className="text-slate-500">{t('common.email')}</dt><dd className="font-medium">{lead.email}</dd></div>
            {lead.phone && <div><dt className="text-slate-500">{t('common.phone')}</dt><dd className="font-medium">{lead.phone}</dd></div>}
            {lead.companyName && <div><dt className="text-slate-500">{t('common.company')}</dt><dd className="font-medium">{lead.companyName}</dd></div>}
            <div><dt className="text-slate-500">{t('leads.source')}</dt><dd><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{t('leads.' + lead.source)}</span></dd></div>
            <div><dt className="text-slate-500">{t('common.status')}</dt><dd><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>{t('leads.' + lead.status)}</span></dd></div>
            <div><dt className="text-slate-500">{t('common.date')}</dt><dd>{new Date(lead.createdAt).toLocaleDateString()}</dd></div>
            {lead.notes && <div><dt className="text-slate-500">{t('common.notes')}</dt><dd className="text-slate-700">{lead.notes}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('leads.associatedRequests')}</h2>
          {lead.requests && lead.requests.length > 0 ? (
            <div className="space-y-3">
              {lead.requests.map((r) => (
                <div key={r.id} onClick={() => router.push(`/requests/${r.id}`)} className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{r.originCity} → {r.destinationCity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.requestStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {r.requestStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{r.cargoType} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t('leads.noRequests')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
