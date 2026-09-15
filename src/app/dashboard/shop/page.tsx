import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Магазин",
};

export default function DashboardShopPage() {
  return (
    <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
      <h1 className="text-2xl font-bold text-text-main">Магазин</h1>
      <p className="mt-2 text-sm text-text-muted">Раздел в разработке</p>
    </main>
  );
}
