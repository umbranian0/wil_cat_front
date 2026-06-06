import { listPublishedProducts } from '@/lib/catalog';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop — Wild Cat Ceramic',
  description: 'Browse our full collection of handmade ceramics.',
};

export default async function ShopPage() {
  const products = await listPublishedProducts();

  return (
    <div className="page-enter pt-28 pb-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500 block mb-3">
            Collection
          </span>
          <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal text-charcoal mb-3">
            All Pieces
          </h1>
          <p className="font-sans text-[15px] text-charcoal-muted max-w-[400px] mx-auto">
            Each piece is handmade and one-of-a-kind. Browse, fall in love, and make it yours.
          </p>
        </div>

        {/* Filters */}
        <ShopClient products={products} />
      </div>
    </div>
  );
}
