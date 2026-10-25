import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://vitrina-pmr.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/product/",
          "/shop/",
          "/shops",
          "/about",
          "/faq",
          "/partnership",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/login",
          "/cart",
          "/favorites",
          "/reset-password/",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
