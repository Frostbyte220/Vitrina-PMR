"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
    >
      Выйти
    </button>
  );
}
