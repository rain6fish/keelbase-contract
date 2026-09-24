# Changelog

契约与一致性向量共用**一条版本线**——两者从不独立演进，故不拆成两条。
版本规则（MAJOR / MINOR / PATCH 各指什么）见 [README §版本与演进](./README.md#版本与演进--versioning)。

---

## v1.2.0 — 2026-09-24

**MINOR — additive: the capabilities payload gains the display parameters renderers need.**

**Added**

`schemas/v2/capabilities.schema.json` and its sample — adds a `display` block carrying `currencySymbol`.

The `wire-schema-registry.json` entry now points at v2. **`v1` stays where it is** — both versions coexist,
and a consumer takes the one its registry entry names.

**Why**

The money rule was single-sourced on all three ends, but the **symbol** was not: backend, web console and
mobile each defined their own constant. One rule with three authorities is the same drift by another route —
and it is the route that shows up as one person seeing a different currency depending on which screen they open.

**Why this is additive**

Nothing existing changes shape: `preset` / `features` / `ai` / `businessModules` are untouched and the new
block is additional, so a consumer reading v1 is unaffected. Changing the shape of an existing object means
adding `schemas/vN/` and updating the registry before changing an implementation — the path this version takes.

---

**MINOR · 加性：能力清单增加渲染器所需的展示参数。**

**新增**

`schemas/v2/capabilities.schema.json` 及其样例 —— 加一个承载 `currencySymbol` 的 `display` 块。

`wire-schema-registry.json` 的该条目改指 v2。**`v1` 原地保留** —— 两版并存，消费方按 registry 的 `version` 取。

**为什么**

金额规则已在三端各自单源，但**符号**没有：后端、Web 管理台、移动端各定了一个常量。
一条规则三个权威，是同一种漂移换了条路 —— 而这条路会表现为「同一个人在不同页面看到不同币种」。

**为什么是加性**

既有字段一个都不改形状：`preset` / `features` / `ai` / `businessModules` 未动，新块是附加的，
读 v1 的消费方不受影响。既有对象改形状 ⇒ 先加 `schemas/vN/` 并更新 registry，再改实现 —— 本版走的正是这条。

---

## v1.1.0 — 2026-09-23

**MINOR — additive: two confirmation wire objects move to v2, splitting out the execution axis.**

**Added**

Two schemas and five samples under `schemas/v2/`:

- `governance-confirmation-item` **v2** — adds `executionState` / `executedAt` / `executionError`
- `my-confirmation-item` **v2** — the same, for a decision made by the person it concerns

The two `wire-schema-registry.json` entries now point at v2 and list their samples. **`v1` stays where
it is** — both versions coexist, and a consumer takes the one its registry entry names.

**Why**

To separate the decision axis from the execution axis. A confirmation previously recorded whether it
had been decided, not whether it had run — so a row that was **approved and then failed to execute was
invisible, and therefore not retryable**. v2 makes it visible and retryable.

**Why this is additive**

The `status` enum and the frozen vectors are untouched; the new fields are additional, so a consumer
reading v1 is unaffected. Changing the shape of an existing object means adding `schemas/vN/` and
updating the registry before changing an implementation — the path this version takes (README §Rules).

---

**MINOR · 加性：两个确认类 wire 对象升 v2，把执行轴分出来。**

**新增**

`schemas/v2/` 下两份 schema 与五个样例：

- `governance-confirmation-item` **v2** —— 加 `executionState` / `executedAt` / `executionError`
- `my-confirmation-item` **v2** —— 同上（本人批复的写同样可能「批准了但没跑成」）

`wire-schema-registry.json` 的两条随之指向 v2，并各自列出样例。
**v1 原地保留**——两版并存，消费方按 registry 的 `version` 取。

**为什么**

把**决策轴**与**执行轴**分开。此前一个确认只有「批没批」，没有「跑没跑成」，
于是**「已批准但执行失败」的行不可见、也就不可重试**。v2 让它可见且可重试。

**为什么是加性**

`status` 枚举与冻结语料**一字未动**；新字段是**附加**的，读 v1 的消费方不受影响。
既有对象改形状 ⇒ 先加 `schemas/vN/` 并更新 registry，再改实现——本版走的正是这条（README §规则细节）。

---

## v1.0.1 — 2026-09-22

**PATCH · 非规范性内容的更正**（README「版本与演进」新增的**例外条款**的**第一个适用案例**）。

**改了什么**

`schemas/v1/samples/governance-confirmation-item.json` 的样例 **`token` 取值**：

```
- "token": "appr-2f4b9c17"
+ "token": "appr-sample-01"
```

**为什么**

旧取值会被密钥扫描器（gitleaks）判为疑似凭据——它是**演示样例里的假 token**，却形似真令牌，
持续产生安全告警；而修复它无需动任何规范性内容。新值一眼可辨为样例，
且**仍通过其 schema 校验**（`token: {type: "string", minLength: 8}`，新值 14 字符）。

**为什么这是 PATCH 而不是 MAJOR**

按本仓的判据——**「第三方按同一份语料复现，结果会不会变？」**——**不会**：
样例是可用数据，**不参与任何 conformance 判定**；改的只是一个**取值**，
schema 的 `properties` / `required` / `enum` / `additionalProperties` **一字未动**，
向量的 `expect` 及一切断言依据**一字未动**。故属非规范性内容，符合例外条款。

**同批确立**

README 的版本规则新增**例外条款**（非规范性内容的更正可作 PATCH，须 CHANGELOG 记录），
把「该不该改已发布文件」从临场争论变成**一句话可判定**的问题。

---

## v1.0.0 — 2026-09-21

**首个版本。这不是一份新协议。**

本版内容 = 当时 TS runtime **已在运行**、Java runtime **已在复现**的同一份协议。
本版做的只是给这份**已存在、已被两个实现各自验证过**的东西一个独立身份与版本号——不新增、不改动任何协议语义。

**内容**

- 八个语言无关一致性向量：`canonical-json-v1` · `audit-hash-v1` · `delegation-token-v1` ·
  `risk-level-v1` · `governance-binding-v1` · `failure-semantics-v1` ·
  `confirmation-lifecycle-v1`（冻结留档）· `confirmation-lifecycle-v2`
- wire 对象 Schema：`schemas/v1`（初始冻结形状）· `schemas/v2` · `schemas/v3`，及每个对象的代表样例
- `wire-schema-registry.json`：对象 → schema → 样例的冻结清单，含 `schemasDir`

**历史**

本仓由主仓 `Server-NestJS/specs/protocol/` 的**完整提交历史**提取而来（`git subtree split`，**未重写历史**）。
协议每一次改动的时间线都还在，可按提交追溯——「协议怎么长成今天这样」是可查的，不是只能读现状。

**兼容性承诺**

自本版起，**已发布的文件不得被重写或删除**。后续任何变更一律按加性规则**并列新增**：
既有对象要改形状，就加 `schemas/vN/` 的新版本，旧版本原地保留。
