import { randomUUID } from 'crypto';
import { keys } from './keys.js';
import { getKV } from './kv.js';

function nowIso() {
  return new Date().toISOString();
}

function scoreFromDate(value) {
  return Date.parse(value || nowIso());
}

async function getDocuments(ids, keyFactory) {
  const kv = getKV();
  const docs = await Promise.all((ids || []).map((id) => kv.getJson(keyFactory(id))));
  return docs.filter(Boolean);
}

export async function recordAdminNotification(event = {}) {
  const kv = getKV();
  const createdAt = nowIso();
  const id = event.id || `notification_${randomUUID()}`;
  const actorId = event.actor?.id || event.actorId || 'system';
  const record = {
    id,
    type: event.type || 'success',
    title: String(event.title || 'Backoffice action').trim(),
    message: String(event.message || '').trim(),
    action: String(event.action || '').trim(),
    entityType: String(event.entityType || '').trim(),
    entityId: String(event.entityId || '').trim(),
    actorId,
    actorEmail: event.actor?.email || event.actorEmail || '',
    metadata: event.metadata || {},
    createdAt,
  };

  await kv.setJson(keys.notification(id), record);
  await kv.zadd(keys.notificationIndexCreated, scoreFromDate(createdAt), id);
  await kv.zadd(keys.notificationIndexActor(actorId), scoreFromDate(createdAt), id);
  return record;
}

export async function listAdminNotifications(limit = 50) {
  const ids = await getKV().zrange(keys.notificationIndexCreated, -limit, -1);
  return getDocuments(ids.reverse(), keys.notification);
}
