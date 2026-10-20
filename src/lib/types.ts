/** 四轴：场域 / 社交 / 姿态 / 节奏 */
export type Axis = "field" | "social" | "mode" | "tempo";

export interface AxisOption {
  id: string;
  label: string;
  /** -1 = 左端（室内/独处/创造/深潜），+1 = 右端（户外/结伴/体验/广谱） */
  value: -1 | 1;
}

export interface AxisQuestion {
  id: string;
  kind: "axis";
  axis: Axis;
  prompt: string;
  options: AxisOption[];
}

export interface MultiQuestion {
  id: string;
  kind: "multi";
  group: "played" | "wish" | "avoid";
  prompt: string;
  hint?: string;
  max: number;
  options: { id: string; label: string }[];
}

export interface SingleQuestion {
  id: string;
  kind: "single";
  field: "invite" | "duration" | "spend" | "group";
  prompt: string;
  hint?: string;
  options: { id: string; label: string }[];
}

export interface TextQuestion {
  id: string;
  kind: "text";
  field: "wishlist";
  prompt: string;
  hint?: string;
  placeholder: string;
  maxLength: number;
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
