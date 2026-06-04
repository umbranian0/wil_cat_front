export const metadata = {
  title: 'FAQ — Wild Cat Ceramic',
  description: 'Frequently asked questions about shipping, care, and ordering from Wild Cat Ceramic.',
};

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Browse our collection, add items to your cart, and checkout via WhatsApp or email. We will confirm availability and shipping costs before you make any payment.',
  },
  {
    question: 'How do I pay?',
    answer: 'After we confirm your order, we will send you payment details. We currently accept bank transfer and PayPal. A payment gateway is coming soon!',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Orders are typically shipped within 5–7 business days. Since every piece is handmade, some items may need extra time. We will keep you updated.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship worldwide from Portugal. Shipping costs are calculated based on destination and package weight. We will let you know the exact cost before you pay.',
  },
  {
    question: 'Are your pieces food safe?',
    answer: 'Yes. All glazes used on our functional pieces (cups, bowls, plates, jars) are food-safe and lead-free. Decorative pieces like tiles are for display only.',
  },
  {
    question: 'How should I care for my ceramics?',
    answer: 'Hand washing is recommended for all pieces to preserve the glaze. Avoid sudden temperature changes (don\'t put a cold piece in a hot oven). Most pieces are microwave safe, but check individual product details.',
  },
  {
    question: 'Can I request a custom piece?',
    answer: 'Absolutely! We love custom orders. Contact us via email or WhatsApp with your idea and we will discuss design, size, colors, and pricing.',
  },
  {
    question: 'What if my piece arrives damaged?',
    answer: 'We pack everything with great care, but if your piece arrives damaged, contact us within 48 hours with photos. We will replace or refund the item.',
  },
  {
    question: 'Are pieces exactly like the photos?',
    answer: 'Since every piece is handmade, slight variations in color, size, and texture are normal and part of what makes each piece special. We do our best to represent each piece accurately.',
  },
  {
    question: 'Do you do wholesale?',
    answer: 'We work with select shops and galleries. Get in touch via our contact page to discuss wholesale opportunities.',
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
            Answers to common questions about ordering, shipping, and caring for your ceramics.
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
            Still have questions?
          </p>
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
