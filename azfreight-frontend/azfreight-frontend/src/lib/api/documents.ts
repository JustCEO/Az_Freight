import { get, del } from '@/lib/api-client';
import type { Document } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function getDocument(id: string): Promise<Document> {
  return get<Document>(`/documents/${id}`);
}

export async function getDocumentVersions(id: string): Promise<Document[]> {
  return get<Document[]>(`/documents/${id}/versions`);
}

export async function listDocuments(entityType: string, entityId: string): Promise<Document[]> {
  return get<Document[]>(`/documents?entityType=${entityType}&entityId=${entityId}`);
}

export async function uploadDocument(
  file: File,
  docType: string,
  linkedEntityType: string,
  linkedEntityId: string,
  description?: string,
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);
  formData.append('linkedEntityType', linkedEntityType);
  formData.append('linkedEntityId', linkedEntityId);
  if (description) formData.append('description', description);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Upload failed');
  }

  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  return del<void>(`/documents/${id}`);
}
