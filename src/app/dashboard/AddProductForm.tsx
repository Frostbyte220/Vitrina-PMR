"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { productSchema, ProductFormData, CATEGORIES, CLOTHING_SIZES, SHOE_SIZES } from "@/lib/validations/product";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { AVAILABILITY_OPTIONS } from "@/lib/availability";

interface AddProductFormProps {
  onSuccess?: () => void;
  initialData?: any; // Р”РѕР±Р°РІР»РµРЅРѕ СЃРІРѕР№СЃС‚РІРѕ РґР»СЏ РїРµСЂРµРґР°С‡Рё СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёС… РґР°РЅРЅС‹С… С‚РѕРІР°СЂР°
}

const CATEGORIES_WITH_SUBCATEGORIES = [
  "РћРґРµР¶РґР°",
  "РћР±СѓРІСЊ",
  "РЎРїРѕСЂС‚ Рё РѕС‚РґС‹С…",
  "РљРѕСЃРјРµС‚РёРєР°",
  "РџР°СЂС„СЋРјРµСЂРёСЏ",
];

const getSubCategories = (category: string) => {
  if (["РћРґРµР¶РґР°", "РћР±СѓРІСЊ", "РЎРїРѕСЂС‚ Рё РѕС‚РґС‹С…"].includes(category)) {
    return ["РќРµС‚", "Р”Р»СЏ Р¶РµРЅС‰РёРЅ", "Р”Р»СЏ РјСѓР¶С‡РёРЅ", "Р”Р»СЏ РґРµС‚РµР№"];
  }
  if (["РљРѕСЃРјРµС‚РёРєР°", "РџР°СЂС„СЋРјРµСЂРёСЏ"].includes(category)) {
    return ["РќРµС‚", "Р”Р»СЏ Р¶РµРЅС‰РёРЅ", "Р”Р»СЏ РјСѓР¶С‡РёРЅ", "РЈРЅРёСЃРµРєСЃ"];
  }
  return ["РќРµС‚"];
};

export default function AddProductForm({ onSuccess, initialData }: AddProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData; // Р¤Р»Р°Рі: РµСЃР»Рё РµСЃС‚СЊ initialData, Р·РЅР°С‡РёС‚ СЌС‚Рѕ СЂРµР¶РёРј СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  // РџРѕРґСЃС‚Р°РІР»СЏРµРј РїРѕРґРєР°С‚РµРіРѕСЂРёСЋ, РµСЃР»Рё СЂРµРґР°РєС‚РёСЂСѓРµРј, РёРЅР°С‡Рµ "РќРµС‚"
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "РќРµС‚");
  // РЎРѕСЃС‚РѕСЏРЅРёРµ РІС‹Р±СЂР°РЅРЅС‹С… СЂР°Р·РјРµСЂРѕРІ
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    Array.isArray(initialData?.sizes) ? initialData.sizes : []
  );
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [availability, setAvailability] = useState<string>(initialData?.availability || "Р’ РЅР°Р»РёС‡РёРё");

  // 1. РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ React Hook Form
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
    // Р•СЃР»Рё РµСЃС‚СЊ initialData вЂ” РїРѕРґСЃС‚Р°РІР»СЏРµРј РµС‘, РёРЅР°С‡Рµ РїСѓСЃС‚С‹Рµ Р·РЅР°С‡РµРЅРёСЏ
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || "",
      price: initialData.price.toString() as any, // РљРѕРЅРІРµСЂС‚РёСЂСѓРµРј С‡РёСЃР»Рѕ РІ СЃС‚СЂРѕРєСѓ РґР»СЏ input
      oldPrice: initialData.oldPrice ? initialData.oldPrice.toString() : ("" as any),
      category: initialData.category as any,
      images: initialData.images || [],
    } : {
      title: "",
      description: "",
      price: "" as any,
      oldPrice: "" as any,
      category: CATEGORIES[0] as any,
      images: [],
    },
  });

  const selectedCategory = watch("category");
  const watchPrice = Number(watch("price")) || 0;
  const watchOldPrice = Number(watch("oldPrice")) || 0;
  const discountPercent =
    watchOldPrice > watchPrice && watchPrice > 0
      ? Math.round(((watchOldPrice - watchPrice) / watchOldPrice) * 100)
      : null;

  const imageUrls: string[] = watch("images") || [];
  const currentSubCategories = getSubCategories(selectedCategory);
  const isSizeCategory = ["РћРґРµР¶РґР°", "РћР±СѓРІСЊ"].includes(selectedCategory);
  const availablePresetSizes = selectedCategory === "РћРґРµР¶РґР°" ? CLOTHING_SIZES : selectedCategory === "РћР±СѓРІСЊ" ? SHOE_SIZES : [];

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

  // 2. РћР±СЂР°Р±РѕС‚С‡РёРє РѕС‚РїСЂР°РІРєРё
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      const payload = {
        ...data,
        subCategory: subCategory !== "РќРµС‚" ? subCategory : undefined,
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
        throw new Error(errorData.message || "РћС€РёР±РєР° РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё С‚РѕРІР°СЂР°");
      }

      toast.success(isEditing ? "РўРѕРІР°СЂ СѓСЃРїРµС€РЅРѕ РѕР±РЅРѕРІР»РµРЅ" : "РўРѕРІР°СЂ СѓСЃРїРµС€РЅРѕ РѕРїСѓР±Р»РёРєРѕРІР°РЅ");

      if (isEditing) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        reset();
        setSubCategory("РќРµС‚");
        setSelectedSizes([]);
        setCustomSizeInput("");
        setAvailability("Р’ РЅР°Р»РёС‡РёРё");
        if (onSuccess) onSuccess();
        router.refresh();
      }
      
    } catch (error: any) {
      toast.error(error.message || "РћС€РёР±РєР° РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё С‚РѕРІР°СЂР°");
      console.error("РћС€РёР±РєР°:", error);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = imageUrls.filter((_: string, index: number) => index !== indexToRemove);
    setValue("images", newImages, { shouldValidate: true });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // РћРіСЂР°РЅРёС‡РµРЅРёРµ РЅР° РѕР±С‰РµРµ РєРѕР»РёС‡РµСЃС‚РІРѕ С„РѕС‚РѕРіСЂР°С„РёР№ (РјР°РєСЃ. 10)
    if (imageUrls.length + files.length > 10) {
      toast.error(
        `РњР°РєСЃРёРјСѓРј 10 С„РѕС‚РѕРіСЂР°С„РёР№ (СѓР¶Рµ РґРѕР±Р°РІР»РµРЅРѕ: ${imageUrls.length}, РІС‹Р±СЂР°РЅРѕ: ${files.length})`
      );
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadStatus(`РћРїС‚РёРјРёР·Р°С†РёСЏ ${files.length} С„РѕС‚Рѕ...`);
    const toastId = toast.loading(
      files.length === 1
        ? "РЎР¶Р°С‚РёРµ Рё РїРѕРґРіРѕС‚РѕРІРєР° С„РѕС‚Рѕ..."
        : `РЎР¶Р°С‚РёРµ Рё РїРѕРґРіРѕС‚РѕРІРєР° ${files.length} С„РѕС‚Рѕ...`
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
          ? "Р¤РѕС‚Рѕ СѓСЃРїРµС€РЅРѕ РѕРїС‚РёРјРёР·РёСЂРѕРІР°РЅРѕ Рё Р·Р°РіСЂСѓР¶РµРЅРѕ!"
          : `Р’СЃРµ ${files.length} С„РѕС‚Рѕ СѓСЃРїРµС€РЅРѕ СЃР¶Р°С‚С‹ Рё Р·Р°РіСЂСѓР¶РµРЅС‹!`,
        { id: toastId }
      );
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      toast.error(err.message || "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ С„РѕС‚Рѕ", { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      e.target.value = ""; 
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-2 flex w-full flex-col gap-4 max-h-[85vh] overflow-y-auto pr-2 pb-2"
    >
      <h3 className="mb-2 text-xl font-semibold text-gray-800">
        {isEditing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ С‚РѕРІР°СЂР°" : "РќРѕРІС‹Р№ С‚РѕРІР°СЂ"}
      </h3>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">РќР°Р·РІР°РЅРёРµ С‚РѕРІР°СЂР°</label>
        <input
          {...register("title")}
          type="text"
          className={`w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder="РќР°РїСЂРёРјРµСЂ: РЎРІРµС‡Рё СЂСѓС‡РЅРѕР№ СЂР°Р±РѕС‚С‹"
        />
        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="text-sm font-medium text-gray-700">
            РўРµРєСѓС‰Р°СЏ С†РµРЅР° (СЂСѓР±.) <span className="text-rose-500">*</span>
          </label>
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
          <div className="flex items-center justify-between">
            <label htmlFor="oldPrice" className="text-sm font-medium text-gray-700">
              РЎС‚Р°СЂР°СЏ С†РµРЅР° (СЂСѓР±.)
            </label>
            {discountPercent !== null && (
              <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                РЎРєРёРґРєР° -{discountPercent}%
              </span>
            )}
          </div>
          <input
            {...register("oldPrice")}
            type="number"
            step="0.01"
            className={`w-full rounded-lg border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${errors.oldPrice ? "border-red-500" : "border-gray-300"}`}
            placeholder="200 (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)"
          />
          {errors.oldPrice ? (
            <span className="text-xs text-red-500">{errors.oldPrice.message}</span>
          ) : (
            <span className="text-[11px] text-gray-400">
              РЈРєР°Р¶РёС‚Рµ, С‡С‚РѕР±С‹ РїРѕРєР°Р·Р°С‚СЊ СЃРєРёРґРєСѓ Рё Р·Р°С‡РµСЂРєРЅСѓС‚СѓСЋ С†РµРЅСѓ
            </span>
          )}
        </div>
      </div>

      {/* РЎРўРђРўРЈРЎ РќРђР›РР§РРЇ РўРћР’РђР Рђ */}
      <div className="flex flex-col gap-2 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">
            РќР°Р»РёС‡РёРµ С‚РѕРІР°СЂР° <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-gray-400">
            РЎРЅРёРјР°РµС‚ РІРѕРїСЂРѕСЃС‹ РїРѕРєСѓРїР°С‚РµР»РµР№
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
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${opt.badgeClass} ring-2 ring-rose-200 border-transparent shadow-xs font-semibold`
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dotClass} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">{opt.label}</p>
                  <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">РљР°С‚РµРіРѕСЂРёСЏ</label>
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
          <label className="text-sm font-medium text-gray-700">РџРѕРґРєР°С‚РµРіРѕСЂРёСЏ</label>
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

      {/* Р РђР—РњР•Р Р« РўРћР’РђР Рђ (РґР»СЏ РћРґРµР¶РґС‹ Рё РћР±СѓРІРё) */}
      {isSizeCategory && (
        <div className="flex flex-col gap-2 rounded-xl bg-gray-50/80 p-3.5 border border-gray-200 transition-all">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800">
              Р Р°Р·РјРµСЂС‹ РІ РЅР°Р»РёС‡РёРё {selectedCategory === "РћРґРµР¶РґР°" ? "(РѕРґРµР¶РґР°)" : "(РѕР±СѓРІСЊ)"}
            </label>
            {selectedSizes.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Р’С‹Р±СЂР°РЅРѕ: {selectedSizes.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            РЈРєР°Р¶РёС‚Рµ СЂР°Р·РјРµСЂС‹, РєРѕС‚РѕСЂС‹Рµ РµСЃС‚СЊ Сѓ РІР°СЃ РІ РЅР°Р»РёС‡РёРё. РџРѕРєСѓРїР°С‚РµР»Рё СЃРјРѕРіСѓС‚ РІС‹Р±СЂР°С‚СЊ РЅСѓР¶РЅС‹Р№ СЂР°Р·РјРµСЂ РїРµСЂРµРґ РѕР±СЂР°С‰РµРЅРёРµРј.
          </p>

          {/* РџСЂРµРґСѓСЃС‚Р°РЅРѕРІР»РµРЅРЅС‹Рµ СЂР°Р·РјРµСЂС‹ */}
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

          {/* Р”РѕР±Р°РІР»РµРЅРёРµ РЅРµСЃС‚Р°РЅРґР°СЂС‚РЅРѕРіРѕ СЂР°Р·РјРµСЂР° */}
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
              placeholder={selectedCategory === "РћР±СѓРІСЊ" ? "РЎРІРѕР№ СЂР°Р·РјРµСЂ (РЅР°РїСЂРёРјРµСЂ: 38.5, 41.5)" : "РЎРІРѕР№ СЂР°Р·РјРµСЂ (РЅР°РїСЂРёРјРµСЂ: 46-48, 110-116)"}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              disabled={!customSizeInput.trim()}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 shrink-0"
            >
              + Р”РѕР±Р°РІРёС‚СЊ
            </button>
          </div>

          {/* Р’С‹Р±СЂР°РЅРЅС‹Рµ РєР°СЃС‚РѕРјРЅС‹Рµ СЂР°Р·РјРµСЂС‹ */}
          {selectedSizes.filter((s) => !availablePresetSizes.includes(s)).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-gray-400">РџРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёРµ:</span>
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

      {/* Р¤РћРўРћР“Р РђР¤РР */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Р¤РѕС‚РѕРіСЂР°С„РёРё С‚РѕРІР°СЂР° (РјРёРЅРёРјСѓРј 1) <span className="text-red-500">*</span></label>
        
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {imageUrls.map((url: string, index: number) => (
              <div key={index} className="relative h-24 w-24 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <Image fill sizes="(max-width: 768px) 100vw, 20vw" src={url} alt={`Р¤РѕС‚Рѕ ${index + 1}`} className="object-cover" />
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
        
        <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:bg-gray-100 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>{uploadStatus || "РћРїС‚РёРјРёР·Р°С†РёСЏ Рё Р·Р°РіСЂСѓР·РєР°..."}</span>
              </>
            ) : (
              <span>+ Р’С‹Р±СЂР°С‚СЊ С„РѕС‚РѕРіСЂР°С„РёРё</span>
            )}
          </div>
          <span className="mt-1 text-xs text-gray-400">
            РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ СЃР¶Р°С‚РёРµ С„РѕС‚Рѕ (JPG, PNG, WebP РґРѕ 30 РњР‘, РјР°РєСЃ. 10 С„РѕС‚Рѕ)
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
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">Описание</label>
          <span className={`text-xs ${(watch("description") || "").length > 900 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
            {(watch("description") || "").length}/1000
          </span>
        </div>
        <textarea
          {...register("description")}
          id="description"
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
          ? (isEditing ? "РЎРѕС…СЂР°РЅРµРЅРёРµ..." : "РџСѓР±Р»РёРєР°С†РёСЏ...") 
          : imageUrls.length > 0 
            ? (isEditing ? "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ" : "РћРїСѓР±Р»РёРєРѕРІР°С‚СЊ РЅР° РІРёС‚СЂРёРЅРµ") 
            : "РЎРЅР°С‡Р°Р»Р° Р·Р°РіСЂСѓР·РёС‚Рµ С„РѕС‚Рѕ"
        }
      </button>
    </form>
  );
}