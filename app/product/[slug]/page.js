import products from '@/data/products.json';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export function generateMetadata({ params }) {
  const product = products.find(p => p.slug === params.slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: `${product.name} — Wild Cat Ceramic`,
    description: product.description,
  };
}

export default function ProductPage({ params }) {
  const product = products.find(p => p.slug === params.slug);
  if (!product) notFound();

  // Get related products (same category, exclude current)
  const related = products
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  return <ProductDetailClient product={product} related={related} />;
}
