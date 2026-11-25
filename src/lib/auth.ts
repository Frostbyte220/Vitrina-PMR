import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers"; // <-- ДОБАВИЛИ ДЛЯ ПОЛУЧЕНИЯ IP
import { loginRateLimiter } from "@/lib/rate-limit"; // <-- ДОБАВИЛИ RATE LIMITER
import {
  ImpersonatorInfo,
  isAdminEmail,
  verifyImpersonationToken,
} from "@/lib/impersonation";

// Расширяем типы NextAuth, чтобы TypeScript знал про id и режим имперсонации в сессии
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      impersonatedBy?: ImpersonatorInfo | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    impersonatedBy?: ImpersonatorInfo | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "sneakerhub@example.com" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        // 1. ЗАЩИТА ОТ БРУТФОРСА (Ограничение количества попыток входа)
        const headerList = await headers();
        const forwardedFor = headerList.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
        const isAllowed = await loginRateLimiter.check(ip);
        if (!isAllowed) {
          throw new Error("Слишком много попыток входа. Подождите минуту.");
        }

        // Проверяем, что переданы и email, и пароль
        if (!credentials?.email || !credentials?.password) return null;

        // 2. Ищем пользователя в БД (ищем в нижнем регистре!)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

        // Если пользователя нет или у него нет пароля — отклоняем вход
        if (!user || !user.password) {
          return null;
        }

        // 3. ПРОВЕРКА ПАРОЛЯ с помощью bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null; // Пароли не совпали — отклоняем
        }

        // 4. Если всё верно, возвращаем данные для сессии
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.impersonatedBy = null;
      }

      if (trigger === "update") {
        // 1. Вход администратора в кабинет пользователя по подписанному токену
        if (typeof session?.impersonateToken === "string") {
          const payload = verifyImpersonationToken(session.impersonateToken);
          const currentActorEmail = token.impersonatedBy?.email || token.email;

          if (
            payload &&
            isAdminEmail(payload.adminEmail) &&
            isAdminEmail(currentActorEmail)
          ) {
            if (!token.impersonatedBy && token.id && token.email) {
              token.impersonatedBy = {
                id: String(token.id),
                email: String(token.email),
                name: token.name ?? null,
              };
            }
            token.id = payload.targetUserId;
            token.email = payload.targetEmail;
            token.name = payload.targetName;
          }
          return token;
        }

        // 2. Выход из режима имперсонации обратно в аккаунт администратора
        if (session?.stopImpersonate && token.impersonatedBy) {
          token.id = token.impersonatedBy.id;
          token.email = token.impersonatedBy.email;
          token.name = token.impersonatedBy.name ?? null;
          token.impersonatedBy = null;
          return token;
        }

        if (session?.email && !token.impersonatedBy) {
          token.email = session.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.email) {
          session.user.email = token.email as string;
        }
        if (token.name !== undefined) {
          session.user.name = token.name ?? null;
        }
        session.user.impersonatedBy = token.impersonatedBy ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
