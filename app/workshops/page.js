import Link from 'next/link';
import { getCmsPageBySlug, listPublishedWorkshops } from '@/lib/catalog';
import { formatWorkshopDate, workshopInfo } from '@/lib/workshops';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Workshops — Wild Cat Ceramic',
  description: 'Hands-on ceramics and craft workshops in Portugal with Wild Cat Ceramic.',
};

export default async function WorkshopsPage() {
  const [intro, workshops] = await Promise.all([getCmsPageBySlug('workshops'), listPublishedWorkshops()]);
  const blocks = Array.isArray(intro?.blocks) ? intro.blocks : [];
  const hero = blocks.find((b) => b.type === 'hero') || {};

  return (
    <div className="page-enter pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <span className="font-sans text-[12px] font-bold uppercase tracking-[0.2em] text-terracotta">
            ♡ {hero.eyebrow || 'Learn with us'}
          </span>
          <h1 className="mt-3 font-serif text-[clamp(38px,5vw,60px)] leading-tight text-charcoal">
            {hero.headline || 'Workshops for the curious'}
          </h1>
          <p className="mt-4 mx-auto max-w-xl font-sans text-[16px] leading-relaxed text-charcoal/80">
            {hero.tagline || 'Small-group, hands-on ceramics and craft sessions, taught in the studio.'}
          </p>
        </header>

        {workshops.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-3xl bg-cream-200 p-10 text-center">
            <p className="font-serif text-2xl text-charcoal mb-2">Coming soon ♡</p>
            <p className="font-sans text-[15px] text-charcoal/80 mb-6">
              We are preparing our first workshops. Want to be the first to know?
            </p>
            <Link href="/contact" className="inline-block rounded-full bg-terracotta px-7 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.1em] text-white hover:bg-terracotta-dark">
              Get in touch
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((page) => {
              const info = workshopInfo(page);
              return (
                <Link key={page.id} href={`/workshops/${page.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-3xl bg-cream-200 aspect-[4/3]">
                    {info.coverImage && (
                      <img src={info.coverImage} alt={page.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    {info.tag && (
                      <span className="absolute top-3.5 left-3.5 rounded-full bg-terracotta px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                        {info.tag}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h2 className="font-serif text-2xl text-charcoal group-hover:text-terracotta-dark">{page.title}</h2>
                    {info.price && <span className="font-sans text-[15px] font-semibold text-charcoal">{info.price}</span>}
                  </div>
                  {info.date && <p className="mt-1 font-sans text-[13px] font-semibold text-terracotta-dark">{formatWorkshopDate(info.date)}</p>}
                  {info.summary && <p className="mt-2 font-sans text-[14px] leading-relaxed text-charcoal/80 line-clamp-3">{info.summary}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
