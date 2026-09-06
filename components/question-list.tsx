"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CollectionId } from "@/lib/collections";
import { collections } from "@/lib/collections";
import { questions, type Question } from "@/lib/questions";
import { moduleGuides, topicsByModule } from "@/lib/system";

function QuestionItem({ item }: { item: Question }) {
  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger className="px-1">
        <span className="flex flex-col items-start gap-1 pr-4">
          <span className="text-left text-sm font-medium">{item.title}</span>
          <span className="flex flex-wrap gap-1">
            <Badge variant="outline">{item.level}</Badge>
            {item.collections.map((id) => (
              <Badge key={id} variant="secondary">
                {collections.find((c) => c.id === id)?.name}
              </Badge>
            ))}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-1">
        <p className="leading-7 text-muted-foreground">{item.answer}</p>
        <ul className="mt-3 grid gap-1.5 text-sm">
          {item.points.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

export function QuestionList({
  lockTo,
}: {
  lockTo?: CollectionId;
}) {
  const [keyword, setKeyword] = useState("");
  const [active, setActive] = useState<CollectionId | "all">(lockTo ?? "all");

  const filtered = useMemo(() => {
    return questions.filter((item) => {
      const matchCollection =
        active === "all" || item.collections.includes(active);
      const q = keyword.trim().toLowerCase();
      const matchText =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchCollection && matchText;
    });
  }, [active, keyword]);

  return (
    <div className="grid gap-4">
      {!lockTo && (
        <div className="flex flex-col gap-3">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索题目，例如：扩容、PECS、Optional"
          />
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={active === "all" ? "default" : "outline"}
              onClick={() => setActive("all")}
            >
              全部
            </Button>
            {moduleGuides.flatMap((mod) =>
              topicsByModule[mod.id].map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={active === item.id ? "default" : "outline"}
                  onClick={() => setActive(item.id)}
                >
                  {item.name}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          没有匹配的题目。换个关键词，或看看
          <Link href="/questions" className="mx-1 underline">
            全部面试题
          </Link>
          。
        </p>
      ) : (
        <Accordion multiple className="rounded-xl border px-3">
          {filtered.map((item) => (
            <QuestionItem key={item.id} item={item} />
          ))}
        </Accordion>
      )}
    </div>
  );
}
