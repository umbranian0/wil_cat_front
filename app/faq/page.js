import { getCmsPageBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FAQ — Atelier Studio',
  description: 'Frequently asked questions about orders, sizing, shipping, and workshop bookings.',
};

const FALLBACK_FAQS = [
  { question: 'How do I place an order?', answer: 'Add pieces to your cart, then send the request by WhatsApp or email. We confirm availability, sizing, and payment before the order is final.' },
  { question: 'How do I pay?', answer: 'We send payment details after confirmation. Bank transfer and PayPal are currently available.' },
  { question: 'How long does shipping take?', answer: 'Ready-to-ship orders usually leave within 5–7 business days after payment. Made-to-order timelines are confirmed separately.' },
  { question: 'Do you ship internationally?', answer: 'Yes. We ship from Portugal, and shipping is quoted before payment.' },
  { question: 'How do I know my size?', answer: "Each product page lists available sizes and a short fit note. Message us if you're between sizes and we'll help you choose." },
  { question: 'How should I care for my pieces?', answer: 'Care instructions are listed on each product page. In general, wash cold and air dry to keep fabric and colour looking their best.' },
  { question: 'How do workshop bookings work?', answer: "Pick a workshop, choose an available session, and request a seat. We confirm your spot immediately if there's space, or add you to the waitlist if the session is full." },
  { question: 'What if a workshop session is full?', answer: 'You can join the waitlist. If a seat opens up, we contact you directly to confirm.' },
  { question: 'Can I cancel or change a workshop booking?', answer: 'Contact us as soon as you can — see our Terms for the cancellation and no-show policy.' },
  { question: 'Do you do wholesale or collaborations?', answer: 'We work with select shops and studios. Contact us to discuss.' },
];

export default async function FAQPage() {
  const page = await getCmsPageBySlug('faq');
  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  const faqs = blocks.filter((b) => b.type === 'faq_item' && b.question);
  const items = faqs.length > 0 ? faqs : FALLBACK_FAQS;

  return (
    <div className="page-enter pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500 block mb-3">
            Help
          </span>
          <h1 className="font-serif text-[clamp(36px,5vw,48px)] font-normal text-charcoal mb-3">
            FAQ
          </h1>
          <p className="font-sans text-[15px] text-charcoal-muted max-w-[400px] mx-auto">
            Short answers about orders, shipping, care, and handmade pieces.
          </p>
        </div>

        {/* FAQ list */}
        <div className="flex flex-col">
          {items.map((faq, i) => (
            <div key={i} className="py-6 border-b border-charcoal/[0.08]">
              <h3 className="font-sans text-[15px] font-semibold text-charcoal mb-2">
                {faq.question}
              </h3>
              <p className="font-sans text-[14px] leading-relaxed text-charcoal-muted">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="font-sans text-[14px] text-cream-500 mb-4">
            Need the full order terms?
          </p>
          <a
            href="/terms"
            className="inline-block font-sans text-[13px] font-semibold tracking-[0.1em] uppercase text-charcoal border border-charcoal px-8 py-3 transition-all hover:bg-charcoal hover:text-cream-100"
          >
            Terms &amp; Conditions
          </a>
        </div>
      </div>
    </div>
  );
}
