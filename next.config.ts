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

  async headers() {
    return [
      // ──────────────────────────────────────────────────
      // 🔒 Security Headers (применяются ко всем страницам)
      // ──────────────────────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          // Запрещаем встраивать сайт в <iframe> на других доменах (защита от кликджекинга)
          { key: "X-Frame-Options", value: "DENY" },
          // Запрещаем браузеру угадывать MIME-тип (защита от Content Sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Принудительно используем HTTPS минимум 1 год (HSTS)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Отправляем минимум информации о переходе с нашего сайта
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Ограничиваем доступ браузерных API (GPS, камера, микрофон)
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Базовая политика разрешённых источников контента (CSP)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://ui-avatars.com https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "connect-src 'self' https://mc.yandex.ru https://vitrina-pmr.vercel.app",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      // ──────────────────────────────────────────────────
      // ⚡ Cache Headers (кэш статических ресурсов)
      // ──────────────────────────────────────────────────
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