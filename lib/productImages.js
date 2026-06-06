export const PRODUCT_IMAGE_FALLBACK =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL || '/images/pannel.png';

export function productImageSrc(value) {
  return String(value || '').trim() || PRODUCT_IMAGE_FALLBACK;
}

export function applyProductImageFallback(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = PRODUCT_IMAGE_FALLBACK;
}
