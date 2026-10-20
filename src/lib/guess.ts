import { QUESTIONS } from "./quiz-data";
import { AXIS_ORDER } from "./score";
import type { Axis, AxisQuestion, ProfilePayload } from "./types";

/** 老链接（没有 ga 字段）用它兜底：每轴 3 道固定的二选一 */
export const GUESS_IDS = [
  "a1",
  "b1",
  "c5",
  "d1",
  "a2",
  "b3",
  "c2",
  "d5",
  "a6",
  "b4",
  "c4",
  "d6",
] as const;

const BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));

export const GUESS_QUESTIONS = GUESS_IDS.map((id) => BY_ID.get(id)).filter(
  (question): question is AxisQuestion => question?.kind === "axis",
);

/** 全部 32 道四轴题 */
const AXIS_QUESTIONS = QUESTIONS.filter(
  (question): question is AxisQuestion => question.kind === "axis",
);
const AXIS_COUNT = AXIS_QUESTIONS.length;

/** 答题时把 32 道四轴题的答案记成 0/1 串，塞进分享链接 */
export function allAxisBits(choices: Record<string, string>): number[] {
  return AXIS_QUESTIONS.map((question) => {
    const index = question.options.findIndex(
      (option) => option.id === choices[question.id],
    );
    return index === 1 ? 1 : 0;
  });
}

/** 老字段 g：固定 12 题各自的选项下标 */
export function bitsFromChoices(choices: Record<string, string>): number[] {
  return GUESS_QUESTIONS.map((question) => {
    const index = question.options.findIndex(
      (option) => option.id === choices[question.id],
    );
    return index === 1 ? 1 : 0;
  });
}

function allBits(payload: ProfilePayload): number[] | null {
  if (typeof payload.ga === "string" && payload.ga.length === AXIS_COUNT) {
    return [...payload.ga].map((char) => (char === "1" ? 1 : 0));
  }
  return null;
}

/**
 * 按这份说明书挑 12 道题。
 *
 * 优先级：先挑「和类型相反」的答案（最出乎意料），再挑分数接近中线的（最难猜）。
 * 每轴 3 道，保证四个方面都覆盖到。
 */
export function guessQuestionsFor(payload: ProfilePayload): {
  list: AxisQuestion[];
  bits: number[];
  personalized: boolean;
} {
  const all = allBits(payload);

  if (!all) {
    // 老链接：固定 12 题
    const bits = Array.isArray(payload.g) && payload.g.length === GUESS_QUESTIONS.length
      ? payload.g.map((value) => (value === 1 ? 1 : 0))
      : GUESS_QUESTIONS.map((question) => {
          const axisIndex = AXIS_ORDER.indexOf(question.axis);
          const target = (payload.a[axisIndex] ?? 0) <= 0 ? -1 : 1;
          return question.options.findIndex((option) => option.value === target) === 1 ? 1 : 0;
        });
    return { list: GUESS_QUESTIONS, bits, personalized: false };
  }

  const buckets: Record<Axis, { question: AxisQuestion; index: number; rank: number }[]> = {
    field: [],
    social: [],
    mode: [],
    tempo: [],
  };

  AXIS_QUESTIONS.forEach((question, index) => {
    const axisIndex = AXIS_ORDER.indexOf(question.axis);
    const score = payload.a[axisIndex] ?? 0;
    const target = score <= 0 ? -1 : 1;
    const chosen = question.options[all[index]].value;
    // 和类型相反＝意料之外；分数越接近 0＝越难猜
    const surprise = chosen === target ? 0 : 1;
    const ambiguity = 1 - Math.min(1, Math.abs(score));
    buckets[question.axis].push({
      question,
      index,
      rank: surprise * 2 + ambiguity,
    });
  });

  const picked: { question: AxisQuestion; index: number }[] = [];
  for (const axis of AXIS_ORDER) {
    const top = buckets[axis]
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 3);
    picked.push(...top.map(({ question, index }) => ({ question, index })));
  }
  // 按四轴顺序取，再交错打散，避免连续三道都在同一维度
  const interleaved: typeof picked = [];
  for (let round = 0; round < 3; round += 1) {
    for (let axis = 0; axis < 4; axis += 1) {
      const item = picked[axis * 3 + round];
      if (item) interleaved.push(item);
    }
  }

  return {
    list: interleaved.map((item) => item.question),
    bits: interleaved.map((item) => all[item.index]),
    personalized: true,
  };
}

export interface GuessDetail {
  question: AxisQuestion;
  picked: number | undefined;
  actual: number;
  correct: boolean;
}

export function scoreGuess(
  payload: ProfilePayload,
  answers: Record<string, number>,
): { correct: number; total: number; detail: GuessDetail[]; personalized: boolean } {
  const { list, bits, personalized } = guessQuestionsFor(payload);
  const detail: GuessDetail[] = list.map((question, index) => {
    const picked = answers[question.id];
    return {
      question,
      picked,
      actual: bits[index],
      correct: picked === bits[index],
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
  if (correct === total) {
    return {
      title: "你是真的懂 TA",
      body: "12 题全对。这种了解度，基本可以替 TA 安排周末了。",
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
