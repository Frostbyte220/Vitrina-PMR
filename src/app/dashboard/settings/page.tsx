"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";

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
  cities: string[];
};

async function uploadToCloudinary(file: File): Promise<string> {
  const signRes = await fetch("/api/cloudinary/sign");
  if (!signRes.ok) throw new Error("Не удалось получить подпись");
  
  const { signature, timestamp, apiKey, uploadPreset } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("upload_preset", uploadPreset);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Ошибка при загрузке в Cloudinary");
  return (await response.json()).secure_url;
}

export default function DashboardSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loadError, setLoadError] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [uploadingType, setUploadingType] = useState<"avatar" | "cover" | null>(null);

  const { register, handleSubmit, reset } = useForm<StoreFormData>({
    defaultValues: { cities: [] }
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 секунд максимум

    const fetchStore = async () => {
      try {
        const res = await fetch("/api/store", { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const cleanInsta = (data.instagram || data.slug || "").replace(/^@/, "");
            reset({
              name: data.name || "",
              slug: cleanInsta,
              description: data.description || "",
              instagram: cleanInsta,
              phone: data.phone || "",
              cities: data.cities || [],
            });
            if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
            if (data.coverUrl) setCoverUrl(data.coverUrl);
          }
        } else {
          setLoadError(true);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Ошибка загрузки магазина:", error);
        }
        setLoadError(true);
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    fetchStore();

    // Жёсткий запасной таймаут: если через 10 секунд всё ещё грузится, принудительно снимаем флаг
    const hardTimeout = setTimeout(() => {
      setIsLoading(false);
      setLoadError(true);
    }, 10000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(hardTimeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit: SubmitHandler<StoreFormData> = async (data) => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const cleanInsta = data.instagram.replace(/^@/, "").trim();
      const payload = { 
        ...data, 
        instagram: cleanInsta,
        slug: cleanInsta, 
        avatarUrl, 
        coverUrl 
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

      setMessage({ text: "Настройки успешно сохранены!", type: "success" });
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingType(type);
    try {
      const url = await uploadToCloudinary(e.target.files[0]);
      if (type === "avatar") setAvatarUrl(url);
      if (type === "cover") setCoverUrl(url);
    } catch {
      alert(`Не удалось загрузить ${type === "avatar" ? "логотип" : "обложку"}.`);
    } finally {
      setUploadingType(null);
      e.target.value = ""; 
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
        <div className="flex items-center justify-center gap-3 text-text-muted pt-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
          Загрузка настроек...
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
        <div className="flex flex-col items-center gap-4 pt-16 text-center">
          <p className="text-text-muted">Не удалось загрузить настройки. Проверьте соединение.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Обновить страницу
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-text-main">Настройки магазина</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">Загрузка...</div>
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">Загрузка...</div>
                  )}
                </div>
                <label className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                  Загрузить обложку
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
                </label>
              </div>
            </div>
          </section>

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
                Эта ссылка будет вести на вашу витрину. Скопируйте её и вставьте в шапку профиля Instagram.
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

          <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-text-main">Контакты и логистика</h2>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-main">Телефон / Viber / TG</label>
              <input 
                {...register("phone")}
                type="text" 
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="+373 (77X) XX-XX-XX" 
              />
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <label className="text-sm font-medium text-text-main">Города доставки / работы</label>
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

          {message.text && (
            <div className={`rounded-lg p-4 text-sm font-medium ${message.type === 'error' ? 'border border-red-200 bg-red-50 text-red-600' : 'border border-green-200 bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || !!uploadingType}
            className="w-full rounded-lg bg-black py-3.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Сохранение..." : "Сохранить настройки магазина"}
          </button>
        </form>
      </div>
    </main>
  );
}