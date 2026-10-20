import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { decodePayload, typeCodeOf } from "@/lib/score";
import { TYPE_BY_CODE } from "@/lib/type-profiles";
import ResultView from "./ResultView";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const payload = typeof d === "string" ? decodePayload(d) : null;
  if (!payload) return { title: "兴趣说明书" };

  const profile = TYPE_BY_CODE[typeCodeOf(payload.a)];
  const owner = payload.n ? `${payload.n}的` : "";
  const description = profile
    ? `${profile.name}：${profile.slogan}。怎么约、送什么、别碰什么，都在这一页。`
    : "40 道题，出一份能让朋友照着做的兴趣说明书。";

  // 链接预览直接用这张人人的专属卡片
  const card = `/api/card?d=${encodeURIComponent(d as string)}`;

  return {
    title: `${owner}兴趣说明书 · ${profile?.name ?? "未命名类型"}`,
    description,
    openGraph: {
      title: `${owner}兴趣说明书 · ${profile?.name ?? ""}`,
      description,
      images: [{ url: card, width: 1080, height: 1440 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [card],
    },
  };
}

export default async function Page({ searchParams }: Props) {
  const { d } = await searchParams;
  const payload = typeof d === "string" ? decodePayload(d) : null;

  if (!payload || typeof d !== "string") redirect("/");

  return <ResultView payload={payload} encoded={d} />;
}
