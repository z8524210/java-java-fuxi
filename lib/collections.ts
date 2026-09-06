export type CollectionId =
  | "arraylist"
  | "linkedlist"
  | "hashmap"
  | "concurrenthashmap"
  | "hashset"
  | "treemap"
  | "linkedhashmap"
  | "generics"
  | "type-erasure"
  | "stream"
  | "lambda"
  | "functional-interface"
  | "optional";

export type CollectionKind = "List" | "Map" | "Set" | "类型系统" | "函数式" | "工具类";

export type TopicCategory = "集合" | "语言特性";

export type KnowledgeModule = "类型系统" | "函数式" | "集合";

export type SpineStep = {
  label: string;
  why: string;
  body: string;
};

export type Complexity = {
  get: string;
  add: string;
  remove: string;
  contains: string;
  iterate: string;
  note?: string;
};

export type CollectionGuide = {
  id: CollectionId;
  name: string;
  jdkInterface: string;
  kind: CollectionKind;
  category: TopicCategory;
  module: KnowledgeModule;
  moduleRole: string;
  prereqs: CollectionId[];
  next: CollectionId[];
  spineTitle: string;
  spine: SpineStep[];
  oneLiner: string;
  analogy: string;
  structure: string;
  ordered: string;
  threadSafe: string;
  nullKey: string;
  nullValue: string;
  defaultCapacity: string;
  time: Complexity;
  highlights: string[];
  internals: { title: string; body: string }[];
  pitfalls: string[];
  useWhen: string[];
  avoidWhen: string[];
  code: { title: string; source: string };
  vs: { other: string; point: string }[];
  interviewAnswer: string;
  facts?: { label: string; value: string }[];
};

export const collections: CollectionGuide[] = [
  {
    id: "arraylist",
    name: "ArrayList",
    jdkInterface: "List / RandomAccess",
    kind: "List",
    category: "集合",
    module: "集合",
    moduleRole:
      "默认列表。集合这条线从它开始：连续内存、按下标走、中间操作要搬元素。LinkedList 是它的对照，不是替代。",
    prereqs: ["generics"],
    next: ["linkedlist", "hashmap"],
    spineTitle: "一次 add() 走到底",
    spine: [
      {
        label: "add(e)",
        why: "写入入口。尾部追加是主路径，中间插入是同一套数组上的慢路径。",
        body: "先确保容量够，再 elementData[size] = e，然后 size++、modCount++。get(i) / set(i) 不走扩容，直接下标，所以是 O(1)。",
      },
      {
        label: "确保容量",
        why: "数组长度是固定的，满了必须换更大的数组。",
        body: "JDK 8 起无参构造先用空数组，第一次 add 才扩到 10。size 是元素个数，capacity 是数组长度，两码事。删元素不会自动缩容。",
      },
      {
        label: "不够则 1.5 倍扩容",
        why: "一次扩太小会频繁拷贝，一次扩太大浪费内存。1.5 倍是折中。",
        body: "新容量 = 旧容量 + 旧容量右移 1 位，例如 10 → 15 → 22。用 Arrays.copyOf 搬到新数组。预先知道数量就 new ArrayList<>(n)，少拷几次。",
      },
      {
        label: "尾部写入 / 中间搬移",
        why: "连续数组的代价：中间插一个，后面都要往后挪。",
        body: "尾部均摊 O(1)。中间 add/remove 走 System.arraycopy，是 O(n)。这就是「随机访问快、中间改结构慢」的全部原因。",
      },
      {
        label: "modCount → fail-fast",
        why: "结构变了，还用旧迭代器往下走，结果未定义。直接炸比悄悄错更好。",
        body: "结构性修改 ++modCount。迭代器记下 expectedModCount，对不上就 ConcurrentModificationException。foreach 里调 list.remove 会中招；用 iterator.remove() 或倒序下标删。",
      },
    ],
    oneLiner: "可变长数组。按下标读写极快，中间插入或删除要挪后面的元素。",
    analogy:
      "像一排连在一起的座位：找第 5 号座位一步就能走到；但要在中间插一个人，后面的人都得往后挪。",
    structure: "连续的 Object[] 数组 + size 记录实际元素个数",
    ordered: "有序（插入顺序）",
    threadSafe: "不安全",
    nullKey: "允许 null 元素",
    nullValue: "—",
    defaultCapacity: "JDK 8+ 空数组起步，第一次 add 扩到 10",
    time: {
      get: "O(1)",
      add: "尾部均摊 O(1)，中间 O(n)",
      remove: "尾部 O(1)，中间 O(n)",
      contains: "O(n)",
      iterate: "O(n)，缓存友好",
      note: "随机访问是强项；contains 要扫一遍，没有哈希。",
    },
    highlights: [
      "实现 RandomAccess，适合按 index 读写",
      "扩容为原来的 1.5 倍：old + (old >> 1)",
      "删除/中间插入会 System.arraycopy 搬元素",
      "迭代器 fail-fast：遍历时结构被改会 ConcurrentModificationException",
      "几乎所有「普通列表」场景的默认选择",
    ],
    internals: [
      {
        title: "空列表并不立刻占 10 个格子",
        body: "JDK 8 起，无参构造用的是空数组 DEFAULTCAPACITY_EMPTY_ELEMENTDATA。第一次 add 才扩到默认容量 10。面试别死记「一 new 就是 10」。",
      },
      {
        title: "扩容公式",
        body: "新容量 = 旧容量 + 旧容量右移 1 位，也就是 1.5 倍。例如 10 → 15 → 22 → 33。如果还不够，就直接扩到所需最小容量。拷贝数组用 Arrays.copyOf。",
      },
      {
        title: "size 和 capacity 不是一回事",
        body: "size 是元素个数，capacity 是数组长度。删元素不会自动缩容，可用 trimToSize()。预先知道大概数量时，用 new ArrayList<>(n) 或 ensureCapacity，少扩容几次。",
      },
      {
        title: "fail-fast 靠 modCount",
        body: "结构性修改会 ++modCount。迭代器创建时记下 expectedModCount，每次 next 都核对。用 for-each 时调用 list.remove(obj) 容易踩坑；应使用迭代器的 remove，或倒序下标删除。",
      },
    ],
    pitfalls: [
      "subList() 返回的是视图，不是拷贝。改子列表会影响原列表；原列表结构变了，子列表再操作可能异常。",
      "不要在 foreach 里直接 list.remove。",
      "多线程共享 ArrayList 会丢数据或抛异常，应用 CopyOnWriteArrayList 或外面加锁。",
      "LinkedList 在「中间插入」理论上更快，但要先走到那个节点。实际开发里 ArrayList 几乎总是更快。",
    ],
    useWhen: [
      "按索引读写多",
      "主要在尾部追加",
      "需要随机访问、遍历、当普通列表用",
    ],
    avoidWhen: [
      "多线程同时改同一个列表（除非额外同步）",
      "频繁在头部插入且数据量极大（可考虑 ArrayDeque）",
    ],
    code: {
      title: "扩容与遍历时删除",
      source: `List<String> list = new ArrayList<>(100); // 预估容量，少扩容
list.add("a");
list.add("b");
list.add("c");

// 正确删除：用迭代器
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) {
        it.remove();
    }
}

// 或从后往前按下标删
for (int i = list.size() - 1; i >= 0; i--) {
    if ("c".equals(list.get(i))) {
        list.remove(i);
    }
}`,
    },
    vs: [
      {
        other: "LinkedList",
        point: "ArrayList 随机访问 O(1)，内存紧凑；LinkedList 插入已知节点 O(1)，但寻址是 O(n)，还有额外指针开销。",
      },
      {
        other: "Vector",
        point: "Vector 方法带 synchronized，是遗留类。现在几乎不用，并发用并发集合，而不是 Vector。",
      },
      {
        other: "ArrayDeque",
        point: "只关心头尾增删时，队列/栈用 ArrayDeque 通常比 LinkedList 更好。",
      },
    ],
    interviewAnswer:
      "ArrayList 底层是数组。按下标 get/set 是 O(1)；中间插入删除要搬后面的元素，是 O(n)。默认第一次放元素时容量变成 10，之后按 1.5 倍扩容。线程不安全。日常列表几乎都用它，很少需要 LinkedList。",
  },
  {
    id: "linkedlist",
    name: "LinkedList",
    jdkInterface: "List / Deque",
    kind: "List",
    category: "集合",
    module: "集合",
    moduleRole:
      "ArrayList 的对照物，不是默认选项。主链是「改指针很快，但先要走到那个节点」。队列场景更优先 ArrayDeque。",
    prereqs: ["arraylist"],
    next: ["hashmap"],
    spineTitle: "一次头尾插入走到底",
    spine: [
      {
        label: "addFirst / addLast",
        why: "真正的 O(1) 发生在已经拿到头尾指针的时候。",
        body: "改 first/last 和相邻 Node 的 prev/next。每个节点额外存两个指针，内存比 ArrayList 大，节点还散落在堆里。",
      },
      {
        label: "node(index) 寻址",
        why: "List 接口的 get(i)、add(i, e) 都要先找到第 i 个节点。",
        body: "比较 i 和 size/2，从更近的一端走，仍是 O(n)。面试说「插入 O(1)」有前提：你已经拿到那个节点。对 List 接口按 index 插，总体还是 O(n)。",
      },
      {
        label: "改 prev / next",
        why: "找到节点之后，插入删除才是改指针。",
        body: "Node 结构是 item + prev + next。这步本身 O(1)，但人们常把「找到」的成本忘掉。for 里反复 get(i) 会变成 O(n²)。",
      },
      {
        label: "当 Deque 用",
        why: "它实现了 Deque，能当队列、栈、双端队列。",
        body: "offer/poll/push/pop 都有。但不是线程安全队列；只当队列时 ArrayDeque（循环数组）通常更快。并发用 ConcurrentLinkedQueue 或 BlockingQueue。",
      },
    ],
    oneLiner: "双向链表。头尾增删快，按下标找很慢。同时能当队列或栈用。",
    analogy:
      "像手拉手排队：插队只要改两个人拉手的对象；但要找第 100 个人，只能从头（或从尾）一个个数过去。",
    structure: "双向链表。每个 Node 有 prev、item、next；另有 first、last 指针",
    ordered: "有序（插入顺序）",
    threadSafe: "不安全",
    nullKey: "允许 null 元素",
    nullValue: "—",
    defaultCapacity: "没有容量概念，有多少节点占多少内存",
    time: {
      get: "O(n)，从更近的一端走",
      add: "头尾 O(1)；中间先找到再 O(1)",
      remove: "头尾 O(1)；中间同样要先找到",
      contains: "O(n)",
      iterate: "O(n)，但跳跃缓存不友好",
      note: "get(i) 会比较 i 和 size/2，决定从 first 还是 last 出发。",
    },
    highlights: [
      "每个节点额外存两个指针，内存比 ArrayList 大",
      "实现了 Deque，可当队列、栈、双端队列",
      "没有 RandomAccess，不要按 index 循环 get(i)",
      "头尾操作是真正的 O(1)",
      "实际项目里当队列更推荐 ArrayDeque",
    ],
    internals: [
      {
        title: "节点结构",
        body: "private static class Node<E> { E item; Node<E> next; Node<E> prev; }。插入、删除本质是改相邻节点的指针。",
      },
      {
        title: "按下标访问并不快",
        body: "list.get(10000) 仍然要走 10000 步。面试常说「插入 O(1)」是有前提的：你已经拿到那个节点。对 List 接口的 add(index, e)，先 node(index) 再插入，总体还是 O(n)。",
      },
      {
        title: "可当队列",
        body: "offer/poll/peek、addFirst/addLast、push/pop 都有。但它不是线程安全队列。并发队列用 ConcurrentLinkedQueue 或 BlockingQueue。",
      },
    ],
    pitfalls: [
      "for (int i = 0; i < list.size(); i++) list.get(i) 会变成 O(n²)，这是经典慢代码。",
      "「中间插入更快」经常是伪需求：你得先遍历到中间。",
      "节点分散在堆里，CPU 缓存命中率差，遍历往往比 ArrayList 慢。",
    ],
    useWhen: [
      "频繁在头尾插入删除",
      "需要 List 同时又当双端队列",
      "只通过迭代器/节点操作，不按 index 乱跳",
    ],
    avoidWhen: [
      "大量按索引读写",
      "数据量大且频繁整体遍历（优先 ArrayList）",
      "只是想要一个队列（优先 ArrayDeque）",
    ],
    code: {
      title: "当双端队列使用",
      source: `LinkedList<String> deque = new LinkedList<>();
deque.addLast("a");   // 队尾入
deque.addFirst("head");
String first = deque.removeFirst(); // 队头出
String last = deque.peekLast();

// 遍历请用增强 for / 迭代器，不要 get(i)
for (String s : deque) {
    System.out.println(s);
}`,
    },
    vs: [
      {
        other: "ArrayList",
        point: "读写下标、遍历、内存：ArrayList 胜。头尾频繁插删：LinkedList 理论上胜，实测很多情况 ArrayDeque/ArrayList 仍更好。",
      },
      {
        other: "ArrayDeque",
        point: "同样做队列，ArrayDeque 基于循环数组，不能存 null，但不能当下标 List。队列场景首选它。",
      },
    ],
    interviewAnswer:
      "LinkedList 是双向链表，每个节点有前后指针。头尾增删 O(1)，按下标访问 O(n)。它还实现了 Deque。面试别只背「插入快」：通过 List 接口按 index 插入，先找到节点就是 O(n)。日常列表优先 ArrayList。",
  },
  {
    id: "hashmap",
    name: "HashMap",
    jdkInterface: "Map",
    kind: "Map",
    category: "集合",
    module: "集合",
    moduleRole:
      "无序键值对的默认实现，也是 HashSet、LinkedHashMap、ConcurrentHashMap 的参照系。把下面这条 put 链讲顺，HashMap 就算真正成体系。",
    prereqs: ["generics", "arraylist"],
    next: ["hashset", "linkedhashmap", "treemap", "concurrenthashmap"],
    spineTitle: "一次 put() 走到底",
    spine: [
      {
        label: "put(key, value)",
        why: "整张表的写入入口。面试从这里开始，后面每一步都是它的分支。",
        body: "JDK 8 的 putVal。先不算下标，先得到扰动后的 hash。表还没建、桶是空的、key 已存在、发生冲突、链表过长、超过负载，都在这一次调用里依次处理。",
      },
      {
        label: "hash 扰动",
        why: "下标只用 hash 的低位。高位不折下来，低位相似的 key 会扎堆。",
        body: "公式是 h ^ (h >>> 16)，把高 16 位折到低位再参与运算。扰动不是加密，只是让分布更匀。自定义 key 仍然必须同时重写 equals 和 hashCode。",
      },
      {
        label: "(n-1) & hash",
        why: "容量必须是 2 的幂，位运算才等价于 hash % n，又比取模快。",
        body: "n=16 时 n-1 是 15，低 4 位全 1，& 的结果就是桶下标。构造时传入 10，内部也会扩到 16。这一步决定了后面冲突会不会挤在同一个桶。",
      },
      {
        label: "表空则 resize",
        why: "无参构造是懒的，new 出来还没有 16 个桶。",
        body: "第一次 put 才真正建表。默认容量 16、负载因子 0.75、阈值 12。后面每次扩容都还是走 resize，只是从「建表」变成「扩成 2 倍」。",
      },
      {
        label: "桶空则放入",
        why: "没有冲突时的最快路径，平均 O(1) 就是从这里来的。",
        body: "对应下标还没有节点，直接 new Node 放进去。get 同样先算 hash、再定位、再比 key。",
      },
      {
        label: "key 相同则替换",
        why: "Map 不允许重复 key。相等不是 ==，是 hash 相同且 equals。",
        body: "先比 hash，再 (k == key || key.equals(k))。命中就改 value，不增加 size。key 放进去之后不要改参与 hashCode/equals 的字段，否则再也找不到。",
      },
      {
        label: "冲突 → 链表",
        why: "不同 key 落到同一桶。JDK 8 尾插，不再头插。",
        body: "顺着 next 走：没有相同 key 就挂到链尾。JDK 7 头插在多线程扩容时可能成环；JDK 8 改尾插避开了死循环，但多线程 put 仍会丢数据，只是不一定死循环。",
      },
      {
        label: "过长 → 红黑树",
        why: "哈希很差时，链表查找会退化成 O(n)。树化把最坏降到 O(log n)。",
        body: "链表长度 ≥ 8 且数组长度 ≥ 64 才树化。数组还小于 64 时优先扩容把节点打散。树太短（≤6）会退回链表。8 和 64 都是权衡：树节点更重，太早树化不划算。",
      },
      {
        label: "超阈值 → resize",
        why: "size 超过 capacity × 0.75，再塞就会冲突激增。",
        body: "新容量 = 旧容量 × 2。每个节点看 hash & oldCap：0 则下标不变，1 则搬到 oldIndex + oldCap。所以容量必须一直是 2 的幂。扩容是 O(n) 的，预先按 n/0.75+1 设容量，能少扩几次。",
      },
    ],
    oneLiner: "哈希表。用 key 的哈希定位桶，JDK 8 起链表过长会转成红黑树。无序、线程不安全。",
    analogy:
      "像快递柜：用哈希算出该放几号柜。同一个柜子撞车了就挂成一串；串太长（且柜子总数够多）就改成树，查找更快。",
    structure: "数组 + 链表 + 红黑树（JDK 8+）。每个槽位叫 bin / bucket",
    ordered: "无序（遍历顺序不保证）",
    threadSafe: "不安全",
    nullKey: "允许 1 个 null key",
    nullValue: "允许多个 null value",
    defaultCapacity: "16，负载因子 0.75，阈值 12",
    time: {
      get: "平均 O(1)，最坏树化后 O(log n)",
      add: "平均 O(1)，扩容时 O(n)",
      remove: "平均 O(1)",
      contains: "平均 O(1)（按 key）",
      iterate: "O(容量 + 元素数)",
      note: "哈希很差或全撞在一个桶时会退化。好的 hashCode 很重要。",
    },
    highlights: [
      "下标计算：(n - 1) & hash，所以容量必须是 2 的幂",
      "扰动函数：hash ^ (hash >>> 16)，让高 16 位也参与运算",
      "链表长度达到 8 且数组长度 ≥ 64 才树化；树降回链表阈值是 6",
      "扩容 2 倍，节点要么原地，要么搬到 oldIndex + oldCap",
      "equals 相等的 key 必须有相同 hashCode，否则丢数据",
    ],
    internals: [
      {
        title: "put 的完整路径（JDK 8）",
        body: "① 算 hash。② 表是空的就 resize。③ 目标桶是空的，直接放新节点。④ 桶上已有节点：key 相同就替换；是树就 treePut；是链表就尾插，插完如果链表长度 ≥ 8 尝试树化。⑤ size++，超过阈值就扩容。",
      },
      {
        title: "为什么要扰动 hash",
        body: "下标只用到 hash 的低位。若很多 key 的低位相似、高位不同，会扎堆。hash ^ (hash >>> 16) 把高 16 位折下来，冲突更均匀。",
      },
      {
        title: "为什么 8 和 64",
        body: "泊松分布下，负载因子 0.75 时链表长度到 8 的概率极低，到 8 基本说明哈希很差。树化有成本。数组还小于 64 时，优先先扩容打散，而不是立刻变树。",
      },
      {
        title: "扩容时节点怎么分裂",
        body: "新容量是旧的两倍。对每个节点看 hash & oldCap：结果是 0，下标不变；是 1，新下标 = 旧下标 + oldCap。JDK 8 不再像 JDK 7 那样头插，避免多线程扩容死循环，但仍然线程不安全。",
      },
      {
        title: "key 的相等规则",
        body: "先比 hash，再 (k == key || key.equals(k))。作为 key 的对象一旦放进去，不要改会参与 hashCode/equals 的字段，否则再也找不到。",
      },
    ],
    pitfalls: [
      "多线程 put 可能丢数据、size 不准；JDK 7 扩容还可能死循环。并发用 ConcurrentHashMap。",
      "自定义 key 只改 equals 不改 hashCode，会「明明 put 了却 get 不到」。",
      "初始容量写成数据个数 n 不够，应写成 n / 0.75 + 1，否则还会扩一次。",
      "遍历时不要结构修改，否则 fail-fast。",
    ],
    useWhen: [
      "单线程（或只读共享）的键值检索",
      "不需要排序、不需要插入顺序",
      "查找、插入、删除都要快",
    ],
    avoidWhen: [
      "多线程同时写",
      "需要按 key 排序（用 TreeMap）",
      "需要稳定的插入/访问顺序（用 LinkedHashMap）",
    ],
    code: {
      title: "预估容量 + 正确的 key",
      source: `// 要放 100 个元素，按负载因子预留
int n = 100;
Map<String, Integer> map = new HashMap<>((int) (n / 0.75f) + 1);

map.put("java", 1);
map.get("java");          // 1
map.getOrDefault("go", 0);

// key 必须同时重写 equals 和 hashCode
class User {
    final String id;
    User(String id) { this.id = id; }
    public boolean equals(Object o) {
        return o instanceof User u && id.equals(u.id);
    }
    public int hashCode() { return id.hashCode(); }
}`,
    },
    vs: [
      {
        other: "Hashtable",
        point: "Hashtable 全表 synchronized，不允许 null。过时了。并发用 ConcurrentHashMap。",
      },
      {
        other: "ConcurrentHashMap",
        point: "CHM 分段/桶级并发，不允许 null。HashMap 更简单、单线程更快。",
      },
      {
        other: "TreeMap",
        point: "TreeMap 按 key 排序，O(log n)；HashMap 无序，平均 O(1)。",
      },
    ],
    interviewAnswer:
      "HashMap 就讲一次 put。先 hash 扰动再 (n-1)&hash 定位，所以容量必须是 2 的幂。桶空就放；key 相同就替换；冲突走链表，长度到 8 且数组 ≥ 64 转红黑树。size 超过 0.75 容量就扩成 2 倍，节点按 hash & oldCap 分裂。线程不安全，允许一个 null key。并发换 ConcurrentHashMap。",
  },
  {
    id: "concurrenthashmap",
    name: "ConcurrentHashMap",
    jdkInterface: "ConcurrentMap",
    kind: "Map",
    category: "集合",
    module: "集合",
    moduleRole:
      "HashMap 的并发变体。主链几乎平行于 put，只是每一步都多了「谁来加锁、谁来帮忙扩容」。先把 HashMap 那条链讲完再讲它。",
    prereqs: ["hashmap"],
    next: [],
    spineTitle: "一次并发 put 走到底",
    spine: [
      {
        label: "禁止 null",
        why: "get 返回 null 只能表示「没有这个 key」。再允许 null value 就分不清了。",
        body: "key、value 都不能为 null，否则 NPE。这和 HashMap 最大的使用差异。不能把它当「加了锁的 HashMap」直接替换。",
      },
      {
        label: "CAS 初始化表",
        why: "多线程第一次 put 不能像 HashMap 那样普通 resize。",
        body: "JDK 8 取消 Segment。空表用 CAS 建 Node 数组。JDK 7 才是 Segment 分段锁，面试要主动区分两代。",
      },
      {
        label: "空桶 CAS 放入",
        why: "这个桶还没人，不必上 synchronized。",
        body: "和 HashMap「桶空则放入」对应，只是用 CAS 抢。失败就重走 put 逻辑。",
      },
      {
        label: "碰到 ForwardingNode",
        why: "表正在扩容。写线程不傻等，去帮忙搬一段桶。",
        body: "旧表对应位置会放 hash 为 MOVED 的转发节点。其它写线程看见它，帮忙 transfer。sizeCtl 协调谁在扩、扩完没有。",
      },
      {
        label: "synchronized 锁头节点",
        why: "桶上已有链表或树，只锁这一个桶，别的桶还能写。",
        body: "对应 HashMap 的「冲突走链表/树」，只是插入时锁的是桶的第一个节点。粒度是桶，不是整张表。",
      },
      {
        label: "addCount，可能扩容",
        why: "计数本身也会成为热点，不能所有线程抢一个 int。",
        body: "baseCount + CounterCell[] 分散累加，类似 LongAdder。超阈值触发扩容，其它线程可协助。get 全程不加锁，靠 volatile。",
      },
    ],
    oneLiner: "线程安全的哈希表。JDK 8 用 CAS + 桶头 synchronized，读几乎不加锁。不能存 null。",
    analogy:
      "还是快递柜，但每个格子可以单独上锁：往某个柜子放件，只锁这一个柜子，别的柜子别人还能用。空柜子用 CAS 抢着放，不用锁。",
    structure:
      "JDK 8：Node 数组 + 链表/红黑树；空桶 CAS，非空桶锁头节点。JDK 7：Segment 分段锁",
    ordered: "无序",
    threadSafe: "安全（分段/桶级并发）",
    nullKey: "不允许",
    nullValue: "不允许",
    defaultCapacity: "16，负载因子 0.75（与 HashMap 类似）",
    time: {
      get: "平均 O(1)，无锁读取",
      add: "平均 O(1)，可能锁一个桶",
      remove: "平均 O(1)",
      contains: "平均 O(1)",
      iterate: "弱一致遍历，O(n)",
      note: "迭代器弱一致：遍历时的改动可能看到、也可能看不到，不会抛 ConcurrentModificationException。",
    },
    highlights: [
      "JDK 7 分段锁；JDK 8 取消 Segment，改成 CAS + synchronized",
      "get 走 volatile，不加锁",
      "key、value 都不能为 null（和 HashMap 最大使用差异之一）",
      "扩容时多线程可以帮忙搬迁（ForwardingNode）",
      "计数类似 LongAdder，用 CounterCell 降低 size 热点",
    ],
    internals: [
      {
        title: "JDK 7：Segment",
        body: "内部是 Segment[]，每个 Segment 继承 ReentrantLock，下面再挂 HashEntry[]。默认并发级别 16，最多大约 16 个线程同时写不同段。锁的粒度是「一段」，不是整个表。",
      },
      {
        title: "JDK 8：put 怎么加锁",
        body: "① 禁止 null。② 表没初始化就 CAS 初始化。③ 桶为空：CAS 放新节点。④ 桶上是 ForwardingNode：当前线程去帮忙扩容。⑤ 否则 synchronized (桶的第一个节点)，在链表或树里插入/替换。⑥ addCount，可能触发扩容。",
      },
      {
        title: "为什么 get 不用锁",
        body: "数组是 volatile 的，节点的 val、next 也是 volatile。读的是已发布的快照。所以 get 可以和无锁读一样快。这也是「不能存 null」的原因之一：get 返回 null 只能表示没有这个 key，不能再表示「值就是 null」。",
      },
      {
        title: "扩容协作",
        body: "扩容时旧表对应桶会放 ForwardingNode（hash 为 MOVED）。别的写线程碰到它，不傻等，而是帮忙转移一段桶。sizeCtl 用来协调「谁初始化、谁扩容、扩完了没有」。",
      },
      {
        title: "size() 怎么数",
        body: "不是简单的一个 int。多线程用 baseCount + CounterCell[] 分散累加，类似 LongAdder。很大的 Map 更推荐 mappingCount()，返回 long。",
      },
    ],
    pitfalls: [
      "不能当 HashMap 的「加锁版」直接替换，如果业务依赖 null key/value 会直接 NPE。",
      "复合操作（先 get 再 put）仍然不是原子的，要用 putIfAbsent、compute、merge。",
      "它保证的是单次操作线程安全，不保证「连续两次操作」的业务原子性。",
      "不要用它当锁：synchronized(chm) 锁的是对象本身，不是 map 的桶锁。",
    ],
    useWhen: [
      "多线程共享缓存、去重、计数、索引",
      "读多写少或写也并发的 Map",
      "需要 putIfAbsent、compute 这类原子 API",
    ],
    avoidWhen: [
      "单线程（HashMap 更轻）",
      "需要排序（ConcurrentSkipListMap）",
      "必须存 null",
    ],
    code: {
      title: "用原子 API，不要先查再改",
      source: `ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// 错误：get 和 put 中间别人可能插入
if (!map.containsKey("a")) {
    map.put("a", 1);
}

// 正确
map.putIfAbsent("a", 1);
map.compute("a", (k, v) -> v == null ? 1 : v + 1);
map.merge("b", 1, Integer::sum);

long n = map.mappingCount();`,
    },
    vs: [
      {
        other: "HashMap",
        point: "HashMap 单线程更快，允许 null。CHM 并发安全，禁止 null，迭代弱一致。",
      },
      {
        other: "Hashtable / Collections.synchronizedMap",
        point: "后两者基本是整表一把锁，并发度差。CHM 只锁冲突的那个桶。",
      },
      {
        other: "ConcurrentSkipListMap",
        point: "需要并发同时又要按 key 排序时用 SkipList，不是 CHM。",
      },
    ],
    interviewAnswer:
      "ConcurrentHashMap 是线程安全的 HashMap。JDK 7 用 Segment 分段锁；JDK 8 用 Node 数组，空桶 CAS 插入，有元素就锁桶的头节点。get 不加锁。不允许 null。扩容时其它线程会帮忙搬数据。注意：单次操作安全，先检查再修改要用 putIfAbsent 或 compute。",
  },
  {
    id: "hashset",
    name: "HashSet",
    jdkInterface: "Set",
    kind: "Set",
    category: "集合",
    module: "集合",
    moduleRole:
      "HashMap 的 Set 马甲。没有自己的哈希实现，add 就是 put。主链极短：走完就该回到 HashMap 那条 put 链。",
    prereqs: ["hashmap"],
    next: [],
    spineTitle: "一次 add() 其实是一次 HashMap.put",
    spine: [
      {
        label: "add(e)",
        why: "Set 只关心「有没有」，不关心 value。",
        body: "内部 map.put(e, PRESENT)。PRESENT 是一个共享的占位 Object，所有 value 都指向它。",
      },
      {
        label: "走 HashMap put 链",
        why: "去重、冲突、树化、扩容全部复用 HashMap。",
        body: "hash 扰动、(n-1)&hash、链表、红黑树、resize，一条不落。所以 HashSet 的复杂度、线程安全、null 策略都跟 HashMap 走。",
      },
      {
        label: "put 返回旧值来判断新增",
        why: "add 返回 boolean：是不是新元素。",
        body: "map.put 返回 null 表示以前没有这个 key，add 返回 true；返回非 null 表示已存在，add 返回 false。equals + hashCode 仍然是去重的唯一规则。",
      },
    ],
    oneLiner: "去重集合。内部就是一个 HashMap，元素当 key，value 是一份共享的占位对象。",
    analogy:
      "点名册：只关心「来没来」，不关心座位号写了什么。背后其实是一张 HashMap，人名为 key，value 统一写 PRESENT。",
    structure: "内部持有 HashMap<E, Object>，value 固定为 PRESENT",
    ordered: "无序",
    threadSafe: "不安全",
    nullKey: "允许 1 个 null",
    nullValue: "—",
    defaultCapacity: "同 HashMap：16 / 0.75",
    time: {
      get: "—（Set 没有按键取值）",
      add: "平均 O(1)",
      remove: "平均 O(1)",
      contains: "平均 O(1)",
      iterate: "O(容量 + 元素数)",
      note: "复杂度完全跟 HashMap 走。",
    },
    highlights: [
      "add(e) 本质是 map.put(e, PRESENT) == null",
      "去重靠 hashCode + equals，不是 ==",
      "无序；要插入顺序用 LinkedHashSet，要排序用 TreeSet",
      "允许一个 null",
      "面试常问：HashSet 怎么保证不重复？答「HashMap 的 key 不重复」",
    ],
    internals: [
      {
        title: "PRESENT 是什么",
        body: "private static final Object PRESENT = new Object(); 所有 entry 共用这一个 dummy value。Set 只需要「这个 key 在不在」，不需要真正的值。",
      },
      {
        title: "add 何时返回 false",
        body: "map.put 如果该 key 已存在，会返回旧 value（就是 PRESENT），HashSet 判断 != null 就返回 false，表示没加进去。",
      },
      {
        title: "去重规则",
        body: "两个对象 equals 为 true，必须有相同 hashCode。只重写其中一个，HashSet 会失效：可能重复，也可能「明明加过 contains 却是 false」。",
      },
    ],
    pitfalls: [
      "可变对象放进 Set 后改了参与 equals/hashCode 的字段，会丢元素。",
      "HashSet 不能当有序列表用，遍历顺序下次可能变。",
      "需要并发去重用 ConcurrentHashMap.newKeySet()，不是 HashSet。",
    ],
    useWhen: [
      "去重",
      "快速判断「在不在」",
      "不关心顺序",
    ],
    avoidWhen: [
      "需要稳定顺序（LinkedHashSet / TreeSet）",
      "多线程同时 add（并发 Set）",
    ],
    code: {
      title: "去重与并发 Set",
      source: `Set<String> set = new HashSet<>();
set.add("a");
set.add("a");          // false，被去重
set.contains("a");     // true

// 要插入顺序
Set<String> ordered = new LinkedHashSet<>();

// 要并发
Set<String> concurrent = ConcurrentHashMap.newKeySet();
concurrent.add("x");`,
    },
    vs: [
      {
        other: "HashMap",
        point: "HashSet 是 HashMap 的马甲，只暴露 Set 接口。能用 Set 语义就别拿 Map 的 keySet 硬写。",
      },
      {
        other: "TreeSet",
        point: "TreeSet 基于 TreeMap，有序，O(log n)，元素需 Comparable 或传入 Comparator。",
      },
      {
        other: "LinkedHashSet",
        point: "基于 LinkedHashMap，保留插入顺序，其它和 HashSet 类似。",
      },
    ],
    interviewAnswer:
      "HashSet 底层是 HashMap。add 就是把元素当 key 放进去，value 是一个共享的 PRESENT 对象。所以它无序、允许一个 null、平均 O(1) 判断包含。去重完全依赖 hashCode 和 equals。",
  },
  {
    id: "treemap",
    name: "TreeMap",
    jdkInterface: "NavigableMap / SortedMap",
    kind: "Map",
    category: "集合",
    module: "集合",
    moduleRole:
      "HashMap 的「排序」变体。不再走哈希，主链换成比较 + 红黑树旋转。需要范围查询时才轮到它。",
    prereqs: ["hashmap"],
    next: [],
    spineTitle: "一次 put 在红黑树上走到底",
    spine: [
      {
        label: "put(key, value)",
        why: "入口和 HashMap 一样，但定位不靠 hash，靠比较。",
        body: "没有数组桶。从根出发，每次跟当前节点比大小，小的走左、大的走右，直到空位或命中相同 key。",
      },
      {
        label: "Comparator / Comparable",
        why: "谁大谁小必须有总序，否则树建不起来。",
        body: "构造时传入 Comparator 就用它；否则 key 必须实现 Comparable。null key 在自然排序时不允许。比较器和 equals 最好一致，否则 Set/Map 契约会乱。",
      },
      {
        label: "插入叶子",
        why: "命中相同 key 就换 value；否则挂到空指针上。",
        body: "这一步之后树可能不再平衡，需要靠颜色和旋转拉回来。查找、插入、删除都是 O(log n)，没有 HashMap 那种平均 O(1)。",
      },
      {
        label: "染色 + 旋转",
        why: "红黑树保证最长路径不会比最短路径长太多。",
        body: "黑高近似平衡，所以最坏也是对数。面试不用手推所有 case，要能说：有序、范围查询、稳定 O(log n)，用它；只要快、不要顺序，用 HashMap。",
      },
      {
        label: "中序遍历 = 有序 key",
        why: "这是选 TreeMap 的唯一正当理由。",
        body: "headMap / tailMap / subMap 是视图。能做「大于 k 的下一个」这类 Navigable 操作。不要为了「稳」用它替换 HashMap。",
      },
    ],
    oneLiner: "按 key 排序的红黑树 Map。查找插入都是 O(log n)。能做范围查询。",
    analogy:
      "像按学号排好的花名册：不一定最快，但永远是有序的。给你一个学号，可以问「大于它的下一个是谁」。",
    structure: "红黑树。每个 Entry 有 left、right、parent、color",
    ordered: "按 key 排序（自然顺序或 Comparator）",
    threadSafe: "不安全",
    nullKey: "不允许（自然排序时）",
    nullValue: "允许",
    defaultCapacity: "没有哈希容量，树有多少节点就是多少",
    time: {
      get: "O(log n)",
      add: "O(log n)",
      remove: "O(log n)",
      contains: "O(log n)",
      iterate: "O(n)，中序遍历，有序",
      note: "稳定的对数时间，没有 HashMap 那种平均 O(1)。",
    },
    highlights: [
      "key 必须能比大小：实现 Comparable，或构造时传入 Comparator",
      "相等看 compare 结果是不是 0，不完全看 equals",
      "支持 ceilingKey、floorKey、subMap、firstKey、lastKey",
      "自然排序时 key 不能为 null（一比较就 NPE）",
      "并发有序 Map 用 ConcurrentSkipListMap",
    ],
    internals: [
      {
        title: "红黑树保证什么",
        body: "它是自平衡二叉搜索树。最长路径不会比最短路径长太多，所以 get/put/remove 都是 O(log n)，不会退化成链表。",
      },
      {
        title: "比较器优先于 Comparable",
        body: "构造 TreeMap(comparator) 时全程用这个比较器。无参构造则用 key 的 compareTo。两种方式决定了「谁更大」，也就决定了顺序。",
      },
      {
        title: "compare 和 equals 最好一致",
        body: "TreeMap 认为 compare==0 就是同一个 key。若 compare 和 equals 打架（两个对象 equals 为 true 但 compare 不为 0，或反过来），Set/Map 契约会被破坏，表现为「放不进去」或「看起来重复」。",
      },
      {
        title: "范围视图",
        body: "subMap、headMap、tailMap 返回的是视图。改视图会改原树。适合「取 100 到 200 之间的 key」。",
      },
    ],
    pitfalls: [
      "key 没有实现 Comparable 又没传 Comparator，put 时 ClassCastException。",
      "可变 key 改了排序字段，树会乱，元素可能丢失。",
      "不要用 TreeMap 替代 HashMap 追求「稳」——不需要顺序时它更慢。",
    ],
    useWhen: [
      "必须按 key 排序输出",
      "需要前驱、后继、范围查询",
      "实现简易的时间轴、排行、区间统计",
    ],
    avoidWhen: [
      "只是普通缓存/查找（HashMap 更快）",
      "多线程写（ConcurrentSkipListMap）",
      "key 无法比较",
    ],
    code: {
      title: "排序和范围查询",
      source: `TreeMap<Integer, String> map = new TreeMap<>();
map.put(3, "c");
map.put(1, "a");
map.put(2, "b");
// 遍历 key 一定是 1, 2, 3

map.ceilingKey(2);     // >= 2 的最小 key → 2
map.higherKey(2);      // > 2 → 3
map.floorKey(2);       // <= 2 → 2
map.subMap(1, 3);      // [1, 3) → 1, 2

// 自定义倒序
Map<Integer, String> desc = new TreeMap<>(Comparator.reverseOrder());`,
    },
    vs: [
      {
        other: "HashMap",
        point: "HashMap 无序平均 O(1)；TreeMap 有序 O(log n)。要不要顺序是选型第一问。",
      },
      {
        other: "LinkedHashMap",
        point: "LinkedHashMap 是插入顺序或访问顺序，不是 key 的大小顺序。",
      },
      {
        other: "ConcurrentSkipListMap",
        point: "TreeMap 的并发对应物，跳表实现，同样有序且线程安全。",
      },
    ],
    interviewAnswer:
      "TreeMap 底层是红黑树，key 有序。put/get/remove 都是 O(log n)。key 必须可比较。它适合排序和范围查询，不适合当普通高性能字典。注意：它用 compare 判断 key 是否相同，compare 和 equals 要一致。",
  },
  {
    id: "linkedhashmap",
    name: "LinkedHashMap",
    jdkInterface: "Map（继承 HashMap）",
    kind: "Map",
    category: "集合",
    module: "集合",
    moduleRole:
      "HashMap 的「顺序」变体。查找仍走哈希主链，外面再加一条时间线。accessOrder + removeEldestEntry 就是 LRU。",
    prereqs: ["hashmap"],
    next: [],
    spineTitle: "HashMap 定位之后，再走一条链表",
    spine: [
      {
        label: "put / get 走 HashMap",
        why: "查找仍是平均 O(1)，结构仍是数组 + 链表/树。",
        body: "继承 HashMap，扰动、定位、冲突、树化、resize 全部一样。多出来的只是 Entry 上的 before/after。",
      },
      {
        label: "链到双向链表尾",
        why: "默认记住插入顺序。新节点挂到尾巴。",
        body: "afterNodeInsertion。遍历走这条链表，所以顺序稳定，不像 HashMap 扫桶。",
      },
      {
        label: "accessOrder 则移到尾",
        why: "改成访问顺序后，最近用过的永远在尾巴，最久没用的在头。",
        body: "构造传入 true。get/put 已存在的 key 会 afterNodeAccess，把节点挪到尾。这是 LRU 的「最近」定义。",
      },
      {
        label: "removeEldestEntry 删头",
        why: "插入之后问一句：要不要淘汰最老的。",
        body: "重写这个方法，size 超过上限就返回 true，头节点被删。线程不安全，真正的缓存还要考虑并发和过期。",
      },
    ],
    oneLiner: "带双向链表的 HashMap。默认记住插入顺序，也可改成访问顺序，常用来做 LRU。",
    analogy:
      "快递柜外面再加一条绳子，按放进去的先后把格子串起来。如果改成「每次取件就把这个格子挪到绳子末尾」，最久没人碰的就在绳子最前面，可以当 LRU 淘汰。",
    structure: "HashMap 的数组+链表/树，再加上 Entry 的 before/after 双向链表",
    ordered: "插入顺序（默认）或访问顺序（accessOrder=true）",
    threadSafe: "不安全",
    nullKey: "允许 1 个 null key",
    nullValue: "允许",
    defaultCapacity: "同 HashMap：16 / 0.75",
    time: {
      get: "平均 O(1)；accessOrder 时 get 会把节点移到链表末尾",
      add: "平均 O(1)",
      remove: "平均 O(1)",
      contains: "平均 O(1)",
      iterate: "O(元素数)，按链表顺序，不扫空桶",
      note: "遍历比 HashMap 更稳、通常也更省，因为按链表走而不是扫整个表。",
    },
    highlights: [
      "继承 HashMap，所以哈希、树化、扩容规则都一样",
      "多了一条双向链表维护顺序",
      "accessOrder=true 时，get/put 已存在的 key 会挪到最末尾（最近使用）",
      "重写 removeEldestEntry 就能做固定容量 LRU 缓存",
      "迭代顺序可预测，这是和 HashMap 最直观的差别",
    ],
    internals: [
      {
        title: "两种顺序",
        body: "accessOrder=false（默认）：谁先 put 谁在前面，之后再 put 同一个 key 只改值，不改位置。accessOrder=true：每次访问（get、put 已存在的 key）都会把该节点移到链表尾，头就是最久未使用。",
      },
      {
        title: "LRU 怎么写",
        body: "构造 new LinkedHashMap<>(cap, 0.75f, true)，重写 removeEldestEntry：当 size>最大容量时返回 true，自动删链表头。这是面试默写题。",
      },
      {
        title: "afterNodeAccess / afterNodeInsertion",
        body: "HashMap 在 put/get 后会回调这几个空方法。LinkedHashMap 覆盖它们来维护链表和淘汰。这是「为什么能继承 HashMap 还能保序」的源码答案。",
      },
    ],
    pitfalls: [
      "accessOrder 模式下，get 也是结构性变化，迭代时调用 get 可能触发 ConcurrentModificationException。",
      "它不是线程安全的 LRU。并发缓存用 Caffeine 等，或自己加锁。",
      "只要顺序、不要淘汰时，别把 accessOrder 打开，否则 get 会多一次链表移动。",
    ],
    useWhen: [
      "需要可预测的插入顺序",
      "实现简易 LRU",
      "既要 O(1) 查找，又要按放入顺序遍历",
    ],
    avoidWhen: [
      "需要按 key 值排序（那是 TreeMap）",
      "多线程缓存",
      "完全不关心顺序（HashMap 更简单）",
    ],
    code: {
      title: "插入顺序与 LRU",
      source: `// 1. 插入顺序
Map<String, Integer> insert = new LinkedHashMap<>();
insert.put("b", 2);
insert.put("a", 1);
insert.put("c", 3);
// 遍历：b, a, c

// 2. LRU：最多保留 3 个
Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > 3;
    }
};
lru.put("a", 1);
lru.put("b", 2);
lru.put("c", 3);
lru.get("a");      // a 变成最近使用
lru.put("d", 4);   // 淘汰最久未用的 b`,
    },
    vs: [
      {
        other: "HashMap",
        point: "HashMap 无序、遍历扫表；LinkedHashMap 保序、遍历走链表，多两个指针的内存。",
      },
      {
        other: "TreeMap",
        point: "TreeMap 按 key 大小排序；LinkedHashMap 按时间线（插入或访问）排序。",
      },
      {
        other: "LinkedHashSet",
        point: "LinkedHashSet 内部就是 LinkedHashMap，对应「保序的 Set」。",
      },
    ],
    interviewAnswer:
      "LinkedHashMap 继承 HashMap，用双向链表记住顺序。默认是插入顺序；构造时 accessOrder=true 变成访问顺序。重写 removeEldestEntry 可以做 LRU。查找仍是平均 O(1)。线程不安全。",
  },
  {
    id: "generics",
    name: "泛型",
    jdkInterface: "JDK 5 · <T> / 通配符",
    kind: "类型系统",
    category: "语言特性",
    module: "类型系统",
    moduleRole:
      "类型系统的入口。后面所有 List<E>、Map<K,V>、Stream<T>、Optional<T> 都从这里开始。擦除是下一篇，不是另一套东西。",
    prereqs: [],
    next: ["type-erasure"],
    spineTitle: "从写出 <T> 到交给擦除",
    spine: [
      {
        label: "声明 <T>",
        why: "把「盒子里是什么」写成类型参数，而不是注释。",
        body: "类、接口、方法都能带。常见名字：E 元素、K/V 键值、T 任意。钻石操作符 new ArrayList<>() 让编译器推断右边。不能写基本类型，要用 Integer。",
      },
      {
        label: "编译期检查",
        why: "add(1) 进 List<String> 直接编译失败，不必等到运行时 ClassCastException。",
        body: "类型安全是编译期契约。List<String> 不是 List<Object> 的子类：否则塞进去一个整数，标签就撒谎了。泛型不变，数组协变。",
      },
      {
        label: "PECS 通配符",
        why: "有时只想读、有时只想写，要用 extends / super 收窄。",
        body: "往外取用 <? extends T>，往里放用 <? super T>。拷贝签名：copy(List<? extends T> src, List<? super T> dest)。只出现一次用 ?，既当参数又当返回值用 <T>。",
      },
      {
        label: "交给类型擦除",
        why: "源码里的 T 不会原样留到运行时。下一页专门讲落地。",
        body: "所以不能 new T()、不能靠 List<String> / List<Integer> 做重载。先把用法讲清楚，再回答「运行时还有没有 T」。",
      },
    ],
    oneLiner: "把「这个盒子里装什么」写成类型参数。编译期帮你检查，少写强转，也少 ClassCastException。",
    analogy:
      "快递箱上贴标签：<String> 只收信件，<Integer> 只收数字。贴错了寄件处（编译器）直接拦下，不会等到收件人打开才发现装错了。",
    structure: "类型参数出现在类、接口、方法上：List<E>、Map<K,V>、static <T> T id(T t)。运行时大部分会被擦掉。",
    ordered: "编译期检查",
    threadSafe: "—",
    nullKey: "类型参数不能是 int/long 等基本类型",
    nullValue: "—",
    defaultCapacity: "JDK 5 引入；JDK 7 钻石操作符 <>",
    time: {
      get: "编译期类型检查，无额外查找代价",
      add: "—",
      remove: "—",
      contains: "—",
      iterate: "—",
      note: "泛型是语言机制，不是容器。真正的存取速度看后面的 ArrayList / HashMap。",
    },
    facts: [
      { label: "引入", value: "JDK 5" },
      { label: "作用时机", value: "主要在编译期" },
      { label: "基本类型", value: "不行，用包装类" },
      { label: "核心收益", value: "类型安全 + 少强转" },
    ],
    highlights: [
      "常见参数名：E 元素、K/V 键值、T 任意类型、N 数字",
      "钻石操作符：new ArrayList<>()，右边的实参交给编译器推断",
      "上界 <? extends T> 只能取、不能随便放；下界 <? super T> 适合放",
      "PECS：Producer Extends，Consumer Super",
      "泛型方法 <T> 的 T 和方法所在类的 T 不是一回事",
    ],
    internals: [
      {
        title: "它解决的是强转和类型事故",
        body: "没有泛型时 List 里全是 Object，取出来自己 (String) 强转，错了就运行时炸。有了 List<String>，add(1) 编译就过不了。类型安全是编译期契约，不是运行时多了一层盒子。",
      },
      {
        title: "PECS 怎么记",
        body: "要从集合里「生产」数据（get、遍历）用 <? extends T>：可以当 T 来读，但不能 add（除了 null）。要往集合里「消费」数据（put、add）用 <? super T>：可以放 T 及其子类，读出来只能当 Object。拷贝函数的经典签名：copy(List<? extends T> src, List<? super T> dest)。",
      },
      {
        title: "类上的 T 和方法上的 <T> 别混",
        body: "class Box<T> 的 T 是实例级的。public static <T> T first(List<T> list) 这个 T 只属于这一次调用，和类上的类型参数无关。工具方法几乎都写成泛型方法，这样调用处能根据参数推断。",
      },
      {
        title: "通配符和类型参数怎么选",
        body: "只出现一次、只关心「和 T 的继承关系」时用通配符，例如 void print(List<?> list)。既要当参数又要当返回值、或方法体里要用这个类型时，声明 <T>。List<?> 不是 List<Object>：前者几乎不能 add，后者什么都能塞（除了基本类型）。",
      },
    ],
    pitfalls: [
      "不能写 new T()、不能 new T[]，也不能用 T 当 catch 的异常类型。根因都是类型擦除。",
      "List<String> 不是 List<Object> 的子类。否则 listObject.add(1) 会把整数塞进「号称只装 String」的列表。",
      "原始类型 List 能编译但会警告。新代码不要用 raw type，等于主动关掉泛型检查。",
      "泛型数组几乎不要自己造。array 是协变的，泛型是不变的，混在一起容易堆污染。",
    ],
    useWhen: [
      "集合、缓存、工具方法要表达「里面是什么类型」",
      "同一套算法要套在多种类型上（排序、拷贝、装箱）",
      "API 想在编译期拦住错误的 add/get",
    ],
    avoidWhen: [
      "需要运行时知道 T 到底是谁（得额外传 Class<T> 或用 super type token）",
      "想用 int[] 那种基本类型数组的性能时，改走 IntStream / 特化集合",
    ],
    code: {
      title: "通配符拷贝 + 泛型方法",
      source: `// PECS：src 是生产者，dest 是消费者
static <T> void copy(List<? extends T> src, List<? super T> dest) {
    for (T item : src) {
        dest.add(item);
    }
}

List<Integer> nums = List.of(1, 2, 3);
List<Number> box = new ArrayList<>();
copy(nums, box); // Integer 是 Number 的子类，合法

static <T extends Comparable<T>> T max(List<T> list) {
    return list.stream().max(Comparable::compareTo).orElseThrow();
}`,
    },
    vs: [
      {
        other: "类型擦除",
        point: "泛型是你在源码里写的契约；擦除是编译器落到字节码时把 T 抹掉。面试这两问经常连着出。",
      },
      {
        other: "Object + 强转",
        point: "都能装任意对象，但 Object 把检查推迟到运行时。泛型把大部分错误提前到编译期。",
      },
      {
        other: "数组",
        point: "String[] 可以当成 Object[] 传（协变），运行时可能 ArrayStoreException。List<String> 不能当成 List<Object>（不变），更安全。",
      },
    ],
    interviewAnswer:
      "泛型是 JDK 5 的类型参数，让 List<String> 在编译期就能拦住 add(1)。它不改变运行时结构，真正存的还是对象引用。通配符记 PECS：往外取用 extends，往里放用 super。不能用基本类型当类型参数，要用 Integer。和类型擦除一起答：源码有 T，字节码里大部分没了。",
  },
  {
    id: "type-erasure",
    name: "类型擦除",
    jdkInterface: "编译器策略 · Signature 属性",
    kind: "类型系统",
    category: "语言特性",
    module: "类型系统",
    moduleRole:
      "泛型的落地策略，不是另一个特性。主链回答：T 去哪了、编译器补了什么、运行时为什么有那些限制。",
    prereqs: ["generics"],
    next: ["functional-interface"],
    spineTitle: "T 从源码走到字节码",
    spine: [
      {
        label: "源码里的 T",
        why: "编译期检查已经做完。下一步是生成能在旧 JVM 上跑的字节码。",
        body: "为了兼容 JDK 5 之前的原始类型，Java 选择擦除而不是像 C++ 那样每个类型一份代码。",
      },
      {
        label: "擦成 Object 或上界",
        why: "无界 T 变成 Object；<T extends Number> 变成 Number。",
        body: "所以 List<String> 和 List<Integer> 运行时是同一个类。instanceof List<String> 不合法。",
      },
      {
        label: "取值处插入强转",
        why: "你源码里不用写 (String)，字节码里有 checkcast。",
        body: "这就是「编译期安全、运行时仍是对象引用」的衔接。get 出来能当 String 用，靠的是编译器插入的转换。",
      },
      {
        label: "必要时生成桥接方法",
        why: "父类擦成 Object 后，子类那份 compareTo(Integer) 对不上擦后签名。",
        body: "javac 再生成 compareTo(Object) 去转调真正的方法。反编译常能看见 synthetic bridge。",
      },
      {
        label: "运行时限制",
        why: "机器已经不知道 T 是谁。",
        body: "不能 new T()、不能 new T[]、不能靠泛型参数重载。类文件 Signature 里还留着信息，反射能读到，但 instanceof 看不到。堆污染往往到下一次强转才炸。",
      },
    ],
    oneLiner: "泛型几乎只活在编译期。编译完 T 会被擦成 Object 或上界，运行时 List<String> 和 List<Integer> 是同一个类。",
    analogy:
      "试卷密封条上写着「英语 / 数学」，进阅卷机之前标签被撕掉，机器只看到「一份试卷」。检查是入场前做的，机子里面不再区分科目。",
    structure: "无界 T → Object；<T extends Number> → Number。编译器在取值处插入强转，必要时生成桥接方法。",
    ordered: "编译期可见，运行时擦掉",
    threadSafe: "—",
    nullKey: "运行时拿不到 T 的具体类（除非自己传 Class<T>）",
    nullValue: "—",
    defaultCapacity: "和泛型一起出现于 JDK 5",
    time: {
      get: "取值处由编译器插入 checkcast",
      add: "—",
      remove: "—",
      contains: "—",
      iterate: "—",
      note: "擦除是为了兼容 JDK 5 之前的原始类型字节码，不是为了更快。",
    },
    facts: [
      { label: "擦成什么", value: "Object 或上界" },
      { label: "运行时", value: "看不到 T" },
      { label: "典型后果", value: "不能 new T()" },
      { label: "反射", value: "类文件 Signature 里还留着" },
    ],
    highlights: [
      "List<String> 和 List<Integer> 运行时 class 相同",
      "不能重载 foo(List<String>) 和 foo(List<Integer>)，擦完签名一样",
      "instanceof List<String> 不合法，只能 instanceof List",
      "桥接方法：父类擦成 Object 后，子类要再生成一个转调真实方法的合成方法",
      "反射 getGenericReturnType() 仍能读到签名，因为类文件里留了 Signature",
    ],
    internals: [
      {
        title: "擦到哪儿去了",
        body: "无界或 ? 擦成 Object。<T extends Number> 擦成 Number。多个上界取第一个。编译器在 get 之后插入 (String) 这类强转，所以你源码里不用写，字节码里有。",
      },
      {
        title: "为什么不能 new T() / new T[]",
        body: "运行时根本不知道 T 是谁，没法选构造器、没法 new 对应数组。要造实例就得额外传 Class<T>，用 clazz.getDeclaredConstructor().newInstance()。泛型数组官方建议用 List<T>，或 Array.newInstance。",
      },
      {
        title: "桥接方法是干什么的",
        body: "父类 Comparable<Integer> 擦完 compareTo 参数变成 Object。子类写的是 compareTo(Integer)。JVM 按擦后的签名调用时，需要一个 compareTo(Object) 去转调 compareTo(Integer)。这个合成方法就是 bridge method，javac 自动生成。",
      },
      {
        title: "堆污染 Heap Pollution",
        body: "用原始类型或错误的强转，可能把 Integer 塞进 List<String>。编译期警告，运行时不一定立刻炸，往往在下一次 get 强转时才 ClassCastException。可变参数 T... 也容易引出这个问题，所以有 @SafeVarargs。",
      },
    ],
    pitfalls: [
      "别指望运行时 if (list instanceof List<String>)。语法就不让。",
      "反射 newInstance 出来的集合是原始类型，泛型检查帮不上忙。",
      "重载不能靠泛型参数区分，编译器会报擦除后冲突。",
      "类型擦除 ≠ 信息全部消失：方法/字段的 Signature、局部变量表里仍可能看到泛型，所以框架能用反射做注入。",
    ],
    useWhen: [
      "面试被追问「泛型运行时还在吗」",
      "解释为什么不能写泛型数组、不能靠泛型做重载",
      "看懂反编译后的强转和 bridge 方法",
    ],
    avoidWhen: [
      "把它说成「泛型没用」。擦除的是参数，编译期检查仍然在。",
      "用擦除当借口写 raw type。新代码没有理由退回 List。",
    ],
    code: {
      title: "擦除后两个 List 是同一个类",
      source: `List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass()); // true

// 下面这种重载编译失败：擦完都是 foo(List)
// void foo(List<String> x) {}
// void foo(List<Integer> x) {}

@SuppressWarnings("unchecked")
static <T> T[] newArray(Class<T> type, int n) {
    return (T[]) Array.newInstance(type, n); // 必须把 Class 传进来
}`,
    },
    vs: [
      {
        other: "泛型",
        point: "泛型是语法和检查；擦除是落地策略。先说「编译期有 T」，再补「运行时擦成 Object/上界」。",
      },
      {
        other: "C++ 模板",
        point: "C++ 每个类型实例化一份代码（膨胀）。Java 一份字节码走天下，靠擦除 + 强转，所以能兼容老 class。",
      },
      {
        other: "reified 泛型（如 Kotlin 的 inline + reified）",
        point: "有的语言运行时还留着 T。Java 默认没有，除非你自己把 Class<T> 当参数传来传去。",
      },
    ],
    interviewAnswer:
      "Java 泛型是擦除实现的：无界 T 变成 Object，有上界就变成上界。所以 List<String> 和 List<Integer> 运行时是同一个类，不能 new T()，也不能靠 List<String>/List<Integer> 做重载。编译器会在取值处插入强转，继承场景还会生成桥接方法。类文件的 Signature 属性里还留着泛型信息，反射能读到，但 instanceof 看不到。",
  },
  {
    id: "stream",
    name: "Stream",
    jdkInterface: "java.util.stream.Stream",
    kind: "函数式",
    category: "语言特性",
    module: "函数式",
    moduleRole:
      "函数式这条线的收口：把接口、Lambda、Optional 串成一条数据处理流水线。集合的 stream() 从这里接出去。",
    prereqs: ["lambda", "optional", "generics"],
    next: ["arraylist"],
    spineTitle: "一条流水线从挂上到拆掉",
    spine: [
      {
        label: "source",
        why: "Stream 不存数据，只是从集合/数组/生成器上接出来。",
        body: "list.stream()、Arrays.stream、Stream.of。源集合在计算期间被修改，结果未定义。",
      },
      {
        label: "挂上中间操作",
        why: "filter / map / flatMap / distinct / sorted / limit 只是记下工序，不遍历。",
        body: "返回 Stream，懒。没有终端操作，整条链空转。peek 里提前打 log 往往什么都看不到。",
      },
      {
        label: "终端操作触发",
        why: "collect / forEach / reduce / findFirst / anyMatch 按下才开工。",
        body: "多个中间操作融合进一次遍历，不是 filter 扫一遍再 map 扫一遍。findFirst、anyMatch、limit 可以短路。findFirst 返回 Optional，接到上一块。",
      },
      {
        label: "流作废",
        why: "一条流水线用完即拆，不能再跑第二批。",
        body: "再调会 IllegalStateException。要再用就重新 stream()。parallel() 走公共 ForkJoinPool，不是默认加速。",
      },
    ],
    oneLiner: "不是新集合。它是一条流水线：数据源 → 中间操作（懒）→ 终端操作（真正跑）。",
    analogy:
      "工厂流水线。零件放上传送带之后，切割、喷漆这些工序只是挂着；直到最后装箱（collect/forEach）按钮按下，整条线才开始转。而且这条线用完就拆，不能再跑第二批。",
    structure: "source（集合/数组/生成器）+ 中间操作链 + 终端操作。内部用 Spliterator 拆分，并行时走 ForkJoinPool。",
    ordered: "看数据源。List 有遭遇顺序，HashSet 没有",
    threadSafe: "流水线本身不负责并发安全",
    nullKey: "元素里的 null 要自己小心，容易 NPE",
    nullValue: "—",
    defaultCapacity: "JDK 8 引入",
    time: {
      get: "无随机访问；查找靠 filter/find",
      add: "不负责存储",
      remove: "filter 是视图，不改源集合",
      contains: "anyMatch / noneMatch，可短路",
      iterate: "终端操作时走一遍，中间操作可融合",
      note: "多数是 O(n)。limit/findFirst/anyMatch 可能短路。并行不是自动变快。",
    },
    facts: [
      { label: "引入", value: "JDK 8" },
      { label: "求值", value: "中间惰性，终端才跑" },
      { label: "复用", value: "一条 Stream 只能消费一次" },
      { label: "并行", value: "parallel，默认 commonPool" },
    ],
    highlights: [
      "中间操作：filter / map / flatMap / distinct / sorted / peek / limit / skip，返回 Stream，懒",
      "终端操作：collect / forEach / reduce / count / findFirst / anyMatch，触发计算，之后流废掉",
      "短路：findFirst、anyMatch、limit 可以不用跑完全部元素",
      "map 一对一，flatMap 一对多再摊平（比如 List<List<T>> → Stream<T>）",
      "Collectors：toList、toMap、groupingBy、joining、partitioningBy 最常考",
    ],
    internals: [
      {
        title: "为什么说中间操作是懒的",
        body: "stream().filter(...).map(...) 只是记下要做什么，没有遍历。遇到 collect/forEach 才从数据源拉元素。多个中间操作会融合进一次遍历，不是 filter 扫一遍再 map 扫一遍。所以在终端操作前加 log，peek 里什么都看不到。",
      },
      {
        title: "遇到终端操作才执行",
        body: "没有终端操作，整条链是空转。有副作用的逻辑不要只写在 map 里还不 collect——可能根本没跑。反过来，终端操作后 stream 不能再用，再调会 IllegalStateException。",
      },
      {
        title: "parallel() 不是加速按钮",
        body: "并行流拆任务丢进 ForkJoinPool.commonPool()（JDK 8）。数据量大、纯 CPU、无共享状态才可能更快。有 IO、有共享变量、数据量很小，往往更慢还更难查。forEach 并行时顺序乱掉，要保序用 forEachOrdered。线程池是公共的，别在里面再阻塞等锁。",
      },
      {
        title: "和集合的关系",
        body: "Stream 不存储。源集合在流计算期间被修改，结果未定义。想改源集合，用集合自己的 removeIf，或先 collect 成新集合。int 场景优先 mapToInt，避免反复装箱。",
      },
    ],
    pitfalls: [
      "一条 Stream 用两次会炸。要再用就重新 stream()。",
      "peek 是调试用的，别把业务副作用放进去当正式逻辑。",
      "collect(Collectors.toMap(...)) 遇到重复 key 会直接抛异常，要传 mergeFunction。",
      "并行流里改共享 ArrayList 会丢数据。无状态、无共享才并行。",
    ],
    useWhen: [
      "过滤、映射、分组、拼接，链路清晰",
      "想写声明式代码，而不是一层层 for",
      "distinct / groupingBy / joining 这类用循环很啰嗦的场景",
    ],
    avoidWhen: [
      "循环体很复杂、要多次 break/continue/改外部状态——老老实实 for",
      "超大 IO 或共享可变状态还开 parallel",
      "只是简单遍历打印，for-each 更直白",
    ],
    code: {
      title: "过滤映射分组，以及 toMap 处理重复 key",
      source: `List<String> names = List.of("bob", "alice", "amy", "bob");

List<String> result = names.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .distinct()
    .sorted()
    .collect(Collectors.toList());

Map<Integer, List<String>> byLen = names.stream()
    .collect(Collectors.groupingBy(String::length));

Map<String, Integer> lenMap = names.stream()
    .collect(Collectors.toMap(
        s -> s,
        String::length,
        (oldVal, newVal) -> oldVal)); // 重复 key 留下一个`,
    },
    vs: [
      {
        other: "for 循环",
        point: "for 好调试、好改外部变量。Stream 好表达「过滤再映射再收集」。性能多数同一量级，别神话。",
      },
      {
        other: "Lambda",
        point: "Stream 的参数几乎都是函数式接口，所以才会写成 s -> s.length() > 3。先懂 Lambda，Stream 才写得顺。",
      },
      {
        other: "Optional",
        point: "findFirst/findAny 返回 Optional，提醒你「可能一个都没有」，别直接 get。",
      },
    ],
    interviewAnswer:
      "Stream 是 JDK 8 的数据处理流水线，不是容器。中间操作懒执行，终端操作才真正遍历，而且一条流只能用一次。filter/map/collect 最常用；flatMap 用来摊平。并行流走公共 ForkJoinPool，只适合无状态的 CPU 密集任务，面试里要主动说「不是默认就更快」。",
  },
  {
    id: "lambda",
    name: "Lambda",
    jdkInterface: "JDK 8 · 箭头函数",
    kind: "函数式",
    category: "语言特性",
    module: "函数式",
    moduleRole:
      "函数式接口这个插头上的电器。没有 SAM 无处安放；有了它才能写 Stream 和 Optional 的参数。",
    prereqs: ["functional-interface"],
    next: ["optional", "stream"],
    spineTitle: "从目标类型到 invokedynamic",
    spine: [
      {
        label: "目标类型必须是 SAM",
        why: "箭头不是随便写的闭包，要插进函数式接口。",
        body: "Object o = () -> 1 编译不过。Predicate<String> p = s -> s.isEmpty() 可以。同一段箭头，赋给不同接口是不同东西。",
      },
      {
        label: "写箭头或方法引用",
        why: "方法引用是更短的 lambda，要求已有方法签名对得上。",
        body: "Integer::parseInt、obj::toString、String::length、User::new。能用 :: 就别硬写箭头。this 指向外层类，不是匿名类自己。",
      },
      {
        label: "捕获 effectively final",
        why: "局部变量在栈上，lambda 可能晚点执行甚至换线程。",
        body: "编译器把值拷进 lambda。后面再给这个变量赋值就不合法。成员变量没这个限制，因为拷的是 this。",
      },
      {
        label: "invokedynamic 链接",
        why: "不是编译期生成 YourClass$1。",
        body: "javac 放 invokedynamic，启动时 LambdaMetafactory 再绑。所以「lambda 就是匿名内部类缩写」是错的。第一次调用稍慢，之后接近普通调用。",
      },
    ],
    oneLiner: "把「一段行为」写成 (参数) -> 表达式。它必须落到一个函数式接口上，不是随便写的闭包。",
    analogy:
      "以前请人干活要签一整份匿名内部类合同（class 都得写）。现在只需在便利贴上写「看见 x 就返回 x*2」，合同模板（函数式接口）早就印好了。",
    structure: "语法糖 + invokedynamic。编译器根据目标类型生成 LambdaMetafactory 调用，运行时再绑到具体实现。",
    ordered: "—",
    threadSafe: "捕获的变量必须是 effectively final",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 8 引入",
    time: {
      get: "—",
      add: "—",
      remove: "—",
      contains: "—",
      iterate: "—",
      note: "lambda 本身几乎零开销；首次调用 invokedynamic 会链接一次。",
    },
    facts: [
      { label: "引入", value: "JDK 8" },
      { label: "本质", value: "SAM 接口的实例" },
      { label: "捕获", value: "外部变量要 effectively final" },
      { label: "实现", value: "invokedynamic" },
    ],
    highlights: [
      "几种写法：(x) -> x+1、x -> x+1、() -> 1、(a,b) -> { return a+b; }",
      "方法引用：静态 Integer::parseInt、实例 obj::toString、类::实例方法 String::length、构造 User::new",
      "目标类型由左边的函数式接口决定：Predicate、Function、Comparator…",
      "能捕获外层的 local 变量，但这个变量不能再被赋值（effectively final）",
      "lambda 里的 this 是外层类，不是匿名类自己",
    ],
    internals: [
      {
        title: "必须有目标类型",
        body: "Object o = () -> 1; 编译不过，因为 Object 不是函数式接口。Predicate<String> p = s -> s.isEmpty(); 可以，编译器知道要生成 test(String)。同一段箭头，赋给不同接口可以是不同东西。",
      },
      {
        title: "和匿名内部类的三点差别",
        body: "this：lambda 指向外层，匿名类指向自己。字节码：匿名类会多一个 YourClass$1，lambda 默认用 invokedynamic，不一定多 class 文件。语义：lambda 不能给非 SAM 的接口用。面试别说「lambda 就是匿名类的缩写」，底层不是一回事。",
      },
      {
        title: "为什么局部变量要 final",
        body: "局部变量在栈上，lambda 可能晚点才执行，甚至跑到别的线程。编译器实际上是把变量值拷进 lambda 里。如果允许你后面再改这个变量，两边看到的就不一致。成员变量没有这个限制，因为拷的是 this 引用。",
      },
      {
        title: "invokedynamic 一句就够",
        body: "javac 不直接 new 一个实现类，而是放一个 invokedynamic 指令，启动时 LambdaMetafactory 再生成实际调用点。所以第一次调用稍慢，之后和普通调用差不多。这是和匿名内部类「编译期就生成 $1.class」最大的实现差异。",
      },
    ],
    pitfalls: [
      "在循环里捕获 i 再改 i++，编译直接失败。要拷到 final 的 cur = i。",
      "不要把 lambda 写成几十行。超过几行就抽方法，再用 Class::method。",
      "异常：lambda 实现的抽象方法如果没声明 checked exception，你在箭头里不能往外抛，只能内部消化或包成 RuntimeException。",
      "序列化 lambda 很脆，别当 API 的持久化方案。",
    ],
    useWhen: [
      "Comparator、监听器、Stream 操作这种「就一行行为」",
      "想少写匿名内部类的样板代码",
      "方法引用已经能表达意图时优先用 ::",
    ],
    avoidWhen: [
      "逻辑很长、要打断点、要多个方法——写成普通方法更清楚",
      "需要给匿名类加字段、重写多个方法",
    ],
    code: {
      title: "Comparator、方法引用、effectively final",
      source: `list.sort((a, b) -> a.length() - b.length());
list.sort(Comparator.comparingInt(String::length));

Predicate<String> notBlank = s -> s != null && !s.isBlank();
Function<String, Integer> len = String::length;
Supplier<ArrayList<String>> factory = ArrayList::new;

int factor = 2; // 后面不要再给 factor 赋值
list.replaceAll(s -> s.repeat(factor));`,
    },
    vs: [
      {
        other: "函数式接口",
        point: "Lambda 是写法，函数式接口是它能贴上去的「插头」。没有 SAM 接口，箭头函数无处安放。",
      },
      {
        other: "匿名内部类",
        point: "匿名类可以重写多个方法、可以有字段；lambda 只能实现唯一那个抽象方法。this 含义也不同。",
      },
      {
        other: "方法引用",
        point: "方法引用是 lambda 的更短形式，要求已有方法签名和接口抽象方法对得上。",
      },
    ],
    interviewAnswer:
      "Lambda 是 JDK 8 把行为当参数传的写法，目标类型必须是函数式接口。它不是匿名内部类的语法糖：this 指向外层，底层是 invokedynamic。捕获的局部变量必须是 effectively final。能用方法引用就用 Class::method，读起来更像「做什么」而不是「怎么写箭头」。",
  },
  {
    id: "functional-interface",
    name: "函数式接口",
    jdkInterface: "@FunctionalInterface · java.util.function",
    kind: "函数式",
    category: "语言特性",
    module: "函数式",
    moduleRole:
      "函数式这条线的起点。先认插头，再谈 Lambda、Stream、Optional。四大接口对上号，后面的 API 就不用死记。",
    prereqs: ["type-erasure"],
    next: ["lambda"],
    spineTitle: "从「一个抽象方法」到四大接口",
    spine: [
      {
        label: "找出唯一抽象方法",
        why: "这就是 SAM。有且只有一个，lambda 才知道要实现哪一个。",
        body: "default、static、以及覆盖 Object 的 equals 都不算。Comparator 能再写 equals 却仍是函数式接口，原因在这里。",
      },
      {
        label: "@FunctionalInterface 钉死",
        why: "有人再加一个抽象方法，所有 lambda 立刻编译失败。",
        body: "注解可选，但公共 API 应该加。抽象类即使只有一个抽象方法也不能当 lambda 目标类型。",
      },
      {
        label: "对上四大接口",
        why: "看输入输出就能对上 Stream / Optional 的参数。",
        body: "Function 有进有出 → map；Predicate 返回 boolean → filter；Consumer 有进无出 → forEach；Supplier 无进有出 → orElseGet。UnaryOperator 就是 Function<T,T>。",
      },
      {
        label: "才能贴 Lambda",
        why: "插头就绪，下一页才写箭头。",
        body: "compose / andThen / and / or 都是 default 方法，不破坏 SAM。checked exception 这四个接口基本不声明，要抛就自建 SAM。",
      },
    ],
    oneLiner: "有且只有一个抽象方法的接口。Lambda 和 Stream 能跑，全靠它当「插头」。",
    analogy:
      "墙上只留一个插孔的插座。默认方法、静态方法是旁边的 USB，不算插孔。equals 这种 Object 里已经有的方法也不另算。只能插一种插头——那一个抽象方法。",
    structure: "SAM（Single Abstract Method）。JDK 自带 Function / Predicate / Consumer / Supplier 以及 Bi*、*Operator 变体。",
    ordered: "—",
    threadSafe: "接口本身不管线程",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 8 大规模引入；Runnable 更早就符合 SAM",
    time: {
      get: "—",
      add: "—",
      remove: "—",
      contains: "—",
      iterate: "—",
    },
    facts: [
      { label: "定义", value: "只有一个抽象方法" },
      { label: "注解", value: "@FunctionalInterface" },
      { label: "四大", value: "Function / Predicate / Consumer / Supplier" },
      { label: "默认方法", value: "不算抽象方法" },
    ],
    highlights: [
      "四大核心：Function<T,R> 转换、Predicate<T> 判断、Consumer<T> 消费、Supplier<T> 供给",
      "UnaryOperator<T> 就是 Function<T,T>；BinaryOperator<T> 就是 BiFunction<T,T,T>",
      "BiFunction / BiConsumer / BiPredicate 两个参数；还有 ToIntFunction 等避免装箱",
      "@FunctionalInterface 可选，但加上后多写一个抽象方法会编译失败，相当于断言",
      "Comparator、Runnable、Callable、Comparable 都是函数式接口",
    ],
    internals: [
      {
        title: "什么样才算「一个抽象方法」",
        body: "接口里可以有很多 default、static，甚至 private 方法（JDK 9+）。只要抽象方法只剩一个。如果声明 void equals(Object o)，它覆盖的是 Object 的方法，不计入 SAM。这就是 Comparator 除了 compare 还能写 equals 却仍是函数式接口的原因。",
      },
      {
        title: "四大接口怎么记",
        body: "看输入输出：有进有出 → Function；有进返回 boolean → Predicate；有进无出 → Consumer；无进有出 → Supplier。Stream.map 用 Function，filter 用 Predicate，forEach 用 Consumer，Optional.orElseGet 用 Supplier。对上号，API 就不需要死记。",
      },
      {
        title: "compose / andThen / and / or",
        body: "Function 能 andThen、compose 把转换串起来。Predicate 能 and、or、negate。这些都是 default 方法，所以「接口只有一个抽象方法」和「接口很好用」不矛盾。自己写函数式接口时，也可以加这类组合方法。",
      },
      {
        title: "和异常、泛型一起用的坑",
        body: "java.util.function 里的方法基本不声明 checked exception，所以 lambda 里不能直接 throw IOException。包装成 UncheckedIOException，或自己定义带 throws 的 SAM。另外 Function 不能表示「基本类型」，密集计算用 IntFunction / ToIntFunction，少装箱。",
      },
    ],
    pitfalls: [
      "接口里不小心再加一个抽象方法，所有 lambda 立刻编译失败。公共 API 要谨慎，并贴上 @FunctionalInterface。",
      "别为了「函数式」把本来该是两个方法的接口硬缩成一个。",
      "Consumer 有返回值你却写了 Function，编译器不一定按你想的选目标类型，必要时写成显式类型。",
    ],
    useWhen: [
      "API 想接收一段行为（回调、策略、比较器）",
      "给 Stream / Optional / Map.compute 提供目标类型",
      "自己写工具方法，参数用 Function/Predicate 比写一堆重载更通用",
    ],
    avoidWhen: [
      "接口本来就该有多个职责，不要为了 lambda 硬拆",
      "需要抛 checked exception 时，标准四接口不好用，考虑自建 SAM",
    ],
    code: {
      title: "自定义 SAM + 四大接口",
      source: `@FunctionalInterface
interface Converter<F, T> {
    T convert(F from);
    default Converter<F, T> logging() {
        return from -> {
            T to = convert(from);
            System.out.println(from + " -> " + to);
            return to;
        };
    }
}

Predicate<String> startA = s -> s.startsWith("A");
Function<String, Integer> len = String::length;
Consumer<String> print = System.out::println;
Supplier<LocalDate> today = LocalDate::now;
UnaryOperator<String> trim = String::trim;

startA.and(s -> s.length() > 3).test("ABCD");`,
    },
    vs: [
      {
        other: "Lambda",
        point: "函数式接口是插头，Lambda 是插头上的电器。面试先定义 SAM，再举 lambda 例子。",
      },
      {
        other: "普通接口",
        point: "普通接口可以有多个抽象方法，不能用 lambda 实例化。函数式接口恰好一个。",
      },
      {
        other: "抽象类",
        point: "抽象类即使只有一个抽象方法也不能当 lambda 目标类型。必须是接口。",
      },
    ],
    interviewAnswer:
      "函数式接口就是有且只有一个抽象方法的接口，也叫 SAM。default/static 方法和 Object 的方法都不算。JDK 8 的 Function、Predicate、Consumer、Supplier 是核心四个，Stream 几乎全靠它们。@FunctionalInterface 用来防止有人再加抽象方法。Lambda 能写，前提就是目标类型是这种接口。",
  },
  {
    id: "optional",
    name: "Optional",
    jdkInterface: "java.util.Optional<T>",
    kind: "工具类",
    category: "语言特性",
    module: "函数式",
    moduleRole:
      "「0 或 1 个值」的盒子。夹在 Lambda 和 Stream 中间：orElseGet 吃 Supplier，findFirst 吐 Optional。",
    prereqs: ["lambda"],
    next: ["stream"],
    spineTitle: "从装箱到拆箱",
    spine: [
      {
        label: "empty / of / ofNullable",
        why: "先决定盒子是空的还是装着值。of(null) 直接 NPE。",
        body: "不确定用 ofNullable。设计给返回值用：找不到就 empty，不要返回 null。不要当字段、参数、集合元素。",
      },
      {
        label: "map / flatMap / filter",
        why: "值可能没有，变换必须能「空着传下去」。",
        body: "map 把 U 包成 Optional<U>。映射函数自己已返回 Optional 时用 flatMap，否则套娃。filter 不满足就变 empty。",
      },
      {
        label: "orElse / orElseGet / orElseThrow",
        why: "最后必须拆箱。不要 isPresent 再 get，那只是换了个写法的 NPE。",
        body: "orElse(x) 无论空不空都先算 x；orElseGet(supplier) 只在 empty 时才调用。贵的默认值用 orElseGet。没有就该失败时用 orElseThrow。",
      },
      {
        label: "接到 Stream.findFirst",
        why: "Stream 处理 0..n，Optional 处理 0..1。交界就是 findFirst / max / reduce。",
        body: "集合为空返回空列表，不要 Optional<List>。ifPresent 适合副作用；链式取值用 map + orElse。",
      },
    ],
    oneLiner: "「返回值可能没有」的显式盒子。用来逼调用方处理空，不是用来替换所有 null 的。",
    analogy:
      "快递柜格子：可能有件，可能空着。你不能伸手就抓（get），要先看灯（isPresent）或直接说「没有就用备用」（orElse）。别把这个柜子焊在家里当字段——它是拿来当面交给对方的。",
    structure: "内部最多一个 value。empty() 是空盒；of(x) 要求非 null；ofNullable(x) 允许 null 并变成 empty。",
    ordered: "—",
    threadSafe: "不可变；空实例是共享的",
    nullKey: "of(null) 立刻 NPE；ofNullable(null) 是 empty",
    nullValue: "盒子里装的对象仍可以按业务为 null——但那是误用",
    defaultCapacity: "JDK 8 引入；JDK 9 ifPresentOrElse / or / stream",
    time: {
      get: "orElse / orElseGet / orElseThrow",
      add: "map / flatMap 转换",
      remove: "filter 过滤空结果",
      contains: "isPresent / isEmpty（JDK 11）",
      iterate: "stream()（JDK 9）变成 0 或 1 个元素",
      note: "Optional 不是集合。别拿它当 List 的替代品。",
    },
    facts: [
      { label: "引入", value: "JDK 8" },
      { label: "用途", value: "返回值可能为空" },
      { label: "别当", value: "字段 / 方法参数" },
      { label: "取值", value: "orElse / orElseGet，少用 get" },
    ],
    highlights: [
      "工厂：empty、of（禁止 null）、ofNullable",
      "取值：orElse、orElseGet、orElseThrow；get 没有值就 NoSuchElementException",
      "变换：map、flatMap、filter；JDK 9 还有 or、ifPresentOrElse、stream",
      "orElse(x) 每次都先算出 x；orElseGet(supplier) 只在空的时候才算",
      "还有 OptionalInt / OptionalLong / OptionalDouble，避免装箱",
    ],
    internals: [
      {
        title: "它是给返回值用的",
        body: "设计意图：方法可能找不到结果时，用 Optional<User> 代替返回 null，调用方必须面对「没有」这件事。不适合当字段、方法参数、集合元素——那些地方用空集合、空对象或明确的 null 协议更简单，Optional 还多一层包装、序列化也不友好。",
      },
      {
        title: "orElse 和 orElseGet 的差别",
        body: "orElse(defaultValue) 不管盒子空不空，参数都会先求值。defaultValue 如果是一次查询、一次 new 大对象，就浪费了。orElseGet(() -> load()) 只在 empty 时才调用。面试常挖这个坑。",
      },
      {
        title: "map 和 flatMap",
        body: "map 把 U 包成 Optional<U>。如果映射函数自己已经返回 Optional，再用 map 会变成 Optional<Optional<U>>，这时要用 flatMap 摊平。链式 user.map(User::getAddress).flatMap(Address::getCity) 很常见。",
      },
      {
        title: "别和 Stream 抢活",
        body: "集合可能为空就返回空列表，不要返回 Optional<List>。Stream.findFirst() 才返回 Optional，因为「第一个元素」确实可能没有。判断存在用 isPresent 可以，但更地道的是 ifPresent / orElseGet，少写 if (opt.get()) 这种拆盒。",
      },
    ],
    pitfalls: [
      "Optional.of(null) 直接 NPE。不确定时用 ofNullable。",
      "isPresent() 然后 get() 等于把空指针检查换了个写法，没有收益。",
      "不要用 Optional 包集合、不要当 Map 的 value、不要序列化进实体字段。",
      "orElse(getFromDb()) 每次都会打数据库；空值默认值请用 orElseGet。",
    ],
    useWhen: [
      "查询方法：找不到用户 / 配置 / 缓存时的返回值",
      "Stream.findFirst、max、reduce 的结果",
      "链式从 A 取 B 再取 C，中间可能断（map/flatMap）",
    ],
    avoidWhen: [
      "方法参数（调用方还得先包一层，没意义）",
      "实体字段、DTO、RPC 返回（序列化、JSON 都别扭）",
      "本来就可以返回空集合 / 空数组 / Optional 以外的空对象",
    ],
    code: {
      title: "ofNullable、map、orElseGet",
      source: `Optional<User> user = findUser(id);

String name = user
    .map(User::getName)
    .filter(s -> !s.isBlank())
    .orElse("匿名");

User fallback = user.orElseGet(this::loadGuest); // 只在空时才 loadGuest
User must = user.orElseThrow(() -> new NotFoundException(id));

user.ifPresent(u -> cache.put(id, u));

// 错：Optional.of(null)
// 错：user.get() 当正常路径`,
    },
    vs: [
      {
        other: "null",
        point: "null 是默认值也是炸弹。Optional 把「可能没有」写进类型，但代价是多一层对象，所以只放在返回值。",
      },
      {
        other: "Stream",
        point: "Stream 处理 0..n 个元素；Optional 处理 0..1 个。findFirst 是两者的交界。",
      },
      {
        other: "空对象模式",
        point: "如果「没有用户」时行为很明确（游客），返回 GuestUser 可能比 Optional 更顺。Optional 适合调用方必须自己决定没有时怎么办。",
      },
    ],
    interviewAnswer:
      "Optional 用来表示返回值可能为空，逼调用方用 orElse / orElseGet / orElseThrow / ifPresent 处理，而不是默默 NPE。of 不允许 null，不确定用 ofNullable。orElse 参数总会算，贵的默认值用 orElseGet。它不是 null 的全面替代品：不要当字段、不要当参数、不要包集合。",
  },
];

export const collectionTopics = collections.filter((item) => item.module === "集合");
export const typeTopics = collections.filter((item) => item.module === "类型系统");
export const functionalTopics = collections.filter((item) => item.module === "函数式");
export const languageTopics = collections.filter((item) => item.module !== "集合");

export const collectionMap = Object.fromEntries(
  collections.map((item) => [item.id, item])
) as Record<CollectionId, CollectionGuide>;

export function getCollection(id: string): CollectionGuide | undefined {
  return collectionMap[id as CollectionId];
}
