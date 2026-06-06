'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { applyProductImageFallback, productImageSrc } from '@/lib/productImages';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();
  const available = product.inStock !== false && (product.inventoryMode === 'made_to_order' || Number(product.stockQty ?? 1) > 0);

  return (
    <div
      className="group cursor-pointer"
      style={{
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="product-img-wrap relative overflow-hidden aspect-square bg-cream-200">
          <img
            src={productImageSrc(product.image)}
            alt={product.name}
            onError={applyProductImageFallback}
            className="w-full h-full object-cover"
          />
          {/* Tag badge */}
          {product.tag && (
            <span className="absolute top-3.5 left-3.5 font-sans text-[9px] font-bold tracking-[0.18em] uppercase bg-terracotta text-white px-2.5 py-1">
              {product.tag}
            </span>
          )}
          {/* Quick add */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (available) addItem(product);
            }}
            disabled={!available}
            className={`quick-add-btn absolute bottom-0 left-0 right-0 py-3.5 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-center border-none transition-colors ${
              available
                ? 'bg-charcoal/92 text-cream-100 cursor-pointer hover:bg-terracotta'
                : 'bg-charcoal/50 text-cream-100 cursor-not-allowed'
            }`}
          >
            {available ? '+ Add to cart' : 'Sold out'}
          </button>
        </div>

        {/* Info */}
        <div className="pt-4 pb-1">
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-serif text-[18px] font-light text-charcoal leading-snug">
              {product.name}
            </span>
            <span className="font-sans text-[13px] text-charcoal/55 flex-shrink-0">
              {product.currency}{product.price}
            </span>
          </div>
          <span className="font-sans text-[11px] text-charcoal/35 mt-1 block tracking-wide">
            {product.category}
          </span>
        </div>
      </Link>
    </div>
  );
}
