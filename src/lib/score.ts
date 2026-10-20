import { QUESTIONS } from "./quiz-data";
import type { Axis, ProfilePayload } from "./types";

export const AXIS_ORDER: Axis[] = ["field", "social", "mode", "tempo"];

/** 题 id -> 所属轴与这句话指向的方向 */
const AXIS_INDEX = new Map<string, { axis: Axis; direction: number }>();
for (const q of QUESTIONS) {
  if (q.kind === "axis") AXIS_INDEX.set(q.id, { axis: q.axis, direction: q.direction });
}

/**
 * 四轴得分，范围 -1..1。
 *
 * 每题是 -2..2 的认同度，乘上这句话的方向后求和。
 * 中间档 0 表示"两边都行 / 都说不好"，不会把结果往任何一端推。
 */
export function axisScores(answers: Record<string, number>): number[] {
  const sum: Record<Axis, number> = { field: 0, social: 0, mode: 0, tempo: 0 };
  const count: Record<Axis, number> = { field: 0, social: 0, mode: 0, tempo: 0 };

  for (const [questionId, value] of Object.entries(answers)) {
    const hit = AXIS_INDEX.get(questionId);
    if (!hit || typeof value !== "number") continue;
    sum[hit.axis] += hit.direction * value;
    count[hit.axis] += 1;
  }

  return AXIS_ORDER.map((axis) => {
    if (count[axis] === 0) return 0;
    // 每题最大贡献 2 分，所以除以 2 * 题数
    return Math.round((sum[axis] / (2 * count[axis])) * 100) / 100;
  });
}

/** 四轴得分 -> 四位类型码，如 ISMD */
export function typeCodeOf(scores: number[]): string {
  const [field, social, mode, tempo] = scores;
  return (
    (field <= 0 ? "I" : "O") +
    (social <= 0 ? "S" : "G") +
    (mode <= 0 ? "M" : "T") +
    (tempo <= 0 ? "D" : "W")
  );
}

/** 右端占比，0..100 */
export function rightPercent(value: number): number {
  return Math.round(((value + 1) / 2) * 100);
}

const LETTER_SCORE: Record<string, number> = {
  I: -0.6,
  O: 0.6,
  S: -0.6,
  G: 0.6,
  M: -0.6,
  T: 0.6,
  D: -0.6,
  W: 0.6,
};

/** 给落地页的 16 张类型卡做示例，让每张卡片点开都有真实内容 */
const DEMO_TAGS: Record<
  string,
  { p: string[]; w: string[]; x: string[]; wl: string }
> = {
  ISMD: { p: ["cook", "craft", "read"], w: ["pottery", "music"], x: ["x_early"], wl: "一把好用的手冲壶" },
  ISMW: { p: ["craft", "plant", "game"], w: ["dive", "dance"], x: ["x_early"], wl: "一个没试过的小玩意" },
  ISTD: { p: ["film", "read", "art"], w: ["photo_series"], x: ["x_crowd", "x_bigparty"], wl: "一套喜欢的导演全集" },
  ISTW: { p: ["film", "cafe", "game"], w: ["vlog", "lang"], x: ["x_hike"], wl: "一个在家就能玩的桌游" },
  IGMD: { p: ["cook", "board", "chess"], w: ["dish"], x: ["x_early"], wl: "一套好看的餐具" },
  IGMW: { p: ["craft", "cook", "board"], w: ["pottery", "dance"], x: ["x_early"], wl: "一套多人手作材料包" },
  IGTD: { p: ["board", "game", "ball"], w: ["lang"], x: ["x_longtrip"], wl: "一个新的桌游" },
  IGTW: { p: ["sing", "board", "cafe"], w: ["live"], x: ["x_early"], wl: "一张 KTV 券" },
  OSMD: { p: ["ride", "photo", "hike"], w: ["ski"], x: ["x_bigparty"], wl: "一个骑行码表" },
  OSMW: { p: ["hike", "camp", "dive"], w: ["surf", "climb"], x: ["x_shop"], wl: "一张体验课券" },
  OSTD: { p: ["hike", "photo", "camp"], w: ["dive"], x: ["x_bigparty", "x_club"], wl: "一本徒步路线书" },
  OSTW: { p: ["travel", "cafe", "market"], w: ["photo_series"], x: ["x_early"], wl: "一张城市地图" },
  OGMD: { p: ["camp", "cook", "ball"], w: ["dish"], x: ["x_crowd"], wl: "一件轻量露营装备" },
  OGMW: { p: ["ball", "hike", "live"], w: ["dance", "surf"], x: ["x_early"], wl: "一张音乐节门票" },
  OGTD: { p: ["hike", "ball", "gym"], w: ["climb"], x: ["x_shop"], wl: "一双好点的徒步鞋" },
  OGTW: { p: ["travel", "photo", "cafe"], w: ["surf", "ski"], x: ["x_early"], wl: "一个轻便的旅行包" },
};

/** 给落地页做类型示例用 */
export function demoPayload(code: string): ProfilePayload {
  const tags = DEMO_TAGS[code] ?? {
    p: [],
    w: [],
    x: [],
    wl: "",
  };

  return {
    v: 1,
    n: "示例",
    a: [...code].map((letter) => LETTER_SCORE[letter] ?? 0),
    p: tags.p,
    w: tags.w,
    x: tags.x,
    // 偏好也从类型推出来，让每个示例看起来像真的
    pr: {
      invite: code[3] === "D" ? "planned" : "spontaneous",
      duration: code[0] === "I" ? "medium" : "whole",
      spend: code[2] === "M" ? "gear" : "experience",
      group: code[1] === "S" ? "lurk" : "warm",
    },
    wl: tags.wl || undefined,
  };
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodePayload(payload: ProfilePayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodePayload(input: string): ProfilePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(input)) as ProfilePayload;
    if (parsed?.v !== 1) return null;
    if (!Array.isArray(parsed.a) || parsed.a.length !== 4) return null;
    if (!parsed.pr || typeof parsed.pr !== "object") return null;
    return {
      ...parsed,
      p: Array.isArray(parsed.p) ? parsed.p : [],
      w: Array.isArray(parsed.w) ? parsed.w : [],
      x: Array.isArray(parsed.x) ? parsed.x : [],
    };
  } catch {
    return null;
  }
}
