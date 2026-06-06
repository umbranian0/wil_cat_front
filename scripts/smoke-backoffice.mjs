import { randomUUID } from 'crypto';

const baseUrl = process.env.BASE_URL || 'http://localhost:3100';
const adminEmail = process.env.ADMIN_EMAIL || 'owner@wildcat.local';
const adminPassword = process.env.ADMIN_PASSWORD || 'wildcat-admin-demo';

function endpoint(path) {
  return `${baseUrl}${path.endsWith('/') ? path : `${path}/`}`;
}

async function request(path, options = {}) {
  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${body.error || ''}`);
  }
  return { response, body };
}

async function expectFailure(path, options = {}, status) {
  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  if (response.status !== status) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`${options.method || 'GET'} ${path} returned ${response.status} instead of ${status}: ${body.error || ''}`);
  }
}

function cookieFrom(response) {
  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new Error('Login did not set an admin cookie.');
  return cookie.split(';')[0];
}

async function main() {
  const { body: catalog } = await request('/api/catalog/products');
  if (!catalog.products?.length) throw new Error('Catalog returned no products.');
  const product = catalog.products[0];

  const orderPayload = {
    customer: {
      name: 'Smoke Test Customer',
      email: `smoke+${Date.now()}@example.com`,
      phone: '+351000000000',
      country: 'PT',
      message: 'Automated smoke test.',
      consentToContact: true,
    },
    items: [{ id: product.id, qty: 1 }],
    idempotencyKey: `smoke-${randomUUID()}`,
    website: '',
    submittedAt: Date.now() - 3000,
  };
  const { body: orderResult } = await request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
  if (!orderResult.order?.id) throw new Error('Order was not created.');

  const login = await request('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const cookie = cookieFrom(login.response);
  const csrf = login.body.admin?.csrf;
  if (!csrf) throw new Error('Admin login did not return a CSRF token.');

  const authHeaders = {
    cookie,
    'x-csrf-token': csrf,
  };

  await expectFailure('/api/admin/assets/upload', { method: 'POST', body: new FormData() }, 401);
  await expectFailure('/api/admin/assets/upload', { method: 'POST', headers: { cookie }, body: new FormData() }, 403);

  const { body: adminProducts } = await request('/api/admin/products', {
    headers: { cookie },
  });
  if (!adminProducts.products?.length) throw new Error('Admin product list returned no products.');

  const testProductPayload = {
    name: `Smoke Draft ${Date.now()}`,
    slug: `smoke-draft-${Date.now()}`,
    status: 'draft',
    category: 'Smoke',
    priceAmount: 1,
    currency: '€',
    image: '/images/pannel.png',
    description: 'Smoke test draft product.',
    details: ['Created by smoke test'],
    inventoryMode: 'one_of_one',
    stockQty: 1,
  };
  const { body: createdProduct } = await request('/api/admin/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(testProductPayload),
  });
  if (createdProduct.product?.status !== 'draft') throw new Error('Draft product was not created.');

  const { body: updatedOrder } = await request(`/api/admin/orders/${orderResult.order.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'awaiting_confirmation',
      shippingQuote: 5,
      paymentMethod: 'manual',
      internalNotes: 'Automated smoke test update.',
    }),
  });
  if (updatedOrder.order?.status !== 'awaiting_confirmation') throw new Error('Order status was not updated.');

  const cmsPayload = {
    title: `Smoke CMS ${Date.now()}`,
    slug: `smoke-cms-${Date.now()}`,
    type: 'custom',
    status: 'draft',
    blocks: [{ type: 'text', value: 'Smoke test content.' }],
  };
  const { body: createdPage } = await request('/api/admin/cms/pages', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(cmsPayload),
  });
  if (!createdPage.page?.id) throw new Error('CMS page was not created.');

  const { body: security } = await request('/api/admin/security', {
    headers: { cookie },
  });
  if (!security.summary) throw new Error('Security dashboard returned no summary.');

  await request('/api/admin/auth/logout', {
    method: 'POST',
    headers: authHeaders,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        catalogProducts: catalog.products.length,
        order: orderResult.order.publicOrderNumber,
        createdDraftProduct: createdProduct.product.slug,
        createdCmsPage: createdPage.page.slug,
        storage: security.summary.storage.provider,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
