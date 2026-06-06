'use client';

import Link from 'next/link';
import { forwardRef, useRef, useState } from 'react';
import { DEFAULT_ACCOUNT_CONTENT } from '@/lib/cmsContent';

const FIELD_PATHS = {
  name: 'name',
  email: 'email',
  password: 'password',
  privacyPolicyAccepted: 'privacyPolicyAccepted',
};

export default function AccountLoginClient({ content = DEFAULT_ACCOUNT_CONTENT }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    privacyPolicyAccepted: false,
    marketingEmailConsent: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const privacyRef = useRef(null);

  const fieldRefs = {
    name: nameRef,
    email: emailRef,
    password: passwordRef,
    privacyPolicyAccepted: privacyRef,
  };

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function switchMode(next) {
    setMode(next);
    setFieldErrors({});
    setGlobalError('');
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGlobalError('');

    const path = mode === 'login' ? '/api/customer/auth/login' : '/api/customer/auth/register';
    const payload =
      mode === 'login'
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            privacyPolicyAccepted: form.privacyPolicyAccepted,
            privacyPolicyVersion: '2026-06-06',
            marketingEmailConsent: form.marketingEmailConsent,
          };

    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      if (body.issues?.length) {
        const errors = {};
        let firstField = null;
        for (const issue of body.issues) {
          const field = issue.path;
          if (FIELD_PATHS[field]) {
            errors[field] = issue.message;
            if (!firstField) firstField = field;
          }
        }
        setFieldErrors(errors);
        if (firstField && fieldRefs[firstField]?.current) {
          fieldRefs[firstField].current.focus();
        } else if (body.issues[0]) {
          setGlobalError(body.issues[0].message);
        }
      } else {
        setGlobalError(body.error || 'Something went wrong. Please try again.');
      }
      return;
    }

    window.location.href = '/account';
  }

  return (
    <main className="page-enter min-h-screen bg-cream-100 px-6 pb-20 pt-28 text-charcoal md:px-10">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_460px]">
        <div className="rounded-none border-y border-charcoal/10 py-8 lg:py-10">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-light leading-tight md:text-6xl">
            {content.heading}
          </h1>
          <p className="mt-5 max-w-md font-sans text-sm leading-7 text-charcoal/60">
            {content.authIntro || content.intro}
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3 lg:max-w-3xl">
            {(content.features || []).slice(0, 3).map((feature) => (
              <div key={feature.title} className="border border-charcoal/10 bg-cream-200/60 p-4">
                <h2 className="font-serif text-xl font-light">{feature.title}</h2>
                <p className="mt-2 font-sans text-xs leading-5 text-charcoal/55">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-charcoal/10 bg-cream-200 p-6 shadow-[0_18px_60px_rgba(28,24,20,0.08)] md:p-8">
          <div className="mb-6 grid grid-cols-2 border border-charcoal/10 bg-cream-100 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] ${
                mode === 'login' ? 'bg-charcoal text-cream-100' : 'text-charcoal/55'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] ${
                mode === 'register' ? 'bg-charcoal text-cream-100' : 'text-charcoal/55'
              }`}
            >
              Register
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-3xl font-light">
              {mode === 'login' ? content.loginTitle : content.registerTitle}
            </h2>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === 'register' && (
              <>
                <Field
                  ref={nameRef}
                  label="Name"
                  value={form.name}
                  onChange={(value) => update('name', value)}
                  required
                  error={fieldErrors.name}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) => update('phone', value)}
                />
              </>
            )}

            <Field
              ref={emailRef}
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => update('email', value)}
              required
              error={fieldErrors.email}
            />

            <Field
              ref={passwordRef}
              label="Password"
              type="password"
              value={form.password}
              onChange={(value) => update('password', value)}
              required
              minLength={mode === 'register' ? 8 : undefined}
              hint={mode === 'register' && !fieldErrors.password ? 'Minimum 8 characters.' : undefined}
              error={fieldErrors.password}
            />

            {mode === 'register' && (
              <>
                <div>
                  <label
                    ref={privacyRef}
                    className={`flex items-start gap-2 font-sans text-xs leading-6 ${
                      fieldErrors.privacyPolicyAccepted ? 'text-terracotta' : 'text-charcoal/65'
                    }`}
                  >
                    <input
                      type="checkbox"
                      required
                      checked={form.privacyPolicyAccepted}
                      onChange={(event) => update('privacyPolicyAccepted', event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      I accept the{' '}
                      <Link href="/privacy" className="underline hover:text-charcoal">
                        privacy policy
                      </Link>{' '}
                      for account creation and order management.
                    </span>
                  </label>
                  {fieldErrors.privacyPolicyAccepted && (
                    <p className="mt-1 font-sans text-[11px] text-terracotta">{fieldErrors.privacyPolicyAccepted}</p>
                  )}
                </div>

                <label className="flex items-start gap-2 font-sans text-xs leading-6 text-charcoal/65">
                  <input
                    type="checkbox"
                    checked={form.marketingEmailConsent}
                    onChange={(event) => update('marketingEmailConsent', event.target.checked)}
                    className="mt-1"
                  />
                  <span>I agree to receive occasional product and studio emails.</span>
                </label>
              </>
            )}

            {globalError && (
              <div className="border border-terracotta/30 bg-terracotta/5 px-4 py-3 font-sans text-sm text-terracotta">
                {globalError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-charcoal px-5 py-4 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cream-100 hover:bg-terracotta disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

const Field = forwardRef(function Field({ label, value, onChange, type = 'text', required = false, minLength, hint, error }, ref) {
  return (
    <label className="block">
      <span
        className={`mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] ${
          error ? 'text-terracotta' : 'text-charcoal/45'
        }`}
      >
        {label}
      </span>
      <input
        ref={ref}
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full border px-3 py-3 font-sans text-sm outline-none transition-colors focus:border-charcoal ${
          error
            ? 'border-terracotta bg-terracotta/5 focus:border-terracotta'
            : 'border-charcoal/15 bg-transparent'
        }`}
      />
      {error ? (
        <span className="mt-1 block font-sans text-[11px] text-terracotta">{error}</span>
      ) : hint ? (
        <span className="mt-1 block font-sans text-[11px] text-charcoal/40">{hint}</span>
      ) : null}
    </label>
  );
});
