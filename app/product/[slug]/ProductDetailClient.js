'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function ProductDetailClient({ product, related }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="page-enter pt-24 pb-16 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="font-sans text-[12px] text-cream-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </div>

        {/* Product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Image */}
          <div className="bg-cream-200 flex items-center justify-center p-10 aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 py-4">
            <span className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-cream-500">
              {product.category}
            </span>
            <h1 className="font-serif text-[36px] font-normal text-charcoal leading-tight">
              {product.name}
            </h1>
            <span className="font-sans text-[22px] text-charcoal">
              {product.currency}{product.price}
            </span>
            <p className="font-sans text-[15px] leading-relaxed text-charcoal-muted">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mt-2">
              <span className="font-sans text-[13px] font-medium text-charcoal">Qty</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-base text-charcoal hover:border-charcoal transition-colors"
                >
                  −
                </button>
                <span className="font-sans text-base font-medium text-charcoal min-w-[24px] text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-9 h-9 flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-base text-charcoal hover:border-charcoal transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className={`mt-2 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase py-4 px-10 border-none cursor-pointer transition-all ${
                added
                  ? 'bg-[#4A7C59] text-white'
                  : 'bg-charcoal text-cream-100 hover:bg-charcoal-light'
              }`}
            >
              {added ? '✓ Added to cart!' : 'Add to cart'}
            </button>

            {/* Details */}
            <div className="mt-6 pt-6 border-t border-charcoal/[0.08] flex flex-col gap-2.5">
              {product.details.map((detail, i) => (
                <div key={i} className="font-sans text-[13px] text-cream-500 flex items-start gap-2">
                  <span className="text-cream-400 mt-0.5">✦</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h3 className="font-serif text-[24px] font-normal text-charcoal mb-8">
              You might also like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
