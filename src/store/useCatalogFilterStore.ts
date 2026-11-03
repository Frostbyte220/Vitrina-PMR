import { create } from "zustand";

interface CatalogFilterState {
  selectedCategory: string | null;
  selectedSubCategory: string | null;
  currentPage: number;
  isInitialized: boolean;
  setCategory: (category: string | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  setPage: (page: number) => void;
  initFromUrl: (category: string | null, subCategory: string | null, page?: number | null) => void;
  resetFilters: () => void;
}

function syncUrl(category: string | null, subCategory: string | null, page: number = 1) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (category && category !== "Все") {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    if (subCategory) {
      url.searchParams.set("sub", subCategory);
    } else {
      url.searchParams.delete("sub");
    }
    if (page > 1) {
      url.searchParams.set("page", page.toString());
    } else {
      url.searchParams.delete("page");
    }
    window.history.replaceState({}, "", url.pathname + url.search);
  } catch {
    // Безопасный fallback
  }
}

export const useCatalogFilterStore = create<CatalogFilterState>((set, get) => ({
  selectedCategory: null,
  selectedSubCategory: null,
  currentPage: 1,
  isInitialized: false,

  setCategory: (category) => {
    const nextCat = category === "Все" ? null : category;
    set({ selectedCategory: nextCat, selectedSubCategory: null, currentPage: 1 });
    syncUrl(nextCat, null, 1);
  },

  setSubCategory: (subCategory) => {
    set({ selectedSubCategory: subCategory, currentPage: 1 });
    syncUrl(get().selectedCategory, subCategory, 1);
  },

  setPage: (page) => {
    set({ currentPage: page });
    syncUrl(get().selectedCategory, get().selectedSubCategory, page);
  },

  initFromUrl: (category, subCategory, page) => {
    const cat = category === "Все" ? null : category;
    set({
      selectedCategory: cat,
      selectedSubCategory: subCategory || null,
      currentPage: page && page > 0 ? page : 1,
      isInitialized: true,
    });
  },

  resetFilters: () => {
    set({ selectedCategory: null, selectedSubCategory: null, currentPage: 1 });
    syncUrl(null, null, 1);
  },
}));
