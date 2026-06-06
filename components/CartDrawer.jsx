'use client';

import { useMemo, useState } from 'react';
import { useCart } from './CartProvider';

function money(currency, amount) {
  const symbol = currency === 'EUR' || currency === 'â‚¬' ? '€' : currency || '€';
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

export default function CartDrawer() {
  const {
    items, isOpen, setIsOpen,
    updateQty, removeItem, clearCart,
    totalPrice,
    checkoutWhatsApp, checkoutEmail,
  } = useCart();
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
    website: '',
  });
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState('');
  const idempotencyKey = useMemo(
    () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    []
  );

  async function submitOrder(event) {
    event.preventDefault();
    setSubmitting(true);
    setOrderError('');
    setOrderResult(null);

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          country: customer.country,
          message: customer.message,
          consentToContact: true,
        },
        items: items.map((item) => ({ id: item.id, qty: item.qty })),
        idempotencyKey,
        website: customer.website,
        submittedAt: startedAt,
      }),
    });

    const body = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setOrderError(body.error || 'Could not submit the order request.');
      return;
    }

    setOrderResult(body.order);
    clearCart();
  }

  return (
    <>
      <div
        className={`cart-overlay fixed inset-0 z-[300] bg-charcoal/40 backdrop-blur-sm ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`cart-drawer fixed top-0 right-0 bottom-0 w-[400px] max-w-[92vw] bg-cream-100 z-[301] flex flex-col overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-7 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <span className="font-serif text-2xl text-charcoal">Your Cart</span>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-none text-[22px] cursor-pointer text-charcoal opacity-50 hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>

          {items.length === 0 && !orderResult && (
            <p className="font-sans text-[15px] text-cream-500 text-center pt-16 leading-relaxed">
              Your cart is empty.<br />
              Go find something you love!
            </p>
          )}

          {orderResult && (
            <div className="bg-cream-200 p-5 font-sans text-sm leading-relaxed text-charcoal/70">
              <span className="block font-serif text-2xl text-charcoal">Order received</span>
              <span className="mt-2 block">
                Reference {orderResult.publicOrderNumber}. We will confirm availability, shipping, and payment details before the order is final.
              </span>
            </div>
          )}

          <div className="flex-1">
            {items.map((item, i) => (
              <div key={item.id} className="flex gap-4 py-4 border-b border-charcoal/[0.06]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[72px] h-[72px] object-cover bg-cream-200 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="font-sans text-[14px] font-medium text-charcoal">{item.name}</span>
                  <span className="font-sans text-[13px] text-cream-500">{money(item.currency, item.price)}</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <button
                      onClick={() => updateQty(i, -1)}
                      className="w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-[13px] text-charcoal hover:border-charcoal transition-colors"
                    >
                      -
                    </button>
                    <span className="font-sans text-[13px] min-w-[20px] text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(i, 1)}
                      className="w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-[13px] text-charcoal hover:border-charcoal transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="bg-transparent border-none font-sans text-[11px] text-terracotta cursor-pointer underline p-0 mt-1 text-left w-fit"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="mt-auto pt-6 border-t border-charcoal/10">
              <div className="flex justify-between font-sans text-base font-semibold text-charcoal mb-5">
                <span>Total</span>
                <span>{money(items[0]?.currency, totalPrice)}</span>
              </div>

              <form onSubmit={submitOrder} className="mb-5 flex flex-col gap-3">
                <input
                  className="hidden"
                  tabIndex="-1"
                  autoComplete="off"
                  value={customer.website}
                  onChange={(event) => setCustomer({ ...customer, website: event.target.value })}
                />
                <input
                  required
                  placeholder="Name"
                  value={customer.name}
                  onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                  className="w-full border border-cream-400 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-charcoal"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={customer.email}
                  onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                  className="w-full border border-cream-400 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-charcoal"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Phone"
                    value={customer.phone}
                    onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                    className="w-full border border-cream-400 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-charcoal"
                  />
                  <input
                    placeholder="Country"
                    value={customer.country}
                    onChange={(event) => setCustomer({ ...customer, country: event.target.value })}
                    className="w-full border border-cream-400 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-charcoal"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Message or shipping notes"
                  value={customer.message}
                  onChange={(event) => setCustomer({ ...customer, message: event.target.value })}
                  className="w-full resize-none border border-cream-400 bg-transparent px-3 py-2.5 font-sans text-[13px] outline-none focus:border-charcoal"
                />
                {orderError && <p className="font-sans text-[12px] text-terracotta">{orderError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-charcoal py-4 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-cream-100 transition-all hover:bg-terracotta disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit order request'}
                </button>
              </form>

              <button
                onClick={checkoutWhatsApp}
                className="w-full py-4 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase bg-[#25D366] text-white border-none cursor-pointer transition-all hover:bg-[#20BD5A] mb-3 flex items-center justify-center gap-2"
              >
                Order via WhatsApp
              </button>

              <button
                onClick={checkoutEmail}
                className="w-full py-4 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase bg-charcoal text-cream-100 border-none cursor-pointer transition-all hover:bg-charcoal-light flex items-center justify-center gap-2"
              >
                Order via Email
              </button>

              <p className="font-sans text-[11px] text-cream-500 text-center mt-3 leading-relaxed">
                Availability and shipping are confirmed before payment.{' '}
                <a href="/terms" className="underline hover:text-charcoal">
                  Terms apply.
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
