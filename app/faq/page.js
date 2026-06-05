export const metadata = {
  title: 'FAQ — Wild Cat Ceramic',
  description: 'Frequently asked questions about orders, shipping, and care.',
};

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Add pieces to your cart, then send the request by WhatsApp or email. We confirm availability, shipping, and payment before the order is final.',
  },
  {
    question: 'How do I pay?',
    answer: 'We send payment details after confirmation. Bank transfer and PayPal are currently available.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Ready-to-ship orders usually leave within 5–7 business days after payment. Custom timelines are confirmed separately.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes. We ship from Portugal, and shipping is quoted before payment.',
  },
  {
    question: 'Are your pieces food safe?',
    answer: 'Yes. All glazes used on our functional pieces (cups, bowls, plates, jars) are food-safe and lead-free. Decorative pieces like tiles are for display only.',
  },
  {
    question: 'How should I care for my ceramics?',
    answer: 'Hand washing is recommended. Avoid sudden temperature changes, and check each product page for specific use notes.',
  },
  {
    question: 'Can I request a custom piece?',
    answer: 'Yes. Send your idea by email or WhatsApp, and we will confirm scope, price, and timing before work begins.',
  },
  {
    question: 'What if my piece arrives damaged?',
    answer: 'Contact us within 48 hours with photos. Because each piece is unique, we may refund, repair, or discuss a close alternative rather than send an identical replacement.',
  },
  {
    question: 'Are pieces exactly like the photos?',
    answer: 'Each piece is handmade and one-of-a-kind. Product photos represent the listed piece as accurately as possible.',
  },
  {
    question: 'Do you do wholesale?',
    answer: 'We work with select shops and galleries. Contact us to discuss availability.',
  },
];

export default function FAQPage() {
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
          {faqs.map((faq, i) => (
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
