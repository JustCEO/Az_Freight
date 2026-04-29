import { get, post, patch } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types';

export interface ShipmentRequestSummary {
  id: string;
  requesterName: string;
  requesterEmail: string;
  companyName: string | null;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  cargoType: string;
  transportTypes: string[];
  transportOrder: string[];
  status: string;
  isUrgent: boolean;
  assignedTo: { id: string; name: string } | null;
  carrier: { id: string; companyName: string } | null;
  _count: { documents: number };
  createdAt: string;
}

export interface ShipmentRequestDetail extends ShipmentRequestSummary {
  requesterPhone: string | null;
  voen: string | null;
  cargoSubtype: string | null;
  cargoDescription: string;
  weightKg: number | null;
  volumeCbm: number | null;
  packageCount: number | null;
  declaredValue: number | null;
  currency: string;
  incoterms: string | null;
  hsCode: string | null;
  preferredDate: string | null;
  specialRequirements: Record<string, unknown> | null;
  notes: string | null;
  rejectionReason: string | null;
  shipmentId: string | null;
  carrierId: string | null;
  client: { id: string; companyName: string } | null;
  documents: {
    id: string;
    fileKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    docType: string;
    createdAt: string;
  }[];
}

export function listShipmentRequests(params: Record<string, string | number | undefined>) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return get<PaginatedResponse<ShipmentRequestSummary>>(`/shipment-requests?${query}`);
}

export function getShipmentRequest(id: string) {
  return get<ShipmentRequestDetail>(`/shipment-requests/${id}`);
}

export function updateRequestStatus(id: string, data: { status: string; assignedToId?: string; notes?: string; rejectionReason?: string }) {
  return patch<ShipmentRequestDetail>(`/shipment-requests/${id}/status`, data);
}

export function assignCarrierToRequest(id: string, carrierId: string) {
  return patch<ShipmentRequestDetail>(`/shipment-requests/${id}/assign-carrier`, { carrierId });
}

export function convertRequest(id: string) {
  return post<{ shipment: unknown; client: unknown }>(`/shipment-requests/${id}/convert`);
}

export function getNewRequestCount() {
  return get<number>('/shipment-requests/new-count');
}

export function createManualRequest(data: Record<string, unknown>) {
  return post<ShipmentRequestDetail>('/shipment-requests/manual', data);
}

export function searchContacts(q: string) {
  return get<{
    clients: { id: string; companyName: string; email: string | null; phone: string | null }[];
    leads: { id: string; contactName: string; companyName: string | null; email: string; phone: string | null; status: string }[];
  }>(`/shipment-requests/search-contacts?q=${encodeURIComponent(q)}`);
}
