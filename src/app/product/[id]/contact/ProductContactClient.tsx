"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Store,
  CheckCircle2,
  Send,
  MessageCircle,
  Phone,
  Instagram,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { getAvailabilityInfo } from "@/lib/availability";
import { trackEvent } from "@/lib/analytics";

interface ProductContactClientProps {
  product: {
    id: string;
    title: string;
    price: number;
    oldPrice?: number | null;
    images: string[];
    sizes: string[];
    availability?: string | null;
    category?: string | null;
  };
  store: {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    phone?: string | null;
    viber?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    cities?: string[];
  };
}

export function ProductContactClient({ product, store }: ProductContactClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSize = searchParams.get("size") || (product.sizes.length === 1 ? product.sizes[0] : "");

  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [senderName, setSenderName] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  // Восстанавливаем имя и контакт из localStorage, если покупатель уже писал ранее
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("pmr_buyer_name");
      const savedContact = localStorage.getItem("pmr_buyer_contact");
      if (savedName) setSenderName(savedName);
      if (savedContact) setSenderContact(savedContact);
    } catch {}
  }, []);

  // Предварительно заполняем текст сообщения при смене размера
  useEffect(() => {
    const sizeInfo = selectedSize ? `, размер: ${selectedSize}` : "";
    if (!body || body.startsWith("Здравствуйте! Интересует товар")) {
      setBody(`Здравствуйте! Интересует товар «${product.title}»${sizeInfo}. Подскажите, пожалуйста, есть ли в наличии и как можно получить?`);
    }
  }, [selectedSize, product.title]);

  const availInfo = getAvailabilityInfo(product.availability);
  const formattedPrice = formatPrice(product.price);
  const mainImage = product.images?.[0] || "/placeholder.png";

  // Подготавливаем контакты для внешних мессенджеров
  const cleanTelegram = (store.telegram || "").trim().replace(/^@+/, "");
  const cleanInstagram = (store.instagram || "").trim().replace(/^@+/, "").replace(/https?:\/\/(www\.)?instagram\.com\//, "");
  const rawViberOrPhone = (store.viber || store.phone || "").trim();

  let viberDigits = rawViberOrPhone.replace(/[^\d]/g, "");
  if (viberDigits.length === 8 && viberDigits.startsWith("77")) {
    viberDigits = "373" + viberDigits;
  } else if (viberDigits.length === 9 && viberDigits.startsWith("077")) {
    viberDigits = "373" + viberDigits.slice(1);
  } else if (viberDigits.startsWith("0") && viberDigits.length >= 9) {
    viberDigits = "373" + viberDigits.slice(1);
  }

  const viberUrl = viberDigits
    ? `viber://chat?number=%2B${viberDigits}&draft=${encodeURIComponent(body || `Здравствуйте! По поводу товара «${product.title}»`)}`
    : null;

  const telegramUrl = cleanTelegram
    ? `https://t.me/${cleanTelegram}?text=${encodeURIComponent(body || `Здравствуйте! По поводу товара «${product.title}»`)}`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderContact.trim() || !body.trim() || sending) return;

    setSending(true);

    try {
      // Запоминаем данные покупателя для удобства будущих покупок
      localStorage.setItem("pmr_buyer_name", senderName.trim());
      localStorage.setItem("pmr_buyer_contact", senderContact.trim());
    } catch {}

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          productId: product.id,
          productName: `${product.title}${selectedSize ? ` (${selectedSize})` : ""}`,
          senderName: senderName.trim(),
          senderContact: senderContact.trim(),
          body: body.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.threadToken;
        setCreatedToken(token);
        setIsSuccess(true);
        toast.success("Сообщение отправлено продавцу!");
        trackEvent("contact_seller", { product: product.title, channel: "onsite_dedicated_page" });

        // Сохраняем тред в локальное хранилище переписок
        try {
          const list = JSON.parse(localStorage.getItem("pmr_user_threads") || "[]");
          list.unshift({
            token,
            storeName: store.name,
            productName: product.title,
            lastMessage: body.trim(),
            updatedAt: new Date().toISOString(),
          });
          localStorage.setItem("pmr_user_threads", JSON.stringify(list.slice(0, 30)));
        } catch {}

        // Мягко перенаправляем на страницу диалога через секунду
        setTimeout(() => {
          if (token) router.push(`/chat/${token}`);
        }, 1200);
      } else {
        toast.error("Не удалось отправить сообщение. Попробуйте снова.");
      }
    } catch {
      toast.error("Сетевая ошибка. Проверьте интернет.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Шапка страницы */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            href={`/product/${product.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад к товару</span>
          </Link>

          <Link
            href={`/shop/${store.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Витрина {store.name}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Баннер магазина */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-xs border border-gray-100">
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 overflow-hidden border border-rose-100">
            {store.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.avatarUrl} alt={store.name} className="h-full w-full object-cover" />
            ) : (
              <Store className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 truncate">{store.name}</h2>
              {store.isVerified && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  Проверен
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {store.cities && store.cities.length > 0 ? store.cities.join(", ") : "Приднестровье"} · Обычно отвечает быстро
            </p>
          </div>
        </div>

        {/* Карточка товара, по поводу которого пишем */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-xs border border-gray-100">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200/60">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {availInfo.label}
            </span>
            <h1 className="mt-1 font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
              {product.title}
            </h1>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-bold text-rose-600">{formattedPrice}</span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Выбор размера, если есть */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-xs border border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Интересующий размер: {selectedSize ? <span className="text-rose-600 font-bold">{selectedSize}</span> : <span className="text-gray-400 font-normal">не выбран</span>}
              </label>
              {selectedSize && (
                <button
                  type="button"
                  onClick={() => setSelectedSize("")}
                  className="text-[11px] text-gray-400 hover:text-gray-600"
                >
                  Снять выбор
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                      isSelected
                        ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Форма отправки сообщения на сайте */}
        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-7 w-7 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">Сообщение успешно отправлено!</h3>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
              Продавец видит ваш вопрос в личном кабинете. Вы можете вести переписку прямо на сайте в режиме реального времени.
            </p>
            {createdToken && (
              <div className="pt-2">
                <Link
                  href={`/chat/${createdToken}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Перейти в диалог прямо сейчас →</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-gray-100 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Написать продавцу на сайте</h3>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                  Внутренний чат
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Сообщение появится в личном кабинете продавца. Вы сможете продолжить переписку и увидеть ответ прямо здесь.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ваше имя <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Как к вам обращаться?"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Телефон или Email для связи <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+373 77X XX XXX или email@example.com"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-200"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Нужен продавцу, если он захочет перезвонить или написать вам напрямую.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ваш вопрос или сообщение <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Задайте вопрос о наличии, размерах, доставке или примерке..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-200 resize-none leading-relaxed"
                />
              </div>

              {/* Быстрые шаблоны вопросов */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  "Есть ли в наличии?",
                  "Где можно примерить?",
                  "Есть ли доставка по ПМР?",
                  "Можно забронировать на сегодня?",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setBody((prev) => (prev ? `${prev} ${chip}` : chip));
                    }}
                    className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 text-[11px] font-medium transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={sending || !senderName.trim() || !senderContact.trim() || !body.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                <Send className="h-4 w-4" />
                <span>{sending ? "Отправляем сообщение..." : "Отправить сообщение и открыть чат"}</span>
              </button>
            </form>
          </div>
        )}

        {/* Альтернативные способы связи через мессенджеры */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-gray-100 space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Или связаться напрямую в мессенджерах:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Viber */}
            {viberUrl && (
              <a
                href={viberUrl}
                className="flex items-center gap-3 rounded-xl bg-[#7360F2] px-3.5 py-3 text-white hover:bg-[#6350E2] transition-colors active:scale-[0.98] shadow-xs"
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold leading-tight">Написать в Viber</p>
                  <p className="text-[11px] text-white/80 truncate leading-tight mt-0.5">
                    {store.viber || store.phone}
                  </p>
                </div>
              </a>
            )}

            {/* Telegram */}
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-[#229ED9] px-3.5 py-3 text-white hover:bg-[#1E8EC4] transition-colors active:scale-[0.98] shadow-xs"
              >
                <Send className="h-5 w-5 shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold leading-tight">Написать в Telegram</p>
                  <p className="text-[11px] text-white/80 truncate leading-tight mt-0.5">
                    @{cleanTelegram}
                  </p>
                </div>
              </a>
            )}

            {/* Instagram Direct */}
            {cleanInstagram && (
              <a
                href={`https://ig.me/m/${cleanInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-3.5 py-3 text-white hover:opacity-95 transition-opacity active:scale-[0.98] shadow-xs"
              >
                <Instagram className="h-5 w-5 shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold leading-tight">Instagram Direct</p>
                  <p className="text-[11px] text-white/80 truncate leading-tight mt-0.5">
                    @{cleanInstagram}
                  </p>
                </div>
              </a>
            )}

            {/* Позвонить */}
            {store.phone && (
              <a
                href={`tel:${store.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 rounded-xl bg-emerald-600 px-3.5 py-3 text-white hover:bg-emerald-700 transition-colors active:scale-[0.98] shadow-xs"
              >
                <Phone className="h-5 w-5 shrink-0" />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold leading-tight">Позвонить (IDC)</p>
                  <p className="text-[11px] text-white/80 truncate leading-tight mt-0.5">
                    {store.phone}
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Гарантия безопасности */}
        <div className="flex items-start gap-3 rounded-xl bg-gray-100/70 p-3.5 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
          <p className="leading-relaxed">
            E-Vitrina PMR обеспечивает прямую связь с проверенными магазинами без скрытых комиссий. Вы общаетесь непосредственно с продавцом.
          </p>
        </div>
      </main>
    </div>
  );
}
