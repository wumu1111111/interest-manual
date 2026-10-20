import { AXIS_ORDER } from "./score";
import { TAG_LABELS } from "./quiz-data";
import type { ArtKey, Axis, ProfilePayload } from "./types";

export type { ArtKey };

export interface Trait {
  art: ArtKey;
  title: string;
  body: string;
}

export interface InterestCluster {
  key: string;
  label: string;
  art: ArtKey;
  count: number;
  share: number;
  tags: string[];
}

const TRAITS: Record<Axis, { left: Trait; right: Trait; even: Trait }> = {
  field: {
    left: {
      art: "lamp",
      title: "室内才回血",
      body: "一盏灯、一张桌子、手边有自己的东西，你就稳了。连着几天不出门，也不会觉得亏。",
    },
    right: {
      art: "mountain",
      title: "出门才开机",
      body: "在屋里闷久了，人会钝。换个地方走一走，看天、看人、看路，脑子才转得动。",
    },
    even: {
      art: "sun",
      title: "两边都待得住",
      body: "室内室外你都能过，主要看那天有没有人叫、天气好不好。",
    },
  },
  social: {
    left: {
      art: "solo",
      title: "社交有额度",
      body: "你不是不合群，是热闹要花配额。热闹完一个人待一会儿，那才叫回血。",
    },
    right: {
      art: "group",
      title: "人是你的燃料",
      body: "一个人待久了会发飘。哪怕什么都不做，只要有人在旁边，这一天就没白过。",
    },
    even: {
      art: "spark",
      title: "看心情",
      body: "人多也行，一个人也行。你不缺热闹，也不太需要靠热闹撑着。",
    },
  },
  mode: {
    left: {
      art: "brush",
      title: "要做出来",
      body: "看过、听过都不算数，你要亲手弄一个出来。哪怕很糙，那也是你的。",
    },
    right: {
      art: "eye",
      title: "很会挑",
      body: "你的天赋是找到好东西：好店、好片、好味道。你不需要亲手做，你需要先遇到。",
    },
    even: {
      art: "spark",
      title: "做和看都行",
      body: "你既愿意动手，也舍得好好欣赏，没把自己框在一边。",
    },
  },
  tempo: {
    left: {
      art: "target",
      title: "往深里走",
      body: "比起「都试过」，你更在乎「我真的懂了」。一件事挖到底，比十件事各摸一遍过瘾。",
    },
    right: {
      art: "rays",
      title: "往宽里走",
      body: "你什么都想试试。换得快不是不专一，是你需要一直被新东西推着走。",
    },
    even: {
      art: "rays",
      title: "深浅都行",
      body: "想钻的时候能钻下去，想换的时候也不觉得亏，节奏由你定。",
    },
  },
};

const CLUSTERS: { key: string; label: string; art: ArtKey; tags: string[] }[] = [
  {
    key: "outdoor",
    label: "户外与身体",
    art: "mountain",
    tags: [
      "hike",
      "ride",
      "camp",
      "swim",
      "run",
      "ball",
      "gym",
      "ski",
      "surf",
      "dive",
      "climb",
      "run10",
    ],
  },
  {
    key: "make",
    label: "动手与创造",
    art: "brush",
    tags: ["cook", "craft", "draw", "model", "code", "write", "pottery", "dish", "garden"],
  },
  {
    key: "culture",
    label: "内容与文化",
    art: "book",
    tags: ["film", "read", "art", "photo", "video", "music", "lang", "photo_series", "vlog"],
  },
  {
    key: "social",
    label: "热闹与社交",
    art: "music",
    tags: ["board", "sing", "live", "chess", "cafe", "market"],
  },
  {
    key: "life",
    label: "生活与陪伴",
    art: "plant",
    tags: ["plant", "pet", "travel", "pet_new"],
  },
];

const CLUSTER_OF = new Map<string, string>();
for (const cluster of CLUSTERS) {
  for (const tag of cluster.tags) CLUSTER_OF.set(tag, cluster.key);
}

export function analyze(payload: ProfilePayload): {
  traits: Trait[];
  clusters: InterestCluster[];
  sentence: string;
  tip: string;
} {
  const scores = payload.a;

  // 偏差最大的三个维度，最像"这个人"
  const ranked = AXIS_ORDER.map((axis, index) => ({
    axis,
    index,
    strength: Math.abs(scores[index] ?? 0),
  })).sort((a, b) => b.strength - a.strength);

  const traits = ranked.slice(0, 3).map(({ axis, index, strength }) => {
    if (strength < 0.2) return TRAITS[axis].even;
    return (scores[index] ?? 0) <= 0 ? TRAITS[axis].left : TRAITS[axis].right;
  });

  const picked = [
    ...payload.p.filter((tag) => tag !== "none"),
    ...payload.w.filter((tag) => tag !== "none"),
  ];
  const counted = picked.filter((tag) => CLUSTER_OF.has(tag));
  const total = counted.length;

  const clusters = CLUSTERS.map((cluster) => {
    const tags = counted.filter((tag) => CLUSTER_OF.get(tag) === cluster.key);
    return {
      key: cluster.key,
      label: cluster.label,
      art: cluster.art,
      count: tags.length,
      share: total ? tags.length / total : 0,
      tags: tags.map((tag) => TAG_LABELS[tag] ?? tag),
    };
  })
    .filter((cluster) => cluster.count > 0)
    .sort((a, b) => b.count - a.count);

  const sentence = clusters.length
    ? clusters.length === 1
      ? `你的兴趣基本集中在${clusters[0].label}这一类。`
      : `你的兴趣主要在${clusters[0].label}，其次是${clusters[1].label}。`
    : "你还没填具体的兴趣，这一栏空着，说明书会少一半信息。";

  const playedCount = payload.p.filter((tag) => tag !== "none").length;
  const wishCount = payload.w.length;

  let tip: string;
  if (playedCount === 0) {
    tip = "「常玩」那一栏还是空的。先把最近半年真的会做的事补上，别人照着约你才不会踩空。";
  } else if (wishCount >= 3) {
    tip = `你攒了 ${wishCount} 个「一直想试」。挑一个这周做掉，比再收藏十个有用。`;
  } else if (clusters.length === 1) {
    tip = "你的兴趣很集中。好处是容易约，坏处是——朋友想约你换个花样，得先说服你。";
  } else {
    tip = "把这份说明书发给一个朋友，看看他猜你猜得准不准。";
  }

  return { traits, clusters, sentence, tip };
}

/** 一句话画像，用在分析区顶部 */
export function portraitLine(payload: ProfilePayload): string {
  const [field, social, mode, tempo] = payload.a;
  const bits = [
    field <= 0 ? "能量在室内" : "能量在户外",
    social <= 0 ? "独处才回血" : "人多了才来劲",
    mode <= 0 ? "动手比欣赏更满足" : "更容易被好东西打动",
    tempo <= 0 ? "喜欢的东西会钻很深" : "什么都想试一点",
  ];
  return bits.join("，") + "。";
}
