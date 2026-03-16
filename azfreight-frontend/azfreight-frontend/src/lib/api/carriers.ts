import { get, post, put, del } from '@/lib/api-client';
import type { Carrier, PaginatedResponse } from '@/types';

export async function listCarriers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Carrier>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return get<PaginatedResponse<Carrier>>(`/carriers${qs ? `?${qs}` : ''}`);
}

export async function getCarrier(id: string): Promise<Carrier> {
  return get<Carrier>(`/carriers/${id}`);
}

export async function createCarrier(data: Record<string, unknown>): Promise<Carrier> {
  return post<Carrier>('/carriers', data);
}

export async function updateCarrier(id: string, data: Record<string, unknown>): Promise<Carrier> {
  return put<Carrier>(`/carriers/${id}`, data);
}

export async function removeCarrier(id: string): Promise<Carrier> {
  return del<Carrier>(`/carriers/${id}`);
}
