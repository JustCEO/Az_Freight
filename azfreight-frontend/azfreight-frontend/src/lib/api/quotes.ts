import { get, post, patch, del } from '@/lib/api-client';

export interface QuoteLine { id: string; description: string; quantity: number; unitPrice: number; total: number; }
export interface Quote {
  id: string; quoteNumber: string; status: string;
  originCountry: string; originCity: string; destCountry: string; destCity: string;
  transportType: string; cargoType?: string; weightKg?: number; volumeCbm?: number;
  currency: string; subtotal: number; vatRate: number; vatAmount: number; total: number; margin?: number;
  validUntil: string; notes?: string; createdAt: string;
  client?: { id: string; companyName: string } | null;
  lines?: QuoteLine[];
}

export const listQuotes = (status?: string) => get<Quote[]>(`/quotes${status ? `?status=${status}` : ''}`);
export const getQuote = (id: string) => get<Quote>(`/quotes/${id}`);
export const createQuote = (data: Record<string, unknown>) => post<Quote>('/quotes', data);
export const updateQuote = (id: string, data: Record<string, unknown>) => patch<Quote>(`/quotes/${id}`, data);
export const convertQuote = (id: string) => post<unknown>(`/quotes/${id}/convert`, {});
export const deleteQuote = (id: string) => del<void>(`/quotes/${id}`);
