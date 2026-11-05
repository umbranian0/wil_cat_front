'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { applyProductImageFallback, productImageSrc } from '@/lib/productImages';

const AUTO_ADVANCE_MS = 5000;

// Each slide: { key, image, tag, eyebrow, title, text, price, href, linkLabel }
export default function FeaturedBanner({ slides = [] }) {
  const products = slides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (!count) return null;

  const go = (step) => setIndex((i) => (i + step + count) % count);

  return (
    <section
      className="relative mx-0 md:mx-10 mt-12 mb-16 overflow-hidden bg-cream-200 md:rounded-[2rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured pieces"
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {products.map((product, i) => (
          <div
            key={product.key}
            className="w-full shrink-0 grid grid-cols-1 md:grid-cols-[1fr_1fr] md:h-[380px]"
            aria-hidden={i !== index}
          >
            <div className="relative h-[260px] md:h-full overflow-hidden">
              <img
                src={productImageSrc(product.image)}
                alt={product.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={applyProductImageFallback}
                className="w-full h-full object-cover"
              />
              {product.tag && (
                <span className="absolute top-4 left-4 font-sans text-[9px] font-bold tracking-[0.18em] uppercase bg-terracotta text-white px-3 py-1.5">
                  {product.tag}
                </span>
              )}
            </div>

            <div className="relative flex flex-col justify-center px-8 py-8 md:px-12">
              <span
                className="absolute bottom-3 right-5 font-serif font-light text-charcoal/[0.05] select-none pointer-events-none leading-none"
                style={{ fontSize: '90px' }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-terracotta mb-3 flex items-center gap-2">
                <span>♡</span> {product.eyebrow || 'From the collection'}
              </span>
              <h3
                className="font-serif font-light text-charcoal leading-tight mb-3"
                style={{ fontSize: 'clamp(24px, 2.4vw, 34px)' }}
              >
                {product.title}
              </h3>
              {product.text && (
                <p className="font-sans text-[13px] leading-relaxed text-charcoal/80 mb-4 max-w-[320px] line-clamp-2">
                  {product.text}
                </p>
              )}
              {product.price && (
                <div className="font-serif text-[22px] font-light text-charcoal/80 mb-5">
                  {product.price}
                </div>
              )}
              {!product.price && <div className="mb-2" />}
              <Link
                href={product.href || '/shop'}
                tabIndex={i === index ? 0 : -1}
                className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-charcoal border border-charcoal/40 px-7 py-2.5 self-start transition-all hover:bg-charcoal hover:text-cream-100"
              >
                {product.linkLabel || 'View piece'} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous piece"
            className="absolute left-3 top-[130px] md:top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-cream-100/85 text-charcoal hover:bg-cream-100 transition"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next piece"
            className="absolute right-3 top-[130px] md:top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-cream-100/85 text-charcoal hover:bg-cream-100 transition"
          >
            &rarr;
          </button>
          <div className="absolute bottom-4 left-1/2 md:left-3/4 -translate-x-1/2 flex gap-2">
            {products.map((p, i) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${p.title}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-terracotta' : 'w-1.5 bg-charcoal/25'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
