import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[]; // Массив ID понравившихся товаров
  toggleFavorite: (productId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      toggleFavorite: (productId: string) => {
        const currentFavorites = get().favorites;
        
        if (currentFavorites.includes(productId)) {
          // Если уже есть в избранном — удаляем
          set({ favorites: currentFavorites.filter((id) => id !== productId) });
        } else {
          // Если нет — добавляем
          set({ favorites: [...currentFavorites, productId] });
        }
      },
    }),
    {
      name: 'vitrina-favorites', // Под этим именем данные будут лежать в браузере
    }
  )
);