import { createHash, randomUUID } from 'crypto';
import {
  CURRENT_PRIVACY_POLICY_VERSION,
  customerAddressInputSchema,
  customerLoginSchema,
  customerPrivacyRequestInputSchema,
  customerProfileUpdateSchema,
  customerRegistrationSchema,
} from '@/lib/backoffice/schemas';
import { keys } from '@/lib/backoffice/keys';
import { getKV } from '@/lib/backoffice/kv';
import { sha256 } from '@/lib/backoffice/security';
import { hashCustomerPassword, verifyCustomerPassword } from './password';

function nowIso() {
  return new Date().toISOString();
}

function scoreFromDate(value) {
  return Date.parse(value || nowIso());
}

function hashDocument(value) {
  return createHash('sha256').update(JSON.stringify(value || null)).digest('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hasAddressContent(address) {
  return ['line1', 'postalCode', 'city', 'country'].some((field) => String(address?.[field] || '').trim());
}

function publicConsent(record) {
  if (!record) return null;
  const { emailHash, ipHash, userAgentHash, requestId, ...safeRecord } = record;
  return safeRecord;
}

function publicPrivacyRequest(record) {
  if (!record) return null;
  const { emailHash, ...safeRecord } = record;
  return safeRecord;
}

function publicCustomerOrder(order) {
  if (!order) return null;
  const { risk, internalNotes, ...safeOrder } = order;
  const { emailHash, ...safeCustomer } = order.customer || {};
  return {
    ...safeOrder,
    customer: safeCustomer,
  };
}

async function getDocuments(ids, keyFactory) {
  const kv = getKV();
  const docs = await Promise.all((ids || []).map((id) => kv.getJson(keyFactory(id))));
  return docs.filter(Boolean);
}

async function writeAuditEvent({ actor, action, entityType, entityId, before, after, metadata = {} }) {
  const kv = getKV();
  const createdAt = nowIso();
  const id = `audit_${randomUUID()}`;
  const record = {
    id,
    actorId: actor?.id || 'system',
    actorEmail: actor?.email || '',
    action,
    entityType,
    entityId,
    beforeHash: hashDocument(before),
    afterHash: hashDocument(after),
    metadata,
    createdAt,
  };

  await kv.setJson(keys.audit(id), record);
  await kv.zadd(keys.auditIndexCreated, scoreFromDate(createdAt), id);
  await kv.zadd(keys.auditIndexEntity(entityType, entityId), scoreFromDate(createdAt), id);
  return record;
}

export function publicCustomer(customer) {
  if (!customer) return null;
  const { passwordHash, emailHash, ...safeCustomer } = customer;
  return safeCustomer;
}

export async function getCustomerById(id) {
  return getKV().getJson(keys.customer(id));
}

export async function getCustomerByEmail(email) {
  const emailHash = sha256(normalizeEmail(email));
  const id = await getKV().getJson(keys.customerEmail(emailHash));
  if (!id) return null;
  return getCustomerById(id);
}

export async function recordCustomerConsent({ customer, type, granted, policyVersion, source, context = {} }) {
  if (!customer?.id) return null;
  const kv = getKV();
  const createdAt = nowIso();
  const id = `consent_${randomUUID()}`;
  const record = {
    id,
    customerId: customer.id,
    emailHash: customer.emailHash || sha256(customer.email),
    type,
    granted: Boolean(granted),
    policyVersion: policyVersion || CURRENT_PRIVACY_POLICY_VERSION,
    source: source || 'account',
    ipHash: context.ipHash || '',
    userAgentHash: context.userAgentHash || '',
    requestId: context.requestId || '',
    createdAt,
  };

  await kv.setJson(keys.customerConsent(id), record);
  await kv.zadd(keys.customerConsentIndex(customer.id), scoreFromDate(createdAt), id);
  await writeAuditEvent({
    actor: { id: customer.id, email: customer.email },
    action: 'customer_consent_record',
    entityType: 'customer_consent',
    entityId: id,
    before: null,
    after: record,
    metadata: { type, granted: Boolean(granted) },
  });
  return record;
}

export async function createCustomer(input, context = {}) {
  const parsed = customerRegistrationSchema.parse(input);
  const kv = getKV();
  const email = normalizeEmail(parsed.email);
  const emailHash = sha256(email);
  const existing = await kv.getJson(keys.customerEmail(emailHash));
  if (existing) {
    const error = new Error('An account with this email address already exists. Please sign in instead.');
    error.status = 409;
    throw error;
  }

  const createdAt = nowIso();
  const customer = {
    id: `cust_${randomUUID()}`,
    status: 'active',
    name: parsed.name,
    email,
    emailHash,
    phone: parsed.phone || '',
    passwordHash: hashCustomerPassword(parsed.password),
    defaultShippingAddressId: '',
    defaultBillingAddressId: '',
    dataProtectionFlags: {
      privacyPolicyAccepted: true,
      privacyPolicyVersion: parsed.privacyPolicyVersion,
      privacyPolicyAcceptedAt: createdAt,
      marketingEmailConsent: Boolean(parsed.marketingEmailConsent),
      marketingEmailConsentedAt: parsed.marketingEmailConsent ? createdAt : '',
      marketingEmailWithdrawnAt: parsed.marketingEmailConsent ? '' : createdAt,
      dataSubjectRightsAvailable: true,
      processingRegion: 'EU',
      lawfulBasisAccount: 'contract',
      lawfulBasisOrders: 'contract',
      lawfulBasisMarketing: 'consent',
    },
    createdAt,
    updatedAt: createdAt,
    lastLoginAt: '',
    version: 1,
  };

  await kv.setJson(keys.customer(customer.id), customer);
  await kv.setJson(keys.customerEmail(emailHash), customer.id);
  await kv.zadd(keys.customerIndexCreated, scoreFromDate(createdAt), customer.id);
  await writeAuditEvent({
    actor: { id: customer.id, email },
    action: 'customer_create',
    entityType: 'customer',
    entityId: customer.id,
    before: null,
    after: publicCustomer(customer),
    metadata: { requestId: context.requestId },
  });
  await recordCustomerConsent({
    customer,
    type: 'privacy_policy',
    granted: true,
    policyVersion: parsed.privacyPolicyVersion,
    source: 'registration',
    context,
  });
  await recordCustomerConsent({
    customer,
    type: 'marketing_email',
    granted: parsed.marketingEmailConsent,
    policyVersion: parsed.privacyPolicyVersion,
    source: 'registration',
    context,
  });

  return customer;
}

export async function authenticateCustomer(input) {
  const parsed = customerLoginSchema.parse(input);
  const customer = await getCustomerByEmail(parsed.email);
  if (!customer || customer.status !== 'active') return null;
  if (!verifyCustomerPassword(parsed.password, customer.passwordHash)) return null;
  return customer;
}

export async function markCustomerLogin(customer, context = {}) {
  const kv = getKV();
  const previous = await getCustomerById(customer.id);
  if (!previous) return null;
  const next = {
    ...previous,
    lastLoginAt: nowIso(),
    updatedAt: nowIso(),
    version: Number(previous.version || 0) + 1,
  };
  await kv.setJson(keys.customer(next.id), next);
  await writeAuditEvent({
    actor: { id: next.id, email: next.email },
    action: 'customer_login',
    entityType: 'customer',
    entityId: next.id,
    before: publicCustomer(previous),
    after: publicCustomer(next),
    metadata: { requestId: context.requestId },
  });
  return next;
}

export async function updateCustomerProfile(customerId, input, context = {}) {
  const parsed = customerProfileUpdateSchema.parse(input);
  const kv = getKV();
  const previous = await getCustomerById(customerId);
  if (!previous) return null;

  const updatedAt = nowIso();
  const currentMarketing = Boolean(previous.dataProtectionFlags?.marketingEmailConsent);
  const nextMarketing =
    parsed.marketingEmailConsent === undefined ? currentMarketing : Boolean(parsed.marketingEmailConsent);
  const next = {
    ...previous,
    name: parsed.name ?? previous.name,
    phone: parsed.phone ?? previous.phone,
    dataProtectionFlags: {
      ...(previous.dataProtectionFlags || {}),
      marketingEmailConsent: nextMarketing,
      marketingEmailConsentedAt:
        nextMarketing && !currentMarketing ? updatedAt : previous.dataProtectionFlags?.marketingEmailConsentedAt || '',
      marketingEmailWithdrawnAt:
        !nextMarketing && currentMarketing ? updatedAt : previous.dataProtectionFlags?.marketingEmailWithdrawnAt || '',
    },
    updatedAt,
    version: Number(previous.version || 0) + 1,
  };

  await kv.setJson(keys.customer(customerId), next);
  await writeAuditEvent({
    actor: { id: next.id, email: next.email },
    action: 'customer_update',
    entityType: 'customer',
    entityId: next.id,
    before: publicCustomer(previous),
    after: publicCustomer(next),
    metadata: { requestId: context.requestId },
  });

  if (parsed.marketingEmailConsent !== undefined && currentMarketing !== nextMarketing) {
    await recordCustomerConsent({
      customer: next,
      type: 'marketing_email',
      granted: nextMarketing,
      policyVersion: next.dataProtectionFlags?.privacyPolicyVersion,
      source: 'account_privacy_settings',
      context,
    });
  }

  return next;
}

export async function listCustomerAddresses(customerId) {
  const ids = await getKV().zrange(keys.customerAddressIndex(customerId), 0, -1);
  const addresses = await getDocuments(ids, keys.customerAddress);
  return addresses.filter((address) => !address.deletedAt).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

async function clearAddressDefault(customerId, field, exceptId) {
  const kv = getKV();
  const addresses = await listCustomerAddresses(customerId);
  for (const address of addresses) {
    if (address.id === exceptId || !address[field]) continue;
    await kv.setJson(keys.customerAddress(address.id), {
      ...address,
      [field]: false,
      updatedAt: nowIso(),
      version: Number(address.version || 0) + 1,
    });
  }
}

export async function saveCustomerAddress(customerId, input, context = {}) {
  const parsed = customerAddressInputSchema.parse(input);
  if (!hasAddressContent(parsed)) {
    const error = new Error('Address line, city, postal code, or country is required.');
    error.status = 400;
    throw error;
  }

  const kv = getKV();
  const previous = parsed.id ? await kv.getJson(keys.customerAddress(parsed.id)) : null;
  if (previous && previous.customerId !== customerId) {
    const error = new Error('Address not found.');
    error.status = 404;
    throw error;
  }

  const existingAddresses = await listCustomerAddresses(customerId);
  const now = nowIso();
  const id = parsed.id || `addr_${randomUUID()}`;
  const address = {
    id,
    customerId,
    label: parsed.label || 'Default',
    name: parsed.name || '',
    line1: parsed.line1 || '',
    line2: parsed.line2 || '',
    postalCode: parsed.postalCode || '',
    city: parsed.city || '',
    region: parsed.region || '',
    country: parsed.country || '',
    phone: parsed.phone || '',
    isDefaultShipping: parsed.isDefaultShipping || (!previous && existingAddresses.length === 0),
    isDefaultBilling: parsed.isDefaultBilling || (!previous && existingAddresses.length === 0),
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    version: Number(previous?.version || 0) + 1,
  };

  if (address.isDefaultShipping) await clearAddressDefault(customerId, 'isDefaultShipping', id);
  if (address.isDefaultBilling) await clearAddressDefault(customerId, 'isDefaultBilling', id);

  await kv.setJson(keys.customerAddress(id), address);
  await kv.zadd(keys.customerAddressIndex(customerId), scoreFromDate(address.createdAt), id);

  const customer = await getCustomerById(customerId);
  if (customer && (address.isDefaultShipping || address.isDefaultBilling)) {
    await kv.setJson(keys.customer(customerId), {
      ...customer,
      defaultShippingAddressId: address.isDefaultShipping ? id : customer.defaultShippingAddressId || '',
      defaultBillingAddressId: address.isDefaultBilling ? id : customer.defaultBillingAddressId || '',
      updatedAt: now,
      version: Number(customer.version || 0) + 1,
    });
  }

  await writeAuditEvent({
    actor: { id: customerId, email: customer?.email || '' },
    action: previous ? 'customer_address_update' : 'customer_address_create',
    entityType: 'customer_address',
    entityId: id,
    before: previous,
    after: address,
    metadata: { requestId: context.requestId },
  });
  return address;
}

export async function saveCustomerAddressFromOrder(customerId, input, context = {}) {
  const customer = await getCustomerById(customerId);
  if (!customer) return null;
  const parsed = customerAddressInputSchema.parse({
    label: 'Shipping',
    name: input?.name || customer.name,
    line1: input?.line1 || '',
    line2: input?.line2 || '',
    postalCode: input?.postalCode || '',
    city: input?.city || '',
    region: input?.region || '',
    country: input?.country || '',
    phone: input?.phone || customer.phone || '',
    isDefaultShipping: !customer.defaultShippingAddressId,
  });
  if (!hasAddressContent(parsed)) return null;
  return saveCustomerAddress(customerId, parsed, context);
}

export async function deleteCustomerAddress(customerId, addressId, context = {}) {
  const kv = getKV();
  const previous = await kv.getJson(keys.customerAddress(addressId));
  if (!previous || previous.customerId !== customerId) return null;
  const customer = await getCustomerById(customerId);

  await kv.del(keys.customerAddress(addressId));
  await kv.zrem(keys.customerAddressIndex(customerId), addressId);
  if (customer && (customer.defaultShippingAddressId === addressId || customer.defaultBillingAddressId === addressId)) {
    await kv.setJson(keys.customer(customerId), {
      ...customer,
      defaultShippingAddressId: customer.defaultShippingAddressId === addressId ? '' : customer.defaultShippingAddressId,
      defaultBillingAddressId: customer.defaultBillingAddressId === addressId ? '' : customer.defaultBillingAddressId,
      updatedAt: nowIso(),
      version: Number(customer.version || 0) + 1,
    });
  }

  await writeAuditEvent({
    actor: { id: customerId, email: customer?.email || '' },
    action: 'customer_address_delete',
    entityType: 'customer_address',
    entityId: addressId,
    before: previous,
    after: null,
    metadata: { requestId: context.requestId },
  });
  return previous;
}

export async function listCustomerConsents(customerId) {
  const ids = await getKV().zrange(keys.customerConsentIndex(customerId), 0, -1);
  const records = await getDocuments(ids, keys.customerConsent);
  return records
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(publicConsent);
}

export async function createCustomerPrivacyRequest(customerId, input, context = {}) {
  const parsed = customerPrivacyRequestInputSchema.parse(input);
  const customer = await getCustomerById(customerId);
  if (!customer) return null;

  const kv = getKV();
  const createdAt = nowIso();
  const id = `privacy_${randomUUID()}`;
  const request = {
    id,
    customerId,
    emailHash: customer.emailHash,
    type: parsed.type,
    message: parsed.message,
    status: 'submitted',
    responseNotes: '',
    createdAt,
    updatedAt: createdAt,
  };

  await kv.setJson(keys.customerPrivacyRequest(id), request);
  await kv.zadd(keys.customerPrivacyRequestIndex(customerId), scoreFromDate(createdAt), id);
  await kv.zadd(keys.customerPrivacyRequestIndexCreated, scoreFromDate(createdAt), id);
  await writeAuditEvent({
    actor: { id: customerId, email: customer.email },
    action: 'customer_privacy_request_create',
    entityType: 'customer_privacy_request',
    entityId: id,
    before: null,
    after: request,
    metadata: { requestId: context.requestId, type: parsed.type },
  });
  return publicPrivacyRequest(request);
}

export async function listCustomerPrivacyRequests(customerId) {
  const ids = await getKV().zrange(keys.customerPrivacyRequestIndex(customerId), 0, -1);
  const requests = await getDocuments(ids, keys.customerPrivacyRequest);
  return requests
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(publicPrivacyRequest);
}

export async function listAllCustomers(limit = 200) {
  const kv = getKV();
  const ids = await kv.zrange(keys.customerIndexCreated, -limit, -1);
  const customers = await Promise.all(ids.reverse().map((id) => kv.getJson(keys.customer(id))));
  return customers.filter(Boolean).map(publicCustomer);
}

export async function adminResetCustomerPassword(customerId, newPassword, actor, context = {}) {
  const { customerRegistrationSchema } = await import('@/lib/backoffice/schemas');
  const parsed = customerRegistrationSchema.pick({ password: true }).parse({ password: newPassword });
  const kv = getKV();
  const previous = await getCustomerById(customerId);
  if (!previous) {
    const err = new Error('Customer not found.');
    err.status = 404;
    throw err;
  }
  const updatedAt = nowIso();
  const next = {
    ...previous,
    passwordHash: hashCustomerPassword(parsed.password),
    updatedAt,
    version: Number(previous.version || 0) + 1,
  };
  await kv.setJson(keys.customer(customerId), next);
  await writeAuditEvent({
    actor: { id: actor?.id || 'admin', email: actor?.email || '' },
    action: 'customer_password_reset',
    entityType: 'customer',
    entityId: customerId,
    before: publicCustomer(previous),
    after: publicCustomer(next),
    metadata: { requestId: context.requestId, byAdmin: true },
  });
  return publicCustomer(next);
}

export async function changeCustomerPassword(customerId, currentPassword, newPassword, context = {}) {
  const kv = getKV();
  const customer = await getCustomerById(customerId);
  if (!customer) {
    const err = new Error('Customer not found.');
    err.status = 404;
    throw err;
  }
  if (!verifyCustomerPassword(currentPassword, customer.passwordHash)) {
    const err = new Error('Your current password is incorrect. Please try again.');
    err.status = 403;
    throw err;
  }
  const { customerRegistrationSchema } = await import('@/lib/backoffice/schemas');
  const parsed = customerRegistrationSchema.pick({ password: true }).parse({ password: newPassword });
  const updatedAt = nowIso();
  const next = {
    ...customer,
    passwordHash: hashCustomerPassword(parsed.password),
    updatedAt,
    version: Number(customer.version || 0) + 1,
  };
  await kv.setJson(keys.customer(customerId), next);
  await writeAuditEvent({
    actor: { id: customerId, email: customer.email },
    action: 'customer_password_change',
    entityType: 'customer',
    entityId: customerId,
    before: publicCustomer(customer),
    after: publicCustomer(next),
    metadata: { requestId: context.requestId },
  });
  return publicCustomer(next);
}

export async function adminUpdateCustomerStatus(customerId, status, actor, context = {}) {
  const { customerStatuses } = await import('@/lib/backoffice/keys');
  if (!customerStatuses.includes(status)) {
    const err = new Error('Invalid status.');
    err.status = 400;
    throw err;
  }
  const kv = getKV();
  const previous = await getCustomerById(customerId);
  if (!previous) {
    const err = new Error('Customer not found.');
    err.status = 404;
    throw err;
  }
  const updatedAt = nowIso();
  const next = { ...previous, status, updatedAt, version: Number(previous.version || 0) + 1 };
  await kv.setJson(keys.customer(customerId), next);
  await writeAuditEvent({
    actor: { id: actor?.id || 'admin', email: actor?.email || '' },
    action: 'customer_status_update',
    entityType: 'customer',
    entityId: customerId,
    before: publicCustomer(previous),
    after: publicCustomer(next),
    metadata: { requestId: context.requestId, status },
  });
  return publicCustomer(next);
}

export async function listCustomerOrders(customer) {
  const kv = getKV();
  const ids = await kv.zrange(keys.orderIndexCustomer(customer.id), 0, -1);
  const orders = await getDocuments(ids, keys.order);
  return orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(publicCustomerOrder);
}

export async function getCustomerOrderById(customer, orderId) {
  const order = await getKV().getJson(keys.order(orderId));
  if (!order) return null;
  if (order.customerId === customer.id) return publicCustomerOrder(order);
  return null;
}
