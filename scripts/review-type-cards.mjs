/**
 * 用 DashScope qwen-vl-max 对名片候选图做视觉验收（主代理模型无视觉输入，以此代替）。
 *
 * 用法：
 *   node scripts/review-type-cards.mjs [--from 0] [--to 15]
 *
 * 读 art-source/types/<code>-1.png / <code>-2.png，
 * 写 art-source/types/review-<code>.json（单型号结果，可断点续跑）。
 * 全部完成后打印汇总表。API key 从 ~/.dsh/.credentials.yaml 读取，不打印。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { resolve } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CRED = resolve(homedir(), ".dsh/.credentials.yaml");
const ENDPOINT = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = process.env.REVIEW_MODEL || "qwen-vl-max";

/** 每个型号的中文场景意图，供场景匹配打分 */
const SCENES = {
  ismd: "深夜台灯下，纸团独自在书桌上做手工，窗外有月亮，安静专注",
  ismw: "纸团坐在堆满半成品爱好的架子之间（毛线、吉他、瓶罐），像家里的杂货铺",
  istd: "纸团深陷沙发，身边高高一摞书和摊开的笔记本，暖落地灯，钻研一个题材",
  istw: "纸团瘫在懒人沙发上，空中有星星和书签飘浮，慵懒下午",
  igmd: "温暖客厅，纸团在矮桌旁招待：茶壶茶杯和桌游，坐垫，一位伙伴刚到门口",
  igmw: "下午手工局：纸团和两三个伙伴围桌做手工，桌上有剪纸、毛线、剪刀、胶水",
  igtd: "每周固定局：纸团和伙伴围小方桌玩桌游，墙上有圈了日子的日历，茶杯",
  igtw: "室内热闹派对：纸团拿麦克风唱歌，头顶迪斯科球，音符，零食碗，伙伴欢呼",
  osmd: "野外山坡帐篷旁，纸团独自修自行车或摆弄工具，松树和远处的太阳",
  osmw: "草地上纸团背着小背包，周围有鱼竿、自行车、天上的风筝，什么都想试",
  ostd: "小小的纸团站在山脊上，层叠大山、大太阳，大量留白，独自远行",
  ostw: "城市街角，纸团溜达经过咖啡馆雨棚、盆栽、路灯，柔和傍晚",
  ogmd: "营地策划：纸团在帐篷和篝火圈旁插小旗，旁边有带虚线路径的地图，伙伴在背景搭营",
  ogmw: "发起人：纸团在山路上挥小旗，领着一队背背包的伙伴，清晨太阳",
  ogtd: "户外气氛组：纸团和伙伴围篝火，水壶烤串，砖红火光映在脸上",
  ogtw: "一日游：纸团拎小行李箱、挂相机走在路上，远处有塔、山、海的扁平剪影",
};

const CODES = Object.keys(SCENES);

function readKey() {
  const raw = readFileSync(CRED, "utf8");
  const match = raw.match(/BAILIAN_API_KEY:\s*["']?([^"'\s]+)["']?/);
  if (!match) throw new Error("credentials.yaml 里找不到 BAILIAN_API_KEY");
  return match[1];
}

function buildPrompt(code) {
  return [
    "你是严格的美术验收员。这是一张为「兴趣说明书」网站生成的类型名片插画候选。",
    `该型号应有的场景：${SCENES[code]}。`,
    "逐项检查并以严格 JSON 返回（不要输出别的文字）：",
    '{',
    '  "hasText": 画面中是否有任何文字/字母/数字/水印/签名（true/false，有一项即 true）,',
    '  "paletteOk": 主色是否只含米色纸底、深绿、砖红、墨黑、浅米，且无荧光色/紫色/天蓝等板外饱和色,',
    '  "cleanBg": 背景是否为干净米色纸面、四周无画框/阴影边,',
    '  "characterOk": 主角是否为白色皱纸团角色（墨点眼睛、砖红腮红），无写实手脚/人脸,',
    '  "topSpaceOk": 顶部约三分之一是否留白安静（之后要在上方叠字）,',
    '  "styleOk": 是否为 riso 丝网印刷感：细线条、平涂、纸纹、无厚涂/写实光影/3D,',
    '  "sceneFit": 场景与上述意图的匹配度 1-5,',
    '  "cute": 高级可爱程度 1-5（克制、留白多、不幼稚堆砌为高分）,',
    '  "pass": 前六项全部通过才为 true,',
    '  "issues": ["具体问题简述"]',
    '}',
  ].join("\n");
}

async function reviewOne(key, code, index) {
  const file = join(ROOT, "art-source", "types", `${code}-${index}.png`);
  if (!existsSync(file)) return null;
  const b64 = readFileSync(file).toString("base64");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
            { type: "text", text: buildPrompt(code) },
          ],
        },
      ],
      temperature: 0,
    }),
  });
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { pass: false, issues: ["验收响应无法解析: " + text.slice(0, 120)] };
  try {
    return JSON.parse(match[0]);
  } catch {
    return { pass: false, issues: ["验收 JSON 解析失败: " + text.slice(0, 120)] };
  }
}

function parseArgs(argv) {
  const out = { from: 0, to: CODES.length - 1, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--from") out.from = Number(argv[i + 1]);
    else if (argv[i] === "--to") out.to = Number(argv[i + 1]);
    else if (argv[i] === "--force") out.force = true;
  }
  return out;
}

/** 每型最多看四张候选（重出时会多一张） */
const CANDIDATES = [1, 2, 3, 4];

/** 从已有的 review-*.json 里挑每型最好的一张，写成 selection.json */
function writeSelection() {
  const selection = {};
  const fallback = [];
  for (const code of CODES) {
    const file = join(ROOT, "art-source", "types", `review-${code}.json`);
    if (!existsSync(file)) continue;
    const verdicts = JSON.parse(readFileSync(file, "utf8"));
    let best = null;
    let bestScore = -Infinity;
    for (const index of CANDIDATES) {
      const verdict = verdicts[String(index)];
      if (!verdict) continue;
      // 有字一律不要——这是硬伤，宁可兜底到构图差一点的
      if (verdict.hasText) continue;
      // 过关的永远优先；一张都没过关时，先看硬指标过了几条，再看可爱和贴题
      const checks = [
        !verdict.hasText,
        verdict.paletteOk,
        verdict.cleanBg,
        verdict.characterOk,
        verdict.topSpaceOk,
        verdict.styleOk,
      ].filter(Boolean).length;
      const score = verdict.pass
        ? 100 + (verdict.cute ?? 0) + (verdict.sceneFit ?? 0)
        : checks * 10 + (verdict.cute ?? 0) + (verdict.sceneFit ?? 0);
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    }
    selection[code] = bestScore > 0 ? String(best) : null;
    if (best && bestScore < 100) fallback.push(code);
  }
  writeFileSync(
    join(ROOT, "art-source", "types", "selection.json"),
    JSON.stringify(selection, null, 2),
  );
  const missing = CODES.filter((code) => !selection[code]);
  console.log(
    `selection.json 已更新${missing.length ? `，还没有候选: ${missing.join(", ")}` : ""}`,
  );
  if (fallback.length) {
    console.log(`兜底（没有一张完全过关，取最接近的）: ${fallback.join(", ")}`);
  }
  return missing;
}

const args = parseArgs(process.argv.slice(2));
const key = readKey();

for (let i = args.from; i <= Math.min(args.to, CODES.length - 1); i += 1) {
  const code = CODES[i];
  const outPath = join(ROOT, "art-source", "types", `review-${code}.json`);
  if (existsSync(outPath) && !args.force) {
    console.log(`跳过（已有结果）: ${code}`);
    continue;
  }
  const verdicts = {};
  for (const index of CANDIDATES) {
    process.stdout.write(`${code}-${index} ... `);
    try {
      const verdict = await reviewOne(key, code, index);
      verdicts[String(index)] = verdict;
      console.log(verdict ? (verdict.pass ? `PASS cute=${verdict.cute} fit=${verdict.sceneFit}` : `FAIL ${JSON.stringify(verdict.issues)}`) : "缺文件");
    } catch (error) {
      verdicts[String(index)] = { pass: false, issues: ["调用失败: " + error.message] };
      console.log("调用失败: " + error.message);
    }
  }
  writeFileSync(outPath, JSON.stringify(verdicts, null, 2));
}

console.log("");
writeSelection();
console.log("完成");
