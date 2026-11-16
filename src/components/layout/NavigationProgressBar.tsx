"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Сброс и мгновенное завершение индикатора при смене маршрута
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Плавное замедление по мере приближения к 90%
          const increment = Math.max(1, (90 - prev) * 0.15);
          return Math.min(90, prev + increment);
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Игнорируем клики со специальными клавишами или не левой кнопкой
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Только внутренние переходы без target="_blank" и не якорные ссылки
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        href !== "#" &&
        (!targetAttr || targetAttr === "_self")
      ) {
        // Проверяем, не переходим ли мы на точно такой же URL
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setProgress(25);
          setLoading(true);
        }
      }
    };

    const handlePopState = () => {
      setProgress(30);
      setLoading(true);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[99999] h-[2.5px] w-full"
    >
      <div
        className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(225,29,72,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}
