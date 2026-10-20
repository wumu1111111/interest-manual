/** 四轴：场域 / 社交 / 姿态 / 节奏 */
export type Axis = "field" | "social" | "mode" | "tempo";

export interface AxisQuestion {
  id: string;
  kind: "axis";
  axis: Axis;
  /** 一句陈述，用户对它的认同度决定这一轴的偏移 */
  statement: string;
  /** 这句话指向哪一端：-1 = 左端（室内/独处/创造/深潜），+1 = 右端 */
  direction: -1 | 1;
  /** 属于哪一档：1 快速版 / 2 标准版 / 3 深度版 */
  tier?: 1 | 2 | 3;
  /**
   * 相反极性的配对题 id（同轴、同子面、方向相反）。
   * 作答效度用：两条都认真答的人，配对题的态度应该互为镜像。
   */
  pair?: string;
}

export interface MultiQuestion {
  id: string;
  kind: "multi";
  group: "played" | "wish" | "avoid";
  prompt: string;
  hint?: string;
  max: number;
  options: { id: string; label: string }[];
  tier?: 1 | 2 | 3;
}

export interface SingleQuestion {
  id: string;
  kind: "single";
  field: "invite" | "duration" | "spend" | "group";
  prompt: string;
  hint?: string;
  options: { id: string; label: string }[];
  tier?: 1 | 2 | 3;
}

export interface TextQuestion {
  id: string;
  kind: "text";
  field: "wishlist";
  prompt: string;
  hint?: string;
  placeholder: string;
  maxLength: number;
  tier?: 1 | 2 | 3;
}

export type Question = AxisQuestion | MultiQuestion | SingleQuestion | TextQuestion;

export interface Prefs {
  invite: string;
  duration: string;
  spend: string;
  group: string;
}

/** 分享链接里携带的紧凑画像 */
export interface ProfilePayload {
  v: 1;
  n?: string;
  /** 四轴得分，-1..1 */
  a: number[];
  /** 常玩标签 */
  p: string[];
  /** 想试标签 */
  w: string[];
  /** 不碰标签 */
  x: string[];
  pr: Prefs;
  /** 心愿单 */
  wl?: string;
  /** 好友默契用的 12 道题各自选了第几个选项（0/1），顺序见 lib/guess.ts */
  g?: number[];
  /** 全部 32 道四轴题的答案，0/1 拼成的 32 位字符串，用来按类型挑题 */
  ga?: string;
  /**
   * 48 道认同度，每题的 -2..2 加 2 后拼成 "0"-"4" 的字符串。
   * 默契测试靠它挑题和判分；作答效度检测也只看它。
   */
  r?: string;
  /** 整卷作答总秒数（新版才记），用来识别「秒选」；老链接没有 */
  t?: number;
}

export interface TypeProfile {
  code: string;
  name: string;
  slogan: string;
  desc: string;
  /** 约我的正确方式 */
  how: string[];
  /** 千万别约我 */
  avoid: string[];
  /** 可以一起做的事 */
  ideas: string[];
}

/** 线性图标的名字，供 SVG 组件和类型卡复用 */
export type ArtKey =
  | "lamp"
  | "mountain"
  | "solo"
  | "group"
  | "brush"
  | "eye"
  | "target"
  | "rays"
  | "book"
  | "music"
  | "plant"
  | "dumbbell"
  | "camera"
  | "sun"
  | "mug"
  | "spark";
