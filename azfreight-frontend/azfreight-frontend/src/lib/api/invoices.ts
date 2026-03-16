import { get, post, put, patch } from '@/lib/api-client';
import type { Invoice, PaginatedResponse } from '@/types';

export async function listInvoices(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Invoice>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return get<PaginatedResponse<Invoice>>(`/invoices${qs ? `?${qs}` : ''}`);
}

export async function getInvoice(id: string): Promise<Invoice> {
  return get<Invoice>(`/invoices/${id}`);
}

export async function createInvoice(data: Record<string, unknown>): Promise<Invoice> {
  return post<Invoice>('/invoices', data);
}

export async function updateInvoice(id: string, data: Record<string, unknown>): Promise<Invoice> {
  return put<Invoice>(`/invoices/${id}`, data);
}

export async function updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
  return patch<Invoice>(`/invoices/${id}/status`, { status });
}
