"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { productSchema, ProductFormData, CATEGORIES, CLOTHING_SIZES, SHOE_SIZES } from "@/lib/validations/product";
import toast from "react-hot-toast";

interface AddProductFormProps {
  onSuccess?: () => void;
  initialData?: any; // Добавлено свойство для передачи существующих данных товара
}

const CATEGORIES_WITH_SUBCATEGORIES = [
  "Одежда",
  "Обувь",
  "Спорт и отдых",
  "Косметика",
  "Парфюмерия",
];

const getSubCategories = (category: string) => {
  if (["Одежда", "Обувь", "Спорт и отдых"].includes(category)) {
    return ["Нет", "Для женщин", "Для мужчин", "Для детей"];
  }
  if (["Косметика", "Парфюмерия"].includes(category)) {
    return ["Нет", "Для женщин", "Для мужчин", "Унисекс"];
  }
  return ["Нет"];
};

async function uploadToCloudinary(file: File): Promise<string> {
  // Получаем подпись с сервера (защищенный эндпоинт)
  const signRes = await fetch("/api/cloudinary/sign");
  if (!signRes.ok) throw new Error("Не удалось получить подпись для загрузки");
  
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Cloudinary Error: ${errorData?.error?.message || response.statusText || "Ошибка загрузки"}`);
  }
  
  const data = await response.json();
  return data.secure_url;
}

export default function AddProductForm({ onSuccess, initialData }: AddProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData; // Флаг: если есть initialData, значит это режим редактирования

  const [isUploading, setIsUploading] = useState(false);
  // Подставляем подкатегорию, если редактируем, иначе "Нет"
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "Нет");
  // Состояние выбранных размеров
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    Array.isArray(initialData?.sizes) ? initialData.sizes : []
  );
  const [customSizeInput, setCustomSizeInput] = useState("");

  // 1. Инициализация React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    // Если есть initialData — подставляем её, иначе пустые значения
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || "",
      price: initialData.price.toString() as any, // Конвертируем число в строку для input
      category: initialData.category as any,
      images: initialData.images || [],
    } : {
      title: "",
      description: "",
      price: "" as any,
      category: CATEGORIES[0] as any,
      images: [],
    },
  });

  const selectedCategory = watch("category");
  const imageUrls: string[] = watch("images") || [];
  const currentSubCategories = getSubCategories(selectedCategory);
  const isSizeCategory = ["Одежда", "Обувь"].includes(selectedCategory);
  const availablePresetSizes = selectedCategory === "Одежда" ? CLOTHING_SIZES : selectedCategory === "Обувь" ? SHOE_SIZES : [];

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

  // 2. Обработчик отправки
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        subCategory: subCategory !== "Нет" ? subCategory : undefined,
        sizes: isSizeCategory ? selectedSizes : [],
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
        throw new Error(errorData.message || "Ошибка при сохранении товара");
      }

      toast.success(isEditing ? "Товар успешно обновлен" : "Товар успешно опубликован");

      if (isEditing) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        reset();
        setSubCategory("Нет");
        setSelectedSizes([]);
        setCustomSizeInput("");
        if (onSuccess) onSuccess();
        router.refresh();
      }
      
    } catch (error: any) {
      toast.error(error.message || "Ошибка при сохранении товара");
      console.error("Ошибка:", error);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = imageUrls.filter((_: string, index: number) => index !== indexToRemove);
    setValue("images", newImages, { shouldValidate: true });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      
      setValue("images", [...imageUrls, ...urls], { shouldValidate: true });
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      alert(`Не удалось загрузить фото: ${err.message || "Проверьте настройки Cloudinary."}`);
    } finally {
      setIsUploading(false);
      e.target.value = ""; 
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-2 flex w-full flex-col gap-4 max-h-[85vh] overflow-y-auto pr-2 pb-2"
    >
      <h3 className="mb-2 text-xl font-semibold text-gray-800">
        {isEditing ? "Редактирование товара" : "Новый товар"}
      </h3>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">Название товара</label>
        <input
          {...register("title")}
          type="text"
          className={`w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder="Например: Свечи ручной работы"
        />
        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price" className="text-sm font-medium text-gray-700">Цена (руб.)</label>
        <input
          {...register("price")}
          type="number"
          step="0.01"
          className={`w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
          placeholder="150"
        />
        {errors.price && <span className="text-xs text-red-500">{errors.price.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">Категория</label>
        <select
          {...register("category")}
          className={`w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? "border-red-500" : "border-gray-300"}`}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
      </div>

      {CATEGORIES_WITH_SUBCATEGORIES.includes(selectedCategory) && (
        <div className="flex flex-col gap-1 transition-all duration-300">
          <label className="text-sm font-medium text-gray-700">Подкатегория</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currentSubCategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      {/* РАЗМЕРЫ ТОВАРА (для Одежды и Обуви) */}
      {isSizeCategory && (
        <div className="flex flex-col gap-2 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800">
              Размеры в наличии {selectedCategory === "Одежда" ? "(одежда)" : "(обувь)"}
            </label>
            {selectedSizes.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Выбрано: {selectedSizes.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Укажите размеры, которые есть у вас в наличии. Покупатели смогут выбрать нужный размер перед обращением.
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
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-200"
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
              placeholder={selectedCategory === "Обувь" ? "Свой размер (например: 38.5, 41.5)" : "Свой размер (например: 46-48, 110-116)"}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              disabled={!customSizeInput.trim()}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 shrink-0"
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
                      className="text-rose-400 hover:text-rose-700 font-bold ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ФОТОГРАФИИ */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Фотографии товара (минимум 1) <span className="text-red-500">*</span></label>
        
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {imageUrls.map((url: string, index: number) => (
              <div key={index} className="relative h-24 w-24 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <Image fill sizes="(max-width: 768px) 100vw, 20vw" src={url} alt={`Фото ${index + 1}`} className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        <label className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:bg-gray-100 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <span className="text-sm text-gray-600 font-medium">
            {isUploading ? "Загрузка в облако..." : "+ Выбрать фотографии"}
          </span>
          <input 
            type="file" multiple accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isUploading || isSubmitting}
          />
        </label>
        {errors.images && <span className="text-xs text-red-500">{errors.images.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">Описание</label>
        <textarea
          {...register("description")}
          rows={3}
          className={`w-full resize-none rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
          placeholder="Напишите подробнее о товаре..."
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isUploading || isSubmitting || imageUrls.length === 0}
        className="mt-4 w-full shrink-0 rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting 
          ? (isEditing ? "Сохранение..." : "Публикация...") 
          : imageUrls.length > 0 
            ? (isEditing ? "Сохранить изменения" : "Опубликовать на витрине") 
            : "Сначала загрузите фото"
        }
      </button>
    </form>
  );
}