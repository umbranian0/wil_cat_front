import { createHmac, createHash, timingSafeEqual, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientContext, recordRiskEvent, sha256 } from './security';

export const ADMIN_COOKIE = 'wc_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function getSessionSecret() {
  if (process.env.ADMIN_SESSION_SECRET || process.env.admin_session_secret) {
    return process.env.ADMIN_SESSION_SECRET || process.env.admin_session_secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET is required in production.');
  }
  return 'local-development-session-secret-change-before-production';
}

function getConfiguredPassword() {
  if (process.env.ADMIN_PASSWORD || process.env.admin_password) {
    return process.env.ADMIN_PASSWORD || process.env.admin_password;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD or an external auth provider is required in production.');
  }
  return 'wildcat-admin-demo';
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function passwordHash(password) {
  return createHash('sha256').update(password).digest('hex');
}

export function signSession(payload) {
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySession(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
  if (!safeEqual(signature, expected)) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.expiresAt || Date.parse(payload.expiresAt) < Date.now()) return null;
  return payload;
}

export async function getAdminFromCookies() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySession(token);
}

export function getAdminFromRequest(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifySession(token);
}

export async function loginAdmin(request, body) {
  const context = getClientContext(request);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const configuredEmail = (process.env.ADMIN_EMAIL || process.env.admin_email || 'owner@wildcat.local').trim().toLowerCase();
  const rate = await checkRateLimit('admin_login', `${context.ipHash}:${email}`, {
    limit: 6,
    windowSeconds: 15 * 60,
  });

  if (!rate.allowed) {
    return { ok: false, status: 429, error: 'Too many login attempts.' };
  }

  const expectedPasswordHash = process.env.ADMIN_PASSWORD_SHA256 || process.env.admin_password_sha256 || passwordHash(getConfiguredPassword());
  const validEmail = safeEqual(email, configuredEmail);
  const validPassword = safeEqual(passwordHash(password), expectedPasswordHash);

  if (!validEmail || !validPassword) {
    await recordRiskEvent({
      type: 'admin_login_failed',
      severity: 'medium',
      score: 50,
      subject: sha256(email),
      metadata: { emailHash: sha256(email) },
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
      requestId: context.requestId,
    });
    return { ok: false, status: 401, error: 'Invalid credentials.' };
  }

  const now = Date.now();
  const session = {
    id: `admin_${sha256(email).slice(0, 16)}`,
    email,
    role: 'owner',
    csrf: randomBytes(24).toString('base64url'),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_SECONDS * 1000).toISOString(),
  };

  return {
    ok: true,
    session,
    token: signSession(session),
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function requireAdmin(request, options = {}) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return {
      error: Response.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }

  if (options.mutation) {
    const csrf = request.headers.get('x-csrf-token');
    if (!csrf || csrf !== admin.csrf) {
      return {
        error: Response.json({ error: 'Invalid CSRF token.' }, { status: 403 }),
      };
    }
  }

  return { admin };
}

export function adminCookieOptions(maxAge) {
  const secure =
    process.env.ADMIN_COOKIE_SECURE === 'false'
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

export function isAuthConfiguredForProduction() {
  return Boolean(process.env.ADMIN_PASSWORD || process.env.admin_password || process.env.ADMIN_PASSWORD_SHA256 || process.env.admin_password_sha256) && Boolean(process.env.ADMIN_SESSION_SECRET || process.env.admin_session_secret);
}

export function getAuthReadiness() {
  const passwordConfigured = Boolean(process.env.ADMIN_PASSWORD || process.env.admin_password || process.env.ADMIN_PASSWORD_SHA256 || process.env.admin_password_sha256);
  const sessionSecretConfigured = Boolean(process.env.ADMIN_SESSION_SECRET || process.env.admin_session_secret);
  const secureCookie =
    process.env.ADMIN_COOKIE_SECURE === 'false'
      ? false
      : process.env.NODE_ENV === 'production';
  const warnings = [];

  if (!passwordConfigured) warnings.push('Admin password is not configured for production.');
  if (!sessionSecretConfigured) warnings.push('Admin session secret is not configured for production.');
  if (!secureCookie) warnings.push('Admin secure cookies are disabled; use this only for local HTTP smoke tests.');

  return {
    passwordConfigured,
    sessionSecretConfigured,
    secureCookie,
    productionReady: passwordConfigured && sessionSecretConfigured && secureCookie,
    warnings,
  };
}
