import type { CollectionGuide } from "@/lib/collections";

const dash = {
  get: "—",
  add: "—",
  remove: "—",
  contains: "—",
  iterate: "—",
} as const;

export const jvmTopics: CollectionGuide[] = [
  {
    id: "object-create",
    name: "对象创建",
    jdkInterface: "HotSpot · new / TLAB",
    kind: "JVM",
    category: "JVM",
    module: "JVM 内存",
    moduleRole:
      "JVM 这条线的入口。对象怎么进堆，决定后面怎么布局、怎么被 GC 找到。布局是下一篇，不是另一套东西。",
    prereqs: [],
    next: ["object-layout"],
    spineTitle: "一次 new 走到底",
    spine: [
      {
        label: "new",
        why: "字节码入口。面试从这里开始，后面都是它触发的。",
        body: "new 指令先根据常量池里的类符号引用找到类。没加载就走加载、链接、初始化。类已经初始化过，就进入分配。",
      },
      {
        label: "分配内存",
        why: "对象要在堆上占一块连续空间。怎么切这块，看堆是否规整。",
        body: "堆整齐就指针碰撞：把指针往前挪一块。CMS 这类碎片堆用空闲列表找合适块。线程频繁分配会抢堆指针，所以有 TLAB：每个线程先领一小片，在片里碰撞，几乎无锁。",
      },
      {
        label: "零值 + 对象头",
        why: "内存刚划出来是脏的，必须先变成语言里的默认值，再写上「我是谁」。",
        body: "字段先变成 0 / false / null。再填 Mark Word 和类型指针。这以后 GC、synchronized、hashCode 才认得出这是一个对象。",
      },
      {
        label: "<init>",
        why: "语言层的构造方法。堆上的格子已经有了，这里才按源码赋真正的值。",
        body: "先父类构造，再实例变量初始化，再构造器体。逃逸分析可能把对象拆到栈上或标量替换，那是优化，面试先把「进堆」这条主路讲顺。",
      },
    ],
    oneLiner: "new 不是一句话。先确保类就绪，再在堆（通常是 TLAB）划一块，填零、写对象头，最后跑构造方法。",
    analogy:
      "像开户：先核身份（类加载），再分一个保险箱格子（堆/TLAB），格子先清空并贴标签（零值+对象头），最后把你带来的东西放进去（构造方法）。",
    structure: "类元数据在 Metaspace；实例在堆。线程优先在 TLAB 里用指针碰撞分配，TLAB 不够再向堆申请。",
    ordered: "—",
    threadSafe: "TLAB 把分配冲突降到线程内部",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 8 起永久代改 Metaspace；对象实例仍在堆",
    time: dash,
    facts: [
      { label: "默认分配", value: "TLAB + 指针碰撞" },
      { label: "大对象", value: "可能直接进老年代" },
      { label: "优化", value: "逃逸分析 / 标量替换" },
      { label: "元数据", value: "Metaspace（JDK 8+）" },
    ],
    highlights: [
      "主路径：类检查 → 分配 → 零值 → 对象头 → <init>",
      "TLAB：线程私有分配缓冲区，减少堆上 CAS",
      "大对象、Humongous Region（G1）可能不进 Eden",
      "逃逸分析成功时对象可能不进堆，这是优化不是语义改变",
    ],
    internals: [
      {
        title: "为什么需要 TLAB",
        body: "堆是全局的，多线程同时 bump pointer 要 CAS。给每个线程一块 Thread Local Allocation Buffer，在自己的缓冲区里分配无竞争。满了再申请下一块。所以「对象创建」和「线程」绑在一起，不是纯堆结构问题。",
      },
      {
        title: "指针碰撞 vs 空闲列表",
        body: "复制算法、标记整理之后堆是齐的，用指针碰撞。标记清除（CMS 清理阶段）留下空洞，就得空闲列表。收集器换了，分配策略跟着换。",
      },
      {
        title: "构造方法之前对象已经存在",
        body: "分配和写对象头发生在 invokespecial <init> 之前。所以 this 逃逸（构造器里把 this 交给别的线程）是危险的：别人可能看到未构造完的对象。",
      },
    ],
    pitfalls: [
      "别说「new 就是在堆上 new 一个对象」。漏掉类加载、TLAB、对象头，面试官会追。",
      "逃逸分析不是保证。小方法、短暂对象才容易优化，不要把「对象都在栈上」当默认。",
      "G1 里超过 Region 一半的对象算 Humongous，直接进老年代 Region，Young GC 管不着。",
    ],
    useWhen: [
      "被问 new 做了什么、对象在哪儿分配",
      "解释 TLAB、指针碰撞、为什么 CMS 分配更碎",
    ],
    avoidWhen: ["把逃逸分析讲成「Java 对象默认在栈上」"],
    code: {
      title: "new 之后你以为还没构造完，堆上已经有对象了",
      source: `class User {
    String name = "init"; // 零值之后、构造器体之前就会赋这个值
    User() {
        // 危险：把构造中的 this 丢给别人
        Cache.register(this);
        name = "ok";
    }
}

User u = new User(); // 字节码：new + dup + invokespecial <init>`,
    },
    vs: [
      {
        other: "对象内存布局",
        point: "创建是「怎么拿到一块内存」；布局是「这块内存怎么切成头和字段」。",
      },
      {
        other: "类加载",
        point: "类加载解决「这个类的代码和静态字段在哪」。实例字段的值在对象里，不在 Metaspace。",
      },
    ],
    interviewAnswer:
      "一次 new：先解析类，必要时加载初始化；再在堆上分配，优先 TLAB 里指针碰撞；内存清零，写 Mark Word 和类型指针；最后调 <init>。大对象可能直接进老年代。逃逸分析只是优化，主路径仍是进堆。",
  },
  {
    id: "object-layout",
    name: "对象内存布局",
    jdkInterface: "HotSpot · 对象头",
    kind: "JVM",
    category: "JVM",
    module: "JVM 内存",
    moduleRole:
      "对象进堆之后，这块字节怎么切。Mark Word 连着锁和 hashCode，类型指针连着 GC 怎么识别类型。",
    prereqs: ["object-create"],
    next: ["gc-root"],
    spineTitle: "一块对象怎么切开",
    spine: [
      {
        label: "Mark Word",
        why: "对象头的第一段。锁状态、GC 年龄、identity hashCode 都挤在这里。",
        body: "64 位虚机通常 8 字节。无锁时可以存 hashCode 和分代年龄；偏向锁、轻量锁、重量锁会改这些位。所以 synchronized 和对象头是一张皮。",
      },
      {
        label: "类型指针",
        why: "告诉虚拟机这是哪个类的实例，方法、字段布局都靠它。",
        body: "开启压缩类指针时常见 4 字节。GC 扫描、instanceof、虚方法调用都要经过它找到 Klass。",
      },
      {
        label: "实例数据",
        why: "你在类里声明的字段，按 JVM 的对齐规则排列，不是源码书写顺序。",
        body: "父类字段在前。HotSpot 会重排减少填充。引用类型字段就是指向别的对象的指针，GC 扫描的就是它们。",
      },
      {
        label: "对齐填充",
        why: "对象大小按 8 字节对齐，方便寻址和压缩指针。",
        body: "空对象也不是 0。64 位开压缩指针时，无字段对象常见 16 字节：8 头 + 4 类型 + 4 填充。JOL 可以打出来看，别死记一个数字。",
      },
    ],
    oneLiner: "对象 = 对象头（Mark Word + 类型指针）+ 实例字段 + 对齐。锁、hashCode、GC 年龄都在头上。",
    analogy:
      "快递箱：箱盖写状态和单号（Mark Word），侧面写品类（类型指针），箱子里才是货（字段）。箱子尺寸还得凑成整格，空位就是对齐。",
    structure: "HotSpot：Mark Word | Klass Pointer | fields | padding。数组多一个 length。",
    ordered: "—",
    threadSafe: "Mark Word 随锁升级改写",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "64 位默认压缩普通对象指针（堆 < 32G 时）",
    time: dash,
    facts: [
      { label: "Mark Word", value: "8 字节（64 位）" },
      { label: "压缩指针", value: "引用常压成 4 字节" },
      { label: "对齐", value: "8 字节" },
      { label: "空对象", value: "常见 16 字节" },
    ],
    highlights: [
      "对象头不是装饰：锁、hashCode、GC age 都在 Mark Word",
      "压缩 Oops：堆指针 4 字节，堆一般要小于 32G 才默认开",
      "数组对象多 length，没有 length 就没法遍历",
      "用 JOL（jol-core）看真实布局，比背数字准",
    ],
    internals: [
      {
        title: "为什么要压缩指针",
        body: "64 位指针太宽，对象一多堆浪费、缓存也不友好。压缩 Oops 把堆地址编码成 4 字节。堆超过约 32G 时压缩失效，对象普遍变大，GC 压力跟着涨。调 -Xmx 时这是隐藏成本。",
      },
      {
        title: "hashCode 和偏向锁抢同一块位",
        body: "identity hashCode 算过就会写入 Mark Word。一旦写了，偏向锁这条路会受影响。所以「调用过 System.identityHashCode 的对象」和锁升级是连着的，不是两个八股。",
      },
    ],
    pitfalls: [
      "别把「对象头 8 字节」当万能答案。要拆 Mark Word 和类型指针，还要说清 32/64 位和是否压缩。",
      "字段顺序不是源码顺序。用 JOL 或 -XX:+PrintFieldLayout（诊断用）看。",
      "堆开到 32G 以上，压缩指针关掉，内存占用会跳一截。",
    ],
    useWhen: ["问对象头、空对象多大、锁和对象布局的关系"],
    avoidWhen: ["把 C++ vptr 和 Java Klass 指针混成一谈还说都是 8 字节"],
    code: {
      title: "空对象也不白给",
      source: `Object o = new Object();
// 64 位 + 压缩类指针：常见 16 字节
// Mark Word 8 + Klass 4 + padding 4

class Pair { int a; Object b; }
// 字段会对齐；引用按压缩指针算 4 字节
// 具体以 JOL 输出为准，面试讲「头 + 字段 + 对齐」即可`,
    },
    vs: [
      {
        other: "对象创建",
        point: "创建是分配过程；布局是分配成功后的字节结构。",
      },
      {
        other: "synchronized",
        point: "锁升级改的是 Mark Word，不是旁边另有一个锁对象字段。",
      },
    ],
    interviewAnswer:
      "HotSpot 对象分对象头、实例数据、对齐填充。头里 Mark Word 记锁、年龄、hashCode，类型指针指向 Klass。引用字段是 GC 扫描的边。64 位常见 8 字节对齐，开压缩指针时引用 4 字节。空 Object 常见 16 字节，以 JOL 为准。",
  },
  {
    id: "gc-root",
    name: "GC Root",
    jdkInterface: "可达性分析",
    kind: "JVM",
    category: "JVM",
    module: "JVM 内存",
    moduleRole:
      "GC 不是「引用计数归零就删」。从一组根出发能走到的对象才活着。分代回收建立在这套判断上。",
    prereqs: ["object-layout"],
    next: ["generational-gc"],
    spineTitle: "从根走到还活着的对象",
    spine: [
      {
        label: "定根",
        why: "必须有一批绝对还活着的引用，否则图没法开始走。",
        body: "常见根：栈帧里的局部变量和操作数、静态字段、JNI 引用、已启动未停的线程对象。它们不在堆里「再被谁引用」这个问题上打转。",
      },
      {
        label: "沿着引用走",
        why: "对象图的边就是实例里的引用字段、数组元素。",
        body: "从根出发 DFS/链式扫描。能到达的是活的。走不到的就是垃圾。这叫可达性分析，HotSpot 用这套，不用循环引用会漏的引用计数当主方案。",
      },
      {
        label: "引用类型",
        why: "不是所有边都一样硬。软、弱、虚引用让 GC 可以在不同紧迫程度下丢掉对象。",
        body: "强引用：只要可达就不收。软引用：内存紧才收，适合缓存。弱引用：下次 GC 就收。虚引用：收之前入队，用于堆外资源清理。",
      },
      {
        label: "交给收集器",
        why: "根只解决「谁该死」。怎么停顿、怎么并发、怎么整理，是 CMS/G1/ZGC 的事。",
        body: "Young GC 也要从根出发，还要扫老年代里指向年轻代的引用（卡表/RSet）。根是所有收集器的共同前提。",
      },
    ],
    oneLiner: "垃圾不是「没人 new」，是「从 GC Roots 走不到」。循环引用难不倒可达性分析。",
    analogy:
      "查水表：自来水厂（GC Roots）还能供到的房子是活的。两户之间互相接了根管子（循环引用），但总闸关了，两边都算停水。",
    structure: "对象图。根在栈、静态区、JNI；边在堆里的引用字段。方法区/元空间的卸载是另一条线。",
    ordered: "—",
    threadSafe: "—",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "HotSpot 用可达性分析，不是引用计数",
    time: dash,
    facts: [
      { label: "算法", value: "可达性分析" },
      { label: "常见根", value: "栈 / 静态 / JNI" },
      { label: "循环引用", value: "可以回收" },
      { label: "下一步", value: "分代 + 收集器" },
    ],
    highlights: [
      "GC Root ≠ 对象自己，是扫描起点",
      "循环引用可以被回收，这是对引用计数的回答",
      "finalize 不保证及时调用，JDK 18 已 deprecate，别当回收手段",
      "老年代指向年轻代的引用靠卡表记住，否则 Young GC 要扫全老年代",
    ],
    internals: [
      {
        title: "为什么不用引用计数当主力",
        body: "引用计数遇到循环引用无法释放，还要维护计数。可达性分析每次 GC 走一遍图，能处理环。代价是要能枚举根，JIT 和栈扫描必须配合。",
      },
      {
        title: "局部变量表里的槽位",
        body: "方法里一个对象没用了，槽位可能还占着，会延长对象寿命。JIT 可以提前把槽置空。所以「我都没用了怎么还没被收」有时是槽位还活着。",
      },
    ],
    pitfalls: [
      "别说「没有引用就是垃圾」。静态集合、缓存、监听器、线程经常是漏掉的根。",
      "内存泄漏在 Java 里通常是「该断的强引用没断」，对象仍可达。",
      "虚引用 get 永远 null，不能当缓存用。",
    ],
    useWhen: ["问怎么判断垃圾、循环引用、四种引用"],
    avoidWhen: ["把 GC Root 说成「main 方法这一个」"],
    code: {
      title: "循环引用也能收；静态集合会让对象变成根上的活物",
      source: `class Node { Node next; }

Node a = new Node();
Node b = new Node();
a.next = b;
b.next = a;
a = null;
b = null; // 环还在，但从根走不到，可以回收

static final List<Object> LEAK = new ArrayList<>();
void cache(Object o) { LEAK.add(o); } // 强引用挂在静态根上`,
    },
    vs: [
      {
        other: "引用计数",
        point: "计数处理不了环，还要改写每条赋值。HotSpot 主路径是可达性。",
      },
      {
        other: "分代 GC",
        point: "根解决谁活着；分代解决「先扫哪一块堆」来降低停顿。",
      },
    ],
    interviewAnswer:
      "HotSpot 用可达性分析：从 GC Roots 出发能走到的对象存活。根包括栈上引用、静态字段、JNI 等。循环引用只要脱离根就能收。软引用适合缓存，弱引用下次 GC 就清。真正泄漏往往是静态集合、监听器这些强引用没断。",
  },
  {
    id: "generational-gc",
    name: "分代 GC",
    jdkInterface: "Young / Old / Full",
    kind: "GC",
    category: "JVM",
    module: "JVM 内存",
    moduleRole:
      "对象朝生夕死，所以堆切开代。名词最容易混：Minor、Young、Old、Full、Mixed 不是同一种停顿。",
    prereqs: ["gc-root"],
    next: ["oom", "tricolor"],
    spineTitle: "对象从 Eden 走到老年代",
    spine: [
      {
        label: "Eden 分配",
        why: "新对象先挤在年轻代。大多数很快变成垃圾，复制比整理全堆便宜。",
        body: "常规对象进 Eden（在 TLAB 里切）。Eden 满了触发年轻代收集。",
      },
      {
        label: "Minor / Young GC",
        why: "这两个名字在 HotSpot 里基本是一回事：只收年轻代。",
        body: "活着的对象从 Eden + 一个 Survivor 拷到另一个 Survivor，年龄 +1。拷不过去或年龄到阈值（默认 15）就晋升老年代。停顿通常比 Full 短，但不是「用户无感」。",
      },
      {
        label: "Old GC",
        why: "只处理老年代。CMS 的并发收集、G1 的混合收集里都有这块，但不是 Full GC。",
        body: "老年代满了或达到策略阈值才动。Major GC 这个词不严谨：有人拿它当 Old GC，有人当 Full GC。面试里拆开说，别用 Major 糊弄。",
      },
      {
        label: "Full GC",
        why: "整堆兜底：年轻代 + 老年代，常常连带元空间。停顿最长的那种。",
        body: "触发常见：老年代空间不够、显式 System.gc()、元空间扩容失败、CMS 并发失败。目标是尽量少走这条路。G1 还有 Mixed GC：年轻代全收 + 部分老年代 Region，也不是 Full。",
      },
    ],
    oneLiner: "Young/Minor 收年轻代；Old 收老年代；Full 收整堆。Mixed 是 G1 的「年轻代 + 一部分老年代」。",
    analogy:
      "办公室：新来的临时工坐大厅（Eden），活下来的进隔年工位（Survivor），老员工进里间（Old）。大厅大扫除是 Young GC；整栋楼连档案室一起翻是 Full GC。",
    structure: "年轻代 Eden + S0 + S1；老年代；JDK 8+ 类元数据在 Metaspace（本地内存，不是堆）。",
    ordered: "—",
    threadSafe: "—",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "Serial / Parallel / G1 都分代；ZGC 在 JDK 21 才默认分代",
    time: dash,
    facts: [
      { label: "Minor", value: "= Young，收年轻代" },
      { label: "Full", value: "整堆，最重" },
      { label: "Mixed", value: "G1 专有" },
      { label: "Major", value: "别乱用这个词" },
    ],
    highlights: [
      "Minor GC = Young GC，不要再发明第三种年轻代收集",
      "晋升：年龄阈值或 Survivor 放不下",
      "Full GC 往往伴随长时间 STW，生产上要当事故看",
      "System.gc() 只是建议，且可能真的触发 Full，线上慎开",
    ],
    internals: [
      {
        title: "为什么年轻代用复制",
        body: "活着的少，把活的拷走比在原地抠洞便宜。两个 Survivor 轮流当 to-space，避免内存碎片。老年代存活率高，复制会拷太多，所以用标记清除或标记整理。",
      },
      {
        title: "跨代引用",
        body: "老年代对象可能指向年轻代。Young GC 不能漏扫这些边。HotSpot 用卡表：老年代按 512 字节划 dirty card，只扫脏卡。G1 用 Remembered Set。这是 Young GC 能快的关键。",
      },
    ],
    pitfalls: [
      "把 Full GC 说成「老年代 GC」会被追问 Mixed、CMS concurrent cycle。",
      "Young GC 也可能停顿明显：存活对象多、拷贝量大。",
      "堆太小或晋升过快，会 Young 完立刻 Full，看 GC 日志里的 promotion failure。",
    ],
    useWhen: ["名词辨析、晋升、Survivor、为什么分代"],
    avoidWhen: ["用 Major GC 当标准答案"],
    code: {
      title: "日志里对上号（示意）",
      source: `// 年轻代收集：看 GC 日志里的 Pause Young / Minor
// Full：Pause Full / Full GC
// G1 Mixed：Pause Mixed

// 显式调用只是建议，生产通常 -XX:+DisableExplicitGC
System.gc();`,
    },
    vs: [
      {
        other: "Mixed GC",
        point: "G1 在并发标记之后，一次停顿里收所有年轻 Region 加部分老 Region。不是 Full。",
      },
      {
        other: "Old GC",
        point: "CMS 并发周期主要针对老年代；成功的话年轻代不一起停。失败才可能退化成 Full。",
      },
    ],
    interviewAnswer:
      "对象先到 Eden。Eden 满了 Young/Minor GC，活的进 Survivor 或晋升老年代。Old GC 只动老年代。Full GC 收整堆，停顿最重。Major 这个词不标准。G1 的 Mixed GC 是年轻代全部加上一部分老年代 Region。少 Full、控制晋升，是调优的主目标。",
  },
  {
    id: "oom",
    name: "OOM",
    jdkInterface: "OutOfMemoryError / StackOverflowError",
    kind: "JVM",
    category: "JVM",
    module: "JVM 内存",
    moduleRole:
      "分代回收仍扛不住，就会以 Error 的形式爆掉。OOM 和栈溢出不是同一种撑满。",
    prereqs: ["generational-gc"],
    next: ["jvm-tools"],
    spineTitle: "内存或栈先被撑破",
    spine: [
      {
        label: "堆 OOM",
        why: "活对象把堆占满，GC 也腾不出空间。",
        body: "典型：Java heap space、GC overhead limit exceeded。原因常是泄漏（集合越积越大）、一次加载太大、堆就是设小了。先 dump 再 MAT 看谁占着。",
      },
      {
        label: "堆外 / 元空间",
        why: "不一定是 -Xmx。DirectByteBuffer、Metaspace、CodeCache 都能爆。",
        body: "Metaspace：动态生成类太多（大量代理、热加载）。Direct buffer：Netty/NIO 没释放。unable to create native thread：线程数 × 栈把本地内存吃光。",
      },
      {
        label: "StackOverflowError",
        why: "这是栈帧太深，不是堆满。别在面试里和 OOM 混成一个「内存不够」。",
        body: "递归没出口、循环调用、每个线程 -Xss 太小。SOE 一般不走 GC。能在栈上看到重复的方法帧。",
      },
      {
        label: "先看现场",
        why: "同类 Error 处理完全不同：加堆、断泄漏、减线程、改递归。",
        body: "看异常消息、GC 日志、是否 dump。堆问题用 jmap/MAT；线程爆炸用 jstack；元空间看类加载器泄漏。工具专题把命令串起来。",
      },
    ],
    oneLiner: "OOM 是堆或本地内存要不到了；StackOverflowError 是线程栈太深。一个在堆，一个在栈。",
    analogy:
      "仓库爆仓是 OOM：货（对象）太多或忘了清货。梯子爬到没横档是 SOE：调用链太深，和仓库容量无关。",
    structure: "堆：-Xms/-Xmx。栈：每线程 -Xss。元空间：本地内存。直接内存：-XX:MaxDirectMemorySize。",
    ordered: "—",
    threadSafe: "—",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "消息里的类型比「OOM」两个字重要",
    time: dash,
    facts: [
      { label: "堆满", value: "heap space" },
      { label: "GC 无效", value: "GC overhead" },
      { label: "栈深", value: "StackOverflowError" },
      { label: "线程", value: "native thread" },
    ],
    highlights: [
      "先读 Error 后面那句话，再决定查堆还是查栈",
      "GC overhead：花了太多时间 GC 仍回收很少",
      "泄漏是还可达，不是虚拟机坏了",
      "SOE 用 jstack / 异常栈看重复帧，不要去加 -Xmx",
    ],
    internals: [
      {
        title: "常见堆 OOM 现场",
        body: "接口突然变慢伴随 Full GC，最后 heap space。先看有没有 dump（-XX:+HeapDumpOnOutOfMemoryError），再用 MAT 看 Dominator Tree：谁还被静态集合、缓存、ThreadLocal 拉着。",
      },
      {
        title: "线程创建失败",
        body: "每个线程要本地栈。线程池无界、或 per-request 新线程，会在机器内存上爆。这不是 -Xmx 能救的，要限流和有界线程池。",
      },
    ],
    pitfalls: [
      "一遇到 OOM 就加 -Xmx。泄漏会跟着涨，只是晚点爆。",
      "catch OutOfMemoryError 继续跑通常没意义，堆已经不健康。",
      "把 SOE 说成堆溢出，后面的排查会全错。",
    ],
    useWhen: ["线上内存上涨、Full GC、递归崩溃"],
    avoidWhen: ["不看异常明细就改堆参数"],
    code: {
      title: "让 JVM 在 OOM 时留下现场",
      source: `// 启动参数示例
// -XX:+HeapDumpOnOutOfMemoryError
// -XX:HeapDumpPath=/var/log/app-heap.hprof
// -Xmx512m

void boom() {
    boom(); // StackOverflowError，加 -Xmx 没用
}`,
    },
    vs: [
      {
        other: "StackOverflowError",
        point: "栈空间；递归/循环调用。OOM 是堆或本地内存申请失败。",
      },
      {
        other: "Full GC",
        point: "Full 是收集动作。OOM 是收集完仍不够，或根本来不及。",
      },
    ],
    interviewAnswer:
      "OOM 要看子类型：heap space 是堆活对象太多或太小；Metaspace 是类太多；direct memory 是堆外；unable to create native thread 是线程栈把本地内存吃完。StackOverflowError 是栈帧太深，和堆无关。生产先留 dump 和 GC 日志，再决定加内存还是修泄漏。",
  },
  {
    id: "tricolor",
    name: "三色标记",
    jdkInterface: "并发标记 · 写屏障 · STW",
    kind: "GC",
    category: "JVM",
    module: "垃圾回收",
    moduleRole:
      "收集器的公共零件。CMS、G1 都在这套颜色上做并发标记；写屏障是为了并发时不漏标。STW 是不得不停的那几刀。",
    prereqs: ["generational-gc"],
    next: ["cms", "g1"],
    spineTitle: "并发时怎么保证标得对",
    spine: [
      {
        label: "STW",
        why: "Stop-The-World：应用线程全部暂停。根枚举、部分标记收尾必须在静止的对象图上做。",
        body: "不是「GC 全程停」。现代收集器把能并发的搬走，只在初始标记、再标记、转移的关键点停。停顿长短才是 SLA。",
      },
      {
        label: "白灰黑",
        why: "把「还没扫 / 扫到一半 / 扫完」涂成三种颜色，才能边跑业务边标。",
        body: "白：没访问，结束时仍白就是垃圾。灰：自己到了，孩子还没扫完。黑：自己和孩子都处理完。扫描就是灰往黑推。",
      },
      {
        label: "漏标",
        why: "并发时业务线程改引用，可能把一个白对象藏到黑对象后面，扫描再也看不到。",
        body: "条件：黑对象新增指向白对象，同时毁掉了灰/白到这个白对象的原路径。不处理就会把活对象当垃圾收掉。",
      },
      {
        label: "写屏障",
        why: "在赋值引用时插入一小段 GC 代码，把危险更新记下来。",
        body: "增量更新（CMS）：记录「黑指向白」的新边，稍后把黑再当灰扫。SATB（G1）：赋值前把被覆盖的旧引用推进队列，认为快照里它还活着。读屏障是 ZGC 另一条路。",
      },
    ],
    oneLiner: "三色标记让 GC 和应用一起跑；写屏障补上并发改图造成的漏标；STW 只留给必须静止的片段。",
    analogy:
      "图书馆边开馆边盘点。黑书架盘完了，灰的正在盘，白的还没走到。有人把一本白书塞进已盘完的黑架，还不登记，这本书会「消失」。写屏障就是强制登记。",
    structure: "标记阶段的颜色不在对象头里画出来给你看，是收集器算法状态。写屏障由 JIT 插到 putfield 等赋值上。",
    ordered: "—",
    threadSafe: "并发标记必须处理应用线程的写",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "CMS 增量更新；G1 SATB；ZGC 着色指针 + 读屏障",
    time: dash,
    facts: [
      { label: "白", value: "未标记" },
      { label: "灰", value: "待扫子节点" },
      { label: "黑", value: "已扫完" },
      { label: "补漏", value: "写/读屏障" },
    ],
    highlights: [
      "STW 是停顿，不是收集器名字",
      "漏标会丢活对象；多标只会暂时漂浮垃圾，下次再收",
      "CMS：增量更新写屏障；G1：SATB 写屏障",
      "ZGC 用染色指针 + 读屏障，目标是把停顿压到毫秒级且不随堆涨",
    ],
    internals: [
      {
        title: "为什么多标可以忍、漏标不行",
        body: "多标（浮动垃圾）最多让垃圾多活一轮，下一次 GC 再收。漏标把活对象当垃圾，会用已释放内存，直接是正确性问题。所以屏障优先保「不要漏」。",
      },
      {
        title: "再标记为什么还要 STW",
        body: "并发阶段记下来的脏卡/SATB 队列要处理完，根也要再扫一遍。这段必须停世界，否则边标边改永远收不完。CMS 的 remark、G1 的 remark 都是这种短 STW。",
      },
    ],
    pitfalls: [
      "把 STW 说成「CMS 才有」。Serial、Parallel、G1、ZGC 都有 STW，只是长短和次数不同。",
      "只背三色不讲漏标条件，追问写屏障会卡死。",
      "写屏障不是 Java 代码里的 finally，是 JIT 生成的机器指令级钩子。",
    ],
    useWhen: ["问并发 GC 怎么标、CMS/G1 差别、为什么需要屏障"],
    avoidWhen: ["说「G1 没有 STW」"],
    code: {
      title: "漏标发生在赋值这一瞬间（逻辑示意）",
      source: `// 黑色对象 Black 已经扫完
// 白色对象 White 只被 Grey.next 指着
Grey.next = null;
Black.next = White;
// 若不记录这次写：White 变成不可达的白，会被当垃圾
// CMS：记下 Black→White；G1 SATB：记下被覆盖的 Grey.next 旧值`,
    },
    vs: [
      {
        other: "CMS",
        point: "用增量更新写屏障。重新标记要处理的脏卡可能较多，remark 停顿是老问题。",
      },
      {
        other: "G1",
        point: "SATB：宁可多标成浮动垃圾，也要保证快照里的活对象不被漏掉。",
      },
    ],
    interviewAnswer:
      "并发标记用三色：白未访、灰待扫、黑已完成。应用同时改引用时，可能把白对象接到黑对象后面并砍掉原路径，造成漏标。写屏障在赋值时把信息记下来：CMS 记新边（增量更新），G1 记被覆盖的旧引用（SATB）。STW 只出现在必须静止的根扫描和再标记，不是全程停。",
  },
  {
    id: "cms",
    name: "CMS",
    jdkInterface: "Concurrent Mark Sweep · JDK 8",
    kind: "GC",
    category: "JVM",
    module: "垃圾回收",
    moduleRole:
      "老年代并发标记清除的代表。JDK 8 生产里还常见，JDK 14 已删除。先搞懂它，才明白 G1 为什么要换。",
    prereqs: ["tricolor"],
    next: ["g1"],
    spineTitle: "一次 CMS 老年代周期",
    spine: [
      {
        label: "初始标记",
        why: "短 STW。只标 GC Roots 能直接碰到的对象。",
        body: "停世界，快速标根直接关联的老年代对象。年轻代收集器通常是 ParNew 搭配。",
      },
      {
        label: "并发标记",
        why: "和应用一起跑，把图走完。这里用三色 + 增量更新写屏障。",
        body: "耗时长但不停顿（仍占 CPU）。应用还在分配，所以会有漏标风险，留给下一阶段。",
      },
      {
        label: "重新标记",
        why: "再一次 STW。处理并发期的漏标，是 CMS 停顿的大头之一。",
        body: "扫描脏卡、补上增量更新记下的边。对象多、卡脏时 remark 会拉长。",
      },
      {
        label: "并发清除",
        why: "把白色对象串进空闲列表。不整理，所以堆碎。",
        body: "清除完用空闲列表分配。碎片多了，来了大对象可能放不下，并发失败，退化成 Serial Old 的 Full GC——这就是 CMS 被嫌弃的主因。",
      },
    ],
    oneLiner: "CMS 用并发标记清除换短停顿，代价是碎片和复杂的失败路径。JDK 9 弃用，14 删除。",
    analogy:
      "营业中盘点过道（并发标记），打烊两分钟对账（remark），然后把空座位登记到空位表（清除）但不重新摆桌子。时间久了桌子缝里卡着空位，来一桌大客就只能整厅重排（Full GC）。",
    structure: "ParNew 收年轻代 + CMS 收老年代。老年代标记-清除，无压缩。",
    ordered: "—",
    threadSafe: "并发期和应用抢 CPU",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 8 可用；JDK 9 deprecated；JDK 14 移除",
    time: dash,
    facts: [
      { label: "年轻代", value: "ParNew" },
      { label: "老年代", value: "标记-清除" },
      { label: "整理", value: "不做，所以碎片" },
      { label: "结局", value: "JDK 14 删除" },
    ],
    highlights: [
      "四个阶段：初始标记、并发标记、重新标记、并发清除",
      "失败：Concurrent Mode Failure → Full GC",
      "浮动垃圾：并发期新产生的垃圾要等下一轮",
      "现在面试重点是「为什么淘汰」，不是怎么再调优 CMS",
    ],
    internals: [
      {
        title: "为什么会 concurrent mode failure",
        body: "并发周期还没结束，老年代已经装不下新晋升的对象。预留空间不够、晋升太快、碎片导致连续空间不足都会触发。失败后用 Serial Old 整堆压缩，停顿会很痛。",
      },
      {
        title: "CPU 和停顿的交换",
        body: "并发标记、清除都占核。延迟敏感服务愿意拿 CPU 换停顿；吞吐量型（Parallel GC）反而可能更合适。这是选型，不是 CMS 绝对更先进。",
      },
    ],
    pitfalls: [
      "说 CMS 没有 STW。初始标记和重新标记都停。",
      "新项目还上 CMS。JDK 14+ 没有，默认走 G1。",
      "碎片问题不是调几次参数就能从根上消失，这是算法决定的。",
    ],
    useWhen: ["存量 JDK 8 服务、被问 CMS 过程与缺陷"],
    avoidWhen: ["在 JDK 17/21 上把 CMS 当默认方案"],
    code: {
      title: "JDK 8 上的开关（新项目不要再用）",
      source: `// JDK 8
// -XX:+UseConcMarkSweepGC
// -XX:+UseParNewGC

// JDK 14+ 已删除，请用 G1 / ZGC
// -XX:+UseG1GC`,
    },
    vs: [
      {
        other: "G1",
        point: "G1 按 Region 整理，能压缩，有停顿目标。CMS 不压缩。",
      },
      {
        other: "Parallel GC",
        point: "Parallel 吞吐优先，STW 做完整收集。CMS 延迟优先，牺牲吞吐和碎片。",
      },
    ],
    interviewAnswer:
      "CMS 是 JDK 8 常见的老年代并发收集器：短 STW 初始标记，并发标记，再 STW 重新标记，然后并发清除。不整理所以碎片化，并发失败会退化成 Full GC。写屏障是增量更新。JDK 9 弃用、14 删除，新项目用 G1 或 ZGC。",
  },
  {
    id: "g1",
    name: "G1",
    jdkInterface: "Garbage First · Mixed GC",
    kind: "GC",
    category: "JVM",
    module: "垃圾回收",
    moduleRole:
      "JDK 9 起默认收集器。堆切成 Region，谁垃圾多先收谁。Mixed GC 是它区别于 CMS Full 的关键动作。",
    prereqs: ["tricolor", "cms"],
    next: ["zgc"],
    spineTitle: "从 Young 走到 Mixed",
    spine: [
      {
        label: "Region 堆",
        why: "不再是整块 Eden/Old 连续切开，而是 1～32MB 的小块贴年轻或老年代标签。",
        body: "大对象占 Humongous Region。收集单位是 Region，可以只选一部分老 Region 动手，所以能控制停顿。",
      },
      {
        label: "Young GC",
        why: "Eden 满了，把年轻 Region 里的存活对象拷到 Survivor 或晋升。",
        body: "停顿时只处理年轻代 Region。Remembered Set 记下老 → 年轻的跨 Region 引用，避免扫全堆。",
      },
      {
        label: "并发标记",
        why: "老年代也需要知道哪些 Region 垃圾最多（Garbage First）。",
        body: "SATB 写屏障。标记完按回收收益排序 Region。",
      },
      {
        label: "Mixed GC",
        why: "一次 STW 里：所有年轻 Region + 一组高收益老 Region。这就是 Mixed。",
        body: "不是 Full GC。目标是在 MaxGCPauseMillis（默认 200ms）附近清空足够垃圾。清理不动才可能落到 Full。",
      },
    ],
    oneLiner: "G1 把堆切成 Region，优先收垃圾多的。Mixed GC = 年轻代全收 + 部分老年代，用来代替动不动 Full。",
    analogy:
      "小区按楼栋（Region）管理。先扫租客流动大的青年公寓（Young），再挑卫生最差的几栋老楼一起扫（Mixed），而不是每次封整个小区（Full）。",
    structure: "Region 组成逻辑上的年轻代/老年代。收集时拷贝到空 Region，自带压缩效果。",
    ordered: "—",
    threadSafe: "—",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 9 默认；JDK 8u40+ 可用",
    time: dash,
    facts: [
      { label: "默认", value: "JDK 9+" },
      { label: "停顿目标", value: "MaxGCPauseMillis" },
      { label: "Mixed", value: "年轻 + 部分老 Region" },
      { label: "屏障", value: "SATB" },
    ],
    highlights: [
      "Garbage First：先收垃圾占比高的 Region",
      "Mixed GC ≠ Full GC",
      "拷贝到空 Region，所以能整理碎片",
      "RSet 有内存开销，Region 太小会更重",
    ],
    internals: [
      {
        title: "停顿目标不是硬保证",
        body: "-XX:MaxGCPauseMillis=200 是目标。存活对象太多、RSet 太大、Humongous 分配失败时仍可能超。调参先看 GC 日志里 Evacuation Failure / Full。",
      },
      {
        title: "和 CMS 的本质差别",
        body: "CMS 老年代不压缩；G1 转移时压缩。CMS remark 扫脏卡可能很重；G1 用 SATB 和按 Region 回收来控停顿。所以它能接过默认收集器的位置。",
      },
    ],
    pitfalls: [
      "把 Mixed 说成 Full。Full 在 G1 里是失败兜底，很重。",
      "堆很小还开 G1，RSet 开销可能不划算。很大堆、延迟敏感才是主场。",
      "Humongous 分配失败会直接逼出异常或 Full，大数组要小心。",
    ],
    useWhen: ["JDK 9+ 默认、要控停顿的服务堆"],
    avoidWhen: ["堆只有几百 MB 还硬套一套复杂 G1 调参"],
    code: {
      title: "G1 常用启动参数",
      source: `// JDK 9+ 默认就是 G1，仍可显式打开
// -XX:+UseG1GC
// -XX:MaxGCPauseMillis=200
// -Xms4g -Xmx4g   // 堆大小固定，减少扩容带来的 Full`,
    },
    vs: [
      {
        other: "CMS",
        point: "G1 能压缩、有 Mixed、有停顿目标；CMS 碎片和失败路径差。JDK 14 后没有 CMS。",
      },
      {
        other: "ZGC",
        point: "ZGC 冲亚毫秒停顿、堆可以很大；G1 更成熟、调参资料多，JDK 8/11 仍常见。",
      },
    ],
    interviewAnswer:
      "G1 把堆分成 Region，Young GC 收年轻 Region。并发标记后按垃圾收益排序，Mixed GC 一次收掉全部年轻代加部分老年代 Region。SATB 写屏障。停顿有目标但不是承诺。它能整理内存，这是对 CMS 碎片的回答。Full GC 仍是退路，要当事故查。",
  },
  {
    id: "zgc",
    name: "ZGC",
    jdkInterface: "Z Garbage Collector",
    kind: "GC",
    category: "JVM",
    module: "垃圾回收",
    moduleRole:
      "超大堆、极短停顿的那条线。染色指针 + 读屏障让转移也可以并发。JDK 21 起有分代 ZGC。",
    prereqs: ["g1"],
    next: ["jvm-tools"],
    spineTitle: "停顿不随堆变大",
    spine: [
      {
        label: "着色指针",
        why: "把颜色/重定位信息存在指针高位，而不是只存在对象头。",
        body: "读引用时就能知道对象是否被移动、是否已标记。这是和 CMS/G1 写屏障思路不同的地方。",
      },
      {
        label: "读屏障",
        why: "应用每次从堆里读引用，都可能被插入「如果对象搬过家，就去转发表改写成新地址」。",
        body: "所以转移阶段可以和应用并发：老地址还能被读屏障纠正。停顿不再跟活对象体积线性涨。",
      },
      {
        label: "并发整理",
        why: "大堆最怕的是「停下来搬活对象」。ZGC 把搬也并发掉。",
        body: "STW 只剩根扫描等极短阶段，官方目标常说亚毫秒到几毫秒级，不随  TB 级堆线性变长。",
      },
      {
        label: "分代 ZGC",
        why: "JDK 21 起默认分代，年轻对象还是朝生夕死，吞吐更好。",
        body: "JDK 11 实验、15 生产就绪、21 分代。面试要报版本，别把 11 和 21 说成同一个 ZGC。",
      },
    ],
    oneLiner: "ZGC 用染色指针和读屏障做并发转移，停顿短且不跟堆大小成正比。超大堆、低延迟选它。",
    analogy:
      "搬家时街上还在通车。每辆车经过路口（读引用）看一眼路牌（读屏障），发现门牌改了就转到新地址。不用封整条路（长 STW）等全部家具搬完。",
    structure: "染色指针 + 读屏障 + 转发表。堆可以很大；JDK 21 前不分代是它吞吐上的老短板。",
    ordered: "—",
    threadSafe: "—",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 15 生产可用；JDK 21 分代 ZGC",
    time: dash,
    facts: [
      { label: "JDK 11", value: "实验" },
      { label: "JDK 15", value: "生产就绪" },
      { label: "JDK 21", value: "分代 ZGC" },
      { label: "停顿", value: "不随堆线性增长" },
    ],
    highlights: [
      "读屏障 vs CMS/G1 的写屏障，面试要能对比",
      "适合很大的堆、延迟敏感",
      "平台：需要一定位数的指针，早期不支持 32 位",
      "不是「没有 STW」，是 STW 极短",
    ],
    internals: [
      {
        title: "为什么停顿能跟堆脱钩",
        body: "传统收集停顿里最重的往往是扫描或搬迁活对象，活对象随堆涨。ZGC 把扫描和转移并发化，停顿里做的事情接近「固定量的根处理」，所以堆从 8G 到 1T 停顿仍可控制。",
      },
      {
        title: "读屏障的代价",
        body: "几乎每次读引用都可能多一次检查。用吞吐换延迟。对象读取极密的计算型负载要实测，不要只看暂停时间广告。",
      },
    ],
    pitfalls: [
      "说 ZGC 零停顿。仍然有短 STW。",
      "JDK 11 就当生产默认。那时还是实验特性。",
      "小堆、短生命周期进程，G1 往往够用，ZGC 不是必须。",
    ],
    useWhen: ["堆很大、尾延迟敏感、已在 JDK 15/17/21"],
    avoidWhen: ["JDK 8 服务、小堆批处理"],
    code: {
      title: "打开 ZGC",
      source: `// JDK 15+
// -XX:+UseZGC
// -Xmx32g

// JDK 21 分代 ZGC（默认随 UseZGC 开启，以发行说明为准）
// 关注 GC 日志里的 Pause 是否稳定在毫秒级`,
    },
    vs: [
      {
        other: "G1",
        point: "G1 Mixed 仍可能几十到上百毫秒；ZGC 冲更短停顿。G1 生态更熟，JDK 8 能上。",
      },
      {
        other: "CMS",
        point: "都想低延迟，但 CMS 碎片 + 已删除。ZGC 能并发整理。",
      },
    ],
    interviewAnswer:
      "ZGC 把标记和转移都做成并发：指针里带颜色，读引用走读屏障，对象搬走了也能被纠正。所以停顿不随堆变大线性增加。JDK 15 生产可用，21 有分代。它不是零 STW。小堆或 JDK 8 用 G1/CMS 那条线。",
  },
  {
    id: "jvm-tools",
    name: "排查工具",
    jdkInterface: "jps / jstat / jmap / jstack / Arthas",
    kind: "工具",
    category: "JVM",
    module: "JVM 实战",
    moduleRole:
      "前面讲的堆、GC、OOM，线上要靠工具落地。先定位进程，再看 GC、堆、线程，最后才上 Arthas 动态看。",
    prereqs: ["oom", "generational-gc"],
    next: [],
    spineTitle: "一次线上排查从 pid 走到证据",
    spine: [
      {
        label: "jps",
        why: "先找到 Java 进程。后面所有命令都要 pid。",
        body: "jps -l 列出主类。容器里可能只有一个 Java，也先确认别附错进程。JDK 7+ 也可用 jcmd 列进程。",
      },
      {
        label: "jstat",
        why: "看 GC 在干什么：年轻代、老年代、Metaspace 占比，以及 GC 次数和耗时。",
        body: "jstat -gcutil pid 1000 每秒打一行。YGC/FGC 暴涨、老年代持续 100%，就是 Full 循环或泄漏的现场，不必先 dump。",
      },
      {
        label: "jmap",
        why: "看堆里谁占着。live 直方图或 dump 给 MAT。",
        body: "jmap -histo:live pid 看类实例数。jmap -dump:live,format=b,file=heap.hprof pid 出快照。JDK 9+ 更推荐 jcmd pid GC.heap_dump。dump 会 STW，业务高峰要谨慎。",
      },
      {
        label: "jstack",
        why: "CPU 飙高、线程死锁、接口卡住，看的是栈不是堆。",
        body: "jstack pid 或 jcmd Thread.print。多次采样对比：同一方法一直占着，多半热点或锁。死锁会直接打 deadlock。",
      },
      {
        label: "Arthas",
        why: "不能停机、不能加日志时，往已经跑着的 JVM 里插眼。",
        body: "dashboard 看全局，thread 看繁忙线程，jad 反编译，watch/trace 看方法入参和耗时，heapdump、memory 补堆视角。用完 stop。权限和安全要管好。",
      },
    ],
    oneLiner: "jps 找进程，jstat 看 GC，jmap 看堆，jstack 看线程，Arthas 在不停机时把这些能力接到方法级。",
    analogy:
      "医院分诊：先确认是哪个病人（jps），看体温曲线（jstat），拍 CT（jmap），看神经反射（jstack）。Arthas 是床旁超声，人不用下手术台。",
    structure: "JDK 自带命令在 bin 下，附到同一用户的 JVM。Arthas 是阿里开源的诊断客户端，attach 进进程。",
    ordered: "—",
    threadSafe: "dump 和部分 attach 会停顿",
    nullKey: "—",
    nullValue: "—",
    defaultCapacity: "JDK 9+ 优先记 jcmd，jmap/jstack 仍常考",
    time: dash,
    facts: [
      { label: "进程", value: "jps -l" },
      { label: "GC", value: "jstat -gcutil" },
      { label: "堆", value: "jmap / jcmd" },
      { label: "线程", value: "jstack" },
    ],
    highlights: [
      "先现象再工具：GC 用 jstat，卡顿用 jstack，泄漏用 dump",
      "histo 比全量 dump 轻；dump 能做引用链分析",
      "CPU 100%：top 找线程 id 再转十六进制对 jstack",
      "Arthas：dashboard、thread、jad、watch、trace、logger",
    ],
    internals: [
      {
        title: "CPU 飙高怎么对到 Java 栈",
        body: "top -H -p pid 看线程，把十进制 nid 转十六进制，去 jstack 里搜 nid。对上的栈就是热点。不要只说「用 profiler」。",
      },
      {
        title: "dump 的代价",
        body: "heap dump 要走过活对象，通常 STW。文件和堆一样大。容器磁盘不够会失败。能 histo 解决的先 histo。",
      },
    ],
    pitfalls: [
      "在高峰直接 jmap dump 把服务卡死。先 jstat 确认，再挑低峰或隔离实例。",
      "jstack 只抓一次。偶发卡要连续几份对比。",
      "Arthas watch 生产方法要限制次数和条件，别把流量打爆日志。",
    ],
    useWhen: ["线上 CPU、Full GC、死锁、不能发版加日志"],
    avoidWhen: ["本地用 System.out 就能复现时还上 Arthas 装样子"],
    code: {
      title: "一套最短排查命令",
      source: `jps -l
jstat -gcutil <pid> 1000
jmap -histo:live <pid>
# JDK 9+：jcmd <pid> GC.heap_dump /tmp/heap.hprof
jstack <pid> > /tmp/stack.txt

# Arthas
# dashboard
# thread -n 5
# watch demo.OrderService create '{params,returnObj,throwExp}' -n 5
# stop`,
    },
    vs: [
      {
        other: "jstat vs jmap",
        point: "jstat 看趋势和 GC 计数；jmap 看堆里类的占用或出 dump。先趋势后快照。",
      },
      {
        other: "jstack vs Arthas thread",
        point: "jstack 是 JDK 自带快照；Arthas 能按 CPU 排序、交互式看，还能 jad/watch。",
      },
    ],
    interviewAnswer:
      "先 jps 定位 pid。怀疑 GC 用 jstat -gcutil 看各区比例和 FGC。泄漏用 jmap histo 或 dump 加 MAT。卡顿、死锁、CPU 用 jstack，必要时 top -H 对 nid。不能重启就用 Arthas：dashboard、thread、jad、watch/trace。dump 会停顿，生产要选实例和时间。",
  },
];
