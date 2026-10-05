import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { Toaster } from "react-hot-toast"; 
import { ToastProvider } from "@/components/ui/Toast"; 
import { Footer } from "@/components/layout/Footer";
import { MobileTabBarLazy } from "@/components/layout/MobileTabBarLazy";
import { Suspense } from "react";
import { YandexMetrika } from "@/components/YandexMetrika";
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
    default: "Витрина ПМР — Магазины Тирасполя и Приднестровья",
    template: "%s | Vitrina PMR",
  },
  description:
    "Vitrina PMR — единый каталог товаров из локальных магазинов Приднестровья. Купить одежду, обувь, косметику и электронику во всех городах ПМР. Бесплатное размещение для продавцов.",
  keywords: [
    "витрина ПМР",
    "магазины Тирасполя",
    "купить в Приднестровье",
    "интернет магазин ПМР",
    "купить Тирасполь",
    "магазины Бендеры",
    "шопинг Приднестровье",
    "Vitrina PMR",
    "локальные магазины ПМР",
  ],
  authors: [{ name: "Vitrina PMR", url: "https://vitrina-pmr.vercel.app" }],
  creator: "Vitrina PMR",
  metadataBase: new URL("https://vitrina-pmr.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://vitrina-pmr.vercel.app",
    siteName: "Vitrina PMR",
    title: "Витрина ПМР — Магазины Тирасполя и Приднестровья",
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
  verification: {
    google: "SMOT2_G-Ry9W1_VqCOdQRWY6mqD_-d7Ci48fMUotqek",
    yandex: "3be08a782b40a74f",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      {/* Preconnect к внешним ресурсам — браузер установит TCP-соединение заранее */}
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
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
          <ToastProvider>
            
            {/* 🔥 Обернули children в flex-grow. padding-bottom на мобильных (чтобы контент не прятался за TabBar) */}
            <div className="flex-grow pb-tabbar md:pb-0">
              {children}
            </div>

            {/* 🔥 Вставляем наш футер (тоже скрывается за таббаром, поэтому нужен padding) */}
            <div className="pb-tabbar md:pb-0">
              <Footer />
            </div>

            <MobileTabBarLazy />
          </ToastProvider>
          
          {/* Toaster просто лежит рядом, он сам отрендерит уведомления поверх всего сайта */}
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