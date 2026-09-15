import { Redis } from '@upstash/redis';

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // Проверяем, что URL — реальный (начинается с https://), а не заглушка
  if (url && token && url.startsWith('https://')) {
    return new Redis({ url, token });
  }
  return null;
};

const redis = getRedis();

export class RateLimiter {
  private map = new Map<string, { count: number; lastReset: number }>();
  private limit: number;
  private windowMs: number;
  private prefix: string;

  constructor(limit: number, windowMs: number, prefix: string = 'ratelimit') {
    this.limit = limit;
    this.windowMs = windowMs;
    this.prefix = prefix;
  }

  async check(ip: string): Promise<boolean> {
    if (redis) {
      try {
        const key = `${this.prefix}:${ip}`;
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.pexpire(key, this.windowMs);
        }
        return count <= this.limit;
      } catch (e) {
        console.error("Redis rate limit error, falling back to memory:", e);
        // Fallback to memory if redis throws
      }
    }

    // In-memory fallback
    const now = Date.now();
    const record = this.map.get(ip);

    if (!record) {
      this.map.set(ip, { count: 1, lastReset: now });
      return true;
    }

    if (now - record.lastReset > this.windowMs) {
      this.map.set(ip, { count: 1, lastReset: now });
      return true;
    }

    if (record.count >= this.limit) {
      return false;
    }

    record.count += 1;
    return true;
  }
}

// Лимиты: 
// 5 попыток входа в минуту
export const loginRateLimiter = new RateLimiter(5, 60 * 1000, 'login'); 
// 3 регистрации в минуту
export const registerRateLimiter = new RateLimiter(3, 60 * 1000, 'register');