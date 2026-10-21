"use client";

import type { ReactNode } from "react";
import toast from "react-hot-toast";

interface ToastContextValue {
  showToast: (message: string) => void;
  success?: (message: string) => void;
  error?: (message: string) => void;
}

/**
 * Унифицированный хук уведомлений, использующий единый react-hot-toast.
 * Больше не требует контекста ToastProvider.
 */
export function useToast(): ToastContextValue {
  return {
    showToast: (message: string) => toast(message),
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
  };
}

/**
 * @deprecated Оставлен для обратной совместимости, ничего не рендерит
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
