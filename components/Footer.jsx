import Link from 'next/link';

export default function Footer({ navigationLinks = [] }) {
  const accountLink = navigationLinks.find((link) => link.href === '/account') || { href: '/account', label: 'My Account' };

  return (
    <footer className="bg-cream-200 border-t border-charcoal/[0.07] px-6 md:px-10 pt-16 pb-10 mt-8">
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-14">

          {/* Brand */}
          <div className="flex flex-col items-start gap-4 max-w-[240px]">
            <img
              src="/logo/imagem-transparent.png"
              alt="Wild Cat Ceramica"
              className="h-16 w-auto object-contain"
            />
            <p className="font-sans text-[13px] text-charcoal/55 leading-relaxed">
              Handmade ceramics with soul.<br />
              One-of-a-kind pieces from Portugal.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 md:gap-20">
            <div>
              <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal/40 mb-4">
                Shop
              </h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                <li>
                  <Link href="/shop" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    All pieces
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal/40 mb-4">
                Connect
              </h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                <li>
                  <Link href="/contact" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href={accountLink.href} className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    {accountLink.label}
                  </Link>
                </li>
                <li>
                  <a href="#" className="font-sans text-[13px] text-charcoal/65 hover:text-charcoal transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ornament divider */}
        <div className="ornament mb-8">
          <span className="font-serif italic text-[13px] text-charcoal/30 tracking-wide px-2">
            ✦
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="font-sans text-[11px] text-charcoal/35 tracking-wide">
            &copy; 2026 Wild Cat Ceramica. All rights reserved.
          </span>
          <span className="font-sans text-[11px] text-charcoal/35 tracking-wide">
            Handmade in Portugal
          </span>
        </div>

      </div>
    </footer>
  );
}
