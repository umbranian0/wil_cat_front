import ProductDetailClient from './ProductDetailClient';
import {
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/catalog';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: `${product.name} — Wild Cat Ceramic`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id);

  return <ProductDetailClient product={product} related={related} />;
}
