import { get, post, put, del } from '@/lib/api-client';
import type { Client, PaginatedResponse } from '@/types';

export async function listClients(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Client>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return get<PaginatedResponse<Client>>(`/clients${qs ? `?${qs}` : ''}`);
}

export async function getClient(id: string): Promise<Client> {
  return get<Client>(`/clients/${id}`);
}

export async function createClient(data: Record<string, unknown>): Promise<Client> {
  return post<Client>('/clients', data);
}

export async function updateClient(id: string, data: Record<string, unknown>): Promise<Client> {
  return put<Client>(`/clients/${id}`, data);
}

export async function removeClient(id: string): Promise<Client> {
  return del<Client>(`/clients/${id}`);
}
