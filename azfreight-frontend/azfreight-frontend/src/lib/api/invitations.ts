import { get, post, del } from '@/lib/api-client';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  invitedBy: { id: string; name: string };
  createdAt: string;
  inviteUrl?: string;
}

export function listInvitations() {
  return get<Invitation[]>('/invitations');
}

export function createInvitation(data: { email: string; role: string; expiresInDays?: number }) {
  return post<Invitation>('/invitations', data);
}

export function deleteInvitation(id: string) {
  return del<void>(`/invitations/${id}`);
}
