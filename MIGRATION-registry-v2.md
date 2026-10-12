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
two-entry allowlist are gone with it — and the **Java line**, which took the pin, widened its snapshot
pickup pattern, moved the constant and dropped its rule-B branch. The **TypeScript line is prepared but
not landed**. The strict form in `package.json` stays off until it is.

## What to do

1. Point the constant at `wire-schema-registry-v2.json`.
2. Delete any rule-B handling and any special case for the two entries above — both exist only because
   of v1.
3. **If you pick the contract up by file name rather than checking it out whole, widen the pattern.**
   A snapshot taken with a literal `wire-schema-registry.json` does not match `-v2`, and the drift check
   beside it then reports no drift while being blind to the file — measured on the Java line's
   `sync-vectors.sh`, whose `--check` read "190 files, no drift" after the pin moved. The pattern has to
   become `wire-schema-registry*.json` **in every place that enumerates the snapshot at once**: widening
   only the pickup leaves the extra file never reported as extra.
4. **⚠ If you key by `$id`, read it out of the file.** In v1 this field held the schema's own `$id`, and
   an `$id` is not always the file name here — `sse-event.schema.json` carries
   `sse-event-v2.schema.json`, and `side-effect-revoke` carries `v2/…`. For a consumer that used the
   field as an `$id`, v2 is therefore **not the same index**: it will land on another version's file
   without saying so. Resolve the path from `version` + `schema`, then read `$id` from the file.
5. `runner/check-registry-paths.mjs --strict` is the gate to switch on **after** the consumers have
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

**已经动了谁：** 本仓自己那道门（2026-10-12 —— 它读 v2，B 规则那段与那两条的 allowlist 一并删掉），
以及 **Java 线**（抬 pin · 放宽快照拾取模式 · 常量改指 v2 · 删掉它的 B 规则分支）。**TS 线已备好、尚未落地**。
`package.json` 里那档 strict 在它落地之前**不开**。

## 要做什么

1. 常量改指 `wire-schema-registry-v2.json`。
2. 删掉任何 B 规则的兼容代码、以及上面那两条的特例 —— 两者都只因 v1 而存在。
3. **若你是按文件名把契约「拾」过来的**（而不是整棵检出），**要把拾取模式放宽**。用字面
   `wire-schema-registry.json` 取的快照**匹配不到 `-v2`**，旁边那道漂移门于是**对它是瞎的**、却报「无漂移」
   —— 这是在 Java 线的 `sync-vectors.sh` 上实测到的：抬 pin 之后它的 `--check` 仍读作「190 文件、无漂移」。
   模式要变成 `wire-schema-registry*.json`，**且所有枚举这份快照的地方要一起改**：只放宽拾取，多出来的那个
   文件**永远不会被报成 extra**。
4. **⚠ 若你按 `$id` 取用，请从文件里读它。** v1 那个字段装的是 schema 自己的 **`$id`**，而这里的 `$id`
   **不总等于文件名** —— `sse-event.schema.json` 的是 `sse-event-v2.schema.json`，`side-effect-revoke` 的是
   `v2/…`。对**把该字段当 `$id` 用**的消费方，v2 因此**不是同一份索引**：它会**静默落到另一个版本的文件**上。
   做法：**由 `version` + `schema` 拼出路径解析**，再**从文件里读 `$id`**。
5. `runner/check-registry-paths.mjs --strict` 是**消费方迁完之后**才开的那道门：对着 v2，它没有债可 allowlist。

## 没有改变的东西

**契约的版本线**，以及 schema 本身。registry 有它自己的 `registryVersion`，本文件把它移到 `v2` 的就是它；
不迁移的消费方**照旧工作**，读数与豁免一如今日。
