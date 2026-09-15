"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";
import { registerRateLimiter } from "@/lib/rate-limit";

// 1. Создаем строгую схему валидации Zod
const registerSchema = z.object({
  name: z.string().min(2, "Название магазина слишком короткое").max(50, "Название слишком длинное"),
  instagram: z.string().min(2, "Некорректный username").max(30, "Слишком длинный username"),
  instagramLink: z.string().url("Укажите корректную ссылку (начинается с https://)"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").max(64, "Пароль слишком длинный"),
});

export async function registerUser(formData: FormData) {
  // 2. Защита от спама (Rate Limit). Блокируем, если больше 3 регистраций в минуту.
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "127.0.0.1";
  const isAllowed = await registerRateLimiter.check(ip);
  if (!isAllowed) {
    return { error: "Слишком много попыток регистрации. Подождите 1 минуту." };
  }

  // 3. Извлекаем данные из формы
  const rawData = {
    name: formData.get("name") as string,
    instagram: formData.get("instagram") as string,
    instagramLink: formData.get("instagramLink") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!rawData.name || !rawData.instagram || !rawData.instagramLink || !rawData.email || !rawData.password) {
    return { error: "Заполните все обязательные поля" };
  }

  // 4. Пропускаем данные через валидатор Zod
  const parsedData = registerSchema.safeParse(rawData);
  
if (!parsedData.success) {
    // Используем .issues вместо .errors и добавляем ?. перед массивом
    return { error: parsedData.error?.issues?.[0]?.message || "Проверьте правильность введенных данных" };
  }

  // Если всё отлично, берем очищенные данные
  const validData = parsedData.data;

  try {
    // 5. Проверяем, существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: validData.email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Пользователь с таким Email уже зарегистрирован" };
    }

    // 6. Хешируем пароль
    const hashedPassword = await bcrypt.hash(validData.password, 10);

    // 7. Сохраняем в базу данных
    await prisma.user.create({
      data: {
        name: validData.name,
        instagram: validData.instagram.replace("@", "").trim(),
        instagramUrl: validData.instagramLink.trim(),
        email: validData.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    return { error: "Не удалось зарегистрировать магазин" };
  }
}