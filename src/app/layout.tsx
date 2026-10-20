import type { Metadata, Viewport } from "next";
import "./globals.css";

/** 线上优先用自己配的域名，其次用 Vercel 给的部署域名 */
function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "兴趣说明书 · 让朋友一次搞懂你",
  description:
    "40 道题，生成一份能直接发出去的兴趣说明书：怎么约你、送什么、什么别碰。答案只保存在你自己的链接里。",
  openGraph: {
    title: "兴趣说明书 · 让朋友一次搞懂你",
    description:
      "40 道题，8 分钟，出一份「怎么约我 / 送什么 / 别碰什么」的说明书，再让朋友猜猜有多懂你。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/art/og-cover.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/art/og-cover.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // className="js" 直接服务端渲染，滚动进场才敢把内容设为透明；
    // 没 JS 时用 noscript 里的样式兜底，内容照常可见。
    <html lang="zh-CN" className="js">
      <body className="min-h-dvh">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
