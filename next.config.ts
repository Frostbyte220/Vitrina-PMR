import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://mc.yandex.ru https://upload-widget.cloudinary.com https://widget.cloudinary.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://res.cloudinary.com https://mc.yandex.ru https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://ui-avatars.com https://via.placeholder.com;
  font-src 'self' data:;
  connect-src 'self' https://mc.yandex.ru https://api.cloudinary.com https://res.cloudinary.com;
  frame-src 'self' https://upload-widget.cloudinary.com https://mc.yandex.ru;
  media-src 'self' https://res.cloudinary.com;
  worker-src 'self' blob:;
  child-src 'self' blob: https://mc.yandex.ru;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  images: {
    // Оптимизация: уменьшаем количество генерируемых размеров изображений
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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

  // Очистка console.log в production-сборке для уменьшения размера клиентского JS
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Оптимизация: автоматический tree-shaking для пакетов
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "react-hot-toast"],
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
          // 🛡️ Content-Security-Policy: разрешает только доверенные источники (Cloudinary, YM, NextAuth)
          { key: "Content-Security-Policy", value: cspHeader },
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