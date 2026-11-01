"use client";

import { useEffect, useState } from "react";
import {
  MessageSquareDot,
  Check,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface Reply {
  id: string;
  senderType: "buyer" | "seller";
  senderName: string;
  body: string;
  createdAt: string;
}

interface Message {
  id: string;
  threadToken: string;
  productName: string;
  senderName: string;
  senderContact: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  replies: Reply[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageCard({
  msg,
  onMarkRead,
  onReply,
}: {
  msg: Message;
  onMarkRead: (id: string) => void;
  onReply: (id: string, body: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [sending, setSending] = useState(false);

  const allReplies = msg.replies;
  const hasReplies = allReplies.length > 0;
  const lastReply = hasReplies ? allReplies[allReplies.length - 1] : null;
  const needsReply = !lastReply || lastReply.senderType === "buyer";

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    await onReply(msg.id, replyText);
    setReplyText("");
    setShowReply(false);
    setSending(false);
  };

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        msg.isRead ? "bg-white border-gray-200" : "bg-rose-50 border-rose-200"
      }`}
    >
      {/* Заголовок */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 text-sm">{msg.senderName}</p>
              {!msg.isRead && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">НОВОЕ</span>
              )}
              {needsReply && hasReplies && (
                <span className="rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold">
                  Ждёт ответа
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{msg.senderContact}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`/chat/${msg.threadToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Открыть тред покупателя"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(msg.createdAt)}
            </span>
            {!msg.isRead && (
              <button
                onClick={() => onMarkRead(msg.id)}
                className="rounded-full bg-white border border-gray-200 p-1 hover:bg-gray-50 transition-colors"
                title="Отметить прочитанным"
              >
                <Check className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-rose-600 font-medium mt-2">Товар: {msg.productName}</p>

        {/* Первое сообщение покупателя */}
        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1.5">{msg.body}</p>

        {/* Кнопка раскрытия переписки */}
        {hasReplies && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Скрыть переписку" : `Переписка (${allReplies.length})`}
          </button>
        )}
      </div>

      {/* Треды ответов */}
      {expanded && hasReplies && (
        <div className="border-t border-gray-100 px-4 pb-3 pt-3 space-y-2.5 bg-gray-50/50">
          {allReplies.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                r.senderType === "seller"
                  ? "bg-rose-600 text-white ml-6"
                  : "bg-white border border-gray-200 text-gray-800 mr-6"
              }`}
            >
              <p className={`text-[10px] font-semibold mb-0.5 ${r.senderType === "seller" ? "text-rose-200" : "text-rose-500"}`}>
                {r.senderType === "seller" ? "Вы (продавец)" : r.senderName}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{r.body}</p>
              <p className={`text-[10px] mt-1 ${r.senderType === "seller" ? "text-rose-200" : "text-gray-400"}`}>
                {formatDate(r.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Блок ответа продавца */}
      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
        {!showReply ? (
          <button
            onClick={() => { setShowReply(true); setExpanded(true); }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              needsReply
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {needsReply ? "Ответить покупателю" : "Написать ещё"}
          </button>
        ) : (
          <div className="flex gap-2 items-end">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Ваш ответ покупателю..."
              rows={2}
              autoFocus
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
            />
            <div className="flex flex-col gap-1.5">
              <button
                disabled={!replyText.trim() || sending}
                onClick={handleSend}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white disabled:opacity-40 hover:bg-rose-700 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setShowReply(false); setReplyText(""); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/messages/${id}/read`, { method: "PATCH" });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
  };

  const sendReply = async (messageId: string, body: string) => {
    const res = await fetch(`/api/messages/${messageId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      await fetchMessages();
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquareDot className="h-6 w-6 text-rose-600" />
        <h1 className="text-xl font-bold text-gray-900">Сообщения от покупателей</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-rose-600 text-white text-xs font-bold px-2 py-0.5">
            {unreadCount}
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Загрузка...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquareDot className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Сообщений пока нет</p>
          <p className="text-sm mt-1">Покупатели смогут писать вам прямо с карточки товара</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onMarkRead={markRead}
              onReply={sendReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
