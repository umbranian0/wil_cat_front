import Link from 'next/link';
import siteConfig from '@/lib/config';

export default function Footer({ navigationLinks = [] }) {
  const accountLink = navigationLinks.find((link) => link.href === '/account') || { href: '/account', label: 'My Account' };

  return (
    <footer className="bg-charcoal px-6 md:px-10 pt-16 pb-10 mt-8">
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-14">

          {/* Brand */}
          <div className="flex flex-col items-start gap-4 max-w-[240px]">
            <span className="font-serif text-3xl tracking-tight text-cream-50">
              {siteConfig.siteName.split(' ')[0]}
              <em className="italic text-terracotta-light"> {siteConfig.siteName.split(' ').slice(1).join(' ')}</em>
            </span>
            <p className="font-sans text-[13px] text-cream-300 leading-relaxed">
              Handmade ceramics, made in Portugal.<br />
              Workshops coming soon.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 md:gap-20">
            <div>
              <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta-light mb-4">
                Shop
              </h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                <li>
                  <Link href="/shop" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    All pieces
                  </Link>
                </li>
                <li>
                  <Link href="/workshops" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    Workshops
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta-light mb-4">
                Connect
              </h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                <li>
                  <Link href="/contact" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href={accountLink.href} className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    {accountLink.label}
                  </Link>
                </li>
                <li>
                  <a href="#" className="font-sans text-[13px] text-cream-100 hover:text-terracotta-light transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ornament divider */}
        <div className="ornament mb-8">
          <span className="font-serif italic text-[13px] text-terracotta-light tracking-wide px-2">
            ♡
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="font-sans text-[11px] text-cream-300 tracking-wide">
            &copy; 2026 {siteConfig.siteName}. All rights reserved.
          </span>
          <span className="font-sans text-[11px] text-cream-300 tracking-wide">
            Designed &amp; made in Portugal
          </span>
        </div>

      </div>
    </footer>
  );
}
