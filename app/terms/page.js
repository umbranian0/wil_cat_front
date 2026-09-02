import { getCmsPageBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms & Conditions — Atelier Studio',
  description: 'Order, shipping, payment, workshop booking, and damage terms for Atelier Studio.',
};

const FALLBACK_SECTIONS = [
  { title: 'Orders', body: 'Cart checkout sends an order request. An order is confirmed only after we confirm availability, sizing, shipping cost, payment details, and any relevant timing.' },
  { title: 'Made & Fitted', body: 'Pieces may be produced in small batches or made to order. Small differences in colour, texture, and finish are part of natural fabrics and small-batch production. Product photos represent the listed piece as accurately as possible.' },
  { title: 'Payment', body: 'Payment details are sent after order confirmation. We currently accept bank transfer and PayPal unless another method is agreed in writing.' },
  { title: 'Processing & Shipping', body: 'Ready-to-ship pieces usually leave the studio within 5–7 business days after payment. Shipping is sent from Portugal and quoted before payment. Delivery times depend on destination and carrier.' },
  { title: 'Workshop Bookings', body: 'Booking a workshop session reserves a seat directly if space is available, or places you on a waitlist if the session is full. We will contact you if a waitlisted seat becomes available.' },
  { title: 'Cancellations & No-Shows', body: 'Please contact us at least 48 hours before your session if you need to cancel or reschedule, so we can offer the seat to someone on the waitlist. Cancellations made after that window, or a no-show on the day, may not be eligible for a refund or credit.' },
  { title: 'Damage in Transit', body: 'If a piece arrives damaged, contact us within 48 hours with photos of the item and packaging. Because each piece is unique, we cannot guarantee an identical replacement. Depending on the situation, we may offer a refund, repair, store credit, or a close alternative.' },
  { title: 'Returns', body: 'For eligible distance purchases, contact us within 14 days of delivery before returning an item. Made-to-order or clearly personalised pieces are not returnable unless faulty or damaged. These terms do not limit any statutory consumer rights that apply to your order.' },
];

export default async function TermsPage() {
  const page = await getCmsPageBySlug('terms');
  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  const termsSections = blocks.filter((b) => b.type === 'terms_section' && b.title);
  const sections = termsSections.length > 0 ? termsSections : FALLBACK_SECTIONS;

  return (
    <div className="page-enter pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500 block mb-3">
            Order terms
          </span>
          <h1 className="font-serif text-[clamp(36px,5vw,48px)] font-normal text-charcoal mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="font-sans text-[15px] text-charcoal-muted max-w-[430px] mx-auto">
            Clear terms for handmade orders, shipping, payment, and damaged parcels.
          </p>
        </div>

        <div className="flex flex-col">
          {sections.map((section, i) => (
            <section key={i} className="py-6 border-b border-charcoal/[0.08]">
              <h2 className="font-sans text-[15px] font-semibold text-charcoal mb-2">
                {section.title}
              </h2>
              <p className="font-sans text-[14px] leading-relaxed text-charcoal-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/contact"
            className="inline-block font-sans text-[13px] font-semibold tracking-[0.1em] uppercase text-charcoal border border-charcoal px-8 py-3 transition-all hover:bg-charcoal hover:text-cream-100"
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}
