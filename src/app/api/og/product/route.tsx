import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Размер OG-картинки: стандарт для Telegram, Viber, VK, Facebook
const W = 1200;
const H = 630;



function truncate(str: string, max: number) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  // Загружаем минимум данных о товаре
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      title: true,
      price: true,
      images: true,
      category: true,
      store: { select: { name: true } },
      user: {
        select: {
          name: true,
          store: { select: { name: true } },
        },
      },
    },
  });

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  const title = truncate(product.title, 60);
  const price = `${product.price.toLocaleString("ru-RU")} Руб`;
  const shopName = truncate(
    product.store?.name ||
      product.user?.store?.name ||
      product.user?.name ||
      "E-Vitrina PMR",
    40
  );
  const category = product.category || "";
  const productImageUrl =
    product.images?.[0] ??
    "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80";

  // Cloudinary: оптимизируем фото под нужный размер (crop 600×630, jpg, качество auto)
  let optimizedImageUrl = productImageUrl;
  if (productImageUrl.includes("cloudinary.com")) {
    optimizedImageUrl = productImageUrl.replace(
      "/upload/",
      "/upload/c_fill,w_600,h_630,q_auto,f_jpg/"
    );
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: W,
          height: H,
          background: "#f8f8f8",
          fontFamily: "sans-serif",
        }}
      >
        {/* ── Левая половина: фото товара ── */}
        <div
          style={{
            width: 560,
            height: H,
            display: "flex",
            flexShrink: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimizedImageUrl}
            alt={title}
            width={560}
            height={H}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
          {/* Градиент-тень справа для плавного перехода */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 80,
              height: "100%",
              background: "linear-gradient(to right, transparent, #f8f8f8)",
            }}
          />
        </div>

        {/* ── Правая половина: информация ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 44px",
          }}
        >
          {/* Шапка: логотип + категория */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Бейдж сайта */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "#d4173a",
                  borderRadius: 12,
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  E-VP
                </span>
              </div>
              {category ? (
                <span
                  style={{
                    fontSize: 17,
                    color: "#888",
                    fontWeight: 500,
                  }}
                >
                  {category}
                </span>
              ) : null}
            </div>

            {/* Название товара */}
            <div
              style={{
                fontSize: title.length > 40 ? 32 : 38,
                fontWeight: 800,
                color: "#111",
                lineHeight: 1.2,
                marginTop: 8,
              }}
            >
              {title}
            </div>
          </div>

          {/* Центр: цена */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: "#d4173a",
                letterSpacing: "-1px",
              }}
            >
              {price}
            </div>
          </div>

          {/* Нижняя часть: магазин + домен */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: "auto",
            }}
          >
            {/* Карточка магазина */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#fff",
                borderRadius: 16,
                padding: "14px 20px",
                border: "1px solid #eee",
              }}
            >
              {/* Иконка магазина */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#fde8ec",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                🏪
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>
                  Продавец
                </span>
                <span
                  style={{ fontSize: 22, fontWeight: 700, color: "#111" }}
                >
                  {shopName}
                </span>
              </div>
            </div>

            {/* Домен сайта */}
            <div
              style={{
                fontSize: 16,
                color: "#aaa",
                fontWeight: 500,
                letterSpacing: "0.3px",
              }}
            >
              vitrina-pmr.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
    }
  );

  // Кэшируем OG-изображение на 1 час в CDN (Vercel Edge) и в браузере.
  // Без этого Telegram и Facebook перезапрашивают изображение при каждом превью.
  imageResponse.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
  );

  return imageResponse;
}
