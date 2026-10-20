import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 原型阶段先关掉 Cache Components / 严格路由类型，减少动态页面的边界工作
  typedRoutes: false,
  // 开发时用 127.0.0.1 / 局域网 IP 打开也能正常热更新
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.local"],
  devIndicators: false,
  // 分享图接口用 fs 直接读这两个目录，部署到 Vercel 时要一起打包
  outputFileTracingIncludes: {
    "/api/card": ["./src/assets/fonts/**", "./public/art/card-strip.png"],
  },
  experimental: {
    // Turbopack 的持久化缓存会在这台机器上复活旧样式（改了类名但 CSS 没重编），
    // 迭代期间先关掉，换来「每次都是新的」。
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
