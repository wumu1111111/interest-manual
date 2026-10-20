import Link from "next/link";
import { AXES, PREF_LABELS, prefLabel, tagLabels } from "@/lib/quiz-data";
import {
  AXIS_ITEM_COUNT,
  AXIS_ORDER,
  borderlineAxes,
  flipCode,
  rightPercent,
  statsOfPayload,
  typeCodeOf,
  validityOf,
} from "@/lib/score";
import { TYPE_BY_CODE } from "@/lib/type-profiles";
import { analyze, portraitLine } from "@/lib/analysis";
import type { ArtKey, Axis, Prefs, ProfilePayload } from "@/lib/types";
import { Doodle } from "@/components/art";
import { Sparkle } from "@/components/doodles";
import Mascot, { mascotOf } from "@/components/mascot";
import ShareBar from "@/components/share-bar";

function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
        <Sparkle className="size-3 shrink-0 text-accent/60" />
        {children}
      </h2>
      {hint ? (
        <span className="text-[10px] text-muted/70">{hint}</span>
      ) : null}
    </div>
  );
}

const AXIS_ART: Record<Axis, { left: ArtKey; right: ArtKey }> = {
  field: { left: "lamp", right: "mountain" },
  social: { left: "solo", right: "group" },
  mode: { left: "brush", right: "eye" },
  tempo: { left: "target", right: "rays" },
};

function AxisBar({
  axis,
  value,
  sem,
  borderline,
}: {
  axis: Axis;
  value: number;
  sem: number;
  borderline: boolean;
}) {
  const { label, left, right } = AXES[axis];
  const rightPct = rightPercent(value);
  const leftPct = 100 - rightPct;
  const leftWins = leftPct >= rightPct;
  const art = AXIS_ART[axis];
  // 置信带：true 分数有大约 68% 落在这个区间里
  const bandLow = rightPercent(Math.max(-1, value - sem));
  const bandHigh = rightPercent(Math.min(1, value + sem));
  const bandWidth = Math.max(2, bandHigh - bandLow);

  return (
    <div className="rounded-2xl border border-line bg-paper/50 px-4 py-3">
      <div className="flex items-center justify-between text-[11px]">
        <span
          className={`flex items-center gap-1.5 ${leftWins ? "text-ink" : "text-muted"}`}
        >
          <Doodle name={art.left} className="size-3.5 opacity-70" />
          {left.label}{" "}
          <span className="font-mono text-[10px]">{leftPct}%</span>
        </span>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-muted/70">
          {label}
          {borderline ? (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[8px] normal-case tracking-normal text-accent">
              倾向模糊
            </span>
          ) : null}
        </span>
        <span
          className={`flex items-center gap-1.5 ${leftWins ? "text-muted" : "text-ink"}`}
        >
          <span className="font-mono text-[10px]">{rightPct}%</span>{" "}
          {right.label}
          <Doodle name={art.right} className="size-3.5 opacity-70" />
        </span>
      </div>
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep">
        <div className="flex h-full">
          <div className="h-full bg-forest" style={{ width: `${leftPct}%` }} />
          <div className="h-full flex-1 bg-accent/45" />
        </div>
        <div
          className="absolute inset-y-0 border-x border-ink/30 bg-ink/10"
          style={{ left: `${bandLow}%`, width: `${bandWidth}%` }}
        />
      </div>
    </div>
  );
}

function buildHowLines(payload: ProfilePayload, profileHow: string[]): string[] {
  const { invite, duration, group } = payload.pr;
  const lead: string[] = [];
  const tail: string[] = [];
  // 类型自带的建议已经说过的事，就不再重复一遍
  const baseText = profileHow.join(" ");

  if (invite === "planned" && !baseText.includes("提前"))
    lead.push("至少提前一天约，最好把时间地点说死");
  if (invite === "flexible" && !/提前|临时/.test(baseText))
    lead.push("临时约也行，但给我留一点反应时间");
  if (invite === "spontaneous" && !/临时|随时/.test(baseText))
    lead.push("随时约，我大概率有空");

  if (duration === "short") tail.push("两小时以内就够，别安排一整天");
  if (duration === "medium") tail.push("三四个小时是最舒服的长度");
  if (duration === "whole") tail.push("一整天也能跟上");
  if (duration === "overnight") tail.push("过夜也行，别有顾虑");

  if (group === "lurk") tail.push("到了新环境我会先安静一会儿，别急着把我拉进话题");

  return [...new Set([...lead, ...profileHow, ...tail])].slice(0, 5);
}

export default function ResultView({
  payload,
  encoded,
}: {
  payload: ProfilePayload;
  encoded: string;
}) {
  // 四轴的 SEM / 置信带：分数一样但稳定性差很多的人，显示出来要不一样
  // 有逐题串时以逐题重算的结果为准（和分享链接里的四个字母保持同一套数）
  const stats = statsOfPayload(payload);
  const scores =
    payload.r && payload.r.length === AXIS_ITEM_COUNT
      ? stats.map((stat) => stat.score)
      : payload.a;
  const code = typeCodeOf(scores);
  const profile = TYPE_BY_CODE[code];
  const owner = payload.n?.trim();
  const who = owner ?? "我";
  const softAxes = borderlineAxes(stats);
  const alternative = softAxes.length ? flipCode(code, softAxes[0]) : null;
  const alternativeProfile = alternative ? TYPE_BY_CODE[alternative] : undefined;
  const validity = validityOf(payload);

  const played = tagLabels(payload.p);
  const wish = tagLabels(payload.w);
  const avoidTags = tagLabels(payload.x);
  const howLines = buildHowLines(payload, profile?.how ?? []);
  const avoidLines = [
    ...(profile?.avoid ?? []),
    ...(avoidTags.length
      ? [`这几件事我会直接拒绝：${avoidTags.join("、")}`]
      : []),
  ];

  const { traits, clusters, sentence, tip } = analyze(payload);
  const portrait = portraitLine(payload);

  const shareText = [
    `【${profile?.name ?? "兴趣说明书"} · ${code}】${owner ? `（${owner}）` : ""}`,
    AXIS_ORDER.map((axis, index) =>
      scores[index] <= 0 ? AXES[axis].left.label : AXES[axis].right.label,
    ).join(" · "),
    `能约我：${played.length ? played.join("、") : "还没填"}`,
    `别约我：${avoidTags.length ? avoidTags.join("、") : "暂时没有"}`,
  ].join("\n");

  return (
    <div className="fade mx-auto w-full max-w-2xl px-5 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-6 text-[13px]">
        <Link href="/" className="text-muted transition-colors hover:text-ink">
          ← 兴趣说明书
        </Link>
        <Link href="/quiz" className="text-muted transition-colors hover:text-ink">
          重新测一次
        </Link>
      </header>

      <div className="relative mt-8">
        {/* 从卡片上边缘探出头的纸团：画在卡片后面，只露一个脑袋 */}
        <Mascot
          pose="peek"
          className="pointer-events-none absolute -top-[42px] right-[26%] z-0 h-14 w-14"
        />

        <article className="lift relative z-10 overflow-hidden rounded-[26px] border border-line bg-white p-6 shadow-[0_30px_80px_-60px_rgba(31,27,22,0.9)] sm:p-10">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted">
            <span>兴趣说明书</span>
            <span className="normal-case tracking-normal">{owner ?? "匿名"}</span>
          </div>

          <h1 className="mt-6 font-serif text-[2.2rem] leading-none tracking-tight sm:text-[2.5rem]">
            {profile?.name ?? "未命名类型"}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <span className="rounded bg-paper-deep px-2 py-0.5 font-mono text-[10px] tracking-[0.24em] text-ink/70">
              {code}
            </span>
            {profile?.slogan}
          </p>

          <p className="mt-5 text-[14px] leading-8 text-ink/85">
            {profile?.desc}
          </p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {AXIS_ORDER.map((axis, index) => (
              <AxisBar
                key={axis}
                axis={axis}
                value={scores[index]}
                sem={stats[index]?.sem ?? 0}
                borderline={softAxes.includes(index)}
              />
            ))}
          </div>

          {alternative ? (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] leading-6 text-muted">
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] text-accent">
                另一种可能
              </span>
              有一条轴的分数贴着中点，换个心境也可能落到
              <span className="font-mono text-[10px] text-ink/60">
                {alternative}
              </span>
              <span className="text-ink/80">
                {alternativeProfile?.name ?? "相邻类型"}
              </span>
              。不是把你说成两个人，只是那条轴本来就不该被一刀切。
            </p>
          ) : null}

          {/* 右下角的植物水印，给白卡片一点纸感 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/art/sprig.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 rotate-[-8deg] object-contain opacity-[0.14]"
          />
        </article>
      </div>

      <section className="mt-9">
        <SectionTitle hint="从你的四个维度推出来">你的性格特点</SectionTitle>
        <p className="mt-3 text-[13px] leading-7 text-ink/75">{portrait}</p>
        <div className="mt-4 space-y-2.5">
          {traits.map((trait) => (
            <div
              key={trait.title}
              className="flex gap-3.5 rounded-2xl border border-line bg-white/70 px-4 py-3.5"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-deep/70 text-ink/55">
                <Doodle name={trait.art} className="size-[17px]" />
              </span>
              <div>
                <p className="text-[14px] font-medium leading-6">
                  {trait.title}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-6 text-muted">
                  {trait.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionTitle hint="按你选过的标签归类">兴趣分布</SectionTitle>
        <p className="mt-3 text-[13px] leading-7 text-ink/75">{sentence}</p>

        {clusters.length ? (
          <div className="mt-4 space-y-3.5">
            {clusters.map((cluster) => (
              <div key={cluster.key}>
                <div className="flex items-center gap-2 text-[12px]">
                  <Doodle name={cluster.art} className="size-4 text-ink/45" />
                  <span className="text-ink/85">{cluster.label}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted">
                    {cluster.count} 项
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${Math.max(10, cluster.share * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] leading-5 text-muted/80">
                  {cluster.tags.join("、")}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-4 rounded-2xl bg-paper-deep/50 px-4 py-3 text-[12px] leading-6 text-ink/70">
          {tip}
        </p>
      </section>

      <section className="mt-9">
        <SectionTitle hint="照着做，成功率最高">怎么约我</SectionTitle>
        <ol className="mt-3 divide-y divide-line border-y border-line">
          {howLines.map((line, index) => (
            <li key={line} className="flex gap-4 py-3.5 text-[14px] leading-7">
              <span className="font-mono text-[11px] leading-7 text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </section>

      {avoidLines.length ? (
        <section className="mt-9 rounded-3xl bg-accent-soft/60 px-6 py-5">
          <h2 className="text-[13px] font-medium tracking-[0.14em] text-accent">
            千万别约我
          </h2>
          <ul className="mt-3 space-y-2">
            {avoidLines.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-[14px] leading-7 text-ink/85"
              >
                <span className="text-accent/70">×</span>
                {line}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-9">
        <SectionTitle hint="点开话题就从这里开始">我真正会做的事</SectionTitle>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white/60 p-4">
            <p className="text-[11px] text-muted">常玩的</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {payload.p.includes("none") || played.length === 0 ? (
                <span className="flex items-center gap-2 text-[13px] text-muted">
                  <Mascot pose="sleep" className="h-9 w-9 shrink-0" />
                  还没什么固定爱好，适合带我去试新的
                </span>
              ) : (
                played.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-paper-deep px-2.5 py-1 text-[12px] text-ink/80"
                  >
                    {label}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-line bg-white/30 p-4">
            <p className="text-[11px] text-muted">一直想试的</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {wish.length ? (
                wish.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-line bg-white px-2.5 py-1 text-[12px] text-ink/80"
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="text-[13px] text-muted">暂时没想到</span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] leading-6 text-muted">
          约我做「常玩的」基本不会错；敢约我「一直想试的」，我会记很久。
        </p>
      </section>

      {payload.wl ? (
        <section className="mt-9">
          <SectionTitle hint="朋友看到这条最容易上手">最近想要的</SectionTitle>
          <p className="mt-4 rounded-2xl border-l-2 border-accent bg-white/70 px-5 py-4 font-serif text-[17px] leading-8">
            「{payload.wl}」
          </p>
        </section>
      ) : null}

      <section className="mt-9">
        <SectionTitle>我的偏好</SectionTitle>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {(Object.keys(PREF_LABELS) as (keyof Prefs)[]).map((field) => (
            <div
              key={field}
              className="rounded-2xl border border-line bg-white/60 px-4 py-3"
            >
              <p className="text-[10px] text-muted">{PREF_LABELS[field]}</p>
              <p className="mt-1 text-[12.5px] leading-5 text-ink/85">
                {prefLabel(field, payload.pr[field]) || "没填"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {profile?.ideas?.length ? (
        <section className="mt-9">
          <SectionTitle hint="从这些开始最稳">可以一起做的事</SectionTitle>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {profile.ideas.map((idea) => (
              <li
                key={idea}
                className="rounded-2xl border border-line bg-white/60 px-4 py-3 text-[13px] leading-6"
              >
                {idea}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <SectionTitle hint="长按或点一下就能存">我的名片</SectionTitle>
        <div className="mx-auto mt-4 w-full max-w-[320px]">
          <div className="relative overflow-hidden rounded-[26px] border border-line bg-paper-deep/40 shadow-[0_24px_60px_-40px_rgba(31,27,22,0.8)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/art/types/${code.toLowerCase()}.webp`}
              alt={`${profile?.name ?? "兴趣"}名片插画`}
              className="aspect-[9/16] w-full object-cover"
            />
            {/* 顶部纸色渐变：万一插画顶部不是纯纸面，字也压得住 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-[linear-gradient(to_bottom,var(--color-paper)_0%,rgba(250,246,239,0.88)_46%,transparent_100%)]" />
            <div className="absolute inset-x-0 top-0 px-6 pt-6">
              <p className="text-[9px] uppercase tracking-[0.3em] text-ink/50">
                兴趣说明书 · {code}
              </p>
              <h3 className="mt-1.5 font-serif text-[1.6rem] leading-tight text-ink">
                {profile?.name ?? "未命名类型"}
              </h3>
              <p className="mt-1 text-[11.5px] leading-5 text-ink/60">
                {profile?.slogan}
              </p>
              {owner ? (
                <p className="mt-2 font-serif text-[12px] text-ink/55">
                  {owner}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted">
            <span>720 × 1280 · 可直接发朋友圈</span>
            <a
              href={`/art/types/${code.toLowerCase()}.webp`}
              download={`${profile?.name ?? code}-名片.webp`}
              className="underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              保存原图
            </a>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-serif text-xl">发给朋友</h2>
        <p className="mt-2 text-[12px] leading-6 text-muted">
          这个链接就是你的说明书，换台设备也能打开。不想让人看，就别发。
        </p>
        <ShareBar text={shareText} />
        <a
          href={`/api/card?d=${encodeURIComponent(encoded)}`}
          download="兴趣说明书.png"
          className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
        >
          保存一张分享图（1080×1440）
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="relative mt-3 overflow-hidden rounded-3xl border border-accent/25 bg-accent-soft/30 p-5 sm:p-6">
        <Mascot
          pose={mascotOf(code).pose}
          prop={mascotOf(code).prop}
          className="pointer-events-none absolute -bottom-6 -right-2 h-24 w-24 opacity-90"
        />
        <h2 className="font-serif text-xl">让朋友猜猜你</h2>
        <p className="mt-2 max-w-[24rem] text-[12px] leading-6 text-muted">
          从{who}的答卷里挑几道最容易猜错的，看看你有多懂。
        </p>
        <div className="relative max-w-[24rem]">
          <ShareBar
            compact
            path={`/guess?d=${encoded}`}
            text={`猜猜${who}的 12 个选择，看看你有多懂${who}。`}
          />
        </div>
        <Link
          href={`/guess?d=${encoded}`}
          className="mt-1 inline-block text-[12px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
        >
          先自己试一遍 →
        </Link>
      </section>

      {validity.warnings.length ? (
        <section className="mt-8 rounded-3xl border border-dashed border-line bg-white/50 px-5 py-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            关于这份结果
          </h2>
          <ul className="mt-2.5 space-y-2">
            {validity.warnings.map((warning) => (
              <li
                key={warning.key}
                className="text-[12px] leading-6 text-ink/70"
              >
                <span className="text-ink/85">{warning.title}。</span>
                {warning.body}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-center text-[10px] leading-6 text-muted/70">
        这是一份兴趣偏好参考，不是心理测评。
        <br />
        答题形式参考 MBTI，与 MBTI 无任何关联或授权关系。
      </p>
    </div>
  );
}
