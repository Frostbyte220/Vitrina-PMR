"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFavoritesStore } from "@/store/useFavoritesStore";

/**
 * FavoritesSyncProvider
 *
 * Монтируется один раз в корневом layout (внутри SessionProvider).
 * Для авторизованных пользователей — загружает избранное с сервера
 * и объединяет с локальным localStorage-стором.
 *
 * Не рендерит DOM-узлов — только side-effect при mount.
 */
export function FavoritesSyncProvider() {
  const { status } = useSession();
  const syncFromServer = useFavoritesStore((s) => s.syncFromServer);
  const synced = useFavoritesStore((s) => s.synced);

  useEffect(() => {
    // Синхронизируем только когда сессия подтверждена и ещё не синхронизировались
    if (status === "authenticated" && !synced) {
      syncFromServer();
    }
  }, [status, synced, syncFromServer]);

  return null;
}
