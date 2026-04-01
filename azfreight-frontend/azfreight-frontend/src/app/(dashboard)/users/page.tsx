'use client';

import { useEffect, useState, useCallback } from 'react';
import { listUsers, updateUser, toggleUserActive, deleteUser } from '@/lib/api/users';
import { useAuth } from '@/context/auth-context';
import type { User, PaginatedResponse } from '@/types';
import { ROLE_LABELS } from '@/lib/constants';
import Loading from '@/components/loading';

const EDITABLE_ROLES = ['admin', 'manager', 'accountant'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res: PaginatedResponse<User> = await listUsers({ limit: 100 });
      setUsers(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: false } : u));
    } catch { /* ignore */ }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Users</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={!u.isActive ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {u.name}
                      {isSelf && <span className="ml-2 text-xs text-blue-600">(you)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingRoleId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="text-xs border border-slate-200 rounded px-2 py-1"
                          >
                            {EDITABLE_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRoleChange(u.id)} className="text-blue-600 text-xs font-medium">Save</button>
                          <button onClick={() => setEditingRoleId(null)} className="text-slate-400 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!isSelf && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingRoleId(u.id); setNewRole(u.role); }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Edit Role
                          </button>
                          {u.isActive ? (
                            <button
                              onClick={() => handleToggleActive(u.id, false)}
                              className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(u.id, true)}
                              className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
