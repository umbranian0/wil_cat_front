import { getCmsPageBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About — Wild Cat Ceramic',
  description: 'The story behind Wild Cat Ceramic — a small studio making handcrafted ceramics and accessories in Portugal.',
};

const FALLBACK_BLOCKS = [
  { type: 'header', eyebrow: 'The studio', heading: 'About Wild Cat Ceramic', tagline: 'A small studio built around clay, colour, and hands-on making.' },
  { type: 'paragraph', text: "Wild Cat Ceramic is a small studio in Portugal making handcrafted ceramics and accessories — playful, one-of-a-kind pieces made to bring a little joy to everyday life." },
  { type: 'paragraph', text: 'Every piece is shaped, painted, and glazed by hand. We keep things small on purpose, so each piece gets the time and attention it deserves — and no two are ever exactly the same.' },
  { type: 'section_heading', text: 'The process' },
  { type: 'paragraph', text: 'Each piece moves from raw clay through shaping, drying, firing, painting, and glazing in the studio. Every piece is checked by hand and carefully packed before it ships.' },
  { type: 'paragraph', text: 'Soon we will also open hands-on workshops, for anyone who wants to get their hands in the clay and make something of their own.' },
  { type: 'section_heading', text: 'Based in Portugal' },
  { type: 'paragraph', text: "Based in Portugal, Wild Cat Ceramic draws on the country's rich ceramic and craft traditions while keeping a playful, modern point of view. Come make something with us." },
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
          <span className="font-sans text-[10px] font-semibold tracking-[0.28em] uppercase text-charcoal/75">
            {header.eyebrow || 'The studio'}
          </span>
          <div className="h-px w-10 bg-charcoal/20" />
        </div>
        <h1
          className="font-serif font-light text-charcoal mb-4"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
        >
          {header.heading || 'About Wild Cat Ceramic'}
        </h1>
        <p className="font-sans text-[15px] text-charcoal/75 max-w-[360px] mx-auto">
          {header.tagline || ''}
        </p>
      </div>

      {/* Content blocks */}
      <div className="max-w-2xl mx-auto px-6">
        {contentBlocks.map((block, i) => {
          if (block.type === 'section_heading') {
            return (
              <div key={i}>
                <div className="flex items-center gap-4 text-charcoal/80 mb-10">
                  <div className="flex-1 h-px bg-current" />
                  <span className="font-serif italic text-[14px]">♡</span>
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
