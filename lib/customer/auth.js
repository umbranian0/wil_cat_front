import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const CUSTOMER_COOKIE = 'wc_customer_session';

export function assertCustomerAuthReady() {
  getSessionSecret();
}
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function getSessionSecret() {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.customer_session_secret;

  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CUSTOMER_SESSION_SECRET is required in production.');
  }
  return 'local-development-customer-session-secret-change-before-production';
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signCustomerSession(payload) {
  const body = base64url(JSON.stringify({ ...payload, type: 'customer' }));
  const signature = createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyCustomerSession(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.type !== 'customer') return null;
    if (!payload.expiresAt || Date.parse(payload.expiresAt) < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createCustomerSession(customer) {
  const now = Date.now();
  const session = {
    id: customer.id,
    email: customer.email,
    csrf: randomBytes(24).toString('base64url'),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_SECONDS * 1000).toISOString(),
  };

  return {
    session,
    token: signCustomerSession(session),
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function getCustomerSessionFromCookies() {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  return verifyCustomerSession(token);
}

export function getCustomerSessionFromRequest(request) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  return verifyCustomerSession(token);
}

export function requireCustomer(request, options = {}) {
  const customer = getCustomerSessionFromRequest(request);
  if (!customer) {
    return {
      error: Response.json({ error: 'Customer authentication required.' }, { status: 401 }),
    };
  }

  if (options.mutation) {
    const csrf = request.headers.get('x-csrf-token');
    if (!csrf || csrf !== customer.csrf) {
      return {
        error: Response.json({ error: 'Invalid CSRF token.' }, { status: 403 }),
      };
    }
  }

  return { customer };
}

export function customerCookieOptions(maxAge) {
  const secure =
    process.env.CUSTOMER_COOKIE_SECURE === 'false'
      ? false
      : process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    maxAge,
  };
}
