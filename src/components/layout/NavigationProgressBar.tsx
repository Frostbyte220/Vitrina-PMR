"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const stateRef = useRef({
    isLoading: false,
    trickleTimer: null as ReturnType<typeof setInterval> | null,
    watchdogTimer: null as ReturnType<typeof setTimeout> | null,
    resetTimer: null as ReturnType<typeof setTimeout> | null,
    startDelayTimer: null as ReturnType<typeof setTimeout> | null,
  });

  const prevUrlRef = useRef<string>("");

  // Завершение полосы: доводим до 100%, затем плавно скрываем
  const finish = useCallback(() => {
    const s = stateRef.current;
    if (!s.isLoading) return;

    if (s.trickleTimer) clearInterval(s.trickleTimer);
    if (s.watchdogTimer) clearTimeout(s.watchdogTimer);
    if (s.startDelayTimer) clearTimeout(s.startDelayTimer);
    if (s.resetTimer) clearTimeout(s.resetTimer);

    s.isLoading = false;

    // Доводим полосу до 100%
    setProgress(100);

    // Даем анимации (200ms) заполнить полосу до правого края, затем плавно скрываем
    s.resetTimer = setTimeout(() => {
      setVisible(false);
      s.resetTimer = setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  }, []);

  // Старт полосы загрузки
  const start = useCallback(() => {
    const s = stateRef.current;
    if (s.resetTimer) clearTimeout(s.resetTimer);
    if (s.startDelayTimer) clearTimeout(s.startDelayTimer);
    if (s.trickleTimer) clearInterval(s.trickleTimer);
    if (s.watchdogTimer) clearTimeout(s.watchdogTimer);

    s.isLoading = true;

    // Небольшая задержка 50мс: если переход моментальный из кэша — полоса не мигает
    s.startDelayTimer = setTimeout(() => {
      if (!s.isLoading) return;

      setVisible(true);
      setProgress(25);

      // Плавное продвижение полосы вперед
      s.trickleTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return prev;
          const diff = 92 - prev;
          const step = Math.max(1, diff * 0.18);
          return Math.min(92, prev + step);
        });
      }, 120);

      // 🛡️ ЖЕЛЕЗНЫЙ СТОРОЖЕВОЙ ТАЙМЕР (Watchdog):
      // Максимум 2.5 секунды! Полоса гарантированно завершится до 100% и исчезнет,
      // даже если страница зависла, переход отменен или произошла ошибка
      s.watchdogTimer = setTimeout(() => {
        if (s.isLoading) {
          finish();
        }
      }, 2500);
    }, 50);
  }, [finish]);

  // 1. Отслеживание смены маршрута через Next.js навигацию
  useEffect(() => {
    const currentUrl =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (prevUrlRef.current && prevUrlRef.current !== currentUrl) {
      finish();
    }
    prevUrlRef.current = currentUrl;
  }, [pathname, searchParams, finish]);

  // 2. Хук на вызовы History API (pushState/replaceState), которые вызывает Next.js роутер
  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      finish();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      finish();
      return originalReplaceState.apply(this, args);
    };

    const handlePopState = () => finish();
    const handlePageShow = () => finish();

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [finish]);

  // 3. Перехват кликов по внутренним ссылкам
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Игнорируем спец-клики (Ctrl+click, колесико, правая кнопка)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      // Если клик уже был отменен другим обработчиком
      if (e.defaultPrevented) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        target.hasAttribute("download") ||
        (targetAttr && targetAttr !== "_self")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Внешние ссылки не отслеживаем
        if (targetUrl.origin !== currentUrl.origin) return;

        // Если это точно та же самая страница без изменений query
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }

        start();
      } catch {
        // Невалидный URL — пропускаем
      }
    };

    // Слушаем в фазе всплытия (bubble), чтобы учесть e.preventDefault() внутри компонентов
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [start]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s.trickleTimer) clearInterval(s.trickleTimer);
      if (s.watchdogTimer) clearTimeout(s.watchdogTimer);
      if (s.startDelayTimer) clearTimeout(s.startDelayTimer);
      if (s.resetTimer) clearTimeout(s.resetTimer);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[99999] h-[2.5px] w-full"
    >
      <div
        className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 shadow-[0_0_8px_rgba(225,29,72,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? "width 200ms ease-out, opacity 250ms ease-out 100ms"
              : progress === 0
              ? "none"
              : "width 250ms ease-out, opacity 150ms ease-in",
        }}
      />
    </div>
  );
}
