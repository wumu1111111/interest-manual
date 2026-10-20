import Link from "next/link";
import Mascot from "@/components/mascot";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Mascot pose="sleep" className="h-32 w-32" />
      <h1 className="mt-6 font-serif text-2xl">这页还没做出来</h1>
      <p className="mt-2 max-w-xs text-[13px] leading-6 text-muted">
        可能是链接复制错了，也可能是我做到一半睡着了。
      </p>
      <Link
        href="/"
        className="btn-primary mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-paper hover:bg-accent"
      >
        回首页
        <span className="text-paper/60">→</span>
      </Link>
    </main>
  );
}
