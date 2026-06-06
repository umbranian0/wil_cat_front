import { getCmsPageBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About — Wild Cat Ceramica',
  description: 'The story behind Wild Cat Ceramica — a small studio dedicated to playful, handmade ceramics.',
};

const FALLBACK_BLOCKS = [
  { type: 'header', eyebrow: 'The studio', heading: 'About Wild Cat', tagline: 'A small studio. A lot of clay. Made with love.' },
  { type: 'paragraph', text: 'Wild Cat Ceramica is a small studio dedicated to making playful, hand-shaped ceramics that bring color and character to everyday life.' },
  { type: 'paragraph', text: "Each piece begins as a lump of clay and is shaped, carved, and glazed entirely by hand. No two pieces are exactly alike — and that's the whole point." },
  { type: 'section_heading', text: 'The process' },
  { type: 'paragraph', text: 'Every piece goes through a careful process: hand-building or throwing on the wheel, followed by a first firing (bisque), then hand-painting and glazing, and finally a second firing at high temperature.' },
  { type: 'paragraph', text: 'From ring holders to decorative tiles, everything is made with food-safe glazes and fired with care. We believe objects should make you smile.' },
  { type: 'section_heading', text: 'Made in Portugal' },
  { type: 'paragraph', text: "Based in Portugal, Wild Cat Ceramica draws inspiration from the country's rich ceramic traditions while adding a modern, playful twist. Each piece is a little celebration of color, texture, and handmade imperfection." },
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
          {header.heading || 'About Wild Cat'}
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
