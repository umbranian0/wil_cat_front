import Link from 'next/link';
import Hero from '@/components/Hero';
import FeaturedBanner from '@/components/FeaturedBanner';
import ProductGrid from './ProductGrid';
import { getFeaturedProduct, listPublishedProducts, getCmsPageBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [products, featured, cmsPage] = await Promise.all([
    listPublishedProducts(),
    getFeaturedProduct(),
    getCmsPageBySlug('homepage'),
  ]);

  const blocks = Array.isArray(cmsPage?.blocks) ? cmsPage.blocks : [];
  const heroBlock = blocks.find((b) => b.type === 'hero') || {};
  const calloutBlock = blocks.find((b) => b.type === 'callout') || {};
  const bannerBlock = blocks.find((b) => b.type === 'collection_banner') || {};

  return (
    <div className="page-enter">
      <Hero
        eyebrow={heroBlock.eyebrow}
        headline={heroBlock.headline}
        tagline={heroBlock.tagline}
        marquee={heroBlock.marquee}
      />
      {featured && <FeaturedBanner product={featured} />}

      {/* Product Grid */}
      <div className="px-6 md:px-10 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-baseline mb-10">
            <h2 className="font-serif text-[clamp(26px,3vw,34px)] font-light text-charcoal">
              The Collection
            </h2>
            <span className="font-sans text-[11px] font-medium tracking-[0.12em] uppercase text-charcoal/40">
              {products.length} pieces
            </span>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>

      {/* Full collection atmospheric image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '65vh', minHeight: '420px' }}
      >
        <img
          src="/images/all_products.jpg"
          alt="Wild Cat Ceramica — full collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 py-10 md:px-16 md:py-14">
          <div className="max-w-7xl mx-auto">
            <span className="block font-sans text-[10px] font-semibold tracking-[0.28em] uppercase text-cream-100/55 mb-3">
              {bannerBlock.eyebrow || 'The Collection'}
            </span>
            <h2
              className="font-serif font-light text-cream-100 leading-tight mb-7 max-w-[520px]"
              style={{ fontSize: 'clamp(30px, 5vw, 54px)' }}
            >
              {(bannerBlock.heading || 'Every piece has a story to tell').split('\n').map((line, i, arr) => (
                i < arr.length - 1 ? <span key={i}>{line}<br /></span> : <em key={i} className="italic">{line}</em>
              ))}
            </h2>
            <Link
              href="/shop"
              className="inline-block font-sans text-[11px] font-semibold tracking-[0.14em] uppercase border border-cream-100/60 text-cream-100 px-9 py-3.5 transition-all hover:bg-cream-100 hover:text-charcoal"
            >
              Browse all pieces &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Studio callout */}
      <div className="mx-0 md:mx-10 my-20 p-14 md:p-18 bg-cream-200 text-center flex flex-col items-center gap-5">
        <div className="flex items-center gap-4 text-charcoal/25">
          <div className="h-px w-8 bg-current" />
          <span className="font-serif italic text-[13px]">✦</span>
          <div className="h-px w-8 bg-current" />
        </div>
        <span className="font-sans text-[10px] font-semibold tracking-[0.22em] uppercase text-charcoal/40">
          {calloutBlock.eyebrow || 'From the studio'}
        </span>
        <h3
          className="font-serif font-light text-charcoal max-w-[540px] leading-tight"
          style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}
        >
          {(calloutBlock.heading || 'Every piece is made by hand. No two are ever the same.').split('\n').map((line, i, arr) => (
            i < arr.length - 1 ? <span key={i}>{line}<br /></span> : <em key={i} className="italic text-terracotta">{line}</em>
          ))}
        </h3>
        <Link
          href="/about"
          className="mt-2 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-charcoal border border-charcoal/30 px-9 py-3.5 transition-all hover:bg-charcoal hover:text-cream-100 hover:border-charcoal"
        >
          Learn about us
        </Link>
      </div>
    </div>
  );
}
