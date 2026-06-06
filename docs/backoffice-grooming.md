# CMS and Order Backoffice Grooming

Date: 2026-06-06
Project: Wild Cat Ceramic Next.js storefront

## Objective

Create a maintainable backoffice for the full site, covering product CMS, content CMS, inventory status, order intake, manual order management, and security/fraud visibility. The proof of concept targets Upstash KV/Redis provisioned through Vercel Marketplace on the free plan, while preserving a clear migration path if the shop grows beyond KV's natural limits.

## Current System

The current site is now a server-capable Next.js 14 storefront.

- Product data is exposed through `lib/catalog.js`, which now delegates to the backoffice repository.
- `data/products.json` remains seed data for the local fallback store and first Upstash import.
- Cart state remains client-side, but persisted order creation accepts only product IDs, quantities, and customer fields, then recalculates server-side.
- Checkout now supports persisted web order requests, while WhatsApp/email remain manual fallback channels.
- Contact submissions are persisted as enquiries.
- `next.config.js` no longer uses `output: 'export'`, allowing route handlers, admin sessions, and server-only Upstash access.

## External Platform Assumptions

These assumptions were verified against current public documentation on 2026-06-06.

- Vercel's old first-party KV direction has moved toward Marketplace storage. Vercel documentation states that KV-style stores can be provisioned through Marketplace providers such as Upstash Redis.
- Upstash Redis currently lists a free tier with 256 MB data size and 500K monthly commands. This is acceptable for development, staging, and very small production usage, but not a guaranteed two-year production budget for a public ecommerce backoffice.
- Vercel WAF rate limiting is available on all plans, but Hobby currently has only one WAF rate-limiting rule per project. Application-level rate limits are still needed for order, contact, and admin flows.
- Vercel bot-management documentation recommends managed rulesets, WAF custom rules, rate limiting, challenge actions, DDoS protection, and observability for automated traffic.

Sources:

- Vercel Marketplace storage: https://vercel.com/docs/marketplace-storage
- Vercel Marketplace migration announcement: https://vercel.com/blog/introducing-the-vercel-marketplace
- Upstash Redis pricing: https://upstash.com/pricing/redis
- Vercel WAF rate limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Vercel Bot Management: https://vercel.com/docs/bot-management

## Product Scope

### Personas

- Studio owner: manages one-of-a-kind ceramic products, stock status, pricing, product copy, images, and order follow-up.
- Operations admin: confirms availability, quotes shipping, records payment state, and updates fulfilment.
- Customer support/admin: searches orders and enquiries to answer customer questions.
- Content editor: updates homepage content, FAQ, terms, about copy, and contact details without code edits.

### POC Scope

- Server-capable Next.js deployment on Vercel.
- Upstash KV/Redis production path using `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Local file fallback only for development when Upstash environment variables are absent.
- Minimal protected `/admin` backoffice with one owner role.
- KV-backed product CMS: list, create, edit, publish, archive, and stock status.
- Persisted order intake from the cart through `POST /api/orders`.
- Server-side order validation, price recalculation, immutable item snapshots, idempotency key, and rate limiting.
- Order backoffice with list, status update, shipping quote, payment method note, internal note, customer note, and timeline.
- Minimal CMS records for homepage/FAQ/terms style content, with public rendering to be expanded in the MVP.
- Security/fraud dashboard showing risk events, rate-limit events, suspicious order signals, and audit events.
- Structured validation with Zod at public and admin API boundaries.

### MVP

- Authenticated `/admin` backoffice.
- Product CMS for the existing catalogue fields plus draft/published/archived states.
- Inventory states suitable for handmade ceramics: available, reserved, sold, made-to-order, and archived.
- Persisted order request capture from the web cart.
- Manual order workflow: submitted, awaiting confirmation, confirmed, awaiting payment, paid, packed, shipped, completed, cancelled, refunded.
- Customer details attached to orders.
- Manual shipping quote and payment notes.
- Basic dashboard for open orders, stock status, and recent enquiries.
- CMS editing for FAQ, terms, about, contact details, and homepage featured product.
- Notification continuity through email and/or WhatsApp follow-up after order creation.
- Stronger production authentication provider or explicitly approved hardened first-party auth.
- Scheduled export of Upstash data.

### Post-MVP / Non-Goals For POC

- Automated card payments.
- Carrier label generation.
- Live shipping-rate calculation.
- Multi-vendor marketplace behaviour.
- Customer accounts.
- Advanced CRM, loyalty, discounts, or email marketing automation.
- Tax, accounting, refund, and financial reporting beyond basic operational summaries.

### After-MVP Customer Account Module

The after-MVP solution should introduce customer accounts without weakening the anonymous/manual order workflow that is useful for handmade ceramics.

Target scope:

- Customer registration and login.
- Explicit acceptance of terms, privacy policy, and order-processing consent before account creation.
- Versioned agreement records storing the accepted document version, timestamp, IP hash, and user-agent hash.
- Customer profile with minimal required PII: name, email, phone, default country, and optional shipping addresses.
- Orders related to a durable customer ID when a logged-in customer submits checkout.
- Anonymous order requests retained as a supported channel, with optional later conversion to a customer account.
- Customer order history page showing order status, item snapshots, shipping quote, payment status, and customer-facing notes.
- Role model split between `customer`, `viewer`, `fulfilment`, `admin`, and `owner`.
- Account security controls: email verification, password reset, session revocation, rate-limited login, and preferably a managed auth provider.
- Data-retention and deletion workflow for customer PII.

The customer account module should be planned as a separate iteration after the internal CMS/order backoffice is stable, because it expands the security boundary from trusted staff to public user accounts.

## Backlog

| Priority | Epic | Story | Acceptance criteria |
| --- | --- | --- | --- |
| P0 | Admin access | As a studio owner, I need secure admin login so only authorised staff can manage the site. | Admin routes require authentication; unauthenticated users are redirected; every admin API validates authorization server-side; logout is available. |
| P0 | Product CMS | As a studio owner, I need to create, edit, publish, archive, and delete products without editing JSON. | Required fields validate; slugs are unique; draft products are hidden publicly; published products appear in the storefront. |
| P0 | Stock control | As a studio owner, I need to mark products available, reserved, sold, or archived. | Sold products cannot be added to cart; status changes are timestamped and auditable; public pages reflect availability. |
| P0 | Order capture | As an operations admin, I need cart submissions saved as order records. | `POST /api/orders` creates an order with customer details, item snapshots, quantities, totals, and initial status. |
| P0 | Server-side validation | As an operations admin, I need server validation of prices and stock. | Browser-submitted totals are ignored; the server recalculates prices and availability from stored product data. |
| P0 | Order workflow | As an operations admin, I need to move orders through a manual fulfilment workflow. | Status updates are restricted to authorised users; order timeline records actor, timestamp, and status. |
| P0 | Manual confirmation | As an operations admin, I need shipping quotes, payment method notes, and internal notes. | Shipping can be added; total updates; historical product price snapshots remain unchanged. |
| P1 | Image management | As a studio owner, I need to upload or select product images. | Images are stored in object storage, not KV; invalid file types and oversized files are rejected; alt text is required. |
| P1 | Content CMS | As a content editor, I need to update FAQ, terms, about, contact, and homepage sections. | Page blocks validate; public content updates after publish; previous content is not overwritten until save. |
| P1 | Notifications | As a studio owner, I need new-order notifications. | Email or WhatsApp follow-up includes order ID and summary; notification failure does not delete the order. |
| P1 | Order search | As customer support, I need to search orders by order number, customer email, status, and date range. | Results are paginated; order detail shows customer, items, totals, notes, and timeline. |
| P2 | Enquiries | As customer support, I need contact form submissions stored. | Contact form creates enquiry records; enquiries can be marked open or resolved. |
| P2 | Audit trail | As the owner, I need critical admin changes logged. | Product, order, inventory, and CMS writes create append-only audit events. |
| P2 | Reporting | As the owner, I need basic operational reporting. | Dashboard shows order counts by status, completed order value, and sold/out-of-stock products for a selected date range. |
| P1 | Security/fraud dashboard | As the owner, I need visibility into abusive or suspicious activity. | Dashboard shows recent failed login attempts, rate-limit hits, suspicious orders, audit events, and storage/auth configuration warnings. |

## Architecture Decisions

1. Convert from static export to a server-capable Vercel Next.js deployment before implementing CMS or order persistence.
2. Use Upstash KV/Redis through Vercel Marketplace as an operational document store for a small handmade shop.
3. Do not expose KV credentials or direct KV write access to the browser.
4. Keep products, CMS pages, orders, inventory events, audit events, and rate-limit counters in separate key namespaces.
5. Store product and CMS documents as canonical JSON records and maintain secondary indexes manually.
6. Store immutable product snapshots on orders so later catalogue edits do not rewrite order history.
7. Use object storage for images, with KV storing only image metadata and public/private URLs.
8. Use optimistic concurrency through `version` fields for product and CMS edits.
9. Use append-only inventory and audit events for traceability.
10. Maintain export scripts and a Postgres migration path from the beginning.

## Data Model

### Product

- `id`
- `slug`
- `status`: `draft | published | archived`
- `name`
- `description`
- `details[]`
- `category`
- `tags[]`
- `priceAmount`
- `currency`
- `images[]`
- `inventoryMode`: `one_of_one | limited | made_to_order`
- `stockQty`
- `reservedQty`
- `soldQty`
- `featuredRank`
- `seoTitle`
- `seoDescription`
- `createdAt`
- `updatedAt`
- `version`

### CMSPage

- `id`
- `slug`
- `type`: `about | faq | terms | homepage_section | custom`
- `status`: `draft | published | archived`
- `title`
- `blocks[]`
- `seo`
- `createdAt`
- `updatedAt`
- `version`

### Order

- `id`
- `publicOrderNumber`
- `status`: `submitted | awaiting_confirmation | confirmed | awaiting_payment | paid | packed | shipped | completed | cancelled | refunded`
- `customer`: name, email, phone, country, consent flags
- `items[]`: productId, immutable product snapshot, quantity, unit price, currency
- `subtotal`
- `shippingQuote`
- `total`
- `channel`: `web | whatsapp | email | admin`
- `notes`
- `timeline[]`
- `createdAt`
- `updatedAt`
- `version`

### InventoryEvent

- `id`
- `productId`
- `type`: `reserve | release | sell | restock | adjust`
- `qty`
- `orderId`
- `reason`
- `createdBy`
- `createdAt`

### AuditEvent

- `id`
- `actorId`
- `action`
- `entityType`
- `entityId`
- `beforeHash`
- `afterHash`
- `metadata`
- `createdAt`

## KV Key Design

Use explicit versioned namespaces. Do not rely on global key scans for application queries.

```text
v1:product:{productId}
v1:product:slug:{slug}                         -> productId
v1:product:index:published                     -> sorted set of productIds
v1:product:index:category:{categorySlug}       -> sorted set of productIds
v1:product:index:featured                      -> sorted set, score = featuredRank

v1:cms:page:{pageId}
v1:cms:page:slug:{slug}                        -> pageId
v1:cms:index:{type}:{status}                   -> sorted set of pageIds

v1:order:{orderId}
v1:order:number:{publicOrderNumber}            -> orderId
v1:order:index:status:{status}                 -> sorted set, score = createdAt epoch
v1:order:index:created                         -> sorted set, score = createdAt epoch
v1:order:index:customer_email:{hash}           -> sorted set of orderIds

v1:inventory:event:{eventId}
v1:inventory:index:product:{productId}         -> sorted set, score = createdAt epoch

v1:audit:{eventId}
v1:audit:index:entity:{entityType}:{entityId}  -> sorted set, score = createdAt epoch

v1:id:order                                    -> incrementing counter
v1:id:audit                                    -> incrementing counter
v1:lock:order_submit:{idempotencyKey}
v1:rate:{scope}:{identifier}
```

## API Boundaries

### Public APIs

```text
GET  /api/catalog/products
GET  /api/catalog/products/:slug
POST /api/orders
GET  /api/orders/:publicOrderNumber
POST /api/contact
```

### Admin APIs

```text
GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id

GET    /api/admin/cms/pages
PATCH  /api/admin/cms/pages/:id

GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status
POST   /api/admin/orders/:id/notes

GET    /api/admin/audit
```

## Security Plan

### Authentication And Authorization

- Use an external authentication provider for admin identity rather than a shared password in code.
- Recommended low-friction options: Clerk, Auth.js with a trusted OAuth provider, or Vercel Authentication for protected deployments while building.
- Enforce role-based access: `owner`, `admin`, `fulfilment`, and `viewer`.
- Authorize every admin API request server-side.
- Use secure, HTTP-only cookies for session state if cookie authentication is selected.
- Add CSRF protection for cookie-authenticated mutations.

### Brute-Force And Abuse Protection

- Apply Vercel WAF rate limiting at the edge for the highest-risk path available on the selected plan.
- Add application-level KV-backed rate limits for:
  - login attempts
  - order submission
  - contact submission
  - admin mutations
  - order lookup by public order number
- Use fixed-window or sliding-window counters with TTLs.
- Add idempotency keys for order creation.
- Add honeypot and minimum-submit-time checks to public forms.
- Add bot challenge or CAPTCHA only when abuse is observed, because unnecessary friction can reduce legitimate orders.

### Data Protection

- Store secrets only in environment variables.
- Never expose KV tokens to client bundles.
- Validate all request payloads with strict schemas.
- Sanitize CMS rich text or use structured content blocks instead of arbitrary HTML.
- Store only order data required for fulfilment.
- Hash customer email for secondary indexes.
- Avoid storing sensitive payment details. Store payment status and method notes only.
- Define retention rules for stale enquiries, abandoned orders, and audit logs.

### Observability And Recovery

- Log failed order creation and notification failures.
- Export KV data to object storage on a schedule.
- Keep seed and export scripts in source control.
- Monitor command usage against the free-tier budget.
- Set an explicit upgrade decision point before free-tier command limits are exceeded.

### Dependency Security

- `npm audit --omit=dev` currently reports vulnerabilities in the Next.js dependency chain, with the automatic fix requiring a major Next.js upgrade.
- This must be resolved before launching authenticated admin or order-management functionality to production.
- Treat dependency upgrades as a dedicated hardening task because a major Next.js upgrade may require React, linting, build, and runtime verification.

## Scalability Position

KV is acceptable for the expected small-shop operating envelope:

- Tens to low hundreds of products.
- Low hundreds of CMS pages or content blocks.
- Thousands to low tens of thousands of orders over two years.
- Small trusted admin team.
- Manual fulfilment and manual payment confirmation.

KV becomes a poor fit if the system needs:

- Complex relational reporting.
- Customer accounts.
- Automated payments, refunds, subscriptions, or accounting.
- High write concurrency.
- Large backoffice search.
- Advanced inventory allocation.
- Formal tax or financial ledgers.

The planned exit path is a migration to Postgres, for example Neon or Supabase, while keeping public IDs and schema versions stable.

## Delivery Plan

## POC / MVP Gap Table

| Area | POC status | MVP requirement |
| --- | --- | --- |
| Storage | Upstash KV/Redis path implemented; local fallback for development only; Vercel fails closed without Upstash env vars. | Scheduled exports, recovery procedure, retention rules, and migration rehearsals. |
| Authentication | One owner role with signed HTTP-only cookie and CSRF for mutations. | Managed auth provider or hardened first-party auth with password hashing, MFA, revocation, and RBAC. |
| Product CMS | Create, edit, publish, draft, archive, and stock quantity fields. | Explicit available/reserved/sold workflow, image object storage, optimistic concurrency, and public CMS revalidation policy. |
| Order management | Persisted order requests, server-side price recalculation, snapshots, status updates, notes, shipping quote, and audit events. | Atomic idempotency/inventory workflow, inventory event ledger, cancellation/release logic, notifications, and richer search. |
| CMS content | Editable CMS records exist in backoffice. | Public FAQ/about/terms/homepage rendering from CMS records. |
| Security dashboard | Risk events, rate-limit events, readiness warnings, and audit trail visibility. | Alerts, thresholds, incident workflow, retention, export, and monitoring. |
| Customer accounts | Not included. | After-MVP customer account module with terms acceptance and order ownership. |

### Phase 1: Server Readiness

- Remove static export configuration.
- Keep the existing visual storefront stable.
- Introduce server-side catalogue access functions.
- Keep `data/products.json` as seed data.

### Phase 2: KV Foundation

- Add a server-only KV client.
- Add schema validation for products, CMS pages, orders, and enquiries.
- Add seed/import script from `data/products.json`.
- Add read APIs for catalogue data.
- Configure Vercel Marketplace Upstash KV/Redis with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Use the local file fallback only for development and smoke tests.

### Phase 3: Order Intake

- Replace WhatsApp/email-only checkout with persisted web order creation.
- Continue generating WhatsApp/email follow-up after the order exists.
- Store immutable item snapshots.
- Add idempotency and rate limiting.

### Phase 4: Admin Backoffice

- Add authenticated `/admin` route group.
- Implement product editing and stock status management.
- Implement order list, order detail, status updates, notes, and timeline.
- Implement CMS page editing.
- Add audit logging for all admin mutations.

### Phase 5: Operational Hardening

- Add scheduled exports.
- Add monitoring and alerts.
- Add stricter abuse controls if needed.
- Add basic dashboard metrics.
- Resolve production dependency audit findings before exposing authenticated admin routes.

### Phase 6: Migration Readiness

- Maintain export scripts.
- Document Postgres target schema.
- Track KV command volume and operational complexity.
- Trigger migration planning if order volume, reporting requirements, or concurrency exceeds the safe envelope.

## First Technical Iteration

The first implementation iteration should be deliberately small:

1. Convert the app from static export to server-capable Next.js.
2. Add `lib/catalog` read functions that can read from seed JSON first and later from KV without changing page components.
3. Refactor home, shop, and product detail routes to use the catalogue abstraction.
4. Add basic product schema normalization from the existing JSON shape to the future CMS shape.
5. Keep current cart and WhatsApp/email checkout unchanged for this iteration.
6. Run `npm run build` to confirm the visual storefront still builds.

This creates the technical seam required for CMS and order persistence without introducing authentication, KV writes, or admin UI before the data boundary is stable.

## Open Decisions

- Final admin authentication provider after POC. The POC uses a signed HTTP-only session cookie with one owner role.
- Object storage provider for product images.
- Email provider for order notifications.
- Whether public order lookup is required in MVP.
- Whether the Upstash/Vercel free plan is acceptable for the first production period or only for development/staging.
- Data-retention duration for customer PII.

## Vercel Environment Variables

Required for Upstash-backed Vercel deployments:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ADMIN_EMAIL
ADMIN_PASSWORD or ADMIN_PASSWORD_SHA256
ADMIN_SESSION_SECRET
```

Optional for local production-mode smoke tests only:

```text
ADMIN_COOKIE_SECURE=false
```
