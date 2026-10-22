export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  category: string; // Обязательное поле для фильтрации на главной витрине
  subCategory?: string | null;
  images: string[];
  shopName: string;
  shopUsername: string;
  description?: string | null; 
  sizes?: string[]; 
  
  // Статус товара (например, "Активен" или "Скрыт")
  status?: string;

  // Статус наличия ("В наличии", "Под заказ", "Ожидается")
  availability?: string | null;
  
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

  // Счетчики просмотров и переходов в контакты
  viewsCount?: number;
  contactClicksCount?: number;

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
  viewsCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}
