'use client';

import Link from 'next/link';

export default function FeaturedBanner({ product }) {
  if (!product) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] mx-0 md:mx-10 mt-16 mb-20 overflow-hidden">

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {product.tag && (
          <span className="absolute top-5 left-5 font-sans text-[9px] font-bold tracking-[0.18em] uppercase bg-terracotta text-white px-3 py-1.5">
            {product.tag}
          </span>
        )}
      </div>

      {/* Text panel */}
      <div className="flex flex-col justify-center px-10 py-12 md:px-14 md:py-16 bg-cream-200 relative overflow-hidden">
        {/* Decorative large background number */}
        <span
          className="absolute bottom-4 right-6 font-serif font-light text-charcoal/[0.04] select-none pointer-events-none leading-none"
          style={{ fontSize: '130px' }}
          aria-hidden="true"
        >
          01
        </span>

        <span className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-terracotta mb-5 flex items-center gap-2">
          <span>✦</span> Featured piece
        </span>

        <h3
          className="font-serif font-light text-charcoal leading-tight mb-4"
          style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}
        >
          {product.name}
        </h3>

        <p className="font-sans text-[14px] leading-relaxed text-charcoal/60 mb-5 max-w-[280px]">
          {product.description}
        </p>

        <div className="font-serif text-[26px] font-light text-charcoal/80 mb-7 tracking-tight">
          {product.currency}{product.price}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-charcoal border border-charcoal/40 px-8 py-3 self-start transition-all hover:bg-charcoal hover:text-cream-100 hover:border-charcoal"
        >
          View piece &rarr;
        </Link>
      </div>
    </div>
  );
}
