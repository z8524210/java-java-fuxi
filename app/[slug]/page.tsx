import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeBlock } from "@/components/code-block";
import { FactPills } from "@/components/collection-card";
import { KnowledgeSpine } from "@/components/knowledge-spine";
import { QuestionList } from "@/components/question-list";
import { StructureDiagram } from "@/components/structure-diagram";
import { TopicPlace } from "@/components/topic-place";
import { Badge } from "@/components/ui/badge";
import { collections, getCollection } from "@/lib/collections";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collections.map((item) => ({ slug: item.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getCollection(slug);
  if (!item) return { title: "未找到" };
  return {
    title: item.name,
    description: item.oneLiner,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getCollection(slug);
  if (!item) notFound();

  return (
    <article className="grid gap-8">
      <header className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{item.kind}</Badge>
          <Badge variant="outline">{item.jdkInterface}</Badge>
        </div>
        <h1 className="font-mono text-3xl font-semibold tracking-tight">{item.name}</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">{item.oneLiner}</p>
      </header>

      <TopicPlace item={item} />

      <FactPills item={item} />

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">用生活例子记</h2>
        <p className="rounded-xl border bg-muted/30 px-4 py-3 text-[15px] leading-7">{item.analogy}</p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">底层长什么样</h2>
        <p className="text-sm leading-6 text-muted-foreground">{item.structure}</p>
        <StructureDiagram id={item.id} />
      </section>

      <KnowledgeSpine title={item.spineTitle} steps={item.spine} />

      {item.category === "集合" && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">时间复杂度</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            {[
              ["get / 按下标", item.time.get],
              ["增加", item.time.add],
              ["删除", item.time.remove],
              ["contains", item.time.contains],
              ["遍历", item.time.iterate],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border px-4 py-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {item.time.note && (
            <p className="text-sm leading-6 text-muted-foreground">{item.time.note}</p>
          )}
          <p className="text-sm text-muted-foreground">
            默认容量 / 负载：{item.defaultCapacity}
          </p>
        </section>
      )}

      <CodeBlock title={item.code.title} source={item.code.source} />

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">坑</h2>
        <ul className="grid gap-2">
          {item.pitfalls.map((line) => (
            <li key={line} className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border px-4 py-4">
          <h2 className="text-sm font-semibold">适合</h2>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground">
            {item.useWhen.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border px-4 py-4">
          <h2 className="text-sm font-semibold">别用在</h2>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground">
            {item.avoidWhen.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">和谁对比</h2>
        <ul className="grid gap-2">
          {item.vs.map((row) => (
            <li key={row.other} className="rounded-xl border px-4 py-3 text-sm leading-6">
              <span className="font-medium">{row.other}：</span>
              <span className="text-muted-foreground">{row.point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">面试把这条链说一遍</h2>
        <p className="rounded-xl bg-primary px-4 py-4 text-sm leading-7 text-primary-foreground">
          {item.interviewAnswer}
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">相关面试题</h2>
        <QuestionList lockTo={item.id} />
        <Link href="/questions" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          看全部题目
        </Link>
      </section>
    </article>
  );
}
