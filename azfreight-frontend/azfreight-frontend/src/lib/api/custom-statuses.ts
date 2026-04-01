import { get, post, put, patch, del } from '@/lib/api-client';
import type { CustomStatus } from '@/types';

export function listCustomStatuses() {
  return get<CustomStatus[]>('/custom-statuses');
}

export function createCustomStatus(data: { name: string; color?: string; order?: number }) {
  return post<CustomStatus>('/custom-statuses', data);
}

export function updateCustomStatus(id: string, data: { name?: string; color?: string; order?: number }) {
  return put<CustomStatus>(`/custom-statuses/${id}`, data);
}

export function deleteCustomStatus(id: string) {
  return del<void>(`/custom-statuses/${id}`);
}

export function assignCustomStatus(shipmentId: string, data: { customStatusId?: string; customStatusNote?: string }) {
  return patch<unknown>(`/shipments/${shipmentId}/custom-status`, data);
}
