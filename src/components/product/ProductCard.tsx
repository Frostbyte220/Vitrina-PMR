"use client";

import Image from "next/image";
import Link from "next/link";
import { Store, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { ContactSellerButton } from "./ContactSellerButton";
import { FavoriteButton } from "./FavoriteButton"; 

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
    } | null;
    shopUsername?: string;
    shopName?: string;
    image?: string | null;
  };
}

import { motion } from "framer-motion";

export function ProductCard({ product }: ProductCardProps) {
  // Приоритет данных магазина, затем юзера
  // Используем prod вместо p чтобы избежать конфликта с JSX <p> тегом
  const prod = product as Record<string, any>;
  
  const rawInstagram = product.store?.instagram || prod.user?.store?.instagram || product.user?.instagram || product.shopUsername;
  const cleanInstagram = rawInstagram ? rawInstagram.trim().replace(/^@/, "") : "";
  
  const displayName = product.store?.name || prod.user?.store?.name || product.user?.name || product.shopName || "Магазин";
  const displayUsername = cleanInstagram ? `@${cleanInstagram}` : displayName;

  const shopHref = cleanInstagram ? `/shop/${cleanInstagram}` : "#";

  // Реальный город из данных магазина (первый из массива cities)
  const storeCities: string[] | undefined = prod.store?.cities || prod.user?.store?.cities;
  const cityLabel = storeCities && storeCities.length > 0 ? storeCities[0] : null;

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

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-shadow duration-300 hover:shadow-xl"
    >
      
      {/* 1. Шапка продавца */}
      <Link 
        href={shopHref} 
        className="flex items-center gap-2 p-3 group/header hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 border border-gray-200 shrink-0">
          {avatarSrc ? (
            <Image 
              src={avatarSrc} 
              alt={displayName} 
              fill 
              sizes="32px"
              className="object-cover" 
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-orange-100 text-xs font-bold text-rose-800">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold text-gray-900 group-hover/header:text-rose-700 transition-colors">
            {displayUsername}
          </span>
          <span className="truncate text-[11px] text-gray-500 flex items-center gap-0.5">
            {cityLabel && <><MapPin className="h-3 w-3" /> {cityLabel}</>}
          </span>
        </div>
      </Link>

      {/* 2. Фото товара + Кнопка Избранного */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface/50">
        <FavoriteButton productId={product.id} />
        <Link 
          href={`/product/${product.id}`} 
          className="block h-full w-full"
          suppressHydrationWarning
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
              Нет фото
            </div>
          )}
        </Link>
      </div>
        
      {/* 3. Инфо и кнопки */}
      <div className="flex flex-col p-4 flex-grow justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <Link href={`/product/${product.id}`}>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-text-main hover:text-rose-700 transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-1">
          <ContactSellerButton
            productName={product.title}
            productPrice={product.price}
            shopUsername={cleanInstagram}
            isCardView={true} 
          />

          {cleanInstagram && (
            <Link
              href={shopHref}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Store className="h-4 w-4" />
              В магазин
            </Link>
          )}
        </div>
      </div>
      
    </motion.div>
  );
}