'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  listCustomStatuses,
  createCustomStatus,
  updateCustomStatus,
  deleteCustomStatus,
} from '@/lib/api/custom-statuses';
import type { CustomStatus } from '@/types';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

const DEFAULT_STATUSES: { key: string; color: string }[] = [
  { key: 'request', color: '#64748B' },
  { key: 'confirmed', color: '#3B82F6' },
  { key: 'in_transit', color: '#F59E0B' },
  { key: 'customs', color: '#EA580C' },
  { key: 'delivered', color: '#10B981' },
  { key: 'cancelled', color: '#EF4444' },
];

const PARENT_KEYS = DEFAULT_STATUSES.map((s) => s.key);

export default function CustomStatusesPage() {
  const { t } = useTranslation();
  const [statuses, setStatuses] = useState<CustomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [parentStatus, setParentStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editParent, setEditParent] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const data = await listCustomStatuses();
      setStatuses(data.sort((a, b) => a.order - b.order));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const status = await createCustomStatus({
        name,
        color,
        order: statuses.length,
        parentStatus: parentStatus || undefined,
      });
      setStatuses((prev) => [...prev, status]);
      setName('');
      setColor('#6B7280');
      setParentStatus('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomStatus(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  const startEdit = (s: CustomStatus) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditColor(s.color);
    setEditParent(s.parentStatus || '');
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      const updated = await updateCustomStatus(editingId, {
        name: editName,
        color: editColor,
        parentStatus: editParent || null,
      });
      setStatuses((prev) => prev.map((s) => s.id === editingId ? updated : s));
      setEditingId(null);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <Link href="/shipments" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        &larr; {t('nav.shipments')}
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('customStatuses.title')}</h1>

      {/* Built-in statuses */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('customStatuses.builtIn')}</h2>
        <p className="text-xs text-slate-500 mb-4">{t('customStatuses.builtInHint')}</p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_STATUSES.map((s) => (
            <span
              key={s.key}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: s.color }}
            >
              {t('statuses.' + s.key)}
            </span>
          ))}
        </div>
      </div>

      {/* Форма создания */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('customStatuses.create')}</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field w-64" placeholder="e.g. At warehouse" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('customStatuses.color')}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="input-field w-24 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('customStatuses.parentStatus')}</label>
            <select value={parentStatus} onChange={(e) => setParentStatus(e.target.value)} className="input-field w-44">
              <option value="">{t('customStatuses.parentNone')}</option>
              {PARENT_KEYS.map((k) => (
                <option key={k} value={k}>{t('statuses.' + k)}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
            {creating ? t('common.loading') : t('common.create')}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">{t('customStatuses.parentHint')}</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Список статусов */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <Loading />
        ) : statuses.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">{t('customStatuses.noStatuses')}</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {statuses.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                {editingId === s.id ? (
                  <>
                    <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field flex-1" />
                    <select value={editParent} onChange={(e) => setEditParent(e.target.value)} className="input-field w-44 text-sm">
                      <option value="">{t('customStatuses.parentNone')}</option>
                      {PARENT_KEYS.map((k) => (
                        <option key={k} value={k}>{t('statuses.' + k)}</option>
                      ))}
                    </select>
                    <button onClick={handleUpdate} className="text-blue-600 text-sm font-medium hover:text-blue-800">{t('common.save')}</button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 text-sm hover:text-slate-600">{t('common.cancel')}</button>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 text-sm font-medium text-slate-900">{s.name}</span>
                    {s.parentStatus && (
                      <span className="text-xs text-slate-500">
                        &rarr; {t('statuses.' + s.parentStatus)}
                      </span>
                    )}
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.name}
                    </span>
                    <button onClick={() => startEdit(s)} className="text-blue-600 text-xs font-medium hover:text-blue-800">{t('common.edit')}</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 text-xs font-medium hover:text-red-700">{t('common.delete')}</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
