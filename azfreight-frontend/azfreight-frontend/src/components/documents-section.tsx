'use client';

import { useEffect, useState, useCallback } from 'react';
import { listDocuments, uploadDocument, deleteDocument } from '@/lib/api/documents';
import type { Document } from '@/types';

interface DocumentsSectionProps {
  entityType: string;
  entityId: string;
  documentTypes: string[];
  canUpload?: boolean;
  canDelete?: boolean;
  title?: string;
}

function formatSize(bytes: number | string | null): string {
  const n = Number(bytes);
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsSection({
  entityType,
  entityId,
  documentTypes,
  canUpload = true,
  canDelete = true,
  title = 'Documents',
}: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(documentTypes[0] || 'other');

  const load = useCallback(async () => {
    try {
      const docs = await listDocuments(entityType, entityId);
      setDocuments(docs);
    } catch {
      setDocuments([]);
    }
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file, docType, entityType, entityId);
      await load();
    } catch { /* ignore */ }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{title}</h3>
        {canUpload && (
          <div className="flex items-center gap-2">
            <select
              className="input-field w-40 text-xs"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              {documentTypes.map((dt) => (
                <option key={dt} value={dt}>{dt.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
            <label className={`btn-secondary text-xs cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? 'Uploading...' : '+ Upload'}
              <input type="file" className="hidden" disabled={uploading} onChange={handleUpload} />
            </label>
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">No documents attached</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded shrink-0">
                  {doc.docType?.replace(/_/g, ' ') || 'file'}
                </span>
                <span className="text-sm text-slate-900 truncate">{doc.originalName}</span>
                <span className="text-xs text-slate-400 shrink-0">{formatSize(doc.sizeBytes)}</span>
                <span className="text-xs text-slate-400 shrink-0">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium shrink-0 ml-2"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
