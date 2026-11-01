"use client";

import { useEffect, useState } from "react";
import { MessageSquareDot, Check, Clock } from "lucide-react";

interface Message {
  id: string;
  productName: string;
  senderName: string;
  senderContact: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  useEffect(() => {
    fetchMessages();
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/messages/${id}/read`, { method: "PATCH" });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
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
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl border p-4 transition-colors ${
                msg.isRead ? "bg-white border-gray-200" : "bg-rose-50 border-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{msg.senderName}</p>
                  <p className="text-xs text-gray-500">{msg.senderContact}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(msg.createdAt)}
                  </span>
                  {!msg.isRead && (
                    <button
                      onClick={() => markRead(msg.id)}
                      className="rounded-full bg-white border border-gray-200 p-1 hover:bg-gray-50 transition-colors"
                      title="Отметить прочитанным"
                    >
                      <Check className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-rose-600 font-medium mb-1">Товар: {msg.productName}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
