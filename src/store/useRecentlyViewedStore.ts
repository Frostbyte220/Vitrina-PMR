import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 15;

interface RecentlyViewedState {
  recentlyViewed: string[]; // Массив ID недавно просмотренных товаров (самые свежие первыми)
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearRecentlyViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],

      addProduct: (productId: string) => {
        if (!productId) return;
        const current = get().recentlyViewed;
        // Удаляем существующий ID, чтобы поднять его на 1-е место
        const filtered = current.filter((id) => id !== productId);
        // Добавляем в начало и ограничиваем 15 элементами
        set({
          recentlyViewed: [productId, ...filtered].slice(0, MAX_RECENTLY_VIEWED),
        });
      },

      removeProduct: (productId: string) => {
        set({
          recentlyViewed: get().recentlyViewed.filter((id) => id !== productId),
        });
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },
    }),
    {
      name: "vitrina-recently-viewed", // Ключ в localStorage
    }
  )
);
