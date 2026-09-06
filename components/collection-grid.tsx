"use client";

import { useMemo, useState } from "react";

import { CollectionCard } from "@/components/collection-card";
import { Input } from "@/components/ui/input";
import { collections, type CollectionGuide } from "@/lib/collections";
import { moduleGuides, topicsByModule } from "@/lib/system";

export function CollectionGrid() {
  const [keyword, setKeyword] = useState("");
  const q = keyword.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return null;
    return collections.filter((item) => {
      const blob = [
        item.name,
        item.oneLiner,
        item.structure,
        item.kind,
        item.module,
        item.spineTitle,
        ...item.spine.map((step) => `${step.label} ${step.why}`),
        ...item.highlights,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [q]);

  return (
    <section className="grid gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">按模块进入</h2>
          <p className="text-sm text-muted-foreground">
            卡片上的箭头就是这个专题自己的主链。
          </p>
        </div>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="筛选：put、PECS、惰性、resize…"
          className="sm:max-w-64"
        />
      </div>
      {filtered ? (
        filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            没有匹配的条目。试试「扰动」「擦除」「collect」。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <CollectionCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : (
        moduleGuides.map((mod) => (
          <ModuleBlock key={mod.id} title={mod.name} hint={mod.learn} items={topicsByModule[mod.id]} />
        ))
      )}
    </section>
  );
}

function ModuleBlock({
  title,
  hint,
  items,
}: {
  title: string;
  hint: string;
  items: CollectionGuide[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-3">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <CollectionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
