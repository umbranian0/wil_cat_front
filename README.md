# Wild Cat Ceramic — Next.js Website

A server-capable e-commerce website for Wild Cat Ceramic, built with Next.js 14 and Tailwind CSS.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production
```bash
npm run build
```

## Run with Docker

Build and run the production Next.js container locally:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To stop the container:

```bash
docker compose down
```

## Deploy to Vercel

### Option A: Connect GitHub repo
1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click "New Project"
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click "Deploy"

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel
```

## Backoffice POC

The admin backoffice is available at `/admin`. It includes product CMS, order management, CMS content records, audit events, and a security/fraud dashboard.

First-start configuration is available at `/admin/configurator`. Use it to generate or regenerate the admin environment values, then save them in Vercel and redeploy.

You can also generate values locally:

```bash
npm run env:generate -- --email=owner@example.com
```

For production or Vercel Preview deployments, configure these environment variables:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=change-this-long-password
ADMIN_SESSION_SECRET=change-this-random-32-byte-secret
```

`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` should come from the Upstash KV/Redis integration in Vercel Marketplace. Without those variables, the app uses `.data/backoffice-kv.json` as a local development fallback only.

For local `next start` smoke tests over plain HTTP, set:

```bash
ADMIN_COOKIE_SECURE=false
```

Do not use `ADMIN_COOKIE_SECURE=false` on Vercel production.

## Project Structure

```
wildcat-ceramic/
├── app/                    # Pages (Next.js App Router)
│   ├── layout.js           # Root layout with nav, footer, cart
│   ├── page.js             # Home page
│   ├── globals.css         # Global styles + Tailwind
│   ├── shop/               # Shop page with category filters
│   ├── product/[slug]/     # Individual product pages
│   ├── about/              # About the studio
│   ├── contact/            # Contact form + WhatsApp/Email
│   └── faq/                # Frequently asked questions
├── components/             # Shared React components
│   ├── CartProvider.jsx    # Cart context (state + checkout logic)
│   ├── CartDrawer.jsx      # Slide-out cart with WhatsApp/Email checkout
│   ├── Navbar.jsx          # Top navigation
│   ├── Footer.jsx          # Site footer
│   ├── ProductCard.jsx     # Product grid card with quick-add
│   ├── Hero.jsx            # Homepage hero section
│   └── FeaturedBanner.jsx  # Featured product banner
├── data/
│   └── products.json       # Product catalog seed data
├── public/
│   └── images/             # Product photos
└── ...config files
```

## Configuration

### Products
Use `/admin` to manage products once the backoffice is configured. `data/products.json` remains seed data for the first local or Upstash-backed store initialization.

### Contact Info
Update these in `lib/config.js`:
- `WHATSAPP_NUMBER` — your WhatsApp number with country code (no + or spaces)
- `ORDER_EMAIL` — your order email address

### Future Enhancements
- [ ] Payment gateway integration (Stripe)
- [ ] Full shopping cart with checkout flow
- [ ] Instagram feed integration
- [ ] Product image galleries (multiple images per product)
- [ ] Stock management
