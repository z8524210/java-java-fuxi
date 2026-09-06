import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CollectionGuide } from "@/lib/collections";

export function CollectionCard({ item }: { item: CollectionGuide }) {
  return (
    <Link href={`/${item.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-mono text-base">{item.name}</CardTitle>
            <Badge variant="secondary">{item.kind}</Badge>
          </div>
          <CardDescription className="text-xs">{item.jdkInterface}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-[13px] leading-6 text-muted-foreground">
          <p>{item.oneLiner}</p>
          <div className="text-foreground">
            <div className="mb-1.5 text-[11px] text-muted-foreground">{item.spineTitle}</div>
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
              {item.spine.map((step, index) => (
                <li key={step.label} className="flex items-center gap-1">
                  {index > 0 && <span className="text-muted-foreground">→</span>}
                  <span className="font-mono text-[11px]">{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FactPills({ item }: { item: CollectionGuide }) {
  const facts = item.facts
    ? item.facts.map((fact) => [fact.label, fact.value] as const)
    : ([
        ["顺序", item.ordered],
        ["线程安全", item.threadSafe],
        ["null", item.nullKey],
        ["查找", item.time.get],
      ] as const);
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {facts.map(([label, value]) => (
        <div key={label} className="rounded-xl border bg-card px-3 py-2">
          <dt className="text-[11px] text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 text-sm leading-5 font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
