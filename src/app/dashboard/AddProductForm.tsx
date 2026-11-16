"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, Check } from "lucide-react";
import { productSchema, ProductFormData, CATEGORIES, CLOTHING_SIZES, SHOE_SIZES } from "@/lib/validations/product";
import { SUBCATEGORIES_MAP, getCategoryIcon } from "@/lib/constants/categories";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { AVAILABILITY_OPTIONS } from "@/lib/availability";

interface AddProductFormProps {
  onSuccess?: () => void;
  initialData?: any; // Свойство для передачи существующих данных товара при редактировании
}

const parseInitialCategories = (data?: any): string[] => {
  if (Array.isArray(data?.categories) && data.categories.length > 0) {
    const valid = data.categories.filter((c: string) => CATEGORIES.includes(c));
    if (valid.length > 0) return valid;
  }
  if (data?.category && CATEGORIES.includes(data.category)) {
    return [data.category];
  }
  return [CATEGORIES[0]];
};

const parseInitialSubCategories = (rawSub?: string | null): string[] => {
  if (!rawSub || rawSub === "Нет") return [];
  return rawSub
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "Нет");
};

export default function AddProductForm({ onSuccess, initialData }: AddProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    parseInitialCategories(initialData)
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(() =>
    parseInitialSubCategories(initialData?.subCategory)
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    Array.isArray(initialData?.sizes) ? initialData.sizes : []
  );
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [availability, setAvailability] = useState<string>(initialData?.availability || "В наличии");

  // Инициализация React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    mode: "onBlur",
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          description: initialData.description || "",
          price: initialData.price ? initialData.price.toString() : ("" as any),
          oldPrice: initialData.oldPrice ? initialData.oldPrice.toString() : ("" as any),
          category: (initialData.category && CATEGORIES.includes(initialData.category)) ? initialData.category : CATEGORIES[0],
          categories: parseInitialCategories(initialData),
          images: initialData.images || [],
        }
      : {
          title: "",
          description: "",
          price: "" as any,
          oldPrice: "" as any,
          category: CATEGORIES[0] as any,
          categories: [CATEGORIES[0]],
          images: [],
        },
  });

  const selectedCategory = selectedCategories[0] || CATEGORIES[0];
  const watchPrice = Number(watch("price")) || 0;
  const watchOldPrice = Number(watch("oldPrice")) || 0;
  const discountPercent =
    watchOldPrice > watchPrice && watchPrice > 0
      ? Math.round(((watchOldPrice - watchPrice) / watchOldPrice) * 100)
      : null;

  const imageUrls: string[] = watch("images") || [];
  const activeCategoriesWithSubs = selectedCategories.filter(
    (cat) => SUBCATEGORIES_MAP[cat] && SUBCATEGORIES_MAP[cat].length > 0
  );

  const hasClothing = selectedCategories.includes("Одежда");
  const hasShoes = selectedCategories.includes("Обувь");
  const isSizeCategory = hasClothing || hasShoes;
  const availablePresetSizes = hasClothing && hasShoes
    ? Array.from(new Set([...CLOTHING_SIZES, ...SHOE_SIZES]))
    : hasClothing
    ? CLOTHING_SIZES
    : hasShoes
    ? SHOE_SIZES
    : [];

  // Сбрасываем подкатегории, которые не принадлежат ни одной из выбранных категорий
  useEffect(() => {
    const validSubs = new Set<string>();
    selectedCategories.forEach((cat) => {
      (SUBCATEGORIES_MAP[cat] || []).forEach((s) => validSubs.add(s));
    });
    setSelectedSubCategories((prev) => prev.filter((s) => validSubs.has(s)));
  }, [selectedCategories]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      let next: string[];
      if (prev.includes(cat)) {
        if (prev.length <= 1) {
          toast.error("У товара должна быть хотя бы одна категория");
          return prev;
        }
        next = prev.filter((c) => c !== cat);
      } else {
        next = [...prev, cat];
      }
      setValue("category", next[0], { shouldValidate: true });
      setValue("categories", next, { shouldValidate: true });
      return next;
    });
  };

  const toggleSubCategory = (sub: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput("");
  };

  const removeSize = (sizeToRemove: string) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  // Обработчик сохранения формы
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      const primaryCat = selectedCategories[0] || "Разное";
      const payload = {
        ...data,
        category: primaryCat,
        categories: selectedCategories,
        subCategory: selectedSubCategories.length > 0 ? selectedSubCategories.join(", ") : undefined,
        sizes: isSizeCategory ? selectedSizes : [],
        availability,
      };

      const url = isEditing ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || errorData.issues?.[0]?.message || "Ошибка при сохранении товара";
        throw new Error(msg);
      }

      toast.success(isEditing ? "Товар успешно обновлен" : "Товар успешно опубликован");

      if (isEditing) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        reset();
        setSelectedCategories([CATEGORIES[0]]);
        setSelectedSubCategories([]);
        setSelectedSizes([]);
        setCustomSizeInput("");
        setAvailability("В наличии");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/products");
        }
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка при сохранении товара");
      console.error("Ошибка сохранения товара:", error);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = imageUrls.filter((_: string, index: number) => index !== indexToRemove);
    setValue("images", newImages, { shouldValidate: true });
  };

  // Перенос строки при нажатии Ctrl + Enter (или Cmd + Enter) в описании товара
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    // Ограничение на общее количество фото (макс. 10)
    if (imageUrls.length + files.length > 10) {
      toast.error(
        `Максимум 10 фотографий (уже загружено: ${imageUrls.length}, выбрано: ${files.length})`
      );
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Оптимизация ${files.length} фото...`);
    const toastId = toast.loading(
      files.length === 1
        ? "Сжатие и подготовка фото..."
        : `Сжатие и подготовка ${files.length} фото...`
    );

    try {
      const uploadPromises = files.map((file, idx) =>
        uploadToCloudinary(file, {
          maxDimension: 1600,
          quality: 0.82,
          onStatusChange: (status) => {
            setUploadStatus(`${status} (${idx + 1}/${files.length})`);
          },
        })
      );
      const urls = await Promise.all(uploadPromises);

      setValue("images", [...imageUrls, ...urls], { shouldValidate: true });
      toast.success(
        files.length === 1
          ? "Фото успешно оптимизировано и загружено!"
          : `Все ${files.length} фото успешно сжаты и загружены!`,
        { id: toastId }
      );
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      toast.error(err.message || "Не удалось загрузить фото", { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      e.target.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`mt-2 flex w-full flex-col gap-4 pr-1 pb-2 ${
        onSuccess ? "max-h-[80vh] overflow-y-auto pr-2" : ""
      }`}
    >
      {onSuccess && (
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          {isEditing ? "Редактирование товара" : "Новый товар"}
        </h3>
      )}
      {!onSuccess && isEditing && (
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          Редактирование товара
        </h3>
      )}

      {/* Название товара */}
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Название товара <span className="text-rose-500">*</span>
        </label>
        <input
          {...register("title")}
          id="title"
          type="text"
          className={`w-full rounded-lg border p-2.5 outline-none transition-all focus:ring-2 focus:ring-rose-500 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Например: Платье миди из льна"
        />
        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
      </div>

      {/* Цены */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="text-sm font-medium text-gray-700">
            Текущая цена (руб.) <span className="text-rose-500">*</span>
          </label>
          <input
            {...register("price")}
            id="price"
            type="number"
            step="0.01"
            className={`w-full rounded-lg border p-2.5 outline-none transition-all focus:ring-2 focus:ring-rose-500 ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="150"
          />
          {errors.price && <span className="text-xs text-red-500">{errors.price.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="oldPrice" className="text-sm font-medium text-gray-700">
              Старая цена (руб.)
            </label>
            {discountPercent !== null && (
              <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                Скидка -{discountPercent}%
              </span>
            )}
          </div>
          <input
            {...register("oldPrice")}
            id="oldPrice"
            type="number"
            step="0.01"
            className={`w-full rounded-lg border p-2.5 outline-none transition-all focus:ring-2 focus:ring-rose-500 ${
              errors.oldPrice ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="200 (необязательно)"
          />
          {errors.oldPrice ? (
            <span className="text-xs text-red-500">{errors.oldPrice.message}</span>
          ) : (
            <span className="text-[11px] text-gray-400">
              Укажите, чтобы показать скидку и зачеркнутую цену
            </span>
          )}
        </div>
      </div>

      {/* Статус наличия товара */}
      <div className="flex flex-col gap-2 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            Наличие товара <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-gray-400">
            Снимает лишние вопросы покупателей
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const isSelected = availability === opt.label;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setAvailability(opt.label)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${opt.badgeClass} ring-2 ring-rose-200 border-transparent shadow-xs font-semibold`
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dotClass} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">{opt.shortLabel}</p>
                  <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Выбор категорий (мультивыбор) */}
      <div className="flex flex-col gap-2 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200 transition-all">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            Категории товара (можно выбрать несколько) <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Выбрано: {selectedCategories.length}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Выберите одну или несколько категорий (например: «Handmade» и «Автотовары»), чтобы товар находили во всех подходящих разделах.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const isPrimary = selectedCategories[0] === cat;
            const Icon = getCategoryIcon(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-xs font-semibold ring-2 ring-rose-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white" : "text-gray-500"}`} />
                <span>{cat}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                )}
                {isSelected && selectedCategories.length > 1 && isPrimary && (
                  <span className="text-[10px] bg-rose-700/60 text-rose-100 px-1 py-0.2 rounded font-normal">
                    основная
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.categories && (
          <span className="text-xs text-red-500">{errors.categories.message}</span>
        )}
      </div>

      {/* Подкатегории (мультивыбор по выбранным категориям) */}
      {activeCategoriesWithSubs.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800">
              Подкатегории (можно выбрать несколько)
            </label>
            {selectedSubCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Выбрано: {selectedSubCategories.length}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSubCategories([])}
                  className="text-xs text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Выберите подходящие подкатегории, чтобы покупателям было проще найти товар через фильтры.
          </p>

          <div className="flex flex-col gap-2.5 pt-0.5">
            {activeCategoriesWithSubs.map((cat) => {
              const subs = SUBCATEGORIES_MAP[cat] || [];
              if (subs.length === 0) return null;

              return (
                <div key={cat} className="flex flex-col gap-1.5">
                  {activeCategoriesWithSubs.length > 1 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{cat}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {subs.map((sub) => {
                      const isSelected = selectedSubCategories.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubCategory(sub)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none active:scale-95 ${
                            isSelected
                              ? "bg-rose-600 text-white shadow-xs font-semibold ring-2 ring-rose-200"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                          <span>{sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Размеры товара (для Одежды и Обуви) */}
      {isSizeCategory && (
        <div className="flex flex-col gap-2 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800">
              Размеры в наличии {hasClothing && hasShoes ? "(одежда и обувь)" : hasClothing ? "(одежда)" : "(обувь)"}
            </label>
            {selectedSizes.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Выбрано: {selectedSizes.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Укажите размеры в наличии. Покупатели смогут отфильтровать товар по размеру.
          </p>

          {/* Предустановленные размеры */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availablePresetSizes.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Добавление нестандартного размера */}
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="text"
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSize();
                }
              }}
              placeholder={
                selectedCategory === "Обувь"
                  ? "Свой размер (например: 38.5, 41.5)"
                  : "Свой размер (например: 46-48, 110-116)"
              }
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              disabled={!customSizeInput.trim()}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              + Добавить
            </button>
          </div>

          {/* Выбранные кастомные размеры */}
          {selectedSizes.filter((s) => !availablePresetSizes.includes(s)).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-gray-400">Пользовательские:</span>
              {selectedSizes
                .filter((s) => !availablePresetSizes.includes(s))
                .map((customSize) => (
                  <span
                    key={customSize}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-semibold text-rose-700"
                  >
                    {customSize}
                    <button
                      type="button"
                      onClick={() => removeSize(customSize)}
                      className="text-rose-400 hover:text-rose-700 font-bold ml-0.5 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Фотографии */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Фотографии товара (минимум 1) <span className="text-rose-500">*</span>
        </label>

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {imageUrls.map((url: string, index: number) => (
              <div
                key={index}
                className="relative h-24 w-24 rounded-lg border border-gray-200 overflow-hidden shadow-xs"
              >
                <Image
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  src={url}
                  alt={`Фото ${index + 1}`}
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:bg-gray-100 ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                <span>{uploadStatus || "Оптимизация и загрузка..."}</span>
              </>
            ) : (
              <span>+ Выбрать фотографии</span>
            )}
          </div>
          <span className="mt-1 text-xs text-gray-400">
            Автоматическое сжатие фото (JPG, PNG, WebP до 30 МБ, макс. 10 фото)
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading || isSubmitting}
          />
        </label>
        {errors.images && <span className="text-xs text-red-500">{errors.images.message}</span>}
      </div>

      {/* Описание */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Описание
          </label>
          <span
            className={`text-xs ${
              (watch("description") || "").length > 900
                ? "text-red-500 font-semibold"
                : "text-gray-400"
            }`}
          >
            {(watch("description") || "").length}/1000
          </span>
        </div>
        <textarea
          {...register("description")}
          id="description"
          rows={4}
          onKeyDown={handleDescriptionKeyDown}
          className={`w-full min-h-[96px] rounded-lg border p-2.5 outline-none transition-all focus:ring-2 focus:ring-rose-500 ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Напишите подробнее о товаре, материале, комплектации..."
        />
        {errors.description && (
          <span className="text-xs text-red-500">{errors.description.message}</span>
        )}
      </div>

      {/* Кнопка сохранения / публикации */}
      <button
        type="submit"
        disabled={isUploading || isSubmitting || imageUrls.length === 0}
        className="mt-4 w-full shrink-0 rounded-xl bg-rose-600 py-3 font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting
          ? isEditing
            ? "Сохранение..."
            : "Публикация..."
          : imageUrls.length > 0
          ? isEditing
            ? "Сохранить изменения"
            : "Опубликовать на витрине"
          : "Сначала загрузите фото"}
      </button>
    </form>
  );
}
