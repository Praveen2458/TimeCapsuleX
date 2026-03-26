import { Redis } from 'ioredis';

let redisClient;

export const getRedisClient = () => {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL is not defined');
    }
    redisClient = new Redis(url, {
      maxRetriesPerRequest: null
    });
  }
  return redisClient;
};
