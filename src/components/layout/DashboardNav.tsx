"use client";

import { LayoutDashboard, Package, Store, ShieldAlert, MessageSquareDot, ShoppingBag, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Товары", icon: Package },
  // Направляем кнопку "Магазин" на страницу кастомизации
  { href: "/dashboard/settings", label: "Магазин", icon: Store },
  { href: "/dashboard/messages", label: "Сообщения", icon: MessageSquareDot },
] as const;

interface DashboardNavProps {
  isAdmin?: boolean;
}

export function DashboardNav({ isAdmin = false }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="border-b border-border px-6 py-5">
          <Link href="/" prefetch={true} className="text-lg font-bold text-primary hover:text-rose-700 transition-colors">
            E-Vitrina PMR
          </Link>
          <p className="mt-0.5 text-xs text-text-muted">Кабинет продавца</p>

          {/* Быстрый переход в каталог */}
          <Link
            href="/"
            prefetch={true}
            className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200/80 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all group shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gray-500 group-hover:text-rose-600 transition-colors" />
              <span>В каталог товаров</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
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
              prefetch={true}
              className={cn(
                "flex flex-col items-center gap-1 px-2.5 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary font-semibold" : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}

        {/* Кнопка быстрого перехода в каталог на мобильном */}
        <Link
          href="/"
          prefetch={true}
          className="flex flex-col items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Каталог</span>
        </Link>
        
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
