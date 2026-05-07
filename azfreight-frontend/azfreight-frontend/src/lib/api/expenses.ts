import { get, post, patch, del } from '@/lib/api-client';

export interface Expense {
  id: string;
  shipmentId: string;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  vatRate: number | null;
  vatAmount: number | null;
  date: string;
  createdAt: string;
  shipment?: { id: string; referenceNumber: string };
  createdBy?: { id: string; name: string };
}

export interface ShipmentPL {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  currency: string;
  items: Expense[];
}

export const listExpenses = (shipmentId?: string) =>
  get<Expense[]>(`/expenses${shipmentId ? `?shipmentId=${shipmentId}` : ''}`);

export const getExpense = (id: string) => get<Expense>(`/expenses/${id}`);

export const createExpense = (data: Record<string, unknown>) => post<Expense>('/expenses', data);

export const updateExpense = (id: string, data: Record<string, unknown>) => patch<Expense>(`/expenses/${id}`, data);

export const deleteExpense = (id: string) => del<void>(`/expenses/${id}`);

export const getShipmentPL = (shipmentId: string) => get<ShipmentPL>(`/expenses/shipment/${shipmentId}/pl`);
