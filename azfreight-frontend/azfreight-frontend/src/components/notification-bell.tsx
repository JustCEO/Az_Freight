'use client';

import { useEffect, useState, useCallback } from 'react';
import { get, patch } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/api-client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const c = await get<number>('/notifications/unread-count');
      setCount(c);
    } catch { /* ignore */ }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const all = await get<Notification[]>('/notifications');
      setNotifications(all);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchAll();
  };

  const markRead = async (id: string) => {
    try {
      await patch(`/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await patch('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-2 text-slate-500 hover:text-slate-700">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-xl border border-slate-200 shadow-xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              {count > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                        {n.message && <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>}
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
