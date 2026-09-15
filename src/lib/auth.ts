import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers"; // <-- ДОБАВИЛИ ДЛЯ ПОЛУЧЕНИЯ IP
import { loginRateLimiter } from "@/lib/rate-limit"; // <-- ДОБАВИЛИ RATE LIMITER

// Расширяем типы NextAuth, чтобы TypeScript знал про id в сессии
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
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
        const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};