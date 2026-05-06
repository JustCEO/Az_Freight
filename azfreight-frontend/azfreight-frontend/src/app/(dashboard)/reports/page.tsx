'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import Loading from '@/components/loading';
import {
  getOverview, getMonthlyStats, getTopRoutes, getTopClients, getCarrierPerformance,
  type ReportOverview, type MonthlyStats, type TopRoute, type TopClient, type CarrierPerformance,
} from '@/lib/api/reports';

const STATUS_COLORS: Record<string, string> = {
  request: '#64748B', confirmed: '#3B82F6', in_transit: '#F59E0B',
  customs: '#EA580C', delivered: '#10B981', cancelled: '#EF4444',
};

export default function ReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStats[]>([]);
  const [routes, setRoutes] = useState<TopRoute[]>([]);
  const [clients, setClients] = useState<TopClient[]>([]);
  const [carriers, setCarriers] = useState<CarrierPerformance[]>([]);

  useEffect(() => {
    Promise.all([
      getOverview().catch(() => null),
      getMonthlyStats().catch(() => []),
      getTopRoutes().catch(() => []),
      getTopClients().catch(() => []),
      getCarrierPerformance().catch(() => []),
    ]).then(([ov, mo, ro, cl, ca]) => {
      setOverview(ov);
      setMonthly(mo);
      setRoutes(ro);
      setClients(cl);
      setCarriers(ca);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const maxMonthlyRev = Math.max(...monthly.map((m) => m.revenue), 1);
  const maxRouteCount = Math.max(...routes.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('reports.title')}</h1>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.totalShipments')}</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">{overview.totalShipments}</div>
            <div className="text-xs text-blue-600 mt-1">{overview.activeShipments} {t('reports.active')}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.revenue')}</div>
            <div className="text-3xl font-bold text-emerald-700 mt-1">${fmt(overview.revenue.totalClientRate)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.profit')}</div>
            <div className="text-3xl font-bold text-blue-700 mt-1">${fmt(overview.revenue.totalProfit)}</div>
            <div className="text-xs text-slate-500 mt-1">{t('reports.margin')}: {overview.revenue.totalClientRate ? ((overview.revenue.totalProfit / overview.revenue.totalClientRate) * 100).toFixed(1) : 0}%</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-sm text-slate-500">{t('reports.clients')}</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">{overview.totalClients}</div>
            <div className="text-xs text-slate-500 mt-1">{overview.totalInvoices} {t('reports.invoices')}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue — CSS bars */}
        {monthly.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.monthlyRevenue')}</h2>
            <div className="space-y-3">
              {monthly.map((m) => (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{m.month.slice(5)}</span>
                    <span>${fmt(m.revenue)}</span>
                  </div>
                  <div className="flex gap-1 h-5">
                    <div className="bg-blue-500 rounded-sm" style={{ width: `${(m.revenue / maxMonthlyRev) * 100}%` }} title={`${t('reports.revenue')}: $${fmt(m.revenue)}`} />
                    <div className="bg-amber-400 rounded-sm" style={{ width: `${(m.cost / maxMonthlyRev) * 100}%` }} title={`${t('reports.cost')}: $${fmt(m.cost)}`} />
                    <div className="bg-emerald-500 rounded-sm" style={{ width: `${(m.profit / maxMonthlyRev) * 100}%` }} title={`${t('reports.profit')}: $${fmt(m.profit)}`} />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm" />{t('reports.revenue')}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-sm" />{t('reports.cost')}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm" />{t('reports.profit')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status breakdown — CSS bars */}
        {overview && overview.shipmentsByStatus.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.byStatus')}</h2>
            <div className="space-y-3">
              {overview.shipmentsByStatus.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.status] || '#94A3B8' }} />
                  <span className="text-sm text-slate-700 w-24">{t('statuses.' + s.status)}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: STATUS_COLORS[s.status] || '#94A3B8',
                        width: `${(s.count / Math.max(overview.totalShipments, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Routes — horizontal bars */}
        {routes.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.topRoutes')}</h2>
            <div className="space-y-3">
              {routes.slice(0, 8).map((r) => (
                <div key={r.route}>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="truncate mr-2">{r.route}</span>
                    <span className="shrink-0">{r.count}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(r.count / maxRouteCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Volume — simple numbers */}
        {monthly.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('reports.monthlyVolume')}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {monthly.map((m) => (
                <div key={m.month} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{m.shipments}</div>
                  <div className="text-xs text-slate-500 mt-1">{m.month.slice(5)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{t('reports.topClients')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">{t('common.company')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.shipments')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.revenue')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.profit')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((c) => (
                    <tr key={c.clientId}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.companyName}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{c.shipments}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">${fmt(c.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-right text-emerald-700">${fmt(c.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {carriers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{t('reports.carrierPerformance')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">{t('reports.carrier')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.shipments')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.totalCost')}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">{t('reports.rating')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {carriers.map((c) => (
                    <tr key={c.carrierId}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.companyName}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{c.shipments}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">${fmt(c.totalCost)}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{c.rating ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
