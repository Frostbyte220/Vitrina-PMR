"use client";

import { useState } from "react";
import Image from "next/image";
import { Store, MapPin, Send, MessageCircle, Phone } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ShareButton } from "@/components/ui/ShareButton";

interface StoreHeaderHeroProps {
  name: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  isVerified?: boolean;
  cleanInstagram?: string | null;
  cities?: string[];
  telegram?: string | null;
  viber?: string | null;
  phone?: string | null;
  description?: string | null;
}

export function StoreHeaderHero({
  name,
  avatarUrl,
  coverUrl,
  isVerified = false,
  cleanInstagram,
  cities = [],
  telegram,
  viber,
  phone,
  description,
}: StoreHeaderHeroProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const storeInitial = (name?.trim()?.charAt(0) || "M").toUpperCase();

  const hasValidCover = Boolean(coverUrl && !coverError);
  const hasValidAvatar = Boolean(avatarUrl && !avatarError);

  return (
    <div className="w-full">
      {/* ── Обложка (Баннер) ── */}
      <div className="mx-auto max-w-7xl px-0 sm:px-4 lg:px-8 pt-0 sm:pt-4">
        <div className="relative h-52 sm:h-72 lg:h-80 w-full overflow-hidden sm:rounded-[2.5rem] shadow-sm">
          {hasValidCover ? (
            <>
              <Image
                src={coverUrl!}
                alt={`Обложка ${name}`}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover transition-transform duration-700 hover:scale-105"
                onError={() => setCoverError(true)}
              />
              {/* Мягкий полупрозрачный градиент для глубины и читаемости */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </>
          ) : (
            /* Дизайнерская заглушка, если обложка не загружена или не открылась */
            <div className="relative h-full w-full bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 overflow-hidden">
              {/* Декоративные мягкие круги и световые блики */}
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/5 blur-xl pointer-events-none" />

              {/* Фоновый легкий паттерн с названием магазина */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
                <span className="text-6xl sm:text-8xl font-black text-white tracking-widest uppercase truncate max-w-full px-6">
                  {name}
                </span>
              </div>
            </div>
          )}

          {/* Аккуратный бейдж в правом верхнем углу */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-xs select-none">
            <Store className="w-3.5 h-3.5 text-rose-200" />
            <span>Магазин в ПМР</span>
          </div>
        </div>
      </div>

      {/* ── Центральный блок информации ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative flex flex-col items-center mb-8 text-center">

          {/* Аватарка магазина с защитой от сломанного URL */}
          <div className="relative -mt-16 sm:-mt-22 mb-4 h-32 w-32 sm:h-44 sm:w-44 overflow-hidden rounded-full border-4 sm:border-6 border-white bg-white shadow-2xl shrink-0 z-20 ring-1 ring-black/10 transition-transform duration-300 hover:scale-105">
            {hasValidAvatar ? (
              <Image
                fill
                sizes="(max-width: 768px) 128px, 176px"
                src={avatarUrl!}
                alt=""
                className="object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white text-5xl sm:text-6xl font-black select-none shadow-inner tracking-wider">
                <span>{storeInitial}</span>
              </div>
            )}
          </div>

          {/* Название магазина и бейдж верификации */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {name}
            </h1>
            {isVerified && <VerifiedBadge size="lg" showText />}
          </div>

          {/* Контакты и кнопки связи */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-sm font-medium">
            {cleanInstagram && (
              <a
                href={`https://instagram.com/${cleanInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 shadow-sm border border-rose-100"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>@{cleanInstagram}</span>
              </a>
            )}

            {cities && cities.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-gray-700 shadow-sm border border-gray-200">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{cities.join(", ")}</span>
              </div>
            )}

            {telegram && (
              <a
                href={`https://t.me/${telegram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100 hover:text-sky-700 shadow-sm border border-sky-100"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>
            )}

            {viber && (
              <a
                href={`viber://chat?number=%2B${viber.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-700 shadow-sm border border-purple-100"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Viber</span>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>{phone}</span>
              </a>
            )}

            <ShareButton
              title={name}
              text={`Магазин «${name}» на E-Vitrina PMR — каталог товаров локального бренда`}
              subtitle={cities && cities.length > 0 ? cities.join(", ") : "Магазин в ПМР"}
              imageUrl={avatarUrl || coverUrl}
              variant="pill"
              label="Поделиться"
              modalTitle="Поделиться магазином"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 shadow-sm"
            />
          </div>

          {/* Описание магазина */}
          {description && (
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-gray-600 bg-white px-6 py-4 rounded-2xl border border-gray-200/80 shadow-xs">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
