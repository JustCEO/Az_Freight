'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  listTenants,
  getTenantUsers,
  updateTenant,
  deactivateTenant,
  deleteTenantPermanently,
  inviteToTenant,
  assignUserToTenant,
  type TenantWithStats,
  type TenantUser,
} from '@/lib/api/superadmin';
import { useTranslation } from '@/lib/i18n';

// Доступные вкладки
type Tab = 'overview' | 'users' | 'settings';

// Доступные планы
const PLANS = ['starter', 'business', 'pro', 'corporate'];

// Доступные роли пользователей
const ROLES = ['admin', 'manager', 'accountant', 'client'];

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantWithStats | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояние формы приглашения
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('manager');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Состояние формы назначения пользователя
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({ email: '', name: '', role: 'manager' });
  const [assignLoading, setAssignLoading] = useState(false);

  // Состояние настроек
  const [settingsPlan, setSettingsPlan] = useState('');
  const [settingsMaxUsers, setSettingsMaxUsers] = useState(10);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Загрузка данных тенанта
  const loadTenant = useCallback(async () => {
    try {
      const tenants = await listTenants();
      const found = tenants.find((t) => t.id === tenantId);
      if (!found) {
        setError(t('superadmin.tenantNotFound'));
        return;
      }
      setTenant(found);
      setSettingsPlan(found.plan);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('superadmin.errorLoading'));
    }
  }, [tenantId, t]);

  // Загрузка пользователей тенанта
  const loadUsers = useCallback(async () => {
    try {
      const data = await getTenantUsers(tenantId);
      setUsers(data);
    } catch {
      // Ошибка загрузки пользователей — не критичная
    }
  }, [tenantId]);

  useEffect(() => {
    Promise.all([loadTenant(), loadUsers()]).finally(() => setLoading(false));
  }, [loadTenant, loadUsers]);

  // Отправка приглашения
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await inviteToTenant(tenantId, { email: inviteEmail, role: inviteRole });
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('manager');
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('superadmin.errorInviting'));
    } finally {
      setInviteLoading(false);
    }
  };

  // Назначение пользователя
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await assignUserToTenant(tenantId, assignData);
      setShowAssignForm(false);
      setAssignData({ email: '', name: '', role: 'manager' });
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('superadmin.errorAssigning'));
    } finally {
      setAssignLoading(false);
    }
  };

  // Сохранение настроек
  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await updateTenant(tenantId, { plan: settingsPlan, maxUsers: settingsMaxUsers });
      await loadTenant();
      alert(t('superadmin.settingsSaved'));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('superadmin.errorSaving'));
    } finally {
      setSettingsLoading(false);
    }
  };

  // Деактивация/активация тенанта
  const handleToggleActive = async () => {
    if (!tenant) return;
    const action = tenant.isActive ? t('superadmin.deactivateTenant').toLowerCase() : t('superadmin.activateTenant').toLowerCase();
    if (!confirm(`${t('superadmin.confirmToggle')} ${action} "${tenant.name}"?`)) return;

    try {
      if (tenant.isActive) {
        await deactivateTenant(tenantId);
      } else {
        await updateTenant(tenantId, { isActive: true });
      }
      await loadTenant();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('superadmin.errorGeneral'));
    }
  };

  const handleDeletePermanently = async () => {
    if (!tenant) return;
    const name = tenant.name;
    const input = prompt(`To permanently delete "${name}" and ALL its data, type the tenant name exactly:`);
    if (input !== name) {
      if (input !== null) alert('Name does not match. Deletion cancelled.');
      return;
    }
    try {
      await deleteTenantPermanently(tenantId);
      alert(`Tenant "${name}" has been permanently deleted.`);
      router.push('/superadmin/tenants');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete tenant');
    }
  };

  if (loading) {
    return <div className="text-slate-500">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!tenant) return null;

  // Определения вкладок
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('superadmin.overview') },
    { key: 'users', label: t('superadmin.usersTab') },
    { key: 'settings', label: t('superadmin.settingsTab') },
  ];

  return (
    <div>
      {/* Навигация назад */}
      <Link
        href="/superadmin/tenants"
        className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
      >
        {t('superadmin.backToList')}
      </Link>

      {/* Заголовок тенанта */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{tenant.name}</h1>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {tenant.isActive ? t('superadmin.active') : t('superadmin.inactive')}
        </span>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое вкладки: Обзор */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">{t('superadmin.tenantName')}</p>
              <p className="font-medium text-slate-800">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('superadmin.tenantSlug')}</p>
              <p className="font-medium text-slate-800">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('superadmin.plan')}</p>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {tenant.plan}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('superadmin.createdDate')}</p>
              <p className="font-medium text-slate-800">
                {new Date(tenant.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('superadmin.usersTab')}</p>
              <p className="font-medium text-slate-800">{tenant._count?.users ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('superadmin.totalRequests')}</p>
              <p className="font-medium text-slate-800">{tenant._count?.shipmentRequests ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Содержимое вкладки: Пользователи */}
      {activeTab === 'users' && (
        <div>
          {/* Кнопки действий */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => { setShowInviteForm(true); setShowAssignForm(false); }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('superadmin.invite')}
            </button>
            <button
              onClick={() => { setShowAssignForm(true); setShowInviteForm(false); }}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('superadmin.assignUser')}
            </button>
          </div>

          {/* Форма приглашения */}
          {showInviteForm && (
            <form
              onSubmit={handleInvite}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex items-end gap-4"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('superadmin.role')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {inviteLoading ? t('superadmin.sending') : t('common.submit')}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 bg-gray-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </form>
          )}

          {/* Форма назначения пользователя */}
          {showAssignForm && (
            <form
              onSubmit={handleAssign}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex items-end gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')}</label>
                <input
                  type="email"
                  value={assignData.email}
                  onChange={(e) => setAssignData((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('common.name')}</label>
                <input
                  type="text"
                  value={assignData.name}
                  onChange={(e) => setAssignData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder={t('superadmin.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('superadmin.role')}</label>
                <select
                  value={assignData.role}
                  onChange={(e) => setAssignData((p) => ({ ...p, role: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={assignLoading}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {assignLoading ? t('superadmin.assigning') : t('superadmin.assign')}
              </button>
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="px-4 py-2 bg-gray-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </form>
          )}

          {/* Таблица пользователей */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 font-medium text-slate-600">{t('common.name')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-600">{t('common.email')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.role')}</th>
                  <th className="text-center px-6 py-3 font-medium text-slate-600">{t('common.status')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.lastLogin')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-600">{t('superadmin.createdDate')}</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      {t('superadmin.noUsers')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                      <td className="px-6 py-4 text-slate-500">{user.email}</td>
                      <td className="px-6 py-4">
                        {/* Бейдж роли */}
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? t('superadmin.active') : t('superadmin.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('ru-RU')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Содержимое вкладки: Настройки */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 max-w-xl">
          {/* План подписки */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('superadmin.plan')}</label>
            <select
              value={settingsPlan}
              onChange={(e) => setSettingsPlan(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Максимальное количество пользователей */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('superadmin.maxUsers')}
            </label>
            <input
              type="number"
              value={settingsMaxUsers}
              onChange={(e) => setSettingsMaxUsers(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Кнопка сохранения */}
          <button
            onClick={handleSaveSettings}
            disabled={settingsLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {settingsLoading ? t('superadmin.saving') : t('superadmin.saveSettings')}
          </button>

          {/* Разделитель */}
          <hr className="border-slate-200" />

          {/* Зона опасных действий */}
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-2">{t('superadmin.dangerZone')}</h3>
            <p className="text-sm text-slate-500 mb-3">
              {tenant.isActive
                ? t('superadmin.deactivateWarning')
                : t('superadmin.activateWarning')}
            </p>
            <button
              onClick={handleToggleActive}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                tenant.isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {tenant.isActive ? t('superadmin.deactivateTenantFull') : t('superadmin.activateTenantFull')}
            </button>

            <hr className="border-slate-200 my-4" />

            <h3 className="text-sm font-medium text-red-600 mb-2">Permanent Deletion</h3>
            <p className="text-sm text-slate-500 mb-3">
              Permanently delete this tenant and ALL associated data (users, shipments, invoices, clients, etc.). This action cannot be undone.
            </p>
            <button
              onClick={handleDeletePermanently}
              className="px-6 py-2.5 font-medium rounded-lg bg-red-900 text-white hover:bg-red-800 transition-colors"
            >
              Delete Tenant Permanently
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
