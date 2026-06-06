export const PRODUCT_IMAGE_FALLBACK =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL || '/images/pannel.png';

function isRenderableProductImage(value) {
  const imageUrl = String(value || '').trim();
  if (!imageUrl) return false;
  if (imageUrl.startsWith('/images/') && !imageUrl.includes('..')) return true;

  try {
    const parsed = new URL(imageUrl);
    return parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

export function productImageSrc(value) {
  const imageUrl = String(value || '').trim();
  return isRenderableProductImage(imageUrl) ? imageUrl : PRODUCT_IMAGE_FALLBACK;
}

export function applyProductImageFallback(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = PRODUCT_IMAGE_FALLBACK;
}
