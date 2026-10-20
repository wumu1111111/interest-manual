import Link from "next/link";
import { demoPayload, encodePayload } from "@/lib/score";
import { TYPE_PROFILES } from "@/lib/type-profiles";
import { SunScribble, Underline, Doodle } from "@/components/art";
import Mascot, { TYPE_ART } from "@/components/mascot";
import { Sprinkles } from "@/components/doodles";
import Reveal from "@/components/reveal";
import SiteHeader from "@/components/site-header";

function MiniAxis({
  left,
  right,
  leftPct,
}: {
  left: string;
  right: string;
  leftPct: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[10px] text-muted">
        <span>
          {left} <span className="tnum text-ink/70">{leftPct}</span>
        </span>
        <span>
          <span className="tnum text-ink/70">{100 - leftPct}</span> {right}
        </span>
      </div>
      <div className="mt-1 flex h-[3px] overflow-hidden rounded-full bg-paper-deep">
        <div className="h-full bg-forest/80" style={{ width: `${leftPct}%` }} />
        <div className="h-full flex-1 bg-accent/50" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <SunScribble className="pointer-events-none absolute -right-12 -top-16 hidden size-64 text-accent/20 sm:block sm:size-72" />
        <div className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-forest/[0.05] blur-3xl" />

        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 pb-6 pt-2 sm:px-8 sm:pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-10">
          <div>
            <div className="rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-1 text-[11px] text-muted">
                <span className="size-1.5 rounded-full bg-forest" />
                参考 MBTI 的答题方式，但不测性格
              </p>
            </div>

            <div className="rise" style={{ animationDelay: "70ms" }}>
              <h1 className="mt-6 font-serif text-[1.95rem] leading-[1.24] tracking-tight sm:text-[3.1rem] sm:leading-[1.12]">
                别再问朋友
                <br />
                <span className="relative inline-block">
                  <span className="text-accent">「你最近在忙什么」</span>
                  <Underline className="absolute -bottom-1 left-0 h-3 w-full text-accent" />
                </span>
              </h1>
            </div>

            <div className="rise" style={{ animationDelay: "130ms" }}>
              <p className="mt-7 max-w-md text-[15px] leading-7 text-muted sm:text-[16px]">
                40 道题，8 分钟，出一份能直接发出去的说明书：
                怎么约你、送什么、什么千万别碰。
              </p>
            </div>

            <div className="rise" style={{ animationDelay: "190ms" }}>
              <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5">
                <Link
                  href="/quiz"
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper hover:bg-accent sm:w-auto"
                >
                  开始做我的说明书
                  <span className="text-paper/60">→</span>
                </Link>
                <a
                  href="#types"
                  className="text-center text-[13px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink sm:text-left"
                >
                  先看看 16 种类型
                </a>
              </div>
            </div>

            <div className="rise" style={{ animationDelay: "250ms" }}>
              <div className="mt-9 flex items-end gap-3">
                <Mascot pose="wave" className="h-20 w-20 shrink-0" />
                <div className="relative mb-3 max-w-[13rem] rounded-2xl rounded-bl-md border border-line bg-white/85 px-3.5 py-2 text-[11px] leading-5 text-ink/70 shadow-[0_10px_26px_-22px_rgba(31,27,22,0.9)]">
                  <span className="absolute -left-[5px] top-1/2 size-2.5 -translate-y-1/2 rotate-45 rounded-[2px] border-b border-l border-line bg-white/85" />
                  40 道题，我陪你做完
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-muted">
                不用注册 · 答案只在你的链接里
              </p>
            </div>
          </div>

          {/* 桌面端才展示的样例卡片，手机上保持极简 */}
          <div
            className="rise relative hidden lg:block"
            style={{ animationDelay: "160ms" }}
          >
            <div className="absolute -inset-6 -z-10 rounded-[40px] bg-paper-deep/60 blur-2xl" />
            <div className="lift rotate-[-0.6deg] rounded-[26px] border border-line bg-white p-7 shadow-[0_24px_60px_-38px_rgba(31,27,22,0.7)]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted">
                <span>兴趣说明书</span>
                <span>NO. 08</span>
              </div>

              <p className="mt-6 text-[11px] text-muted">小明的说明书</p>
              <h2 className="mt-1 font-serif text-[2rem] leading-tight">
                深夜手作人
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span className="rounded bg-paper-deep px-1.5 py-0.5 font-mono tracking-[0.18em] text-ink/70">
                  I S M D
                </span>
                一个人，一间屋，做到凌晨
              </p>

              <div className="mt-6 space-y-3">
                <MiniAxis left="室内" right="户外" leftPct={81} />
                <MiniAxis left="独处" right="结伴" leftPct={75} />
                <MiniAxis left="创造" right="体验" leftPct={85} />
                <MiniAxis left="深潜" right="广谱" leftPct={72} />
              </div>

              <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-[12px] leading-6">
                <p>
                  <span className="text-muted">能约我</span> 做饭、看展、读书
                </p>
                <p>
                  <span className="text-muted">别约我</span> 蹦迪、大型聚会
                </p>
                <p>
                  <span className="text-muted">最近想要</span> 一把好用的手冲壶
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 静物长卷：把生成的插画当作一条纸带垫在下面，四边用纸色渐变化开 */}
        <div className="relative mx-auto mt-2 h-[195px] w-full max-w-6xl overflow-hidden sm:h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/hero.webp"
            alt=""
            aria-hidden="true"
            className="art-in h-full w-full object-cover object-[50%_82%] mix-blend-darken"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-paper)_0%,transparent_26%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-paper)_0%,transparent_9%,transparent_91%,var(--color-paper)_100%)]" />
        </div>
      </section>

      <section id="types" className="relative overflow-hidden border-y border-line bg-white/55">
        <Sprinkles className="opacity-70" />
        <div className="relative mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-[1.35rem] sm:text-3xl">
                16 种兴趣人格
              </h2>
              <p className="text-right text-[11px] text-muted">
                点开看完整说明书
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-6 flex snap-x snap-mandatory items-stretch gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {TYPE_PROFILES.map((type) => (
                <Link
                  key={type.code}
                  href={`/result?d=${encodePayload(demoPayload(type.code))}`}
                  className="lift relative w-[170px] min-h-[118px] shrink-0 snap-start rounded-2xl border border-line bg-white/70 p-4 hover:border-ink/25 hover:bg-white sm:w-auto"
                >
                  <Doodle
                    name={TYPE_ART[type.code] ?? "spark"}
                    className="absolute right-3 top-3 size-[18px] text-accent/45 transition-colors group-hover:text-accent"
                  />
                  <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
                    {type.code}
                  </span>
                  <span className="mt-2 block font-serif text-[17px] leading-tight">
                    {type.name}
                  </span>
                  <span className="mt-1.5 block text-[11px] leading-relaxed text-muted">
                    {type.slogan}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
          <p className="mt-2 text-[11px] text-muted sm:hidden">左右滑动查看 →</p>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <p className="text-[11px] leading-6 text-muted">
          兴趣说明书 · 一个用来了解朋友的小工具
          <br />
          答题形式参考 MBTI，与 MBTI 无任何关联或授权关系；这是兴趣偏好参考，不是心理测评。
        </p>
      </footer>
    </main>
  );
}
