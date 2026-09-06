import type { SpineStep } from "@/lib/collections";

export function SpineStrip({ labels }: { labels: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
      {labels.map((label, index) => (
        <li key={`${index}-${label}`} className="flex items-center gap-1">
          {index > 0 && <span className="px-0.5 text-muted-foreground">→</span>}
          <span className="rounded-md border bg-background px-2 py-1 font-mono text-xs">
            <span className="mr-1 text-[10px] text-muted-foreground">{index + 1}</span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function KnowledgeSpine({
  title,
  steps,
}: {
  title: string;
  steps: SpineStep[];
}) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          先把这条链走顺。下面每一步都是链上的一环，不是互不相关的考点。
        </p>
        <div className="rounded-xl border bg-muted/30 px-3 py-3">
          <SpineStrip labels={steps.map((step) => step.label)} />
        </div>
      </div>
      <ol className="grid gap-3">
        {steps.map((step, index) => (
          <li key={step.label} className="rounded-xl border px-4 py-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-xs text-muted-foreground">{index + 1}</span>
              <h3 className="font-mono text-sm font-semibold">{step.label}</h3>
            </div>
            <p className="mt-2 text-sm leading-6">
              <span className="text-muted-foreground">这一步：</span>
              {step.why}
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
