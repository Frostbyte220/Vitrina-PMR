"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Store,
  ArrowLeft,
  MessageSquareDot,
  ShoppingBag,
  Clock,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface Reply {
  id: string;
  senderType: "buyer" | "seller";
  senderName: string;
  body: string;
  createdAt: string;
}

interface Thread {
  id: string;
  threadToken: string;
  productId?: string | null;
  productName: string;
  senderName: string;
  senderContact: string;
  body: string;
  createdAt: string;
  store: { name: string; slug: string; avatarUrl: string | null };
  replies: Reply[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ru", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const { token } = useParams<{ token: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousRepliesCount = useRef<number>(0);

  const fetchThread = async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/messages/thread/${token}`);
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const newThread: Thread = data.message;

        // Если пришёл новый ответ от продавца в фоновом режиме — уведомляем
        if (
          isBackground &&
          newThread.replies.length > previousRepliesCount.current
        ) {
          const lastReply = newThread.replies[newThread.replies.length - 1];
          if (lastReply.senderType === "seller") {
            toast.success(`Новый ответ от ${newThread.store.name}!`, {
              icon: "💬",
              duration: 5000,
            });
          }
        }

        previousRepliesCount.current = newThread.replies.length;
        setThread(newThread);

        // Сохраняем в localStorage для страницы истории переписок
        try {
          const list = JSON.parse(localStorage.getItem("pmr_user_threads") || "[]");
          const existingIndex = list.findIndex((t: any) => t.token === newThread.threadToken);
          const entry = {
            token: newThread.threadToken,
            storeName: newThread.store.name,
            productName: newThread.productName,
            productId: newThread.productId,
            lastMessage:
              newThread.replies.length > 0
                ? newThread.replies[newThread.replies.length - 1].body
                : newThread.body,
            updatedAt: new Date().toISOString(),
          };
          if (existingIndex >= 0) {
            list[existingIndex] = entry;
          } else {
            list.unshift(entry);
          }
          localStorage.setItem("pmr_user_threads", JSON.stringify(list.slice(0, 30)));
        } catch {}
      }
    } catch {
      // Игнорируем сетевые сбои фонового опроса
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThread();

    // Автоматический опрос каждые 4 секунды для получения ответов в реальном времени
    const interval = setInterval(() => {
      fetchThread(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.replies.length]);

  const sendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/thread/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        await fetchThread(false);
      } else {
        toast.error("Не удалось отправить. Попробуйте снова.");
      }
    } catch {
      toast.error("Сетевая ошибка");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <MessageSquareDot className="h-8 w-8 text-rose-500 animate-bounce mx-auto" />
          <p className="text-gray-500 text-xs">Загрузка диалога...</p>
        </div>
      </div>
    );
  }

  if (notFound || !thread) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <MessageSquareDot className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold text-gray-800">Переписка не найдена</p>
        <p className="text-xs text-gray-500 text-center max-w-sm">
          Ссылка устарела, либо диалог был удалён.
        </p>
        <div className="flex gap-2">
          <Link
            href="/chat"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Все мои переписки
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
          >
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  // Объединяем первое сообщение покупателя со всеми последующими ответами
  const allMessages = [
    {
      id: thread.id,
      senderType: "buyer" as const,
      senderName: thread.senderName,
      body: thread.body,
      createdAt: thread.createdAt,
    },
    ...thread.replies,
  ];

  const lastMessage = allMessages[allMessages.length - 1];
  const isWaitingForSeller = lastMessage.senderType === "buyer";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Шапка диалога */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/chat"
              className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              title="Мои переписки"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            {/* Аватар продавца */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 overflow-hidden border border-rose-100">
              {thread.store.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thread.store.avatarUrl}
                  alt={thread.store.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-bold text-gray-900 text-sm leading-tight">
                  {thread.store.name}
                </p>
                {/* Бейдж статуса */}
                {isWaitingForSeller ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shrink-0">
                    <Clock className="h-2.5 w-2.5 animate-spin" />
                    Ждём ответ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                    <CheckCheck className="h-3 w-3" />
                    Ответил
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-gray-500 leading-tight mt-0.5">
                Товар: {thread.productName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {thread.productId && (
              <Link
                href={`/product/${thread.productId}`}
                className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Товар</span>
              </Link>
            )}

            <Link
              href={`/shop/${thread.store.slug}`}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              В магазин
            </Link>
          </div>
        </div>
      </header>

      {/* Информационный баннер реального времени */}
      <div className="border-b border-gray-100 bg-white/70 px-4 py-1.5 text-center">
        <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Диалог обновляется автоматически каждые несколько секунд</span>
          <button
            type="button"
            onClick={() => fetchThread(false)}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-gray-600 ml-1"
            title="Обновить вручную"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </p>
      </div>

      {/* Список сообщений диалога */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3.5">
          {allMessages.map((msg) => {
            const isBuyer = msg.senderType === "buyer";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBuyer ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                    isBuyer
                      ? "rounded-tr-md bg-rose-600 text-white"
                      : "rounded-tl-md bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <p
                    className={`text-[11px] font-bold mb-1 ${
                      isBuyer ? "text-rose-200" : "text-rose-600"
                    }`}
                  >
                    {isBuyer ? "Вы" : `${msg.senderName} (продавец)`}
                  </p>
                  <p className="leading-relaxed whitespace-pre-wrap break-words">
                    {msg.body}
                  </p>
                </div>
                <span className="mt-1 text-[10px] text-gray-400 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Поле отправки ответа */}
      <footer className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 pb-safe shadow-lg">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply();
                }
              }}
              placeholder="Напишите ответ или уточнение продавцу..."
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-rose-400 focus:bg-white focus:ring-1 focus:ring-rose-200 max-h-32 overflow-y-auto"
              style={{ minHeight: "44px" }}
            />
            <button
              type="button"
              disabled={!replyText.trim() || sending}
              onClick={sendReply}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:opacity-40 transition-all active:scale-95"
              title="Отправить"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span>Enter — отправить, Shift+Enter — новая строка</span>
            <Link href="/chat" className="hover:text-gray-600 transition-colors">
              Все диалоги →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
