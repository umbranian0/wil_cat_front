export const metadata = {
  title: 'About — Wild Cat Ceramic',
  description: 'The story behind Wild Cat Ceramic — a small studio dedicated to playful, handmade ceramics.',
};

export default function AboutPage() {
  return (
    <div className="page-enter pt-28 pb-16">
      {/* Hero */}
      <div className="text-center px-6 mb-16">
        <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500 block mb-3">
          The studio
        </span>
        <h1 className="font-serif text-[clamp(36px,5vw,52px)] font-normal text-charcoal mb-4">
          About Wild Cat
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6">
        <p className="font-sans text-[16px] leading-[1.8] text-charcoal-muted mb-6">
          Wild Cat Ceramic is a small studio dedicated to making playful, hand-shaped ceramics that bring color and character to everyday life.
        </p>
        <p className="font-sans text-[16px] leading-[1.8] text-charcoal-muted mb-6">
          Each piece begins as a lump of clay and is shaped, carved, and glazed entirely by hand. No two pieces are exactly alike — and that&apos;s the whole point.
        </p>

        <hr className="w-10 border-none h-px bg-cream-400 my-10" />

        <h2 className="font-serif text-[26px] font-normal text-charcoal mb-4">
          The process
        </h2>
        <p className="font-sans text-[16px] leading-[1.8] text-charcoal-muted mb-6">
          Every piece goes through a careful process: hand-building or throwing on the wheel, followed by a first firing (bisque), then hand-painting and glazing, and finally a second firing at high temperature.
        </p>
        <p className="font-sans text-[16px] leading-[1.8] text-charcoal-muted mb-6">
          From ring holders to decorative tiles, everything is made with food-safe glazes and fired with care. We believe objects should make you smile.
        </p>

        <hr className="w-10 border-none h-px bg-cream-400 my-10" />

        <h2 className="font-serif text-[26px] font-normal text-charcoal mb-4">
          Made in Portugal
        </h2>
        <p className="font-sans text-[16px] leading-[1.8] text-charcoal-muted mb-6">
          Based in Portugal, Wild Cat Ceramic draws inspiration from the country&apos;s rich ceramic traditions while adding a modern, playful twist. Each piece is a little celebration of color, texture, and handmade imperfection.
        </p>

        <a
          href="/shop"
          className="inline-block mt-4 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase text-charcoal border border-charcoal px-8 py-3 transition-all hover:bg-charcoal hover:text-cream-100"
        >
          ← Browse the collection
        </a>
      </div>
    </div>
  );
}
