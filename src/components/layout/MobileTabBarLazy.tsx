"use client";

import dynamic from "next/dynamic";

// Ленивая загрузка MobileTabBar — содержит framer-motion (тяжёлый пакет).
// Выносим в клиентский компонент, чтобы использовать ssr: false
const MobileTabBar = dynamic(
  () => import("@/components/layout/MobileTabBar").then((m) => m.MobileTabBar),
  { ssr: false }
);

export function MobileTabBarLazy() {
  return <MobileTabBar />;
}
