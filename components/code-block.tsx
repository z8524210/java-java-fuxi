export function CodeBlock({ title, source }: { title: string; source: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border">
      <figcaption className="border-b bg-muted/50 px-4 py-2 text-xs font-medium">
        {title}
      </figcaption>
      <pre className="overflow-x-auto bg-zinc-950 p-4 text-[12px] leading-6 text-zinc-100">
        <code>{source}</code>
      </pre>
    </figure>
  );
}
