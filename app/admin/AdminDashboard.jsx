'use client';

import { useMemo, useState } from 'react';
import { applyProductImageFallback, productImageSrc } from '@/lib/productImages';

const tabs = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'cms', label: 'CMS' },
  { id: 'security', label: 'Security' },
];

const orderStatuses = [
  'submitted',
  'awaiting_confirmation',
  'confirmed',
  'awaiting_payment',
  'paid',
  'packed',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
];

const productStatuses = ['draft', 'published', 'archived'];

function emptyProduct() {
  return {
    name: '',
    slug: '',
    status: 'draft',
    category: 'Decorative',
    tag: '',
    priceAmount: 0,
    currency: '€',
    image: '',
    description: '',
    details: '',
    inventoryMode: 'one_of_one',
    stockQty: 1,
    inStock: true,
  };
}

function jsonBlocks(value) {
  return JSON.stringify(value || [], null, 2);
}

export default function AdminDashboard({ admin, csrf, initialData }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [summary, setSummary] = useState(initialData.summary);
  const [products, setProducts] = useState(initialData.products);
  const [orders, setOrders] = useState(initialData.orders);
  const [pages, setPages] = useState(initialData.pages);
  const [riskEvents, setRiskEvents] = useState(initialData.riskEvents);
  const [auditEvents, setAuditEvents] = useState(initialData.auditEvents);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'new');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || 'new');
  const [draftProduct, setDraftProduct] = useState(emptyProduct());
  const [draftPage, setDraftPage] = useState({
    title: '',
    slug: '',
    type: 'custom',
    status: 'draft',
    blocks: '[]',
  });
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const selectedProduct = selectedProductId === 'new' ? draftProduct : products.find((item) => item.id === selectedProductId);
  const selectedOrder = orders.find((item) => item.id === selectedOrderId);
  const selectedPage = selectedPageId === 'new' ? draftPage : pages.find((item) => item.id === selectedPageId);

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': csrf } : {}),
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Request failed.');
    return body;
  }

  async function refreshSecurity() {
    const data = await api('/api/admin/security');
    setSummary(data.summary);
    setRiskEvents(data.riskEvents);
    setAuditEvents(data.auditEvents);
  }

  async function refreshOrders() {
    const data = await api('/api/admin/orders');
    setOrders(data.orders);
    if (!selectedOrderId && data.orders[0]) setSelectedOrderId(data.orders[0].id);
  }

  async function refreshProducts() {
    const data = await api('/api/admin/products');
    setProducts(data.products);
  }

  async function refreshPages() {
    const data = await api('/api/admin/cms/pages');
    setPages(data.pages);
  }

  async function logout() {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      headers: { 'x-csrf-token': csrf },
    });
    window.location.href = '/admin/login';
  }

  async function saveProduct() {
    try {
      const payload = {
        ...selectedProduct,
        details:
          typeof selectedProduct.details === 'string'
            ? selectedProduct.details
            : (selectedProduct.details || []).join('\n'),
        priceAmount: Number(selectedProduct.priceAmount || selectedProduct.price || 0),
        stockQty: Number(selectedProduct.stockQty || 0),
      };
      const path = selectedProductId === 'new' ? '/api/admin/products' : `/api/admin/products/${selectedProduct.id}`;
      const method = selectedProductId === 'new' ? 'POST' : 'PATCH';
      const data = await api(path, { method, body: JSON.stringify(payload) });
      await refreshProducts();
      setSelectedProductId(data.product.id);
      setMessage('Product saved.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function archiveSelectedProduct() {
    if (!selectedProduct?.id) return;
    try {
      await api(`/api/admin/products/${selectedProduct.id}`, { method: 'DELETE' });
      await refreshProducts();
      setMessage('Product archived.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function uploadSelectedProductImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedProduct) return;

    setUploadingImage(true);
    setMessage('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('productName', selectedProduct.name || '');
      form.append('productId', selectedProduct.id || '');
      form.append('productSlug', selectedProduct.slug || '');

      const response = await fetch('/api/admin/assets/upload', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: form,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Image upload failed.');

      updateSelectedProduct('image', body.asset.secureUrl || body.asset.url);
      updateSelectedProduct('imageAssetId', body.asset.id || '');
      setMessage('Image uploaded to Cloudinary. Save product to keep it.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveOrder() {
    if (!selectedOrder) return;
    try {
      const data = await api(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selectedOrder.status,
          shippingQuote: Number(selectedOrder.shippingQuote || 0),
          paymentMethod: selectedOrder.paymentMethod || '',
          internalNotes: selectedOrder.internalNotes || '',
          customerNotes: selectedOrder.customerNotes || '',
        }),
      });
      setOrders((current) => current.map((order) => (order.id === data.order.id ? data.order : order)));
      await refreshSecurity();
      setMessage('Order updated.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function savePage() {
    try {
      const payload = selectedPageId === 'new' ? draftPage : selectedPage;
      const path = selectedPageId === 'new' ? '/api/admin/cms/pages' : `/api/admin/cms/pages/${payload.id}`;
      const method = selectedPageId === 'new' ? 'POST' : 'PATCH';
      const data = await api(path, { method, body: JSON.stringify(payload) });
      await refreshPages();
      setSelectedPageId(data.page.id);
      setMessage('CMS page saved.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function updateSelectedProduct(field, value) {
    if (selectedProductId === 'new') {
      setDraftProduct((current) => ({ ...current, [field]: value }));
      return;
    }
    setProducts((current) =>
      current.map((product) => (product.id === selectedProductId ? { ...product, [field]: value } : product))
    );
  }

  function updateSelectedOrder(field, value) {
    setOrders((current) =>
      current.map((order) => (order.id === selectedOrderId ? { ...order, [field]: value } : order))
    );
  }

  function updateSelectedPage(field, value) {
    if (selectedPageId === 'new') {
      setDraftPage((current) => ({ ...current, [field]: value }));
      return;
    }
    setPages((current) => current.map((page) => (page.id === selectedPageId ? { ...page, [field]: value } : page)));
  }

  const visibleAuditEvents = useMemo(() => auditEvents.slice(0, 20), [auditEvents]);

  return (
    <div className="min-h-screen bg-cream-100 text-charcoal">
      <header className="border-b border-charcoal/10 bg-cream-200 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-500">
              Wild Cat Ceramic
            </p>
            <h1 className="font-serif text-3xl font-light">Backoffice</h1>
            <p className="mt-1 font-sans text-sm text-charcoal/60">
              {admin.email} · {summary.storage.provider}
              {!summary.storage.productionReady ? ' · local development fallback' : ''}
            </p>
          </div>
          <button
            onClick={logout}
            className="self-start border border-charcoal/30 px-5 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-charcoal hover:text-cream-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric label="Open orders" value={summary.openOrderCount} />
          <Metric label="Orders" value={summary.orderCount} />
          <Metric label="Products" value={summary.productCount} />
          <Metric label="Published" value={summary.publishedProductCount} />
          <Metric label="Low stock" value={summary.lowStockCount} />
        </section>

        <nav className="mb-7 flex flex-wrap gap-2 border-b border-charcoal/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] ${
                activeTab === tab.id ? 'bg-charcoal text-cream-100' : 'border border-charcoal/20 text-charcoal/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {message && (
          <div className="mb-5 border border-charcoal/15 bg-cream-200 px-4 py-3 font-sans text-sm text-charcoal/70">
            {message}
          </div>
        )}

        {activeTab === 'orders' && (
          <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Panel title="Orders">
              <div className="flex max-h-[680px] flex-col gap-2 overflow-auto">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`border p-4 text-left font-sans text-sm ${
                      selectedOrderId === order.id ? 'border-charcoal bg-cream-200' : 'border-charcoal/10'
                    }`}
                  >
                    <span className="block font-semibold">{order.publicOrderNumber}</span>
                    <span className="block text-charcoal/55">{order.customer.name}</span>
                    <span className="block text-xs uppercase tracking-[0.08em] text-terracotta">{order.status}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title={selectedOrder ? selectedOrder.publicOrderNumber : 'Order detail'}>
              {selectedOrder ? (
                <div className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Customer" value={selectedOrder.customer.name} readOnly />
                    <Field label="Email" value={selectedOrder.customer.email} readOnly />
                    <Field label="Phone" value={selectedOrder.customer.phone || ''} readOnly />
                    <Field label="Country" value={selectedOrder.customer.country || ''} readOnly />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Select
                      label="Status"
                      value={selectedOrder.status}
                      options={orderStatuses}
                      onChange={(value) => updateSelectedOrder('status', value)}
                    />
                    <Field
                      label="Shipping quote"
                      type="number"
                      value={selectedOrder.shippingQuote || 0}
                      onChange={(value) => updateSelectedOrder('shippingQuote', value)}
                    />
                    <Field
                      label="Payment method"
                      value={selectedOrder.paymentMethod || ''}
                      onChange={(value) => updateSelectedOrder('paymentMethod', value)}
                    />
                  </div>
                  <div className="border border-charcoal/10">
                    {selectedOrder.items.map((item) => (
                      <div key={item.productId} className="flex justify-between border-b border-charcoal/10 p-3 font-sans text-sm">
                        <span>{item.productSnapshot.name} × {item.qty}</span>
                        <span>{item.currency}{item.lineTotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-3 font-sans font-semibold">
                      <span>Total</span>
                      <span>{selectedOrder.items[0]?.currency || '€'}{Number(selectedOrder.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <Textarea
                    label="Customer-facing notes"
                    value={selectedOrder.customerNotes || ''}
                    onChange={(value) => updateSelectedOrder('customerNotes', value)}
                  />
                  <Textarea
                    label="Internal notes"
                    value={selectedOrder.internalNotes || ''}
                    onChange={(value) => updateSelectedOrder('internalNotes', value)}
                  />
                  <div>
                    <h3 className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/50">
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      {(selectedOrder.timeline || []).map((entry, index) => (
                        <div key={`${entry.createdAt}-${index}`} className="border-l border-charcoal/20 pl-3 font-sans text-sm text-charcoal/65">
                          <span className="font-semibold text-charcoal">{entry.status}</span> · {entry.note}
                          <span className="block text-xs">{entry.createdAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <PrimaryButton onClick={saveOrder}>Save order</PrimaryButton>
                </div>
              ) : (
                <p className="font-sans text-sm text-charcoal/55">No orders yet.</p>
              )}
            </Panel>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Panel title="Catalogue">
              <button
                onClick={() => setSelectedProductId('new')}
                className="mb-3 w-full border border-charcoal px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em]"
              >
                New product
              </button>
              <div className="flex max-h-[680px] flex-col gap-2 overflow-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`border p-3 text-left font-sans text-sm ${
                      selectedProductId === product.id ? 'border-charcoal bg-cream-200' : 'border-charcoal/10'
                    }`}
                  >
                    <span className="block font-semibold">{product.name}</span>
                    <span className="text-xs uppercase tracking-[0.08em] text-charcoal/45">{product.status} · stock {product.stockQty}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title={selectedProductId === 'new' ? 'New product' : selectedProduct?.name || 'Product'}>
              {selectedProduct && (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name" value={selectedProduct.name} onChange={(value) => updateSelectedProduct('name', value)} />
                    <Field label="Slug" value={selectedProduct.slug || ''} onChange={(value) => updateSelectedProduct('slug', value)} />
                    <Select label="Status" value={selectedProduct.status} options={productStatuses} onChange={(value) => updateSelectedProduct('status', value)} />
                    <Field label="Category" value={selectedProduct.category || ''} onChange={(value) => updateSelectedProduct('category', value)} />
                    <Field label="Price" type="number" value={selectedProduct.priceAmount || selectedProduct.price || 0} onChange={(value) => updateSelectedProduct('priceAmount', value)} />
                    <Field label="Currency" value={selectedProduct.currency || '€'} onChange={(value) => updateSelectedProduct('currency', value)} />
                    <Field label="Tag" value={selectedProduct.tag || ''} onChange={(value) => updateSelectedProduct('tag', value)} />
                    <Field label="Stock" type="number" value={selectedProduct.stockQty || 0} onChange={(value) => updateSelectedProduct('stockQty', value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="aspect-square overflow-hidden border border-charcoal/10 bg-cream-200">
                      <img
                        src={productImageSrc(selectedProduct.image)}
                        alt={selectedProduct.name || 'Product image'}
                        onError={applyProductImageFallback}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="grid content-start gap-3">
                      <Field label="Image URL" value={selectedProduct.image || ''} onChange={(value) => updateSelectedProduct('image', value)} />
                      <label className="block">
                        <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
                          Upload to Cloudinary
                        </span>
                        <input
                          type="file"
                          accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                          disabled={uploadingImage}
                          onChange={uploadSelectedProductImage}
                          className="w-full border border-charcoal/15 bg-transparent px-3 py-2 font-sans text-sm file:mr-3 file:border-0 file:bg-charcoal file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] file:text-cream-100 disabled:opacity-50"
                        />
                      </label>
                      <p className="font-sans text-xs text-charcoal/50">
                        {uploadingImage ? 'Uploading...' : 'Uploaded images are stored in Cloudinary; KV stores only the secure URL.'}
                      </p>
                    </div>
                  </div>
                  <Textarea label="Description" value={selectedProduct.description || ''} onChange={(value) => updateSelectedProduct('description', value)} />
                  <Textarea
                    label="Details, one per line"
                    value={Array.isArray(selectedProduct.details) ? selectedProduct.details.join('\n') : selectedProduct.details || ''}
                    onChange={(value) => updateSelectedProduct('details', value)}
                  />
                  <div className="flex flex-wrap gap-3">
                    <PrimaryButton onClick={saveProduct}>Save product</PrimaryButton>
                    {selectedProductId !== 'new' && (
                      <button onClick={archiveSelectedProduct} className="border border-terracotta px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-terracotta">
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          </section>
        )}

        {activeTab === 'cms' && (
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Panel title="Content records">
              <button
                onClick={() => setSelectedPageId('new')}
                className="mb-3 w-full border border-charcoal px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em]"
              >
                New content
              </button>
              <div className="flex flex-col gap-2">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`border p-3 text-left font-sans text-sm ${
                      selectedPageId === page.id ? 'border-charcoal bg-cream-200' : 'border-charcoal/10'
                    }`}
                  >
                    <span className="block font-semibold">{page.title}</span>
                    <span className="text-xs uppercase tracking-[0.08em] text-charcoal/45">{page.type} · {page.status}</span>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title={selectedPage?.title || 'Content'}>
              {selectedPage && (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title" value={selectedPage.title || ''} onChange={(value) => updateSelectedPage('title', value)} />
                    <Field label="Slug" value={selectedPage.slug || ''} onChange={(value) => updateSelectedPage('slug', value)} />
                    <Select label="Status" value={selectedPage.status || 'draft'} options={['draft', 'published', 'archived']} onChange={(value) => updateSelectedPage('status', value)} />
                    <Select label="Type" value={selectedPage.type || 'custom'} options={['homepage_section', 'about', 'faq', 'terms', 'contact', 'custom']} onChange={(value) => updateSelectedPage('type', value)} />
                  </div>
                  <Textarea
                    label="Blocks JSON"
                    value={typeof selectedPage.blocks === 'string' ? selectedPage.blocks : jsonBlocks(selectedPage.blocks)}
                    onChange={(value) => updateSelectedPage('blocks', value)}
                    rows={12}
                  />
                  <PrimaryButton onClick={savePage}>Save content</PrimaryButton>
                </div>
              )}
            </Panel>
          </section>
        )}

        {activeTab === 'security' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Readiness checks">
              <div className="space-y-3 font-sans text-sm">
                <ReadinessRow label="Storage" ready={summary.storage.productionReady} value={summary.storage.provider} />
                <ReadinessRow label="Upstash configured" ready={summary.storage.upstashConfigured} value={summary.storage.upstashConfigured ? 'yes' : 'no'} />
                <ReadinessRow label="Auth configured" ready={summary.auth?.productionReady} value={summary.auth?.productionReady ? 'yes' : 'no'} />
                <ReadinessRow label="Secure admin cookies" ready={summary.auth?.secureCookie} value={summary.auth?.secureCookie ? 'enabled' : 'disabled'} />
                <ReadinessRow label="Media uploads" ready={summary.media?.productionReady} value={summary.media?.provider || 'url-only'} />
                <ReadinessRow label="Image fallback" ready={Boolean(summary.media?.fallbackImage)} value={summary.media?.fallbackImage || '/images/pannel.png'} />
                <a
                  href="/admin/configurator"
                  className="inline-block border border-charcoal px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] hover:bg-charcoal hover:text-cream-100"
                >
                  Open configurator
                </a>
                {[...(summary.storage.warnings || []), ...(summary.auth?.warnings || []), ...(summary.media?.warnings || [])].map((warning) => (
                  <div key={warning} className="border border-terracotta/40 bg-cream-200 p-3 text-terracotta">
                    {warning}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Risk events">
              <button onClick={refreshSecurity} className="mb-4 border border-charcoal px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em]">
                Refresh
              </button>
              <EventList events={riskEvents} kind="risk" />
            </Panel>
            <Panel title="Audit trail">
              <EventList events={visibleAuditEvents} kind="audit" />
            </Panel>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border border-charcoal/10 bg-cream-200 p-4">
      <div className="font-serif text-3xl font-light">{value}</div>
      <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal/45">{label}</div>
    </div>
  );
}

function ReadinessRow({ label, ready, value }) {
  return (
    <div className="flex items-center justify-between border border-charcoal/10 p-3">
      <span className="text-charcoal/65">{label}</span>
      <span className={ready ? 'font-semibold text-[#4A7C59]' : 'font-semibold text-terracotta'}>
        {value}
      </span>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="border border-charcoal/10 bg-cream-100 p-5">
      <h2 className="mb-4 font-serif text-2xl font-light">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', readOnly = false }) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full border border-charcoal/15 bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-charcoal"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">{label}</span>
      <select
        value={value || options[0]}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-charcoal/15 bg-cream-100 px-3 py-2 font-sans text-sm outline-none focus:border-charcoal"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange, rows = 5 }) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">{label}</span>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-charcoal/15 bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-charcoal"
      />
    </label>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-charcoal px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cream-100 hover:bg-terracotta"
    >
      {children}
    </button>
  );
}

function EventList({ events, kind }) {
  if (!events.length) return <p className="font-sans text-sm text-charcoal/55">No events recorded.</p>;
  return (
    <div className="max-h-[620px] space-y-3 overflow-auto">
      {events.map((event) => (
        <div key={event.id} className="border border-charcoal/10 p-3 font-sans text-sm">
          <div className="flex justify-between gap-3">
            <span className="font-semibold">{kind === 'risk' ? event.type : event.action}</span>
            <span className="text-xs uppercase tracking-[0.08em] text-terracotta">
              {kind === 'risk' ? `${event.severity} · ${event.score}` : event.entityType}
            </span>
          </div>
          <p className="mt-1 text-charcoal/60">{kind === 'risk' ? event.subject : event.entityId}</p>
          <p className="mt-1 text-xs text-charcoal/40">{event.createdAt}</p>
        </div>
      ))}
    </div>
  );
}
