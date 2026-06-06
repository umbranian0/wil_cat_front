# Media Architecture And Technical Improvement Sprints

## Objective

Use Cloudinary as the binary image store for product media while keeping Upstash KV focused on product, order, CMS, audit, and security metadata. The backoffice must upload images securely from authenticated admin sessions, store only Cloudinary metadata in KV, and keep the storefront resilient through one global fallback image.

## Current Architecture Decision

- Product image binary data lives in Cloudinary.
- Product records in KV store only the selected image URL and normalized image metadata.
- The admin upload route is a thin controller: authenticate, CSRF-check, rate-limit, delegate to the media service, return normalized asset metadata.
- The media service is a facade. It currently delegates to the Cloudinary provider, but routes and repositories do not depend on Cloudinary directly.
- The Cloudinary provider uses the official Node.js SDK, validates file size, MIME type, and file signature before upload, and maps provider errors into API-safe HTTP errors.
- The storefront uses `NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL` when a product has no image or when an image fails to load.

Cloudinary upload folders do not need to be created manually. `CLOUDINARY_UPLOAD_FOLDER=wild-cat/products` is passed with each upload, and Cloudinary creates the folder path when the first asset is stored.

## Required Production Variables

These three variables are required for uploads:

```bash
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

These variables are optional but recommended:

```bash
CLOUDINARY_UPLOAD_FOLDER=wild-cat/products
CLOUDINARY_MAX_UPLOAD_MB=5
NEXT_PUBLIC_PRODUCT_IMAGE_FALLBACK_URL=/images/pannel.png
```

Use a local/static fallback image, not a Cloudinary URL, so the fallback still works if Cloudinary is temporarily unavailable.

## Sprint 1: Media Boundary Hardening

Status: implemented in this iteration.

Acceptance criteria:

- Admin upload route imports the media facade, not the Cloudinary provider directly.
- Provider-specific logic stays inside `lib/backoffice/cloudinary.js`.
- Upload validation rejects unsupported MIME types and mismatched file signatures before network upload.
- Media readiness appears in the admin security dashboard and first-start configurator.
- Repeatable media smoke test exists and can run without real Cloudinary credentials.

## Sprint 2: Product Media Model

Goal: support richer product media without increasing KV storage pressure.

Backlog:

- Extend product schema from a single primary image to ordered media assets.
- Support gallery images with one primary image flag.
- Store Cloudinary `publicId`, dimensions, format, bytes, and secure URL per asset.
- Keep existing `product.image` as a backward-compatible primary image projection.
- Add admin controls for reordering, setting primary image, and removing media from a product.

Acceptance criteria:

- Existing products continue to render.
- New products can save one or more Cloudinary-backed images.
- KV records remain compact and contain no binary data.

## Sprint 3: Media Operations And Cleanup

Goal: prevent stale assets and make operational recovery easier.

Backlog:

- Add explicit admin action to delete or detach product images.
- For destructive delete, remove Cloudinary asset by `publicId` and write an audit event.
- For detach-only, preserve the Cloudinary asset but remove it from the product record.
- Add a read-only media audit panel showing recent uploaded assets.
- Add a script to detect KV records pointing to missing Cloudinary assets.

Acceptance criteria:

- Product image removal is audited.
- Failed provider deletion does not corrupt product metadata.
- Operators can identify stale or broken media references.

## Sprint 4: Security And Abuse Resistance

Goal: reduce media-related attack surface.

Backlog:

- Add per-admin and per-IP upload rate limits with separate risk events.
- Add image dimension limits if very large images become a problem.
- Consider direct browser-to-Cloudinary signed uploads only after designing a short-lived signature endpoint.
- Add Cloudinary upload preset restrictions if unsigned uploads are ever introduced. The current design uses signed server-side uploads only.
- Add monitoring for repeated upload validation failures.

Acceptance criteria:

- Upload failures are visible in risk/security events.
- Secrets are never exposed to client JavaScript.
- The app does not accept unsigned public uploads.

## Sprint 5: Delivery Optimization

Goal: improve performance while preserving the current simple URL model.

Backlog:

- Add Cloudinary transformation URLs for card, detail, and cart sizes.
- Keep original secure URL stored, derive transformed URLs at render time.
- Add responsive `srcset` or migrate carefully to `next/image` after configuring remote patterns and reviewing current Next.js image optimizer advisories.
- Measure page weight before and after transformations.

Acceptance criteria:

- Product grid images are delivered at appropriate dimensions.
- Detail images preserve quality.
- Fallback image still works without Cloudinary.

## Residual Risk

The current npm audit output reports advisories in Next.js and bundled PostCSS. npm currently proposes a breaking upgrade to Next 16. That framework upgrade should be handled as a separate sprint with compatibility testing, because it changes the platform surface beyond the media upload feature.
