import type { ArtKey } from "@/lib/types";

export type MascotPose =
  | "sit"
  | "wave"
  | "sleep"
  | "cheer"
  | "peek"
  | "think";

/** 纸团身上挂的小道具，按类型发 */
export type MascotProp =
  | "mug"
  | "hat"
  | "glasses"
  | "pencil"
  | "headphones"
  | "leaf"
  | "scarf"
  | "flower";

const INK = "#1F1B16";
const BODY = "#FFFDF7";
const BLUSH = "#BD4327";

/** 身体轮廓：一颗不太圆的纸团 */
const BODY_PATH =
  "M62 15C86 13 104 32 103 58C102 86 82 105 58 104C33 103 15 82 16 57C17 33 37 15 62 15Z";

/** 探头的身体：底边是平的，好藏在边缘后面 */
const PEEK_PATH =
  "M62 15C86 13 104 32 103 58C102 80 84 96 60 96C36 96 17 80 16 57C17 33 37 15 62 15Z";

function Eyes({ pose }: { pose: MascotPose }) {
  const sleeping = pose === "sleep";
  const happy = pose === "cheer";

  if (sleeping) {
    return (
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M40 58q6 5 12 0" />
        <path d="M69 58q6 5 12 0" />
      </g>
    );
  }

  if (happy) {
    return (
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M40 60q6-7 12 0" />
        <path d="M69 60q6-7 12 0" />
      </g>
    );
  }

  return (
    <g>
      <circle
        cx="46"
        cy="58"
        r="5.4"
        fill={INK}
        className="mascot-eye"
      />
      <circle
        cx="75"
        cy="58"
        r="5.4"
        fill={INK}
        className="mascot-eye"
      />
      <circle cx="47.8" cy="56" r="1.7" fill="#FFFDF7" />
      <circle cx="76.8" cy="56" r="1.7" fill="#FFFDF7" />
    </g>
  );
}

function Mouth({ pose }: { pose: MascotPose }) {
  if (pose === "sleep") {
    return (
      <path
        d="M56 70q4 4 8 0"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (pose === "cheer") {
    return (
      <path
        d="M53 69q7 12 15 0z"
        fill={INK}
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    );
  }
  if (pose === "think") {
    return (
      <path
        d="M55 71h10"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    );
  }
  return (
    <path
      d="M54 69q6 8 12 0"
      stroke={INK}
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Arms({ pose }: { pose: MascotPose }) {
  const stroke = { stroke: INK, strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };

  if (pose === "peek" || pose === "sleep") return null;

  if (pose === "wave") {
    return (
      <g {...stroke}>
        <path d="M30 82q-6 8-4 14" />
        <path d="M92 72q12-10 8-24" />
      </g>
    );
  }

  if (pose === "cheer") {
    return (
      <g {...stroke}>
        <path d="M28 76q-10-8-8-20" />
        <path d="M94 76q10-8 8-20" />
      </g>
    );
  }

  if (pose === "think") {
    return (
      <g {...stroke}>
        <path d="M30 84q-6 8-4 14" />
        <path d="M92 86q-8 2-14-4" />
      </g>
    );
  }

  return (
    <g {...stroke}>
      <path d="M30 84q-6 7-5 13" />
      <path d="M92 84q6 7 5 13" />
    </g>
  );
}

/** 道具：都画在 120×120 的坐标系里，跟着身体走 */
function Prop({ name }: { name: MascotProp }) {
  const line = {
    fill: "none",
    stroke: INK,
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "hat":
      return (
        <g {...line}>
          <path d="M30 30q30-24 60 0" fill={BODY} />
          <path d="M24 30h72" />
          <path d="M40 30q0-14 20-14t20 14" fill={BODY} />
        </g>
      );
    case "glasses":
      return (
        <g {...line} strokeWidth="2.4">
          <circle cx="46" cy="58" r="11" fill={BODY} fillOpacity="0.6" />
          <circle cx="75" cy="58" r="11" fill={BODY} fillOpacity="0.6" />
          <path d="M57 58h7" />
          <path d="M35 55l-6-2M86 55l6-2" />
        </g>
      );
    case "headphones":
      return (
        <g {...line}>
          <path d="M26 54q0-34 34-34t34 34" />
          <rect x="18" y="50" width="14" height="22" rx="7" fill={BODY} />
          <rect x="88" y="50" width="14" height="22" rx="7" fill={BODY} />
        </g>
      );
    case "pencil":
      return (
        <g {...line}>
          <path d="M86 46l10-16" strokeWidth="5" opacity="0.9" />
          <path d="M94 33l5-8 3 2-3 9" fill={BODY} />
        </g>
      );
    case "leaf":
      return (
        <g {...line}>
          <path d="M60 16v-6" />
          <path d="M60 12c-7-1-10-5-9-9 6 0 9 4 9 9z" fill="#2E5A4E" fillOpacity="0.85" />
          <path d="M60 12c7-1 10-5 9-9-6 0-9 4-9 9z" fill="#2E5A4E" fillOpacity="0.6" />
        </g>
      );
    case "flower":
      return (
        <g {...line}>
          <circle cx="86" cy="24" r="4" fill="#BD4327" fillOpacity="0.85" />
          <circle cx="94" cy="30" r="4" fill="#BD4327" fillOpacity="0.65" />
          <circle cx="82" cy="34" r="4" fill="#BD4327" fillOpacity="0.5" />
          <circle cx="88" cy="28" r="2.4" fill={BODY} />
        </g>
      );
    case "scarf":
      return (
        <g {...line}>
          <path d="M34 92q26 12 52 0" strokeWidth="7" opacity="0.9" stroke="#BD4327" />
          <path d="M80 96l4 12-7-2-1-9" fill="#BD4327" fillOpacity="0.8" />
        </g>
      );
    case "mug":
      return (
        <g {...line}>
          <path d="M24 96h22v10a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" fill={BODY} />
          <path d="M46 100h4a5 5 0 0 1 0 10h-4" />
          <path d="M30 88q2-5 0-8M38 88q2-5 0-8" opacity="0.5" />
        </g>
      );
    default:
      return null;
  }
}

/** 纸团小人。纯 SVG + CSS 动画，不改语义，可用 aria-hidden 藏起来 */
export default function Mascot({
  pose = "sit",
  prop,
  className = "",
  animated = true,
}: {
  pose?: MascotPose;
  prop?: MascotProp;
  className?: string;
  animated?: boolean;
}) {
  const peeking = pose === "peek";

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${animated ? "mascot" : ""} ${className}`}
      aria-hidden="true"
      fill="none"
    >
      {!peeking ? (
        <ellipse cx="60" cy="106" rx="29" ry="5" fill={INK} opacity="0.09" />
      ) : null}

      {/* 头顶那撮纸角 */}
      <path
        d="M74 16q8-10 15-3-5 1-8 7"
        fill={BODY}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      <path
        d={peeking ? PEEK_PATH : BODY_PATH}
        fill={BODY}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      <ellipse cx="33" cy="72" rx="9" ry="5.5" fill={BLUSH} opacity="0.28" />
      <ellipse cx="88" cy="72" rx="9" ry="5.5" fill={BLUSH} opacity="0.28" />

      <Eyes pose={pose} />
      <Mouth pose={pose} />
      <Arms pose={pose} />

      {prop && !peeking ? <Prop name={prop} /> : null}

      {pose === "sleep" ? (
        <g fill={INK} opacity="0.45" className="mascot-zzz">
          <text x="92" y="38" fontSize="13" fontFamily="monospace">
            z
          </text>
          <text x="102" y="26" fontSize="9" fontFamily="monospace">
            z
          </text>
        </g>
      ) : null}
    </svg>
  );
}

/** 只有脑袋的版本，用来骑在进度条上 */
export function MascotHead({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <path
        d="M20 3c9.4 0 16 6.6 16 16.6C36 29 29 37 20 37S4 29 4 19.6C4 9.6 10.6 3 20 3Z"
        fill={BODY}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M25 4q3-4 6-1-2 1-3 3"
        fill={BODY}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="19" r="2.4" fill={INK} className="mascot-eye" />
      <circle cx="26" cy="19" r="2.4" fill={INK} className="mascot-eye" />
      <ellipse cx="9.5" cy="24" rx="3" ry="1.8" fill={BLUSH} opacity="0.3" />
      <ellipse cx="30.5" cy="24" rx="3" ry="1.8" fill={BLUSH} opacity="0.3" />
      <path
        d="M17 24.5q3 3.5 6 0"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 16 型的小图标，卡片上用 */
export const TYPE_ART: Record<string, ArtKey> = {
  ISMD: "lamp",
  ISMW: "spark",
  ISTD: "book",
  ISTW: "mug",
  IGMD: "plant",
  IGMW: "brush",
  IGTD: "target",
  IGTW: "music",
  OSMD: "mountain",
  OSMW: "rays",
  OSTD: "solo",
  OSTW: "eye",
  OGMD: "sun",
  OGMW: "group",
  OGTD: "dumbbell",
  OGTW: "camera",
};

/** 16 型各自的姿态与道具 */
export const TYPE_MASCOT: Record<
  string,
  { pose: MascotPose; prop: MascotProp }
> = {
  ISMD: { pose: "sit", prop: "pencil" },
  ISMW: { pose: "cheer", prop: "leaf" },
  ISTD: { pose: "think", prop: "glasses" },
  ISTW: { pose: "sleep", prop: "mug" },
  IGMD: { pose: "sit", prop: "hat" },
  IGMW: { pose: "wave", prop: "flower" },
  IGTD: { pose: "sit", prop: "headphones" },
  IGTW: { pose: "cheer", prop: "headphones" },
  OSMD: { pose: "think", prop: "scarf" },
  OSMW: { pose: "wave", prop: "leaf" },
  OSTD: { pose: "sit", prop: "scarf" },
  OSTW: { pose: "wave", prop: "pencil" },
  OGMD: { pose: "sit", prop: "hat" },
  OGMW: { pose: "cheer", prop: "flower" },
  OGTD: { pose: "cheer", prop: "scarf" },
  OGTW: { pose: "wave", prop: "glasses" },
};

export function mascotOf(code: string): {
  pose: MascotPose;
  prop: MascotProp;
} {
  return TYPE_MASCOT[code] ?? { pose: "sit", prop: "leaf" };
}
