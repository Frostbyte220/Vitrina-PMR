"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store, MapPin, ShoppingBag, Check } from "lucide-react";
import { formatPrice, cloudinaryLoader, BLUR_DATA_URL } from "@/lib/utils";
import type { Product } from "@/types";
import { ContactSellerButton } from "./ContactSellerButton";
import { FavoriteButton } from "./FavoriteButton";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product & {
    user?: {
      name?: string | null;
      instagram?: string | null;
      image?: string | null;
      avatar?: string | null;
    } | null;
    store?: {
      name?: string | null;
      slug?: string | null;
      instagram?: string | null;
      avatarUrl?: string | null;
      isVerified?: boolean | null;
    } | null;
    shopUsername?: string;
    shopName?: string;
    image?: string | null;
  };
  priority?: boolean;
  activeCities?: string[];
}

export function ProductCard({ product, priority = false, activeCities }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Приоритет данных магазина, затем юзера
  // Используем prod вместо p чтобы избежать конфликта с JSX <p> тегом
  const prod = product as Record<string, any>;
  
  const rawInstagram = product.store?.instagram || prod.user?.store?.instagram || product.user?.instagram || product.shopUsername;
  const cleanInstagram = rawInstagram ? rawInstagram.trim().replace(/^@/, "") : "";
  
  const displayName = product.store?.name || prod.user?.store?.name || product.user?.name || product.shopName || "Магазин";
  const displayUsername = cleanInstagram ? `@${cleanInstagram}` : displayName;

  const shopHref = cleanInstagram ? `/shop/${cleanInstagram}` : "#";

  const storeCities: string[] | undefined = prod.store?.cities || prod.user?.store?.cities;
  
  // Динамически определяем отображаемый город:
  // Если в фильтре выбран город (например, Тирасполь) и магазин там работает,
  // показываем именно Тирасполь (+ остальные города), а не случайный первый город из БД.
  const cityLabel = useMemo(() => {
    if (!storeCities || storeCities.length === 0) return null;

    const matched = activeCities && activeCities.length > 0
      ? storeCities.filter((c) => activeCities.includes(c))
      : [];

    if (matched.length > 0) {
      const otherCount = storeCities.length - matched.length;
      return otherCount > 0
        ? `${matched.join(", ")} (+${otherCount})`
        : matched.join(", ");
    }

    if (storeCities.length <= 2) {
      return storeCities.join(", ");
    }
    return `${storeCities[0]} (+${storeCities.length - 1})`;
  }, [storeCities, activeCities]);

  const storeData = product.store || prod.user?.store;
  const storeContacts = {
    instagram: cleanInstagram || null,
    telegram: storeData?.telegram || null,
    viber: storeData?.viber || null,
    phone: storeData?.phone || null,
  };

  const imageUrl = 
    (Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null) || 
    prod.image || 
    null;

  // 🔥 Собираем аватарку из всех возможных колонок (включая store.avatarUrl и user.avatar)
  const avatarSrc = 
    product.store?.avatarUrl || 
    prod.store?.avatarUrl || 
    prod.user?.store?.avatarUrl ||
    product.user?.avatar || 
    product.user?.image || 
    prod.user?.avatar || 
    prod.user?.image || 
    null;

  const isVerified = Boolean(
    product.store?.isVerified || 
    prod.store?.isVerified || 
    prod.user?.store?.isVerified
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      image: imageUrl || "",
      selectedSize: Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes[0] : null,
      storeId: (product as any).storeId || (prod.store as any)?.id || (prod.user?.store as any)?.id || null,
      storeName: displayName,
      storeSlug: cleanInstagram || null,
      storeAvatar: avatarSrc,
      isVerified,
      contacts: storeContacts,
    });

    setIsAddedToCart(true);
    toast.success(`«${product.title}» добавлен в корзину!`);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      
      {/* 1. Шапка продавца */}
      <Link 
        href={shopHref} 
        className="flex items-center gap-2 p-3 group/header hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
          {avatarSrc && !avatarError ? (
            <Image 
              src={avatarSrc} 
              alt={displayName} 
              fill 
              loader={cloudinaryLoader}
              sizes="32px"
              className="object-cover" 
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-orange-100 text-xs font-bold text-rose-800">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="truncate text-sm font-semibold text-gray-900 group-hover/header:text-rose-700 transition-colors">
              {displayUsername}
            </span>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>
          <span 
            className="truncate text-[11px] text-gray-500 flex items-center gap-0.5"
            title={storeCities && storeCities.length > 0 ? `Города доставки: ${storeCities.join(", ")}` : undefined}
          >
            {cityLabel && <><MapPin className="h-3 w-3 shrink-0 text-gray-400" /> {cityLabel}</>}
          </span>
        </div>
      </Link>

      {/* 2. Фото товара + Кнопка Избранного + Бейдж скидки */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface/50">
        <FavoriteButton productId={product.id} />
        {product.oldPrice && product.oldPrice > product.price && (
          <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-md shadow-rose-600/30 tracking-tight">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          </div>
        )}
        <Link 
          href={`/product/${product.id}`} 
          className="block h-full w-full"
          prefetch={true}
          suppressHydrationWarning
        >
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              loader={cloudinaryLoader}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-xs font-medium text-gray-400 gap-2 p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              </div>
              <span className="line-clamp-2 max-w-[130px] text-[11px] text-gray-400">{product.title}</span>
            </div>
          )}
        </Link>
      </div>
        
      {/* 3. Инфо и кнопки */}
      <div className="flex flex-col p-4 flex-grow justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-bold ${product.oldPrice && product.oldPrice > product.price ? "text-rose-600" : "text-primary"}`}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs font-medium text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <Link href={`/product/${product.id}`} prefetch={true}>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-text-main hover:text-rose-700 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Бейджи размеров (только если есть и категория одежда/обувь) */}
          {Array.isArray(prod.sizes) && prod.sizes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1" aria-label="Доступные размеры">
              {(prod.sizes as string[]).slice(0, 5).map((size: string) => (
                <span
                  key={size}
                  className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 leading-tight"
                >
                  {size}
                </span>
              ))}
              {prod.sizes.length > 5 && (
                <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 leading-tight">
                  +{prod.sizes.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 min-w-0">
              <ContactSellerButton
                productId={product.id}
                productName={product.title}
                productPrice={product.price}
                shopUsername={cleanInstagram}
                contacts={storeContacts}
                isCardView={true} 
              />
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border transition-all shadow-2xs active:scale-95 ${
                isAddedToCart
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              }`}
              title={isAddedToCart ? "Добавлено в корзину" : "Добавить в корзину"}
              aria-label="Добавить в корзину"
            >
              {isAddedToCart ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </button>
          </div>

          {cleanInstagram && (
            <Link
              href={shopHref}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gray-100 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Store className="h-4 w-4 shrink-0" />
              <span>В магазин</span>
            </Link>
          )}
        </div>
      </div>
      
    </div>
  );
}
