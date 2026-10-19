import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type BannerItem = {
  id: string;
  title: string;
  sub: string | null;
  label: string | null;
  cta: string;
  href: string;
  bg: string;
  emoji: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
};

/**
 * Резервные баннеры на случай недоступности БД
 */
export const FALLBACK_BANNERS: BannerItem[] = [
  {
    id: "fallback-1",
    bg: "from-rose-600 to-rose-800",
    label: "Реклама",
    title: "Разместите магазин бесплатно",
    sub: "Тысячи покупателей ПМР увидят ваши товары уже сегодня",
    cta: "Зарегистрироваться",
    href: "/login",
    emoji: "🏪",
    imageUrl: null,
    isActive: true,
    order: 0,
  },
  {
    id: "fallback-2",
    bg: "from-violet-600 to-violet-800",
    label: "Партнёр",
    title: "SneakerHub PMR",
    sub: "Новая коллекция кроссовок — Nike, Adidas, New Balance",
    cta: "Смотреть товары",
    href: "/shop/sneakershub",
    emoji: "👟",
    imageUrl: null,
    isActive: true,
    order: 1,
  },
  {
    id: "fallback-3",
    bg: "from-emerald-600 to-emerald-800",
    label: "Акция",
    title: "BeautiBox — косметика ПМР",
    sub: "Уходовая косметика с доставкой по всему Приднестровью",
    cta: "Перейти в магазин",
    href: "/shop/beautibox",
    emoji: "💄",
    imageUrl: null,
    isActive: true,
    order: 2,
  },
  {
    id: "fallback-4",
    bg: "from-amber-500 to-orange-600",
    label: "Новинка",
    title: "Modny Shkaf — одежда",
    sub: "Стильная одежда для всей семьи — доставка по ПМР",
    cta: "Открыть каталог",
    href: "/shop/modny_shkaf",
    emoji: "👗",
    imageUrl: null,
    isActive: true,
    order: 3,
  },
];

/**
 * Кэшированное получение активных баннеров для главной страницы.
 * Сбрасывается через revalidateTag("banners").
 */
export const getBanners = unstable_cache(
  async (): Promise<BannerItem[]> => {
    try {
      const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      });
      if (banners.length > 0) return banners;
      return FALLBACK_BANNERS;
    } catch (e) {
      console.error("Ошибка загрузки баннеров из БД:", e);
      return FALLBACK_BANNERS;
    }
  },
  ["active-banners"],
  { revalidate: 300, tags: ["banners"] }
);
