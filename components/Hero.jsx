'use client';

import Link from 'next/link';

export default function Hero() {
  const marqueeText = "  ✦  Handmade  ✦  One of a kind  ✦  Made with love  ✦  Playful ceramics  ✦  Unique pieces  ";

  return (
    <section className="pt-28 pb-16 flex flex-col items-center text-center gap-6 px-6">
      <span className="font-sans text-[12px] font-medium tracking-[0.18em] uppercase text-cream-500">
        Handcrafted ceramics
      </span>
      <h1 className="font-serif text-[clamp(42px,6vw,72px)] font-normal text-charcoal leading-[1.05] tracking-tight max-w-[700px]">
        Pieces made to bring joy
      </h1>
      <p className="font-sans text-[17px] leading-relaxed text-charcoal-muted max-w-[440px]">
        Every piece is shaped by hand, glazed with care, and made to add a little wonder to your everyday.
      </p>
      <Link
        href="/shop"
        className="mt-2 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase bg-charcoal text-cream-100 px-10 py-3.5 transition-all hover:bg-charcoal-light hover:-translate-y-0.5 inline-block"
      >
        Browse collection
      </Link>

      {/* Marquee */}
      <div className="mt-10 w-screen overflow-hidden whitespace-nowrap font-serif text-[14px] tracking-[0.2em] text-cream-400 uppercase">
        <div className="marquee-track">
          {marqueeText}{marqueeText}{marqueeText}{marqueeText}
        </div>
      </div>
    </section>
  );
}
