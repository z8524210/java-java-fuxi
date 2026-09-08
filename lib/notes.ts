export type Note = {
  id: string;
  text: string;
  comment: string;
  href: string;
  pageTitle: string;
  createdAt: number;
};

const STORAGE_KEY = "java-interview-notes-v1";
const MAX_NOTES = 200;
export const NOTES_CHANGED = "java-interview-notes-changed";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readNotes(): Note[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.href === "string"
    );
  } catch {
    return [];
  }
}

function writeNotes(notes: Note[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(0, MAX_NOTES)));
  window.dispatchEvent(new Event(NOTES_CHANGED));
}

export function addNote(input: {
  text: string;
  comment: string;
  href: string;
  pageTitle: string;
}): Note {
  const note: Note = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: input.text.trim(),
    comment: input.comment.trim(),
    href: input.href,
    pageTitle: input.pageTitle,
    createdAt: Date.now(),
  };
  writeNotes([note, ...readNotes()]);
  return note;
}

export function removeNote(id: string) {
  writeNotes(readNotes().filter((note) => note.id !== id));
}

export function formatNoteTime(ts: number) {
  return new Date(ts).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
