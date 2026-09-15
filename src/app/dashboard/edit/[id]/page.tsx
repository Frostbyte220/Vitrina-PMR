import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AddProductForm from "@/app/dashboard/AddProductForm"; // Проверьте правильность пути к вашей форме

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // В Next.js 15 params нужно "ожидать" (await)
  const resolvedParams = await params;

  // Ищем товар в базе
  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id,
      user: {
        email: session.user.email, // Защита: юзер может редактировать только свои товары
      },
      deletedAt: null,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-24">
      <h1 className="mb-8 text-3xl font-bold text-text-main">
        Редактирование товара
      </h1>
      
      {/* Передаем данные товара в форму */}
      <AddProductForm initialData={product} />
    </main>
  );
}