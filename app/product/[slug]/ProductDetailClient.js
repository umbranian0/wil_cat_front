'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { applyProductImageFallback, productImageSrc } from '@/lib/productImages';

export default function ProductDetailClient({ product, related }) {
  const { addItem, items: cartItems } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const maxQty = product.inventoryMode === 'made_to_order' ? Infinity : Number(product.stockQty ?? 1);
  const cartQty = cartItems.find(i => i.id === product.id)?.qty ?? 0;
  const available = product.inStock !== false && (product.inventoryMode === 'made_to_order' || Number(product.stockQty ?? 1) > 0);
  const canAdd = available && cartQty + qty <= maxQty;

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="page-enter pt-28 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="font-sans text-[11px] text-charcoal/40 mb-10 flex items-center gap-2 tracking-wide">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-charcoal/70">{product.name}</span>
        </div>

        {/* Product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

          {/* Image */}
          <div
            className="relative overflow-hidden bg-cream-200 aspect-square flex items-center justify-center cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={productImageSrc(product.image)}
              alt={product.name}
              onError={applyProductImageFallback}
              className="w-full h-full object-contain p-10 transition-transform duration-700 hover:scale-105"
            />
            {product.tag && (
              <span className="absolute top-5 left-5 font-sans text-[9px] font-bold tracking-[0.18em] uppercase bg-terracotta text-white px-3 py-1.5">
                {product.tag}
              </span>
            )}
          </div>

          {/* Lightbox */}
          {lightboxOpen && (
            <div
              className="fixed inset-0 z-[500] bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                className="absolute top-5 right-6 text-cream-100 text-3xl leading-none bg-transparent border-none cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
              <img
                src={productImageSrc(product.image)}
                alt={product.name}
                onError={applyProductImageFallback}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[90vh] object-contain shadow-2xl"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col gap-5 py-2">
            <span className="font-sans text-[10px] font-semibold tracking-[0.22em] uppercase text-terracotta">
              {product.category}
            </span>
            <h1
              className="font-serif font-light text-charcoal leading-tight"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
            >
              {product.name}
            </h1>
            <div className="font-serif text-[30px] font-light text-charcoal/75 tracking-tight">
              {product.currency}{product.price}
            </div>
            <p className="font-sans text-[15px] leading-[1.8] text-charcoal/60 max-w-[420px]">
              {product.description}
            </p>

            {/* Qty */}
            <div className="flex items-center gap-4 mt-2">
              <span className="font-sans text-[12px] font-medium uppercase tracking-[0.1em] text-charcoal/50">
                Qty
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-base text-charcoal hover:border-charcoal transition-colors"
                >
                  &minus;
                </button>
                <span className="font-sans text-base font-medium text-charcoal min-w-[24px] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(qty + 1, Math.max(1, maxQty - cartQty)))}
                  disabled={qty >= maxQty - cartQty}
                  className="w-9 h-9 flex items-center justify-center bg-transparent border border-cream-400 cursor-pointer text-base text-charcoal hover:border-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`mt-1 font-sans text-[12px] font-semibold tracking-[0.14em] uppercase py-4 px-12 border-none cursor-pointer transition-all ${
                !canAdd
                  ? 'bg-charcoal/40 text-cream-100 cursor-not-allowed'
                  : added
                  ? 'bg-[#4A7C59] text-white'
                  : 'bg-charcoal text-cream-100 hover:bg-terracotta'
              }`}
            >
              {!available ? 'Sold out' : !canAdd ? 'Max quantity reached' : added ? '✓ Added to cart!' : 'Add to cart'}
            </button>

            {/* Details */}
            <div className="mt-6 pt-6 border-t border-charcoal/[0.07] flex flex-col gap-3">
              {product.details.map((detail, i) => (
                <div key={i} className="font-sans text-[13px] text-charcoal/55 flex items-start gap-3">
                  <span className="text-terracotta/60 mt-0.5 text-[10px]">✦</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-6 mb-10">
              <h3 className="font-serif text-[26px] font-light text-charcoal">
                You might also like
              </h3>
              <div className="flex-1 h-px bg-charcoal/[0.07]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
