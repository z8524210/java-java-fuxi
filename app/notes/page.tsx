import type { Metadata } from "next";

import { NotesBoard } from "@/components/notes-board";

export const metadata: Metadata = {
  title: "划词笔记",
  description: "把专题里划过的句子存在这台设备上，方便回看。",
};

export default function NotesPage() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">划词笔记</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          在专题正文里划一段字，弹出框点「记下」。笔记只存在当前浏览器，换设备或清缓存会消失。
        </p>
      </header>
      <NotesBoard />
    </div>
  );
}
