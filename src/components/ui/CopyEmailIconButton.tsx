"use client";

import { Mail } from "lucide-react";
import toast from "react-hot-toast";

export function CopyEmailIconButton({ email }: { email: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    toast.success("Почта скопирована!", {
      icon: "📋",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center justify-center rounded-full bg-gray-50 p-2.5 text-gray-400 outline outline-1 outline-gray-200 transition-all hover:bg-rose-50 hover:text-rose-600 hover:outline-rose-200"
      aria-label="Скопировать почту"
      title="Скопировать email"
    >
      <Mail className="h-5 w-5" />
    </button>
  );
}
