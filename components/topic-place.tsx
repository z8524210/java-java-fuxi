import Link from "next/link";

import type { CollectionGuide } from "@/lib/collections";
import { getCollection } from "@/lib/collections";

export function TopicPlace({ item }: { item: CollectionGuide }) {
  return (
    <section className="grid gap-3 rounded-xl border bg-muted/30 px-4 py-4">
      <h2 className="text-sm font-semibold">在体系里的位置</h2>
      <p className="text-sm leading-6">{item.moduleRole}</p>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">模块</dt>
          <dd className="mt-0.5 font-medium">{item.module}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">先看</dt>
          <dd className="mt-0.5 leading-6">
            {item.prereqs.length === 0 ? (
              <span className="text-muted-foreground">这条线的起点</span>
            ) : (
              item.prereqs.map((id) => (
                <Link key={id} href={`/${id}`} className="mr-2 underline-offset-4 hover:underline">
                  {getCollection(id)?.name ?? id}
                </Link>
              ))
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">接下来</dt>
          <dd className="mt-0.5 leading-6">
            {item.next.length === 0 ? (
              <span className="text-muted-foreground">本模块收口</span>
            ) : (
              item.next.map((id) => (
                <Link key={id} href={`/${id}`} className="mr-2 underline-offset-4 hover:underline">
                  {getCollection(id)?.name ?? id}
                </Link>
              ))
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
