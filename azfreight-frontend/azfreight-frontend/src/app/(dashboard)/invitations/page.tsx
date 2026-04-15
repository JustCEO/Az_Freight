'use client';

import { useEffect, useState, useCallback } from 'react';
import { listInvitations, createInvitation, deleteInvitation, type Invitation } from '@/lib/api/invitations';
import { ROLE_LABELS } from '@/lib/constants';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

export default function InvitationsPage() {
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('client');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const data = await listInvitations();
      setInvitations(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const inv = await createInvitation({ email, role, expiresInDays });
      setInvitations((prev) => [inv, ...prev]);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  };

  const copyLink = (inv: Invitation) => {
    const url = inv.inviteUrl || `${window.location.origin}/portal/*/register?invite=${inv.token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatus = (inv: Invitation) => {
    if (inv.usedAt) return { label: 'invitationsPage.used', color: 'bg-green-100 text-green-700' };
    if (new Date(inv.expiresAt) < new Date()) return { label: 'invitationsPage.expired', color: 'bg-slate-100 text-slate-500' };
    return { label: 'clientsList.active', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('invitationsPage.title')}</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('invitationsPage.sendInvitation')}</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field w-64" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('invitationsPage.role')}</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
              {Object.entries(ROLE_LABELS)
                .filter(([k]) => k !== 'superadmin')
                .map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('invitationsPage.expiresDays')}</label>
            <input type="number" value={expiresInDays} onChange={(e) => setExpiresInDays(Number(e.target.value))} min={1} max={30} className="input-field w-24" />
          </div>
          <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
            {creating ? t('invitationsPage.sending') : t('invitationsPage.sendInvitation')}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('invitationsPage.invitedBy')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('invitationsPage.expires')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invitations.map((inv) => {
                  const status = getStatus(inv);
                  return (
                    <tr key={inv.id}>
                      <td className="px-6 py-4 text-sm text-slate-900">{inv.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{ROLE_LABELS[inv.role] || inv.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>{t(status.label)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{inv.invitedBy?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {!inv.usedAt && new Date(inv.expiresAt) > new Date() && (
                            <button onClick={() => copyLink(inv)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                              {copiedId === inv.id ? t('invitationsPage.copied') : t('invitationsPage.copyLink')}
                            </button>
                          )}
                          {!inv.usedAt && (
                            <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                              {t('invitationsPage.revoke')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invitations.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">{t('invitationsPage.noInvitationsYet')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
