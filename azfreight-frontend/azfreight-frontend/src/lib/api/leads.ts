import { get, post, patch, del } from '@/lib/api-client';

export interface Lead {
  id: string;
  tenantId: string;
  companyName: string | null;
  contactName: string;
  email: string;
  phone: string | null;
  source: 'PORTAL' | 'MANUAL';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  notes: string | null;
  convertedToClientId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { requests: number };
  requests?: {
    id: string;
    requesterName: string;
    originCity: string;
    destinationCity: string;
    cargoType: string;
    status: string;
    requestStatus: string;
    createdAt: string;
  }[];
}

export function listLeads(status?: string) {
  const qs = status ? `?status=${status}` : '';
  return get<Lead[]>(`/leads${qs}`);
}

export function getLead(id: string) {
  return get<Lead>(`/leads/${id}`);
}

export function createLead(data: { contactName: string; email: string; phone?: string; companyName?: string; notes?: string }) {
  return post<Lead>('/leads', data);
}

export function updateLead(id: string, data: Partial<Lead>) {
  return patch<Lead>(`/leads/${id}`, data);
}

export function convertLead(id: string) {
  return post<{ lead: { id: string; status: string }; client: { id: string; companyName: string } }>(`/leads/${id}/convert`, {});
}

export function deleteLead(id: string) {
  return del<void>(`/leads/${id}`);
}
