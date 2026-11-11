"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Phone,
  Send,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Plus,
  Bell,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const CITIES = [
  "Тирасполь",
  "Бендеры",
  "Рыбница",
  "Дубоссары",
  "Григориополь",
  "Слободзея",
  "Каменка",
  "Днестровск",
];

type StoreFormData = {
  name: string;
  slug: string;
  description: string;
  instagram: string;
  phone: string;
  telegram: string;
  viber: string;
  cities: string[];
};

interface StoreSettingsFormProps {
  initialData: any;
  isNew?: boolean;
}

export function StoreSettingsForm({ initialData, isNew = false }: StoreSettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState<string>(initialData?.coverUrl || "");
  const [uploadingType, setUploadingType] = useState<"avatar" | "cover" | null>(null);

  // Telegram Notifications State
  const [tgChatId, setTgChatId] = useState<string | null>(initialData?.telegramChatId || null);
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [isDisconnectingTg, setIsDisconnectingTg] = useState(false);
  const [isCheckingTg, setIsCheckingTg] = useState(false);

  const cleanInsta = (initialData?.instagram || initialData?.slug || "").replace(/^@/, "");
  const hasNoCities = !initialData?.cities || initialData.cities.length === 0;

  const { register, handleSubmit, watch, setValue } = useForm<StoreFormData>({
    defaultValues: {
      name: initialData?.name || "",
      slug: cleanInsta,
      description: initialData?.description || "",
      instagram: cleanInsta,
      phone: initialData?.phone || "",
      telegram: (initialData?.telegram || "").replace(/^@/, ""),
      viber: initialData?.viber || "",
      cities: initialData?.cities || [],
    },
  });

  const selectedSlug = watch("instagram") || cleanInsta;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "evitrina_notify_bot";
  const telegramConnectUrl = initialData?.id
    ? `https://t.me/${botUsername}?start=${initialData.id}`
    : `https://t.me/${botUsername}`;

  const handleTestTelegram = async () => {
    setIsTestingTg(true);
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🔔 Тестовое уведомление отправлено в Telegram! Проверьте чат с ботом.");
      } else {
        toast.error(data.error || "Не удалось отправить сообщение");
      }
    } catch {
      toast.error("Ошибка при отправке");
    } finally {
      setIsTestingTg(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!confirm("Вы уверены, что хотите отключить уведомления в Telegram?")) return;
    setIsDisconnectingTg(true);
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      if (res.ok) {
        setTgChatId(null);
        toast.success("Telegram-уведомления отключены");
      } else {
        toast.error("Не удалось отключить");
      }
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setIsDisconnectingTg(false);
    }
  };

  const handleCheckTelegram = async () => {
    setIsCheckingTg(true);
    try {
      const res = await fetch("/api/telegram");
      const data = await res.json();
      if (data.isConnected) {
        setTgChatId("connected");
        toast.success("✅ Telegram успешно подключён!");
      } else {
        toast("Бот пока не получил команду /start. Нажмите кнопку «Подключить» и нажмите START в Telegram", {
          icon: "ℹ️",
        });
      }
    } catch {
      toast.error("Ошибка проверки");
    } finally {
      setIsCheckingTg(false);
    }
  };

  const onSubmit: SubmitHandler<StoreFormData> = async (data) => {
    setIsSaving(true);

    try {
      const cleanInstaForm = data.instagram.replace(/^@/, "").trim();
      const cleanTelegram = (data.telegram || "").replace(/^@/, "").trim();
      const payload = { 
        ...data, 
        instagram: cleanInstaForm,
        telegram: cleanTelegram,
        viber: data.viber?.trim() || "",
        phone: data.phone?.trim() || "",
        slug: cleanInstaForm, 
        avatarUrl, 
        coverUrl,
      };

      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Ошибка при сохранении");
      }

      toast.success("Настройки успешно сохранены! 🎉");
      setJustSaved(true);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const isAvatar = type === "avatar";
    const label = isAvatar ? "логотип" : "обложку";

    setUploadingType(type);
    const toastId = toast.loading(`Сжатие и загрузка ${label}а...`);

    try {
      const url = await uploadToCloudinary(file, {
        maxDimension: isAvatar ? 512 : 1920,
        quality: 0.85,
      });

      if (isAvatar) setAvatarUrl(url);
      if (!isAvatar) setCoverUrl(url);

      toast.success(`${isAvatar ? "Логотип" : "Обложка"} успешно обновлена!`, { id: toastId });
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      toast.error(err.message || `Не удалось загрузить ${label}`, { id: toastId });
    } finally {
      setUploadingType(null);
      e.target.value = ""; 
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const nextVal = val.slice(0, start) + "\n" + val.slice(end);

      setValue("description", nextVal, { shouldValidate: true, shouldDirty: true });
      textarea.value = nextVal;

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* ── Баннер онбординга для новых продавцов или магазинов без городов ── */}
      {(isNew || hasNoCities) && !justSaved && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-blue-950">
                {isNew ? "Поздравляем с регистрацией магазина! 🎉" : "Завершите базовую настройку витрины"}
              </h3>
              <p className="mt-1 text-sm text-blue-800">
                Чтобы покупатели находили ваши товары в фильтрах по городам Приднестровья и могли сделать заказ:
              </p>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-blue-900 font-medium">
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">1</span>
                  <span>Проверьте название и Instagram-ссылку вашего магазина</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">2</span>
                  <span>Укажите хотя бы один контакт (телефон IDC, Telegram или Viber)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">3</span>
                  <span><b>Обязательно отметьте города доставки/работы</b> в блоке ниже</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Баннер успешного сохранения с переходом к работе ── */}
      {justSaved && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-950">
                  Настройки успешно сохранены!
                </h3>
                <p className="mt-0.5 text-sm text-emerald-800">
                  Витрина вашего магазина настроена и готова к приему клиентов.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <span>В панель управления</span>
              </Link>
              <Link
                href="/dashboard/new"
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить товар</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Оформление витрины ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-text-main">Оформление витрины</h2>
        
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-main">Логотип / Аватар</label>
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
              {avatarUrl ? (
                <Image fill sizes="(max-width: 768px) 100vw, 20vw" src={avatarUrl} alt="Avatar" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">Пусто</div>
              )}
              {uploadingType === "avatar" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white font-medium text-center px-1">Сжатие и загрузка...</div>
              )}
            </div>
            <label className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
              Загрузить лого
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "avatar")} />
            </label>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-medium text-text-main">Обложка магазина</label>
            <div className="relative h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              {coverUrl ? (
                <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={coverUrl} alt="Cover" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">Рекомендуемый размер 1200x400</div>
              )}
              {uploadingType === "cover" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white font-medium">Сжатие и загрузка...</div>
              )}
            </div>
            <label className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
              Загрузить обложку
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
            </label>
          </div>
        </div>
      </section>

      {/* ── Основная информация ── */}
      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-text-main">Основная информация</h2>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-main">Название магазина *</label>
          <input 
            {...register("name", { required: true })}
            type="text" 
            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Например: Свечи ПМР" 
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-main">Ник в Instagram (Ссылка на витрину) *</label>
          <div className="flex items-center">
            <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-500">vitrina.pmr/shop/</span>
            <input 
              {...register("instagram", { 
                required: true,
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/@/g, "");
                }
              })}
              type="text" 
              className="w-full rounded-r-lg border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="svechi_pmr" 
            />
          </div>
          <span className="text-xs text-text-muted">
            Эта ссылка будет вести на вашу витрину: <b>/shop/{selectedSlug || "username"}</b>. Скопируйте её и вставьте в шапку профиля Instagram.
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-main">Описание</label>
          <textarea 
            {...register("description")}
            rows={4} 
            onKeyDown={handleDescriptionKeyDown}
            className="w-full min-h-[96px] rounded-lg border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Кратко расскажите о вашем магазине..." 
          />
        </div>
      </section>

      {/* ── Контакты и логистика ── */}
      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-text-main">Контакты и логистика</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Телефон IDC */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-main">
              <Phone className="h-4 w-4 text-emerald-600" />
              <span>Номер телефона (IDC)</span>
            </label>
            <input 
              {...register("phone")}
              type="text" 
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" 
              placeholder="+373 (77X) XX-XX-XX" 
            />
            <span className="text-[11px] text-gray-500">
              Для прямых звонков от покупателей
            </span>
          </div>

          {/* Telegram */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-main">
              <Send className="h-4 w-4 text-sky-500" />
              <span>Telegram</span>
            </label>
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-2.5 py-2.5 text-xs text-gray-500">t.me/</span>
              <input 
                {...register("telegram", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/@/g, "").replace(/https?:\/\/t\.me\//, "");
                  }
                })}
                type="text" 
                className="w-full rounded-r-lg border border-gray-300 p-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200" 
                placeholder="username" 
              />
            </div>
            <span className="text-[11px] text-gray-500">
              Юзернейм без знака @
            </span>
          </div>

          {/* Viber */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-text-main">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <span>Viber</span>
            </label>
            <input 
              {...register("viber")}
              type="text" 
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
              placeholder="+373 77X XXXXX" 
            />
            <span className="text-[11px] text-gray-500">
              Номер телефона с кодом страны
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-main">Города доставки / работы *</label>
            <span className="text-xs text-text-muted">Выберите хотя бы один город</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {CITIES.map((city) => (
              <label key={city} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  value={city} 
                  {...register("cities")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-sm text-text-main">{city}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Telegram-уведомления */}
      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-text-main flex items-center gap-2">
                Telegram-уведомления
                {tgChatId ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Подключён
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Не подключён
                  </span>
                )}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Моментальные оповещения о новых вопросах и заказах от покупателей прямо в Telegram
              </p>
            </div>
          </div>
        </div>

        {tgChatId ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-emerald-900">
                ✅ Ваш магазин успешно привязан к боту <span className="font-bold">@{botUsername}</span>
              </p>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Как только покупатель отправит вам вопрос по товару или нажмёт связаться — бот мгновенно пришлёт сообщение со всеми деталями и ссылкой на диалог.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTg}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                {isTestingTg ? "Отправка..." : "Отправить тест"}
              </button>
              <button
                type="button"
                onClick={handleDisconnectTelegram}
                disabled={isDisconnectingTg}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                {isDisconnectingTg ? "Отключение..." : "Отключить уведомления"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                Подключите официального бота @{botUsername} в 1 клик
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Вам не придётся проверять почту — уведомления о новых заказах и вопросах будут приходить прямо на экран телефона за секунду.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={telegramConnectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#1E8EC4] active:scale-[0.98] transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Подключить Telegram</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleCheckTelegram}
                disabled={isCheckingTg}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${isCheckingTg ? "animate-spin" : ""}`} />
                <span>Проверить статус</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-500">
              💡 Нажмите кнопку выше, в Telegram нажмите кнопку <b>START</b>, и магазин привяжется автоматически.
            </p>
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={isSaving || !!uploadingType}
        className="w-full rounded-xl bg-primary py-3.5 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 shadow-sm"
      >
        {isSaving ? "Сохранение..." : "Сохранить настройки магазина"}
      </button>
    </form>
  );
}
