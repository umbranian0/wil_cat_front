'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ShopClient({ products }) {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? products : products.filter(p => p.category === active);

  return (
    <>
      {/* Category filter */}
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`font-sans text-[12px] font-medium tracking-[0.08em] uppercase px-5 py-2 border cursor-pointer transition-all ${
              active === cat
                ? 'bg-charcoal text-cream-100 border-charcoal'
                : 'bg-transparent text-charcoal/60 border-cream-400 hover:border-charcoal hover:text-charcoal'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="font-sans text-center text-cream-500 py-16">
          No pieces in this category yet.
        </p>
      )}
    </>
  );
}
