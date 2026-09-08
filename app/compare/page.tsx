import type { Metadata } from "next";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compareRows, complexityRows, jvmCompareRows, languageCompareRows } from "@/lib/compare";

export const metadata: Metadata = {
  title: "对照表",
  description: "七个 Java 集合对照，泛型 / Stream，以及 JVM 内存、收集器、排查工具。",
};

export default function ComparePage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">一张表看完差异</h1>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          集合按结构对照。语言特性按模块对照。JVM 按「内存 → 收集器 → 工具」对照。
        </p>
      </header>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">核心差异</h2>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>集合</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>底层</TableHead>
                <TableHead>顺序</TableHead>
                <TableHead>线程安全</TableHead>
                <TableHead>null key/元素</TableHead>
                <TableHead>null value</TableHead>
                <TableHead>查找</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`/${row.id}`} className="underline-offset-4 hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.kind}</TableCell>
                  <TableCell className="whitespace-normal min-w-36">{row.structure}</TableCell>
                  <TableCell className="whitespace-normal min-w-36">{row.ordered}</TableCell>
                  <TableCell>{row.threadSafe}</TableCell>
                  <TableCell className="whitespace-normal min-w-32">{row.nullKey}</TableCell>
                  <TableCell className="whitespace-normal min-w-24">{row.nullValue}</TableCell>
                  <TableCell className="whitespace-normal min-w-40">{row.lookup}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">时间复杂度</h2>
        <p className="text-sm text-muted-foreground">
          Hash 系列说的是平均情况；最坏要看哈希是否均匀、有没有树化。TreeMap 始终是对数。
        </p>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>集合</TableHead>
                <TableHead>get / 按下标</TableHead>
                <TableHead>增加</TableHead>
                <TableHead>删除</TableHead>
                <TableHead>contains</TableHead>
                <TableHead>遍历</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complexityRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`/${row.id}`} className="underline-offset-4 hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-normal min-w-40">{row.get}</TableCell>
                  <TableCell className="whitespace-normal min-w-40">{row.add}</TableCell>
                  <TableCell className="whitespace-normal min-w-40">{row.remove}</TableCell>
                  <TableCell className="whitespace-normal min-w-36">{row.contains}</TableCell>
                  <TableCell className="whitespace-normal min-w-40">{row.iterate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">语言特性</h2>
        <p className="text-sm text-muted-foreground">
          和集合不是同一张表。先看一句话，点进去看 PECS、擦除、惰性求值这些常考点。
        </p>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>主题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>引入</TableHead>
                <TableHead>一句话</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languageCompareRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`/${row.id}`} className="underline-offset-4 hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.kind}</TableCell>
                  <TableCell className="whitespace-nowrap">{row.fact}</TableCell>
                  <TableCell className="whitespace-normal min-w-64">{row.oneLiner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">JVM</h2>
        <p className="text-sm text-muted-foreground">
          内存怎么切、垃圾怎么收、线上怎么查。版本差要说清：CMS 在 14 删除，G1 是 9 默认，ZGC 15 生产、21 分代。
        </p>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>主题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>版本 / 口径</TableHead>
                <TableHead>一句话</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jvmCompareRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`/${row.id}`} className="underline-offset-4 hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.kind}</TableCell>
                  <TableCell className="whitespace-normal min-w-40">{row.fact}</TableCell>
                  <TableCell className="whitespace-normal min-w-64">{row.oneLiner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-3 rounded-xl border bg-muted/30 p-4">
        <h2 className="text-lg font-semibold">容易混的几组</h2>
        <ul className="grid gap-2 text-sm leading-7">
          <li>
            <strong>HashMap 家族：</strong>
            主干是 put → hash → 定位 → 冲突 → 树化 → resize。LinkedHashMap 加顺序，TreeMap 换成比较，CHM 加锁，HashSet 当 key。
          </li>
          <li>
            <strong>HashMap vs LinkedHashMap vs TreeMap：</strong>
            无序 / 插入或访问顺序 / key 的大小顺序。
          </li>
          <li>
            <strong>HashMap vs ConcurrentHashMap vs Hashtable：</strong>
            单线程 / 桶级并发 / 整表锁（过时）。后两者都不能存 null。
          </li>
          <li>
            <strong>ArrayList vs LinkedList：</strong>
            数组随机访问 vs 链表头尾操作。默认选 ArrayList。
          </li>
          <li>
            <strong>泛型 vs 类型擦除：</strong>
            源码里的契约 / 编译落到字节码时把 T 抹掉。
          </li>
          <li>
            <strong>Lambda vs 函数式接口：</strong>
            箭头写法 / 它能插进去的 SAM 插头。
          </li>
          <li>
            <strong>orElse vs orElseGet：</strong>
            默认值总会算 / 只在 Optional 为空时才算。
          </li>
          <li>
            <strong>Young / Minor vs Full vs Mixed：</strong>
            年轻代 / 整堆 / G1 的年轻代加一部分老 Region。
          </li>
          <li>
            <strong>CMS vs G1 vs ZGC：</strong>
            标记清除会碎片且已删除 / Region + Mixed / 读屏障并发转移。
          </li>
          <li>
            <strong>OOM vs StackOverflowError：</strong>
            堆或本地内存要不到 / 线程栈太深。
          </li>
        </ul>
      </section>
    </div>
  );
}
