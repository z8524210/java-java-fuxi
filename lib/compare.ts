import type { CollectionGuide } from "@/lib/collections";
import { collectionTopics, languageTopics } from "@/lib/collections";

export const compareColumns = [
  { key: "name", label: "集合" },
  { key: "kind", label: "类型" },
  { key: "structure", label: "底层" },
  { key: "ordered", label: "顺序" },
  { key: "threadSafe", label: "线程安全" },
  { key: "nullKey", label: "null key / 元素" },
  { key: "nullValue", label: "null value" },
  { key: "lookup", label: "查找" },
] as const;

export type CompareRow = {
  id: CollectionGuide["id"];
  name: string;
  kind: string;
  structure: string;
  ordered: string;
  threadSafe: string;
  nullKey: string;
  nullValue: string;
  lookup: string;
};

export const compareRows: CompareRow[] = collectionTopics.map((item) => ({
  id: item.id,
  name: item.name,
  kind: item.kind,
  structure:
    item.id === "arraylist"
      ? "动态数组"
      : item.id === "linkedlist"
        ? "双向链表"
        : item.id === "hashmap"
          ? "数组+链表+红黑树"
          : item.id === "concurrenthashmap"
            ? "CAS+桶锁+链表/树"
            : item.id === "hashset"
              ? "HashMap 当 key"
              : item.id === "treemap"
                ? "红黑树"
                : "HashMap+双向链表",
  ordered: item.ordered,
  threadSafe: item.threadSafe,
  nullKey: item.nullKey,
  nullValue: item.nullValue,
  lookup: item.time.get,
}));

export const complexityRows = collectionTopics.map((item) => ({
  id: item.id,
  name: item.name,
  get: item.time.get,
  add: item.time.add,
  remove: item.time.remove,
  contains: item.time.contains,
  iterate: item.time.iterate,
}));

export const decisionSteps = [
  {
    title: "要不要多线程一起写？",
    yes: "Map → ConcurrentHashMap；还要 key 有序 → ConcurrentSkipListMap。List 常用 CopyOnWriteArrayList 或外面加锁。",
    no: "继续往下看顺序和访问方式。",
  },
  {
    title: "只要一组不重复元素？",
    yes: "无序 HashSet；插入顺序 LinkedHashSet；排序 TreeSet。",
    no: "那就是 List 或 Map。",
  },
  {
    title: "是键值对吗？",
    yes: "无序 HashMap；插入顺序 / LRU 用 LinkedHashMap；按 key 排序用 TreeMap。",
    no: "普通列表默认 ArrayList。头尾高频用 ArrayDeque；很少需要 LinkedList。",
  },
];

export const languageDecisionSteps = [
  {
    title: "要表达「盒子里是什么类型」？",
    yes: "用泛型。往外取用 <? extends T>，往里放用 <? super T>。运行时细节看类型擦除。",
    no: "继续看要不要处理集合数据或空值。",
  },
  {
    title: "要对列表做过滤 / 映射 / 分组？",
    yes: "Stream + Lambda。先确认函数式接口（map→Function，filter→Predicate）。复杂控制流仍用 for。",
    no: "可能只是「返回值可能为空」——用 Optional。",
  },
  {
    title: "方法可能找不到结果？",
    yes: "返回 Optional，调用方 orElseGet / orElseThrow。不要当字段或参数，不要包一层 List。",
    no: "空集合就返回空列表，别套 Optional。",
  },
];

export const languageCompareRows = languageTopics.map((item) => ({
  id: item.id,
  name: item.name,
  kind: item.kind,
  oneLiner: item.oneLiner,
  fact: item.defaultCapacity,
}));
