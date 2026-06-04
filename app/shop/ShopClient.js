'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ShopClient({ products }) {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? products : products.filter(p => p.category === active);

  return (
    <>
      {/* Category filters */}
      <div className="flex justify-center gap-2.5 mb-12 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`font-sans text-[11px] font-medium tracking-[0.1em] uppercase px-6 py-2.5 border transition-all cursor-pointer ${
              active === cat
                ? 'bg-charcoal text-cream-100 border-charcoal'
                : 'bg-transparent text-charcoal/50 border-cream-400 hover:border-charcoal/40 hover:text-charcoal'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="font-serif italic text-[18px] text-charcoal/40">
            No pieces in this category yet.
          </p>
        </div>
      )}
    </>
  );
}
