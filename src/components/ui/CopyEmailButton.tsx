"use client";

import { Mail } from "lucide-react";
import toast from "react-hot-toast";

export function CopyEmailButton({ email }: { email: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    toast.success("Адрес почты скопирован!", {
      icon: '📋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-rose-700 hover:shadow-md sm:w-auto"
      type="button"
    >
      <Mail className="h-4 w-4" />
      Связаться с нами
    </button>
  );
}