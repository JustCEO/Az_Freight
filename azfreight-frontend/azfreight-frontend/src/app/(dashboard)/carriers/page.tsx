'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { listCarriers } from '@/lib/api/carriers';
import type { Carrier } from '@/types';
import Pagination from '@/components/pagination';
import Loading from '@/components/loading';
import { TRANSPORT_LABELS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const ASSESSMENT_BADGE: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function CarriersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assessmentFilter, setAssessmentFilter] = useState('');
  const [blacklistedFilter, setBlacklistedFilter] = useState(false);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit, search: search || undefined };
      if (assessmentFilter) params.assessmentStatus = assessmentFilter;
      if (blacklistedFilter) params.isBlacklisted = true;
      const res = await listCarriers(params as Parameters<typeof listCarriers>[0]);
      setCarriers(res.data);
      setTotal(res.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search, assessmentFilter, blacklistedFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder={t('carriersList.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field w-64"
        />
        <select
          value={assessmentFilter}
          onChange={(e) => { setAssessmentFilter(e.target.value); setPage(1); }}
          className="input-field w-48"
        >
          <option value="">{t('avlVendors.assessmentStatus')}: {t('shipmentsList.allStatuses')}</option>
          <option value="IN_PROGRESS">{t('avlVendors.status.IN_PROGRESS')}</option>
          <option value="APPROVED">{t('avlVendors.status.APPROVED')}</option>
          <option value="REJECTED">{t('avlVendors.status.REJECTED')}</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
          <input
            type="checkbox"
            checked={blacklistedFilter}
            onChange={(e) => { setBlacklistedFilter(e.target.checked); setPage(1); }}
            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          {t('avlVendors.blacklisted')}
        </label>
        <div className="flex-1" />
        <Link href="/carriers/new" className="btn-primary">{t('avlVendors.new')}</Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.companyName')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.transportTypes')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.country')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('avlVendors.assessmentStatus')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('avlVendors.blacklisted')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.rating')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('carriersList.shipments')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {carriers.map((c, idx) => {
                    const rec = c as unknown as Record<string, unknown>;
                    const assessmentStatus = (rec.assessmentStatus as string) || '';
                    const isBlacklisted = !!rec.isBlacklisted;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => router.push(`/carriers/${c.id}`)}
                        className={`cursor-pointer hover:bg-slate-50 ${isBlacklisted ? 'opacity-60 border-l-4 border-red-400' : ''} ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.companyName}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {(c.transportTypes || []).map((tp) => (
                              <span key={tp} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                {TRANSPORT_LABELS[tp] || tp}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.country || '—'}</td>
                        <td className="px-6 py-4">
                          {assessmentStatus ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ASSESSMENT_BADGE[assessmentStatus] || 'bg-slate-100 text-slate-600'}`}>
                              {t(`avlVendors.status.${assessmentStatus}`)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {isBlacklisted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              {t('avlVendors.blacklisted')}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.rating ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{c.totalShipments}</td>
                      </tr>
                    );
                  })}
                  {carriers.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">{t('carriersList.noCarriersFound')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
