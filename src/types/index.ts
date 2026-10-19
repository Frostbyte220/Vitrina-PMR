export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  category: string; // Обязательное поле для фильтрации на главной витрине
  subCategory?: string | null; // <-- ДОБАВЛЕНО НОВОЕ ПОЛЕ
  images: string[];
  shopName: string;
  shopUsername: string;
  description?: string | null; 
  sizes?: string[]; 
  
  // --- Новые поля из базы данных ---

  // Статус товара (например, "Активен" или "Скрыт")
  status?: string;
  
  // ID продавца
  userId?: string | null;
  
  // Данные профиля продавца (нужны для кнопок в карточке)
  user?: {
    id: string;
    name: string;
    instagram: string;
    store?: {
      name?: string | null;
      slug?: string | null;
      instagram?: string | null;
      telegram?: string | null;
      viber?: string | null;
      phone?: string | null;
      isVerified?: boolean | null;
    } | null;
  } | null;

  store?: {
    name?: string | null;
    slug?: string | null;
    instagram?: string | null;
    telegram?: string | null;
    viber?: string | null;
    phone?: string | null;
    isVerified?: boolean | null;
  } | null;

  // Даты создания и обновления
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoreType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  instagram?: string | null;
  phone?: string | null;
  telegram?: string | null;
  viber?: string | null;
  cities: string[];
  avatarUrl?: string | null;
  coverUrl?: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
}