import type { ReactNode } from "react";

import { SiteHeader, SideNav } from "@/components/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 md:py-8">
        <SideNav />
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
