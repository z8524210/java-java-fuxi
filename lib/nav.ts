import type { CollectionId } from "@/lib/collections";
import { topicsByModule } from "@/lib/system";

export const pageLinks = [
  { href: "/", label: "总览" },
  { href: "/compare", label: "对照表" },
  { href: "/questions", label: "面试题" },
] as const;

function toLinks(items: (typeof topicsByModule)[keyof typeof topicsByModule]) {
  return items.map((item) => ({
    href: `/${item.id}`,
    label: item.name,
    id: item.id as CollectionId,
    kind: item.kind,
  }));
}

export const navGroups = [
  { title: "类型系统", links: toLinks(topicsByModule.类型系统) },
  { title: "函数式", links: toLinks(topicsByModule.函数式) },
  { title: "集合", links: toLinks(topicsByModule.集合) },
] as const;
