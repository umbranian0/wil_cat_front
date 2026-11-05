'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 20;

export default function ProductGrid({ products }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const hasMore = visible < products.length;

  // Show 20 pieces first, then load 20 more each time the visitor scrolls near the end.
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, products.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, products.length, visible]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {products.slice(0, visible).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="py-10 text-center font-sans text-[11px] tracking-[0.14em] uppercase text-charcoal/75">
          Loading more pieces…
        </div>
      )}
    </>
  );
}
