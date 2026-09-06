import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="grid max-w-lg gap-3 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">没有这一页</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        集合名字请用小写路径，例如 /hashmap、/stream、/optional。
      </p>
      <Link href="/" className={cn(buttonVariants(), "w-fit")}>
        回到总览
      </Link>
    </div>
  );
}
