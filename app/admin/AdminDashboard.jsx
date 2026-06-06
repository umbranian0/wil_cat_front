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

function parseBlocks(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return []; }
}

const HOMEPAGE_BLOCK_ORDER = ['hero', 'callout', 'collection_banner'];

function HomepageBlockEditor({ blocks, onChange }) {
  const hero = blocks.find((b) => b.type === 'hero') || { type: 'hero' };
  const callout = blocks.find((b) => b.type === 'callout') || { type: 'callout' };
  const banner = blocks.find((b) => b.type === 'collection_banner') || { type: 'collection_banner' };

  function update(blockType, field, value) {
    const existing = blocks.find((b) => b.type === blockType) || { type: blockType };
    const rest = blocks.filter((b) => b.type !== blockType);
    const next = [...rest, { ...existing, [field]: value }]
      .sort((a, b) => HOMEPAGE_BLOCK_ORDER.indexOf(a.type) - HOMEPAGE_BLOCK_ORDER.indexOf(b.type));
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-charcoal/10 p-4 flex flex-col gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">Hero section</span>
        <Field label="Eyebrow" value={hero.eyebrow || ''} onChange={(v) => update('hero', 'eyebrow', v)} />
        <Field label="Headline" value={hero.headline || ''} onChange={(v) => update('hero', 'headline', v)} />
        <Textarea label="Tagline" value={hero.tagline || ''} onChange={(v) => update('hero', 'tagline', v)} rows={2} />
        <Field label="Marquee text" value={hero.marquee || ''} onChange={(v) => update('hero', 'marquee', v)} />
      </div>
      <div className="border border-charcoal/10 p-4 flex flex-col gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">Studio callout</span>
        <Field label="Eyebrow" value={callout.eyebrow || ''} onChange={(v) => update('callout', 'eyebrow', v)} />
        <Field label="Heading" value={callout.heading || ''} onChange={(v) => update('callout', 'heading', v)} />
      </div>
      <div className="border border-charcoal/10 p-4 flex flex-col gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">Collection banner</span>
        <Field label="Eyebrow" value={banner.eyebrow || ''} onChange={(v) => update('collection_banner', 'eyebrow', v)} />
        <Field label="Heading" value={banner.heading || ''} onChange={(v) => update('collection_banner', 'heading', v)} />
      </div>
    </div>
  );
}

function FaqBlockEditor({ blocks, onChange }) {
  const items = blocks.filter((b) => b.type === 'faq_item');

  function updateItem(index, field, value) {
    onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addItem() {
    onChange([...items, { type: 'faq_item', question: '', answer: '' }]);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border border-charcoal/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">Question {i + 1}</span>
            <button onClick={() => removeItem(i)} className="font-sans text-[11px] text-terracotta hover:underline">Remove</button>
          </div>
          <Field label="Question" value={item.question || ''} onChange={(v) => updateItem(i, 'question', v)} />
          <Textarea label="Answer" value={item.answer || ''} onChange={(v) => updateItem(i, 'answer', v)} rows={3} />
        </div>
      ))}
      <button
        onClick={addItem}
        className="border border-dashed border-charcoal/25 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal/50 hover:border-charcoal hover:text-charcoal transition-colors"
      >
        + Add question
      </button>
    </div>
  );
}

function TermsBlockEditor({ blocks, onChange }) {
  const items = blocks.filter((b) => b.type === 'terms_section');

  function updateItem(index, field, value) {
    onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addItem() {
    onChange([...items, { type: 'terms_section', title: '', body: '' }]);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border border-charcoal/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">Section {i + 1}</span>
            <button onClick={() => removeItem(i)} className="font-sans text-[11px] text-terracotta hover:underline">Remove</button>
          </div>
          <Field label="Title" value={item.title || ''} onChange={(v) => updateItem(i, 'title', v)} />
          <Textarea label="Body" value={item.body || ''} onChange={(v) => updateItem(i, 'body', v)} rows={4} />
        </div>
      ))}
      <button
        onClick={addItem}
        className="border border-dashed border-charcoal/25 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal/50 hover:border-charcoal hover:text-charcoal transition-colors"
      >
        + Add section
      </button>
    </div>
  );
}

function AboutBlockEditor({ blocks, onChange }) {
  const header = blocks.find((b) => b.type === 'header') || { type: 'header' };
  const contentBlocks = blocks.filter((b) => b.type === 'paragraph' || b.type === 'section_heading');

  function updateHeader(field, value) {
    const rest = blocks.filter((b) => b.type !== 'header');
    onChange([{ ...header, [field]: value }, ...rest]);
  }

  function updateContent(index, field, value) {
    const newContent = contentBlocks.map((b, i) => i === index ? { ...b, [field]: value } : b);
    onChange([header, ...newContent]);
  }

  function addBlock(type) {
    onChange([header, ...contentBlocks, { type, text: '' }]);
  }

  function removeContent(index) {
    onChange([header, ...contentBlocks.filter((_, i) => i !== index)]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-charcoal/10 p-4 flex flex-col gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">Page header</span>
        <Field label="Eyebrow" value={header.eyebrow || ''} onChange={(v) => updateHeader('eyebrow', v)} />
        <Field label="Heading" value={header.heading || ''} onChange={(v) => updateHeader('heading', v)} />
        <Field label="Tagline" value={header.tagline || ''} onChange={(v) => updateHeader('tagline', v)} />
      </div>
      {contentBlocks.map((block, i) => (
        <div key={i} className="border border-charcoal/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
              {block.type === 'section_heading' ? 'Section heading' : 'Paragraph'}
            </span>
            <button onClick={() => removeContent(i)} className="font-sans text-[11px] text-terracotta hover:underline">Remove</button>
          </div>
          {block.type === 'section_heading'
            ? <Field label="Heading text" value={block.text || ''} onChange={(v) => updateContent(i, 'text', v)} />
            : <Textarea label="Paragraph text" value={block.text || ''} onChange={(v) => updateContent(i, 'text', v)} rows={3} />
          }
        </div>
      ))}
      <div className="flex gap-2">
        <button
          onClick={() => addBlock('paragraph')}
          className="flex-1 border border-dashed border-charcoal/25 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal/50 hover:border-charcoal hover:text-charcoal transition-colors"
        >
          + Add paragraph
        </button>
        <button
          onClick={() => addBlock('section_heading')}
          className="flex-1 border border-dashed border-charcoal/25 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-charcoal/50 hover:border-charcoal hover:text-charcoal transition-colors"
        >
          + Add heading
        </button>
      </div>
    </div>
  );
}

function CmsBlockEditor({ page, onChange }) {
  const blocks = parseBlocks(page?.blocks);
  if (page?.type === 'homepage_section') return <HomepageBlockEditor blocks={blocks} onChange={onChange} />;
  if (page?.type === 'faq') return <FaqBlockEditor blocks={blocks} onChange={onChange} />;
  if (page?.type === 'terms') return <TermsBlockEditor blocks={blocks} onChange={onChange} />;
  if (page?.type === 'about') return <AboutBlockEditor blocks={blocks} onChange={onChange} />;
  return (
    <Textarea
      label="Blocks JSON"
      value={typeof page?.blocks === 'string' ? page.blocks : JSON.stringify(blocks, null, 2)}
      onChange={onChange}
      rows={12}
    />
  );
}

export default function AdminDashboard({ admin, csrf, initialData }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [summary, setSummary] = useState(initialData.summary);
  const [products, setProducts] = useState(initialData.products);
  const [orders, setOrders] = useState(initialData.orders);
  const [pages, setPages] = useState(initialData.pages);
  const [riskEvents, setRiskEvents] = useState(initialData.riskEvents);
  const [auditEvents, setAuditEvents] = useState(initialData.auditEvents);
  const [notifications, setNotifications] = useState(initialData.notifications || []);
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
  const [toasts, setToasts] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const selectedProduct = selectedProductId === 'new' ? draftProduct : products.find((item) => item.id === selectedProductId);
  const selectedOrder = orders.find((item) => item.id === selectedOrderId);
  const selectedPage = selectedPageId === 'new' ? draftPage : pages.find((item) => item.id === selectedPageId);

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast({ title, message, type = 'success' }) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [{ id, title, message, type }, ...current].slice(0, 4));
    window.setTimeout(() => dismissToast(id), 5500);
  }

  function showSuccess(title, message) {
    showToast({ title, message, type: 'success' });
  }

  function showError(error) {
    showToast({
      title: 'Action failed',
      message: error?.message || 'The action could not be completed.',
      type: 'error',
    });
  }

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
    setNotifications(data.notifications || []);
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
      await refreshSecurity();
      setSelectedProductId(data.product.id);
      showSuccess('Product saved', `${data.product.name} was saved.`);
    } catch (error) {
      showError(error);
    }
  }

  async function archiveSelectedProduct() {
    if (!selectedProduct?.id) return;
    try {
      await api(`/api/admin/products/${selectedProduct.id}`, { method: 'DELETE' });
      await refreshProducts();
      await refreshSecurity();
      showSuccess('Product archived', `${selectedProduct.name} was archived.`);
    } catch (error) {
      showError(error);
    }
  }

  async function uploadSelectedProductImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedProduct) return;

    setUploadingImage(true);
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
      await refreshSecurity();
      showSuccess('Image uploaded', 'Image uploaded to Cloudinary. Save product to attach it.');
    } catch (error) {
      showError(error);
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
      showSuccess('Order saved', `${data.order.publicOrderNumber} was updated.`);
    } catch (error) {
      showError(error);
    }
  }

  async function savePage() {
    try {
      const payload = selectedPageId === 'new' ? draftPage : selectedPage;
      const path = selectedPageId === 'new' ? '/api/admin/cms/pages' : `/api/admin/cms/pages/${payload.id}`;
      const method = selectedPageId === 'new' ? 'POST' : 'PATCH';
      const data = await api(path, { method, body: JSON.stringify(payload) });
      await refreshPages();
      await refreshSecurity();
      setSelectedPageId(data.page.id);
      showSuccess('CMS content saved', `${data.page.title} was saved.`);
    } catch (error) {
      showError(error);
    }
  }

  async function seedCmsDefaults() {
    try {
      const data = await api('/api/admin/cms/seed', { method: 'POST' });
      await refreshPages();
      await refreshSecurity();
      showSuccess('CMS defaults seeded', `${data.pages.length} pages restored to default content.`);
    } catch (error) {
      showError(error);
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
  const visibleNotifications = useMemo(() => notifications.slice(0, 20), [notifications]);

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

        <ToastStack toasts={toasts} onDismiss={dismissToast} />

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
              <div className="mb-3 flex flex-col gap-2">
                <button
                  onClick={() => setSelectedPageId('new')}
                  className="w-full border border-charcoal px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em]"
                >
                  New content
                </button>
                <button
                  onClick={seedCmsDefaults}
                  className="w-full border border-charcoal/30 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/60 hover:border-charcoal hover:text-charcoal transition-colors"
                >
                  Seed defaults
                </button>
              </div>
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
                  <CmsBlockEditor
                    page={selectedPage}
                    onChange={(value) => updateSelectedPage('blocks', value)}
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
            <Panel title="Action notifications">
              <NotificationList notifications={visibleNotifications} />
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

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed right-4 top-4 z-[400] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`border px-4 py-3 shadow-lg ${
            toast.type === 'error'
              ? 'border-terracotta/60 bg-cream-100 text-terracotta'
              : 'border-[#4A7C59]/50 bg-cream-100 text-charcoal'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em]">
                {toast.title}
              </p>
              <p className="mt-1 font-sans text-sm leading-5 text-charcoal/70">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="font-sans text-lg leading-none text-charcoal/45 hover:text-charcoal"
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        </div>
      ))}
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

function NotificationList({ notifications }) {
  if (!notifications.length) return <p className="font-sans text-sm text-charcoal/55">No action notifications recorded.</p>;
  return (
    <div className="max-h-[620px] space-y-3 overflow-auto">
      {notifications.map((notification) => (
        <div key={notification.id} className="border border-charcoal/10 p-3 font-sans text-sm">
          <div className="flex justify-between gap-3">
            <span className="font-semibold">{notification.title}</span>
            <span className="text-xs uppercase tracking-[0.08em] text-[#4A7C59]">
              {notification.type}
            </span>
          </div>
          <p className="mt-1 text-charcoal/60">{notification.message}</p>
          <p className="mt-1 text-xs text-charcoal/40">
            {notification.actorEmail || notification.actorId} · {notification.createdAt}
          </p>
        </div>
      ))}
    </div>
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
