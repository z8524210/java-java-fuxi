import type { CollectionId, CollectionGuide, KnowledgeModule } from "@/lib/collections";
import { getCollection } from "@/lib/collections";

export type ModuleGuide = {
  id: KnowledgeModule;
  name: KnowledgeModule;
  spineTitle: string;
  spine: string[];
  role: string;
  learn: string;
  topicIds: CollectionId[];
};

export const moduleGuides: ModuleGuide[] = [
  {
    id: "类型系统",
    name: "类型系统",
    spineTitle: "从契约到擦除",
    spine: ["声明 <T>", "编译期检查", "PECS 通配符", "类型擦除", "插入强转"],
    role: "给容器贴上「里面是什么」的标签。没有它，List<E>、Stream<T>、Optional<T> 都写不成。",
    learn: "先学泛型怎么用，再学擦除为什么有那些限制。",
    topicIds: ["generics", "type-erasure"],
  },
  {
    id: "函数式",
    name: "函数式",
    spineTitle: "从插头到流水线",
    spine: ["函数式接口", "Lambda", "Optional", "Stream"],
    role: "从容器里取数据、做变换。插头是 SAM，电器是 Lambda，流水线是 Stream，0 或 1 个结果是 Optional。",
    learn: "函数式接口 → Lambda → Optional → Stream。Stream 会把前三块用起来。",
    topicIds: ["functional-interface", "lambda", "optional", "stream"],
  },
  {
    id: "集合",
    name: "集合",
    spineTitle: "数据放哪儿",
    spine: ["List 默认 ArrayList", "Map 主干 HashMap", "保序 / 排序 / 并发 三个变体", "HashSet 是 HashMap 马甲"],
    role: "真正存数据的地方。类型系统给它贴标签，函数式从它里面抽数据。",
    learn: "ArrayList 打底，HashMap 是主干。其它 Map/Set 都是在 HashMap 上加一条轴。",
    topicIds: [
      "arraylist",
      "linkedlist",
      "hashmap",
      "hashset",
      "linkedhashmap",
      "treemap",
      "concurrenthashmap",
    ],
  },
];

export const learnPath: { id: CollectionId; reason: string }[] = [
  { id: "generics", reason: "后面所有容器签名都靠它" },
  { id: "type-erasure", reason: "回答「运行时还有没有 T」" },
  { id: "functional-interface", reason: "Lambda 的插头" },
  { id: "lambda", reason: "把行为当参数传" },
  { id: "optional", reason: "0 或 1 个值" },
  { id: "stream", reason: "综合前三块，处理集合" },
  { id: "arraylist", reason: "默认列表" },
  { id: "hashmap", reason: "默认 Map，一条 put 链吃透" },
  { id: "hashset", reason: "HashMap 的 Set 马甲" },
  { id: "linkedhashmap", reason: "HashMap + 顺序" },
  { id: "treemap", reason: "另一条轴：按 key 排序" },
  { id: "concurrenthashmap", reason: "另一条轴：并发" },
  { id: "linkedlist", reason: "对照 ArrayList，多数情况用不上" },
];

function pick(ids: CollectionId[]): CollectionGuide[] {
  return ids.map((id) => getCollection(id)).filter((item): item is CollectionGuide => Boolean(item));
}

export const topicsByModule = {
  类型系统: pick(moduleGuides[0].topicIds),
  函数式: pick(moduleGuides[1].topicIds),
  集合: pick(moduleGuides[2].topicIds),
} as Record<KnowledgeModule, CollectionGuide[]>;
