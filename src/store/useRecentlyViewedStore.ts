import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 15;
const COOKIE_NAME = "pmr_recently_viewed";

// Синхронизация списка просмотренных товаров с куками для SSR и SEO
function syncCookie(ids: string[]) {
  if (typeof document === "undefined") return;
  try {
    const value = ids.slice(0, MAX_RECENTLY_VIEWED).join(",");
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {}
}

function clearCookie() {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {}
}

function getCookieIds(): string[] {
  if (typeof document === "undefined") return [];
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]).split(",").filter(Boolean);
    }
  } catch {}
  return [];
}

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
        const updated = [productId, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
        set({ recentlyViewed: updated });
        syncCookie(updated);
      },

      removeProduct: (productId: string) => {
        const updated = get().recentlyViewed.filter((id) => id !== productId);
        set({ recentlyViewed: updated });
        syncCookie(updated);
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
        clearCookie();
      },
    }),
    {
      name: "vitrina-recently-viewed", // Ключ в localStorage
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const cookieIds = getCookieIds();
        // Если в localStorage пусто, но есть данные в куках — восстанавливаем
        if (state.recentlyViewed.length === 0 && cookieIds.length > 0) {
          state.recentlyViewed = cookieIds;
        } else if (state.recentlyViewed.length > 0) {
          // Иначе актуализируем куки из localStorage
          syncCookie(state.recentlyViewed);
        }
      },
    }
  )
);
