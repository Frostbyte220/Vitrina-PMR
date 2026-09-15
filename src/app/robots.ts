import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://vitrina-pmr.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/product/", "/shop/", "/about", "/partnership"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/login",
          "/favorites",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
