export type AvailabilityCode = "IN_STOCK" | "ON_ORDER" | "PRE_ORDER" | "SERVICE_ACTIVE" | "HOME_VISIT";

export interface AvailabilityConfig {
  code: AvailabilityCode;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  dotClass: string;
  iconColor: string;
}

export const AVAILABILITY_MAP: Record<AvailabilityCode, AvailabilityConfig> = {
  IN_STOCK: {
    code: "IN_STOCK",
    label: "В наличии",
    shortLabel: "В наличии",
    description: "Товар готов к отправке или покупке",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClass: "bg-emerald-500",
    iconColor: "text-emerald-600",
  },
  ON_ORDER: {
    code: "ON_ORDER",
    label: "Под заказ",
    shortLabel: "Под заказ",
    description: "Изготовление или доставка под клиента",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
    dotClass: "bg-blue-500",
    iconColor: "text-blue-600",
  },
  PRE_ORDER: {
    code: "PRE_ORDER",
    label: "Ожидается поступление",
    shortLabel: "Ожидается",
    description: "Скоро появится в магазине",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotClass: "bg-amber-500",
    iconColor: "text-amber-600",
  },
  SERVICE_ACTIVE: {
    code: "SERVICE_ACTIVE",
    label: "Принимает заказы",
    shortLabel: "Заказ",
    description: "Услуга доступна для записи и заказа",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClass: "bg-emerald-500",
    iconColor: "text-emerald-600",
  },
  HOME_VISIT: {
    code: "HOME_VISIT",
    label: "Выезд на дом",
    shortLabel: "Выезд",
    description: "Мастер выезжает к клиенту на дом или объект",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200/80",
    dotClass: "bg-teal-500",
    iconColor: "text-teal-600",
  },
};

export const AVAILABILITY_OPTIONS: AvailabilityConfig[] = [
  AVAILABILITY_MAP.IN_STOCK,
  AVAILABILITY_MAP.SERVICE_ACTIVE,
  AVAILABILITY_MAP.HOME_VISIT,
  AVAILABILITY_MAP.ON_ORDER,
  AVAILABILITY_MAP.PRE_ORDER,
];

/**
 * Нормализует любое значение наличия (русское или код) к стандартной конфигурации
 */
export function getAvailabilityInfo(val?: string | null): AvailabilityConfig {
  if (!val) return AVAILABILITY_MAP.IN_STOCK;

  const trimmed = val.trim().toLowerCase();

  if (
    trimmed === "home_visit" ||
    trimmed === "выезд на дом" ||
    trimmed.includes("выезд")
  ) {
    return AVAILABILITY_MAP.HOME_VISIT;
  }

  if (
    trimmed === "service_active" ||
    trimmed === "принимает заказы" ||
    trimmed === "запись открыта" ||
    trimmed.includes("запис")
  ) {
    return AVAILABILITY_MAP.SERVICE_ACTIVE;
  }

  if (
    trimmed === "on_order" ||
    trimmed === "под заказ" ||
    trimmed.includes("заказ")
  ) {
    return AVAILABILITY_MAP.ON_ORDER;
  }

  if (
    trimmed === "pre_order" ||
    trimmed === "ожидается" ||
    trimmed.includes("ожида")
  ) {
    return AVAILABILITY_MAP.PRE_ORDER;
  }

  return AVAILABILITY_MAP.IN_STOCK;
}
