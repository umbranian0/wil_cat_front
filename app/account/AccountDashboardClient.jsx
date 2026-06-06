'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_ACCOUNT_CONTENT } from '@/lib/cmsContent';

const privacyRequestTypes = [
  'access',
  'rectification',
  'erasure',
  'restriction',
  'portability',
  'objection',
  'consent_withdrawal',
];

function emptyAddress(customer) {
  return {
    label: 'Default',
    name: customer?.name || '',
    line1: '',
    line2: '',
    postalCode: '',
    city: '',
    region: '',
    country: '',
    phone: customer?.phone || '',
    isDefaultShipping: true,
    isDefaultBilling: true,
  };
}

function money(currency, amount) {
  const rawCurrency = String(currency || '').trim();
  const symbol = !rawCurrency || rawCurrency === 'EUR' || rawCurrency.includes('EUR') ? 'EUR ' : `${rawCurrency} `;
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

function formatStatus(status) {
  return String(status || '').replace(/_/g, ' ');
}

export default function AccountDashboardClient({ initialData }) {
  const content = initialData.content || DEFAULT_ACCOUNT_CONTENT;
  const tabs = [
    { id: 'orders', label: content.ordersLabel },
    { id: 'addresses', label: content.addressesLabel },
    { id: 'privacy', label: content.privacyLabel },
    { id: 'profile', label: content.profileLabel },
    { id: 'security', label: 'Password' },
  ];
  const [activeTab, setActiveTab] = useState('orders');
  const [customer, setCustomer] = useState(initialData.customer);
  const [orders, setOrders] = useState(initialData.orders || []);
  const [addresses, setAddresses] = useState(initialData.addresses || []);
  const [consents, setConsents] = useState(initialData.consents || []);
  const [privacyRequests, setPrivacyRequests] = useState(initialData.privacyRequests || []);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || 'new');
  const [draftAddress, setDraftAddress] = useState(emptyAddress(initialData.customer));
  const [profileDraft, setProfileDraft] = useState({
    name: initialData.customer.name || '',
    phone: initialData.customer.phone || '',
    marketingEmailConsent: Boolean(initialData.customer.dataProtectionFlags?.marketingEmailConsent),
  });
  const [privacyDraft, setPrivacyDraft] = useState({ type: 'access', message: '' });
  const [passwordDraft, setPasswordDraft] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selectedAddress = selectedAddressId === 'new'
    ? draftAddress
    : addresses.find((address) => address.id === selectedAddressId);

  const openOrders = useMemo(
    () => orders.filter((order) => !['completed', 'cancelled', 'refunded'].includes(order.status)),
    [orders]
  );

  async function api(path, options = {}) {
    setError('');
    setNotice('');
    const response = await fetch(path, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(options.method && options.method !== 'GET' ? { 'x-csrf-token': initialData.csrf } : {}),
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const issue = body.issues?.[0]?.message;
      throw new Error(issue || body.error || 'Request failed.');
    }
    return body;
  }

  async function refreshProfile() {
    const data = await api('/api/customer/profile');
    setCustomer(data.customer);
    setAddresses(data.addresses || []);
    setConsents(data.consents || []);
    setPrivacyRequests(data.privacyRequests || []);
  }

  async function refreshOrders() {
    const data = await api('/api/customer/orders');
    setOrders(data.orders || []);
  }

  async function logout() {
    try {
      await api('/api/customer/auth/logout', { method: 'POST', body: JSON.stringify({}) });
      window.location.href = '/account/login';
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveProfile() {
    try {
      const data = await api('/api/customer/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileDraft),
      });
      setCustomer(data.customer);
      await refreshProfile();
      setNotice('Profile saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  function updateAddress(field, value) {
    if (selectedAddressId === 'new') {
      setDraftAddress((current) => ({ ...current, [field]: value }));
      return;
    }
    setAddresses((current) =>
      current.map((address) => (address.id === selectedAddressId ? { ...address, [field]: value } : address))
    );
  }

  async function saveAddress() {
    if (!selectedAddress) return;
    try {
      const path = selectedAddressId === 'new' ? '/api/customer/addresses' : `/api/customer/addresses/${selectedAddress.id}`;
      const method = selectedAddressId === 'new' ? 'POST' : 'PATCH';
      const data = await api(path, { method, body: JSON.stringify(selectedAddress) });
      await refreshProfile();
      setSelectedAddressId(data.address.id);
      setDraftAddress(emptyAddress(customer));
      setNotice('Address saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteAddress() {
    if (!selectedAddress?.id) return;
    try {
      await api(`/api/customer/addresses/${selectedAddress.id}`, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
      await refreshProfile();
      setSelectedAddressId('new');
      setNotice('Address deleted.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePassword() {
    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setError('The new passwords do not match. Please try again.');
      return;
    }
    if (passwordDraft.newPassword.length < 8) {
      setError('Your new password must be at least 8 characters.');
      return;
    }
    try {
      await api('/api/customer/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordDraft.currentPassword,
          newPassword: passwordDraft.newPassword,
        }),
      });
      setPasswordDraft({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice('Password changed successfully.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitPrivacyRequest() {
    try {
      const data = await api('/api/customer/privacy-requests', {
        method: 'POST',
        body: JSON.stringify(privacyDraft),
      });
      setPrivacyRequests((current) => [data.privacyRequest, ...current]);
      setPrivacyDraft({ type: 'access', message: '' });
      setNotice('Privacy request submitted.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-enter min-h-screen bg-cream-100 px-6 pb-20 pt-28 text-charcoal md:px-10">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 grid gap-6 border-b border-charcoal/10 pb-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
              {content.eyebrow}
            </p>
            <h1 className="mt-2 font-serif text-5xl font-light md:text-6xl">{content.heading}</h1>
            <p className="mt-3 max-w-xl font-sans text-sm leading-7 text-charcoal/60">{content.intro}</p>
            <p className="mt-3 font-sans text-xs uppercase tracking-[0.12em] text-charcoal/40">{customer.email}</p>
          </div>
          <div className="border border-charcoal/10 bg-cream-200/70 p-5">
            <div className="grid gap-3">
              {(content.features || []).slice(0, 3).map((feature) => (
                <div key={feature.title} className="border-b border-charcoal/10 pb-3 last:border-b-0 last:pb-0">
                  <h2 className="font-serif text-xl font-light">{feature.title}</h2>
                  <p className="mt-1 font-sans text-xs leading-5 text-charcoal/55">{feature.text}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-5 w-full border border-charcoal px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] hover:bg-charcoal hover:text-cream-100"
            >
              {content.signOutLabel}
            </button>
          </div>
        </header>

        <div className="mb-7 grid gap-3 md:grid-cols-3">
          <Metric label="Open orders" value={openOrders.length} />
          <Metric label={content.addressesTitle} value={addresses.length} />
          <Metric label="Privacy requests" value={privacyRequests.length} />
        </div>

        <nav className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] ${
                activeTab === tab.id
                  ? 'border-charcoal bg-charcoal text-cream-100'
                  : 'border-charcoal/15 text-charcoal/55 hover:border-charcoal hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {(notice || error) && (
          <div className={`mb-5 border p-4 font-sans text-sm ${error ? 'border-terracotta text-terracotta' : 'border-[#4A7C59]/50 text-charcoal/70'}`}>
            {error || notice}
          </div>
        )}

        {activeTab === 'orders' && (
          <section className="grid gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl font-light">{content.ordersTitle}</h2>
              <button
                type="button"
                onClick={refreshOrders}
                className="border border-charcoal/20 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55 hover:border-charcoal hover:text-charcoal"
              >
                Refresh
              </button>
            </div>
            {orders.length ? (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderPanel key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <EmptyState text={content.emptyOrdersText} />
            )}
          </section>
        )}

        {activeTab === 'addresses' && (
          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Panel title={content.addressesTitle}>
              <button
                type="button"
                onClick={() => {
                  setSelectedAddressId('new');
                  setDraftAddress(emptyAddress(customer));
                }}
                className="mb-3 w-full border border-charcoal px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em]"
              >
                New address
              </button>
              <div className="grid gap-2">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`border p-3 text-left font-sans text-sm ${
                      selectedAddressId === address.id ? 'border-charcoal bg-cream-200' : 'border-charcoal/10'
                    }`}
                  >
                    <span className="block font-semibold">{address.label || 'Address'}</span>
                    <span className="block text-charcoal/55">{address.city || address.country || address.line1}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title={selectedAddressId === 'new' ? 'New address' : selectedAddress?.label || 'Address'}>
              {selectedAddress && (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Label" value={selectedAddress.label || ''} onChange={(value) => updateAddress('label', value)} />
                    <Field label="Recipient" value={selectedAddress.name || ''} onChange={(value) => updateAddress('name', value)} />
                    <Field label="Address line 1" value={selectedAddress.line1 || ''} onChange={(value) => updateAddress('line1', value)} />
                    <Field label="Address line 2" value={selectedAddress.line2 || ''} onChange={(value) => updateAddress('line2', value)} />
                    <Field label="Postal code" value={selectedAddress.postalCode || ''} onChange={(value) => updateAddress('postalCode', value)} />
                    <Field label="City" value={selectedAddress.city || ''} onChange={(value) => updateAddress('city', value)} />
                    <Field label="Region" value={selectedAddress.region || ''} onChange={(value) => updateAddress('region', value)} />
                    <Field label="Country" value={selectedAddress.country || ''} onChange={(value) => updateAddress('country', value)} />
                    <Field label="Phone" value={selectedAddress.phone || ''} onChange={(value) => updateAddress('phone', value)} />
                  </div>
                  <div className="flex flex-wrap gap-4 font-sans text-sm text-charcoal/65">
                    <Checkbox
                      label="Default shipping"
                      checked={Boolean(selectedAddress.isDefaultShipping)}
                      onChange={(value) => updateAddress('isDefaultShipping', value)}
                    />
                    <Checkbox
                      label="Default billing"
                      checked={Boolean(selectedAddress.isDefaultBilling)}
                      onChange={(value) => updateAddress('isDefaultBilling', value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <PrimaryButton onClick={saveAddress}>Save address</PrimaryButton>
                    {selectedAddressId !== 'new' && (
                      <button
                        type="button"
                        onClick={deleteAddress}
                        className="border border-terracotta px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-terracotta"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          </section>
        )}

        {activeTab === 'privacy' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title={content.privacyTitle}>
              <div className="grid gap-3 font-sans text-sm">
                <ReadinessRow label="Privacy policy accepted" value={customer.dataProtectionFlags?.privacyPolicyAccepted ? 'yes' : 'no'} />
                <ReadinessRow label="Policy version" value={customer.dataProtectionFlags?.privacyPolicyVersion || 'not recorded'} />
                <ReadinessRow label="Marketing consent" value={customer.dataProtectionFlags?.marketingEmailConsent ? 'yes' : 'no'} />
                <ReadinessRow label="Account basis" value={customer.dataProtectionFlags?.lawfulBasisAccount || 'contract'} />
                <ReadinessRow label="Order basis" value={customer.dataProtectionFlags?.lawfulBasisOrders || 'contract'} />
              </div>
            </Panel>

            <Panel title="Submit request">
              <div className="grid gap-4">
                <Select
                  label="Request type"
                  value={privacyDraft.type}
                  options={privacyRequestTypes}
                  onChange={(value) => setPrivacyDraft((current) => ({ ...current, type: value }))}
                />
                <Textarea
                  label="Message"
                  value={privacyDraft.message}
                  onChange={(value) => setPrivacyDraft((current) => ({ ...current, message: value }))}
                />
                <PrimaryButton onClick={submitPrivacyRequest}>Submit request</PrimaryButton>
              </div>
            </Panel>

            <Panel title="Request history">
              {privacyRequests.length ? (
                <div className="grid gap-3">
                  {privacyRequests.map((request) => (
                    <div key={request.id} className="border border-charcoal/10 p-3 font-sans text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">{formatStatus(request.type)}</span>
                        <span className="text-xs uppercase tracking-[0.08em] text-terracotta">{formatStatus(request.status)}</span>
                      </div>
                      <p className="mt-1 text-xs text-charcoal/45">{request.createdAt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text={content.emptyPrivacyRequestsText} />
              )}
            </Panel>

            <Panel title="Consent history">
              {consents.length ? (
                <div className="grid max-h-[420px] gap-3 overflow-auto">
                  {consents.map((consent) => (
                    <div key={consent.id} className="border border-charcoal/10 p-3 font-sans text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">{formatStatus(consent.type)}</span>
                        <span className={consent.granted ? 'text-[#4A7C59]' : 'text-terracotta'}>
                          {consent.granted ? 'granted' : 'not granted'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-charcoal/45">{consent.source} - {consent.createdAt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text={content.emptyConsentText} />
              )}
            </Panel>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title={content.profileTitle}>
              <div className="grid gap-4">
                <Field label="Name" value={profileDraft.name} onChange={(value) => setProfileDraft((current) => ({ ...current, name: value }))} />
                <Field label="Email" value={customer.email} readOnly />
                <Field label="Phone" value={profileDraft.phone} onChange={(value) => setProfileDraft((current) => ({ ...current, phone: value }))} />
                <Checkbox
                  label="Marketing email consent"
                  checked={Boolean(profileDraft.marketingEmailConsent)}
                  onChange={(value) => setProfileDraft((current) => ({ ...current, marketingEmailConsent: value }))}
                />
                <PrimaryButton onClick={saveProfile}>Save profile</PrimaryButton>
              </div>
            </Panel>
          </section>
        )}

        {activeTab === 'security' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Change password">
              <p className="mb-4 font-sans text-sm text-charcoal/55">
                To update your password, please enter your current password first. Your new password must be at least 8 characters.
              </p>
              <div className="grid gap-4">
                <Field
                  label="Current password"
                  type="password"
                  value={passwordDraft.currentPassword}
                  onChange={(value) => setPasswordDraft((current) => ({ ...current, currentPassword: value }))}
                />
                <Field
                  label="New password"
                  type="password"
                  value={passwordDraft.newPassword}
                  onChange={(value) => setPasswordDraft((current) => ({ ...current, newPassword: value }))}
                />
                <Field
                  label="Confirm new password"
                  type="password"
                  value={passwordDraft.confirmPassword}
                  onChange={(value) => setPasswordDraft((current) => ({ ...current, confirmPassword: value }))}
                />
                <PrimaryButton onClick={changePassword}>Update password</PrimaryButton>
              </div>
            </Panel>
            <Panel title="Need help?">
              <p className="font-sans text-sm leading-7 text-charcoal/60">
                If you have forgotten your password and cannot sign in, please contact us via the{' '}
                <a href="/contact" className="underline hover:text-charcoal">contact page</a> and we will reset your account manually.
              </p>
            </Panel>
          </section>
        )}
      </section>
    </main>
  );
}

function OrderPanel({ order }) {
  return (
    <section className="border border-charcoal/10 bg-cream-100 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-light">{order.publicOrderNumber}</h3>
          <p className="mt-1 font-sans text-sm capitalize text-terracotta">{formatStatus(order.status)}</p>
        </div>
        <div className="font-sans text-sm text-charcoal/60 md:text-right">
          <span className="block">{order.createdAt}</span>
          <span className="block font-semibold text-charcoal">{money(order.items?.[0]?.currency, order.total)}</span>
        </div>
      </div>
      <div className="mt-4 border border-charcoal/10">
        {(order.items || []).map((item) => (
          <div key={item.productId} className="flex justify-between border-b border-charcoal/10 p-3 font-sans text-sm">
            <span>{item.productSnapshot?.name} x {item.qty}</span>
            <span>{money(item.currency, item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AddressSummary title="Shipping" address={order.shippingAddress} />
        <div>
          <h4 className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/45">
            Timeline
          </h4>
          <div className="space-y-2">
            {(order.timeline || []).map((entry, index) => (
              <div key={`${entry.createdAt}-${index}`} className="border-l border-charcoal/20 pl-3 font-sans text-sm text-charcoal/65">
                <span className="font-semibold text-charcoal">{formatStatus(entry.status)}</span>
                <span className="block">{entry.note}</span>
                <span className="block text-xs text-charcoal/40">{entry.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AddressSummary({ title, address }) {
  return (
    <div>
      <h4 className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/45">
        {title}
      </h4>
      <div className="font-sans text-sm leading-6 text-charcoal/60">
        <span className="block">{address?.name || ''}</span>
        <span className="block">{address?.line1 || ''}</span>
        {address?.line2 && <span className="block">{address.line2}</span>}
        <span className="block">
          {[address?.postalCode, address?.city].filter(Boolean).join(' ')}
        </span>
        <span className="block">{[address?.region, address?.country].filter(Boolean).join(', ')}</span>
      </div>
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
      <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ''}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full border border-charcoal/15 bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-charcoal read-only:text-charcoal/50"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
        {label}
      </span>
      <select
        value={value || options[0]}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-charcoal/15 bg-cream-100 px-3 py-2 font-sans text-sm outline-none focus:border-charcoal"
      >
        {options.map((option) => (
          <option key={option} value={option}>{formatStatus(option)}</option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange, rows = 5 }) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/45">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-charcoal/15 bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-charcoal"
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 font-sans text-sm text-charcoal/65">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-fit bg-charcoal px-5 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cream-100 hover:bg-terracotta"
    >
      {children}
    </button>
  );
}

function ReadinessRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border border-charcoal/10 p-3">
      <span className="text-charcoal/65">{label}</span>
      <span className="font-semibold text-charcoal">{value}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="border border-charcoal/10 bg-cream-200 p-5 font-sans text-sm text-charcoal/55">
      {text}
    </div>
  );
}
