import type { ReactNode } from "react";

import type { CollectionId } from "@/lib/collections";

function Frame({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border bg-muted/40">
      <div className="px-3 py-4 sm:px-5">{children}</div>
      <figcaption className="border-t bg-background/80 px-4 py-2 text-xs text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

function Box({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-10 min-w-10 items-center justify-center rounded-md border px-2 font-mono text-xs ${
        active
          ? "border-primary/40 bg-primary text-primary-foreground"
          : "bg-background"
      }`}
    >
      {children}
    </div>
  );
}

function ArrayListDiagram() {
  return (
    <Frame caption="连续数组。size=4，后面两格是预留容量。中间插入要把 3、4 往后搬。">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">index</span>
        {["0", "1", "2", "3", "4", "5"].map((i) => (
          <span key={i} className="w-10 text-center font-mono text-[10px] text-muted-foreground">
            {i}
          </span>
        ))}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">data</span>
        <Box active>A</Box>
        <Box active>B</Box>
        <Box active>C</Box>
        <Box active>D</Box>
        <Box>空</Box>
        <Box>空</Box>
      </div>
    </Frame>
  );
}

function LinkedListDiagram() {
  return (
    <Frame caption="双向链表。每个节点记住前驱和后继。头尾改指针即可，找中间要从一头走。">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="rounded-full border bg-background px-2 py-1">first</span>
        <span className="text-muted-foreground">↔</span>
        {["A", "B", "C"].map((item) => (
          <div key={item} className="flex items-center gap-1">
            <div className="rounded-lg border bg-background px-2 py-1 text-center">
              <div className="font-mono text-[10px] text-muted-foreground">prev | data | next</div>
              <div className="font-medium">{item}</div>
            </div>
            <span className="text-muted-foreground">↔</span>
          </div>
        ))}
        <span className="rounded-full border bg-background px-2 py-1">last</span>
      </div>
    </Frame>
  );
}

function HashMapDiagram() {
  const bins = [
    { i: 0, nodes: ["Tom"] },
    { i: 1, nodes: [] },
    { i: 2, nodes: ["Ada", "Bob"] },
    { i: 3, nodes: ["树: Kai…"] },
  ];
  return (
    <Frame caption="主链：put → hash 扰动 → (n-1)&hash 定位。桶 2 是链表；桶 3 过长已树化。超 0.75 再 resize。">
      <div className="mb-3 flex flex-wrap items-center gap-1 text-[11px]">
        {["put", "hash", "(n-1)&hash", "冲突", "链表", "红黑树", "resize"].map((label, index) => (
          <span key={label} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground">→</span>}
            <span className="rounded-md border bg-background px-1.5 py-0.5 font-mono">{label}</span>
          </span>
        ))}
      </div>
      <div className="grid gap-2">
        {bins.map((bin) => (
          <div key={bin.i} className="flex flex-wrap items-center gap-2">
            <Box>{bin.i}</Box>
            {bin.nodes.length === 0 ? (
              <span className="text-xs text-muted-foreground">空桶</span>
            ) : (
              bin.nodes.map((node, idx) => (
                <div key={node} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-muted-foreground">→</span>}
                  <div className="rounded-md border bg-background px-2 py-1 font-mono text-xs">
                    {node}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </Frame>
  );
}

function ConcurrentHashMapDiagram() {
  return (
    <Frame caption="JDK 8：空桶用 CAS 抢着放；已有链表时只锁该桶头节点。其它桶不受影响。">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border bg-background p-3">
          <div className="text-xs font-medium">桶 0 · 空</div>
          <p className="mt-1 text-xs text-muted-foreground">CAS 放入新节点，不用 synchronized</p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="text-xs font-medium">桶 2 · 正在写入（锁头节点）</div>
          <p className="mt-1 font-mono text-xs">Ada → Bob</p>
        </div>
        <div className="rounded-lg border bg-background p-3">
          <div className="text-xs font-medium">桶 3 · 只读 get</div>
          <p className="mt-1 text-xs text-muted-foreground">volatile 读，不加锁</p>
        </div>
        <div className="rounded-lg border bg-background p-3">
          <div className="text-xs font-medium">扩容中</div>
          <p className="mt-1 text-xs text-muted-foreground">看到 ForwardingNode 就帮忙搬迁</p>
        </div>
      </div>
    </Frame>
  );
}

function HashSetDiagram() {
  return (
    <Frame caption="HashSet 内部就是 HashMap。元素当 key，value 全是同一个 PRESENT。">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="pb-2 font-medium">HashMap key</th>
              <th className="pb-2 font-medium">HashMap value</th>
              <th className="pb-2 font-medium">对 Set 的含义</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-t">
              <td className="py-2">&quot;java&quot;</td>
              <td>PRESENT</td>
              <td className="font-sans">集合里有 java</td>
            </tr>
            <tr className="border-t">
              <td className="py-2">&quot;go&quot;</td>
              <td>PRESENT</td>
              <td className="font-sans">集合里有 go</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

function TreeMapDiagram() {
  return (
    <Frame caption="红黑树中序遍历就是有序 key。每个节点比左子大、比右子小。">
      <div className="flex flex-col items-center gap-2 text-xs">
        <Box active>8</Box>
        <div className="flex gap-16">
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground">↙</span>
            <Box>3</Box>
            <div className="flex gap-6">
              <Box>1</Box>
              <Box>6</Box>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground">↘</span>
            <Box>10</Box>
            <Box>14</Box>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function LinkedHashMapDiagram() {
  return (
    <Frame caption="哈希表负责 O(1) 查找；外面的双向链表记住先后。accessOrder 时，最近访问的在尾巴。">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">桶</span>
          <Box>0</Box>
          <span className="text-muted-foreground">→</span>
          <div className="rounded-md border bg-background px-2 py-1">B</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">序</span>
          <span className="rounded-full border px-2 py-1">head 最久</span>
          <span className="text-muted-foreground">↔</span>
          <Box active>A</Box>
          <span className="text-muted-foreground">↔</span>
          <Box active>B</Box>
          <span className="text-muted-foreground">↔</span>
          <Box active>C</Box>
          <span className="text-muted-foreground">↔</span>
          <span className="rounded-full border px-2 py-1">tail 最近</span>
        </div>
      </div>
    </Frame>
  );
}

function GenericsDiagram() {
  return (
    <Frame caption="编译期：List<String> 只能 add 字符串。运行时盒子上的 <String> 标签会被撕掉。">
      <div className="flex flex-col gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-muted-foreground">源码</span>
          <div className="rounded-lg border bg-background px-3 py-2">
            <div className="font-mono text-[10px] text-muted-foreground">List&lt;T&gt;</div>
            <div className="font-medium">T = String</div>
          </div>
          <span className="text-muted-foreground">→ add("a") 行，add(1) 不行</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-muted-foreground">PECS</span>
          <Box active>? extends</Box>
          <span className="text-muted-foreground">只能取</span>
          <Box>? super</Box>
          <span className="text-muted-foreground">适合放</span>
        </div>
      </div>
    </Frame>
  );
}

function TypeErasureDiagram() {
  return (
    <Frame caption="两个不同的 List 编译后是同一个类。取值处由编译器插入强转。">
      <div className="grid gap-3 text-xs sm:grid-cols-2">
        <div className="rounded-lg border bg-background px-3 py-2">
          <div className="text-[10px] text-muted-foreground">编译前</div>
          <div className="mt-1 font-mono">List&lt;String&gt; a</div>
          <div className="font-mono">List&lt;Integer&gt; b</div>
        </div>
        <div className="rounded-lg border bg-background px-3 py-2">
          <div className="text-[10px] text-muted-foreground">擦除后</div>
          <div className="mt-1 font-mono">List a</div>
          <div className="font-mono">List b</div>
          <div className="mt-1 text-muted-foreground">a.getClass() == b.getClass()</div>
        </div>
      </div>
    </Frame>
  );
}

function StreamDiagram() {
  return (
    <Frame caption="中间操作只是挂工序，终端操作按下才开工。这条流水线用完即弃。">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="rounded-full border bg-background px-2 py-1">source</span>
        <span className="text-muted-foreground">→</span>
        <Box>filter</Box>
        <span className="text-muted-foreground">→</span>
        <Box>map</Box>
        <span className="text-muted-foreground">→</span>
        <Box>distinct</Box>
        <span className="text-muted-foreground">→</span>
        <Box active>collect</Box>
      </div>
      <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
        <span>filter / map / distinct：懒，还没遍历</span>
        <span>collect：终端，真正跑，之后流作废</span>
      </div>
    </Frame>
  );
}

function LambdaDiagram() {
  return (
    <Frame caption="箭头必须插进函数式接口这个插座。this 指向外层类，不是匿名类自己。">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="rounded-lg border bg-background px-3 py-2 font-mono">(s) -&gt; s.length()</div>
        <span className="text-muted-foreground">贴到</span>
        <Box active>Function</Box>
        <span className="text-muted-foreground">或</span>
        <Box>Predicate</Box>
        <span className="text-muted-foreground">才能编译</span>
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">
        捕获的局部变量必须是 effectively final · 底层 invokedynamic，不是 YourClass$1
      </div>
    </Frame>
  );
}

function FunctionalInterfaceDiagram() {
  return (
    <Frame caption="插座上只有一个插孔（抽象方法）。default / static 是旁边的 USB，不算插孔。">
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        {[
          ["Function<T,R>", "有进有出", "map"],
          ["Predicate<T>", "有进，返回 boolean", "filter"],
          ["Consumer<T>", "有进无出", "forEach"],
          ["Supplier<T>", "无进有出", "orElseGet"],
        ].map(([name, desc, use]) => (
          <div key={name} className="rounded-lg border bg-background px-3 py-2">
            <div className="font-mono font-medium">{name}</div>
            <div className="text-muted-foreground">{desc} · Stream.{use}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function OptionalDiagram() {
  return (
    <Frame caption="盒子要么装着值，要么空着。别伸手就 get，空的时候用 orElseGet / orElseThrow。">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="rounded-lg border bg-background px-3 py-2 text-center">
          <div className="text-[10px] text-muted-foreground">ofNullable(user)</div>
          <Box active>User</Box>
          <div className="mt-1">map → orElseGet</div>
        </div>
        <span className="text-muted-foreground">或</span>
        <div className="rounded-lg border bg-background px-3 py-2 text-center">
          <div className="text-[10px] text-muted-foreground">empty()</div>
          <Box>空</Box>
          <div className="mt-1">走默认值，不 NPE</div>
        </div>
      </div>
    </Frame>
  );
}

function ObjectCreateDiagram() {
  return (
    <Frame caption="new 先保证类就绪，再在 TLAB 里划一块，填零、写头，最后才 <init>。">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {["new", "类检查", "TLAB 分配", "零值", "对象头", "<init>"].map((step, index) => (
          <div key={step} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground">→</span>}
            <Box active={index === 2}>{step}</Box>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function ObjectLayoutDiagram() {
  return (
    <Frame caption="64 位开压缩指针时，空 Object 常见 16 字节：头 + 类型指针 + 对齐。">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <Box active>Mark Word 8B</Box>
        <Box>Klass 4B</Box>
        <Box>字段</Box>
        <Box>padding</Box>
      </div>
    </Frame>
  );
}

function GcRootDiagram() {
  return (
    <Frame caption="从根出发能走到的才活。两对象互指但脱离根，一样可以收。">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Box active>栈 / 静态 / JNI</Box>
        <span className="text-muted-foreground">→</span>
        <Box>活对象</Box>
        <span className="text-muted-foreground">走不到</span>
        <Box>垃圾</Box>
      </div>
    </Frame>
  );
}

function GenerationalGcDiagram() {
  return (
    <Frame caption="Young/Minor 收年轻代。Full 收整堆。Mixed 是 G1：年轻代 + 一部分老 Region。">
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg border bg-background px-3 py-2">
          <div className="font-medium">Eden + S0/S1</div>
          <div className="text-muted-foreground">Young / Minor GC</div>
        </div>
        <div className="rounded-lg border bg-background px-3 py-2">
          <div className="font-medium">老年代</div>
          <div className="text-muted-foreground">Old / Mixed</div>
        </div>
        <div className="rounded-lg border bg-background px-3 py-2">
          <div className="font-medium">整堆</div>
          <div className="text-muted-foreground">Full GC</div>
        </div>
      </div>
    </Frame>
  );
}

function OomDiagram() {
  return (
    <Frame caption="OOM 在堆或本地内存；SOE 在线程栈。先读异常后面那句话。">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Box active>heap / Metaspace / Direct</Box>
        <span className="text-muted-foreground">OOM</span>
        <Box>线程栈 -Xss</Box>
        <span className="text-muted-foreground">SOE</span>
      </div>
    </Frame>
  );
}

function TricolorDiagram() {
  return (
    <Frame caption="白未访、灰待扫、黑完成。漏标靠写屏障补；STW 只留给必须静止的片段。">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Box>白</Box>
        <span className="text-muted-foreground">→</span>
        <Box>灰</Box>
        <span className="text-muted-foreground">→</span>
        <Box active>黑</Box>
        <span className="text-muted-foreground">赋值时</span>
        <Box>写屏障</Box>
      </div>
    </Frame>
  );
}

function CmsDiagram() {
  return (
    <Frame caption="初始标记 / 再标记 STW，中间并发。清除不整理，碎片多了可能 Concurrent Mode Failure。">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {["初始标记", "并发标记", "再标记", "并发清除"].map((step, index) => (
          <div key={step} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground">→</span>}
            <Box active={index === 0 || index === 2}>{step}</Box>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function G1Diagram() {
  return (
    <Frame caption="Region 堆。Mixed = 所有年轻 Region + 一组垃圾最多的老 Region。">
      <div className="flex flex-wrap gap-1 text-xs">
        {["Y", "Y", "O", "Y", "H", "O"].map((tag, index) => (
          <Box key={`${tag}-${index}`} active={tag === "Y"}>
            {tag}
          </Box>
        ))}
        <span className="self-center text-muted-foreground">Y 年轻 · O 老 · H 大对象</span>
      </div>
    </Frame>
  );
}

function ZgcDiagram() {
  return (
    <Frame caption="读引用走读屏障。对象搬走了也能改到新地址，所以停顿不跟堆大小成正比。">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Box>旧地址</Box>
        <span className="text-muted-foreground">读屏障</span>
        <Box active>新地址</Box>
        <span className="text-muted-foreground">应用不用长停</span>
      </div>
    </Frame>
  );
}

function JvmToolsDiagram() {
  return (
    <Frame caption="先 pid，再选工具：GC 用 jstat，堆用 jmap，线程用 jstack，不停机用 Arthas。">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {["jps", "jstat", "jmap", "jstack", "Arthas"].map((step, index) => (
          <div key={step} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground">→</span>}
            <Box active={index === 0}>{step}</Box>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const diagrams: Record<CollectionId, () => ReactNode> = {
  arraylist: ArrayListDiagram,
  linkedlist: LinkedListDiagram,
  hashmap: HashMapDiagram,
  concurrenthashmap: ConcurrentHashMapDiagram,
  hashset: HashSetDiagram,
  treemap: TreeMapDiagram,
  linkedhashmap: LinkedHashMapDiagram,
  generics: GenericsDiagram,
  "type-erasure": TypeErasureDiagram,
  stream: StreamDiagram,
  lambda: LambdaDiagram,
  "functional-interface": FunctionalInterfaceDiagram,
  optional: OptionalDiagram,
  "object-create": ObjectCreateDiagram,
  "object-layout": ObjectLayoutDiagram,
  "gc-root": GcRootDiagram,
  "generational-gc": GenerationalGcDiagram,
  oom: OomDiagram,
  tricolor: TricolorDiagram,
  cms: CmsDiagram,
  g1: G1Diagram,
  zgc: ZgcDiagram,
  "jvm-tools": JvmToolsDiagram,
};

export function StructureDiagram({ id }: { id: CollectionId }) {
  const Diagram = diagrams[id];
  return <Diagram />;
}
