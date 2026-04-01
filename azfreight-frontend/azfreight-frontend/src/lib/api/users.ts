import { get, put, patch, del } from '@/lib/api-client';
import type { User, PaginatedResponse } from '@/types';

export function listUsers(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return get<PaginatedResponse<User>>(`/users${qs ? `?${qs}` : ''}`);
}

export function getUser(id: string) {
  return get<User>(`/users/${id}`);
}

export function updateUser(id: string, data: Record<string, unknown>) {
  return put<User>(`/users/${id}`, data);
}

export function toggleUserActive(id: string, isActive: boolean) {
  return patch<User>(`/users/${id}/toggle-active`, { isActive });
}

export function deleteUser(id: string) {
  return del<User>(`/users/${id}`);
}
