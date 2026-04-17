import { get, post, patch, del } from '@/lib/api-client';

// Типы для суперадмин панели

export interface TenantWithStats {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; shipmentRequests: number };
}

export interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  totalRequests: number;
  totalShipments: number;
  activeTenants: number;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

// Получить статистику платформы
export function getStats() {
  return get<PlatformStats>('/superadmin/stats');
}

// Получить список тенантов
export function listTenants() {
  return get<TenantWithStats[]>('/superadmin/tenants');
}

// Создать нового тенанта
export function createTenant(data: {
  name: string;
  slug: string;
  plan: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  return post<TenantWithStats>('/superadmin/tenants', data);
}

// Обновить тенанта
export function updateTenant(
  id: string,
  data: { plan?: string; maxUsers?: number; isActive?: boolean }
) {
  return patch<TenantWithStats>(`/superadmin/tenants/${id}`, data);
}

// Деактивировать тенанта
export function deactivateTenant(id: string) {
  return del<void>(`/superadmin/tenants/${id}`);
}

// Получить пользователей тенанта
export function getTenantUsers(id: string) {
  return get<TenantUser[]>(`/superadmin/tenants/${id}/users`);
}

// Все пользователи с привязкой к тенанту
export interface PlatformUser extends TenantUser {
  tenantId: string;
  tenant: { id: string; name: string; slug: string };
}

export function getAllUsers() {
  return get<PlatformUser[]>('/superadmin/users');
}

// Пригласить пользователя в тенант
export function inviteToTenant(id: string, data: { email: string; role: string }) {
  return post<void>(`/superadmin/tenants/${id}/invite`, data);
}

// Назначить пользователя в тенант
export function assignUserToTenant(
  id: string,
  data: { userId?: string; email?: string; name?: string; role?: string }
) {
  return post<void>(`/superadmin/tenants/${id}/assign-user`, data);
}
