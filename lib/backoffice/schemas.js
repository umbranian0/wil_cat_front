import { z } from 'zod';
import { randomUUID } from 'crypto';
import {
  customerStatuses,
  orderStatuses,
  privacyRequestStatuses,
  privacyRequestTypes,
  productStatuses,
  slugify,
} from './keys';
import { assertAllowedProductImageUrl } from './mediaPolicy';

const nonEmptyString = z.string().trim().min(1);
export const CURRENT_PRIVACY_POLICY_VERSION = '2026-06-06';

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(productStatuses).default('published'),
  name: nonEmptyString,
  description: z.string().trim().default(''),
  details: z.array(z.string().trim()).default([]),
  category: nonEmptyString.default('Uncategorised'),
  tag: z.string().trim().default(''),
  tags: z.array(z.string().trim()).default([]),
  price: z.coerce.number().min(0),
  priceAmount: z.coerce.number().min(0),
  currency: z.string().trim().default('€'),
  image: z.string().trim().default(''),
  primaryImageAssetId: z.string().trim().default(''),
  images: z.array(z.object({
    url: z.string().trim(),
    alt: z.string().trim().default(''),
    provider: z.string().trim().optional(),
    publicId: z.string().trim().optional(),
    assetId: z.string().trim().optional(),
    width: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    format: z.string().trim().optional(),
    bytes: z.coerce.number().optional(),
  })).default([]),
  inventoryMode: z.enum(['one_of_one', 'limited', 'made_to_order']).default('one_of_one'),
  stockQty: z.coerce.number().int().min(0).default(1),
  reservedQty: z.coerce.number().int().min(0).default(0),
  soldQty: z.coerce.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  featuredRank: z.coerce.number().nullable().optional(),
  seoTitle: z.string().trim().default(''),
  seoDescription: z.string().trim().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.coerce.number().int().min(1).default(1),
});

export const productInputSchema = z.object({
  id: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  status: z.enum(productStatuses).optional(),
  name: nonEmptyString,
  description: z.string().trim().optional(),
  details: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  price: z.coerce.number().min(0).optional(),
  priceAmount: z.coerce.number().min(0).optional(),
  currency: z.string().trim().optional(),
  image: z.string().trim().optional(),
  imageAssetId: z.string().trim().optional(),
  primaryImageAssetId: z.string().trim().optional(),
  inventoryMode: z.enum(['one_of_one', 'limited', 'made_to_order']).optional(),
  stockQty: z.coerce.number().int().min(0).optional(),
  reservedQty: z.coerce.number().int().min(0).optional(),
  soldQty: z.coerce.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  featuredRank: z.coerce.number().nullable().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export const customerAddressInputSchema = z.object({
  id: z.string().trim().optional(),
  label: z.string().trim().max(80).optional().default('Default'),
  name: z.string().trim().max(120).optional().default(''),
  line1: z.string().trim().max(160).optional().default(''),
  line2: z.string().trim().max(160).optional().default(''),
  postalCode: z.string().trim().max(40).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  region: z.string().trim().max(100).optional().default(''),
  country: z.string().trim().max(80).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  isDefaultShipping: z.boolean().optional().default(false),
  isDefaultBilling: z.boolean().optional().default(false),
});

export const orderAddressSchema = z.object({
  name: z.string().trim().max(120).optional().default(''),
  line1: z.string().trim().max(160).optional().default(''),
  line2: z.string().trim().max(160).optional().default(''),
  postalCode: z.string().trim().max(40).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  region: z.string().trim().max(100).optional().default(''),
  country: z.string().trim().max(80).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
});

export const customerRegistrationSchema = z.object({
  name: nonEmptyString.max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(200),
  phone: z.string().trim().max(40).optional().default(''),
  privacyPolicyAccepted: z.literal(true),
  privacyPolicyVersion: z.string().trim().max(40).optional().default(CURRENT_PRIVACY_POLICY_VERSION),
  marketingEmailConsent: z.boolean().optional().default(false),
});

export const customerLoginSchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(1).max(200),
});

export const customerProfileUpdateSchema = z.object({
  name: nonEmptyString.max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  marketingEmailConsent: z.boolean().optional(),
});

export const customerStatusSchema = z.enum(customerStatuses);

export const customerPrivacyRequestInputSchema = z.object({
  type: z.enum(privacyRequestTypes),
  message: z.string().trim().max(1200).optional().default(''),
});

export const customerPrivacyRequestUpdateSchema = z.object({
  status: z.enum(privacyRequestStatuses).optional(),
  responseNotes: z.string().trim().max(2000).optional(),
});

export const orderSubmissionSchema = z.object({
  customer: z.object({
    name: nonEmptyString.max(120),
    email: z.string().trim().email().max(180),
    phone: z.string().trim().max(40).optional().default(''),
    country: z.string().trim().max(80).optional().default(''),
    message: z.string().trim().max(1000).optional().default(''),
    consentToContact: z.boolean().optional().default(true),
    marketingEmailConsent: z.boolean().optional().default(false),
  }),
  shippingAddress: orderAddressSchema.optional(),
  billingAddress: orderAddressSchema.optional(),
  privacy: z.object({
    privacyPolicyAccepted: z.boolean().optional().default(false),
    privacyPolicyVersion: z.string().trim().max(40).optional().default(CURRENT_PRIVACY_POLICY_VERSION),
    marketingEmailConsent: z.boolean().optional().default(false),
    saveAddressToAccount: z.boolean().optional().default(false),
  }).optional().default({}),
  items: z.array(z.object({
    id: nonEmptyString,
    qty: z.coerce.number().int().min(1).max(20),
  })).min(1).max(30),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  website: z.string().trim().max(120).optional().default(''),
  submittedAt: z.coerce.number().optional(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(orderStatuses).optional(),
  shippingQuote: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().trim().max(80).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
  customerNotes: z.string().trim().max(2000).optional(),
  shippingAddress: orderAddressSchema.optional(),
  billingAddress: orderAddressSchema.optional(),
});

export const cmsPageInputSchema = z.object({
  id: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  type: z.enum(['about', 'faq', 'terms', 'homepage_section', 'contact', 'navigation', 'account', 'privacy', 'custom']).default('custom'),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  title: nonEmptyString,
  blocks: z.union([z.array(z.unknown()), z.string()]).default([]),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export const contactSubmissionSchema = z.object({
  name: nonEmptyString.max(120),
  email: z.string().trim().email().max(180),
  message: nonEmptyString.max(2000),
  website: z.string().trim().max(120).optional().default(''),
  submittedAt: z.coerce.number().optional(),
});

export function normalizeProductInput(input, previous = null) {
  const parsed = productInputSchema.parse(input);
  const now = new Date().toISOString();
  const priceAmount = Number(parsed.priceAmount ?? parsed.price ?? previous?.priceAmount ?? previous?.price ?? 0);
  const details =
    typeof parsed.details === 'string'
      ? parsed.details.split('\n').map((detail) => detail.trim()).filter(Boolean)
      : parsed.details ?? previous?.details ?? [];
  const tag = parsed.tag ?? previous?.tag ?? '';
  const image = parsed.image ?? previous?.image ?? '';
  assertAllowedProductImageUrl(image);
  const primaryImageAssetId = parsed.imageAssetId || parsed.primaryImageAssetId || previous?.primaryImageAssetId || '';
  const product = {
    id: parsed.id || previous?.id || `prod_${randomUUID()}`,
    slug: slugify(parsed.slug || previous?.slug || parsed.name),
    status: parsed.status || previous?.status || 'published',
    name: parsed.name,
    description: parsed.description ?? previous?.description ?? '',
    details,
    category: parsed.category || previous?.category || 'Uncategorised',
    tag,
    tags: parsed.tags || previous?.tags || (tag ? [tag] : []),
    price: priceAmount,
    priceAmount,
    currency: parsed.currency || previous?.currency || '€',
    image,
    primaryImageAssetId,
    images: image ? [{ url: image, alt: parsed.name }] : [],
    inventoryMode: parsed.inventoryMode || previous?.inventoryMode || 'one_of_one',
    stockQty: Number(parsed.stockQty ?? previous?.stockQty ?? 1),
    reservedQty: Number(parsed.reservedQty ?? previous?.reservedQty ?? 0),
    soldQty: Number(parsed.soldQty ?? previous?.soldQty ?? 0),
    inStock: parsed.inStock ?? previous?.inStock ?? Number(parsed.stockQty ?? previous?.stockQty ?? 1) > 0,
    featuredRank: parsed.featuredRank ?? previous?.featuredRank ?? null,
    seoTitle: parsed.seoTitle ?? previous?.seoTitle ?? '',
    seoDescription: parsed.seoDescription ?? previous?.seoDescription ?? '',
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    version: Number(previous?.version || 0) + 1,
  };

  return productSchema.parse(product);
}

export function normalizeCmsInput(input, previous = null) {
  const parsed = cmsPageInputSchema.parse(input);
  let blocks = parsed.blocks;
  if (typeof blocks === 'string') {
    try {
      blocks = JSON.parse(blocks);
    } catch {
      blocks = [{ type: 'text', value: blocks }];
    }
  }
  const now = new Date().toISOString();
  return {
    id: parsed.id || previous?.id || `page_${randomUUID()}`,
    slug: slugify(parsed.slug || previous?.slug || parsed.title),
    type: parsed.type || previous?.type || 'custom',
    status: parsed.status || previous?.status || 'published',
    title: parsed.title,
    blocks: Array.isArray(blocks) ? blocks : [],
    seo: {
      title: parsed.seoTitle ?? previous?.seo?.title ?? '',
      description: parsed.seoDescription ?? previous?.seo?.description ?? '',
    },
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    version: Number(previous?.version || 0) + 1,
  };
}
