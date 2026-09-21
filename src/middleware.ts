import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Маршруты, требующие авторизации
const PROTECTED_PATHS = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем: попадает ли маршрут под защиту
  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Проверяем JWT-токен из куки сессии
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Если токена нет — редиректим на страницу входа
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Сохраняем исходный URL, чтобы после входа вернуть пользователя обратно
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Конфигурация: middleware срабатывает ТОЛЬКО на защищённых маршрутах
export const config = {
  matcher: ["/dashboard/:path*"],
};
