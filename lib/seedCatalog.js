import seedProducts from '@/data/products.json';

export function normalizeSeedProduct(product) {
  const priceAmount = Number(product.price ?? product.priceAmount ?? 0);
  const tag = product.tag || '';

  return {
    ...product,
    price: priceAmount,
    priceAmount,
    currency: product.currency || '€',
    tags: product.tags || (tag ? [tag] : []),
    tag,
    images: product.images || [
      {
        url: product.image,
        alt: product.name,
      },
    ],
    image: product.image || product.images?.[0]?.url || '',
    status: product.status || 'published',
    inventoryMode: product.inventoryMode || 'one_of_one',
    stockQty: Number(product.stockQty ?? (product.inStock === false ? 0 : 1)),
    reservedQty: Number(product.reservedQty ?? 0),
    soldQty: Number(product.soldQty ?? 0),
    inStock: product.inStock !== false,
    version: Number(product.version ?? 1),
  };
}

export function listSeedProducts() {
  return seedProducts.map(normalizeSeedProduct);
}

export function listPublishedSeedProducts() {
  return listSeedProducts().filter((product) => product.status === 'published');
}

export function getSeedProductBySlug(slug) {
  return listPublishedSeedProducts().find((product) => product.slug === slug) || null;
}

export function getSeedFeaturedProduct() {
  const products = listPublishedSeedProducts();
  return products.find((product) => product.featuredRank === 1) || products[0] || null;
}

export function getSeedRelatedProducts(productId, limit = 3) {
  return listPublishedSeedProducts().filter((product) => product.id !== productId).slice(0, limit);
}
