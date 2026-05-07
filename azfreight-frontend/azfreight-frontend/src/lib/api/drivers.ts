import { get, post, put, del } from '@/lib/api-client';

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseCategories: string[];
  medicalExpiry: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  status: string;
  createdAt: string;
  vehicles?: { id: string; plateNumber: string }[];
}

export const listDrivers = (search?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const qs = params.toString();
  return get<Driver[]>(`/drivers${qs ? `?${qs}` : ''}`);
};

export const getDriver = (id: string) => get<Driver>(`/drivers/${id}`);
export const createDriver = (data: Record<string, unknown>) => post<Driver>('/drivers', data);
export const updateDriver = (id: string, data: Record<string, unknown>) => put<Driver>(`/drivers/${id}`, data);
export const deleteDriver = (id: string) => del<void>(`/drivers/${id}`);
