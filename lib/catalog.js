import {
  getFeaturedProduct as getFeaturedProductFromRepository,
  getProductBySlug as getProductBySlugFromRepository,
  getRelatedProducts as getRelatedProductsFromRepository,
  listProductStaticParams as listProductStaticParamsFromRepository,
  listProducts as listProductsFromRepository,
  listPublicProducts,
} from '@/lib/backoffice/repository';

export async function listProducts() {
  return listProductsFromRepository();
}

export async function listPublishedProducts() {
  return listPublicProducts();
}

export async function getFeaturedProduct() {
  return getFeaturedProductFromRepository();
}

export async function getProductBySlug(slug) {
  return getProductBySlugFromRepository(slug, { publicOnly: true });
}

export async function getRelatedProducts(productId, limit = 3) {
  return getRelatedProductsFromRepository(productId, limit);
}

export async function listProductStaticParams() {
  return listProductStaticParamsFromRepository();
}
