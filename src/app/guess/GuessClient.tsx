"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { guessQuestionsFor, scoreGuess, verdict } from "@/lib/guess";
import type { ProfilePayload } from "@/lib/types";
import ShareBar from "@/components/share-bar";
import Mascot, { MascotHead } from "@/components/mascot";
import { Sparkle } from "@/components/doodles";

export default function GuessClient({
  payload,
  encoded,
}: {
  payload: ProfilePayload;
  encoded: string;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const lockRef = useRef(false);

  // 按这份说明书挑题：优先挑"和类型相反"以及"分数接近中线"的题
  const chosen = useMemo(() => guessQuestionsFor(payload), [payload]);
  const questions = chosen.list;
  const total = questions.length;

  const name = payload.n?.trim() || "TA";
  const question = questions[index];
  const done = index >= total;

  useEffect(() => {
    lockRef.current = false;
  }, [index]);

  const pick = useCallback(
    (questionId: string, optionIndex: number) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      window.setTimeout(() => {
        setIndex((current) => Math.min(current + 1, total));
      }, 160);
    },
    [total],
  );

  useEffect(() => {
    if (!question) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        lockRef.current = false;
        setIndex((current) => Math.max(0, current - 1));
        return;
      }
      const pressed = Number(event.key);
      if (
        Number.isInteger(pressed) &&
        pressed >= 1 &&
        pressed <= question.options.length
      ) {
        pick(question.id, pressed - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question, pick]);

  const result = useMemo(() => scoreGuess(payload, answers), [payload, answers]);
  const score = result.total
    ? Math.round((result.correct / result.total) * 100)
    : 0;
  const verdictText = verdict(result.correct, result.total);
  const progress = Math.round((Math.min(index, total) / total) * 100);

  const reset = () => {
    setAnswers({});
    setIndex(0);
  };

  return (
    <div className="fade flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-5 pt-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <span className="size-2 rounded-full bg-accent" />
          兴趣说明书
        </Link>
        <span className="text-[11px] text-muted">默契测试</span>
      </header>

      {!done ? (
        <div className="mx-auto mt-6 w-full max-w-xl px-5">
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
      ) : null}

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-14">
        <div className="my-auto w-full py-8">
          {!done && question ? (
            <div key={question.id} className="rise">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                第 {index + 1} 题 / {total} · 你觉得{name}会怎么选
              </p>
              <h1 className="mt-3 font-serif text-[1.5rem] leading-snug sm:text-[1.8rem]">
                {question.prompt}
              </h1>
              {chosen.personalized ? (
                <p className="mt-2 text-[11px] text-accent/80">
                  这 12 题按{name}的类型挑的，专挑最容易猜错的
                </p>
              ) : null}

              <div className="mt-7 space-y-3">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option.id}
                    onClick={() => pick(question.id, optionIndex)}
                    className="option flex w-full items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 text-left"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[10px] text-muted">
                      {optionIndex + 1}
                    </span>
                    <span className="text-[15px] leading-7">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4 text-[12px] text-muted">
                <button
                  onClick={() => setIndex((current) => Math.max(0, current - 1))}
                  disabled={index === 0}
                  className="transition-colors hover:text-ink disabled:opacity-40"
                >
                  ← 上一题
                </button>
                <span className="text-line">|</span>
                <span className="hidden sm:inline">按 1 / 2 也可以选</span>
              </div>
            </div>
          ) : (
            <div className="rise">
              <div className="relative rounded-3xl border border-line bg-white p-6 text-center">
                <Sparkle className="twinkle absolute left-5 top-5 size-4 text-accent/40" />
                <Sparkle
                  className="twinkle absolute right-6 top-12 size-3 text-forest/30"
                  style={{ animationDelay: "900ms" }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/art/pair.webp"
                  alt=""
                  aria-hidden="true"
                  className="art-in mx-auto -mt-1 h-32 w-32 object-contain"
                />
                <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted">
                  你和{name}的默契度
                </p>
                <p className="tnum mt-2 font-serif text-[3.4rem] leading-none">
                  {score}
                  <span className="ml-1 text-lg text-muted">%</span>
                </p>
                <p className="mt-3 text-[13px] text-muted">
                  12 题猜对 {result.correct} 题
                </p>
                {result.personalized ? (
                  <p className="mt-1 text-[11px] text-muted/80">
                    题目按 TA 的类型挑的，专挑容易猜错的
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {result.detail.map((item) => (
                    <span
                      key={item.question.id}
                      title={item.correct ? "猜对" : "猜错"}
                      className={`size-2.5 rounded-full ${
                        item.correct ? "bg-forest/80" : "bg-accent/35"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-7 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl">{verdictText.title}</h2>
                  <p className="mt-2 text-[13px] leading-7 text-muted">
                    {verdictText.body}
                  </p>
                </div>
                <Mascot
                  pose={score >= 60 ? "cheer" : "think"}
                  className="pop -mt-2 h-16 w-16 shrink-0"
                />
              </div>

              <ul className="mt-6 divide-y divide-line border-y border-line">
                {result.detail.map((item) => (
                  <li key={item.question.id} className="py-3">
                    <p className="text-[11px] leading-5 text-muted">
                      {item.question.prompt}
                    </p>
                    <p className="mt-1 text-[13px] leading-6">
                      <span
                        className={item.correct ? "text-forest" : "text-accent"}
                      >
                        {item.correct ? "猜对" : "猜错"}
                      </span>
                      <span className="text-muted">
                        {" · "}你猜「
                        {item.picked !== undefined
                          ? item.question.options[item.picked].label
                          : "—"}
                        」
                      </span>
                      {!item.correct ? (
                        <span className="text-ink">
                          ，{name}选「{item.question.options[item.actual].label}」
                        </span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/result?d=${encoded}`}
                  className="btn-primary inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-paper hover:bg-accent"
                >
                  看{name}的说明书
                  <span className="text-paper/60">→</span>
                </Link>
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[13px] transition-colors hover:border-ink/30"
                >
                  我也要做一份
                </Link>
              </div>

              <div className="mt-8 rounded-3xl border border-line bg-white p-5">
                <p className="text-[12px] leading-6 text-muted">
                  把这条发给别的朋友，看看谁最懂{name}。
                </p>
                <ShareBar
                  text={`我猜${name}的 12 个选择，对了 ${result.correct} 题，默契度 ${score}%。你敢试试吗？`}
                />
              </div>

              <button
                onClick={reset}
                className="mt-6 text-[12px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                重新猜一遍
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
