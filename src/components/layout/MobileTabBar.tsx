"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Store, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Не показываем бар на страницах авторизации и дэшборде (чтобы не мешать)
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  const tabs = [
    { name: "Главная", href: "/", icon: Home },
    { name: "Избранное", href: "/favorites", icon: Heart },
    { name: "Магазины", href: "/shops", icon: Store },
    { name: "Профиль", href: session ? "/dashboard" : "/login", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white pb-safe md:hidden">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
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
              <tab.icon
                className={`relative z-10 h-6 w-6 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
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
