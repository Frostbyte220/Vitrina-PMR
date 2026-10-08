import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Супер-Админ | E-Vitrina PMR",
  robots: { index: false, follow: false }, // Запрещаем индексацию админки
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {children}
    </div>
  );
}
