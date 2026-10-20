import type { Axis, AxisQuestion, Question } from "./types";

export const AXES: Record<
  Axis,
  {
    label: string;
    sub: string;
    left: { letter: string; label: string };
    right: { letter: string; label: string };
  }
> = {
  field: {
    label: "场域",
    sub: "你的能量发生在哪",
    left: { letter: "I", label: "室内" },
    right: { letter: "O", label: "户外" },
  },
  social: {
    label: "社交",
    sub: "和谁一起才尽兴",
    left: { letter: "S", label: "独处" },
    right: { letter: "G", label: "结伴" },
  },
  mode: {
    label: "姿态",
    sub: "动手做，还是去体验",
    left: { letter: "M", label: "创造" },
    right: { letter: "T", label: "体验" },
  },
  tempo: {
    label: "节奏",
    sub: "钻一项，还是什么都尝",
    left: { letter: "D", label: "深潜" },
    right: { letter: "W", label: "广谱" },
  },
};

/**
 * 五级认同度。中间档是有意义的：既可以是"两边都行"，也可以是"两边都不想要"，
 * 所以不再逼用户二选一。
 */
export const SCALE = [
  { value: -2, label: "很不同意", short: "很不同意" },
  { value: -1, label: "不同意", short: "不同意" },
  { value: 0, label: "都行", short: "都行" },
  { value: 1, label: "同意", short: "同意" },
  { value: 2, label: "很同意", short: "很同意" },
] as const;

/** 题量分档：数字越大，每轴题越多，结果越稳 */
export type QuizMode = "quick" | "standard" | "deep";

export const QUIZ_MODES: {
  key: QuizMode;
  label: string;
  desc: string;
  tier: 1 | 2 | 3;
}[] = [
  {
    key: "quick",
    label: "快速版",
    desc: "每轴 4 句，先看看自己大概是什么人",
    tier: 1,
  },
  {
    key: "standard",
    label: "标准版",
    desc: "每轴 8 句，精度和时间的平衡点",
    tier: 2,
  },
  {
    key: "deep",
    label: "深度版",
    desc: "每轴 12 句，边界情况也能分出高下",
    tier: 3,
  },
];

type AxisSeed = {
  id: string;
  axis: Axis;
  direction: -1 | 1;
  statement: string;
};

/**
 * 48 句陈述，按轴排、每轴 12 句。
 * 1-4 句进快速版，5-8 句进标准版，9-12 句只有深度版才问。
 * 每轴两端各占一半，且顺序交替，避免整体偏向某一端。
 */
const AXIS_SEEDS: AxisSeed[] = [
  // ── 场域：I 室内 / O 户外 ──
  { id: "a1", axis: "field", direction: -1, statement: "多出一个没安排的周六，我更想把家里某个角落收拾一遍" },
  { id: "a2", axis: "field", direction: 1, statement: "天气好的下午待在家里，会让我觉得有点浪费" },
  { id: "a3", axis: "field", direction: -1, statement: "约朋友见面，在家里比在外面自在" },
  { id: "a4", axis: "field", direction: 1, statement: "空出来的两小时，我更想出门走一条没走过的路" },
  { id: "a5", axis: "field", direction: -1, statement: "我的相册里多是房间里的光、桌上的东西和吃的" },
  { id: "a6", axis: "field", direction: 1, statement: "在外面待了一整天，回家前我还想再走一段" },
  { id: "a7", axis: "field", direction: -1, statement: "学一样新东西，我更喜欢在家看教程、自己慢慢试" },
  { id: "a8", axis: "field", direction: 1, statement: "连着几天没出门，我会觉得闷" },
  { id: "a9", axis: "field", direction: -1, statement: "周末要是没人叫我，我大概一整天都不会出门" },
  { id: "a10", axis: "field", direction: 1, statement: "逛街不一定买东西，光是在外面走走就值了" },
  { id: "a11", axis: "field", direction: -1, statement: "我更喜欢在自己熟悉的空间里见人" },
  { id: "a12", axis: "field", direction: 1, statement: "换个城市待几天，比在家待着更让我恢复" },

  // ── 社交：S 独处 / G 结伴 ──
  { id: "b1", axis: "social", direction: -1, statement: "周五晚上，我最想要的是谁也别来找我" },
  { id: "b2", axis: "social", direction: 1, statement: "一群人闹到一起的那种热闹，很对我的胃口" },
  { id: "b3", axis: "social", direction: -1, statement: "去一个只认识主人的饭局，我会先找个角落观察" },
  { id: "b4", axis: "social", direction: 1, statement: "旅行我更愿意拉上一伙人，而不是一个人走" },
  { id: "b5", axis: "social", direction: -1, statement: "遇到特别想分享的东西，我会先自己消化几天" },
  { id: "b6", axis: "social", direction: 1, statement: "我更舒服的状态是认识很多人、随时都能约到人" },
  { id: "b7", axis: "social", direction: -1, statement: "和很多人待了一整天，我需要独处很久才能回血" },
  { id: "b8", axis: "social", direction: 1, statement: "一整个周末没人说话，我会难受" },
  { id: "b9", axis: "social", direction: -1, statement: "聚会结束的时候，我常常会觉得松了一口气" },
  { id: "b10", axis: "social", direction: 1, statement: "一个人待久了，我会想约人出来" },
  { id: "b11", axis: "social", direction: -1, statement: "比起认识新朋友，我更愿意和老朋友待着" },
  { id: "b12", axis: "social", direction: 1, statement: "有陌生人的场合，我通常会主动开口" },

  // ── 姿态：M 创造 / T 体验 ──
  { id: "c1", axis: "mode", direction: -1, statement: "看到一件好看的东西，我更想弄清楚它是怎么做的" },
  { id: "c2", axis: "mode", direction: 1, statement: "我刷到的内容多是「我去了、我吃了、我看了」" },
  { id: "c3", axis: "mode", direction: -1, statement: "一趟旅行回来，我更可能做本小册子或者剪条视频" },
  { id: "c4", axis: "mode", direction: 1, statement: "比起自己做出来，遇到好东西更让我满足" },
  { id: "c5", axis: "mode", direction: -1, statement: "朋友会说我是个总在折腾点什么的人" },
  { id: "c6", axis: "mode", direction: 1, statement: "拿到新工具，我会先按说明书用一遍" },
  { id: "c7", axis: "mode", direction: -1, statement: "空闲两小时，我更想动手做点什么，哪怕很糙" },
  { id: "c8", axis: "mode", direction: 1, statement: "一整天在忙却没享受到什么，我会觉得亏" },
  { id: "c9", axis: "mode", direction: -1, statement: "我常常边看教程边自己上手改" },
  { id: "c10", axis: "mode", direction: 1, statement: "我更愿意把钱花在体验上，而不是买工具" },
  { id: "c11", axis: "mode", direction: -1, statement: "手上有活儿的时候，我最放松" },
  { id: "c12", axis: "mode", direction: 1, statement: "看别人做得好，比自己做得好更让我满足" },

  // ── 节奏：D 深潜 / W 广谱 ──
  { id: "d1", axis: "tempo", direction: -1, statement: "过去一年，我主要在深耕一两件事" },
  { id: "d2", axis: "tempo", direction: 1, statement: "我的收藏夹里什么都有，看不出规律" },
  { id: "d3", axis: "tempo", direction: -1, statement: "学新东西，我想先把基础打透再往上走" },
  { id: "d4", axis: "tempo", direction: 1, statement: "我更享受什么都懂一点、跟谁都能聊" },
  { id: "d5", axis: "tempo", direction: -1, statement: "我的周末常常是同一个地方、同一件事" },
  { id: "d6", axis: "tempo", direction: 1, statement: "碰到感兴趣的话题，我看看就过，转头又被别的吸引" },
  { id: "d7", axis: "tempo", direction: -1, statement: "一直在浅层打转，会让我难受" },
  { id: "d8", axis: "tempo", direction: 1, statement: "屋里堆着各种半途而废的小玩意，这很像我" },
  { id: "d9", axis: "tempo", direction: -1, statement: "同一个游戏、同一部剧，我能反复用好几年" },
  { id: "d10", axis: "tempo", direction: 1, statement: "手机里装了一堆试过一次就再没打开的东西" },
  { id: "d11", axis: "tempo", direction: -1, statement: "我更愿意把一件事练到比大部分人好" },
  { id: "d12", axis: "tempo", direction: 1, statement: "朋友说我兴趣换得比换季还快" },
];

const AXIS_QUESTIONS: Question[] = AXIS_SEEDS.map(
  (seed, index): AxisQuestion => ({
    ...seed,
    kind: "axis",
    // 每轴 12 句：1-4 → 快速版，5-8 → 标准版，9-12 → 深度版
    tier: (Math.floor((index % 12) / 4) + 1) as 1 | 2 | 3,
  }),
);

export const TAG_LABELS: Record<string, string> = {
  // 常玩
  cook: "做饭 / 烘焙",
  hike: "徒步爬山",
  ride: "骑行",
  gym: "健身撸铁",
  run: "跑步",
  ball: "球类运动",
  swim: "游泳",
  camp: "露营",
  photo: "摄影",
  video: "拍视频剪片",
  draw: "画画",
  craft: "手工 / 陶艺",
  music: "乐器",
  sing: "唱歌 / KTV",
  art: "看展 / 逛美术馆",
  film: "电影 / 剧",
  read: "读书",
  game: "打游戏",
  board: "桌游 / 剧本杀",
  cafe: "咖啡 / 探店",
  travel: "旅行",
  plant: "养植物",
  pet: "养宠物",
  model: "拼装模型",
  code: "编程 / 做小工具",
  write: "写东西",
  market: "逛市集 / 二手",
  live: "演出 / 蹦迪",
  chess: "麻将 / 棋牌",
  none: "哪个都不太算",

  // 想试
  dive: "潜水",
  surf: "冲浪",
  ski: "滑雪",
  climb: "攀岩",
  lang: "学一门语言",
  pottery: "学陶艺",
  dance: "学跳舞",
  photo_series: "拍一组照片",
  vlog: "做一期视频",
  garden: "种点什么",
  run10: "跑一次十公里",
  dish: "学一道硬菜",
  pet_new: "养一只宠物",

  // 不碰
  x_hike: "爬山",
  x_camp: "露营",
  x_escape: "密室逃脱",
  x_script: "剧本杀",
  x_ktv: "KTV",
  x_club: "蹦迪",
  x_expo: "看展",
  x_shop: "长时间逛街",
  x_longtrip: "长途旅行",
  x_crowd: "人多的地方",
  x_early: "需要早起的活动",
  x_drink: "需要喝酒的场合",
  x_bigparty: "大型聚会",
  x_intense: "特别费体力的运动",
};

export const PREF_OPTIONS = {
  invite: [
    { id: "spontaneous", label: "太好了，我随时能走" },
    { id: "flexible", label: "可以，但我会有点乱" },
    { id: "planned", label: "不行，至少提前一天" },
  ],
  duration: [
    { id: "short", label: "两小时以内就够" },
    { id: "medium", label: "三四个小时最舒服" },
    { id: "whole", label: "一整天都可以" },
    { id: "overnight", label: "过夜也行" },
  ],
  spend: [
    { id: "free", label: "不花钱也能玩得开心" },
    { id: "experience", label: "愿意为体验花钱" },
    { id: "gear", label: "愿意为装备花钱" },
    { id: "all", label: "值得就都愿意" },
  ],
  group: [
    { id: "lurk", label: "潜水，基本不说话" },
    { id: "react", label: "会接话，但不主动" },
    { id: "warm", label: "很快就能聊开" },
  ],
} as const;

export const PREF_LABELS: Record<keyof typeof PREF_OPTIONS, string> = {
  invite: "临时约我",
  duration: "能待多久",
  spend: "花钱风格",
  group: "进新群",
};

export function prefLabel(
  field: keyof typeof PREF_OPTIONS,
  id: string,
): string {
  const list = PREF_OPTIONS[field] as readonly { id: string; label: string }[];
  return list.find((item) => item.id === id)?.label ?? "";
}

export function tagLabels(ids: string[]): string[] {
  return ids
    .filter((id) => id !== "none" && TAG_LABELS[id])
    .map((id) => TAG_LABELS[id]);
}

const PRACTICAL_QUESTIONS: Question[] = [
  {
    id: "p1",
    kind: "multi",
    group: "played",
    prompt: "最近半年，你真的会去做这几件事",
    hint: "最多选 6 个，选「做了什么」而不是「想做什么」",
    max: 6,
    options: [
      "cook",
      "hike",
      "ride",
      "gym",
      "run",
      "ball",
      "swim",
      "camp",
      "photo",
      "video",
      "draw",
      "craft",
      "music",
      "sing",
      "art",
      "film",
      "read",
      "game",
      "board",
      "cafe",
      "travel",
      "plant",
      "pet",
      "model",
      "code",
      "write",
      "market",
      "live",
      "chess",
      "none",
    ].map((id) => ({ id, label: TAG_LABELS[id] })),
  },
  {
    id: "p2",
    kind: "multi",
    group: "wish",
    prompt: "一直想试，但还没开始的",
    hint: "最多选 5 个。这一栏最容易被朋友记住",
    max: 5,
    options: [
      "dive",
      "surf",
      "ski",
      "climb",
      "lang",
      "pottery",
      "dance",
      "photo_series",
      "vlog",
      "garden",
      "run10",
      "dish",
      "pet_new",
    ].map((id) => ({ id, label: TAG_LABELS[id] })),
  },
  {
    id: "p3",
    kind: "multi",
    group: "avoid",
    prompt: "以下这些，你会明确拒绝",
    hint: "最多选 5 个。别客气，这一栏能帮朋友少踩很多雷",
    max: 5,
    options: [
      "x_hike",
      "x_camp",
      "x_escape",
      "x_script",
      "x_ktv",
      "x_club",
      "x_expo",
      "x_shop",
      "x_longtrip",
      "x_crowd",
      "x_early",
      "x_drink",
      "x_bigparty",
      "x_intense",
    ].map((id) => ({ id, label: TAG_LABELS[id] })),
  },
  {
    id: "p4",
    kind: "single",
    field: "invite",
    prompt: "朋友临时喊你出门，你的真实感受是…",
    options: PREF_OPTIONS.invite.map((o) => ({ ...o })),
  },
  {
    id: "p5",
    kind: "single",
    field: "duration",
    prompt: "一次约出来，你觉得多长最舒服",
    options: PREF_OPTIONS.duration.map((o) => ({ ...o })),
  },
  {
    id: "p6",
    kind: "single",
    field: "spend",
    prompt: "出去玩，你的钱更愿意花在…",
    options: PREF_OPTIONS.spend.map((o) => ({ ...o })),
  },
  {
    id: "p7",
    kind: "single",
    field: "group",
    prompt: "被拉进一个全是陌生人的群，你通常…",
    options: PREF_OPTIONS.group.map((o) => ({ ...o })),
  },
  {
    id: "p8",
    kind: "text",
    field: "wishlist",
    prompt: "一直想买、或者想去还没去的",
    hint: "一句话就好，朋友看到这条最容易上手（可跳过）",
    placeholder: "例：一把好用的手冲壶 / 去趟海边",
    maxLength: 40,
  },
];

/** 具体题的档位：四道「你真正会做的事」进快速版，四道偏好题标准版才问 */
const PRACTICAL_TIER: Record<string, 1 | 2> = {
  p1: 1,
  p2: 1,
  p3: 1,
  p8: 1,
  p4: 2,
  p5: 2,
  p6: 2,
  p7: 2,
};

export const QUESTIONS: Question[] = [
  ...AXIS_QUESTIONS,
  ...PRACTICAL_QUESTIONS.map(
    (question): Question => ({
      ...question,
      tier: PRACTICAL_TIER[question.id] ?? 2,
    }),
  ),
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

const TIER_OF: Record<QuizMode, 1 | 2 | 3> = {
  quick: 1,
  standard: 2,
  deep: 3,
};

/** 按档位取题：深度版包含标准版，标准版包含快速版 */
export function questionsFor(mode: QuizMode): Question[] {
  const max = TIER_OF[mode];
  return QUESTIONS.filter((question) => (question.tier ?? 2) <= max);
}

/** 给首页 / 选择页显示用的概览 */
export function modeSummary(mode: QuizMode): { count: number; minutes: number } {
  const count = questionsFor(mode).length;
  // 每题按 9 秒估，另加开头交代的时间
  return { count, minutes: Math.max(2, Math.round((count * 9) / 60)) };
}