const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  portalEnabled: boolean;
  portalThemeColor: string | null;
  portalLogoUrl: string | null;
  portalWelcomeText: string | null;
  logoUrl: string | null;
}

export async function getTenantInfo(slug: string): Promise<TenantInfo> {
  const res = await fetch(`${API_URL}/public/${slug}/info`);
  if (!res.ok) throw new Error('Tenant not found');
  return res.json();
}

export async function submitShipmentRequest(
  tenantSlug: string,
  formData: FormData,
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_URL}/public/${tenantSlug}/requests`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message);
  }
  return res.json();
}

export async function registerByInvite(data: {
  token: string;
  name: string;
  password: string;
  phone?: string;
}): Promise<{ user: { id: string; email: string; name: string; role: string }; tenant: { id: string; name: string; slug: string } }> {
  const res = await fetch(`${API_URL}/auth/register-by-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(err.message);
  }
  return res.json();
}
