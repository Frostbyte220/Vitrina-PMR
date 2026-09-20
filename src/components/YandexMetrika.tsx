"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Добавляем типизацию для Yandex Metrika в глобальный объект window
declare global {
  interface Window {
    ym?: (id: number, action: string, options?: any) => void;
  }
}

export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  // Отслеживаем переходы по страницам в SPA (Next.js App Router)
  useEffect(() => {
    if (ymId && typeof window !== "undefined" && window.ym) {
      window.ym(parseInt(ymId, 10), "hit", window.location.href);
    }
  }, [pathname, searchParams, ymId]);

  // Если ID не задан в .env, не рендерим скрипт (полезно для локальной разработки)
  if (!ymId) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${ymId}, "init", {
               clickmap:true,
               trackLinks:true,
               accurateTrackBounce:true,
               webvisor:true
          });
        `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`https://mc.yandex.ru/watch/${ymId}`} 
            style={{ position: "absolute", left: "-9999px" }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  );
}
