import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-text-main">Товар не найден</h1>
      <p className="text-text-muted">Запрашиваемый товар не существует.</p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        На главную
      </Link>
    </main>
  );
}
