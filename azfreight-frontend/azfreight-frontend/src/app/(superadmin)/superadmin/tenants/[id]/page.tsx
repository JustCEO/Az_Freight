'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  listTenants,
  getTenantUsers,
  updateTenant,
  deactivateTenant,
  inviteToTenant,
  assignUserToTenant,
  type TenantWithStats,
  type TenantUser,
} from '@/lib/api/superadmin';

// Доступные вкладки
type Tab = 'overview' | 'users' | 'settings';

// Доступные планы
const PLANS = ['starter', 'business', 'pro', 'corporate'];

// Доступные роли пользователей
const ROLES = ['admin', 'manager', 'accountant', 'client'];

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
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
        setError('Тенант не найден');
        return;
      }
      setTenant(found);
      setSettingsPlan(found.plan);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  }, [tenantId]);

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
      alert(err instanceof Error ? err.message : 'Ошибка приглашения');
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
      alert(err instanceof Error ? err.message : 'Ошибка назначения');
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
      alert('Настройки сохранены');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Деактивация/активация тенанта
  const handleToggleActive = async () => {
    if (!tenant) return;
    const action = tenant.isActive ? 'деактивировать' : 'активировать';
    if (!confirm(`Вы уверены, что хотите ${action} тенант "${tenant.name}"?`)) return;

    try {
      if (tenant.isActive) {
        await deactivateTenant(tenantId);
      } else {
        await updateTenant(tenantId, { isActive: true });
      }
      await loadTenant();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Загрузка...</div>;
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
    { key: 'overview', label: 'Обзор' },
    { key: 'users', label: 'Пользователи' },
    { key: 'settings', label: 'Настройки' },
  ];

  return (
    <div>
      {/* Навигация назад */}
      <Link
        href="/superadmin/tenants"
        className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
      >
        ← Назад к списку
      </Link>

      {/* Заголовок тенанта */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{tenant.name}</h1>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {tenant.isActive ? 'Активен' : 'Неактивен'}
        </span>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое вкладки: Обзор */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Название</p>
              <p className="font-medium text-gray-800">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Slug</p>
              <p className="font-medium text-gray-800">{tenant.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">План</p>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {tenant.plan}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Дата создания</p>
              <p className="font-medium text-gray-800">
                {new Date(tenant.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Пользователей</p>
              <p className="font-medium text-gray-800">{tenant._count?.users ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Заявок</p>
              <p className="font-medium text-gray-800">{tenant._count?.shipmentRequests ?? 0}</p>
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
              Пригласить
            </button>
            <button
              onClick={() => { setShowAssignForm(true); setShowInviteForm(false); }}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Назначить пользователя
            </button>
          </div>

          {/* Форма приглашения */}
          {showInviteForm && (
            <form
              onSubmit={handleInvite}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-end gap-4"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
                {inviteLoading ? 'Отправка...' : 'Отправить'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            </form>
          )}

          {/* Форма назначения пользователя */}
          {showAssignForm && (
            <form
              onSubmit={handleAssign}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-end gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={assignData.email}
                  onChange={(e) => setAssignData((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={assignData.name}
                  onChange={(e) => setAssignData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="Имя Фамилия"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <select
                  value={assignData.role}
                  onChange={(e) => setAssignData((p) => ({ ...p, role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
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
                {assignLoading ? 'Назначение...' : 'Назначить'}
              </button>
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
            </form>
          )}

          {/* Таблица пользователей */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Имя</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Роль</th>
                  <th className="text-center px-6 py-3 font-medium text-gray-600">Статус</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Последний вход</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Создан</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      Пользователи не найдены
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
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
                          {user.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('ru-RU')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 max-w-xl">
          {/* План подписки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">План</label>
            <select
              value={settingsPlan}
              onChange={(e) => setSettingsPlan(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Макс. пользователей
            </label>
            <input
              type="number"
              value={settingsMaxUsers}
              onChange={(e) => setSettingsMaxUsers(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Кнопка сохранения */}
          <button
            onClick={handleSaveSettings}
            disabled={settingsLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {settingsLoading ? 'Сохранение...' : 'Сохранить настройки'}
          </button>

          {/* Разделитель */}
          <hr className="border-gray-200" />

          {/* Зона опасных действий */}
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-2">Опасная зона</h3>
            <p className="text-sm text-gray-500 mb-3">
              {tenant.isActive
                ? 'Деактивация заблокирует доступ для всех пользователей этого тенанта.'
                : 'Активация восстановит доступ для всех пользователей этого тенанта.'}
            </p>
            <button
              onClick={handleToggleActive}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                tenant.isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {tenant.isActive ? 'Деактивировать тенант' : 'Активировать тенант'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
