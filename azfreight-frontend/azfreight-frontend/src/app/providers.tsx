'use client';

import { AuthProvider } from '@/context/auth-context';
import { LocaleProvider } from '@/lib/i18n';
import { TenantSwitchProvider } from '@/context/tenant-switch-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <TenantSwitchProvider>{children}</TenantSwitchProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
