import seedProducts from '@/data/products.json';
import { createHash, randomUUID } from 'crypto';
import { attachMediaAssetToProduct, getMediaAssetById, getMediaReadiness } from './media';
import { getKV, getStorageInfo } from './kv';
import { getAuthReadiness } from './auth';
import { keys, orderStatuses, productStatuses, slugify } from './keys';
import {
  cmsPageInputSchema,
  contactSubmissionSchema,
  normalizeCmsInput,
  normalizeProductInput,
  orderSubmissionSchema,
  orderUpdateSchema,
  productInputSchema,
  productSchema,
} from './schemas';
import { listAdminNotifications, recordAdminNotification } from './notifications';
import { assessOrderRisk, recordRiskEvent, sha256 } from './security';

const DEFAULT_CMS_PAGES = [
  {
    slug: 'homepage',
    type: 'homepage_section',
    title: 'Homepage',
    blocks: [
      { type: 'featured_message', value: 'Every piece is made by hand. No two are ever the same.' },
    ],
  },
  {
    slug: 'faq',
    type: 'faq',
    title: 'FAQ',
    blocks: [
      { type: 'note', value: 'POC editable content record. Public FAQ rendering can be wired in the MVP.' },
    ],
  },
  {
    slug: 'terms',
    type: 'terms',
    title: 'Terms',
    blocks: [
      { type: 'note', value: 'POC editable content record. Public terms rendering can be wired in the MVP.' },
    ],
  },
];

function nowIso() {
  return new Date().toISOString();
}

function scoreFromDate(value) {
  return Date.parse(value || nowIso());
}

function hashDocument(value) {
  return createHash('sha256').update(JSON.stringify(value || null)).digest('hex');
}

function legacyProductToInput(product) {
  return {
    ...product,
    name: product.name,
    priceAmount: Number(product.price || 0),
    stockQty: product.inStock === false ? 0 : 1,
    status: 'published',
  };
}

async function getDocuments(ids, keyFactory) {
  const kv = getKV();
  const docs = await Promise.all((ids || []).map((id) => kv.getJson(keyFactory(id))));
  return docs.filter(Boolean);
}

async function writeAuditEvent({ actor, action, entityType, entityId, before, after, metadata = {} }) {
  const kv = getKV();
  const createdAt = nowIso();
  const id = `audit_${randomUUID()}`;
  const record = {
    id,
    actorId: actor?.id || 'system',
    actorEmail: actor?.email || '',
    action,
    entityType,
    entityId,
    beforeHash: hashDocument(before),
    afterHash: hashDocument(after),
    metadata,
    createdAt,
  };

  await kv.setJson(keys.audit(id), record);
  await kv.zadd(keys.auditIndexCreated, scoreFromDate(createdAt), id);
  await kv.zadd(keys.auditIndexEntity(entityType, entityId), scoreFromDate(createdAt), id);
  return record;
}

async function writeActionNotification({ actor, action, entityType, entityId, title, message, metadata = {} }) {
  if (!actor || actor.id === 'system' || actor.id === 'customer') return null;
  return recordAdminNotification({
    actor,
    type: 'success',
    title,
    message,
    action,
    entityType,
    entityId,
    metadata,
  });
}

function productNotificationText(action, product) {
  if (action === 'product_archive') return { title: 'Product archived', message: `${product.name} was archived.` };
  if (action === 'product_create') return { title: 'Product saved', message: `${product.name} was created.` };
  if (action === 'inventory_sell') return { title: 'Inventory updated', message: `${product.name} stock was updated.` };
  return { title: 'Product saved', message: `${product.name} was updated.` };
}

async function seedProductsIfNeeded() {
  const kv = getKV();
  const seeded = await kv.getJson(keys.metaSeeded);
  if (seeded?.products) return;

  for (const product of seedProducts) {
    await saveProduct(legacyProductToInput(product), {
      actor: { id: 'system', email: 'seed' },
      skipSeed: true,
      action: 'seed_product',
    });
  }

  for (const page of DEFAULT_CMS_PAGES) {
    await saveCmsPage(page, {
      actor: { id: 'system', email: 'seed' },
      skipSeed: true,
      action: 'seed_cms_page',
    });
  }

  await kv.setJson(keys.metaSeeded, {
    products: true,
    cms: true,
    seededAt: nowIso(),
  });
}

export async function ensureSeeded() {
  await seedProductsIfNeeded();
}

export async function listProducts(options = {}) {
  await ensureSeeded();
  const kv = getKV();
  const index = options.status ? keys.productIndexStatus(options.status) : keys.productIndexAll;
  const ids = await kv.zrange(index, 0, -1);
  const products = await getDocuments(ids, keys.product);
  return products
    .filter((product) => !options.publicOnly || product.status === 'published')
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export async function getProductById(id) {
  await ensureSeeded();
  return getKV().getJson(keys.product(id));
}

export async function getProductBySlug(slug, options = {}) {
  await ensureSeeded();
  const kv = getKV();
  const id = await kv.getJson(keys.productSlug(slugify(slug)));
  if (!id) return null;
  const product = await kv.getJson(keys.product(id));
  if (!product) return null;
  if (options.publicOnly && product.status !== 'published') return null;
  return product;
}

async function updateProductIndexes(product, previous = null) {
  const kv = getKV();
  const score = scoreFromDate(product.createdAt);
  if (previous) {
    await kv.zrem(keys.productIndexStatus(previous.status), product.id);
    await kv.zrem(keys.productIndexCategory(slugify(previous.category)), product.id);
    if (previous.featuredRank != null) await kv.zrem(keys.productIndexFeatured, product.id);
    if (previous.slug !== product.slug) await kv.del(keys.productSlug(previous.slug));
  }

  await kv.zadd(keys.productIndexAll, score, product.id);
  await kv.zadd(keys.productIndexStatus(product.status), score, product.id);
  await kv.zadd(keys.productIndexCategory(slugify(product.category)), score, product.id);
  if (product.featuredRank != null) {
    await kv.zadd(keys.productIndexFeatured, Number(product.featuredRank), product.id);
  }
  await kv.setJson(keys.productSlug(product.slug), product.id);
}

export async function saveProduct(input, options = {}) {
  if (!options.skipSeed) await ensureSeeded();
  productInputSchema.parse(input);
  const kv = getKV();
  const previous = input.id ? await kv.getJson(keys.product(input.id)) : null;
  let product = normalizeProductInput(input, previous);
  const mediaAssetId = input.imageAssetId || input.primaryImageAssetId || '';
  if (mediaAssetId) {
    const mediaAsset = await getMediaAssetById(mediaAssetId);
    if (mediaAsset) {
      const imageUrl = product.image || mediaAsset.secureUrl || mediaAsset.url;
      product = productSchema.parse({
        ...product,
        image: imageUrl,
        primaryImageAssetId: mediaAsset.id,
        images: [
          {
            url: imageUrl,
            alt: product.name,
            provider: mediaAsset.provider,
            publicId: mediaAsset.publicId,
            assetId: mediaAsset.id,
            width: mediaAsset.width,
            height: mediaAsset.height,
            format: mediaAsset.format,
            bytes: mediaAsset.bytes,
          },
        ],
      });
    }
  }
  const slugOwner = await kv.getJson(keys.productSlug(product.slug));
  if (slugOwner && slugOwner !== product.id) {
    const error = new Error('Product slug is already in use.');
    error.status = 409;
    throw error;
  }

  await kv.setJson(keys.product(product.id), product);
  await updateProductIndexes(product, previous);
  if (mediaAssetId) await attachMediaAssetToProduct(mediaAssetId, product, options.actor);
  const action = options.action || (previous ? 'product_update' : 'product_create');
  await writeAuditEvent({
    actor: options.actor,
    action,
    entityType: 'product',
    entityId: product.id,
    before: previous,
    after: product,
  });
  const notification = productNotificationText(action, product);
  await writeActionNotification({
    actor: options.actor,
    action,
    entityType: 'product',
    entityId: product.id,
    title: notification.title,
    message: notification.message,
  });
  return product;
}

export async function archiveProduct(id, actor) {
  const product = await getProductById(id);
  if (!product) return null;
  return saveProduct({ ...product, status: 'archived', name: product.name }, { actor, action: 'product_archive' });
}

export async function listPublicProducts() {
  return listProducts({ publicOnly: true, status: 'published' });
}

export async function listProductStaticParams() {
  const products = await listPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function getFeaturedProduct() {
  await ensureSeeded();
  const kv = getKV();
  const featuredIds = await kv.zrange(keys.productIndexFeatured, 0, 0);
  if (featuredIds.length) {
    const product = await kv.getJson(keys.product(featuredIds[0]));
    if (product?.status === 'published') return product;
  }
  const products = await listPublicProducts();
  return products[0] || null;
}

export async function getRelatedProducts(productId, limit = 3) {
  const products = await listPublicProducts();
  return products.filter((product) => product.id !== productId).slice(0, limit);
}

function isProductAvailable(product, qty) {
  if (!product || product.status !== 'published' || product.inStock === false) return false;
  if (product.inventoryMode === 'made_to_order') return true;
  return Number(product.stockQty || 0) - Number(product.reservedQty || 0) >= qty;
}

export async function createOrder(input, context = {}) {
  await ensureSeeded();
  const parsed = orderSubmissionSchema.parse(input);
  const kv = getKV();

  if (parsed.website) {
    await recordRiskEvent({
      type: 'honeypot_triggered',
      severity: 'high',
      score: 90,
      subject: 'order',
      metadata: { field: 'website' },
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
      requestId: context.requestId,
    });
    const error = new Error('Order submission was rejected.');
    error.status = 400;
    throw error;
  }

  if (parsed.submittedAt && Date.now() - parsed.submittedAt < 1200) {
    await recordRiskEvent({
      type: 'fast_form_submission',
      severity: 'medium',
      score: 45,
      subject: 'order',
      metadata: { elapsedMs: Date.now() - parsed.submittedAt },
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
      requestId: context.requestId,
    });
  }

  if (parsed.idempotencyKey) {
    const existingId = await kv.getJson(keys.orderIdempotency(parsed.idempotencyKey));
    if (existingId) {
      const existing = await kv.getJson(keys.order(existingId));
      if (existing) return { order: existing, idempotent: true };
    }
  }

  const items = [];
  for (const item of parsed.items) {
    const product = await getProductById(item.id);
    if (!isProductAvailable(product, item.qty)) {
      const error = new Error(`Product is unavailable: ${item.id}`);
      error.status = 409;
      throw error;
    }
    items.push({
      productId: product.id,
      productSnapshot: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        category: product.category,
      },
      qty: item.qty,
      unitPrice: Number(product.priceAmount || product.price || 0),
      currency: product.currency,
      lineTotal: Number(product.priceAmount || product.price || 0) * item.qty,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const sequence = await kv.incr(keys.id('order'));
  const createdAt = nowIso();
  const id = `order_${randomUUID()}`;
  const publicOrderNumber = `WC-${new Date().getFullYear()}-${String(sequence).padStart(5, '0')}`;
  const emailHash = sha256(parsed.customer.email);
  const order = {
    id,
    publicOrderNumber,
    status: 'submitted',
    customer: {
      ...parsed.customer,
      emailHash,
    },
    items,
    subtotal,
    shippingQuote: 0,
    total: subtotal,
    channel: 'web',
    paymentMethod: '',
    internalNotes: '',
    customerNotes: parsed.customer.message || '',
    timeline: [
      {
        status: 'submitted',
        note: 'Order request submitted from website.',
        actorId: 'customer',
        createdAt,
      },
    ],
    risk: { score: 0, severity: 'info', reasons: [] },
    createdAt,
    updatedAt: createdAt,
    version: 1,
  };

  order.risk = assessOrderRisk({ order, context });
  await kv.setJson(keys.order(id), order);
  await kv.setJson(keys.orderNumber(publicOrderNumber), id);
  await kv.zadd(keys.orderIndexCreated, scoreFromDate(createdAt), id);
  await kv.zadd(keys.orderIndexStatus(order.status), scoreFromDate(createdAt), id);
  await kv.zadd(keys.orderIndexEmail(emailHash), scoreFromDate(createdAt), id);
  if (parsed.idempotencyKey) {
    await kv.setJson(keys.orderIdempotency(parsed.idempotencyKey), id, { ex: 60 * 60 * 24 });
  }

  await writeAuditEvent({
    actor: { id: 'customer', email: parsed.customer.email },
    action: 'order_create',
    entityType: 'order',
    entityId: id,
    before: null,
    after: order,
    metadata: { publicOrderNumber, requestId: context.requestId },
  });

  if (order.risk.score >= 40) {
    await recordRiskEvent({
      type: 'suspicious_order',
      severity: order.risk.severity,
      score: order.risk.score,
      subject: publicOrderNumber,
      metadata: { reasons: order.risk.reasons, total: order.total },
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
      requestId: context.requestId,
    });
  }

  return { order, idempotent: false };
}

export async function listOrders(options = {}) {
  await ensureSeeded();
  const kv = getKV();
  const index = options.status ? keys.orderIndexStatus(options.status) : keys.orderIndexCreated;
  const ids = await kv.zrange(index, -Number(options.limit || 100), -1);
  let orders = await getDocuments(ids.reverse(), keys.order);
  if (options.email) {
    const emailHash = sha256(options.email);
    orders = orders.filter((order) => order.customer.emailHash === emailHash);
  }
  return orders;
}

export async function getOrderById(id) {
  await ensureSeeded();
  return getKV().getJson(keys.order(id));
}

async function applyInventoryOnComplete(order, actor) {
  for (const item of order.items) {
    const product = await getProductById(item.productId);
    if (!product || product.inventoryMode === 'made_to_order') continue;
    const nextStock = Math.max(0, Number(product.stockQty || 0) - item.qty);
    const nextReserved = Math.max(0, Number(product.reservedQty || 0) - item.qty);
    await saveProduct(
      {
        ...product,
        name: product.name,
        stockQty: nextStock,
        soldQty: Number(product.soldQty || 0) + item.qty,
        reservedQty: nextReserved,
        inStock: nextStock > 0,
      },
      { actor, action: 'inventory_sell' }
    );
  }
}

export async function updateOrder(id, input, actor) {
  await ensureSeeded();
  const parsed = orderUpdateSchema.parse(input);
  const kv = getKV();
  const previous = await kv.getJson(keys.order(id));
  if (!previous) return null;

  const updatedAt = nowIso();
  const next = {
    ...previous,
    ...parsed,
    shippingQuote:
      parsed.shippingQuote !== undefined ? Number(parsed.shippingQuote) : Number(previous.shippingQuote || 0),
    updatedAt,
    version: Number(previous.version || 0) + 1,
  };
  next.total = Number(next.subtotal || 0) + Number(next.shippingQuote || 0);

  if (parsed.status && parsed.status !== previous.status) {
    next.timeline = [
      ...(previous.timeline || []),
      {
        status: parsed.status,
        note: `Status changed from ${previous.status} to ${parsed.status}.`,
        actorId: actor?.id || 'admin',
        createdAt: updatedAt,
      },
    ];
  }

  await kv.setJson(keys.order(id), next);
  if (next.status !== previous.status) {
    await kv.zrem(keys.orderIndexStatus(previous.status), id);
    await kv.zadd(keys.orderIndexStatus(next.status), scoreFromDate(next.createdAt), id);
    if (next.status === 'completed' && previous.status !== 'completed') {
      await applyInventoryOnComplete(next, actor);
    }
  }

  await writeAuditEvent({
    actor,
    action: 'order_update',
    entityType: 'order',
    entityId: id,
    before: previous,
    after: next,
    metadata: { statusChanged: next.status !== previous.status },
  });
  await writeActionNotification({
    actor,
    action: 'order_update',
    entityType: 'order',
    entityId: id,
    title: 'Order saved',
    message: `${next.publicOrderNumber} was updated.`,
    metadata: { status: next.status, statusChanged: next.status !== previous.status },
  });
  return next;
}

export async function listCmsPages() {
  await ensureSeeded();
  const ids = await getKV().zrange(keys.cmsIndexAll, 0, -1);
  return getDocuments(ids, keys.cmsPage);
}

export async function getCmsPage(id) {
  await ensureSeeded();
  return getKV().getJson(keys.cmsPage(id));
}

async function updateCmsIndexes(page, previous = null) {
  const kv = getKV();
  const score = scoreFromDate(page.createdAt);
  if (previous) {
    await kv.zrem(keys.cmsIndexStatus(previous.status), page.id);
    if (previous.slug !== page.slug) await kv.del(keys.cmsPageSlug(previous.slug));
  }
  await kv.zadd(keys.cmsIndexAll, score, page.id);
  await kv.zadd(keys.cmsIndexStatus(page.status), score, page.id);
  await kv.setJson(keys.cmsPageSlug(page.slug), page.id);
}

export async function saveCmsPage(input, options = {}) {
  if (!options.skipSeed) await ensureSeeded();
  cmsPageInputSchema.parse(input);
  const kv = getKV();
  const previous = input.id ? await kv.getJson(keys.cmsPage(input.id)) : null;
  const page = normalizeCmsInput(input, previous);
  const slugOwner = await kv.getJson(keys.cmsPageSlug(page.slug));
  if (slugOwner && slugOwner !== page.id) {
    const error = new Error('CMS page slug is already in use.');
    error.status = 409;
    throw error;
  }
  await kv.setJson(keys.cmsPage(page.id), page);
  await updateCmsIndexes(page, previous);
  const action = options.action || (previous ? 'cms_update' : 'cms_create');
  await writeAuditEvent({
    actor: options.actor,
    action,
    entityType: 'cms_page',
    entityId: page.id,
    before: previous,
    after: page,
  });
  await writeActionNotification({
    actor: options.actor,
    action,
    entityType: 'cms_page',
    entityId: page.id,
    title: 'CMS content saved',
    message: `${page.title} was saved.`,
  });
  return page;
}

export async function createEnquiry(input, context = {}) {
  const parsed = contactSubmissionSchema.parse(input);
  const kv = getKV();
  if (parsed.website) {
    await recordRiskEvent({
      type: 'contact_honeypot_triggered',
      severity: 'high',
      score: 90,
      subject: 'contact',
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
      requestId: context.requestId,
    });
    const error = new Error('Contact submission was rejected.');
    error.status = 400;
    throw error;
  }
  const createdAt = nowIso();
  const id = `enquiry_${randomUUID()}`;
  const enquiry = {
    id,
    name: parsed.name,
    email: parsed.email,
    emailHash: sha256(parsed.email),
    message: parsed.message,
    status: 'open',
    createdAt,
  };
  await kv.setJson(keys.enquiry(id), enquiry);
  await kv.zadd(keys.enquiryIndexCreated, scoreFromDate(createdAt), id);
  await writeAuditEvent({
    actor: { id: 'customer', email: parsed.email },
    action: 'enquiry_create',
    entityType: 'enquiry',
    entityId: id,
    before: null,
    after: enquiry,
  });
  return enquiry;
}

export async function listAuditEvents(limit = 50) {
  const ids = await getKV().zrange(keys.auditIndexCreated, -limit, -1);
  return getDocuments(ids.reverse(), keys.audit);
}

export async function listNotifications(limit = 50) {
  return listAdminNotifications(limit);
}

export async function getDashboardSummary() {
  await ensureSeeded();
  const [products, orders, pages, audit, notifications] = await Promise.all([
    listProducts(),
    listOrders({ limit: 200 }),
    listCmsPages(),
    listAuditEvents(20),
    listNotifications(20),
  ]);
  const ordersByStatus = Object.fromEntries(orderStatuses.map((status) => [status, 0]));
  for (const order of orders) ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;

  return {
    storage: getStorageInfo(),
    auth: getAuthReadiness(),
    media: getMediaReadiness(),
    productCount: products.length,
    publishedProductCount: products.filter((product) => product.status === 'published').length,
    lowStockCount: products.filter((product) => product.status === 'published' && Number(product.stockQty || 0) <= 0).length,
    orderCount: orders.length,
    openOrderCount: orders.filter((order) => !['completed', 'cancelled', 'refunded'].includes(order.status)).length,
    cmsPageCount: pages.length,
    notificationCount: notifications.length,
    ordersByStatus,
    recentAudit: audit,
    recentNotifications: notifications,
  };
}

export { orderStatuses, productStatuses };
