import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Оптимизация: уменьшаем количество генерируемых размеров изображений
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней кэш оптимизированных изображений
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
  },

  // Оптимизация: сжатие через gzip
  compress: true,

  // Оптимизация: автоматический tree-shaking для пакетов иконок
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Оптимизация: заголовки кэширования для статических ресурсов
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

};

export default nextConfig;