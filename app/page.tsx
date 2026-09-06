import Link from "next/link";

import { CollectionGrid } from "@/components/collection-grid";
import { SpineStrip } from "@/components/knowledge-spine";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCollection } from "@/lib/collections";
import { learnPath, moduleGuides } from "@/lib/system";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="grid gap-10">
      <section className="grid gap-4">
        <Badge variant="secondary" className="w-fit">
          以 JDK 8 及以后为准，JDK 7 差异会单独标出
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          集合和 Java 8，先看成一张图
        </h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          集合是容器，泛型是容器上的标签，Stream 是从容器里取数据的流水线。
          每个专题内部还有自己的主链——比如 HashMap 就是一次 put 走到底。
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/compare" className={cn(buttonVariants())}>
            打开对照表
          </Link>
          <Link href="/questions" className={cn(buttonVariants({ variant: "outline" }))}>
            刷面试题
          </Link>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">三条主线</h2>
        <div className="grid gap-3">
          {moduleGuides.map((mod) => (
            <div key={mod.id} className="grid gap-3 rounded-xl border px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{mod.name}</h3>
                <span className="text-xs text-muted-foreground">{mod.spineTitle}</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{mod.role}</p>
              <SpineStrip labels={mod.spine} />
              <p className="text-sm leading-6 text-muted-foreground">{mod.learn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-muted/30 px-4 py-4">
        <h2 className="text-sm font-semibold">建议学习顺序</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          按理解依赖排，不是按面试出镜率。突击可以先跳到 HashMap / ArrayList。
        </p>
        <ol className="mt-3 grid gap-1.5 text-sm leading-6 sm:grid-cols-2">
          {learnPath.map((step, index) => {
            const topic = getCollection(step.id);
            return (
              <li key={step.id} className="flex gap-2">
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <Link href={`/${step.id}`} className="underline-offset-4 hover:underline">
                  {topic?.name}
                </Link>
                <span className="text-muted-foreground">· {step.reason}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <CollectionGrid />
    </div>
  );
}
