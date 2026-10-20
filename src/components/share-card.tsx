import { AXES, tagLabels } from "@/lib/quiz-data";
import { AXIS_ORDER, rightPercent, typeCodeOf } from "@/lib/score";
import { TYPE_BY_CODE } from "@/lib/type-profiles";
import { mascotOf } from "@/components/mascot";
import type { ProfilePayload } from "@/lib/types";

const INK = "#1F1B16";
const PAPER = "#FAF6EF";
const LINE = "#E5DBCB";
const ACCENT = "#BD4327";
const FOREST = "#2E5A4E";
const MUTED = "#796D60";

type Pose = "sit" | "wave" | "sleep" | "cheer" | "peek" | "think";
type Prop =
  | "mug"
  | "hat"
  | "glasses"
  | "pencil"
  | "headphones"
  | "leaf"
  | "scarf"
  | "flower";

/** satori 里用不了内联 SVG，所以纸团也用 div 画 */
function CardMascot({
  pose,
  prop,
  size = 188,
}: {
  pose: Pose;
  prop?: Prop;
  size?: number;
}) {
  const stroke = Math.max(3, size * 0.024);
  const eye = size * 0.07;
  const sleeping = pose === "sleep";

  const blob = (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: size * 0.06,
        width: size,
        height: size * 0.94,
        borderRadius: "50%",
        background: "#FFFDF7",
        border: `${stroke}px solid ${INK}`,
      }}
    />
  );

  return (
    <div
      style={{ display: "flex", position: "relative", width: size, height: size }}
    >
      {blob}

      {/* 头顶纸角 */}
      <div
        style={{
          position: "absolute",
          right: size * 0.2,
          top: 0,
          width: size * 0.16,
          height: size * 0.1,
          background: "#FFFDF7",
          borderTop: `${stroke}px solid ${INK}`,
          borderRight: `${stroke}px solid ${INK}`,
          borderRadius: `0 ${size * 0.08}px 0 0`,
          transform: "rotate(-18deg)",
        }}
      />

      {/* 眼睛 */}
      {sleeping ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.29,
              top: size * 0.46,
              width: size * 0.13,
              height: stroke,
              borderRadius: stroke,
              background: INK,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.57,
              top: size * 0.46,
              width: size * 0.13,
              height: stroke,
              borderRadius: stroke,
              background: INK,
            }}
          />
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.33,
              top: size * 0.45,
              width: eye,
              height: eye,
              borderRadius: "50%",
              background: INK,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.6,
              top: size * 0.45,
              width: eye,
              height: eye,
              borderRadius: "50%",
              background: INK,
            }}
          />
        </>
      )}

      {/* 腮红 */}
      <div
        style={{
          position: "absolute",
          left: size * 0.2,
          top: size * 0.56,
          width: size * 0.15,
          height: size * 0.09,
          borderRadius: "50%",
          background: ACCENT,
          opacity: 0.28,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: size * 0.2,
          top: size * 0.56,
          width: size * 0.15,
          height: size * 0.09,
          borderRadius: "50%",
          background: ACCENT,
          opacity: 0.28,
        }}
      />

      {/* 嘴 */}
      <div
        style={{
          position: "absolute",
          left: size * 0.5 - size * 0.08,
          top: size * 0.56,
          width: size * 0.16,
          height: size * 0.1,
          borderBottom: `${stroke}px solid ${INK}`,
          borderRadius: `0 0 ${size * 0.16}px ${size * 0.16}px`,
        }}
      />

      {/* 道具 */}
      {prop === "hat" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.24,
              top: size * 0.14,
              width: size * 0.52,
              height: size * 0.1,
              background: FOREST,
              borderRadius: `${size * 0.26}px ${size * 0.26}px 0 0`,
              border: `${stroke}px solid ${INK}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.16,
              top: size * 0.23,
              width: size * 0.68,
              height: size * 0.06,
              background: FOREST,
              borderRadius: size * 0.04,
              border: `${stroke}px solid ${INK}`,
            }}
          />
        </>
      ) : null}

      {prop === "glasses" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.24,
              top: size * 0.38,
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: "50%",
              border: `${stroke}px solid ${INK}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: size * 0.24,
              top: size * 0.38,
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: "50%",
              border: `${stroke}px solid ${INK}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.45,
              top: size * 0.48,
              width: size * 0.1,
              height: stroke,
              background: INK,
            }}
          />
        </>
      ) : null}

      {prop === "headphones" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.2,
              top: size * 0.05,
              width: size * 0.6,
              height: size * 0.34,
              border: `${stroke}px solid ${INK}`,
              borderBottom: "none",
              borderRadius: `${size * 0.34}px ${size * 0.34}px 0 0`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.13,
              top: size * 0.3,
              width: size * 0.14,
              height: size * 0.22,
              borderRadius: size * 0.07,
              background: "#FFFDF7",
              border: `${stroke}px solid ${INK}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: size * 0.13,
              top: size * 0.3,
              width: size * 0.14,
              height: size * 0.22,
              borderRadius: size * 0.07,
              background: "#FFFDF7",
              border: `${stroke}px solid ${INK}`,
            }}
          />
        </>
      ) : null}

      {prop === "pencil" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.78,
              top: size * 0.2,
              width: stroke * 1.5,
              height: size * 0.22,
              background: "#E8C36A",
              borderRadius: stroke * 0.6,
              transform: "rotate(22deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.78,
              top: size * 0.15,
              width: stroke * 1.5,
              height: size * 0.05,
              background: INK,
              borderRadius: stroke * 0.6,
              transform: "rotate(22deg)",
            }}
          />
        </>
      ) : null}

      {prop === "leaf" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.46,
              top: size * 0.0,
              width: size * 0.16,
              height: size * 0.1,
              background: FOREST,
              borderRadius: `${size * 0.1}px 0 ${size * 0.1}px 0`,
              transform: "rotate(-24deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.56,
              top: size * 0.02,
              width: size * 0.13,
              height: size * 0.08,
              background: FOREST,
              opacity: 0.7,
              borderRadius: `0 ${size * 0.08}px 0 ${size * 0.08}px`,
              transform: "rotate(18deg)",
            }}
          />
        </>
      ) : null}

      {prop === "flower" ? (
        <>
          <div
            style={{
              position: "absolute",
              right: size * 0.06,
              top: size * 0.08,
              width: size * 0.11,
              height: size * 0.11,
              borderRadius: "50%",
              background: ACCENT,
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: size * 0.16,
              top: size * 0.16,
              width: size * 0.08,
              height: size * 0.08,
              borderRadius: "50%",
              background: ACCENT,
              opacity: 0.6,
            }}
          />
        </>
      ) : null}

      {prop === "scarf" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.24,
              top: size * 0.78,
              width: size * 0.52,
              height: size * 0.1,
              background: ACCENT,
              opacity: 0.85,
              borderRadius: size * 0.05,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.66,
              top: size * 0.84,
              width: stroke * 2.4,
              height: size * 0.14,
              background: ACCENT,
              opacity: 0.7,
              borderRadius: stroke,
            }}
          />
        </>
      ) : null}

      {prop === "mug" ? (
        <>
          <div
            style={{
              position: "absolute",
              left: size * 0.06,
              top: size * 0.74,
              width: size * 0.24,
              height: size * 0.2,
              background: "#FFFDF7",
              border: `${stroke}px solid ${INK}`,
              borderRadius: `0 0 ${size * 0.05}px ${size * 0.05}px`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: size * 0.27,
              top: size * 0.79,
              width: size * 0.08,
              height: size * 0.1,
              border: `${stroke}px solid ${INK}`,
              borderLeft: "none",
              borderRadius: `0 ${size * 0.05}px ${size * 0.05}px 0`,
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function AxisRow({
  label,
  left,
  right,
  value,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
}) {
  const rightPct = rightPercent(value);
  const leftPct = 100 - rightPct;

  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 22,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: leftPct >= rightPct ? INK : MUTED }}>
            {left}
          </span>
          <span
            style={{
              marginLeft: 10,
              fontSize: 20,
              color: leftPct >= rightPct ? INK : MUTED,
            }}
          >
            {leftPct}%
          </span>
        </div>
        <span style={{ fontSize: 15, letterSpacing: 4, color: "#A99C8C" }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              marginRight: 10,
              fontSize: 20,
              color: rightPct > leftPct ? INK : MUTED,
            }}
          >
            {rightPct}%
          </span>
          <span style={{ color: rightPct > leftPct ? INK : MUTED }}>
            {right}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 9,
          height: 9,
          borderRadius: 5,
          background: "#EDE3D4",
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${leftPct}%`, height: 9, background: FOREST }} />
        <div
          style={{
            width: `${rightPct}%`,
            height: 9,
            background: ACCENT,
            opacity: 0.45,
          }}
        />
      </div>
    </div>
  );
}

/** 1080×1440 的分享海报 */
export default function ShareCard({
  payload,
  seq,
  qrSrc,
  stripSrc,
  stripWidth,
  stripHeight,
}: {
  payload: ProfilePayload;
  seq: string;
  qrSrc: string;
  stripSrc: string;
  stripWidth: number;
  stripHeight: number;
}) {
  const code = typeCodeOf(payload.a);
  const profile = TYPE_BY_CODE[code];
  const mascot = mascotOf(code);
  const played = tagLabels(payload.p).slice(0, 3);
  const avoid = tagLabels(payload.x).slice(0, 2);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        fontFamily: "Noto Sans SC",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "68px 72px 0 72px",
          flexGrow: 1,
        }}
      >
        {/* 顶部 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 21,
            letterSpacing: 6,
            color: MUTED,
          }}
        >
          <span>兴趣说明书</span>
          <span>NO. {seq}</span>
        </div>

        <div
          style={{ display: "flex", height: 1, background: LINE, marginTop: 22 }}
        />

        {/* 类型 */}
        <div style={{ display: "flex", marginTop: 40 }}>
          <span
            style={{
              fontSize: 92,
              fontWeight: 700,
              fontFamily: "CardBold",
              lineHeight: 1.08,
            }}
          >
            {profile?.name ?? "兴趣人格"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
          <span
            style={{
              fontSize: 21,
              letterSpacing: 6,
              padding: "7px 15px",
              background: "#EFE5D5",
              borderRadius: 8,
              color: "#5C5248",
            }}
          >
            {code}
          </span>
          <span style={{ marginLeft: 18, fontSize: 25, color: MUTED }}>
            {profile?.slogan}
          </span>
        </div>

        {/* 四轴 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {AXIS_ORDER.map((axis, index) => (
            <AxisRow
              key={axis}
              label={AXES[axis].label}
              left={AXES[axis].left.label}
              right={AXES[axis].right.label}
              value={payload.a[index] ?? 0}
            />
          ))}
        </div>

        {/* 标签 */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 19, color: MUTED, width: 104 }}>能约我</span>
            <span style={{ fontSize: 25 }}>
              {played.length ? played.join(" · ") : "还没填"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 19, color: MUTED, width: 104 }}>别约我</span>
            <span style={{ fontSize: 25, color: "#8A3A2A" }}>
              {avoid.length ? avoid.join(" · ") : "暂时没有"}
            </span>
          </div>
        </div>

        {/* 一句话建议 */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            padding: "20px 26px",
            borderLeft: `4px solid ${ACCENT}`,
            background: "#FFFFFF",
            borderRadius: 12,
          }}
        >
          <span style={{ fontSize: 24, lineHeight: 1.5, color: "#3A332C" }}>
            {profile?.how?.[0] ?? "先约一次，再决定要不要深交"}
          </span>
        </div>

        {/* 纸团 + 气泡 */}
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardMascot
            pose={mascot.pose as Pose}
            prop={mascot.prop as Prop}
            size={188}
          />
          <div
            style={{
              display: "flex",
              marginLeft: 28,
              padding: "20px 26px",
              background: "#FFFFFF",
              border: `1px solid ${LINE}`,
              borderRadius: 20,
              fontSize: 23,
              lineHeight: 1.5,
              color: "#5C5248",
              maxWidth: 400,
            }}
          >
            转给朋友，让他们照着这个约我
          </div>
        </div>

        {/* 页脚：二维码 + 说明 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingBottom: 34,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} width={96} height={96} alt="" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 20,
            }}
          >
            <span style={{ fontSize: 21, color: INK }}>扫码看完整版</span>
            <span style={{ fontSize: 17, color: MUTED, marginTop: 6 }}>
              40 道题 · 8 分钟 · 还能让朋友猜猜你
            </span>
          </div>
        </div>
      </div>

      {/* 底部静物条：顶上加一层纸色渐变，把接缝化开 */}
      <div style={{ display: "flex", position: "relative", background: PAPER }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={stripSrc} width={stripWidth} height={stripHeight} alt="" />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: 96,
            backgroundImage:
              "linear-gradient(to bottom, #FAF6EF 0%, rgba(250,246,239,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}
