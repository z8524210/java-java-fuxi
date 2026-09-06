# Java 集合面试速记

一份面向面试的 Java 集合复习站，覆盖这 7 个最常考的类：

- ArrayList
- LinkedList
- HashMap
- ConcurrentHashMap
- HashSet
- TreeMap
- LinkedHashMap

内容按「一句话记住 → 底层结构 → 复杂度 → 源码常考点 → 坑 → 面试收口」来写，默认以 **JDK 8 及以后** 为准，JDK 7 的差异（例如 ConcurrentHashMap 的 Segment、HashMap 头插死循环）会单独标出。

## 常用指令

需要 Node.js 18+。服务默认跑在 **43217** 端口。

第一次先装依赖：

```bash
npm install
```

| 你想做什么 | 指令 |
| --- | --- |
| 启动开发服务（热更新） | `npm run dev` |
| 关掉开发服务 | 在跑服务的那个终端里按 **Ctrl+C** |
| 生产构建 | `npm run build` |
| 启动生产服务 | `npm start`（先 build） |
| 关掉生产服务 | 同样在对应终端里 **Ctrl+C** |
| 检查代码 | `npm run lint` |

浏览器打开 [http://127.0.0.1:43217](http://127.0.0.1:43217)。

找不到那个终端、服务还占着端口时，可以按端口关掉：

```bash
kill $(lsof -t -i:43217)
```

macOS / Linux 通用。关掉后若要再开，重新执行 `npm run dev` 即可。

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 选型口诀和 7 个集合入口 |
| `/compare` | 结构 / null / 线程安全 / 复杂度对照表 |
| `/questions` | 高频面试题，可按集合筛选 |
| `/arraylist` 等 | 单个集合的详细笔记 |

## 技术栈

Next.js、TypeScript、Tailwind CSS、shadcn/ui。资料写在 `lib/collections.ts` 和 `lib/questions.ts`，改内容不用动页面结构。
