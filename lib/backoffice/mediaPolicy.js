function env(name) {
  return process.env[name] || process.env[name.toLowerCase()];
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function getConfiguredCloudinaryCloudName() {
  return String(env('CLOUDINARY_CLOUD_NAME') || '').trim();
}

export function isAllowedProductImageUrl(value) {
  const imageUrl = String(value || '').trim();
  if (!imageUrl) return true;
  if (imageUrl.startsWith('/images/') && !imageUrl.includes('..')) return true;

  let parsed;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;
  if (parsed.hostname !== 'res.cloudinary.com') return false;

  const cloudName = getConfiguredCloudinaryCloudName();
  if (!cloudName) return true;

  const [, pathCloudName] = parsed.pathname.split('/');
  return pathCloudName === cloudName;
}

export function assertAllowedProductImageUrl(value) {
  if (isAllowedProductImageUrl(value)) return;
  throw httpError('Product image URL must be a local /images/ asset or a Cloudinary HTTPS delivery URL for this site.', 400);
}
