"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareDot,
  ArrowLeft,
  Store,
  Clock,
  Trash2,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

interface StoredThread {
  token: string;
  storeName: string;
  productName: string;
  productId?: string;
  lastMessage: string;
  updatedAt: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MyChatsPage() {
  const [threads, setThreads] = useState<StoredThread[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem("pmr_user_threads") || "[]");
      if (Array.isArray(stored)) {
        setThreads(stored);
      }
    } catch {}
  }, []);

  const handleDelete = (token: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const filtered = threads.filter((t) => t.token !== token);
    setThreads(filtered);
    try {
      localStorage.setItem("pmr_user_threads", JSON.stringify(filtered));
    } catch {}
  };

  const handleClearAll = () => {
    if (window.confirm("Очистить список ваших сохранённых переписок на этом устройстве?")) {
      setThreads([]);
      try {
        localStorage.removeItem("pmr_user_threads");
      } catch {}
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-xs">Загрузка переписок...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Шапка */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>На главную</span>
          </Link>

          <h1 className="text-base font-bold text-gray-900">Мои переписки</h1>

          {threads.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="Очистить историю"
            >
              Очистить
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {threads.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <MessageSquareDot className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Нет сохранённых переписок</h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Вы можете задавать вопросы продавцам прямо со страниц интересующих товаров. Здесь будут сохраняться все ваши диалоги и ответы продавцов.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Перейти в каталог товаров</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              Ваши активные диалоги ({threads.length})
            </p>

            {threads.map((t) => (
              <Link
                key={t.token}
                href={`/chat/${t.token}`}
                className="group flex items-start justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Store className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {t.storeName}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(t.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-rose-600 truncate mt-0.5">
                      {t.productName}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {t.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(t.token, e)}
                    className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Удалить из списка"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
