"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ShieldAlert,
  LogOut,
  PlusCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface ImpersonationBannerProps {
  targetName: string;
  targetEmail: string;
  storeSlug?: string | null;
}

export function ImpersonationBanner({
  targetName,
  targetEmail,
  storeSlug,
}: ImpersonationBannerProps) {
  const { update } = useSession();
  const [isExiting, setIsExiting] = useState(false);

  const handleStopImpersonation = async () => {
    setIsExiting(true);
    try {
      await update({ stopImpersonate: true });
      toast.success("Вы вернулись в аккаунт администратора");
      window.location.assign("/admin");
    } catch {
      toast.error("Не удалось выйти из режима просмотра кабинета");
      setIsExiting(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-2.5 shadow-xs md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-2xs">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="min-w-0 text-xs sm:text-sm text-amber-950">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Режим админа
              </span>
              <span className="font-semibold truncate">
                Кабинет: «{targetName}»
              </span>
              <span className="hidden lg:inline text-amber-800/80 font-mono text-xs">
                ({targetEmail})
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Добавляемые и редактируемые товары сохраняются напрямую на страницу этого магазина.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Добавить товар</span>
          </Link>

          {storeSlug && (
            <a
              href={`/shop/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100/60 transition-colors"
            >
              <span>Витрина</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={handleStopImpersonation}
            disabled={isExiting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-gray-800 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isExiting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>{isExiting ? "Возврат..." : "Вернуться в админку"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReturnToAdminButton() {
  const { update } = useSession();
  const [isExiting, setIsExiting] = useState(false);

  const handleStop = async () => {
    setIsExiting(true);
    try {
      await update({ stopImpersonate: true });
      window.location.assign("/admin");
    } catch {
      toast.error("Не удалось вернуться в админку");
      setIsExiting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleStop}
      disabled={isExiting}
      className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors disabled:opacity-60 cursor-pointer"
    >
      {isExiting ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{isExiting ? "Возврат..." : "Выйти из кабинета продавца и вернуться в админку"}</span>
    </button>
  );
}
