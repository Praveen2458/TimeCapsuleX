import { Redis } from 'ioredis';

let redisClient;

const normalizeRedisUrl = (rawValue) => {
  if (!rawValue) return '';

  // Handle common copy/paste issues from dashboards or chat.
  let cleaned = String(rawValue).trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
};

export const getRedisClient = () => {
  if (!redisClient) {
    const url = normalizeRedisUrl(process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL);
    if (!url) {
      throw new Error('REDIS_URL is not defined. Set REDIS_URL (or UPSTASH_REDIS_URL) in server/.env');
    }
    if (!url.startsWith('redis://') && !url.startsWith('rediss://')) {
      throw new Error('Invalid REDIS_URL. Expected redis:// or rediss:// URL from Upstash');
    }
    redisClient = new Redis(url, {
      maxRetriesPerRequest: null,
      // Give up reconnecting after 3 attempts (keeps local dev clean when
      // Upstash is not reachable). In production the host resolves fine.
      retryStrategy(times) {
        if (times > 3) {
          console.warn(`Redis: could not connect after ${times} attempts — background jobs disabled.`);
          return null; // stop retrying
        }
        return Math.min(times * 200, 1000); // exponential back-off
      },
      // Don't queue commands while offline — fail fast
      enableOfflineQueue: false,
    });

    redisClient.on('error', (err) => {
      // Suppress repeated ENOTFOUND / ECONNREFUSED noise in dev
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') return;
      console.error('Redis error:', err.message);
    });
  }
  return redisClient;
};

