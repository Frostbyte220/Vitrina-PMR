"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Heart, Store, User, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

export function MobileTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const cartCount = useCartStore((s) => s.getTotalCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Не показываем бар на страницах авторизации и дэшборде (чтобы не мешать)
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/product")
  ) {
    return null;
  }

  const cities = searchParams.get("cities");
  const homeHref = cities ? `/?cities=${encodeURIComponent(cities)}` : "/";
  const shopsHref = cities ? `/shops?cities=${encodeURIComponent(cities)}` : "/shops";

  const tabs = [
    { name: "Главная", href: homeHref, match: "/" as const, icon: Home },
    { name: "Избранное", href: "/favorites", match: "/favorites" as const, icon: Heart },
    {
      name: "Корзина",
      href: "/cart",
      match: "/cart" as const,
      icon: ShoppingBag,
      badge: mounted && cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : null,
    },
    { name: "Магазины", href: shopsHref, match: "/shops" as const, icon: Store },
    { name: "Профиль", href: session ? "/dashboard" : "/login", match: "/dashboard" as const, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white pb-safe md:hidden">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = tab.match === "/" ? pathname === "/" : pathname.startsWith(tab.match);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-300 ${
                isActive ? "text-rose-700" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 top-1 bottom-3 mx-auto w-12 rounded-full bg-rose-50"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative">
                <tab.icon
                  className={`relative z-10 h-6 w-6 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 z-20 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="relative z-10 text-[10px] font-medium leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
