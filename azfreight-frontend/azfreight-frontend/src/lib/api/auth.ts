import { get, post, setTokens } from '@/lib/api-client';
import type { LoginResponse, RegisterResponse, User } from '@/types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await post<LoginResponse>('/auth/login', { email, password });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function register(body: {
  tenantName: string;
  tenantSlug: string;
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const data = await post<RegisterResponse>('/auth/register', body);
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function getMe(): Promise<User> {
  return get<User>('/auth/me');
}

export async function logout(): Promise<void> {
  await post('/auth/logout');
}
