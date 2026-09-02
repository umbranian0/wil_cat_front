import { getCmsPageBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About — Atelier Studio',
  description: 'The story behind Atelier Studio — a small design studio making considered clothing and hands-on workshops.',
};

const FALLBACK_BLOCKS = [
  { type: 'header', eyebrow: 'The studio', heading: 'About Atelier Studio', tagline: 'A small studio built around fabric, form, and hands-on learning.' },
  { type: 'paragraph', text: "Atelier Studio is a small design studio creating considered, made-to-last clothing — and a home for anyone who wants to learn how it's made." },
  { type: 'paragraph', text: 'Every piece starts on the cutting table and is finished by hand. We keep runs small on purpose, so fit, fabric, and finishing get the attention they deserve.' },
  { type: 'section_heading', text: 'The process' },
  { type: 'paragraph', text: 'Each garment moves through pattern-cutting, cutting, construction, and finishing in-house. We work with natural and responsibly sourced fabrics wherever we can, and every piece is checked by hand before it ships.' },
  { type: 'paragraph', text: 'Beyond the collection, we run hands-on workshops — sewing, pattern-cutting, styling — for anyone who wants to get closer to how clothes are actually made.' },
  { type: 'section_heading', text: 'Based in Portugal' },
  { type: 'paragraph', text: "Based in Portugal, Atelier Studio draws on the country's textile and craft traditions while keeping a modern, considered point of view. Come make something with us." },
];

export default async function AboutPage() {
  const page = await getCmsPageBySlug('about');
  const rawBlocks = Array.isArray(page?.blocks) ? page.blocks : [];
  const blocks = rawBlocks.length > 0 ? rawBlocks : FALLBACK_BLOCKS;

  const header = blocks.find((b) => b.type === 'header') || FALLBACK_BLOCKS[0];
  const contentBlocks = blocks.filter((b) => b.type === 'paragraph' || b.type === 'section_heading');

  return (
    <div className="page-enter pt-36 pb-20">

      {/* Header */}
      <div className="text-center px-6 mb-16">
        <div className="flex items-center justify-center gap-5 mb-6">
          <div className="h-px w-10 bg-charcoal/20" />
          <span className="font-sans text-[10px] font-semibold tracking-[0.28em] uppercase text-charcoal/40">
            {header.eyebrow || 'The studio'}
          </span>
          <div className="h-px w-10 bg-charcoal/20" />
        </div>
        <h1
          className="font-serif font-light text-charcoal mb-4"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
        >
          {header.heading || 'About Atelier Studio'}
        </h1>
        <p className="font-sans text-[15px] text-charcoal/50 max-w-[360px] mx-auto">
          {header.tagline || ''}
        </p>
      </div>

      {/* Content blocks */}
      <div className="max-w-2xl mx-auto px-6">
        {contentBlocks.map((block, i) => {
          if (block.type === 'section_heading') {
            return (
              <div key={i}>
                <div className="flex items-center gap-4 text-charcoal/20 mb-10">
                  <div className="flex-1 h-px bg-current" />
                  <span className="font-serif italic text-[14px]">✦</span>
                  <div className="flex-1 h-px bg-current" />
                </div>
                <h2 className="font-serif text-[28px] font-light text-charcoal mb-5">
                  {block.text}
                </h2>
              </div>
            );
          }
          return (
            <p key={i} className="font-sans text-[16px] leading-[1.85] text-charcoal/65 mb-6">
              {block.text}
            </p>
          );
        })}

        <a
          href="/shop"
          className="inline-block font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-charcoal border border-charcoal/35 px-9 py-3.5 transition-all hover:bg-charcoal hover:text-cream-100 hover:border-charcoal"
        >
          &larr; Browse the collection
        </a>
      </div>
    </div>
  );
}
