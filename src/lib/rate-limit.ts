import { Redis } from '@upstash/redis';

const getRedis = () => {
  // Поддерживаем все возможные имена переменных, которые Vercel / Upstash создают автоматически
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_KV_URL ||
    process.env.KV_REST_API_URL ||
    process.env.KV_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.STORAGE_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.STORAGE_TOKEN;

  // Проверяем, что URL — реальный (начинается с https://), а не заглушка
  if (url && token && url.startsWith('https://')) {
    return new Redis({ url, token });
  }

  // Fallback: ищем динамически любую переменную Upstash REST URL / TOKEN
  if (typeof process !== 'undefined' && process.env) {
    const dynamicUrlKey = Object.keys(process.env).find(
      (k) => (k.includes('UPSTASH') || k.includes('KV')) && (k.endsWith('_URL') || k.includes('REST_API_URL')) && process.env[k]?.startsWith('https://')
    );
    const dynamicTokenKey = Object.keys(process.env).find(
      (k) => (k.includes('UPSTASH') || k.includes('KV')) && (k.endsWith('_TOKEN') || k.includes('REST_API_TOKEN')) && !k.includes('READ_ONLY')
    );
    if (dynamicUrlKey && dynamicTokenKey) {
      const dynamicUrl = process.env[dynamicUrlKey];
      const dynamicToken = process.env[dynamicTokenKey];
      if (dynamicUrl && dynamicToken) {
        return new Redis({ url: dynamicUrl, token: dynamicToken });
      }
    }
  }

  // ⚠️ ВАЖНО: Без Redis rate limiting не работает на Vercel (serverless = нет общей памяти)
  if (process.env.NODE_ENV === 'production') {
    console.warn('[RateLimit] ВНИМАНИЕ: Redis не настроен! Rate limiting работает только в памяти и неэффективен на Vercel. Добавьте UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN.');
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

// 10 созданий/редактирований товаров в минуту (защита от спама)
export const productRateLimiter = new RateLimiter(10, 60 * 1000, 'product');
// 5 обновлений магазина в минуту
export const storeRateLimiter = new RateLimiter(5, 60 * 1000, 'store');
// 5 жалоб в минуту на один IP (защита от спама жалобами)
export const reportRateLimiter = new RateLimiter(5, 60 * 1000, 'report');
// 3 запроса сброса пароля в минуту на один IP
export const forgotPasswordRateLimiter = new RateLimiter(3, 60 * 1000, 'forgot-password');
