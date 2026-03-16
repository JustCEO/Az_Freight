import { get, post, put, patch, del } from '@/lib/api-client';
import type { Shipment, ShipmentStatusLog, PaginatedResponse } from '@/types';

export async function listShipments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedResponse<Shipment>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return get<PaginatedResponse<Shipment>>(`/shipments${qs ? `?${qs}` : ''}`);
}

export async function getShipment(id: string): Promise<Shipment> {
  return get<Shipment>(`/shipments/${id}`);
}

export async function createShipment(data: Record<string, unknown>): Promise<Shipment> {
  return post<Shipment>('/shipments', data);
}

export async function updateShipment(id: string, data: Record<string, unknown>): Promise<Shipment> {
  return put<Shipment>(`/shipments/${id}`, data);
}

export async function updateShipmentStatus(
  id: string,
  status: string,
  comment?: string
): Promise<Shipment> {
  return patch<Shipment>(`/shipments/${id}/status`, { status, comment });
}

export async function getTimeline(id: string): Promise<ShipmentStatusLog[]> {
  return get<ShipmentStatusLog[]>(`/shipments/${id}/timeline`);
}

export async function removeShipment(id: string): Promise<Shipment> {
  return del<Shipment>(`/shipments/${id}`);
}
