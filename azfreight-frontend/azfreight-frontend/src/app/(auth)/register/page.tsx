'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    tenantName: '',
    tenantSlug: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'tenantName') {
        next.tenantSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Start managing your freight operations</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Company Name</label>
          <input
            type="text"
            value={form.tenantName}
            onChange={(e) => updateField('tenantName', e.target.value)}
            className="input-field"
            placeholder="Acme Logistics"
            required
          />
        </div>
        <div>
          <label className="label-field">Company Slug</label>
          <input
            type="text"
            value={form.tenantSlug}
            onChange={(e) => updateField('tenantSlug', e.target.value)}
            className="input-field"
            placeholder="acme-logistics"
            required
          />
          <p className="text-xs text-slate-400 mt-1">Auto-generated from company name</p>
        </div>
        <div>
          <label className="label-field">Your Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="input-field"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="label-field">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="input-field"
            placeholder="john@acme.com"
            required
          />
        </div>
        <div>
          <label className="label-field">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="input-field"
            placeholder="Min 8 characters"
            minLength={8}
            required
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
