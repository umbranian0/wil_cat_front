import Link from 'next/link';
import { notFound } from 'next/navigation';
import MediaEmbed from '@/components/MediaEmbed';
import { getWorkshopBySlug } from '@/lib/catalog';
import { formatWorkshopDate, workshopInfo, workshopMedia } from '@/lib/workshops';
import WorkshopInterestForm from './WorkshopInterestForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const page = await getWorkshopBySlug(params.slug);
  if (!page) return { title: 'Workshop — Wild Cat Ceramic' };
  const info = workshopInfo(page);
  return {
    title: page.seo?.title || `${page.title} — Wild Cat Ceramic workshops`,
    description: page.seo?.description || info.summary || '',
  };
}

export default async function WorkshopDetailPage({ params }) {
  const page = await getWorkshopBySlug(params.slug);
  if (!page) notFound();

  const info = workshopInfo(page);
  const media = workshopMedia(page);
  const facts = [
    ['When', formatWorkshopDate(info.date)],
    ['Duration', info.duration],
    ['Price', info.price],
    ['Where', info.location],
    ['Spots', info.spots],
  ].filter(([, value]) => value);

  return (
    <div className="page-enter pt-28 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <Link href="/workshops" className="font-sans text-[13px] font-semibold text-charcoal/80 hover:text-terracotta-dark">
          &larr; All workshops
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] items-start">
          <div className="flex flex-col gap-8">
            {info.coverImage && (
              <div className="relative overflow-hidden rounded-[2rem] bg-cream-200 aspect-[4/3]">
                <img src={info.coverImage} alt={page.title} className="h-full w-full object-cover" />
                {info.tag && (
                  <span className="absolute top-4 left-4 rounded-full bg-terracotta px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                    {info.tag}
                  </span>
                )}
              </div>
            )}

            <div>
              <span className="font-sans text-[12px] font-bold uppercase tracking-[0.2em] text-terracotta">♡ Workshop</span>
              <h1 className="mt-2 font-serif text-[clamp(34px,4.5vw,54px)] leading-tight text-charcoal">{page.title}</h1>
              {info.summary && <p className="mt-4 font-sans text-[17px] leading-relaxed text-charcoal/80">{info.summary}</p>}
            </div>

            {info.description && (
              <div className="flex flex-col gap-4">
                {String(info.description).split(/\n{2,}/).map((paragraph, i) => (
                  <p key={i} className="font-sans text-[15px] leading-relaxed text-charcoal/80 whitespace-pre-line">{paragraph}</p>
                ))}
              </div>
            )}

            {media.length > 0 && (
              <section className="flex flex-col gap-8">
                <h2 className="font-serif text-3xl text-charcoal">See how we do it</h2>
                {media.map((item, i) => (
                  <MediaEmbed key={`${item.url}-${i}`} url={item.url} caption={item.caption} />
                ))}
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
            {facts.length > 0 && (
              <dl className="rounded-3xl border-2 border-cream-300 p-6 grid gap-3 m-0">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-cream-300 pb-3 last:border-0 last:pb-0">
                    <dt className="font-sans text-[12px] font-bold uppercase tracking-[0.1em] text-charcoal/75">{label}</dt>
                    <dd className="m-0 text-right font-sans text-[15px] font-semibold text-charcoal">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <WorkshopInterestForm workshopTitle={page.title} workshopSlug={page.slug} />
          </aside>
        </div>
      </div>
    </div>
  );
}
