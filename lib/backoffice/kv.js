import { Redis } from '@upstash/redis';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const localStorePath = path.join(process.cwd(), '.data', 'backoffice-kv.json');

let instance;

function hasUpstashConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function shouldFailWithoutUpstash() {
  return process.env.VERCEL === '1' || process.env.DISABLE_LOCAL_KV_FALLBACK === 'true';
}

function parseStoredValue(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

class RedisKV {
  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      enableTelemetry: false,
    });
  }

  get provider() {
    return 'upstash-redis';
  }

  async getJson(key) {
    return parseStoredValue(await this.redis.get(key));
  }

  async setJson(key, value, options = {}) {
    const payload = JSON.stringify(value);
    if (options.ex) {
      await this.redis.set(key, payload, { ex: options.ex });
      return;
    }
    await this.redis.set(key, payload);
  }

  async del(key) {
    await this.redis.del(key);
  }

  async incr(key) {
    return this.redis.incr(key);
  }

  async expire(key, seconds) {
    await this.redis.expire(key, seconds);
  }

  async zadd(key, score, member) {
    await this.redis.zadd(key, { score, member });
  }

  async zrem(key, member) {
    await this.redis.zrem(key, member);
  }

  async zrange(key, start = 0, stop = -1) {
    return this.redis.zrange(key, start, stop);
  }
}

class FileKV {
  get provider() {
    return 'local-file';
  }

  async readState() {
    try {
      const raw = await readFile(localStorePath, 'utf8');
      const state = JSON.parse(raw);
      return {
        values: state.values || {},
        zsets: state.zsets || {},
        expirations: state.expirations || {},
      };
    } catch {
      return { values: {}, zsets: {}, expirations: {} };
    }
  }

  async writeState(state) {
    await mkdir(path.dirname(localStorePath), { recursive: true });
    await writeFile(localStorePath, JSON.stringify(state, null, 2));
  }

  async cleanExpired(state) {
    const now = Date.now();
    let changed = false;
    for (const [key, expiresAt] of Object.entries(state.expirations)) {
      if (expiresAt <= now) {
        delete state.values[key];
        delete state.expirations[key];
        changed = true;
      }
    }
    if (changed) await this.writeState(state);
  }

  async getJson(key) {
    const state = await this.readState();
    await this.cleanExpired(state);
    return state.values[key] ?? null;
  }

  async setJson(key, value, options = {}) {
    const state = await this.readState();
    state.values[key] = value;
    if (options.ex) {
      state.expirations[key] = Date.now() + options.ex * 1000;
    } else {
      delete state.expirations[key];
    }
    await this.writeState(state);
  }

  async del(key) {
    const state = await this.readState();
    delete state.values[key];
    delete state.expirations[key];
    await this.writeState(state);
  }

  async incr(key) {
    const state = await this.readState();
    await this.cleanExpired(state);
    const value = Number(state.values[key] || 0) + 1;
    state.values[key] = value;
    await this.writeState(state);
    return value;
  }

  async expire(key, seconds) {
    const state = await this.readState();
    state.expirations[key] = Date.now() + seconds * 1000;
    await this.writeState(state);
  }

  async zadd(key, score, member) {
    const state = await this.readState();
    const set = state.zsets[key] || [];
    const next = set.filter((entry) => entry.member !== member);
    next.push({ score, member });
    state.zsets[key] = next;
    await this.writeState(state);
  }

  async zrem(key, member) {
    const state = await this.readState();
    state.zsets[key] = (state.zsets[key] || []).filter((entry) => entry.member !== member);
    await this.writeState(state);
  }

  async zrange(key, start = 0, stop = -1) {
    const state = await this.readState();
    const sorted = (state.zsets[key] || [])
      .slice()
      .sort((a, b) => a.score - b.score || String(a.member).localeCompare(String(b.member)));
    const length = sorted.length;
    const from = start < 0 ? Math.max(length + start, 0) : start;
    const to = stop < 0 ? length + stop : stop;
    return sorted.slice(from, to + 1).map((entry) => entry.member);
  }
}

export function getKV() {
  if (!instance) {
    if (hasUpstashConfig()) {
      instance = new RedisKV();
    } else {
      if (shouldFailWithoutUpstash()) {
        throw new Error('Upstash KV is required. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
      }
      instance = new FileKV();
    }
  }
  return instance;
}

export function getStorageInfo() {
  const provider = hasUpstashConfig() ? 'upstash-redis' : 'local-file';
  const warnings = [];
  if (provider !== 'upstash-redis') {
    warnings.push('Upstash KV is not configured; local file storage is for development only.');
  }
  if (provider !== 'upstash-redis' && shouldFailWithoutUpstash()) {
    warnings.push('This environment is configured to reject non-Upstash storage.');
  }

  return {
    provider,
    productionReady: provider === 'upstash-redis',
    upstashConfigured: provider === 'upstash-redis',
    warnings,
  };
}
