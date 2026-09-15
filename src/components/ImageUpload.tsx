"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const onUpload = (result: any) => {
    // Вытаскиваем безопасную ссылку на загруженную картинку
    onChange(result.info.secure_url);
  };

  return (
    <div className="mb-4">
      {value ? (
        <div className="relative h-48 w-48 overflow-hidden rounded-lg border border-border">
          <Image fill sizes="192px" className="object-cover" alt="Upload" src={value} />
          {/* Кнопка удаления картинки */}
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-lg bg-red-500 p-2 text-white shadow-sm transition hover:bg-red-600"
            type="button"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <CldUploadWidget 
          onSuccess={onUpload} 
          signatureEndpoint="/api/cloudinary/sign"
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface p-8 text-text-muted transition hover:bg-surface/80 hover:opacity-70"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Загрузить фото товара</span>
              </button>
            );
          }}
        </CldUploadWidget>
      )}
    </div>
  );
}