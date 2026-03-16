import { get } from '@/lib/api-client';
import type { Document } from '@/types';

export async function getDocument(id: string): Promise<Document> {
  return get<Document>(`/documents/${id}`);
}

export async function getDocumentVersions(id: string): Promise<Document[]> {
  return get<Document[]>(`/documents/${id}/versions`);
}
