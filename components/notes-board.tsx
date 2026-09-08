"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  NOTES_CHANGED,
  formatNoteTime,
  readNotes,
  removeNote,
  type Note,
} from "@/lib/notes";

export function NotesBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setNotes(readNotes());
    sync();
    setReady(true);
    window.addEventListener(NOTES_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NOTES_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!ready) return null;

  if (notes.length === 0) {
    return (
      <div className="rounded-xl border px-4 py-6">
        <p className="text-sm leading-7">还没有笔记。</p>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          打开任意专题，划一段话，弹出框里点「记下」。笔记只存在这台设备的浏览器里。
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
          去总览挑一篇
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-xl border px-4 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link
              href={note.href}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {note.pageTitle}
            </Link>
            <span className="text-xs text-muted-foreground">{formatNoteTime(note.createdAt)}</span>
          </div>
          <blockquote className="mt-2 text-[15px] leading-7">{note.text}</blockquote>
          {note.comment ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">备注：{note.comment}</p>
          ) : null}
          <div className="mt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => removeNote(note.id)}>
              删除
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
