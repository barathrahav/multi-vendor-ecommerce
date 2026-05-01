import Redis from "ioredis";
import { logger } from "./logger";

const memoryCache = new Map<string, { value: string; expiresAt: number }>();
let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  redis.on("error", (error) => {
    logger.warn({ error }, "Redis unavailable, using memory cache fallback");
  });
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (redis) {
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    }

    const cached = memoryCache.get(key);

    if (!cached || cached.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }

    return JSON.parse(cached.value) as T;
  },

  async set<T>(key: string, value: T, ttlSeconds = 60) {
    const serialized = JSON.stringify(value);

    if (redis) {
      await redis.set(key, serialized, "EX", ttlSeconds);
      return;
    }

    memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(key: string) {
    if (redis) {
      await redis.del(key);
      return;
    }

    memoryCache.delete(key);
  },
};
