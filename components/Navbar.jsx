'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/95 backdrop-blur-md border-b border-charcoal/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-[72px]">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logo/imagem.png"
            alt="Wild Cat Ceramica"
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-9 list-none m-0 p-0">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-sans text-[11px] font-medium uppercase tracking-[0.1em] transition-all hover:text-charcoal ${
                  pathname === link.href
                    ? 'text-charcoal border-b border-charcoal pb-px'
                    : 'text-charcoal/50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => setIsOpen(true)}
              className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/50 flex items-center gap-2 bg-transparent border-none cursor-pointer hover:text-charcoal transition-colors"
            >
              Cart
              {totalItems > 0 && (
                <span className="bg-terracotta text-cream-100 text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </li>
        </ul>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-5">
          <button
            onClick={() => setIsOpen(true)}
            className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal/60 flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
          >
            Cart
            {totalItems > 0 && (
              <span className="bg-terracotta text-cream-100 text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="bg-transparent border-none cursor-pointer text-charcoal text-xl p-1"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cream-100 border-t border-charcoal/[0.06] px-6 py-5">
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-sans text-[13px] font-medium uppercase tracking-[0.1em] block py-1 ${
                    pathname === link.href ? 'text-charcoal' : 'text-charcoal/50'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
