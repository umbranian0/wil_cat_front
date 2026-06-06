import Link from 'next/link';

const DEFAULTS = {
  eyebrow: 'Wild Cat Ceramica — Portugal',
  headline: 'Pieces made to bring joy',
  tagline: 'Every piece is shaped by hand, glazed with care, and made to add a little wonder to your everyday.',
  marquee: '  ✶  Handmade  ✶  One of a kind  ✶  Made with love  ✶  Handcrafted in Portugal  ✶  Unique pieces  ',
};

export default function Hero({ eyebrow, headline, tagline, marquee }) {
  const text = {
    eyebrow: eyebrow || DEFAULTS.eyebrow,
    headline: headline || DEFAULTS.headline,
    tagline: tagline || DEFAULTS.tagline,
    marquee: marquee || DEFAULTS.marquee,
  };

  return (
    <section className="pt-40 pb-0 flex flex-col items-center text-center px-6 overflow-hidden">

      {/* Eyebrow with flanking rules */}
      <div className="flex items-center gap-5 mb-8">
        <div className="h-px w-10 bg-charcoal/20" />
        <span className="font-sans text-[10px] font-semibold tracking-[0.28em] uppercase text-charcoal/45">
          {text.eyebrow}
        </span>
        <div className="h-px w-10 bg-charcoal/20" />
      </div>

      {/* Main headline */}
      <h1
        className="font-serif font-light text-charcoal leading-[0.92] tracking-tight max-w-[820px] mb-8"
        style={{ fontSize: 'clamp(56px, 9vw, 110px)' }}
      >
        {text.headline.split('\n').map((line, i, arr) => (
          i < arr.length - 1 ? <span key={i}>{line}<br /></span> : <em key={i} className="italic font-light text-terracotta">{line}</em>
        ))}
      </h1>

      {/* Tagline */}
      <p className="font-sans text-[15px] md:text-[16px] leading-[1.75] text-charcoal/55 max-w-[400px] mb-10">
        {text.tagline}
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-6 flex-wrap justify-center">
        <Link
          href="/shop"
          className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase bg-charcoal text-cream-100 px-12 py-4 transition-all duration-300 hover:bg-terracotta"
        >
          Shop Collection
        </Link>
        <Link
          href="/about"
          className="font-sans text-[11px] font-medium tracking-[0.12em] uppercase text-charcoal/60 border-b border-charcoal/25 pb-px hover:text-charcoal hover:border-charcoal transition-colors"
        >
          Our Story &rarr;
        </Link>
      </div>

      {/* Marquee strip */}
      <div className="mt-20 w-screen overflow-hidden border-y border-charcoal/[0.07] py-4 bg-cream-200/50">
        <div className="marquee-track font-serif text-[13px] tracking-[0.28em] text-charcoal/30 uppercase italic">
          {text.marquee}{text.marquee}{text.marquee}{text.marquee}
        </div>
      </div>
    </section>
  );
}
