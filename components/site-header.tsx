"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navGroups, pageLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      <div>
        <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          复习入口
        </p>
        <ul className="grid gap-1">
          {pageLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                  pathname === link.href
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.title}
          </p>
          <ul className="grid gap-1">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    pathname === link.href
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] text-muted-foreground/80">{link.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-mono text-xs text-primary-foreground">
            J
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Java 面试速记</div>
            <div className="hidden text-[11px] text-muted-foreground sm:block">
              类型系统 · 函数式 · 集合
            </div>
          </div>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon-sm" className="md:hidden" />
            }
          >
            <Menu />
            <span className="sr-only">打开目录</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            <SheetHeader className="px-0">
              <SheetTitle>目录</SheetTitle>
            </SheetHeader>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SideNav() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-52 shrink-0 overflow-y-auto md:block">
      <NavLinks />
    </aside>
  );
}
