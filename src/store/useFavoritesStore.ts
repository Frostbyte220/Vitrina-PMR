"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favorites: string[]; // Массив ID понравившихся товаров
  /** true, пока идёт первичная загрузка с сервера */
  synced: boolean;
  toggleFavorite: (productId: string) => void;
  /** Загрузить избранное с сервера (вызывается один раз при инициализации) */
  syncFromServer: () => Promise<void>;
  /** Полностью заменить список (используется после server-sync) */
  setFavorites: (ids: string[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      synced: false,

      setFavorites: (ids) => {
        set({ favorites: ids, synced: true });
      },

      /**
       * Вызывается один раз при монтировании (в FavoritesSyncProvider).
       * Для авторизованного пользователя: объединяет локальный стор с сервером
       * (приоритет у сервера — если товар удалён с другого устройства, он исчезает).
       */
      syncFromServer: async () => {
        if (get().synced) return;

        try {
          const res = await fetch("/api/favorites", { cache: "no-store" });
          if (!res.ok) {
            // Не авторизован — оставляем локальный стор
            set({ synced: true });
            return;
          }
          const data: { favorites: string[] } = await res.json();

          // Объединяем: serverFavorites + локальные которых нет на сервере
          // Приоритет у сервера (удалённые с другого устройства не восстанавливаем)
          const localFavs = get().favorites;
          const serverSet = new Set(data.favorites);
          // Добавляем локальные, которых ещё нет на сервере (добавлены офлайн)
          const offlineAdded = localFavs.filter((id) => !serverSet.has(id));

          const merged = [...data.favorites, ...offlineAdded];

          // Если есть офлайн-добавления — сохраняем на сервере
          if (offlineAdded.length > 0) {
            await fetch("/api/favorites", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ favorites: merged }),
            });
          }

          set({ favorites: merged, synced: true });
        } catch {
          // Сеть недоступна — работаем с localStorage
          set({ synced: true });
        }
      },

      toggleFavorite: async (productId: string) => {
        const currentFavorites = get().favorites;
        const isNowFav = currentFavorites.includes(productId);

        // Оптимистичное обновление UI
        const newFavorites = isNowFav
          ? currentFavorites.filter((id) => id !== productId)
          : [...currentFavorites, productId];
        set({ favorites: newFavorites });

        // Фоновая синхронизация с сервером (fire-and-forget, ошибки не крашат UI)
        try {
          await fetch("/api/favorites", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        } catch {
          // Нет сети — изменение уже сохранено в localStorage через persist,
          // при следующем syncFromServer офлайн-добавления будут залиты на сервер
        }
      },
    }),
    {
      name: "vitrina-favorites", // Ключ в localStorage (обратно совместимо)
      partialize: (state) => ({ favorites: state.favorites }), // synced не сохраняем
    }
  )
);
