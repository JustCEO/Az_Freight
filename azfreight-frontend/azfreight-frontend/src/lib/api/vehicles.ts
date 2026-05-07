import { get, post, put, del } from '@/lib/api-client';

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  capacityTons: number | null;
  volumeCbm: number | null;
  insuranceExpiry: string | null;
  inspectionExpiry: string | null;
  tirCarnetExpiry: string | null;
  gpsTrackerId: string | null;
  gpsProvider: string | null;
  status: string;
  fuelType: string | null;
  driverId: string | null;
  driver?: { id: string; name: string } | null;
  createdAt: string;
}

export const listVehicles = (search?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const qs = params.toString();
  return get<Vehicle[]>(`/vehicles${qs ? `?${qs}` : ''}`);
};

export const getVehicle = (id: string) => get<Vehicle>(`/vehicles/${id}`);
export const createVehicle = (data: Record<string, unknown>) => post<Vehicle>('/vehicles', data);
export const updateVehicle = (id: string, data: Record<string, unknown>) => put<Vehicle>(`/vehicles/${id}`, data);
export const deleteVehicle = (id: string) => del<void>(`/vehicles/${id}`);
