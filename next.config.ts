import type { NextConfig } from "next";

/**
 * Next.js 15 конфігурація — модульний моноліт HAVEN.
 * App Router + Server Actions (RPC), гібридний рендеринг (RSC).
 * Оптимізація пакетів: важкі серверні залежності не потрапляють у клієнтський бандл.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Жорсткий батчинг логів серверних компонентів — §3.1 диплома
    serverActions: { bodySizeLimit: "2mb" },
  },
  // Зовнішні зображення (Unsplash/Cloudinary) — оптимізація через next/image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
