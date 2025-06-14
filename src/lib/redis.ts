import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error('Please define the REDIS_URL environment variable');
}

let cached = (global as any).redis;
if (!cached) {
  cached = (global as any).redis = { client: null };
}

export function redisClient(): Redis {
  if (cached.client) return cached.client;
  cached.client = new Redis(REDIS_URL!);
  return cached.client;
}
