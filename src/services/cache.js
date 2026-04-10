import crypto from 'node:crypto';
import { redis } from '../lib/redis.js';

export function makeHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function getJson(key) {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

export async function setJson(key, value, ttlSeconds = 600) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}
