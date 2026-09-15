"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
  variant?: "sidebar" | "mobile";
}

export function SignOutButton({
  className = "",
  variant = "sidebar",
}: SignOutButtonProps) {
  const baseStyles =
    variant === "sidebar"
      ? "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text-main"
      : "flex flex-col items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-primary";

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`${baseStyles} ${className}`}
    >
      <LogOut className={variant === "sidebar" ? "h-5 w-5" : "h-6 w-6"} />
      {variant === "sidebar" ? "Выйти" : <span>Выйти</span>}
    </button>
  );
}
