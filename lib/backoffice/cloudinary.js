const DEFAULT_UPLOAD_FOLDER = 'wild-cat/products';
const DEFAULT_MAX_UPLOAD_MB = 5;
const DEFAULT_FALLBACK_IMAGE = '/images/pannel.png';

const allowedImageTypes = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function env(name) {
  return process.env[name] || process.env[name.toLowerCase()];
}

function normalizeUploadPrefix(value) {
  return String(value || 'https://api.cloudinary.com').replace(/\/+$/, '');
}

export function getCloudinaryConfig() {
  const cloudName = env('CLOUDINARY_CLOUD_NAME');
  const apiKey = env('CLOUDINARY_API_KEY');
  const apiSecret = env('CLOUDINARY_API_SECRET');
  const uploadFolder = env('CLOUDINARY_UPLOAD_FOLDER') || DEFAULT_UPLOAD_FOLDER;
  const uploadPrefix = normalizeUploadPrefix(env('CLOUDINARY_UPLOAD_PREFIX'));
  const maxUploadMb = Number(env('CLOUDINARY_MAX_UPLOAD_MB') || DEFAULT_MAX_UPLOAD_MB);
  const fallbackImage = env('NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL') || DEFAULT_FALLBACK_IMAGE;

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadFolder,
    uploadPrefix,
    maxUploadMb: Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : DEFAULT_MAX_UPLOAD_MB,
    fallbackImage,
  };
}

export function getMediaReadiness() {
  const config = getCloudinaryConfig();
  const cloudNameConfigured = Boolean(config.cloudName);
  const apiKeyConfigured = Boolean(config.apiKey);
  const apiSecretConfigured = Boolean(config.apiSecret);
  const productionReady = cloudNameConfigured && apiKeyConfigured && apiSecretConfigured;
  const warnings = [];

  if (!cloudNameConfigured) warnings.push('Cloudinary cloud name is not configured.');
  if (!apiKeyConfigured) warnings.push('Cloudinary API key is not configured.');
  if (!apiSecretConfigured) warnings.push('Cloudinary API secret is not configured.');

  return {
    provider: productionReady ? 'cloudinary' : 'url-only',
    productionReady,
    cloudNameConfigured,
    apiKeyConfigured,
    apiSecretConfigured,
    uploadFolder: config.uploadFolder,
    maxUploadMb: config.maxUploadMb,
    fallbackImage: config.fallbackImage,
    warnings,
  };
}

function assertConfigured(config) {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    const error = new Error('Cloudinary is not configured.');
    error.status = 503;
    throw error;
  }
}

function sanitizeTag(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function assertImageFile(file, maxUploadMb) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    const error = new Error('Image file is required.');
    error.status = 400;
    throw error;
  }

  if (!allowedImageTypes.has(file.type)) {
    const error = new Error('Unsupported image type. Use JPG, PNG, WebP, AVIF, or GIF.');
    error.status = 415;
    throw error;
  }

  const maxBytes = Math.floor(maxUploadMb * 1024 * 1024);
  if (file.size > maxBytes) {
    const error = new Error(`Image is too large. Maximum upload size is ${maxUploadMb} MB.`);
    error.status = 413;
    throw error;
  }
}

export async function uploadProductImage(file, metadata = {}) {
  const config = getCloudinaryConfig();
  assertConfigured(config);
  assertImageFile(file, config.maxUploadMb);

  const form = new FormData();
  form.append('file', file, file.name || 'product-image');
  form.append('folder', config.uploadFolder);
  form.append('use_filename', 'true');
  form.append('unique_filename', 'true');
  form.append('overwrite', 'false');
  form.append('tags', ['wild-cat', 'product', sanitizeTag(metadata.productSlug)].filter(Boolean).join(','));
  form.append(
    'context',
    [
      ['source', 'wild-cat-backoffice'],
      ['product_name', metadata.productName || ''],
      ['uploaded_by', metadata.actorEmail || ''],
    ]
      .map(([key, value]) => `${key}=${String(value).replace(/[|=]/g, ' ').slice(0, 255)}`)
      .join('|')
  );

  const response = await fetch(`${config.uploadPrefix}/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`,
    },
    body: form,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error?.message || 'Cloudinary upload failed.');
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  if (!body.secure_url) {
    const error = new Error('Cloudinary upload response did not include a secure URL.');
    error.status = 502;
    throw error;
  }

  return {
    provider: 'cloudinary',
    url: body.secure_url,
    secureUrl: body.secure_url,
    publicId: body.public_id,
    resourceType: body.resource_type,
    format: body.format,
    width: body.width,
    height: body.height,
    bytes: body.bytes,
    originalFilename: body.original_filename,
    createdAt: body.created_at,
  };
}
