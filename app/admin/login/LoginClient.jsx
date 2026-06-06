'use client';

import { useState } from 'react';

export default function LoginClient({ showLocalFallback = false }) {
  const [email, setEmail] = useState('owner@wildcat.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(body.error || 'Login failed.');
      return;
    }
    window.location.href = '/admin';
  }

  return (
    <main className="min-h-screen bg-cream-100 px-6 py-20 text-charcoal">
      <div className="mx-auto max-w-md border border-charcoal/10 bg-cream-200 p-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-500">
          Wild Cat Ceramic
        </p>
        <h1 className="mt-2 font-serif text-4xl font-light">Backoffice login</h1>
        <p className="mt-3 font-sans text-sm leading-6 text-charcoal/60">
          Use the configured backoffice credentials.
          {showLocalFallback && (
            <span>
              {' '}Local development fallback password:
              <span className="font-semibold"> wildcat-admin-demo</span>.
            </span>
          )}
        </p>
        <a
          href="/admin/configurator"
          className="mt-4 inline-block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-terracotta underline"
        >
          First-start configurator
        </a>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <label>
            <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-charcoal/15 bg-transparent px-3 py-3 font-sans text-sm outline-none focus:border-charcoal"
            />
          </label>
          <label>
            <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-charcoal/15 bg-transparent px-3 py-3 font-sans text-sm outline-none focus:border-charcoal"
            />
          </label>
          {error && <p className="font-sans text-sm text-terracotta">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-charcoal px-5 py-4 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cream-100 hover:bg-terracotta disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
