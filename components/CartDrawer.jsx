'use client';

import { useCart } from './CartProvider';

export default function CartDrawer() {
  const {
    items, isOpen, setIsOpen,
    updateQty, removeItem,
    totalPrice,
    checkoutWhatsApp, checkoutEmail,
  } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay fixed inset-0 z-[300] bg-charcoal/40 backdrop-blur-sm ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`cart-drawer fixed top-0 right-0 bottom-0 w-[400px] max-w-[92vw] bg-cream-100 z-[301] flex flex-col overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-7 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <span className="font-serif text-2xl text-charcoal">Your Cart</span>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-none text-[22px] cursor-pointer text-charcoal opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <p className="font-sans text-[15px] text-cream-500 text-center pt-16 leading-relaxed">
              Your cart is empty.<br />
              Go find something you love!
            </p>
          )}

          {/* Items */}
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
                  <span className="font-sans text-[13px] text-cream-500">€{item.price}</span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <button
                      onClick={() => updateQty(i, -1)}
                      className="w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-[13px] text-charcoal hover:border-charcoal transition-colors"
                    >
                      −
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

          {/* Footer */}
          {items.length > 0 && (
            <div className="mt-auto pt-6 border-t border-charcoal/10">
              <div className="flex justify-between font-sans text-base font-semibold text-charcoal mb-5">
                <span>Total</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>

              {/* WhatsApp button */}
              <button
                onClick={checkoutWhatsApp}
                className="w-full py-4 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase bg-[#25D366] text-white border-none cursor-pointer transition-all hover:bg-[#20BD5A] mb-3 flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order via WhatsApp
              </button>

              {/* Email button */}
              <button
                onClick={checkoutEmail}
                className="w-full py-4 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase bg-charcoal text-cream-100 border-none cursor-pointer transition-all hover:bg-charcoal-light flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
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
