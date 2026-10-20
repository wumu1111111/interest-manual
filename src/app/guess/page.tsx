import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { decodePayload } from "@/lib/score";
import GuessClient from "./GuessClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const payload = typeof d === "string" ? decodePayload(d) : null;
  const who = payload?.n?.trim() || "你的朋友";
  return {
    title: `猜猜${who} · 兴趣说明书`,
    description: "从 TA 的答卷里挑几道最容易猜错的陈述句，看看你到底有多懂 TA。",
  };
}

export default async function Page({ searchParams }: Props) {
  const { d } = await searchParams;
  const payload = typeof d === "string" ? decodePayload(d) : null;

  if (!payload) redirect("/");

  return <GuessClient payload={payload} encoded={d as string} />;
}
