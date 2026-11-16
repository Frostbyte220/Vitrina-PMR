import { z } from "zod";
import { ALL_CATEGORIES } from "@/lib/constants/categories";

export const CATEGORIES = ALL_CATEGORIES as unknown as string[];

export const productVariantSchema = z.object({
  name: z.string().trim().min(1, "Укажите название объема или размера"),
  price: z.coerce.number().positive("Цена должна быть больше 0").max(1000000, "Цена не может превышать 1 000 000 руб."),
  oldPrice: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number({ message: "Введите корректное число" })
        .positive("Старая цена должна быть больше 0")
        .max(1000000, "Цена не может превышать 1 000 000 руб.")
        .nullable()
        .optional()
    )
    .optional(),
});

export type ProductVariantData = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Заголовок должен быть не короче 3 символов")
    .max(80, "Заголовок не должен превышать 80 символов"),
  
  description: z
    .string()
    .trim()
    .max(1000, "Описание не должно превышать 1000 символов")
    .optional()
    .or(z.literal("")),
  
  price: z
    .coerce
    .number()
    .positive("Укажите корректную цену больше 0")
    .max(1000000, "Цена не может превышать 1 000 000 руб."),

  oldPrice: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z
        .number({ message: "Введите корректное число" })
        .positive("Старая цена должна быть больше 0")
        .max(1000000, "Цена не может превышать 1 000 000 руб.")
        .nullable()
        .optional()
    )
    .optional(),
  
  category: z
    .string()
    .optional(),

  categories: z
    .array(
      z.string().refine((val) => CATEGORIES.includes(val), "Выбрана недопустимая категория")
    )
    .optional(),

  // Добавлено поле подкатегории, чтобы бэкенд пропускал это значение в БД
  subCategory: z
    .string()
    .optional(),

  // Статус наличия («В наличии», «Под заказ», «Ожидается»)
  availability: z
    .string()
    .default("В наличии")
    .optional(),
  
  sizes: z
    .array(z.string().trim().min(1))
    .default([])
    .optional(),

  variants: z
    .array(productVariantSchema)
    .optional()
    .nullable(),

  images: z
    .array(
      z.string().url("Некорректная ссылка на изображение")
    )
    .min(1, "Добавьте хотя бы одно изображение"),
}).refine(
  (data) => {
    const hasCategory = Boolean(data.category && CATEGORIES.includes(data.category));
    const hasCategories = Boolean(data.categories && data.categories.length > 0);
    return hasCategory || hasCategories;
  },
  {
    message: "Пожалуйста, выберите хотя бы одну категорию",
    path: ["categories"],
  }
).refine(
  (data) => !data.oldPrice || data.oldPrice > data.price,
  {
    message: "Старая цена должна быть выше текущей цены со скидкой",
    path: ["oldPrice"],
  }
);

export const CLOTHING_SIZES = [
  "XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "One Size",
  "40", "42", "44", "46", "48", "50", "52", "54", "56"
];

export const SHOE_SIZES = [
  "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"
];

export const PERFUME_VOLUME_PRESETS = [
  "2 мл", "3 мл", "5 мл", "10 мл", "15 мл", "20 мл", "30 мл", "50 мл", "100 мл"
];

export type ProductFormData = z.infer<typeof productSchema>;
