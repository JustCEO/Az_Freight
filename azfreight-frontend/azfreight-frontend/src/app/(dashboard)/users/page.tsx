'use client';

import { useEffect, useState, useCallback } from 'react';
import { listUsers, createUser, updateUser, toggleUserActive, deleteUserPermanently } from '@/lib/api/users';
import { listInvitations, deleteInvitation, type Invitation } from '@/lib/api/invitations';
import { getAllUsers, type PlatformUser } from '@/lib/api/superadmin';
import { useAuth } from '@/context/auth-context';
import type { User } from '@/types';
import { ROLE_LABELS } from '@/lib/constants';
import Loading from '@/components/loading';
import { useTranslation } from '@/lib/i18n';

const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 100, director: 80, admin: 70, hr: 60, manager: 50,
  logistics_agent: 40, dispatcher: 40, warehouse_manager: 40,
  accountant: 30, client: 10,
};

function getCreatableRoles(actorRole: string): string[] {
  const level = ROLE_HIERARCHY[actorRole] ?? 0;
  return Object.entries(ROLE_HIERARCHY)
    .filter(([r, l]) => l < level && r !== 'superadmin')
    .map(([r]) => r);
}

interface TenantGroup { id: string; name: string; users: PlatformUser[]; }

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [users, setUsers] = useState<User[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  // Active tenant group for superadmin view (null = all users)
  const [activeTenant, setActiveTenant] = useState<string | null>(null);

  // Create user form
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [sendInvitation, setSendInvitation] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const creatableRoles = currentUser ? getCreatableRoles(currentUser.role) : [];
  const canManageUsers = creatableRoles.length > 0;

  const fetchData = useCallback(async () => {
    try {
      if (isSuperAdmin) {
        const all = await getAllUsers();
        setPlatformUsers(all);
      } else {
        const [usersRes, invRes] = await Promise.all([
          listUsers({ limit: 100 }),
          canManageUsers ? listInvitations().catch(() => []) : Promise.resolve([]),
        ]);
        setUsers(usersRes.data);
        setInvitations(invRes as Invitation[]);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [canManageUsers, isSuperAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (creatableRoles.length > 0 && !createRole) {
      setCreateRole(creatableRoles[0]);
    }
  }, [creatableRoles, createRole]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setInviteUrl('');
    try {
      const result = await createUser({
        name: createName, email: createEmail,
        password: sendInvitation ? undefined : createPassword,
        role: createRole, phone: createPhone || undefined,
        sendInvitation,
      });
      setUsers((prev) => [result, ...prev]);
      if (result.inviteUrl) {
        setInviteUrl(result.inviteUrl);
      } else {
        setCreateName(''); setCreateEmail(''); setCreatePassword('');
        setCreatePhone(''); setSendInvitation(false); setShowCreate(false);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed');
    }
    setCreating(false);
  };

  const handleRoleChange = async (userId: string) => {
    if (!newRole) return;
    try {
      const updated = await updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updated } : u));
      setEditingRoleId(null);
    } catch { /* ignore */ }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    if (userId === currentUser?.id) return;
    try {
      const updated = await toggleUserActive(userId, isActive);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updated } : u));
    } catch { /* ignore */ }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) return;
    const input = prompt(`To permanently delete user "${userName}", type the name exactly:`);
    if (input !== userName) {
      if (input !== null) alert('Name does not match. Deletion cancelled.');
      return;
    }
    try {
      await deleteUserPermanently(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    try {
      await deleteInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  };

  const activeInvitations = invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date());

  // Group users by tenant for superadmin view
  const tenantGroups: TenantGroup[] = isSuperAdmin
    ? Object.values(
        platformUsers.reduce<Record<string, TenantGroup>>((acc, u) => {
          const key = u.tenant.id;
          if (!acc[key]) acc[key] = { id: u.tenant.id, name: u.tenant.name, users: [] };
          acc[key].users.push(u);
          return acc;
        }, {})
      )
    : [];

  const displayedUsers = isSuperAdmin
    ? (activeTenant ? platformUsers.filter((u) => u.tenantId === activeTenant) : platformUsers)
    : users;

  if (loading) return <Loading />;

  // SuperAdmin view: tenant-grouped layout
  if (isSuperAdmin) {
    return (
      <div className="flex gap-6">
        {/* Left sidebar: tenant groups */}
        <aside className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-3 sticky top-4">
            <button
              onClick={() => setActiveTenant(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                activeTenant === null ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{t('usersPage.allUsers')}</span>
                <span className="text-xs text-slate-400">({platformUsers.length})</span>
              </div>
            </button>
            <div className="border-t border-slate-100 my-2" />
            {tenantGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveTenant(g.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTenant === g.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{g.name}</span>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">({g.users.length})</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            {activeTenant ? tenantGroups.find((g) => g.id === activeTenant)?.name : t('usersPage.allUsers')}
          </h1>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.email')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('invitationsPage.role')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('usersPage.company')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('usersPage.lastLogin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedUsers.map((u) => {
                    const pu = u as PlatformUser;
                    return (
                      <tr key={pu.id} className={!pu.isActive ? 'opacity-50' : ''}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{pu.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{pu.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {ROLE_LABELS[pu.role] || pu.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{pu.tenant.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pu.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {pu.isActive ? t('clientsList.active') : t('clientsList.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {pu.lastLogin ? new Date(pu.lastLogin).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {displayedUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">{t('usersPage.noUsersFound')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular tenant view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('users.title')}</h1>
        <div className="flex gap-2">
          {activeInvitations.length > 0 && (
            <button
              onClick={() => setShowInvitations(!showInvitations)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {t('invitationsPage.title')} ({activeInvitations.length})
            </button>
          )}
          {canManageUsers && (
            <button onClick={() => { setShowCreate(!showCreate); setInviteUrl(''); }} className="btn-primary">
              + {t('usersPage.createUser')}
            </button>
          )}
        </div>
      </div>

      {showCreate && canManageUsers && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('usersPage.createUser')}</h2>

          {inviteUrl ? (
            <div className="space-y-3">
              <p className="text-sm text-emerald-700">{t('usersPage.userCreated')}</p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                <input type="text" value={inviteUrl} readOnly className="input-field flex-1 text-xs" />
                <button
                  onClick={() => { navigator.clipboard.writeText(inviteUrl); setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000); }}
                  className="btn-primary text-xs px-3 py-1"
                >
                  {copiedUrl ? t('invitationsPage.copied') : t('invitationsPage.copyLink')}
                </button>
              </div>
              <button onClick={() => { setInviteUrl(''); setCreateName(''); setCreateEmail(''); setCreatePassword(''); setCreatePhone(''); setSendInvitation(false); }} className="text-sm text-blue-600 hover:text-blue-800">
                {t('usersPage.createAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.name')} *</label>
                  <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} required className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')} *</label>
                  <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('invitationsPage.role')} *</label>
                  <select value={createRole} onChange={(e) => setCreateRole(e.target.value)} className="input-field w-full">
                    {creatableRoles.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.phone')}</label>
                  <input type="text" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} className="input-field w-full" />
                </div>
                {!sendInvitation && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.password')} *</label>
                    <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required={!sendInvitation} minLength={8} className="input-field w-full md:w-1/2" placeholder={t('auth.minPassword')} />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendInvitation} onChange={(e) => setSendInvitation(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-slate-700">{t('usersPage.sendInvitationLink')}</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
                  {creating ? t('common.loading') : t('usersPage.createUser')}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">{t('common.cancel')}</button>
              </div>
              {createError && <p className="text-sm text-red-600">{createError}</p>}
            </form>
          )}
        </div>
      )}

      {showInvitations && activeInvitations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">{t('invitationsPage.title')}</h3>
          <div className="space-y-2">
            {activeInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-slate-900">{inv.email}</span>
                  <span className="text-slate-500 ml-2">{ROLE_LABELS[inv.role] || inv.role}</span>
                  <span className="text-slate-400 ml-2">{t('invitationsPage.expires')}: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                </div>
                <button onClick={() => handleRevokeInvite(inv.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                  {t('invitationsPage.revoke')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('invitationsPage.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('usersPage.lastLogin')}</th>
                {canManageUsers && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(users as User[]).map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={!u.isActive ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {u.name}
                      {isSelf && <span className="ml-2 text-xs text-blue-600">{t('usersPage.you')}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingRoleId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="text-xs border border-slate-200 rounded px-2 py-1">
                            {creatableRoles.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRoleChange(u.id)} className="text-blue-600 text-xs font-medium">{t('common.save')}</button>
                          <button onClick={() => setEditingRoleId(null)} className="text-slate-400 text-xs">{t('common.cancel')}</button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? t('clientsList.active') : t('clientsList.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
                    </td>
                    {canManageUsers && (
                      <td className="px-6 py-4 text-sm">
                        {!isSelf && (
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingRoleId(u.id); setNewRole(u.role); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                              {t('users.editRole')}
                            </button>
                            {u.isActive ? (
                              <button onClick={() => handleToggleActive(u.id, false)} className="text-amber-600 hover:text-amber-800 text-xs font-medium">
                                {t('users.deactivate')}
                              </button>
                            ) : (
                              <button onClick={() => handleToggleActive(u.id, true)} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">
                                {t('users.activate')}
                              </button>
                            )}
                            <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                              {t('common.delete')}
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={canManageUsers ? 6 : 5} className="px-6 py-8 text-center text-sm text-slate-500">{t('usersPage.noUsersFound')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
