export interface Product {
  id: string;
  title: string;
  price: number;
  category: string; // Обязательное поле для фильтрации на главной витрине
  subCategory?: string | null; // <-- ДОБАВЛЕНО НОВОЕ ПОЛЕ
  images: string[];
  shopName: string;
  shopUsername: string;
  description?: string | null; 
  
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
  } | null;

  // Даты создания и обновления
  createdAt?: Date;
  updatedAt?: Date;
}