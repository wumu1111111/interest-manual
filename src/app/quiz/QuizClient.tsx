"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AXES,
  QUIZ_MODES,
  SCALE,
  modeSummary,
  questionsFor,
  type QuizMode,
} from "@/lib/quiz-data";
import { axisScores, encodePayload, typeCodeOf } from "@/lib/score";
import { ratingsFromAnswers } from "@/lib/guess";
import { TYPE_BY_CODE } from "@/lib/type-profiles";
import Mascot, { MascotHead } from "@/components/mascot";
import type { Question } from "@/lib/types";

type MultiGroup = "played" | "wish" | "avoid";
type PrefField = "invite" | "duration" | "spend" | "group";

const SINGLE_QID: Record<PrefField, string> = (() => {
  const map: Partial<Record<PrefField, string>> = {};
  for (const question of questionsFor("deep")) {
    if (question.kind === "single") map[question.field] = question.id;
  }
  return map as Record<PrefField, string>;
})();

/** 40 题很容易中途刷新，进度存在本地，回来接着答 */
const STORAGE_KEY = "interest-manual:quiz:v2";

function sectionLabel(question: Question): string {
  if (question.kind === "axis") {
    return `${AXES[question.axis].label} · ${AXES[question.axis].sub}`;
  }
  if (question.kind === "multi") return "具体一点 · 你真正会做的事";
  if (question.kind === "single") return "具体一点 · 怎么约你最省事";
  return "最后一题";
}

export default function QuizClient() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>("standard");
  const [stage, setStage] = useState<"choose" | "quiz">("choose");
  const [step, setStep] = useState(0);
  // 同步锁：防止快速双击在同一个 tick 里跳过两题
  const lockRef = useRef(false);
  /** 四轴题的认同度：-2..2 */
  const [ratings, setRatings] = useState<Record<string, number>>({});
  /** 单选题（邀约/时长/花钱/进新群）的选项 id */
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [multi, setMulti] = useState<Record<MultiGroup, string[]>>({
    played: [],
    wish: [],
    avoid: [],
  });
  const [wishlist, setWishlist] = useState("");
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);

  /** 当前档位要问的题 */
  const list = useMemo(() => questionsFor(mode), [mode]);
  const total = list.length;
  const question: Question | undefined = list[step];
  const finished = step >= total;

  // 首次挂载时恢复进度；恢复完再渲染，避免闪一下第 1 题。
  // 这里必须在 effect 里 setState（localStorage 只有客户端才有），
  // 且 ready 之前不渲染，所以不会和 SSR 结果打架。
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          v?: number;
          step?: number;
          mode?: QuizMode;
          stage?: "choose" | "quiz";
          ratings?: Record<string, number>;
          choices?: Record<string, string>;
          multi?: Record<MultiGroup, string[]>;
          wishlist?: string;
          name?: string;
        };
        if (saved.v === 2 && typeof saved.step === "number") {
          const savedMode = saved.mode ?? "standard";
          setMode(savedMode);
          setStep(Math.min(Math.max(saved.step, 0), questionsFor(savedMode).length));
          setStage(saved.stage ?? "choose");
          setRatings(saved.ratings ?? {});
          setChoices(saved.choices ?? {});
          setMulti({
            played: saved.multi?.played ?? [],
            wish: saved.multi?.wish ?? [],
            avoid: saved.multi?.avoid ?? [],
          });
          setWishlist(saved.wishlist ?? "");
          setName(saved.name ?? "");
        }
      }
    } catch {
      // 隐私模式下 localStorage 会抛错，忽略即可
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 每次变化都写回去
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: 2,
          step,
          mode,
          stage,
          ratings,
          choices,
          multi,
          wishlist,
          name,
        }),
      );
    } catch {
      // 存不下就算了，不影响答题
    }
  }, [ready, step, mode, stage, ratings, choices, multi, wishlist, name]);

  useEffect(() => {
    lockRef.current = false;
  }, [step]);

  const back = useCallback(() => {
    lockRef.current = false;
    setStep((current) => Math.max(0, current - 1));
  }, []);

  /** 立刻前进一题，同一时刻只允许触发一次 */
  const goNext = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setStep((current) => Math.min(current + 1, total));
  }, [total]);

  const choose = useCallback(
    (questionId: string, optionId: string) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setChoices((prev) => ({ ...prev, [questionId]: optionId }));
      window.setTimeout(() => {
        setStep((current) => Math.min(current + 1, total));
      }, 150);
    },
    [total],
  );

  /** 选认同度：记下 -2..2，然后自动进入下一题 */
  const rate = useCallback(
    (questionId: string, value: number) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setRatings((prev) => ({ ...prev, [questionId]: value }));
      window.setTimeout(() => {
        setStep((current) => Math.min(current + 1, total));
      }, 170);
    },
    [total],
  );

  const toggleMulti = useCallback(
    (group: MultiGroup, optionId: string, max: number) => {
      setMulti((prev) => {
        const current = prev[group];
        if (current.includes(optionId)) {
          return { ...prev, [group]: current.filter((id) => id !== optionId) };
        }
        if (optionId === "none") return { ...prev, [group]: ["none"] };
        const cleaned = current.filter((id) => id !== "none");
        if (cleaned.length >= max) return prev;
        return { ...prev, [group]: [...cleaned, optionId] };
      });
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        back();
        return;
      }
      if (!question || question.kind === "text") return;

      const index = Number(event.key);
      if (!Number.isInteger(index) || index < 1) return;

      if (question.kind === "axis") {
        // 1..5 对应 很不同意 .. 很同意
        const level = SCALE[index - 1];
        if (level) rate(question.id, level.value);
        return;
      }

      if (index > Math.min(question.options.length, 9)) return;
      const option = question.options[index - 1];
      if (question.kind === "multi") {
        toggleMulti(question.group, option.id, question.max);
      } else {
        choose(question.id, option.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question, choose, rate, back, toggleMulti]);

  const scores = useMemo(() => axisScores(ratings), [ratings]);
  const code = typeCodeOf(scores);
  const typeProfile = TYPE_BY_CODE[code];

  const progress = Math.round(
    (Math.min(step, total) / total) * 100,
  );

  const start = () => {
    const payload = {
      v: 1 as const,
      n: name.trim() || undefined,
      a: scores,
      p: multi.played,
      w: multi.wish,
      x: multi.avoid,
      pr: {
        invite: choices[SINGLE_QID.invite] ?? "",
        duration: choices[SINGLE_QID.duration] ?? "",
        spend: choices[SINGLE_QID.spend] ?? "",
        group: choices[SINGLE_QID.group] ?? "",
      },
      wl: wishlist.trim() || undefined,
      r: ratingsFromAnswers(ratings),
    };
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 清不掉也没关系
    }
    router.push(`/result?d=${encodePayload(payload)}`);
  };

  const useChips = question?.kind === "multi" && question.options.length > 8;

  if (!ready) {
    return <div className="min-h-dvh" />;
  }

  // 先选题量：题越多，每轴分得越细
  if (stage === "choose") {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-xl items-center justify-between px-6 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <span className="size-2 rounded-full bg-accent" />
            兴趣说明书
          </Link>
          <span className="text-[11px] text-muted">先选题量</span>
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-14">
          <div className="my-auto w-full py-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
              陈述句 · 五级认同度
            </p>
            <h1 className="mt-3 font-serif text-[2rem] leading-snug">
              想做多细？
            </h1>
            <p className="mt-3 text-[13px] leading-7 text-muted">
              题越多，四个维度分得越准。可以先做快速版，觉得有意思再回来做深度版——
              同一套题，档位只是问多少句。
            </p>

            <div className="mt-7 space-y-3">
              {QUIZ_MODES.map((item) => {
                const summary = modeSummary(item.key);
                const recommended = item.key === "standard";
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setMode(item.key);
                      setStep(0);
                      setStage("quiz");
                    }}
                    className="option flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 text-left"
                  >
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-2">
                        <span className="text-[15px] font-medium">
                          {item.label}
                        </span>
                        {recommended ? (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                            推荐
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-[12px] leading-5 text-muted">
                        {item.desc}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-[15px]">
                        {summary.count}
                        <span className="ml-0.5 text-[11px] text-muted">题</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        约 {summary.minutes} 分钟
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-[11px] leading-6 text-muted">
              都是同一批陈述句，不分对错，中间那档表示「两边都行 / 都说不好」。
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <span className="size-2 rounded-full bg-accent" />
          兴趣说明书
        </Link>
        <span className="font-mono text-[11px] tracking-wider text-muted">
          {Math.min(step + 1, total)} / {total}
        </span>
      </header>

      <div className="mx-auto mt-6 w-full max-w-2xl px-6">
        <div className="relative h-[3px] w-full rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          <span
            className="pointer-events-none absolute top-0 -translate-y-1/2 transition-[left] duration-300 ease-out"
            style={{ left: `calc(${Math.max(progress, 2)}% - 11px)` }}
          >
            <MascotHead className="size-[22px]" />
          </span>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-14">
        <div className="my-auto w-full py-10">
          {!finished && question ? (
            <div key={question.id} className="rise">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                {sectionLabel(question)}
              </p>
              <h1 className="mt-3 font-serif text-[1.55rem] leading-snug sm:text-[1.9rem]">
                {question.kind === "axis" ? question.statement : question.prompt}
              </h1>
              {question.kind !== "axis" && question.hint ? (
                <p className="mt-2.5 text-[12px] leading-6 text-muted">
                  {question.hint}
                </p>
              ) : null}

              {question.kind === "axis" ? (
                <div className="mt-9">
                  <div className="flex items-stretch justify-between gap-1.5">
                    {SCALE.map((level) => {
                      const selected = ratings[question.id] === level.value;
                      const size =
                        level.value === 0
                          ? 9
                          : Math.abs(level.value) === 1
                            ? 12
                            : 15;
                      return (
                        <button
                          key={level.value}
                          data-selected={selected}
                          onClick={() => rate(question.id, level.value)}
                          className="option flex flex-1 flex-col items-center gap-2.5 rounded-2xl border border-line bg-white px-1 py-3.5"
                        >
                          <span
                            className={`rounded-full border ${
                              selected
                                ? "border-accent bg-accent"
                                : "border-ink/25 bg-paper-deep"
                            }`}
                            style={{ width: size, height: size }}
                          />
                          <span
                            className={`text-[10px] leading-none ${
                              selected ? "text-ink" : "text-muted"
                            }`}
                          >
                            {level.short}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3.5 text-center text-[11px] leading-5 text-muted">
                    按真实感受选就好，中间那档是「两边都行 / 都说不好」
                  </p>
                </div>
              ) : question.kind === "text" ? (
                <div className="mt-8">
                  <textarea
                    value={wishlist}
                    onChange={(event) =>
                      setWishlist(event.target.value.slice(0, question.maxLength))
                    }
                    placeholder={question.placeholder}
                    rows={3}
                    autoFocus
                    className="w-full resize-none rounded-2xl border border-line bg-white px-5 py-4 text-[15px] leading-7 outline-none transition-colors placeholder:text-muted/60 focus:border-ink/40"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span>可以跳过</span>
                    <span>
                      {wishlist.length} / {question.maxLength}
                    </span>
                  </div>
                  <button
                    onClick={goNext}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent"
                  >
                    {wishlist.trim() ? "继续" : "跳过，先不写"}
                    <span className="text-paper/60">→</span>
                  </button>
                </div>
              ) : useChips ? (
                <div className="mt-7">
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => {
                      const selected = multi[question.group].includes(option.id);
                      return (
                        <button
                          key={option.id}
                          data-selected={selected}
                          onClick={() =>
                            toggleMulti(question.group, option.id, question.max)
                          }
                          className="option rounded-full border border-line bg-white px-4 py-2.5 text-[13px] leading-none text-ink/85"
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[11px] text-muted">
                      已选 {multi[question.group].length} / {question.max}
                    </span>
                    <button
                      disabled={multi[question.group].length === 0}
                      onClick={goNext}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
                    >
                      继续
                      <span className="opacity-60">→</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 space-y-3">
                  {question.options.map((option, index) => {
                    const selected =
                      question.kind === "multi"
                        ? multi[question.group].includes(option.id)
                        : choices[question.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        data-selected={selected}
                        onClick={() => {
                          if (question.kind === "multi") {
                            toggleMulti(question.group, option.id, question.max);
                          } else {
                            choose(question.id, option.id);
                          }
                        }}
                        className="option group flex w-full items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 text-left"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[10px] text-muted group-hover:border-ink/30">
                          {index + 1}
                        </span>
                        <span className="text-[15px] leading-7">
                          {option.label}
                        </span>
                        {question.kind === "multi" ? (
                          <span
                            className={`ml-auto size-4 shrink-0 rounded-[5px] border transition-colors ${
                              selected
                                ? "border-accent bg-accent"
                                : "border-line bg-paper"
                            }`}
                          />
                        ) : null}
                      </button>
                    );
                  })}

                  {question.kind === "multi" ? (
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-[11px] text-muted">
                        已选 {multi[question.group].length} / {question.max}
                      </span>
                      <button
                        disabled={multi[question.group].length === 0}
                        onClick={goNext}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
                      >
                        继续
                        <span className="opacity-60">→</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="mt-10 flex items-center gap-4 text-[12px] text-muted">
                <button
                  onClick={back}
                  disabled={step === 0}
                  className="transition-colors hover:text-ink disabled:opacity-40"
                >
                  ← 上一题
                </button>
                {question.kind === "single" ? (
                  <>
                    <span className="text-line">|</span>
                    <span className="hidden sm:inline">
                      也可以按数字键 1 - {question.options.length}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rise">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                    {total} / {total} · 完成
                  </p>
                  <h1 className="mt-3 font-serif text-3xl">
                    你的说明书已经可以生成了
                  </h1>
                </div>
                <Mascot pose="cheer" className="pop -mt-2 h-20 w-20 shrink-0" />
              </div>

              <div className="mt-8 rounded-3xl border border-line bg-white p-7">
                <p className="text-[11px] text-muted">你是</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-3">
                  <span className="font-serif text-[2rem] leading-tight">
                    {typeProfile?.name ?? "兴趣人格"}
                  </span>
                  <span className="rounded bg-paper-deep px-2 py-0.5 font-mono text-[11px] tracking-[0.2em] text-ink/70">
                    {code}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-7 text-muted">
                  {typeProfile?.slogan}
                </p>
              </div>

              <label className="mt-8 block">
                <span className="text-[12px] text-muted">
                  留个称呼，会显示在卡片上（可留空）
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 12))}
                  placeholder="例如：小明"
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-5 py-3.5 text-[15px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink/40"
                />
              </label>

              <button
                onClick={start}
                className="btn-primary mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-medium text-paper hover:bg-accent sm:w-auto"
              >
                生成我的说明书
                <span className="text-paper/60">→</span>
              </button>

              <p className="mt-4 text-[11px] leading-6 text-muted">
                生成后会得到一个专属链接。答案编码在链接里，不会上传到服务器。
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
