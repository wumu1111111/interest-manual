/** 小装饰：星星、心、螺旋、十字——点状撒在页面里，让版面不那么"纯色" */
import type { CSSProperties } from "react";

type Props = {
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Sparkle({ className, strokeWidth = 1.6, style }: Props) {
  return (
    <Frame className={className} style={style}>
      <path
        d="M12 3.5c.9 4.4 2.6 6.1 7 7-4.4.9-6.1 2.6-7 7-.9-4.4-2.6-6.1-7-7 4.4-.9 6.1-2.6 7-7Z"
        {...stroke}
        strokeWidth={strokeWidth}
      />
    </Frame>
  );
}

export function LittleStar({ className, strokeWidth = 1.5, style }: Props) {
  return (
    <Frame className={className} style={style}>
      <path
        d="M12 3.6l2.3 5.4 5.8.6-4.4 3.9 1.3 5.7-5-3-5 3 1.3-5.7L3.9 9.6l5.8-.6z"
        {...stroke}
        strokeWidth={strokeWidth}
      />
    </Frame>
  );
}

export function Heart({ className, strokeWidth = 1.6, style }: Props) {
  return (
    <Frame className={className} style={style}>
      <path
        d="M12 20s-7.5-4.6-7.5-9.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 3.1C19.5 15.4 12 20 12 20Z"
        {...stroke}
        strokeWidth={strokeWidth}
      />
    </Frame>
  );
}

export function Swirl({ className, strokeWidth = 1.6, style }: Props) {
  return (
    <Frame className={className} style={style}>
      <path
        d="M5 15c0-5.5 5-8.5 9-6.5 3 1.5 3 6-1 7-3 .7-4.5-2.5-2.5-4"
        {...stroke}
        strokeWidth={strokeWidth}
      />
    </Frame>
  );
}

export function CrossMark({ className, strokeWidth = 1.8, style }: Props) {
  return (
    <Frame className={className} style={style}>
      <path d="M12 4v16M4 12h16" {...stroke} strokeWidth={strokeWidth} />
    </Frame>
  );
}

export function Blob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path
        d="M64 12c22-2 40 14 44 36 4 24-10 48-34 54-23 6-46-6-52-28C16 52 24 26 44 16c7-4 13-4 20-4Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

/** 固定坐标的撒点，避免随机导致 hydration 不一致 */
const SPRINKLES = [
  { x: "5%", y: "16%", size: 14, rot: -12, kind: "sparkle", delay: 0 },
  { x: "16%", y: "66%", size: 9, rot: 20, kind: "star", delay: 700 },
  { x: "30%", y: "8%", size: 10, rot: 8, kind: "heart", delay: 1400 },
  { x: "77%", y: "12%", size: 12, rot: -18, kind: "sparkle", delay: 350 },
  { x: "90%", y: "46%", size: 9, rot: 14, kind: "star", delay: 1100 },
  { x: "63%", y: "84%", size: 11, rot: -8, kind: "swirl", delay: 1900 },
  { x: "9%", y: "88%", size: 8, rot: 24, kind: "star", delay: 900 },
  { x: "93%", y: "82%", size: 12, rot: -6, kind: "heart", delay: 1600 },
];

export function Sprinkles({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {SPRINKLES.map((item, index) => {
        const style = {
          left: item.x,
          top: item.y,
          width: item.size,
          height: item.size,
          "--rot": `${item.rot}deg`,
          animationDelay: `${item.delay}ms`,
        } as CSSProperties;
        const cls = "twinkle absolute text-accent/35";

        if (item.kind === "sparkle")
          return <Sparkle key={index} className={cls} style={style} />;
        if (item.kind === "star")
          return <LittleStar key={index} className={cls} style={style} />;
        if (item.kind === "heart")
          return <Heart key={index} className={cls} style={style} />;
        return <Swirl key={index} className={cls} style={style} />;
      })}
    </div>
  );
}
