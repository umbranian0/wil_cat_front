import { createHash, randomUUID } from 'crypto';
import { keys } from './keys';
import { getKV } from './kv';

export function sha256(value) {
  return createHash('sha256').update(String(value || '').toLowerCase()).digest('hex');
}

export function getClientContext(request) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip =
    request.headers.get('x-real-ip') ||
    forwarded.split(',')[0]?.trim() ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const country = request.headers.get('x-vercel-ip-country') || '';
  const requestId = request.headers.get('x-vercel-id') || randomUUID();

  return {
    ip,
    ipHash: sha256(ip),
    userAgent,
    userAgentHash: sha256(userAgent),
    country,
    requestId,
  };
}

export async function recordRiskEvent(event) {
  const kv = getKV();
  const now = new Date().toISOString();
  const id = event.id || `risk_${randomUUID()}`;
  const record = {
    id,
    type: event.type,
    severity: event.severity || 'info',
    score: Number(event.score || 0),
    subject: event.subject || '',
    metadata: event.metadata || {},
    ipHash: event.ipHash || '',
    userAgentHash: event.userAgentHash || '',
    requestId: event.requestId || '',
    createdAt: now,
  };

  await kv.setJson(keys.risk(id), record);
  await kv.zadd(keys.riskIndexCreated, Date.parse(now), id);
  return record;
}

export async function checkRateLimit(scope, identifier, options = {}) {
  const limit = options.limit || 30;
  const windowSeconds = options.windowSeconds || 60;
  const kv = getKV();
  const safeIdentifier = sha256(identifier || 'unknown');
  const key = keys.rate(scope, safeIdentifier);
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, windowSeconds);

  const allowed = count <= limit;
  if (!allowed) {
    await recordRiskEvent({
      type: 'rate_limited',
      severity: 'high',
      score: 80,
      subject: scope,
      metadata: { scope, limit, windowSeconds, count },
      ipHash: safeIdentifier,
    });
  }

  return {
    allowed,
    count,
    limit,
    retryAfter: allowed ? 0 : windowSeconds,
  };
}

export function assessOrderRisk({ order, context }) {
  let score = 0;
  const reasons = [];
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  if (itemCount > 5) {
    score += 25;
    reasons.push('high_item_quantity');
  }

  if (!order.customer.phone) {
    score += 15;
    reasons.push('missing_phone');
  }

  if (order.total >= 300) {
    score += 20;
    reasons.push('high_order_value');
  }

  if (/https?:\/\//i.test(order.customer.message || '')) {
    score += 35;
    reasons.push('message_contains_url');
  }

  if (!context.userAgent || context.userAgent === 'unknown') {
    score += 20;
    reasons.push('missing_user_agent');
  }

  const severity = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'info';
  return { score, severity, reasons };
}

export async function listRiskEvents(limit = 50) {
  const kv = getKV();
  const ids = await kv.zrange(keys.riskIndexCreated, -limit, -1);
  const events = await Promise.all(ids.reverse().map((id) => kv.getJson(keys.risk(id))));
  return events.filter(Boolean);
}
