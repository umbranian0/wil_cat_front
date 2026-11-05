import {
  getFeaturedProduct as getFeaturedProductFromRepository,
  getProductBySlug as getProductBySlugFromRepository,
  getRelatedProducts as getRelatedProductsFromRepository,
  listProductStaticParams as listProductStaticParamsFromRepository,
  listProducts as listProductsFromRepository,
  listPublicProducts,
  listCarouselProducts as listCarouselProductsFromRepository,
  getCmsPageBySlug as getCmsPageBySlugFromRepository,
  listPublishedWorkshops as listPublishedWorkshopsFromRepository,
} from '@/lib/backoffice/repository';
import {
  getSeedFeaturedProduct,
  getSeedProductBySlug,
  getSeedRelatedProducts,
  listPublishedSeedProducts,
  listSeedProducts,
} from '@/lib/seedCatalog';

function isMissingKvError(error) {
  return String(error?.message || '').includes('Upstash KV is required');
}

export async function listProducts() {
  try {
    return await listProductsFromRepository();
  } catch (error) {
    if (isMissingKvError(error)) return listSeedProducts();
    throw error;
  }
}

export async function listPublishedProducts() {
  try {
    return await listPublicProducts();
  } catch (error) {
    if (isMissingKvError(error)) return listPublishedSeedProducts();
    throw error;
  }
}

export async function getFeaturedProduct() {
  try {
    return await getFeaturedProductFromRepository();
  } catch (error) {
    if (isMissingKvError(error)) return getSeedFeaturedProduct();
    throw error;
  }
}

export async function listCarouselProducts() {
  try {
    return await listCarouselProductsFromRepository();
  } catch (error) {
    if (isMissingKvError(error)) {
      return listPublishedSeedProducts()
        .filter((product) => product.featuredRank != null)
        .sort((a, b) => Number(a.featuredRank) - Number(b.featuredRank));
    }
    throw error;
  }
}

export async function getProductBySlug(slug) {
  try {
    return await getProductBySlugFromRepository(slug, { publicOnly: true });
  } catch (error) {
    if (isMissingKvError(error)) return getSeedProductBySlug(slug);
    throw error;
  }
}

export async function getRelatedProducts(productId, limit = 3) {
  try {
    return await getRelatedProductsFromRepository(productId, limit);
  } catch (error) {
    if (isMissingKvError(error)) return getSeedRelatedProducts(productId, limit);
    throw error;
  }
}

export async function listProductStaticParams() {
  try {
    return await listProductStaticParamsFromRepository();
  } catch (error) {
    if (isMissingKvError(error)) return listPublishedSeedProducts().map((product) => ({ slug: product.slug }));
    throw error;
  }
}

export async function getCmsPageBySlug(slug) {
  try {
    return await getCmsPageBySlugFromRepository(slug);
  } catch (error) {
    if (isMissingKvError(error)) return null;
    throw error;
  }
}

export async function listPublishedWorkshops() {
  try {
    return await listPublishedWorkshopsFromRepository();
  } catch (error) {
    if (isMissingKvError(error)) return [];
    throw error;
  }
}

export async function getWorkshopBySlug(slug) {
  const page = await getCmsPageBySlug(slug);
  if (!page || page.type !== 'workshop' || page.status !== 'published') return null;
  return page;
}
