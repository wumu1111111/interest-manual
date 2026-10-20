import { createElement } from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import ShareCard from "@/components/share-card";
import { decodePayload } from "@/lib/score";

export const runtime = "nodejs";

let assets: {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
  strip: string;
  stripWidth: number;
  stripHeight: number;
} | null = null;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

async function loadAssets() {
  if (assets) return assets;
  const [regular, bold, stripBuffer] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/card-500.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/card-700.ttf")),
    readFile(join(process.cwd(), "public/art/card-strip.png")),
  ]);
  // PNG 头里直接读宽高，免得为了两行数据把 sharp 拖进运行时依赖
  const stripWidth = stripBuffer.readUInt32BE(16);
  const stripHeight = stripBuffer.readUInt32BE(20);

  assets = {
    regular: toArrayBuffer(regular),
    bold: toArrayBuffer(bold),
    strip: `data:image/png;base64,${stripBuffer.toString("base64")}`,
    stripWidth,
    stripHeight,
  };
  return assets;
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

  const loaded = await loadAssets();

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
      stripSrc: loaded.strip,
      stripWidth: loaded.stripWidth,
      stripHeight: loaded.stripHeight,
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
