import type { ArtKey } from "@/lib/analysis";

type IconProps = { className?: string; strokeWidth?: number };

const PATHS: Record<ArtKey, React.ReactNode> = {
  lamp: (
    <>
      <path d="M4 19h16" />
      <path d="M12 19v-8" />
      <path d="M8.5 11h7l-1.8-5.5h-3.4z" />
    </>
  ),
  mountain: <path d="M3 19h18L13.4 6l-3.2 6.2L8 9.5z" />,
  solo: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </>
  ),
  group: (
    <>
      <circle cx="9" cy="8.5" r="2.6" />
      <path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" />
      <circle cx="17" cy="9.5" r="2" />
      <path d="M15.5 13.6c2.6.3 4.5 2.3 4.5 5" opacity="0.65" />
    </>
  ),
  brush: (
    <>
      <path d="M4 20l1-4 9.5-9.5 3 3L8 19z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12s-3.4 5.5-9.5 5.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  rays: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5h6.5v13H4z" />
      <path d="M13.5 5.5H20v13h-6.5z" />
      <path d="M12 5.5v13" />
    </>
  ),
  music: (
    <>
      <path d="M9 17.5V6l10-2v11.5" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17" cy="15.5" r="2" />
    </>
  ),
  plant: (
    <>
      <path d="M12 21v-7" />
      <path d="M12 14c-3.2 0-5.4-2.2-5.4-4.8C9.9 9 12 11 12 14z" />
      <path d="M12 14c3.2 0 5.4-2.2 5.4-4.8C14.1 9 12 11 12 14z" />
      <path d="M7.5 21h9" />
    </>
  ),
  dumbbell: <path d="M4 9.5v5M7 7.5v9M17 7.5v9M20 9.5v5M7 12h10" />,
  camera: (
    <>
      <path d="M3 8.5h4l1.5-2h7l1.5 2h4v10H3z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  mug: (
    <>
      <path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 9.5h2.4a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 5.4c0-1 .8-1.5.8-2.4M11.6 5.4c0-1 .8-1.5.8-2.4" opacity="0.55" />
    </>
  ),
  spark: <path d="M12 3l1.9 5.6L19 10.5l-5.1 1.9L12 18l-1.9-5.6L5 10.5l5.1-1.9z" />,
};

export function Doodle({
  name,
  className,
  strokeWidth = 1.4,
}: IconProps & { name: ArtKey }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

/** 手绘下划线，垫在标题重点词下面 */
export function Underline({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 9.5c34-4.6 72-6.6 110-5.4 26 .8 68 2.6 102 5.4"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

/** 页面角落的涂鸦装饰：一圈不规则的弧 */
export function SunScribble({ className }: IconProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="80" r="22" stroke="currentColor" strokeWidth="2" />
      <circle cx="80" cy="80" r="42" stroke="currentColor" strokeWidth="1.6" opacity="0.55" strokeDasharray="3 7" />
      <path
        d="M80 18v12M80 130v12M18 80h12M130 80h12M36 36l8 8M116 116l8 8M124 36l-8 8M44 116l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M110 22l3.4 8.6L122 34l-8.6 3.4L110 46l-3.4-8.6L98 34l8.6-3.4z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
