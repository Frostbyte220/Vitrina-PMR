import crypto from "crypto";

export interface ImpersonatorInfo {
  id: string;
  email: string;
  name?: string | null;
}

export interface ImpersonationPayload {
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetEmail: string;
  targetName: string;
  exp: number;
}

const TOKEN_TTL_MS = 60 * 1000; // 60 секунд на активацию сессии

function getSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET не настроен для подписи токена входа");
  }
  return secret;
}

export function isAdminEmail(email?: string | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const candidate = email?.toLowerCase().trim();
  return Boolean(adminEmail && candidate && candidate === adminEmail);
}

/**
 * Создает краткоживущий HMAC-SHA256 токен для безопасного входа администратора
 * в кабинет зарегистрированного пользователя.
 */
export function createImpersonationToken(
  payload: Omit<ImpersonationPayload, "exp">
): string {
  const fullPayload: ImpersonationPayload = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Проверяет подпись и срок действия токена имперсонации.
 */
export function verifyImpersonationToken(
  token: string
): ImpersonationPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    if (!encodedPayload || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", getSigningSecret())
      .update(encodedPayload)
      .digest("base64url");

    const sigBuf = Buffer.from(signature, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as ImpersonationPayload;

    if (
      !parsed ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Date.now() ||
      !parsed.adminEmail ||
      !parsed.targetUserId ||
      !parsed.targetEmail
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
