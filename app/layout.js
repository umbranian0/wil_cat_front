import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Wild Cat Ceramic — Handmade Ceramics',
  description: 'Playful handcrafted ceramics made with soul. Each piece is shaped by hand and glazed with care.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-cream-100 min-h-screen">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
