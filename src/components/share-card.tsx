import { AXES, tagLabels } from "@/lib/quiz-data";
import { AXIS_ORDER, rightPercent, typeCodeOf } from "@/lib/score";
import { TYPE_BY_CODE } from "@/lib/type-profiles";
import type { ProfilePayload } from "@/lib/types";

const INK = "#1F1B16";
const PAPER = "#FAF6EF";
const LINE = "#E5DBCB";
const ACCENT = "#BD4327";
const FOREST = "#2E5A4E";
const MUTED = "#796D60";

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
    <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 21,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: leftPct >= rightPct ? INK : MUTED }}>
            {left}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 18,
              color: leftPct >= rightPct ? INK : MUTED,
            }}
          >
            {leftPct}%
          </span>
        </div>
        <span style={{ fontSize: 13, letterSpacing: 4, color: "#A99C8C" }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              marginRight: 8,
              fontSize: 18,
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
          marginTop: 8,
          height: 8,
          borderRadius: 4,
          background: "#EDE3D4",
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${leftPct}%`, height: 8, background: FOREST }} />
        <div
          style={{
            width: `${rightPct}%`,
            height: 8,
            background: ACCENT,
            opacity: 0.45,
          }}
        />
      </div>
    </div>
  );
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 16, letterSpacing: 3, color: MUTED }}>
      {children}
    </span>
  );
}

/** 1080×1440 的分享海报：左边信息，右边该类型的竖版插画 */
export default function ShareCard({
  payload,
  seq,
  qrSrc,
  artSrc,
}: {
  payload: ProfilePayload;
  seq: string;
  qrSrc: string;
  artSrc: string;
}) {
  const code = typeCodeOf(payload.a);
  const profile = TYPE_BY_CODE[code];
  const played = tagLabels(payload.p).slice(0, 3);
  const avoid = tagLabels(payload.x).slice(0, 2);
  const how = profile?.how ?? [];
  const ideas = profile?.ideas ?? [];

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
        padding: "58px 68px 30px 68px",
      }}
    >
      {/* 顶部 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 20,
          letterSpacing: 6,
          color: MUTED,
        }}
      >
        <span>兴趣说明书</span>
        <span>NO. {seq}</span>
      </div>

      <div style={{ display: "flex", height: 1, background: LINE, marginTop: 18 }} />

      <div style={{ display: "flex", flexGrow: 1, marginTop: 26 }}>
        {/* 左：文字信息 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 392,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex" }}>
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  fontFamily: "CardBold",
                  lineHeight: 1.14,
                }}
              >
                {profile?.name ?? "兴趣人格"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 19,
                  letterSpacing: 5,
                  padding: "5px 12px",
                  background: "#EFE5D5",
                  borderRadius: 7,
                  color: "#5C5248",
                }}
              >
                {code}
              </span>
              <span style={{ marginLeft: 12, fontSize: 21, color: MUTED }}>
                {profile?.slogan}
              </span>
            </div>
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 17, color: MUTED, width: 88 }}>能约我</span>
              <span style={{ fontSize: 21 }}>
                {played.length ? played.join(" · ") : "还没填"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 17, color: MUTED, width: 88 }}>别约我</span>
              <span style={{ fontSize: 21, color: "#8A3A2A" }}>
                {avoid.length ? avoid.join(" · ") : "暂时没有"}
              </span>
            </div>
          </div>

          {/* 一句话建议 */}
          <div
            style={{
              display: "flex",
              padding: "15px 18px",
              borderLeft: `4px solid ${ACCENT}`,
              background: "#FFFFFF",
              borderRadius: 10,
            }}
          >
            <span style={{ fontSize: 21, lineHeight: 1.5, color: "#3A332C" }}>
              {how[0] ?? "先约一次，再决定要不要深交"}
            </span>
          </div>

          {/* 怎么约我 */}
          {how.length > 1 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <BlockLabel>怎么约我</BlockLabel>
              {how.slice(1, 3).map((line, index) => (
                <div
                  key={line}
                  style={{ display: "flex", marginTop: 8, alignItems: "baseline" }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      color: ACCENT,
                      width: 26,
                      fontFamily: "Noto Sans SC",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 19, lineHeight: 1.45 }}>{line}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* 可以一起做 */}
          {ideas.length ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <BlockLabel>可以一起做</BlockLabel>
              <span style={{ fontSize: 19, marginTop: 12, lineHeight: 1.45 }}>
                {ideas.slice(0, 2).join(" · ")}
              </span>
            </div>
          ) : null}
        </div>

        {/* 右：竖版插画 + 一句话 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 520,
            marginLeft: 32,
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artSrc}
            width={520}
            height={924}
            alt=""
            style={{ borderRadius: 22, border: `1px solid ${LINE}` }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 16,
              padding: "13px 16px",
              background: "#FFFFFF",
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              fontSize: 20,
              lineHeight: 1.45,
              color: "#5C5248",
            }}
          >
            转给朋友，让他们照着这个约我
          </div>
        </div>
      </div>

      {/* 页脚：二维码 + 说明 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderTop: `1px solid ${LINE}`,
          paddingTop: 20,
          marginTop: 20,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} width={88} height={88} alt="" />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 18 }}>
          <span style={{ fontSize: 20, color: INK }}>扫码看完整版</span>
          <span style={{ fontSize: 16, color: MUTED, marginTop: 6 }}>
            20 / 40 / 56 题 · 还能让朋友猜猜你
          </span>
        </div>
        <div style={{ display: "flex", flexGrow: 1 }} />
        <span style={{ fontSize: 14, letterSpacing: 4, color: "#A99C8C" }}>
          INTEREST MANUAL
        </span>
      </div>
    </div>
  );
}
