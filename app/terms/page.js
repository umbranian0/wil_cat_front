export const metadata = {
  title: 'Terms & Conditions — Wild Cat Ceramica',
  description: 'Order, shipping, payment, and damage terms for Wild Cat Ceramica.',
};

const sections = [
  {
    title: 'Orders',
    body: 'Cart checkout sends an order request. An order is confirmed only after we confirm availability, shipping cost, payment details, and any relevant timing.',
  },
  {
    title: 'Unique Pieces',
    body: 'Each ceramic piece is handmade and one-of-a-kind. Small differences in colour, size, glaze, and texture are part of the work. Product photos represent the listed piece as accurately as possible.',
  },
  {
    title: 'Payment',
    body: 'Payment details are sent after order confirmation. We currently accept bank transfer and PayPal unless another method is agreed in writing.',
  },
  {
    title: 'Processing & Shipping',
    body: 'Ready-to-ship pieces usually leave the studio within 5–7 business days after payment. Shipping is sent from Portugal and quoted before payment. Delivery times depend on destination and carrier.',
  },
  {
    title: 'Custom Work',
    body: 'Custom pieces are agreed individually. Scope, price, payment terms, and estimated timing must be confirmed before work begins.',
  },
  {
    title: 'Damage in Transit',
    body: 'If a piece arrives damaged, contact us within 48 hours with photos of the item and packaging. Because each piece is unique, we cannot guarantee an identical replacement. Depending on the situation, we may offer a refund, repair, store credit, or a close alternative.',
  },
  {
    title: 'Returns',
    body: 'For eligible distance purchases, contact us within 14 days of delivery before returning an item. Custom or clearly personalised pieces are not returnable unless faulty or damaged. These terms do not limit any statutory consumer rights that apply to your order.',
  },
];

export default function TermsPage() {
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
          {sections.map((section) => (
            <section key={section.title} className="py-6 border-b border-charcoal/[0.08]">
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
