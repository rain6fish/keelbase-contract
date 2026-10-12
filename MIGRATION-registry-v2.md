# Migrating to `wire-schema-registry-v2.json`

`wire-schema-registry-v2.json` is the same index as v1 with one thing settled: how `objects[].schema`
is written. It is **additive** — v1 is unchanged, and nothing here obliges a consumer to move.

## What changed

`schema` is now always the **bare file name**, resolved as `schemas/<version>/<schema>` with the
entry's own `version` beside it. The `vN/` segment no longer appears inside the file name: eight
entries carried it as well as in `version`, which is one rule for the reader to know and buys nothing.

Two entries also stop naming files that are not on disk. `sse-event` and `confirmation-request` carried
a `-vN` suffix inside the file name that the real file does not have; v2 names
`sse-event.schema.json` and `confirmation-request.schema.json`, which is what is there. That half is a
**correction of a typo**, not a choice of encoding, and it is the frozen debt
`runner/check-registry-paths.mjs` has been carrying — ADR-0007 §3 `Q10` settles both halves at once.

## Who reads the registry today

| consumer | where |
|---|---|
| this repository's own gate | `runner/check-registry-paths.mjs` |
| the TypeScript line | **four** specs resolve a `schema` into a path and carry v1's second spelling — `src/ai/audit/audit-query.service.spec.ts` · `src/ai/scenarios-pack.spec.ts` · `src/ai/tool-effects/ai-tool-effects.service.spec.ts` · `src/ai/trace/decision-trace.service.spec.ts`. Four more read the index without resolving a path (`src/ai/failure-semantics.spec.ts` · `src/app-version/capabilities.service.spec.ts` · `src/common/wire-schema/wire-schema.spec.ts` · `src/realtime/realtime.types.spec.ts`) and need nothing |
| the Java line | `keelbase4j-protocol/.../WireSchemas.java`, documented in `PermissionWireTest` |

**Moved so far:** this repository's own gate, on 2026-10-12 — it reads v2, and the rule-B branch and the
two-entry allowlist are gone with it. The TypeScript and Java lines have **not** moved; the strict form
in `package.json` stays off until they have.

## What to do

1. Point the constant at `wire-schema-registry-v2.json`.
2. Delete any rule-B handling and any special case for the two entries above — both exist only because
   of v1.
3. `runner/check-registry-paths.mjs --strict` is the gate to switch on **after** the consumers have
   moved: against v2 it has nothing left to allowlist.

## What did not change

The **contract's version line**, and the schemas themselves. The registry carries its own
`registryVersion`, which is what this file moves to `v2`; a consumer that does not migrate keeps
working exactly as it does today, readings and allowances included.

---

# 迁移到 `wire-schema-registry-v2.json`

`wire-schema-registry-v2.json` 与 v1 是同一份索引，只把一件事定死：`objects[].schema` 怎么写。它是**加性**的
—— v1 一字未动，这里也没有任何一条要求消费方必须迁移。

## 改了什么

`schema` 现在**一律是裸文件名**，按 `schemas/<version>/<schema>` 解析，版本由条目自己的 `version` 带。`vN/`
段不再出现在文件名里：有八条既写进了 `version`、也写进了文件名 —— 那让读的人多背一条规则，却什么也买不到。

另两条也不再指向磁盘上不存在的文件。`sse-event` 与 `confirmation-request` 的文件名里带了个真文件没有的 `-vN`
后缀；v2 写的是 `sse-event.schema.json` 与 `confirmation-request.schema.json`，也就是**实存的那两个**。这半边是
**改错字**、不是选编码，而它正是 `runner/check-registry-paths.mjs` 一直背着的那笔**冻结的债** —— ADR-0007 §3
的 `Q10` 把两半一并定下。

## 今天谁在读这份索引

| 消费方 | 位置 |
|---|---|
| 本仓自己的门 | `runner/check-registry-paths.mjs` |
| TypeScript 线 | **四个** spec 会把 `schema` 解析成路径、且带着 v1 的第二套写法 —— `src/ai/audit/audit-query.service.spec.ts` · `src/ai/scenarios-pack.spec.ts` · `src/ai/tool-effects/ai-tool-effects.service.spec.ts` · `src/ai/trace/decision-trace.service.spec.ts`。另有四个只读索引、不解析路径（`src/ai/failure-semantics.spec.ts` · `src/app-version/capabilities.service.spec.ts` · `src/common/wire-schema/wire-schema.spec.ts` · `src/realtime/realtime.types.spec.ts`），**什么都不用改** |
| Java 线 | `keelbase4j-protocol/.../WireSchemas.java`，`PermissionWireTest` 里有说明 |

**已经动了谁：** 本仓自己那道门，2026-10-12 —— 它读 v2，B 规则那段与那两条的 allowlist 一并删掉了。
**TS 线与 Java 线都还没动**；`package.json` 里那档 strict 在它们动完之前**不开**。

## 要做什么

1. 常量改指 `wire-schema-registry-v2.json`。
2. 删掉任何 B 规则的兼容代码、以及上面那两条的特例 —— 两者都只因 v1 而存在。
3. `runner/check-registry-paths.mjs --strict` 是**消费方迁完之后**才开的那道门：对着 v2，它没有债可 allowlist。

## 没有改变的东西

**契约的版本线**，以及 schema 本身。registry 有它自己的 `registryVersion`，本文件把它移到 `v2` 的就是它；
不迁移的消费方**照旧工作**，读数与豁免一如今日。
