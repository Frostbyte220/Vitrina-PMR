import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { Toaster } from "react-hot-toast"; 
import { ToastProvider } from "@/components/ui/Toast"; 
import { Footer } from "@/components/layout/Footer";
import { MobileTabBarLazy } from "@/components/layout/MobileTabBarLazy";
import { Suspense } from "react";
import { YandexMetrika } from "@/components/YandexMetrika";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vitrina PMR",
    template: "%s | Vitrina PMR",
  },
  description:
    "Локальный маркетплейс-агрегатор. Новые коллекции от местных брендов в Тирасполе.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
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
            <div className="flex-grow pb-16 md:pb-0">
              {children}
            </div>

            {/* 🔥 Вставляем наш футер (тоже скрывается за таббаром, поэтому нужен padding) */}
            <div className="pb-16 md:pb-0">
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