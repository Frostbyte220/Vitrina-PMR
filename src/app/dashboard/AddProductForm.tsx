"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { productSchema, ProductFormData, CATEGORIES } from "@/lib/validations/product";

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

  if (!response.ok) throw new Error("Ошибка при загрузке в Cloudinary");
  
  const data = await response.json();
  return data.secure_url;
}

export default function AddProductForm({ onSuccess, initialData }: AddProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData; // Флаг: если есть initialData, значит это режим редактирования

  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  // Подставляем подкатегорию, если редактируем, иначе "Нет"
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "Нет");

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

  // 2. Обработчик отправки
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setServerError("");
    try {
      const payload = {
        ...data,
        subCategory: subCategory !== "Нет" ? subCategory : undefined,
      };

      // Выбираем URL и метод отправки в зависимости от режима (создание или редактирование)
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

      if (isEditing) {
        // После успешного редактирования возвращаем пользователя на дашборд
        router.push("/dashboard");
        router.refresh();
      } else {
        // После успешного создания очищаем форму и закрываем модалку (если она есть)
        reset();
        setSubCategory("Нет");
        if (onSuccess) onSuccess();
        router.refresh();
      }
      
    } catch (error: any) {
      setServerError(error.message);
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
    } catch {
      alert("Не удалось загрузить фото. Проверьте настройки Cloudinary.");
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

      {/* ФОТОГРАФИИ */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Фотографии товара (минимум 1)</label>
        
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

      {serverError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{serverError}</p>}

      <button
        type="submit"
        disabled={isUploading || isSubmitting || imageUrls.length === 0}
        className="mt-4 w-full shrink-0 rounded-lg bg-black py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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