import type { Metadata } from "next";
import QuizClient from "./QuizClient";

export const metadata: Metadata = {
  title: "答题 · 兴趣说明书",
};

export default function QuizPage() {
  return <QuizClient />;
}
