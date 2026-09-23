# Changelog

契约与一致性向量共用**一条版本线**——两者从不独立演进，故不拆成两条。
版本规则（MAJOR / MINOR / PATCH 各指什么）见 [README §版本与演进](./README.md#版本与演进--versioning)。

---

## v1.1.0 — 2026-09-23

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
