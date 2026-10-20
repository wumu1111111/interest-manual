/**
 * 生成分享图用的中文字体子集。
 *
 * 1. 从 src/ 里抽出所有用到的汉字与符号；
 * 2. 用 fontTools 把 Noto Sans SC 可变字体实例化成 500 / 700 两个静态字重；
 * 3. 再按字符集做子集，产出几十 KB 的 ttf 给 satori 用。
 *
 * 用法：node scripts/build-card-font.mjs
 */
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const SRC = "src";
const TMP = "art-source";
const OUT = "src/assets/fonts";
const VF = "C:/Windows/Fonts/NotoSansSC-VF.ttf";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const files = await walk(SRC);
const text = (await Promise.all(files.map((f) => readFile(f, "utf8")))).join("");

// 汉字 + 用到的标点符号 + 数字字母
const chars = new Set();
for (const ch of text) {
  if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef0-9a-zA-Z%·×→—…「」『』、，。：；！？（）]/.test(ch)) {
    chars.add(ch);
  }
}
// 分享图里会出现的固定文案
for (const ch of "兴趣说明书 我的 能约我 别约我 室内外 独处结伴 创造体验 深潜广谱 40 道题") {
  chars.add(ch);
}

const sorted = [...chars].sort().join("");
await writeFile(join(TMP, "font-chars.txt"), sorted, "utf8");
console.log(`字符集 ${chars.size} 个`);

await mkdir(OUT, { recursive: true });

for (const weight of [500, 700]) {
  const instanced = join(TMP, `noto-${weight}.ttf`);
  const subset = join(OUT, `card-${weight}.ttf`);

  execFileSync(
    "python",
    [
      "-c",
      `from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
f = TTFont(r"${VF}")
f = instantiateVariableFont(f, {"wght": ${weight}}, inplace=False)
f["OS/2"].usWeightClass = ${weight}
f.save(r"${instanced}")
print("instanced ${weight}, glyphs:", len(f.getGlyphOrder()))`,
    ],
    { stdio: "inherit" },
  );

  execFileSync(
    "python",
    [
      "-m",
      "fontTools.subset",
      instanced,
      `--text-file=${join(TMP, "font-chars.txt")}`,
      `--output-file=${subset}`,
      "--no-hinting",
      "--desubroutinize",
      "--drop-tables+=DSIG,fvar,gvar,HVAR,avar,STAT,MVAR,cvar",
      "--layout-features=kern,liga",
    ],
    { stdio: "inherit" },
  );

  const size = (await readFile(subset)).length;
  console.log(`card-${weight}.ttf ${(size / 1024).toFixed(0)} KB`);
}
