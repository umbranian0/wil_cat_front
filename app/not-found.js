import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-32 pb-20 px-6 text-center flex flex-col items-center gap-4 min-h-[60vh] justify-center">
      <span className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-cream-500">
        404
      </span>
      <h1 className="font-serif text-[40px] font-normal text-charcoal">
        Page not found
      </h1>
      <p className="font-sans text-[15px] text-charcoal-muted max-w-[360px]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-4 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase text-charcoal border border-charcoal px-8 py-3 transition-all hover:bg-charcoal hover:text-cream-100"
      >
        ← Back to home
      </Link>
    </div>
  );
}
