import { randomUUID } from 'crypto';
import { getCloudinaryReadiness, uploadProductImageToCloudinary } from './cloudinary.js';
import { keys } from './keys.js';
import { getKV } from './kv.js';

function nowIso() {
  return new Date().toISOString();
}

function scoreFromDate(value) {
  return Date.parse(value || nowIso());
}

export function getMediaReadiness() {
  return getCloudinaryReadiness();
}

export function getMediaUploadLimitBytes() {
  return Math.floor(getMediaReadiness().maxUploadMb * 1024 * 1024);
}

function normalizeMediaAsset(uploaded, metadata = {}) {
  const createdAt = nowIso();
  const productId = String(metadata.productId || '').trim();
  return {
    id: `media_${randomUUID()}`,
    provider: uploaded.provider,
    status: productId ? 'attached' : 'uploaded',
    productId,
    productName: String(metadata.productName || '').trim(),
    productSlug: String(metadata.productSlug || '').trim(),
    secureUrl: uploaded.secureUrl || uploaded.url,
    url: uploaded.secureUrl || uploaded.url,
    publicId: uploaded.publicId || '',
    resourceType: uploaded.resourceType || 'image',
    format: uploaded.format || '',
    width: Number(uploaded.width || 0),
    height: Number(uploaded.height || 0),
    bytes: Number(uploaded.bytes || 0),
    originalFilename: uploaded.originalFilename || '',
    uploadedBy: {
      id: metadata.actorId || '',
      email: metadata.actorEmail || '',
    },
    createdAt,
    updatedAt: createdAt,
  };
}

async function saveMediaAsset(asset) {
  const kv = getKV();
  await kv.setJson(keys.mediaAsset(asset.id), asset);
  await kv.zadd(keys.mediaAssetIndexCreated, scoreFromDate(asset.createdAt), asset.id);
  await kv.zadd(keys.mediaAssetIndexStatus(asset.status), scoreFromDate(asset.createdAt), asset.id);
  if (asset.productId) {
    await kv.zadd(keys.mediaAssetIndexProduct(asset.productId), scoreFromDate(asset.createdAt), asset.id);
  }
  return asset;
}

export async function getMediaAssetById(id) {
  if (!id) return null;
  return getKV().getJson(keys.mediaAsset(id));
}

export async function attachMediaAssetToProduct(assetId, product, actor = {}) {
  const existing = await getMediaAssetById(assetId);
  if (!existing) return null;

  const now = nowIso();
  const previousStatus = existing.status;
  const previousProductId = existing.productId;
  const next = {
    ...existing,
    status: 'attached',
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    attachedBy: {
      id: actor?.id || '',
      email: actor?.email || '',
    },
    updatedAt: now,
  };

  const kv = getKV();
  await kv.setJson(keys.mediaAsset(next.id), next);
  if (previousStatus !== next.status) {
    await kv.zrem(keys.mediaAssetIndexStatus(previousStatus), next.id);
    await kv.zadd(keys.mediaAssetIndexStatus(next.status), scoreFromDate(next.createdAt), next.id);
  }
  if (previousProductId && previousProductId !== next.productId) {
    await kv.zrem(keys.mediaAssetIndexProduct(previousProductId), next.id);
  }
  await kv.zadd(keys.mediaAssetIndexProduct(next.productId), scoreFromDate(next.createdAt), next.id);
  return next;
}

export async function uploadProductImage(file, metadata = {}) {
  const uploaded = await uploadProductImageToCloudinary(file, metadata);
  return saveMediaAsset(normalizeMediaAsset(uploaded, metadata));
}
