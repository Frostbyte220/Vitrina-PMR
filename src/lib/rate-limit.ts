export class RateLimiter {
  private map = new Map<string, { count: number; lastReset: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(ip: string): boolean {
    const now = Date.now();
    const record = this.map.get(ip);

    // Если IP зашел впервые
    if (!record) {
      this.map.set(ip, { count: 1, lastReset: now });
      return true;
    }

    // Если время блокировки прошло (окно сбросилось)
    if (now - record.lastReset > this.windowMs) {
      this.map.set(ip, { count: 1, lastReset: now });
      return true;
    }

    // Если превышен лимит
    if (record.count >= this.limit) {
      return false;
    }

    // Увеличиваем счетчик попыток
    record.count += 1;
    return true;
  }
}

// Лимиты: 
// 5 попыток входа в минуту
export const loginRateLimiter = new RateLimiter(5, 60 * 1000); 
// 3 регистрации в минуту
export const registerRateLimiter = new RateLimiter(3, 60 * 1000);