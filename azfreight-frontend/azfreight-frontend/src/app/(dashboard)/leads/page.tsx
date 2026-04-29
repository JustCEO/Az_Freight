'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { listLeads, createLead, type Lead } from '@/lib/api/leads';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-amber-100 text-amber-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-700',
};

const SOURCE_COLORS: Record<string, string> = {
  PORTAL: 'bg-purple-100 text-purple-700',
  MANUAL: 'bg-slate-100 text-slate-600',
};

const STATUSES = ['', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export default function LeadsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const data = await listLeads(statusFilter || undefined);
      setLeads(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const lead = await createLead({ contactName: name, email, phone: phone || undefined, companyName: company || undefined, notes: notes || undefined });
      setLeads((prev) => [lead, ...prev]);
      setName(''); setEmail(''); setPhone(''); setCompany(''); setNotes('');
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
    setCreating(false);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('leads.title')}</h1>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-44">
            <option value="">{t('shipmentsList.allStatuses')}</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{t('leads.' + s)}</option>
            ))}
          </select>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            + {t('leads.addLead')}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.name')} *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')} *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.phone')}</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.company')}</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-field w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.notes')}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field w-full" rows={2} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">{creating ? t('common.loading') : t('leads.addLead')}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">{t('common.cancel')}</button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('leads.contactName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.company')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('leads.source')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('leads.requests')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.map((lead) => (
                <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{lead.contactName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{lead.companyName || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{lead.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[lead.source]}`}>
                      {t('leads.' + lead.source)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                      {t('leads.' + lead.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{lead._count?.requests ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">{t('leads.noLeads')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
