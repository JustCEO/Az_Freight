import { get, post, put, patch, del } from '@/lib/api-client';
import type { User, PaginatedResponse, UserPreferences } from '@/types';

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

export function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  sendInvitation?: boolean;
  invitationExpiresInDays?: number;
}) {
  return post<User & { inviteUrl?: string }>('/users', data);
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

export function deleteUserPermanently(id: string) {
  return del<{ deleted: boolean; name: string }>(`/users/${id}/permanent`);
}

export function getPreferences() {
  return get<UserPreferences>('/users/me/preferences');
}

export function updatePreferences(data: { locale?: string; theme?: string; timezone?: string; currency?: string }) {
  return patch<UserPreferences>('/users/me/preferences', data);
}
