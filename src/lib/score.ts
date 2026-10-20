import { AXIS_ORDER as AXIS_ORDER_SOURCE, QUESTIONS } from "./quiz-data";
import type { Axis, AxisQuestion, ProfilePayload } from "./types";

export const AXIS_ORDER: Axis[] = AXIS_ORDER_SOURCE;

/** 四轴陈述句，顺序与分享链接里的 r 字符串一一对应 */
const AXIS_QUESTION_LIST: AxisQuestion[] = QUESTIONS.filter(
  (question): question is AxisQuestion => question.kind === "axis",
);

/** r 字符串的长度（48） */
export const AXIS_ITEM_COUNT = AXIS_QUESTION_LIST.length;

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
  return axisStats(answers).map((stat) => stat.score);
}

export interface AxisStat {
  /** 归一化得分 -1..1 */
  score: number;
  /**
   * 标准误，量纲同样是 -1..1。
   * 用「同一条轴上各题带方向态度的标准差 / √题数」估：
   * 一道题说很室内、下一道说很户外的人，这个值就会变大。
   */
  sem: number;
  /** 这条轴上真正作答了几道 */
  count: number;
}

/**
 * 四轴的得分 + 标准误。
 *
 * 老路子只给一个分数，等于假装每道题一样可靠；
 * 这里额外估一个 SEM，结果页就能把"分数 + 不确定范围"一起画出来，
 * 边界情况也就能诚实地标成"倾向模糊"，而不是硬给一个字母。
 */
export function axisStats(answers: Record<string, number>): AxisStat[] {
  const contributions: Record<Axis, number[]> = {
    field: [],
    social: [],
    mode: [],
    tempo: [],
  };

  for (const [questionId, value] of Object.entries(answers)) {
    const hit = AXIS_INDEX.get(questionId);
    if (!hit || typeof value !== "number") continue;
    contributions[hit.axis].push(hit.direction * value);
  }

  return AXIS_ORDER.map((axis) => {
    const list = contributions[axis];
    const count = list.length;
    if (count === 0) return { score: 0, sem: 0.5, count };

    const mean = list.reduce((sum, item) => sum + item, 0) / count;
    // 每题最大贡献 2 分，所以除以 2 归一
    const score = Math.round((mean / 2) * 100) / 100;
    const variance =
      count > 1
        ? list.reduce((sum, item) => sum + (item - mean) ** 2, 0) / (count - 1)
        : 2;
    const sem =
      Math.round(((Math.sqrt(variance) / Math.sqrt(count)) / 2) * 100) / 100;

    return { score, sem, count };
  });
}

/** 分数不足以定字母：置信带跨过了中点，或本来就贴着中点 */
export function isBorderline(stat: AxisStat): boolean {
  return Math.abs(stat.score) < Math.max(stat.sem, 0.1);
}

/** 边界轴的下标（结果页用来弱化字母、给"另一种可能"） */
export function borderlineAxes(stats: AxisStat[]): number[] {
  return stats.flatMap((stat, index) => (isBorderline(stat) ? [index] : []));
}

/** 把类型码第 index 位的字母翻转，得到"次接近类型" */
export function flipCode(code: string, index: number): string {
  const pairs: Record<string, string> = {
    I: "O",
    O: "I",
    S: "G",
    G: "S",
    M: "T",
    T: "M",
    D: "W",
    W: "D",
  };
  return [...code]
    .map((letter, position) =>
      position === index ? (pairs[letter] ?? letter) : letter,
    )
    .join("");
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

/** 从分享链接的 payload 还原四轴统计；老链接没有逐题串时，退化成只知道分数 */
export function statsOfPayload(payload: ProfilePayload): AxisStat[] {
  const raw = payload.r;
  if (typeof raw === "string" && raw.length === AXIS_QUESTION_LIST.length) {
    const answers: Record<string, number> = {};
    AXIS_QUESTION_LIST.forEach((question, index) => {
      answers[question.id] = Number(raw[index]) - 2;
    });
    return axisStats(answers);
  }
  return payload.a.map((score) => ({ score, sem: 0, count: 0 }));
}

export interface ValidityWarning {
  key: "longstring" | "irv" | "pair" | "speed";
  title: string;
  body: string;
}

export interface ValidityReport {
  /** 老链接没有 r 字符串时无法判断，直接不显示 */
  available: boolean;
  /** 最长连续同分串（1..题数） */
  longstring: number;
  /** 全卷态度方差；越小越像"一路点到底" */
  irv: number;
  /** 相反配对题里态度打架的组数 */
  conflicts: number;
  /** 打架集中在哪些轴 */
  conflictAxes: Axis[];
  /** 平均每题秒数，没记时间时为 null */
  secondsPerItem: number | null;
  warnings: ValidityWarning[];
}

/**
 * 作答效度：只根据逐题态度串（payload.r）和总用时（payload.t）判断。
 *
 * 全部是"温和提示"，绝不拒绝出结果——
 * 兴趣题本来就没有对错，只是提醒这份结果可以怎么读。
 */
export function validityOf(payload: ProfilePayload): ValidityReport {
  const raw = payload.r;
  const ratings =
    typeof raw === "string" && raw.length === AXIS_QUESTION_LIST.length
      ? [...raw].map((char) => Number(char) - 2)
      : null;

  const empty: ValidityReport = {
    available: false,
    longstring: 0,
    irv: 0,
    conflicts: 0,
    conflictAxes: [],
    secondsPerItem: null,
    warnings: [],
  };
  if (!ratings) return empty;

  // 1) 最长连续同分串
  let longstring = 1;
  let run = 1;
  for (let index = 1; index < ratings.length; index += 1) {
    if (ratings[index] === ratings[index - 1]) {
      run += 1;
      longstring = Math.max(longstring, run);
    } else {
      run = 1;
    }
  }

  // 2) 全卷方差（个体作答变异性）
  const mean = ratings.reduce((sum, item) => sum + item, 0) / ratings.length;
  const irv =
    Math.round(
      (ratings.reduce((sum, item) => sum + (item - mean) ** 2, 0) /
        ratings.length) *
        100,
    ) / 100;

  // 3) 相反配对题的态度是否互为镜像
  const conflictAxes = new Set<Axis>();
  let conflicts = 0;
  let answeredPairs = 0;
  AXIS_QUESTION_LIST.forEach((question, index) => {
    if (!question.pair) return;
    const pairIndex = AXIS_QUESTION_LIST.findIndex(
      (item) => item.id === question.pair,
    );
    if (pairIndex <= index) return;
    const mine = ratings[index];
    const theirs = ratings[pairIndex];
    if (mine === 0 || theirs === 0) return;
    answeredPairs += 1;
    const keyedMine = mine * question.direction;
    const keyedTheirs = theirs * AXIS_QUESTION_LIST[pairIndex].direction;
    if (keyedMine * keyedTheirs < 0) {
      conflicts += 1;
      conflictAxes.add(question.axis);
    }
  });

  // 4) 作答速度
  const secondsPerItem =
    typeof payload.t === "number" && payload.t > 0
      ? Math.round((payload.t / ratings.length) * 10) / 10
      : null;

  const warnings: ValidityWarning[] = [];

  if (longstring >= 12) {
    warnings.push({
      key: "longstring",
      title: "有几道题点得一模一样",
      body: `连续 ${longstring} 道题给了同一个答案。如果每一道都确实这么想，那没问题，忽略这条就好。`,
    });
  }

  if (irv < 0.35) {
    warnings.push({
      key: "irv",
      title: "整卷答案几乎没有起伏",
      body: "所有题都集中在同一档，可能是随手点的。这份结果仅供参考，有空可以慢慢重做一次。",
    });
  }

  if (conflicts >= 2 && conflicts >= answeredPairs * 0.25) {
    warnings.push({
      key: "pair",
      title: "同一条轴上有前后矛盾",
      body: `${conflicts} 组相反的问题给了相近的态度，所以那几条轴的判断我更保守地标成了「倾向模糊」。`,
    });
  }

  if (secondsPerItem !== null && secondsPerItem < 1.5) {
    warnings.push({
      key: "speed",
      title: "答得有点快",
      body: `平均每题 ${secondsPerItem} 秒。有些题可能没细看，结果会偏粗。`,
    });
  }

  return {
    available: true,
    longstring,
    irv,
    conflicts,
    conflictAxes: [...conflictAxes],
    secondsPerItem,
    warnings,
  };
}
