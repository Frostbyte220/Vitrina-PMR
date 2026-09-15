import { z } from "zod";

export const CATEGORIES = [
  "Одежда",
  "Обувь",
  "Косметика",
  "Парфюмерия",
  "Детские товары",
  "Handmade",
  "Электроника",
  "Дом и декор",
  "Подарки",
  "Еда и десерты",
  "Спорт и отдых",
];

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
  
  category: z
    .string()
    .min(1, "Пожалуйста, выберите категорию")
    .refine((val) => CATEGORIES.includes(val), "Выбрана недопустимая категория"),

  // Добавлено поле подкатегории, чтобы бэкенд пропускал это значение в БД
  subCategory: z
    .string()
    .optional(),
  
  images: z
    .array(
      z.string().url("Некорректная ссылка на изображение")
    )
    .min(1, "Добавьте хотя бы одно изображение"),
});

export type ProductFormData = z.infer<typeof productSchema>;