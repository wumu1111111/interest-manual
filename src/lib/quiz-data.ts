import type { Axis, Question } from "./types";

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

/** 32 道四轴题：每轴 8 题，两端各 4 题，选项位置交替左右，避免顺序偏差 */
const AXIS_QUESTIONS: Question[] = [
  // ── 场域：I 室内 / O 户外 ──
  {
    id: "a1",
    kind: "axis",
    axis: "field",
    prompt: "突然多出一个没安排的周六，你会…",
    options: [
      { id: "a1L", label: "把家里某个角落重新弄一遍", value: -1 },
      { id: "a1R", label: "出门随便走走，走到哪算哪", value: 1 },
    ],
  },
  {
    id: "a2",
    kind: "axis",
    axis: "field",
    prompt: "天气特别好的下午，你第一反应是…",
    options: [
      { id: "a2L", label: "这种天不该待在屋里", value: 1 },
      { id: "a2R", label: "正好开窗，泡点东西坐下", value: -1 },
    ],
  },
  {
    id: "a3",
    kind: "axis",
    axis: "field",
    prompt: "约朋友见面，你更希望这个局…",
    options: [
      { id: "a3L", label: "在谁家里，穿睡衣也行", value: -1 },
      { id: "a3R", label: "在户外，边走边聊", value: 1 },
    ],
  },
  {
    id: "a4",
    kind: "axis",
    axis: "field",
    prompt: "空出来的两个小时，你更想…",
    options: [
      { id: "a4L", label: "去一条没走过的路", value: 1 },
      { id: "a4R", label: "去一家有意思的店里坐着", value: -1 },
    ],
  },
  {
    id: "a5",
    kind: "axis",
    axis: "field",
    prompt: "你的相册里更多的是…",
    options: [
      { id: "a5L", label: "房间里的光、桌上的东西、吃的", value: -1 },
      { id: "a5R", label: "天空、街道、山和海", value: 1 },
    ],
  },
  {
    id: "a6",
    kind: "axis",
    axis: "field",
    prompt: "出门玩了一整天，回家前你更想…",
    options: [
      { id: "a6L", label: "再走一段，把劲儿散掉", value: 1 },
      { id: "a6R", label: "找个安静地方先坐一会儿", value: -1 },
    ],
  },
  {
    id: "a7",
    kind: "axis",
    axis: "field",
    prompt: "想学一样新东西，你更愿意…",
    options: [
      { id: "a7L", label: "在家看教程，自己慢慢试", value: -1 },
      { id: "a7R", label: "报个线下班，去现场摸", value: 1 },
    ],
  },
  {
    id: "a8",
    kind: "axis",
    axis: "field",
    prompt: "你更受不了的是…",
    options: [
      { id: "a8L", label: "连着好几天没出过门", value: 1 },
      { id: "a8R", label: "连着好几天在外面跑", value: -1 },
    ],
  },

  // ── 社交：S 独处 / G 结伴 ──
  {
    id: "b1",
    kind: "axis",
    axis: "social",
    prompt: "周五晚上，你更想要…",
    options: [
      { id: "b1L", label: "一个人，谁也别找我", value: -1 },
      { id: "b1R", label: "有人一起，干什么都行", value: 1 },
    ],
  },
  {
    id: "b2",
    kind: "axis",
    axis: "social",
    prompt: "你更享受的那种快乐是…",
    options: [
      { id: "b2L", label: "一群人闹到一起", value: 1 },
      { id: "b2R", label: "一个人把事做完的踏实", value: -1 },
    ],
  },
  {
    id: "b3",
    kind: "axis",
    axis: "social",
    prompt: "去一个只认识主人的饭局，你会…",
    options: [
      { id: "b3L", label: "先找个角落观察一下", value: -1 },
      { id: "b3R", label: "主动找人搭话", value: 1 },
    ],
  },
  {
    id: "b4",
    kind: "axis",
    axis: "social",
    prompt: "旅行你更愿意…",
    options: [
      { id: "b4L", label: "拉上一伙人", value: 1 },
      { id: "b4R", label: "一个人说走就走", value: -1 },
    ],
  },
  {
    id: "b5",
    kind: "axis",
    axis: "social",
    prompt: "遇到特别想分享的东西，你…",
    options: [
      { id: "b5L", label: "先自己消化，过几天才提", value: -1 },
      { id: "b5R", label: "马上发给某个人", value: 1 },
    ],
  },
  {
    id: "b6",
    kind: "axis",
    axis: "social",
    prompt: "你更舒服的状态是…",
    options: [
      { id: "b6L", label: "认识很多人，随时能约到人", value: 1 },
      { id: "b6R", label: "有几个能深聊的，但不用常见", value: -1 },
    ],
  },
  {
    id: "b7",
    kind: "axis",
    axis: "social",
    prompt: "和很多人待了一整天，你…",
    options: [
      { id: "b7L", label: "需要独处很久才能回血", value: -1 },
      { id: "b7R", label: "还挺兴奋，想接着聊", value: 1 },
    ],
  },
  {
    id: "b8",
    kind: "axis",
    axis: "social",
    prompt: "你更受不了的是…",
    options: [
      { id: "b8L", label: "一整个周末没人说话", value: 1 },
      { id: "b8R", label: "一整个周末都在应酬", value: -1 },
    ],
  },

  // ── 姿态：M 创造 / T 体验 ──
  {
    id: "c1",
    kind: "axis",
    axis: "mode",
    prompt: "看到一件特别好看的东西，你更想…",
    options: [
      { id: "c1L", label: "弄清楚它怎么做的，甚至自己试", value: -1 },
      { id: "c1R", label: "好好欣赏，或者买下来", value: 1 },
    ],
  },
  {
    id: "c2",
    kind: "axis",
    axis: "mode",
    prompt: "你刷到的内容里更多是…",
    options: [
      { id: "c2L", label: "「我去了 / 我吃了 / 我看了」", value: 1 },
      { id: "c2R", label: "「怎么做出一个…」", value: -1 },
    ],
  },
  {
    id: "c3",
    kind: "axis",
    axis: "mode",
    prompt: "一趟旅行回来，你更可能…",
    options: [
      { id: "c3L", label: "做本小册子，或者剪条视频", value: -1 },
      { id: "c3R", label: "存一堆照片，偶尔翻翻", value: 1 },
    ],
  },
  {
    id: "c4",
    kind: "axis",
    axis: "mode",
    prompt: "你更享受哪一下…",
    options: [
      { id: "c4L", label: "遇到好东西的惊喜", value: 1 },
      { id: "c4R", label: "把想法变成实物", value: -1 },
    ],
  },
  {
    id: "c5",
    kind: "axis",
    axis: "mode",
    prompt: "朋友会说你是…",
    options: [
      { id: "c5L", label: "总在折腾点什么的人", value: -1 },
      { id: "c5R", label: "很会玩、很会挑的人", value: 1 },
    ],
  },
  {
    id: "c6",
    kind: "axis",
    axis: "mode",
    prompt: "拿到新工具或者新玩具，你…",
    options: [
      { id: "c6L", label: "先按说明书用一遍", value: 1 },
      { id: "c6R", label: "想拆开看看", value: -1 },
    ],
  },
  {
    id: "c7",
    kind: "axis",
    axis: "mode",
    prompt: "空闲两小时，你更想…",
    options: [
      { id: "c7L", label: "动手做点什么，哪怕很糙", value: -1 },
      { id: "c7R", label: "看点、听点好的", value: 1 },
    ],
  },
  {
    id: "c8",
    kind: "axis",
    axis: "mode",
    prompt: "你更受不了的是…",
    options: [
      { id: "c8L", label: "一整天在忙，什么也没享受到", value: 1 },
      { id: "c8R", label: "一整天只是输入，什么都没产出", value: -1 },
    ],
  },

  // ── 节奏：D 深潜 / W 广谱 ──
  {
    id: "d1",
    kind: "axis",
    axis: "tempo",
    prompt: "过去一年，你更接近…",
    options: [
      { id: "d1L", label: "深耕一两件事", value: -1 },
      { id: "d1R", label: "试了七八样", value: 1 },
    ],
  },
  {
    id: "d2",
    kind: "axis",
    axis: "tempo",
    prompt: "你的收藏夹…",
    options: [
      { id: "d2L", label: "什么都有，看不出规律", value: 1 },
      { id: "d2R", label: "都是同一类东西的不同款", value: -1 },
    ],
  },
  {
    id: "d3",
    kind: "axis",
    axis: "tempo",
    prompt: "学新东西时，你…",
    options: [
      { id: "d3L", label: "想先把基础打透", value: -1 },
      { id: "d3R", label: "先玩起来，卡住再查", value: 1 },
    ],
  },
  {
    id: "d4",
    kind: "axis",
    axis: "tempo",
    prompt: "你更享受…",
    options: [
      { id: "d4L", label: "什么都懂一点，跟谁都能聊", value: 1 },
      { id: "d4R", label: "成为小圈子里最懂的人", value: -1 },
    ],
  },
  {
    id: "d5",
    kind: "axis",
    axis: "tempo",
    prompt: "你的周末更常是…",
    options: [
      { id: "d5L", label: "去同一个地方，做同一件事", value: -1 },
      { id: "d5R", label: "每次都想换个新的", value: 1 },
    ],
  },
  {
    id: "d6",
    kind: "axis",
    axis: "tempo",
    prompt: "碰到一个感兴趣的话题，你…",
    options: [
      { id: "d6L", label: "看看就过，转头又被别的吸引", value: 1 },
      { id: "d6R", label: "会一路挖到底", value: -1 },
    ],
  },
  {
    id: "d7",
    kind: "axis",
    axis: "tempo",
    prompt: "你更受不了的是…",
    options: [
      { id: "d7L", label: "一直在浅层打转，什么都没深入", value: -1 },
      { id: "d7R", label: "被一件事绑住，别的都错过", value: 1 },
    ],
  },
  {
    id: "d8",
    kind: "axis",
    axis: "tempo",
    prompt: "你屋里更可能是…",
    options: [
      { id: "d8L", label: "各种半途而废的小玩意", value: 1 },
      { id: "d8R", label: "一整套相关的装备", value: -1 },
    ],
  },
];

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

export const QUESTIONS: Question[] = [...AXIS_QUESTIONS, ...PRACTICAL_QUESTIONS];
export const TOTAL_QUESTIONS = QUESTIONS.length;
