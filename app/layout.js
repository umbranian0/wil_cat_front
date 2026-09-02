import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { getCmsPageBySlug } from '@/lib/catalog';
import { navigationLinksFromPage } from '@/lib/cmsContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Atelier Studio — Considered Clothing & Workshops',
  description: 'Small-batch clothing designed and finished by hand, alongside hands-on workshops to learn the craft.',
};

export default async function RootLayout({ children }) {
  let navigationLinks = navigationLinksFromPage(null);
  try {
    const navigationPage = await getCmsPageBySlug('site-navigation');
    navigationLinks = navigationLinksFromPage(navigationPage);
  } catch {
    navigationLinks = navigationLinksFromPage(null);
  }

  return (
    <html lang="en">
      <body className="bg-cream-100 min-h-screen">
        <CartProvider>
          <Navbar links={navigationLinks} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer navigationLinks={navigationLinks} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
