import { QUESTIONS } from "./quiz-data";
import { AXIS_ORDER } from "./score";
import type { Axis, AxisQuestion, ProfilePayload } from "./types";

/** 全部 48 道四轴陈述句，顺序与 `r` 字段一致 */
const AXIS_QUESTIONS = QUESTIONS.filter(
  (question): question is AxisQuestion => question.kind === "axis",
);

/** 答题时把每题的认同度（-2..2）编码成 0..4 的数字串，塞进分享链接 */
export function ratingsFromAnswers(answers: Record<string, number>): string {
  return AXIS_QUESTIONS.map((question) =>
    String((answers[question.id] ?? 0) + 2),
  ).join("");
}

/** 读出每题的认同度；老链接没有 r 字段时，按四轴分数反推一个大概态度 */
export function ratingsOf(payload: ProfilePayload): number[] {
  if (
    typeof payload.r === "string" &&
    payload.r.length === AXIS_QUESTIONS.length
  ) {
    return [...payload.r].map((char) => Number(char) - 2);
  }

  return AXIS_QUESTIONS.map((question) => {
    const axisIndex = AXIS_ORDER.indexOf(question.axis);
    const score = payload.a[axisIndex] ?? 0;
    return Math.max(
      -2,
      Math.min(2, Math.round(score * question.direction * 2)),
    );
  });
}

interface Candidate {
  question: AxisQuestion;
  index: number;
  rating: number;
  rank: number;
}

/**
 * 挑出让人猜的题。
 *
 * 只挑「有明确立场」的（|认同度| >= 1），中立题没法猜对错。
 * 排序：先挑和类型相反的（最出乎意料），再看立场有多强。
 * 每轴最多 3 道，四轴交错排列。
 */
export function guessQuestionsFor(payload: ProfilePayload): {
  list: AxisQuestion[];
  ratings: number[];
  personalized: boolean;
} {
  const ratings = ratingsOf(payload);
  const buckets: Record<Axis, Candidate[]> = {
    field: [],
    social: [],
    mode: [],
    tempo: [],
  };

  AXIS_QUESTIONS.forEach((question, index) => {
    const rating = ratings[index];
    if (Math.abs(rating) < 1) return;
    const surprise = Math.sign(rating) === question.direction ? 0 : 1;
    buckets[question.axis].push({
      question,
      index,
      rating,
      rank: surprise * 2 + Math.abs(rating) / 2,
    });
  });

  const perAxis = AXIS_ORDER.map((axis) =>
    buckets[axis].sort((a, b) => b.rank - a.rank).slice(0, 3),
  );

  // 四轴交错：第 1 轮取每轴第 1 道，第 2 轮取第 2 道……
  const ordered: Candidate[] = [];
  for (let round = 0; round < 3; round += 1) {
    for (const list of perAxis) {
      if (list[round]) ordered.push(list[round]);
    }
  }

  return {
    list: ordered.map((item) => item.question),
    ratings: ordered.map((item) => item.rating),
    personalized: typeof payload.r === "string",
  };
}

export interface GuessDetail {
  question: AxisQuestion;
  /** 朋友猜的：1 = 会同意，-1 = 不会 */
  picked: number | undefined;
  /** 本人实际的认同度，-2..2 */
  actual: number;
  correct: boolean;
}

export function scoreGuess(
  payload: ProfilePayload,
  guesses: Record<string, number>,
): {
  correct: number;
  total: number;
  detail: GuessDetail[];
  personalized: boolean;
} {
  const { list, ratings, personalized } = guessQuestionsFor(payload);

  const detail: GuessDetail[] = list.map((question, index) => {
    const actual = ratings[index];
    const picked = guesses[question.id];
    return {
      question,
      picked,
      actual,
      correct: picked === Math.sign(actual),
    };
  });

  return {
    correct: detail.filter((item) => item.correct).length,
    total: list.length,
    detail,
    personalized,
  };
}

export function verdict(
  correct: number,
  total: number,
): { title: string; body: string } {
  const ratio = total ? correct / total : 0;
  if (total > 0 && correct === total) {
    return {
      title: "你是真的懂 TA",
      body: "全对。这种了解度，基本可以替 TA 安排周末了。",
    };
  }
  if (ratio >= 0.8) {
    return {
      title: "你们很熟",
      body: "大部分都猜对了。错的那几题，可能是 TA 自己都还没说出口的部分。",
    };
  }
  if (ratio >= 0.55) {
    return {
      title: "熟，但还没到最里面",
      body: "大方向是对的，细节有偏差。看看下面哪几题猜反了。",
    };
  }
  if (ratio >= 0.3) {
    return {
      title: "还在互相了解",
      body: "猜对了几题，但 TA 的习惯可能比你想象得更固定。",
    };
  }
  return {
    title: "你俩可能不太熟",
    body: "别急，翻到下面看看 TA 的说明书，下次就能对上了。",
  };
}
