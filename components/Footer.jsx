import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/[0.08] px-6 md:px-10 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Brand */}
          <div>
            <div className="font-serif text-lg text-charcoal mb-2">Wild Cat Ceramic</div>
            <p className="font-sans text-xs text-cream-500 leading-relaxed max-w-[260px]">
              Handmade ceramics with soul.<br />
              Made with love, shipped worldwide.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-cream-500 mb-3">Shop</h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li><Link href="/shop" className="font-sans text-[13px] text-charcoal/70 hover:text-charcoal transition-colors">All pieces</Link></li>
                <li><Link href="/about" className="font-sans text-[13px] text-charcoal/70 hover:text-charcoal transition-colors">About</Link></li>
                <li><Link href="/faq" className="font-sans text-[13px] text-charcoal/70 hover:text-charcoal transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-cream-500 mb-3">Connect</h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li><Link href="/contact" className="font-sans text-[13px] text-charcoal/70 hover:text-charcoal transition-colors">Contact</Link></li>
                <li><a href="#" className="font-sans text-[13px] text-charcoal/70 hover:text-charcoal transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-charcoal/[0.06] flex flex-col md:flex-row justify-between items-center gap-2">
          <span className="font-sans text-[11px] text-cream-400 tracking-wide">
            © 2026 Wild Cat Ceramic. All rights reserved.
          </span>
          <span className="font-sans text-[11px] text-cream-400 tracking-wide">
            Handmade in Portugal
          </span>
        </div>
      </div>
    </footer>
  );
}
