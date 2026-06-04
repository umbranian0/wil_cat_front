'use client';

import Link from 'next/link';

export default function FeaturedBanner({ product }) {
  if (!product) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mx-6 md:mx-10 mb-16 overflow-hidden">
      <div className="aspect-[4/3] md:aspect-auto">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-10 md:p-14 bg-cream-200">
        <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500 mb-3">
          Featured piece
        </span>
        <h3 className="font-serif text-[28px] font-normal text-charcoal mb-3 leading-tight">
          {product.name}
        </h3>
        <p className="font-sans text-[14px] leading-relaxed text-charcoal-muted mb-5">
          {product.description}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="font-sans text-[12px] font-semibold tracking-[0.1em] uppercase text-charcoal border border-charcoal px-7 py-3 transition-all hover:bg-charcoal hover:text-cream-100 self-start"
        >
          View piece →
        </Link>
      </div>
    </div>
  );
}
