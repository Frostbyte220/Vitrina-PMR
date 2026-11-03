import { create } from "zustand";

interface CatalogFilterState {
  // Категории и пагинация
  selectedCategory: string | null;
  selectedSubCategory: string | null;
  currentPage: number;

  // Быстрые фильтры (теперь тоже в сторе)
  sort: string;
  discount: boolean;
  availability: string | null;
  minPrice: string;
  maxPrice: string;
  cities: string[];
  sizes: string[];

  isInitialized: boolean;

  // Сеттеры
  setCategory: (category: string | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  setPage: (page: number) => void;
  setSort: (sort: string) => void;
  setDiscount: (v: boolean) => void;
  setAvailability: (v: string | null) => void;
  setPriceRange: (min: string, max: string) => void;
  setCities: (cities: string[]) => void;
  setSizes: (sizes: string[]) => void;

  initFromUrl: (params: URLSearchParams) => void;
  resetFilters: () => void;
}

/** Синхронизирует URL без навигации Next.js (0 мс, нет сетевого запроса) */
function syncUrl(url: URL) {
  if (typeof window === "undefined") return;
  try {
    window.history.replaceState({}, "", url.pathname + url.search);
  } catch {
    // Безопасный fallback
  }
}

/** Строит URL на основе полного состояния стора */
function buildUrl(state: CatalogFilterState): URL {
  const url = new URL(window.location.href);

  // Категория
  if (state.selectedCategory && state.selectedCategory !== "Все") {
    url.searchParams.set("category", state.selectedCategory);
  } else {
    url.searchParams.delete("category");
  }

  // Подкатегория
  if (state.selectedSubCategory) {
    url.searchParams.set("sub", state.selectedSubCategory);
  } else {
    url.searchParams.delete("sub");
  }

  // Пагинация
  if (state.currentPage > 1) {
    url.searchParams.set("page", state.currentPage.toString());
  } else {
    url.searchParams.delete("page");
  }

  // Сортировка
  if (state.sort && state.sort !== "newest") {
    url.searchParams.set("sort", state.sort);
  } else {
    url.searchParams.delete("sort");
  }

  // Скидка
  if (state.discount) {
    url.searchParams.set("discount", "true");
  } else {
    url.searchParams.delete("discount");
  }

  // Наличие
  if (state.availability) {
    url.searchParams.set("availability", state.availability);
  } else {
    url.searchParams.delete("availability");
  }

  // Цена
  if (state.minPrice) {
    url.searchParams.set("minPrice", state.minPrice);
  } else {
    url.searchParams.delete("minPrice");
  }

  if (state.maxPrice) {
    url.searchParams.set("maxPrice", state.maxPrice);
  } else {
    url.searchParams.delete("maxPrice");
  }

  // Города
  if (state.cities.length > 0) {
    url.searchParams.set("cities", state.cities.join(","));
  } else {
    url.searchParams.delete("cities");
  }

  // Размеры
  if (state.sizes.length > 0) {
    url.searchParams.set("sizes", state.sizes.join(","));
  } else {
    url.searchParams.delete("sizes");
  }

  return url;
}

export const useCatalogFilterStore = create<CatalogFilterState>((set, get) => ({
  selectedCategory: null,
  selectedSubCategory: null,
  currentPage: 1,
  sort: "newest",
  discount: false,
  availability: null,
  minPrice: "",
  maxPrice: "",
  cities: [],
  sizes: [],
  isInitialized: false,

  setCategory: (category) => {
    const nextCat = category === "Все" ? null : category;
    // При смене категории сбрасываем подкатегорию и размеры (они зависят от категории)
    set((s) => ({
      selectedCategory: nextCat,
      selectedSubCategory: null,
      currentPage: 1,
      sizes: nextCat === "Одежда" || nextCat === "Обувь" ? s.sizes : [],
    }));
    syncUrl(buildUrl(get()));
  },

  setSubCategory: (subCategory) => {
    set({ selectedSubCategory: subCategory, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  setPage: (page) => {
    set({ currentPage: page });
    syncUrl(buildUrl(get()));
  },

  setSort: (sort) => {
    set({ sort, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  setDiscount: (discount) => {
    set({ discount, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  setAvailability: (availability) => {
    set({ availability, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  setPriceRange: (min, max) => {
    set({ minPrice: min, maxPrice: max, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  setCities: (cities) => {
    set({ cities, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  setSizes: (sizes) => {
    set({ sizes, currentPage: 1 });
    syncUrl(buildUrl(get()));
  },

  initFromUrl: (params) => {
    const cat = params.get("category");
    const normalizedCat = cat === "Все" ? null : cat;
    set({
      selectedCategory: normalizedCat,
      selectedSubCategory: params.get("sub") || null,
      currentPage: Number(params.get("page")) || 1,
      sort: params.get("sort") || "newest",
      discount: params.get("discount") === "true",
      availability: params.get("availability") || null,
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      cities: params.get("cities") ? params.get("cities")!.split(",").filter(Boolean) : [],
      sizes: params.get("sizes") ? params.get("sizes")!.split(",").map(s => s.trim()).filter(Boolean) : [],
      isInitialized: true,
    });
  },

  resetFilters: () => {
    set({
      sort: "newest",
      discount: false,
      availability: null,
      minPrice: "",
      maxPrice: "",
      cities: [],
      sizes: [],
      currentPage: 1,
    });
    syncUrl(buildUrl(get()));
  },
}));
