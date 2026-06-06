import { File } from 'node:buffer';
import { getMediaReadiness, uploadProductImage } from '../lib/backoffice/media.js';
import { isAllowedProductImageUrl } from '../lib/backoffice/mediaPolicy.js';

const envNames = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_UPLOAD_FOLDER',
  'CLOUDINARY_MAX_UPLOAD_MB',
  'NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL',
  'cloudinary_cloud_name',
  'cloudinary_api_key',
  'cloudinary_api_secret',
  'cloudinary_upload_folder',
  'cloudinary_max_upload_mb',
  'next_public_product_image_fallback_url',
];

const originalEnv = new Map(envNames.map((name) => [name, process.env[name]]));

function clearMediaEnv() {
  for (const name of envNames) delete process.env[name];
}

function restoreEnv() {
  clearMediaEnv();
  for (const [name, value] of originalEnv.entries()) {
    if (value !== undefined) process.env[name] = value;
  }
}

async function expectStatus(label, promise, status) {
  try {
    await promise;
  } catch (error) {
    if (error.status === status) return;
    throw new Error(`${label} failed with status ${error.status || 'unknown'} instead of ${status}.`);
  }
  throw new Error(`${label} unexpectedly succeeded.`);
}

async function main() {
  try {
    clearMediaEnv();
    const fallbackReadiness = getMediaReadiness();
    if (fallbackReadiness.productionReady) throw new Error('Media readiness should not be production-ready without credentials.');
    if (fallbackReadiness.provider !== 'url-only') throw new Error('Missing Cloudinary credentials should use url-only provider.');
    if (fallbackReadiness.fallbackImage !== '/images/pannel.png') throw new Error('Default fallback image changed unexpectedly.');

    process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
    process.env.CLOUDINARY_API_KEY = 'demo-key';
    process.env.CLOUDINARY_API_SECRET = 'demo-secret';

    const configuredReadiness = getMediaReadiness();
    if (!configuredReadiness.productionReady) throw new Error('Media readiness should be production-ready with the three required credentials.');
    if (configuredReadiness.uploadFolder !== 'wild-cat/products') throw new Error('Default upload folder changed unexpectedly.');
    if (!isAllowedProductImageUrl('/images/pannel.png')) throw new Error('Local fallback product image URL should be allowed.');
    if (!isAllowedProductImageUrl('https://res.cloudinary.com/demo-cloud/image/upload/v1/wild-cat/products/test.png')) {
      throw new Error('Configured Cloudinary product image URL should be allowed.');
    }
    if (isAllowedProductImageUrl('https://example.com/product.png')) throw new Error('Arbitrary third-party image URL should be rejected.');
    if (isAllowedProductImageUrl('https://res.cloudinary.com/other-cloud/image/upload/test.png')) {
      throw new Error('Cloudinary image URL from a different cloud should be rejected.');
    }

    await expectStatus(
      'Unsupported MIME type validation',
      uploadProductImage(new File(['plain text'], 'not-image.txt', { type: 'text/plain' }), {
        actorEmail: 'smoke@example.com',
      }),
      415
    );

    await expectStatus(
      'Image signature validation',
      uploadProductImage(new File(['not a png'], 'not-image.png', { type: 'image/png' }), {
        actorEmail: 'smoke@example.com',
      }),
      415
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          providerWithoutCredentials: fallbackReadiness.provider,
          providerWithCredentials: configuredReadiness.provider,
          uploadFolder: configuredReadiness.uploadFolder,
          fallbackImage: configuredReadiness.fallbackImage,
        },
        null,
        2
      )
    );
  } finally {
    restoreEnv();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
