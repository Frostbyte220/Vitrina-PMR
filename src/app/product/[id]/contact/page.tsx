import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductContactClient } from "./ProductContactClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      title: true,
      store: { select: { name: true } },
    },
  });

  if (!product) {
    return { title: "Товар не найден — E-Vitrina PMR" };
  }

  const storeName = product.store?.name || "Продавец";
  return {
    title: `Написать продавцу «${storeName}» — ${product.title} | E-Vitrina PMR`,
    description: `Задайте вопрос продавцу ${storeName} по поводу товара «${product.title}». Быстрый ответ на сайте или в Viber/Telegram.`,
  };
}

export default async function ProductContactPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      price: true,
      oldPrice: true,
      images: true,
      sizes: true,
      availability: true,
      category: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          isVerified: true,
          phone: true,
          viber: true,
          telegram: true,
          instagram: true,
          cities: true,
        },
      },
      user: {
        select: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
              isVerified: true,
              phone: true,
              viber: true,
              telegram: true,
              instagram: true,
              cities: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const resolvedStore = product.store || product.user?.store;

  if (!resolvedStore) {
    notFound();
  }

  return (
    <ProductContactClient
      product={{
        id: product.id,
        title: product.title,
        price: product.price,
        oldPrice: product.oldPrice,
        images: product.images,
        sizes: product.sizes,
        availability: product.availability,
        category: product.category,
      }}
      store={{
        id: resolvedStore.id,
        name: resolvedStore.name,
        slug: resolvedStore.slug,
        avatarUrl: resolvedStore.avatarUrl,
        isVerified: resolvedStore.isVerified,
        phone: resolvedStore.phone,
        viber: resolvedStore.viber,
        telegram: resolvedStore.telegram,
        instagram: resolvedStore.instagram,
        cities: resolvedStore.cities,
      }}
    />
  );
}
