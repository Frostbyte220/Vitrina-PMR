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
  Store,
  Plus,
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

  const cleanInsta = (initialData?.instagram || initialData?.slug || "").replace(/^@/, "");
  const hasNoCities = !initialData?.cities || initialData.cities.length === 0;

  const { register, handleSubmit, watch } = useForm<StoreFormData>({
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
            rows={3} 
            className="w-full resize-none rounded-lg border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
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
