'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();

  return (
    <div
      className="group cursor-pointer transition-transform duration-400"
      style={{ transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="product-img-wrap relative overflow-hidden aspect-square bg-cream-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {/* Quick add overlay */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product);
            }}
            className="quick-add-btn absolute bottom-0 left-0 right-0 py-3 bg-charcoal/90 text-cream-100 font-sans text-[12px] font-semibold tracking-[0.1em] uppercase text-center border-none cursor-pointer hover:bg-charcoal-light"
          >
            Quick add
          </button>
        </div>

        {/* Info */}
        <div className="pt-3.5 flex justify-between items-baseline">
          <span className="font-sans text-[14px] font-medium text-charcoal">{product.name}</span>
          <span className="font-sans text-[14px] text-cream-500">{product.currency}{product.price}</span>
        </div>
        {product.tag && (
          <div className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase text-terracotta mt-1">
            {product.tag}
          </div>
        )}
      </Link>
    </div>
  );
}
