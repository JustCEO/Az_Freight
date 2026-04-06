'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C6.5 3 2 6.5 2 6.5L5 18h14l3-11.5S17.5 3 12 3zM2 21h20M7 18v3M17 18v3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{t('auth.signInTitle')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('auth.signInSubtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">{t('common.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder={t('auth.emailPlaceholder')}
            required
          />
        </div>
        <div>
          <label className="label-field">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder={t('auth.passwordPlaceholder')}
            required
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? t('auth.signingIn') : t('auth.signIn')}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
}
