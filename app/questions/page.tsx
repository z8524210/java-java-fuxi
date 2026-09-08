import type { Metadata } from "next";

import { QuestionList } from "@/components/question-list";

export const metadata: Metadata = {
  title: "面试题",
  description: "Java 集合、Java 8 与 JVM 高频面试题，按主题筛选，展开看参考答法。",
};

export default function QuestionsPage() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">面试题</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          集合沿主链答：HashMap 就按 put → hash → 定位 → 冲突 → 树化 → resize。
          JVM 也一样：分代名词先拆开，收集器要报版本，线上先说用哪条命令。
        </p>
      </header>
      <QuestionList />
    </div>
  );
}
