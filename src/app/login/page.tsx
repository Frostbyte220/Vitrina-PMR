import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Вход и регистрация",
  description: "Вход и регистрация в личном кабинете продавца",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm text-gray-400">Загрузка...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}