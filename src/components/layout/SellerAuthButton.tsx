"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function SellerAuthButton() {
  const { data: session } = useSession();
  const href = session ? "/dashboard" : "/login";

  return (
    <div className="group relative hidden md:block">
      <Link
        href={href}
        className="block rounded-full p-2 text-text-main transition-colors hover:bg-surface"
        aria-label="Авторизация для продавца"
      >
        <User className="h-5 w-5" />
      </Link>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-[#1D1D1F] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
      >
        Авторизация для продавца
      </span>
    </div>
  );
}
