import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { Toaster } from "react-hot-toast"; 
import { Footer } from "@/components/layout/Footer";
import { MobileTabBarLazy } from "@/components/layout/MobileTabBarLazy";
import { Suspense } from "react";
import { YandexMetrika } from "@/components/YandexMetrika";
import { SellerOnboardingWidgetLazy } from "@/components/onboarding/SellerOnboardingWidgetLazy";
import { FavoritesSyncProvider } from "@/components/providers/FavoritesSyncProvider";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import "@/app/globals.css";

// Подключаем Inter через next/font — шрифт загружается без FOUT (мигания)
// и без блокировки рендера. Vercel автоматически хостит его на своём CDN.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "E-Vitrina PMR — Магазины Тирасполя и Приднестровья",
    template: "%s | E-Vitrina PMR",
  },
  description:
    "E-Vitrina PMR — единый каталог товаров из локальных магазинов Приднестровья. Купить одежду, обувь, косметику и электронику во всех городах ПМР. Бесплатное размещение для продавцов.",
  keywords: [
    "E-Vitrina PMR",
    "магазины Тирасполя",
    "купить в Приднестровье",
    "интернет магазин ПМР",
    "купить Тирасполь",
    "магазины Бендеры",
    "шопинг Приднестровье",
    "E-Vitrina PMR",
    "локальные магазины ПМР",
  ],
  authors: [{ name: "E-Vitrina PMR", url: "https://www.e-vitrina.com" }],
  creator: "E-Vitrina PMR",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.e-vitrina.com"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://www.e-vitrina.com",
    siteName: "E-Vitrina PMR",
    title: "E-Vitrina PMR — Магазины Тирасполя и Приднестровья",
    description:
      "Единый каталог товаров из локальных магазинов Приднестровья. Одежда, обувь, косметика, электроника — всё в одном месте.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.e-vitrina.com",
  },
  verification: {
    yandex: "8194bb8ec4c51992",
    google: "kiVA4jMIGQbKnXWzIdvsrVMPbCig0OTLyFdUpIRD0mM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        {/* Предзагружаем критические домены для ускорения загрузки изображений товаров */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://via.placeholder.com" />
        <link rel="dns-prefetch" href="https://via.placeholder.com" />
      </head>
      <body
        // 🔥 Добавили flex и flex-col для того, чтобы футер всегда был внизу
        className="flex min-h-screen flex-col antialiased"
        suppressHydrationWarning={true}
      >
        <Suspense fallback={null}>
          <YandexMetrika />
        </Suspense>
        <AuthSessionProvider>
          {/* Синхронизация избранного с БД для авторизованных пользователей */}
          <FavoritesSyncProvider />
          {/* 🔥 Обернули children в flex-grow. padding-bottom на мобильных (чтобы контент не прятался за TabBar) */}
          <div className="flex-grow w-full min-w-0 pb-tabbar md:pb-0">
            {children}
          </div>

          {/* 🔥 Вставляем наш футер (тоже скрывается за таббаром, поэтому нужен padding) */}
          <div className="pb-tabbar md:pb-0">
            <Footer />
          </div>

          <SellerOnboardingWidgetLazy />
          <MobileTabBarLazy />
          
          {/* Toaster просто лежит рядом, он сам отрендерит уведомления поверх всего сайта */}
          <ScrollToTopButton />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
              },
            }} 
          />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
