import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AzFreight — Freight Management',
  description: 'Multi-tenant freight logistics management system',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch {}
        ` }} />
      </head>
      <body style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
