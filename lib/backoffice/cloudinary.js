import { v2 as cloudinary } from 'cloudinary';

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

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeUploadPrefix(value) {
  const trimmed = String(value || '').trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getCloudinaryConfig() {
  const cloudName = env('CLOUDINARY_CLOUD_NAME');
  const apiKey = env('CLOUDINARY_API_KEY');
  const apiSecret = env('CLOUDINARY_API_SECRET');
  const uploadFolder = env('CLOUDINARY_UPLOAD_FOLDER') || DEFAULT_UPLOAD_FOLDER;
  const uploadPrefix = normalizeUploadPrefix(env('CLOUDINARY_UPLOAD_PREFIX'));
  const maxUploadMb = positiveNumber(env('CLOUDINARY_MAX_UPLOAD_MB'), DEFAULT_MAX_UPLOAD_MB);
  const fallbackImage = env('NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL') || DEFAULT_FALLBACK_IMAGE;

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadFolder,
    uploadPrefix,
    maxUploadMb,
    fallbackImage,
  };
}

export function getCloudinaryReadiness() {
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
    throw httpError('Cloudinary is not configured.', 503);
  }
}

function configureCloudinary(config) {
  const options = {
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  };

  if (config.uploadPrefix) options.upload_prefix = config.uploadPrefix;
  cloudinary.config(options);
}

function sanitizeTag(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function cleanContextValue(value) {
  return String(value || '').replace(/[|=]/g, ' ').slice(0, 255);
}

function assertImageFile(file, maxUploadMb) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw httpError('Image file is required.', 400);
  }

  if (!allowedImageTypes.has(file.type)) {
    throw httpError('Unsupported image type. Use JPG, PNG, WebP, AVIF, or GIF.', 415);
  }

  const maxBytes = Math.floor(maxUploadMb * 1024 * 1024);
  if (file.size > maxBytes) {
    throw httpError(`Image is too large. Maximum upload size is ${maxUploadMb} MB.`, 413);
  }
}

function matchesImageSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === 'image/gif') {
    const signature = buffer.subarray(0, 6).toString('ascii');
    return signature === 'GIF87a' || signature === 'GIF89a';
  }

  if (mimeType === 'image/webp') {
    return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  if (mimeType === 'image/avif') {
    return buffer.subarray(4, 12).toString('ascii').startsWith('ftypavif');
  }

  return false;
}

async function imageBufferFromFile(file, maxUploadMb) {
  assertImageFile(file, maxUploadMb);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!matchesImageSignature(buffer, file.type)) {
    throw httpError('Image file content does not match its declared type.', 415);
  }

  return buffer;
}

function mapCloudinaryError(error) {
  const status = Number(error?.http_code || error?.statusCode || 502);
  return httpError(error?.message || 'Cloudinary upload failed.', status >= 500 ? 502 : status);
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(mapCloudinaryError(error));
        return;
      }
      resolve(result);
    });

    stream.end(buffer);
  });
}

function normalizeUploadResult(result) {
  if (!result?.secure_url) {
    throw httpError('Cloudinary upload response did not include a secure URL.', 502);
  }

  return {
    provider: 'cloudinary',
    url: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    originalFilename: result.original_filename,
    createdAt: result.created_at,
  };
}

export async function uploadProductImageToCloudinary(file, metadata = {}) {
  const config = getCloudinaryConfig();
  const buffer = await imageBufferFromFile(file, config.maxUploadMb);
  assertConfigured(config);
  configureCloudinary(config);

  const productTag = sanitizeTag(metadata.productSlug);
  const result = await uploadBuffer(buffer, {
    resource_type: 'image',
    folder: config.uploadFolder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    tags: ['wild-cat', 'product', productTag].filter(Boolean),
    context: {
      source: 'wild-cat-backoffice',
      product_name: cleanContextValue(metadata.productName),
      uploaded_by: cleanContextValue(metadata.actorEmail),
    },
  });

  return normalizeUploadResult(result);
}
