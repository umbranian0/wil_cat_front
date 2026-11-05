'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import siteConfig from '@/lib/config';

export default function Navbar({ links: configuredLinks }) {
  const { totalItems, setIsOpen } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const defaultLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
    { href: '/account', label: 'My Account' },
  ];
  const links = configuredLinks?.length ? configuredLinks : defaultLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-md border-b-2 border-terracotta/25 shadow-[0_2px_18px_rgba(208,98,138,0.10)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-[72px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/logo/cat-head.png"
            alt=""
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover"
          />
          <span className="font-serif text-2xl tracking-tight text-charcoal">
            {siteConfig.siteName.split(' ')[0]}
            <em className="italic text-terracotta"> {siteConfig.siteName.split(' ').slice(1).join(' ')}</em>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1.5 list-none m-0 p-0">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-sans text-[13px] font-bold uppercase tracking-[0.08em] px-3.5 py-2 rounded-full transition-colors ${
                  pathname === link.href
                    ? 'bg-terracotta text-white'
                    : 'text-charcoal hover:bg-cream-200 hover:text-terracotta-dark'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => setIsOpen(true)}
              className="ml-3 font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-white bg-charcoal px-5 py-2 rounded-full flex items-center gap-2 border-none cursor-pointer hover:bg-terracotta-dark transition-colors"
            >
              Cart
              {totalItems > 0 && (
                <span className="bg-terracotta text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
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
            className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-white bg-charcoal px-4 py-1.5 rounded-full flex items-center gap-1.5 border-none cursor-pointer"
          >
            Cart
            {totalItems > 0 && (
              <span className="bg-terracotta text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
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
                  className={`font-sans text-[15px] font-bold uppercase tracking-[0.08em] block py-1 ${
                    pathname === link.href ? 'text-terracotta' : 'text-charcoal'
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
