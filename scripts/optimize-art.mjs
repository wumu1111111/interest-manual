/**
 * 把智能体生成的 PNG 处理成页面可用的 WebP。
 *
 * 用法：node scripts/optimize-art.mjs
 *
 * 三件事：
 * 1. 纸底对齐——生成图的米色比页面纸色更黄，做 per-channel 线性映射拉齐；
 * 2. 抠底——贴白卡片的插画按背景色距离做软阈值，输出带 alpha 的图；
 * 3. 压缩——统一转 WebP，控制在几十 KB。
 *
 * 读 art-source/*.png，写 public/art/*.webp。
 */
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SRC = "art-source";
const OUT = "public/art";

const FINALS = {
  "hero.png": { width: 1600, quality: 82, matchPaper: true },
  "og-cover.png": { width: 1200, height: 630, quality: 84, matchPaper: true },
  "paper-grain.png": { width: 512, quality: 76, crop: 0.8 },
  "glow.png": { width: 1024, quality: 78 },
  "sprig.png": { width: 640, quality: 86, trim: 26, key: true },
  "pair.png": { width: 640, quality: 86, trim: 26, key: true },
};

/** 页面纸色（叠加噪点前的底色）与墨色，用来把生成图的纸底拉过去 */
const PAGE_PAPER = [250, 246, 239];
const PAGE_INK = [31, 27, 22];

async function matchPaper(input, pipeline) {
  const { dominant } = await sharp(input).stats();
  const src = [dominant.r, dominant.g, dominant.b];
  const scale = src.map((value, index) => {
    const k =
      (PAGE_PAPER[index] - PAGE_INK[index]) / (value - PAGE_INK[index] || 1);
    return Math.min(Math.max(k, 0.85), 1.45);
  });
  const offset = scale.map((k, index) => PAGE_INK[index] - k * PAGE_INK[index]);
  console.log(
    `  纸底 ${src.join(",")} → ${PAGE_PAPER.join(",")} (k=${scale.map((n) => n.toFixed(2)).join("/")})`,
  );
  return pipeline.linear(scale, offset);
}

/** 把接近背景色的像素变透明，边缘做 22 级的软过渡 */
async function keyOut(pipeline) {
  const { dominant } = await sharp(await pipeline.toBuffer()).stats();
  const bg = [dominant.r, dominant.g, dominant.b];
  const { data, info } = await pipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let cleared = 0;
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.max(
      Math.abs(data[i] - bg[0]),
      Math.abs(data[i + 1] - bg[1]),
      Math.abs(data[i + 2] - bg[2]),
    );
    const alpha = Math.max(0, Math.min(1, (distance - 10) / 22));
    data[i + 3] = Math.round(data[i + 3] * alpha);
    if (alpha === 0) cleared += 1;
  }
  console.log(
    `  抠底 bg=${bg.join(",")} 透明 ${((cleared / (data.length / 4)) * 100).toFixed(0)}%`,
  );

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

const files = await readdir(SRC);

for (const [name, config] of Object.entries(FINALS)) {
  if (!files.includes(name)) {
    console.log(`跳过（没找到）: ${name}`);
    continue;
  }

  const input = join(SRC, name);
  const output = join(OUT, name.replace(/\.png$/, ".webp"));
  let pipeline = sharp(input);

  // 纸张照片的边角有轻微暗角，裁掉一圈再平铺，否则会变成可见的方格
  if (config.crop) {
    const meta = await sharp(input).metadata();
    const width = Math.round((meta.width ?? 0) * config.crop);
    const height = Math.round((meta.height ?? 0) * config.crop);
    pipeline = sharp(input).extract({
      left: Math.round(((meta.width ?? 0) - width) / 2),
      top: Math.round(((meta.height ?? 0) - height) / 2),
      width,
      height,
    });
  }

  // 去掉四周米色留白，让插画在页面里显得更大
  if (config.trim) pipeline = pipeline.trim({ threshold: config.trim });

  if (config.matchPaper) pipeline = await matchPaper(input, pipeline);

  pipeline = pipeline.resize(
    config.height
      ? {
          width: config.width,
          height: config.height,
          fit: "cover",
          position: "centre",
        }
      : { width: config.width, withoutEnlargement: true },
  );

  if (config.key) pipeline = await keyOut(pipeline);

  await pipeline.webp({ quality: config.quality, effort: 5 }).toFile(output);

  const [before, after] = await Promise.all([stat(input), stat(output)]);
  console.log(
    `${name} ${(before.size / 1024).toFixed(0)}KB → ${output.replace(/\\/g, "/").split("/").pop()} ${(after.size / 1024).toFixed(0)}KB`,
  );
}

// 16 型名片：按验收挑出的那张（art-source/types/selection.json）出两版——
// 结果页用 720×1280 WebP，分享图用 480 宽的调色板 PNG（satori 解不了 WebP）。
try {
  const end = join(OUT, "types");
  await mkdir(end, { recursive: true });
  const selection = JSON.parse(
    await readFile(join(SRC, "types", "selection.json"), "utf8"),
  );
  for (const [code, index] of Object.entries(selection)) {
    if (!index) {
      console.log(`跳过（没有可用候选）: ${code}`);
      continue;
    }
    const input = join(SRC, "types", `${code}-${index}.png`);
    const webpOut = join(end, `${code}.webp`);
    const pngOut = join(end, `${code}.png`);

    await sharp(input)
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 })
      .toFile(webpOut);

    await sharp(input)
      .resize({ width: 480 })
      .png({ palette: true, colours: 160, dither: 0.4, compressionLevel: 9 })
      .toFile(pngOut);

    const [before, webp, png] = await Promise.all([
      stat(input),
      stat(webpOut),
      stat(pngOut),
    ]);
    console.log(
      `${code} ${(before.size / 1024).toFixed(0)}KB → webp ${(webp.size / 1024).toFixed(0)}KB / png ${(png.size / 1024).toFixed(0)}KB`,
    );
  }
} catch (error) {
  console.log("名片处理失败:", error.message);
}
