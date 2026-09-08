"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { addNote } from "@/lib/notes";

const ROOT_ID = "note-root";
const MIN_LEN = 2;
const MAX_LEN = 800;

type Draft = {
  text: string;
  href: string;
  pageTitle: string;
  left: number;
  top: number;
};

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function pageTitleFromDocument() {
  return document.title.replace(/\s*·\s*Java 面试速记$/, "").trim() || "本页";
}

function selectionInside(root: HTMLElement, node: Node | null) {
  if (!node) return false;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return Boolean(el && root.contains(el));
}

function captureDraft(pathname: string): Draft | null {
  const root = document.getElementById(ROOT_ID);
  const sel = window.getSelection();
  if (!root || !sel || sel.isCollapsed || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (!selectionInside(root, range.commonAncestorContainer)) return null;
  if (range.startContainer.parentElement?.closest("[data-note-popover]")) return null;

  const text = normalize(sel.toString()).slice(0, MAX_LEN);
  if (text.length < MIN_LEN) return null;

  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;

  const popoverWidth = Math.min(320, window.innerWidth - 16);
  const estimated = 230;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const left = Math.min(
    Math.max(8, rect.left + rect.width / 2 - popoverWidth / 2),
    window.innerWidth - popoverWidth - 8
  );
  let top = coarse || rect.top < 96 ? rect.bottom + 10 : rect.top - estimated;
  if (top < 64) top = rect.bottom + 10;
  if (top + estimated > window.innerHeight - 8) {
    top = Math.max(64, window.innerHeight - estimated - 8);
  }

  return {
    text,
    href: pathname || "/",
    pageTitle: pageTitleFromDocument(),
    left,
    top,
  };
}

export function SelectionNotes() {
  const pathname = usePathname();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [comment, setComment] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setDraft(null);
    setComment("");
    setJustSaved(false);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (pathname === "/notes") return;

    const schedule = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const next = captureDraft(pathname);
        if (!next) return;
        setJustSaved(false);
        setDraft(next);
      }, 160);
    };

    document.addEventListener("selectionchange", schedule);
    document.addEventListener("pointerup", schedule);
    return () => {
      window.clearTimeout(timerRef.current);
      document.removeEventListener("selectionchange", schedule);
      document.removeEventListener("pointerup", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (!draft) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (popoverRef.current?.contains(target)) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      close();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [draft, close]);

  if (!mounted || pathname === "/notes" || !draft) return null;

  const save = () => {
    addNote({
      text: draft.text,
      comment,
      href: draft.href,
      pageTitle: draft.pageTitle,
    });
    window.getSelection()?.removeAllRanges();
    setJustSaved(true);
    setComment("");
    window.setTimeout(close, 1400);
  };

  return createPortal(
    <div
      ref={popoverRef}
      data-note-popover
      role="dialog"
      aria-label="划词笔记"
      className="fixed z-50 w-[min(20rem,calc(100vw-1rem))] rounded-xl border bg-popover p-3 text-sm shadow-lg"
      style={{ left: draft.left, top: draft.top }}
      onMouseDown={(event) => {
        const tag = (event.target as HTMLElement).tagName;
        if (tag !== "TEXTAREA" && tag !== "INPUT") event.preventDefault();
      }}
    >
      {justSaved ? (
        <p className="text-sm leading-6">
          已记下。
          <Link href="/notes" className="ml-1 underline-offset-4 hover:underline">
            去笔记页看
          </Link>
        </p>
      ) : (
        <div className="grid gap-2">
          <p className="text-xs text-muted-foreground">划到的句子</p>
          <blockquote className="max-h-24 overflow-y-auto rounded-lg bg-muted/60 px-2.5 py-2 text-[13px] leading-6">
            {draft.text}
          </blockquote>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={400}
            rows={2}
            placeholder="备注可空，比如：面试先说扰动"
            className="min-h-16 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              取消
            </Button>
            <Button type="button" size="sm" onClick={save}>
              记下
            </Button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
