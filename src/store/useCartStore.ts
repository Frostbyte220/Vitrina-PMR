import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatPrice } from "@/lib/utils";

export interface CartStoreContacts {
  instagram?: string | null;
  telegram?: string | null;
  viber?: string | null;
  phone?: string | null;
}

export interface CartItem {
  id: string; // Уникальный ключ: `${productId}_${selectedSize || "default"}`
  productId: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  selectedSize?: string | null;
  quantity: number;

  // Данные магазина
  storeId?: string | null;
  storeName: string;
  storeSlug?: string | null;
  storeAvatar?: string | null;
  isVerified?: boolean;
  contacts?: CartStoreContacts | null;
}

export interface StoreCartGroup {
  storeKey: string;
  storeName: string;
  storeSlug?: string | null;
  storeAvatar?: string | null;
  isVerified?: boolean;
  contacts?: CartStoreContacts | null;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
}

interface CartState {
  items: CartItem[];
  
  // Экшены управления корзиной
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { id?: string; quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, deltaOrExact: number, isAbsolute?: boolean) => void;
  clearStore: (storeKey: string) => void;
  clearCart: () => void;

  // Селекторы / вычисляемые данные
  getTotalCount: () => number;
  getTotalPrice: () => number;
  getStoreGroups: () => StoreCartGroup[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (itemData) => {
        const sizeKey = itemData.selectedSize?.trim() || "default";
        const itemId = itemData.id || `${itemData.productId}_${sizeKey}`;
        const addQty = itemData.quantity && itemData.quantity > 0 ? itemData.quantity : 1;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((it) => it.id === itemId);

        if (existingIndex > -1) {
          // Если товар с таким ID и размером уже есть — увеличиваем количество
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + addQty,
          };
          set({ items: updated });
        } else {
          // Добавляем новый товар
          const newItem: CartItem = {
            ...itemData,
            id: itemId,
            quantity: addQty,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((it) => it.id !== id) });
      },

      updateQuantity: (id, deltaOrExact, isAbsolute = false) => {
        const currentItems = get().items;
        const existing = currentItems.find((it) => it.id === id);
        if (!existing) return;

        const newQty = isAbsolute ? deltaOrExact : existing.quantity + deltaOrExact;

        if (newQty <= 0) {
          // Если количество 0 или меньше — удаляем
          set({ items: currentItems.filter((it) => it.id !== id) });
        } else {
          set({
            items: currentItems.map((it) =>
              it.id === id ? { ...it, quantity: newQty } : it
            ),
          });
        }
      },

      clearStore: (storeKey) => {
        set({
          items: get().items.filter((it) => {
            const currentStoreKey = it.storeId || it.storeSlug || it.storeName || "unknown";
            return currentStoreKey !== storeKey;
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getStoreGroups: () => {
        const items = get().items;
        const groupsMap = new Map<string, StoreCartGroup>();

        for (const item of items) {
          const storeKey = item.storeId || item.storeSlug || item.storeName || "other";

          if (!groupsMap.has(storeKey)) {
            groupsMap.set(storeKey, {
              storeKey,
              storeName: item.storeName || "Магазин",
              storeSlug: item.storeSlug || null,
              storeAvatar: item.storeAvatar || null,
              isVerified: item.isVerified || false,
              contacts: item.contacts || null,
              items: [],
              totalPrice: 0,
              totalQuantity: 0,
            });
          }

          const group = groupsMap.get(storeKey)!;
          group.items.push(item);
          group.totalPrice += item.price * item.quantity;
          group.totalQuantity += item.quantity;
        }

        return Array.from(groupsMap.values());
      },
    }),
    {
      name: "vitrina-cart",
    }
  )
);

/**
 * Генерирует форматированный текст сообщения для заказа в конкретном магазине
 */
export function generateStoreOrderMessage(group: StoreCartGroup): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://www.e-vitrina.com";

  const itemsList = group.items
    .map((item, idx) => {
      const sizeStr = item.selectedSize ? ` (Размер: ${item.selectedSize})` : "";
      const unitPriceStr = formatPrice(item.price);
      const totalItemStr = formatPrice(item.price * item.quantity);
      const qtyStr =
        item.quantity > 1
          ? ` — ${item.quantity} шт. × ${unitPriceStr} = ${totalItemStr}`
          : ` — ${unitPriceStr}`;
      const productLink = `${origin}/product/${item.productId}`;

      return `${idx + 1}. ${item.title}${sizeStr}${qtyStr}\n   ${productLink}`;
    })
    .join("\n\n");

  const totalSumStr = formatPrice(group.totalPrice);
  const totalCount = group.totalQuantity;
  const countWord =
    totalCount === 1 ? "товар" : totalCount > 1 && totalCount < 5 ? "товара" : "товаров";

  return `Здравствуйте! Хочу оформить заказ с Витрины ПМР:\n\n${itemsList}\n\nИтого (${totalCount} ${countWord}): ${totalSumStr}\nМагазин: ${group.storeName}`;
}
