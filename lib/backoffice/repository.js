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
import {
  getCustomerById,
  recordCustomerConsent,
  saveCustomerAddressFromOrder,
  updateCustomerProfile,
} from '@/lib/customer/repository';
import { getCustomerAuthReadiness } from '@/lib/customer/readiness';

const DEFAULT_CMS_PAGES = [
  {
    slug: 'homepage',
    type: 'homepage_section',
    title: 'Homepage',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Atelier Studio — Portugal',
        headline: 'Clothes made\nwith intention',
        tagline: 'Small-batch clothing designed and finished by hand, alongside hands-on workshops to learn the craft yourself.',
        marquee: '  ✶  Small-batch  ✶  Made by hand  ✶  Designed in Portugal  ✶  Workshops open  ✶  Considered clothing  ',
      },
      {
        type: 'callout',
        eyebrow: 'From the studio',
        heading: 'Every piece is cut, sewn, and finished by hand.',
      },
      {
        type: 'collection_banner',
        eyebrow: 'The Collection',
        heading: 'Made to be worn, not just owned',
      },
    ],
  },
  {
    slug: 'about',
    type: 'about',
    title: 'About',
    blocks: [
      { type: 'header', eyebrow: 'The studio', heading: 'About Atelier Studio', tagline: 'A small studio built around fabric, form, and hands-on learning.' },
      { type: 'paragraph', text: "Atelier Studio is a small design studio creating considered, made-to-last clothing — and a home for anyone who wants to learn how it's made." },
      { type: 'paragraph', text: 'Every piece starts on the cutting table and is finished by hand. We keep runs small on purpose, so fit, fabric, and finishing get the attention they deserve.' },
      { type: 'section_heading', text: 'The process' },
      { type: 'paragraph', text: 'Each garment moves through pattern-cutting, cutting, construction, and finishing in-house. We work with natural and responsibly sourced fabrics wherever we can, and every piece is checked by hand before it ships.' },
      { type: 'paragraph', text: 'Beyond the collection, we run hands-on workshops — sewing, pattern-cutting, styling — for anyone who wants to get closer to how clothes are actually made.' },
      { type: 'section_heading', text: 'Based in Portugal' },
      { type: 'paragraph', text: "Based in Portugal, Atelier Studio draws on the country's textile and craft traditions while keeping a modern, considered point of view. Come make something with us." },
    ],
  },
  {
    slug: 'faq',
    type: 'faq',
    title: 'FAQ',
    blocks: [
      { type: 'faq_item', question: 'How do I place an order?', answer: 'Add pieces to your cart, then send the request by WhatsApp or email. We confirm availability, sizing, and payment before the order is final.' },
      { type: 'faq_item', question: 'How do I pay?', answer: 'We send payment details after confirmation. Bank transfer and PayPal are currently available.' },
      { type: 'faq_item', question: 'How long does shipping take?', answer: 'Ready-to-ship orders usually leave within 5–7 business days after payment. Made-to-order timelines are confirmed separately.' },
      { type: 'faq_item', question: 'Do you ship internationally?', answer: 'Yes. We ship from Portugal, and shipping is quoted before payment.' },
      { type: 'faq_item', question: 'How do I know my size?', answer: "Each product page lists available sizes and a short fit note. Message us if you're between sizes and we'll help you choose." },
      { type: 'faq_item', question: 'How should I care for my pieces?', answer: 'Care instructions are listed on each product page. In general, wash cold and air dry to keep fabric and colour looking their best.' },
      { type: 'faq_item', question: 'How do workshop bookings work?', answer: "Pick a workshop, choose an available session, and request a seat. We confirm your spot immediately if there's space, or add you to the waitlist if the session is full." },
      { type: 'faq_item', question: 'What if a workshop session is full?', answer: 'You can join the waitlist. If a seat opens up, we contact you directly to confirm.' },
      { type: 'faq_item', question: 'Can I cancel or change a workshop booking?', answer: 'Contact us as soon as you can — see our Terms for the cancellation and no-show policy.' },
      { type: 'faq_item', question: 'Do you do wholesale or collaborations?', answer: 'We work with select shops and studios. Contact us to discuss.' },
    ],
  },
  {
    slug: 'terms',
    type: 'terms',
    title: 'Terms',
    blocks: [
      { type: 'terms_section', title: 'Orders', body: 'Cart checkout sends an order request. An order is confirmed only after we confirm availability, sizing, shipping cost, payment details, and any relevant timing.' },
      { type: 'terms_section', title: 'Made & Fitted', body: 'Pieces may be produced in small batches or made to order. Small differences in colour, texture, and finish are part of natural fabrics and small-batch production. Product photos represent the listed piece as accurately as possible.' },
      { type: 'terms_section', title: 'Payment', body: 'Payment details are sent after order confirmation. We currently accept bank transfer and PayPal unless another method is agreed in writing.' },
      { type: 'terms_section', title: 'Processing & Shipping', body: 'Ready-to-ship pieces usually leave the studio within 5–7 business days after payment. Shipping is sent from Portugal and quoted before payment. Delivery times depend on destination and carrier.' },
      { type: 'terms_section', title: 'Workshop Bookings', body: 'Booking a workshop session reserves a seat directly if space is available, or places you on a waitlist if the session is full. We will contact you if a waitlisted seat becomes available.' },
      { type: 'terms_section', title: 'Cancellations & No-Shows', body: 'Please contact us at least 48 hours before your session if you need to cancel or reschedule, so we can offer the seat to someone on the waitlist. Cancellations made after that window, or a no-show on the day, may not be eligible for a refund or credit.' },
      { type: 'terms_section', title: 'Damage in Transit', body: 'If a piece arrives damaged, contact us within 48 hours with photos of the item and packaging. Because each piece is unique, we cannot guarantee an identical replacement. Depending on the situation, we may offer a refund, repair, store credit, or a close alternative.' },
      { type: 'terms_section', title: 'Returns', body: 'For eligible distance purchases, contact us within 14 days of delivery before returning an item. Made-to-order or clearly personalised pieces are not returnable unless faulty or damaged. These terms do not limit any statutory consumer rights that apply to your order.' },
    ],
  },
  {
    slug: 'workshops',
    type: 'workshops',
    title: 'Workshops',
    blocks: [
      {
        type: 'hero',
        eyebrow: 'Learn with us',
        headline: 'Workshops for the curious',
        tagline: 'Small-group, hands-on sessions in sewing, pattern-cutting, and styling — taught in the studio.',
      },
      {
        type: 'callout',
        eyebrow: 'How it works',
        heading: 'Pick a session, request a seat, and we confirm or waitlist you right away.',
      },
    ],
  },
  {
    slug: 'site-navigation',
    type: 'navigation',
    title: 'Site navigation',
    blocks: [
      { type: 'nav_link', order: 1, href: '/', label: 'Home' },
      { type: 'nav_link', order: 2, href: '/shop', label: 'Shop' },
      { type: 'nav_link', order: 3, href: '/workshops', label: 'Workshops' },
      { type: 'nav_link', order: 4, href: '/about', label: 'About' },
      { type: 'nav_link', order: 5, href: '/contact', label: 'Contact' },
      { type: 'nav_link', order: 6, href: '/faq', label: 'FAQ' },
      { type: 'nav_link', order: 7, href: '/account', label: 'My Account' },
    ],
  },
  {
    slug: 'account',
    type: 'account',
    title: 'Customer account',
    blocks: [
      {
        type: 'account_header',
        eyebrow: 'Customer care',
        heading: 'My Account',
        intro: 'Follow orders, manage saved addresses, and control privacy preferences in one place.',
      },
      {
        type: 'account_auth',
        loginTitle: 'Welcome back',
        registerTitle: 'Create an account',
        authIntro: 'Use your customer account for faster checkout and order-status updates.',
      },
      {
        type: 'account_labels',
        ordersLabel: 'Orders',
        addressesLabel: 'Addresses',
        privacyLabel: 'Privacy',
        profileLabel: 'Profile',
        signOutLabel: 'Sign out',
        ordersTitle: 'Order status',
        addressesTitle: 'Saved addresses',
        privacyTitle: 'Data protection',
        profileTitle: 'Profile',
        emptyOrdersText: 'No customer orders are linked to this account yet.',
        emptyPrivacyRequestsText: 'No privacy requests have been submitted.',
        emptyConsentText: 'No consent records are available.',
      },
      {
        type: 'account_feature',
        title: 'Order status',
        text: 'See each request from submission through confirmation, payment, packing, and shipping.',
      },
      {
        type: 'account_feature',
        title: 'Saved addresses',
        text: 'Keep delivery details ready for future orders without retyping them at checkout.',
      },
      {
        type: 'account_feature',
        title: 'Privacy control',
        text: 'Review consent records and submit access, correction, deletion, or portability requests.',
      },
    ],
  },
  {
    slug: 'privacy',
    type: 'privacy',
    title: 'Privacy policy',
    blocks: [
      {
        type: 'privacy_header',
        eyebrow: 'Privacy',
        heading: 'Privacy policy',
        intro: 'This page explains how customer account, order, booking, address, and consent data is handled for Atelier Studio.',
      },
      {
        type: 'privacy_section',
        title: 'Controller',
        body: 'Atelier Studio processes customer data for account management, order handling, workshop bookings, customer communication, and legal record keeping. The business owner should replace this paragraph with the final controller name, address, and contact email before production release.',
      },
      {
        type: 'privacy_section',
        title: 'Personal data we process',
        body: 'We process account details, contact details, shipping and billing addresses, order and workshop booking history, customer messages, consent records, privacy-request records, and technical security metadata such as hashed IP and browser identifiers used for abuse prevention.',
      },
      {
        type: 'privacy_section',
        title: 'Purposes and lawful bases',
        body: 'Account creation and order management are processed for contract preparation or performance. Accounting and dispute records may be retained for legal obligations or legitimate interests. Marketing email is processed only where the customer has given separate consent and may be withdrawn at any time.',
      },
      {
        type: 'privacy_section',
        title: 'Retention',
        body: 'Customer account records are retained while the account remains active. Order records are retained for operational, accounting, and dispute-resolution purposes according to applicable law. Marketing consent records are retained to evidence consent and withdrawal history.',
      },
      {
        type: 'privacy_section',
        title: 'Customer rights',
        body: 'Customers may request access, rectification, erasure, restriction, portability, objection, or withdrawal of consent where applicable. Some requests may be limited where records must be retained for legal obligations, accounting, dispute handling, or fraud prevention.',
      },
      {
        type: 'privacy_section',
        title: 'Security',
        body: 'Customer passwords are stored as salted password hashes. Customer sessions use HTTP-only cookies. Access to order status is restricted to the authenticated customer account linked to the order.',
      },
      {
        type: 'privacy_section',
        title: 'International transfers',
        body: 'Hosting, email, analytics, payment, or logistics providers may process data outside Portugal or the European Economic Area depending on the configured production services. The production service list should be reviewed before release.',
      },
      {
        type: 'privacy_section',
        title: 'Policy version',
        body: 'Current policy version: 2026-06-06. Consent and policy acceptance records store this version with a timestamp.',
      },
    ],
  },
];

const DEFAULT_CMS_VERSION = 3;

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
  if (seeded?.products) {
    await seedMissingCmsDefaults(kv, seeded);
    return;
  }

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
    cmsDefaultsVersion: DEFAULT_CMS_VERSION,
    seededAt: nowIso(),
  });
}

async function seedMissingCmsDefaults(kv, seeded) {
  if (Number(seeded?.cmsDefaultsVersion || 0) >= DEFAULT_CMS_VERSION) return;

  for (const defaults of DEFAULT_CMS_PAGES) {
    const existingId = await kv.getJson(keys.cmsPageSlug(slugify(defaults.slug)));
    if (existingId) continue;
    await saveCmsPage(
      { ...defaults, status: 'published' },
      { actor: { id: 'system', email: 'seed' }, skipSeed: true, action: 'seed_cms_page' }
    );
  }

  await kv.setJson(keys.metaSeeded, {
    ...(seeded || {}),
    products: Boolean(seeded?.products),
    cms: true,
    cmsDefaultsVersion: DEFAULT_CMS_VERSION,
    updatedAt: nowIso(),
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
  const accountCustomer = context.customerId ? await getCustomerById(context.customerId) : null;

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
        size: item.size || '',
        color: item.color || '',
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
  const customerEmail = accountCustomer?.email || parsed.customer.email;
  const customerName = parsed.customer.name || accountCustomer?.name || '';
  const customerPhone = parsed.customer.phone || accountCustomer?.phone || '';
  const emailHash = sha256(customerEmail);
  const shippingAddress = {
    name: parsed.shippingAddress?.name || customerName,
    line1: parsed.shippingAddress?.line1 || '',
    line2: parsed.shippingAddress?.line2 || '',
    postalCode: parsed.shippingAddress?.postalCode || '',
    city: parsed.shippingAddress?.city || '',
    region: parsed.shippingAddress?.region || '',
    country: parsed.shippingAddress?.country || parsed.customer.country || '',
    phone: parsed.shippingAddress?.phone || customerPhone,
  };
  const billingAddress = parsed.billingAddress
    ? {
        name: parsed.billingAddress.name || customerName,
        line1: parsed.billingAddress.line1 || '',
        line2: parsed.billingAddress.line2 || '',
        postalCode: parsed.billingAddress.postalCode || '',
        city: parsed.billingAddress.city || '',
        region: parsed.billingAddress.region || '',
        country: parsed.billingAddress.country || shippingAddress.country,
        phone: parsed.billingAddress.phone || customerPhone,
      }
    : shippingAddress;
  const marketingEmailConsent = Boolean(parsed.privacy.marketingEmailConsent || parsed.customer.marketingEmailConsent);
  const order = {
    id,
    publicOrderNumber,
    status: 'submitted',
    customerId: accountCustomer?.id || '',
    customer: {
      ...parsed.customer,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      emailHash,
    },
    shippingAddress,
    billingAddress,
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
    privacy: {
      privacyPolicyAccepted: Boolean(parsed.privacy.privacyPolicyAccepted),
      privacyPolicyVersion: parsed.privacy.privacyPolicyVersion,
      privacyPolicyAcceptedAt: parsed.privacy.privacyPolicyAccepted ? createdAt : '',
      marketingEmailConsent,
      marketingEmailConsentedAt: marketingEmailConsent ? createdAt : '',
      dataSubjectRightsAvailable: true,
      lawfulBasisOrderProcessing: 'contract',
      lawfulBasisMarketing: 'consent',
    },
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
  if (accountCustomer?.id) {
    await kv.zadd(keys.orderIndexCustomer(accountCustomer.id), scoreFromDate(createdAt), id);
  }
  if (parsed.idempotencyKey) {
    await kv.setJson(keys.orderIdempotency(parsed.idempotencyKey), id, { ex: 60 * 60 * 24 });
  }

  if (accountCustomer?.id && parsed.privacy.privacyPolicyAccepted) {
    await recordCustomerConsent({
      customer: accountCustomer,
      type: 'privacy_policy',
      granted: true,
      policyVersion: parsed.privacy.privacyPolicyVersion,
      source: 'checkout',
      context,
    });
  }
  if (accountCustomer?.id && marketingEmailConsent && !accountCustomer.dataProtectionFlags?.marketingEmailConsent) {
    await updateCustomerProfile(accountCustomer.id, { marketingEmailConsent: true }, context);
  } else if (accountCustomer?.id && marketingEmailConsent) {
    await recordCustomerConsent({
      customer: accountCustomer,
      type: 'marketing_email',
      granted: true,
      policyVersion: parsed.privacy.privacyPolicyVersion,
      source: 'checkout',
      context,
    });
  }
  if (accountCustomer?.id && parsed.privacy.saveAddressToAccount) {
    await saveCustomerAddressFromOrder(accountCustomer.id, shippingAddress, context);
  }

  await writeAuditEvent({
    actor: { id: accountCustomer?.id || 'customer', email: customerEmail },
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

export async function getCmsPageBySlug(slug) {
  await ensureSeeded();
  const kv = getKV();
  const id = await kv.getJson(keys.cmsPageSlug(slug));
  if (!id) return null;
  return kv.getJson(keys.cmsPage(id));
}

export async function seedDefaultCmsPages(actor) {
  await ensureSeeded();
  const results = [];
  for (const defaults of DEFAULT_CMS_PAGES) {
    const existing = await getCmsPageBySlug(defaults.slug);
    const page = await saveCmsPage(
      { ...(existing ? { id: existing.id } : {}), ...defaults, status: 'published' },
      { actor, action: existing ? 'cms_update' : 'cms_create', skipSeed: true }
    );
    results.push(page);
  }
  return results;
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
    customerAuth: getCustomerAuthReadiness(),
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
