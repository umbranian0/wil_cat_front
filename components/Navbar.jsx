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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/92 backdrop-blur-md border-b border-charcoal/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-serif text-[22px] text-charcoal tracking-tight">
          Wild Cat Ceramic
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-sans text-[13px] font-medium uppercase tracking-[0.08em] transition-opacity hover:opacity-100 ${
                  pathname === link.href ? 'text-charcoal opacity-100' : 'text-charcoal opacity-60'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => setIsOpen(true)}
              className="font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-charcoal flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
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

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-charcoal flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
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
        <div className="md:hidden bg-cream-100 border-t border-charcoal/[0.06] px-6 py-4">
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-sans text-[14px] font-medium uppercase tracking-[0.08em] block py-1 ${
                    pathname === link.href ? 'text-charcoal' : 'text-charcoal/60'
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
