"use client";

import { useState } from "react";

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // 非 https 环境下 clipboard 不可用，走下面的兜底
  }

  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function ShareBar({
  text,
  path,
  compact = false,
}: {
  text: string;
  /** 指定要复制的路径（拼上当前域名），默认复制当前页地址 */
  path?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "link" | "copy" | "fail">("idle");

  const handleCopy = async (kind: "link" | "copy") => {
    const url = path ? window.location.origin + path : window.location.href;
    const value = kind === "link" ? url : `${text}\n${url}`;
    const ok = await copyText(value);
    setState(ok ? kind : "fail");
    window.setTimeout(() => setState("idle"), 2200);
  };

  const message =
    state === "link"
      ? "链接已复制，去发给他"
      : state === "copy"
        ? "文字和链接都复制好了"
        : state === "fail"
          ? "复制失败，长按地址栏手动复制吧"
          : "";

  return (
    <div className={compact ? "mt-4" : "mt-5"}>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => handleCopy("link")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-paper transition-colors hover:bg-accent sm:flex-none"
        >
          复制链接
          <span className="text-paper/60">→</span>
        </button>
        <button
          onClick={() => handleCopy("copy")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-[13px] text-ink transition-colors hover:border-ink/30 sm:flex-none"
        >
          复制成一段话
        </button>
      </div>
      <p className="mt-2.5 h-4 text-[11px] text-muted" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
