/**
 * 批量生成 16 型名片插画（纸团角色 × 场景），走 scripts/dsh-image.mjs。
 *
 * 用法：
 *   node scripts/gen-type-cards.mjs [--from 0] [--to 15] [--n 2] [--size 720*1280] [--model wan2.2-t2i-flash]
 *
 * 每种型号输出到 art-source/types/<code>-1.png、<code>-2.png（n=2 时）。
 * 按类型逐个串行调用，失败重试一次；最后汇总成败。
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DSH_IMAGE = join(ROOT, "scripts", "dsh-image.mjs");

/** 房子风格（art-brief.md，逐字） */
const HOUSE =
  "risograph screen-print editorial illustration, warm cream paper background (#FAF6EF), " +
  "strictly limited palette: deep forest green #2E5A4E, brick red #BD4327, ink black #1F1B16, " +
  "soft beige #E5DBCB; flat shapes, thin hand-drawn line work, subtle paper grain, " +
  "slight print misregistration, generous negative space, calm and quiet mood, " +
  "no text, no letters, no numbers, no watermark, no signature, no border frame, " +
  "no 3D, no glossy gradients, no neon, no photo, no realistic faces, no hands";

const NEGATIVE =
  "text, letters, typography, watermark, signature, border, frame, photo, 3d render, " +
  "glossy, neon, saturated colors, clutter, detailed faces, hands, logo, " +
  "branded products, cola can, bottle with label, dark background, green background, " +
  "wallpaper, colored wall, night sky, stars, paper crane, origami crane, deer, child, girl, boy";

/** 纸团主角：和 src/components/mascot.tsx 的设定一致 */
const CHARACTER =
  "main character: one cute round crumpled white paper ball with tiny ink dot eyes " +
  "and small brick-red blush cheeks, drawn with a thin ink outline, kawaii but restrained";

/** 竖版名片构图：角色场景压在下三分之二，顶部留安静纸面给网页排版叠字 */
const LAYOUT =
  "vertical composition, character and scene placed in the lower two-thirds, " +
  "top third is calm empty cream paper, minimal objects, storybook clarity";

/**
 * 重出时追加的硬约束：首轮有几张把背景铺成了深绿/夜空，
 * 顶部留白和纸底都没了，这里把「不许糊背景」写死。
 */
const STRICT =
  "the entire background must stay warm cream paper (#FAF6EF) from edge to edge, " +
  "no dark sky, no night fill, no green fill, no large flat color areas, no gradient, no vignette, " +
  "no worn paper edges, all scene objects are small flat drawings floating on blank paper, " +
  "the whole upper half is empty paper";

/** 伙伴纸团（群像场景用） */
const FRIENDS = "small companion paper balls with the same dot eyes and blush";

/**
 * 16 型 × 场景。顺序与 TYPE_PROFILES 一致：
 * field(I/O) → social(S/G) → mode(M/T) → tempo(D/W)
 */
const TYPES = [
  {
    code: "ISMD",
    name: "深夜手作人",
    scene:
      "late night scene: the paper ball sits at a small wooden desk lit by a warm brick-red desk lamp, " +
      "tinkering with tiny paper crafts and small tools, a crescent moon in a dark window, a mug beside it, deep quiet midnight focus",
    strictScene:
      "the paper ball sits at a small desk under a paper-cut desk lamp, with paper crafts and a mug; " +
      "behind it a big window, the night outside is just cream paper with one flat brick-red crescent moon " +
      "and three thin ink stars; nothing is filled dark",
  },
  {
    code: "ISMW",
    name: "兴趣杂货铺",
    scene:
      "a cozy cluttered corner at home: the paper ball sits among wooden shelves filled with many half-finished hobby objects, " +
      "a ball of yarn, a small guitar, glass jars, folded paper, a jar of paintbrushes, like a tiny curiosity shop",
    strictScene:
      "a cozy hobby corner: one low shelf drawn with thin ink lines holds a yarn ball, a small guitar, glass jars and folded paper, " +
      "the paper ball sits in front of it; the wall above is plain empty cream paper, no blackboard, no framed pictures, " +
      "no mug with letters",
  },
  {
    code: "ISTD",
    name: "沙发考古学家",
    scene:
      "the paper ball sits deep in a big soft sofa surrounded by a tall stack of books and open notebooks, " +
      "a warm floor lamp beside, one open book on its lap, like a scholar digging to the very source of one topic",
  },
  {
    code: "ISTW",
    name: "躺平收藏家",
    scene:
      "the paper ball lies back on a soft beige beanbag gazing upward, small floating stars and bookmark ribbons drifting above it, " +
      "a calm lazy afternoon, everything collected and saved for later",
  },
  {
    code: "IGMD",
    name: "客厅主理人",
    scene:
      "a warm living room: the paper ball hosts at a low table with a teapot, cups and a small board game, " +
      `floor cushions around, one ${FRIENDS} arriving at the door, cozy hosting mood`,
  },
  {
    code: "IGMW",
    name: "手工局召集人",
    scene:
      `an afternoon craft party: the paper ball and two ${FRIENDS} sit around a table covered with paper cutouts, ` +
      "yarn, scissors and glue pots, everyone making things together",
    strictScene:
      `craft table vignette: the paper ball and two ${FRIENDS} sit around a low table drawn as a thin ink line, ` +
      "paper cutouts, yarn, scissors and glue pots on it, everyone making things; no walls, no room, " +
      "no window, everything above the table is empty cream paper",
  },
  {
    code: "IGTD",
    name: "固定局常驻",
    scene:
      `weekly ritual night: the paper ball and ${FRIENDS} around a small square table playing a board game, ` +
      "a wall calendar with one circled day, mugs of tea, stable warm routine",
    strictScene:
      `the paper ball and two ${FRIENDS} sit around a flat board with dice, two tea cups and a small calendar sheet; ` +
      "the paper stays blank cream, no wall, no floor, no table edge, no dark area",
  },
  {
    code: "IGTW",
    name: "室内气氛组",
    scene:
      "lively indoor party: the paper ball sings into a microphone under a hanging disco ball, " +
      `flat music-note shapes floating in the air, snack bowls on a table, two ${FRIENDS} cheering`,
    strictScene:
      `the paper ball sings into a microphone while two ${FRIENDS} cheer, ` +
      "flat music-note shapes and confetti dots around; a party vignette with no ceiling, no wall, no drinks, empty cream paper above",
  },
  {
    code: "OSMD",
    name: "山野手艺人",
    scene:
      "outdoor solo craftsman: the paper ball beside a small tent on a grassy hill, fixing a bicycle with a few tools laid on a cloth, " +
      "pine trees and a low round sun in the distance",
  },
  {
    code: "OSMW",
    name: "周末实验家",
    scene:
      "weekend experimenter: the paper ball with a little backpack stands on a meadow surrounded by a fishing rod, " +
      "a bicycle and a small kite in the sky, ready to try everything one by one",
  },
  {
    code: "OSTD",
    name: "山水独行客",
    scene:
      "lone trekker: a tiny paper ball stands on a mountain ridge, vast layered mountains in forest green and beige, " +
      "a big round sun, immense quiet negative space, walking far and watching long",
  },
  {
    code: "OSTW",
    name: "城市漫游者",
    scene:
      "city wanderer: the paper ball strolls past a quiet street corner with a cafe awning, potted plants and a street lamp, " +
      "soft evening light, no destination, just wandering",
  },
  {
    code: "OGMD",
    name: "露营策划师",
    scene:
      "camp planner: the paper ball plants a small flag at a campsite with a tent and a campfire ring, " +
      `a paper map with a dotted path beside it, ${FRIENDS} setting up in the background`,
  },
  {
    code: "OGMW",
    name: "活动发起人",
    scene:
      `the organizer: the paper ball waves a small flag on a hill path, leading a little line of ${FRIENDS} with backpacks, ` +
      "morning sun, everyone heading out together",
  },
  {
    code: "OGTD",
    name: "气氛组组长",
    scene:
      `outdoor party host: the paper ball and ${FRIENDS} gathered around a campfire at dusk, a kettle and grill sticks, ` +
      "brick-red fire glow on their cheeks, laughter shapes in the air, making sure the fun is full",
    strictScene:
      `three ${FRIENDS} sit around a small fire made of three flat brick-red triangles, a kettle hangs from a stick above it; ` +
      "a campfire vignette with no sky, no ground line, no night, no stars, empty cream paper above",
  },
  {
    code: "OGTW",
    name: "一日游选手",
    scene:
      "day-trip hopper: the paper ball with a small suitcase and a camera strap steps along a road, " +
      "tiny flat silhouettes of a tower, a mountain and the sea in the far background, one day one place",
  },
];

function parseArgs(argv) {
  const out = {
    from: 0,
    to: TYPES.length - 1,
    n: 2,
    size: "720*1280",
    model: "wan2.2-t2i-flash",
    only: null,
    strict: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--from") out.from = Number(value);
    else if (key === "--to") out.to = Number(value);
    else if (key === "--n") out.n = Number(value);
    else if (key === "--size") out.size = value;
    else if (key === "--model") out.model = value;
    else if (key === "--only")
      out.only = String(value).toLowerCase().split(",").map((s) => s.trim());
    else if (key === "--strict") out.strict = true;
  }
  out.from = Math.max(0, out.from);
  out.to = Math.min(TYPES.length - 1, out.to);
  return out;
}

function promptOf(type, strict) {
  // 首轮失败的型号带一版更稳的场景（压低背景、去掉商标/夜空/签名）
  const scene = strict && type.strictScene ? type.strictScene : type.scene;
  return `${HOUSE}; ${CHARACTER}; scene: ${scene}; ${strict ? `${STRICT}; ` : ""}${LAYOUT}`;
}

function generate(type, args) {
  const out = join("art-source", "types", `${type.code.toLowerCase()}.png`);
  const cli = [
    DSH_IMAGE,
    "--prompt", promptOf(type, args.strict),
    "--out", out,
    "--size", args.size,
    "--model", args.model,
    "--n", String(args.n),
    "--negative", NEGATIVE,
  ];
  execFileSync(process.execPath, cli, { stdio: "inherit", cwd: ROOT });
}

const args = parseArgs(process.argv.slice(2));
const failed = [];

for (let index = args.from; index <= args.to; index += 1) {
  const type = TYPES[index];
  if (args.only && !args.only.includes(type.code.toLowerCase())) continue;
  console.log(`\n=== [${index}] ${type.code} ${type.name} ===`);
  try {
    generate(type, args);
  } catch {
    console.log(`重试一次: ${type.code}`);
    try {
      generate(type, args);
    } catch {
      failed.push(type.code);
      console.log(`放弃: ${type.code}`);
    }
  }
}

if (failed.length) {
  console.log(`\n失败型号: ${failed.join(", ")}`);
  process.exit(1);
}
console.log("\n全部完成");
