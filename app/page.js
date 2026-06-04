import Image from 'next/image';
import Hero from '@/components/Hero';
import FeaturedBanner from '@/components/FeaturedBanner';
import ProductGrid from './ProductGrid';
import products from '@/data/products.json';

export default function Home() {
  const featured = products[0]; // Luna Tile

  return (
    <div className="page-enter">
      <Hero />
      <FeaturedBanner product={featured} />

      {/* Product Grid */}
      <div className="px-6 md:px-10 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-serif text-[28px] font-normal text-charcoal">Collection</h2>
            <span className="font-sans text-[12px] font-medium tracking-[0.1em] uppercase text-cream-500">
              {products.length} pieces
            </span>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>

      {/* Full collection image */}
      <div className="px-6 md:px-10 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="font-serif text-[28px] font-normal text-charcoal">Our Collection</h2>
          </div>
          <div className="relative w-full overflow-hidden">
            <Image
              src="/images/all_products.jpg"
              alt="Wild Cat Ceramica — full collection"
              width={1400}
              height={800}
              className="w-full h-auto object-cover"
              priority={false}
            />
          </div>
        </div>
      </div>

      {/* Studio callout */}
      <div className="mx-6 md:mx-10 mb-16 p-12 md:p-14 bg-cream-200 text-center flex flex-col items-center gap-4">
        <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500">
          From the studio
        </span>
        <h3 className="font-serif text-[26px] font-normal text-charcoal max-w-[500px]">
          Every piece is made by hand. No two are ever the same.
        </h3>
        <a
          href="/about"
          className="font-sans text-[12px] font-semibold tracking-[0.1em] uppercase text-charcoal border border-charcoal px-7 py-3 mt-2 transition-all hover:bg-charcoal hover:text-cream-100"
        >
          Learn about us
        </a>
      </div>
    </div>
  );
}
