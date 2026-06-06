export const VERSION = 'v1';

export const productStatuses = ['draft', 'published', 'archived'];
export const orderStatuses = [
  'submitted',
  'awaiting_confirmation',
  'confirmed',
  'awaiting_payment',
  'paid',
  'packed',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
];

export const keys = {
  metaSeeded: `${VERSION}:meta:seeded`,
  product: (id) => `${VERSION}:product:${id}`,
  productSlug: (slug) => `${VERSION}:product:slug:${slug}`,
  productIndexAll: `${VERSION}:product:index:all`,
  productIndexStatus: (status) => `${VERSION}:product:index:status:${status}`,
  productIndexCategory: (category) => `${VERSION}:product:index:category:${category}`,
  productIndexFeatured: `${VERSION}:product:index:featured`,
  mediaAsset: (id) => `${VERSION}:media:asset:${id}`,
  mediaAssetIndexCreated: `${VERSION}:media:asset:index:created`,
  mediaAssetIndexStatus: (status) => `${VERSION}:media:asset:index:status:${status}`,
  mediaAssetIndexProduct: (productId) => `${VERSION}:media:asset:index:product:${productId}`,
  cmsPage: (id) => `${VERSION}:cms:page:${id}`,
  cmsPageSlug: (slug) => `${VERSION}:cms:page:slug:${slug}`,
  cmsIndexAll: `${VERSION}:cms:index:all`,
  cmsIndexStatus: (status) => `${VERSION}:cms:index:status:${status}`,
  order: (id) => `${VERSION}:order:${id}`,
  orderNumber: (number) => `${VERSION}:order:number:${number}`,
  orderIndexCreated: `${VERSION}:order:index:created`,
  orderIndexStatus: (status) => `${VERSION}:order:index:status:${status}`,
  orderIndexEmail: (hash) => `${VERSION}:order:index:customer_email:${hash}`,
  orderIdempotency: (key) => `${VERSION}:lock:order_submit:${key}`,
  enquiry: (id) => `${VERSION}:enquiry:${id}`,
  enquiryIndexCreated: `${VERSION}:enquiry:index:created`,
  audit: (id) => `${VERSION}:audit:${id}`,
  auditIndexCreated: `${VERSION}:audit:index:created`,
  auditIndexEntity: (type, id) => `${VERSION}:audit:index:entity:${type}:${id}`,
  notification: (id) => `${VERSION}:notification:${id}`,
  notificationIndexCreated: `${VERSION}:notification:index:created`,
  notificationIndexActor: (actorId) => `${VERSION}:notification:index:actor:${actorId}`,
  risk: (id) => `${VERSION}:risk:${id}`,
  riskIndexCreated: `${VERSION}:risk:index:created`,
  id: (scope) => `${VERSION}:id:${scope}`,
  rate: (scope, identifier) => `${VERSION}:rate:${scope}:${identifier}`,
};

export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
