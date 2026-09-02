import { getCmsPageBySlug } from '@/lib/catalog';
import { privacyContentFromPage } from '@/lib/cmsContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy policy - Atelier Studio',
  description: 'Privacy information for Atelier Studio customer accounts, orders, and workshop bookings.',
};

export default async function PrivacyPage() {
  const page = await getCmsPageBySlug('privacy');
  const content = privacyContentFromPage(page);

  return (
    <main className="page-enter min-h-screen bg-cream-100 px-6 pb-20 pt-28 text-charcoal md:px-10">
      <article className="mx-auto max-w-5xl">
        <header className="border-b border-charcoal/10 pb-10">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-light md:text-6xl">{content.heading}</h1>
          <p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-charcoal/60">
            {content.intro}
          </p>
        </header>

        <div className="mt-10 grid gap-5">
          {content.sections.map((section) => (
            <section key={section.title} className="grid gap-4 border-b border-charcoal/10 pb-6 md:grid-cols-[260px_1fr]">
              <h2 className="font-serif text-2xl font-light">{section.title}</h2>
              <p className="font-sans text-sm leading-7 text-charcoal/65">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
