import type { CollectionId } from "@/lib/collections";

export type Question = {
  id: string;
  title: string;
  collections: CollectionId[];
  level: "基础" | "进阶";
  answer: string;
  points: string[];
};

export const questions: Question[] = [
  {
    id: "al-vs-ll",
    title: "ArrayList 和 LinkedList 怎么选？",
    collections: ["arraylist", "linkedlist"],
    level: "基础",
    answer:
      "默认选 ArrayList。它是连续数组，按下标 O(1)，遍历对 CPU 缓存友好。LinkedList 是双向链表，头尾增删 O(1)，但按 index 取值是 O(n)，节点还多两个指针。所谓「中间插入 LinkedList 更快」要先走到那个节点，总体仍是 O(n)。真正的队列场景更推荐 ArrayDeque，而不是 LinkedList。",
    points: [
      "ArrayList：数组、随机访问快、中间插删要搬元素",
      "LinkedList：链表、头尾快、按下标慢",
      "现代面试加一句：绝大多数情况 ArrayList 更快",
    ],
  },
  {
    id: "al-grow",
    title: "ArrayList 怎么扩容？默认容量是多少？",
    collections: ["arraylist"],
    level: "基础",
    answer:
      "JDK 8 起无参构造先用空数组，第一次 add 才扩到 10。之后新容量 = 旧容量 + 旧容量/2，也就是 1.5 倍。内部用 Arrays.copyOf 拷到新数组。预先知道数量就指定初始容量，少拷几次。",
    points: [
      "空列表 ≠ 容量 10（JDK 8+）",
      "1.5 倍：old + (old >> 1)",
      "size 和 capacity 不是一回事",
    ],
  },
  {
    id: "al-foreach-remove",
    title: "为什么 foreach 里不能直接 list.remove？",
    collections: ["arraylist", "linkedlist"],
    level: "基础",
    answer:
      "增强 for 底层是迭代器。迭代器靠 modCount 做 fail-fast：你用列表自己的 remove 改了结构，modCount 对不上，就抛 ConcurrentModificationException。正确做法是 iterator.remove()，或倒序按下标删，或 removeIf。",
    points: [
      "fail-fast：expectedModCount != modCount",
      "用迭代器的 remove",
      "这和「多线程」不是一回事，单线程也会中招",
    ],
  },
  {
    id: "hm-put",
    title: "HashMap 的 put 过程说一遍（JDK 8）",
    collections: ["hashmap"],
    level: "基础",
    answer:
      "先算 hash（hashCode 高 16 位异或）。表为空就 resize。桶空则放新节点。桶不空：key 相同就替换 value；是树走红黑树插入；是链表就尾插，插完长度 ≥ 8 尝试树化（数组 < 64 则先扩容）。最后 size++，超过 threshold 再扩容。",
    points: [
      "扰动：h ^ (h >>> 16)",
      "下标：(n-1) & hash",
      "冲突：链表，过长且表够大 → 红黑树",
      "超过 0.75 容量扩成 2 倍",
    ],
  },
  {
    id: "hm-treeify",
    title: "为什么链表长度 8 转红黑树，还要数组长度 ≥ 64？",
    collections: ["hashmap"],
    level: "进阶",
    answer:
      "在负载因子 0.75 下，链表到 8 的概率极低，到了基本说明哈希分布很差。树化能把最坏查找从 O(n) 降到 O(log n)，但节点更重、实现更复杂。数组还很小时，先扩容把节点打散更划算，所以 MIN_TREEIFY_CAPACITY=64。树太短（≤6）扩容或删除时会退回链表。",
    points: ["8：树化阈值", "6：退树阈值", "64：太小先扩容不树化"],
  },
  {
    id: "hm-hash",
    title: "HashMap 为什么要把 hash 右移 16 位再异或？",
    collections: ["hashmap"],
    level: "进阶",
    answer:
      "取桶下标只用低位：(n-1)&hash。如果很多 key 低位像、高位不同，会挤在同一桶。>>>16 再异或，让高位也影响低位，冲突更均匀。这叫扰动。",
    points: ["容量是 2 的幂才能用位运算代替取模", "扰动让高位参与"],
  },
  {
    id: "hm-equals",
    title: "HashMap 的 key 为什么要同时重写 equals 和 hashCode？",
    collections: ["hashmap", "hashset"],
    level: "基础",
    answer:
      "定位桶靠 hashCode，确认是不是同一个 key 靠 equals。equals 相等却 hashCode 不同，会放到不同桶，Set 里出现「逻辑重复」。hashCode 相同但 equals 不同，只是碰撞，允许。契约：equals 为 true ⇒ hashCode 必须相等。放进 Map/Set 后不要改这些字段。",
    points: [
      "先 hash 定位，再 equals 确认",
      "只改 equals 会丢数据或重复",
      "可变 key 是定时炸弹",
    ],
  },
  {
    id: "hm-unsafe",
    title: "HashMap 为什么线程不安全？JDK 7 的死循环是怎么回事？",
    collections: ["hashmap", "concurrenthashmap"],
    level: "进阶",
    answer:
      "put、扩容、计数都没加锁，并发会丢节点、size 不准。JDK 7 链表是头插，两线程同时扩容可能把链表弄成环，get 就死循环。JDK 8 改成尾插，死循环基本没了，但丢数据、数据覆盖还在。并发必须用 ConcurrentHashMap。",
    points: [
      "JDK 7 头插 + 扩容 → 环形链表",
      "JDK 8 仍不安全，只是不一定死循环",
      "答案不是 Collections.synchronizedMap（整表锁）",
    ],
  },
  {
    id: "chm-jdk7-8",
    title: "ConcurrentHashMap 在 JDK 7 和 JDK 8 有什么不同？",
    collections: ["concurrenthashmap"],
    level: "进阶",
    answer:
      "JDK 7：Segment 数组，每个 Segment 是一把 ReentrantLock + 一张小哈希表。并发度约等于段数。JDK 8：抛弃 Segment，结构向 HashMap 看齐。空桶 CAS 放节点，有冲突就 synchronized 锁该桶头节点。读不加锁。扩容时其它线程看到 ForwardingNode 会帮忙搬。粒度从「一段」变成「一个桶」，并发更好。",
    points: [
      "7：分段锁 Segment",
      "8：CAS + synchronized(头节点)",
      "get 全程无锁",
    ],
  },
  {
    id: "chm-null",
    title: "ConcurrentHashMap 为什么不允许 null？HashMap 为什么可以？",
    collections: ["concurrenthashmap", "hashmap"],
    level: "基础",
    answer:
      "HashMap 是单线程语义，get 返回 null 你可以再 containsKey 区分「没有」还是「值就是 null」。并发下这两个调用之间状态会变，无法可靠区分。CHM 约定：get==null 就表示没有这个键。Hashtable 同样禁止 null。",
    points: ["避免二义性", "get 无锁，不能靠第二次查询来确认", "写入 null 直接 NPE"],
  },
  {
    id: "chm-atomic",
    title: "ConcurrentHashMap 是不是任何操作都线程安全？",
    collections: ["concurrenthashmap"],
    level: "进阶",
    answer:
      "单次 API（put、get、remove、putIfAbsent、compute）是安全的。「先 containsKey 再 put」这种组合不是原子的，中间别人能插队。要组合操作就用 putIfAbsent、compute、merge。迭代器是弱一致，不会 fail-fast，也不保证看到遍历开始后的所有更新。",
    points: [
      "单次安全 ≠ 业务原子",
      "用 compute / putIfAbsent",
      "迭代弱一致",
    ],
  },
  {
    id: "hs-inner",
    title: "HashSet 底层是什么？怎么去重？",
    collections: ["hashset", "hashmap"],
    level: "基础",
    answer:
      "内部一个 HashMap。元素当 key，value 是静态的 PRESENT 对象。add 就是 put(e, PRESENT)，如果旧值不是 null 说明已经有了，返回 false。去重规则等于 HashMap 的 key 规则：hashCode + equals。",
    points: ["HashMap 的马甲", "PRESENT dummy value", "无序，允许一个 null"],
  },
  {
    id: "tm-vs-hm",
    title: "TreeMap 和 HashMap 怎么选？",
    collections: ["treemap", "hashmap"],
    level: "基础",
    answer:
      "要按 key 排序、要范围查询（大于某值的最小 key、subMap）用 TreeMap，代价是 O(log n)，key 必须可比较，自然排序不能 null key。只是快速存取、不在乎顺序用 HashMap，平均 O(1)。LinkedHashMap 是时间顺序，不是 key 大小顺序，别和 TreeMap 搞混。",
    points: [
      "HashMap：无序 O(1)",
      "TreeMap：key 有序 O(log n)",
      "LinkedHashMap：插入/访问顺序",
    ],
  },
  {
    id: "tm-compare",
    title: "TreeMap 靠什么判断两个 key 相同？",
    collections: ["treemap"],
    level: "进阶",
    answer:
      "靠 compare / compareTo 是否为 0，不是只靠 equals。所以 Comparator 和 equals 必须一致，否则会出现「equals 认为相同但树里能并存」或反过来。这也是为什么自然排序下 null key 不行：null.compareTo 会 NPE。",
    points: ["compare==0 视为同一 key", "和 equals 保持一致", "key 要可比较"],
  },
  {
    id: "lhm-lru",
    title: "用 LinkedHashMap 怎么实现 LRU？原理是什么？",
    collections: ["linkedhashmap"],
    level: "进阶",
    answer:
      "LinkedHashMap 在 HashMap 外包了一条双向链表。构造传入 accessOrder=true 后，每次 get/put 已存在的元素会移到链表尾（最近使用），头就是最久未使用。重写 removeEldestEntry，size 超过上限就返回 true，插入后自动删掉 eldest。注意它不是线程安全的。",
    points: [
      "accessOrder=true",
      "重写 removeEldestEntry",
      "链表头 = 最久未用",
    ],
  },
  {
    id: "choose-map",
    title: "HashMap、LinkedHashMap、TreeMap、ConcurrentHashMap 怎么快速选型？",
    collections: ["hashmap", "linkedhashmap", "treemap", "concurrenthashmap"],
    level: "基础",
    answer:
      "先问线程：并发写 → ConcurrentHashMap（要排序的并发 → ConcurrentSkipListMap）。再问顺序：不要顺序 → HashMap；要插入/LRU → LinkedHashMap；要 key 排序/范围 → TreeMap。最后问 null：只有 HashMap/LinkedHashMap 允许 null key。",
    points: [
      "并发 → CHM",
      "key 排序 → TreeMap",
      "插入顺序 / LRU → LinkedHashMap",
      "普通字典 → HashMap",
    ],
  },
  {
    id: "capacity-2",
    title: "HashMap 容量为什么必须是 2 的幂？",
    collections: ["hashmap"],
    level: "进阶",
    answer:
      "取下标用 (n-1)&hash。只有 n=2^k 时，n-1 才是低位全 1，位运算才等价于 hash % n，又比取模快。构造时传入 10，内部也会把它扩到 16。扩容成 2 倍后，节点分裂只看多出来的那一位，搬迁也更简单。",
    points: ["位运算代替取模", "传入 10 实际是 16", "扩容分裂靠 hash & oldCap"],
  },
  {
    id: "iterate-map",
    title: "遍历 Map 有哪几种方式？各注意什么？",
    collections: ["hashmap", "linkedhashmap", "treemap", "concurrenthashmap"],
    level: "基础",
    answer:
      "entrySet 一次拿到 key 和 value，最常用。keySet + get 会多一次查找，一般不推荐。JDK 8 的 forEach。HashMap 家族迭代 fail-fast；ConcurrentHashMap 弱一致，遍历时仍可改，但不保证看到全部新数据。LinkedHashMap 按链表顺序；TreeMap 按 key 顺序；HashMap 顺序别依赖。",
    points: [
      "优先 entrySet / forEach",
      "别依赖 HashMap 的遍历顺序",
      "CHM 弱一致，其它 fail-fast",
    ],
  },
  {
    id: "generic-what",
    title: "泛型是干什么的？为什么 List<String> 不能当成 List<Object>？",
    collections: ["generics"],
    level: "基础",
    answer:
      "泛型把「容器里是什么」写成类型参数，编译期拦住错误的 add，取值也不用强转。List<String> 不是 List<Object> 的子类：否则把 List<String> 传进去再 add(1)，这个整数就会混进只该装字符串的列表，泛型承诺就破了。Java 泛型是不变的，和数组的协变不同。",
    points: [
      "编译期类型安全，少强转",
      "泛型不变：List<String> 不是 List<Object>",
      "数组协变会在运行时 ArrayStoreException",
    ],
  },
  {
    id: "generic-pecs",
    title: "PECS 是什么？extends 和 super 怎么选？",
    collections: ["generics"],
    level: "进阶",
    answer:
      "Producer Extends，Consumer Super。要从集合里取数据（生产者）用 <? extends T>：能当 T 读，不能随意 add。要往集合里放数据（消费者）用 <? super T>：能放 T 及子类，读出来只能当 Object。拷贝的经典签名：copy(List<? extends T> src, List<? super T> dest)。",
    points: [
      "往外取：extends",
      "往里放：super",
      "只出现一次、纯通配时用 ?，既当参数又当返回值时用 <T>",
    ],
  },
  {
    id: "erasure-what",
    title: "什么是类型擦除？运行时还能看到 T 吗？",
    collections: ["type-erasure", "generics"],
    level: "基础",
    answer:
      "编译器把无界 T 擦成 Object，有上界就擦成上界，并在 get 之后插入强转。所以 List<String> 和 List<Integer> 运行时是同一个类，instanceof List<String> 不合法。信息不是彻底消失：类文件 Signature 属性里还留着，反射 getGenericReturnType 能读到。但不能靠它做 new T() 或重载。",
    points: [
      "无界 → Object，有界 → 上界",
      "两个 List 运行时 class 相同",
      "Signature 里还有，instanceof 没有",
    ],
  },
  {
    id: "erasure-limit",
    title: "类型擦除带来哪些限制？桥接方法是什么？",
    collections: ["type-erasure"],
    level: "进阶",
    answer:
      "不能 new T()、不能 new T[]、不能 catch T、不能重载只靠泛型参数不同的方法。父类擦成 Object 后，子类那份 compareTo(Integer) 对不上擦后的 compareTo(Object)，javac 会再生成一个合成的 bridge 方法做转调。堆污染是 raw type 或错误强转把错类型塞进去，往往到下一次强转才炸。",
    points: [
      "不能 new T() / 泛型数组",
      "桥接方法：擦后签名的转调",
      "堆污染 + @SafeVarargs",
    ],
  },
  {
    id: "stream-lazy",
    title: "Stream 的中间操作和终端操作有什么区别？",
    collections: ["stream"],
    level: "基础",
    answer:
      "中间操作（filter/map/flatMap/distinct/sorted/limit…）返回 Stream，只是记下要做什么，不遍历。终端操作（collect/forEach/reduce/count/findFirst/anyMatch）才真正拉数据，而且过后这条流不能再用。多个中间操作会融合进一次遍历。没有终端操作，整条链什么都不做。",
    points: [
      "中间懒，终端才跑",
      "一条流只能消费一次",
      "findFirst/anyMatch/limit 可以短路",
    ],
  },
  {
    id: "stream-vs-loop",
    title: "Stream 和 for 怎么选？parallel 一定更快吗？",
    collections: ["stream", "lambda"],
    level: "基础",
    answer:
      "过滤映射分组这类声明式操作用 Stream；循环体复杂、要改外部状态、要精细 break 用 for。性能多数同一量级，别神话。parallel() 走 ForkJoinPool.commonPool()，数据量大、纯 CPU、无共享状态才可能更快；有 IO 或共享可变变量往往更慢还更危险。forEach 并行会乱序。",
    points: [
      "声明式链路 → Stream；复杂控制流 → for",
      "并行不是默认加速",
      "公共线程池，别在里面阻塞",
    ],
  },
  {
    id: "stream-collect",
    title: "Collectors 最常考哪几个？toMap 重复 key 怎么办？",
    collections: ["stream"],
    level: "进阶",
    answer:
      "toList、toSet、toMap、groupingBy、joining、partitioningBy。toMap 遇到重复 key 默认抛 IllegalStateException，要传第三个参数 mergeFunction，例如 (a,b) -> a。groupingBy 得到 Map<K, List<V>>；下游还可以接 counting、mapping。JDK 16+ 有 Stream.toList()，得到的是不可变列表。",
    points: [
      "toMap 必须处理重复 key",
      "groupingBy 做分组",
      "joining 做拼接",
    ],
  },
  {
    id: "lambda-what",
    title: "Lambda 是匿名内部类的语法糖吗？this 指向谁？",
    collections: ["lambda", "functional-interface"],
    level: "基础",
    answer:
      "不是。Lambda 必须落到函数式接口上，底层是 invokedynamic + LambdaMetafactory，不一定生成 YourClass$1。匿名内部类的 this 是自己，lambda 的 this 是外层类。捕获的局部变量必须是 effectively final。能写成方法引用就别硬写箭头。",
    points: [
      "目标类型 = 函数式接口",
      "this 是外层，不是匿名类",
      "invokedynamic，不是 $1.class",
    ],
  },
  {
    id: "lambda-capture",
    title: "为什么 lambda 捕获的局部变量必须是 final 或 effectively final？",
    collections: ["lambda"],
    level: "进阶",
    answer:
      "局部变量在栈上，lambda 可能延迟执行甚至换线程。编译器会把变量值拷进 lambda。如果允许你后面再改，两边看到的就不一致。所以 i++ 后再进 lambda 会编译失败，要先拷到 final 的 cur = i。成员变量没这个限制，因为捕获的是 this 引用。",
    points: [
      "拷的是值，不是栈上的格子",
      "后面再赋值就不算 effectively final",
      "字段可以改，因为共享的是对象",
    ],
  },
  {
    id: "fi-four",
    title: "函数式接口怎么定义？四大核心接口怎么记？",
    collections: ["functional-interface", "lambda"],
    level: "基础",
    answer:
      "有且只有一个抽象方法，叫 SAM。default、static、以及覆盖 Object 的方法都不算。Function 有进有出，Predicate 有进返回 boolean，Consumer 有进无出，Supplier 无进有出。Stream.map/filter/forEach、Optional.orElseGet 分别对这四个。@FunctionalInterface 可选，加上后多写抽象方法会编译失败。",
    points: [
      "SAM：一个抽象方法",
      "Function / Predicate / Consumer / Supplier",
      "Runnable、Comparator 也是函数式接口",
    ],
  },
  {
    id: "optional-usage",
    title: "Optional 该用在哪儿？为什么不要当字段和参数？",
    collections: ["optional"],
    level: "基础",
    answer:
      "用在返回值：方法可能找不到结果时，强迫调用方处理空。不要当字段、方法参数、集合元素——多一层包装，序列化、JSON、RPC 都别扭，调用方还得先 Optional.ofNullable 包一层。集合为空就返回空列表，不要 Optional<List>。of(null) 会 NPE，不确定用 ofNullable。",
    points: [
      "返回值可以，字段/参数不要",
      "空集合优于 Optional<List>",
      "of vs ofNullable",
    ],
  },
  {
    id: "optional-orelse",
    title: "orElse 和 orElseGet 差在哪？为什么不推荐 get()？",
    collections: ["optional"],
    level: "进阶",
    answer:
      "orElse(x) 无论盒子空不空，x 都会先求值；orElseGet(supplier) 只在 empty 时才调用。默认值是一次查询或 new 大对象时，用错 orElse 就会白白跑一遍。get() 空的时候抛 NoSuchElementException，和直接解引用 null 差不多，应该用 orElseThrow / orElseGet / ifPresent。map 返回 Optional 时要用 flatMap 避免套娃。",
    points: [
      "orElse 总是求值，orElseGet 懒",
      "少写 isPresent + get",
      "map vs flatMap",
    ],
  },
  {
    id: "jvm-new",
    title: "new 一个对象时 JVM 做了什么？",
    collections: ["object-create", "object-layout"],
    level: "基础",
    answer:
      "先按符号引用找到类，没初始化就加载。然后在堆上分配，优先 TLAB 里指针碰撞；堆碎的收集器才走空闲列表。内存清零，写 Mark Word 和类型指针，最后 invokespecial <init>。大对象可能直接进老年代。逃逸分析是优化，主路径仍是进堆。",
    points: [
      "类检查 → 分配 → 零值 → 对象头 → 构造",
      "TLAB 降低堆上竞争",
      "构造器跑之前对象已经在堆上",
    ],
  },
  {
    id: "jvm-header",
    title: "对象内存怎么布局？空 Object 多大？",
    collections: ["object-layout"],
    level: "进阶",
    answer:
      "HotSpot：Mark Word + 类型指针 + 实例字段 + 对齐。64 位 Mark Word 通常 8 字节，压缩类指针时类型指针 4 字节，按 8 字节对齐，空 Object 常见 16 字节。Mark Word 里有锁状态、GC 年龄、identity hashCode。数字用 JOL 验证，别死记一个版本。",
    points: [
      "头不是装饰，锁和年龄都在上面",
      "压缩 Oops，堆过大可能关掉",
      "以 JOL 为准",
    ],
  },
  {
    id: "jvm-gcroot",
    title: "怎么判断一个对象是垃圾？循环引用能回收吗？",
    collections: ["gc-root"],
    level: "基础",
    answer:
      "可达性分析：从 GC Roots 出发走不到的就是垃圾。根包括栈上引用、静态字段、JNI 等。循环引用只要脱离根就能收，这是引用计数做不到的。Java 里所谓泄漏通常是强引用还挂在静态集合、缓存、监听器上。",
    points: [
      "根是起点不是对象自己",
      "环可以收",
      "泄漏 = 该断的强引用没断",
    ],
  },
  {
    id: "jvm-young-full",
    title: "Minor GC、Young GC、Full GC、Mixed GC 有什么区别？",
    collections: ["generational-gc", "g1"],
    level: "基础",
    answer:
      "Young GC 和 Minor GC 在 HotSpot 里基本是一回事：只收年轻代。Full GC 收整堆（年轻代+老年代，常连带元空间），停顿最重。Mixed GC 是 G1 的：一次停顿里收所有年轻 Region 加一部分老 Region，用来代替动不动 Full。Major GC 这个词不标准，别用来答题。",
    points: ["Minor = Young", "Full = 整堆兜底", "Mixed = G1 专有"],
  },
  {
    id: "jvm-oom-soe",
    title: "OOM 和 StackOverflowError 差在哪？OOM 只有堆满吗？",
    collections: ["oom"],
    level: "基础",
    answer:
      "StackOverflowError 是线程栈太深，递归或 -Xss 太小，和堆无关。OOM 要看子类型：Java heap space 是堆；Metaspace 是类元数据；Direct buffer 是堆外；unable to create native thread 是线程把本地内存吃完。先读异常消息，再决定加 -Xmx 还是 dump 查泄漏。",
    points: [
      "SOE 在栈，OOM 在堆或本地内存",
      "先看 Error 后面的句子",
      "别一上来只加堆",
    ],
  },
  {
    id: "jvm-tricolor",
    title: "三色标记为什么会漏标？写屏障和 STW 干什么？",
    collections: ["tricolor", "cms", "g1"],
    level: "进阶",
    answer:
      "并发标记时应用还在改引用：如果一个黑对象新指向白对象，同时原路径被砍掉，这个白对象会漏标，被当成垃圾。写屏障在赋值时记账：CMS 增量更新记新边，G1 SATB 记被覆盖的旧引用。STW 只留给根扫描、再标记这种必须静止的片段，不是 GC 全程停。漏标会坏数据，多标只是浮动垃圾。",
    points: [
      "漏标条件：黑指向白且原路径消失",
      "CMS 增量更新 / G1 SATB",
      "STW 是片段不是收集器名",
    ],
  },
  {
    id: "jvm-cms",
    title: "CMS 四个阶段是什么？为什么被淘汰？",
    collections: ["cms"],
    level: "进阶",
    answer:
      "初始标记 STW、并发标记、重新标记 STW、并发清除。清除不压缩，堆碎片化，大对象可能放不下，并发失败就退化成 Serial Old Full GC。JDK 9 弃用，14 删除。现在问 CMS 重点是过程、碎片、失败路径，以及为什么默认换成 G1。",
    points: ["两段 STW，两段并发", "不整理 → 碎片", "JDK 14 已删除"],
  },
  {
    id: "jvm-g1-mixed",
    title: "G1 的 Mixed GC 是什么？和 Full GC 有何不同？",
    collections: ["g1"],
    level: "进阶",
    answer:
      "G1 堆是 Region。Young GC 收年轻 Region。并发标记后按垃圾收益排序，Mixed GC 一次 STW 收掉全部年轻代再加一组老 Region。这是常规回收老年代的方式，不是失败。Full GC 才是 G1 搬不完、分配失败时的整堆兜底，很重。停顿目标 MaxGCPauseMillis 是目标不是保证。",
    points: ["Region + Garbage First", "Mixed ≠ Full", "SATB 写屏障"],
  },
  {
    id: "jvm-zgc",
    title: "ZGC 为什么停顿可以很短？哪一版能用于生产？",
    collections: ["zgc"],
    level: "进阶",
    answer:
      "染色指针把标记/重定位信息放进指针，读引用走读屏障，对象搬走了也能转到新地址，所以转移可以和应用并发，停顿不随堆线性变大。JDK 11 实验，15 生产就绪，21 分代 ZGC。它不是零 STW。小堆或 JDK 8 用 G1/CMS 那条线。",
    points: ["读屏障 + 着色指针", "15 生产 / 21 分代", "仍有短 STW"],
  },
  {
    id: "jvm-tools",
    title: "jps、jstat、jmap、jstack、Arthas 分别什么时候用？",
    collections: ["jvm-tools"],
    level: "基础",
    answer:
      "jps 找 pid。jstat -gcutil 看各区和 GC 计数，判断是不是 Full 循环。jmap histo 或 dump 看堆占用，JDK 9+ 可用 jcmd GC.heap_dump。jstack 看线程、死锁、CPU 热点（top -H 对 nid）。Arthas 在不能停机时 dashboard/thread/jad/watch/trace。dump 会 STW，生产要挑实例。",
    points: [
      "先现象再命令",
      "GC→jstat，堆→jmap，线程→jstack",
      "Arthas 补不停机的方法级观察",
    ],
  },
];
