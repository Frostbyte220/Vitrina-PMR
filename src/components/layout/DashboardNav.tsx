"use client";

import { LayoutDashboard, Package, Store, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Товары", icon: Package },
  // Направляем кнопку "Магазин" на страницу кастомизации
  { href: "/dashboard/settings", label: "Магазин", icon: Store },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Проверяем, является ли текущий юзер Супер-Админом (через env)
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="border-b border-border px-6 py-5">
          <Link href="/" className="text-lg font-bold text-primary">
            E-Vitrina PMR
          </Link>
          <p className="mt-1 text-xs text-text-muted">Кабинет продавца</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-surface hover:text-text-main"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          {/* Кнопка Админки (Только для Админа) */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-gray-100" />
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-red-50 text-red-600"
                    : "text-red-500 hover:bg-red-50 hover:text-red-600"
                )}
              >
                <ShieldAlert className="h-5 w-5" />
                Админ-панель
              </Link>
            </>
          )}
        </nav>

        <div className="border-t border-border p-4">
          <SignOutButton variant="sidebar" />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border bg-white px-2 py-2 pb-safe md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-text-muted"
              )}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
        
        {/* Кнопка Админки на мобильном (Только для Админа) */}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
              pathname.startsWith("/admin") ? "text-red-600" : "text-red-400 hover:text-red-600"
            )}
          >
            <ShieldAlert className="h-6 w-6" />
            Админка
          </Link>
        )}

        <SignOutButton variant="mobile" />
      </nav>
    </>
  );
}