import { createElement } from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import ShareCard from "@/components/share-card";
import { decodePayload, typeCodeOf } from "@/lib/score";

export const runtime = "nodejs";

let fonts: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/** 型号插画按型号缓存，同一张海报只读一次盘 */
const artCache = new Map<string, string>();

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

async function loadFonts() {
  if (fonts) return fonts;
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/card-500.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/card-700.ttf")),
  ]);
  fonts = {
    regular: toArrayBuffer(regular),
    bold: toArrayBuffer(bold),
  };
  return fonts;
}

async function artOf(code: string): Promise<string> {
  const cached = artCache.get(code);
  if (cached) return cached;
  const buffer = await readFile(
    join(process.cwd(), "public/art/types", `${code.toLowerCase()}.png`),
  );
  const src = `data:image/png;base64,${buffer.toString("base64")}`;
  artCache.set(code, src);
  return src;
}

/** 从链接里取一个稳定的两位编号，纯粹为了海报上的 "NO. 08" 好看 */
function sequenceOf(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 997;
  }
  return String((hash % 96) + 1).padStart(2, "0");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const d = searchParams.get("d") ?? "";

  const payload = decodePayload(d);
  if (!payload) {
    return new Response("invalid profile", { status: 400 });
  }

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "");
  const target = `${proto}://${host}/result?d=${encodeURIComponent(d)}`;

  const [loaded, artSrc] = await Promise.all([
    loadFonts(),
    artOf(typeCodeOf(payload.a)),
  ]);

  const qrSvg = await QRCode.toString(target, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1F1B16", light: "#00000000" },
  });

  return new ImageResponse(
    createElement(ShareCard, {
      payload,
      seq: sequenceOf(d),
      qrSrc: `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`,
      artSrc,
    }),
    {
      width: 1080,
      height: 1440,
      fonts: [
        {
          name: "Noto Sans SC",
          data: loaded.regular,
          weight: 500,
          style: "normal",
        },
        {
          name: "CardBold",
          data: loaded.bold,
          weight: 700,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
