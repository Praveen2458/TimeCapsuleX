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
      maxRetriesPerRequest: null
    });
  }
  return redisClient;
};
