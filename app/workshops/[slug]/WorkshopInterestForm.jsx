'use client';

import { useState } from 'react';
import siteConfig from '@/lib/config';

const EMPTY = { name: '', email: '', phone: '', participants: '1', message: '', website: '' };

// "I'm interested" form for one workshop. Saves an enquiry (admin → Enquiries tab).
export default function WorkshopInterestForm({ workshopTitle, workshopSlug }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');
  const [startedAt] = useState(() => Date.now());

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...form,
        message: form.message || `I'm interested in the workshop "${workshopTitle}".`,
        topic: `Workshop: ${workshopTitle}`,
        workshopSlug,
        submittedAt: startedAt,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus('idle');
      setError(body.error || 'Could not send your request. Please try again or message us on WhatsApp.');
      return;
    }
    setStatus('sent');
    setForm(EMPTY);
  }

  const whatsappText = encodeURIComponent(`Hi! I'm interested in the workshop "${workshopTitle}".`);

  if (status === 'sent') {
    return (
      <div className="rounded-3xl bg-cream-200 p-8 text-center">
        <p className="font-serif text-2xl text-charcoal mb-2">Thank you! ♡</p>
        <p className="font-sans text-[14px] text-charcoal/80">
          We received your request and will get back to you soon with all the details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-cream-200 p-6 md:p-8 flex flex-col gap-4">
      <input className="hidden" tabIndex="-1" autoComplete="off" value={form.website} onChange={set('website')} />
      <h3 className="font-serif text-2xl text-charcoal">I&apos;m interested</h3>
      <p className="font-sans text-[14px] text-charcoal/80 -mt-2">
        Leave your details and we&apos;ll contact you about dates, price and availability.
      </p>
      <Input label="Name" required value={form.name} onChange={set('name')} />
      <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone (optional)" value={form.phone} onChange={set('phone')} />
        <Input label="People" type="number" min="1" max="50" value={form.participants} onChange={set('participants')} />
      </div>
      <label className="block">
        <span className="font-sans text-[12px] font-bold uppercase tracking-[0.06em] text-charcoal/80 block mb-1.5">Message (optional)</span>
        <textarea
          rows={3}
          value={form.message}
          onChange={set('message')}
          placeholder="Preferred dates, questions…"
          className="w-full rounded-2xl bg-cream-50 border border-cream-400 px-4 py-3 font-sans text-[14px] text-charcoal outline-none focus:border-terracotta"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full bg-terracotta px-6 py-3.5 font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-white hover:bg-terracotta-dark disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send request'}
      </button>
      {error && <p className="font-sans text-[13px] text-terracotta-dark">{error}</p>}
      <a
        href={`https://wa.me/${siteConfig.whatsappNumber}?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center font-sans text-[13px] font-semibold text-charcoal/80 underline hover:text-terracotta-dark"
      >
        Or message us on WhatsApp
      </a>
    </form>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="font-sans text-[12px] font-bold uppercase tracking-[0.06em] text-charcoal/80 block mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full rounded-full bg-cream-50 border border-cream-400 px-4 py-2.5 font-sans text-[14px] text-charcoal outline-none focus:border-terracotta"
      />
    </label>
  );
}
