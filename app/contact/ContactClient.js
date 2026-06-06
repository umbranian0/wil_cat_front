'use client';

import { useState } from 'react';
import siteConfig from '@/lib/config';

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, submittedAt: startedAt }),
    });
    const body = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setError(body.error || 'Could not send the message.');
      return;
    }

    setSent(true);
    setForm({ name: '', email: '', message: '', website: '' });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="page-enter pt-28 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500 block mb-3">
            Get in touch
          </span>
          <h1 className="font-serif text-[clamp(36px,5vw,48px)] font-normal text-charcoal mb-3">
            Contact
          </h1>
          <p className="font-sans text-[15px] text-charcoal-muted max-w-[380px] mx-auto">
            Questions about an order, custom pieces, or collaborations? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <a
            href={`mailto:${siteConfig.orderEmail}`}
            className="bg-cream-200 p-6 text-center transition-all hover:-translate-y-0.5 block"
          >
            <div className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-cream-500 mb-2">
              Email
            </div>
            <div className="font-sans text-[14px] font-medium text-charcoal">
              {siteConfig.orderEmail}
            </div>
          </a>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cream-200 p-6 text-center transition-all hover:-translate-y-0.5 block"
          >
            <div className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-cream-500 mb-2">
              WhatsApp
            </div>
            <div className="font-sans text-[14px] font-medium text-charcoal">
              {siteConfig.whatsappDisplay}
            </div>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            className="hidden"
            tabIndex="-1"
            autoComplete="off"
            value={form.website}
            onChange={e => setForm({ ...form, website: e.target.value })}
          />
          <FormField
            label="Name"
            required
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="Your name"
          />
          <FormField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="your@email.com"
          />
          <div>
            <label className="font-sans text-[12px] font-medium tracking-[0.05em] uppercase text-cream-500 block mb-2">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full bg-transparent border border-cream-400 px-4 py-3 font-sans text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors resize-vertical"
              placeholder="Tell us what you need..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`font-sans text-[13px] font-semibold tracking-[0.1em] uppercase py-4 border-none cursor-pointer transition-all ${
              sent
                ? 'bg-[#4A7C59] text-white'
                : 'bg-charcoal text-cream-100 hover:bg-charcoal-light'
            } disabled:opacity-60`}
          >
            {submitting ? 'Sending...' : sent ? 'Message sent' : 'Send message'}
          </button>
          {error && <p className="font-sans text-[13px] text-terracotta">{error}</p>}
        </form>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label className="font-sans text-[12px] font-medium tracking-[0.05em] uppercase text-cream-500 block mb-2">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent border border-cream-400 px-4 py-3 font-sans text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}
