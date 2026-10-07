# Changelog

契约与一致性向量共用**一条版本线**——两者从不独立演进，故不拆成两条。
版本规则（MAJOR / MINOR / PATCH 各指什么）见 [README §版本与演进](./README.md#版本与演进--versioning)。

---

## v1.6.1 — 2026-10-07

**PATCH — six provenance anchors named a directory that is no longer there.**

**What changed**

The source anchors on three objects — `governance-policy`, `external-effects-query` and
`internal-approvals-execute` — in both their schema `description` and the registry's `source`:

```
- src/ai/governance/…
+ src/ai/governance-bridge/…
```

**Why**

The runtime renamed its business-side governance directory so that it no longer reads as a second
governance: `src/governance` is the control plane, and a sibling also called `governance` gave a
reader no way to tell which side of the seam they had landed on. The anchors kept naming the old
address — the failure `v1.3.1` fixed, with the same consequence: a third party following them finds
nothing.

**Why this is a PATCH and not a MINOR**

The repository's own test — *would a third party reproducing against the same corpus get a different
answer?* — comes out no. These anchors take part in no conformance judgment, and the registry's
`source` is read by no runner. No `expect`, no assertion and no wire shape moves.

---

**PATCH · 六个出处锚指着一个已经不在那里的目录。**

**改了什么**

三个对象 —— `governance-policy`、`external-effects-query`、`internal-approvals-execute` —— 的出处锚；
schema 的 `description` 与 registry 的 `source` 两处都算：

```
- src/ai/governance/…
+ src/ai/governance-bridge/…
```

**为什么**

运行时把它那侧「业务侧治理」目录改了名，为的是它不再读成第二个治理：`src/governance` 是控制平面，
而一个同样叫 `governance` 的兄弟目录让人无从判断自己落在了接缝的哪一侧。这些锚仍写着旧地址 ——
与 `v1.3.1` 修掉的是同一种失效，后果也一样：照着它去找的第三方什么也找不到。

**为什么这是 PATCH 而不是 MINOR**

按本仓自己的判据 —— **「第三方按同一份语料复现，结果会不会变？」** —— **不会**：这些锚不参与任何
conformance 判定，registry 的 `source` 也没有任何 runner 读它。没有 `expect`、没有断言、也没有任何
wire 形状移动。

---

## v1.6.0 — 2026-10-03

**MINOR — the revoke result declares the keys it was already emitting, and gains one.**

**What changed**

`side-effect-revoke` gains a v4. `revokeResult` declares three properties it was already emitting or now
emits, and the batch's per-item result declares the third alongside them:

```
  + "skipped":  { "type": "boolean" }
  + "reason":   { "type": "string" }
  + "downstreamReferences": { "type": "array", "items": {
        "table": string, "remaining": number } }
```

Schemas and samples are added under `schemas/v4/`; the registry points at v4. The `v3` file and its
samples are left exactly as published.

**Why**

`skipped` and `reason` have been on the wire since the idempotent-skip path was added; the schema never
declared them, so the shape a consumer actually receives was wider than the shape it was told about. The
new property is REV-16's answer: a revoke verdict reads `revoke_status` and the target's soft-delete mark,
and neither knows about rows **derived from** the target, so compensating a project soft-deletes it while
milestones added to it afterwards keep pointing at it. `downstreamReferences` reports what the revoke did
not reach.

**Two readings this property keeps apart, and a boundary**

It is present only when the target's type has a reference model: an **absent** field means *not checked*,
an **empty array** means *checked, nothing points at it*. Collapsing the two would report every unmodelled
type as clean. The verdict does not change and nothing is cascaded — this reports what the revoke did not
reach, which is what the verdict alone could not say. Rows belonging to targets revoked in the same
operation, and soft-deleted referrers, are not counted: neither is live downstream state.

---

**MINOR —— 撤销结果把它本来就在发的键补进声明面，并新增一个。**

**改了什么**

`side-effect-revoke` 出 v4。`revokeResult` 声明三个它本来就在发、或现在才发的属性；批量逐条结果同样声明第三个。

```
  + "skipped":  { "type": "boolean" }
  + "reason":   { "type": "string" }
  + "downstreamReferences": { "type": "array", "items": {
        "table": string, "remaining": number } }
```

`schemas/v4/` 下新增 schema 与样例；registry 就地指向 v4。`v3` 及其样例按发布原样保留。

**为什么**

`skipped` 与 `reason` 自幂等跳过路径落地起就一直在线上，而 schema 从未声明过它们 —— 消费者实际收到的形状比
被告知的更宽。新属性是 REV-16 的答案：撤销判定读 `revoke_status` 与目标的软删标记，两者都不知道**派生自**
目标的行，于是补偿一个项目会软删它，而之后给它加的里程碑仍指着它。`downstreamReferences` 报的就是这次撤销
**没够到**的部分。

**这个属性分开的两种读数，以及一条边界**

只在目标类型有引用模型时出现：字段**缺席**是**未检查**，**空数组**是**查过、没有东西指着它**。把两者塌在一起，
会让每一个未建模的类型都报成干净。判定不因此改变，也不级联任何东西 —— 它报的是这次撤销没够到的部分，而那正是
单看判定说不出来的。同一次操作里一并撤销的目标所拥有的行、以及已软删的引用行都不计入：两者都不是活着的下游状态。

---

## v1.5.0 — 2026-10-03

**MINOR — a trace step's outcome gains the fourth value the record already had.**

**What changed**

`trace-step` gains a v2: the `outcome` enum widens from three values to four.

```
- "outcome": { "enum": ["approve", "decline", "timeout"] }
+ "outcome": { "enum": ["approve", "decline", "timeout", "pending_approval"] }
```

A schema and a sample are added under `schemas/v2/`; the registry points at v2. The `v1` file is left
exactly as published.

**Why**

An R4 high-impact action is not confirmed inline — it is routed to human approval, and the audit row
records that with `action: 'tool_confirmation'` and `→ pending_approval`. Readers that knew only three
outcomes collapsed that word into `timeout`, so a compliance sentence said the user timed out and the
trace rendered "Timed out" — for an action that the same row says was sent for approval. The record
had four values; the wire had three.

**Why this is a MINOR and not a PATCH**

`approve`, `decline` and `timeout` keep their meaning, and a v1 reader still sees only those three for
every step except the new case. It is a widening of a wire enum, and this repository's rule is that
wire shapes grow by version, never by in-place edit.

**Boundary, stated because it will be relied on**

Widening an enum is the one shape change that reaches a reader without adding a property: a consumer
that switches on `outcome` with no default now has a value it never handled. That is exactly why this
is a version rather than an in-place edit — the v1 file stays as published, so a consumer pinned to it
can see what it actually agreed to.

---

**MINOR —— 轨迹步的 `outcome` 补上它在记录里早就有、线上却没有的第四个取值。**

**改了什么**

`trace-step` 出 v2：`outcome` 枚举由三个取值扩为四个。

```
- "outcome": { "enum": ["approve", "decline", "timeout"] }
+ "outcome": { "enum": ["approve", "decline", "timeout", "pending_approval"] }
```

`schemas/v2/` 下新增 schema 与样例；registry 就地指向 v2。`v1` 文件按发布原样保留。

**为什么**

R4 高影响动作**不走内联确认**，而是被**转人工审批**，审计行以 `action: 'tool_confirmation'` +
`→ pending_approval` 记下这件事。只认识三个取值的读取方把那句话塌成 `timeout`，于是合规叙述说用户超时、
轨迹渲染成「已超时」——而那一行自己写的是「已转人工审批」。**记录里有四个值，线上只有三个。**

**为什么这是 MINOR 而非 PATCH**

`approve` / `decline` / `timeout` 的语义未变，v1 读取方除这一新情形外看到的仍只是那三个。
这是 wire 枚举的**放宽**，而本仓的规矩是 wire 形状**按版本成长、绝不就地改**。

**边界（写明，因为会被依赖）**

枚举放宽是唯一一种**不加属性也能到达读取方**的形状变更：对 `outcome` 做无 default 的 switch 的消费方，
现在会拿到一个它从未处理过的取值。这正是它必须是一个版本、而不是一次就地改的原因——v1 文件按发布原样
保留，钉住它的消费方能看清自己当时同意的到底是什么。

---

## v1.4.0 — 2026-10-02

**MINOR — an audit row gains the client device identifier.**

**What changed**

`ai-audit-log-row` gains a v4: one new optional property, `deviceId` (`string | null`).

```
+ "deviceId": { "type": ["string", "null"] }
```

A schema and a sample are added under `schemas/v4/`; the registry points at v4. The `v1`, `v2` and `v3`
files are left exactly as published.

**Why**

The row already carries the client address and the guest identifier. The device identifier answers the
case those two cannot: behind NAT or a mobile carrier many clients share one address, so "which client
was this" is not answerable from the address alone. The value comes from the `X-Device-Id` header,
which the mobile client has been sending on every request for some time — the field was the missing
half, not the reporting.

**Why this is a MINOR and not a PATCH**

Nothing is removed, renamed or reinterpreted: a reader of v3 sees precisely what it saw before, and a
producer that omits the property produces a valid v4 row. It is an addition to a wire shape, and this
repository's rule is that wire shapes grow by version, never by in-place edit.

**Boundary, stated because it will be relied on**

The value is **client-supplied**, exactly like `guestId` — an attribution clue, not an identity
credential, and not proof that two rows share a physical device. It is a chain-external column: it
never enters the hash payload, so writing it cannot break an existing chain.

---

**MINOR —— 审计行补上客户端设备标识。**

**改了什么**

`ai-audit-log-row` 出 v4：新增一个可选属性 `deviceId`（`string | null`）。

```
+ "deviceId": { "type": ["string", "null"] }
```

`schemas/v4/` 下新增 schema 与样例；registry 指向 v4。`v1` / `v2` / `v3` 三个文件**原样保留**。

**为什么**

这一行已经带着客户端地址与访客标识。设备标识回答的是它们回答不了的那种情况：**在 NAT 或移动运营商之后，很多客户端共用同一个地址**，「这是哪一个客户端」光看地址答不出来。取值来自 `X-Device-Id` 请求头——移动端早就在每个请求上发它了，缺的是这一半，不是上报。

**为什么是 MINOR 而不是 PATCH**

没有删除、改名或改变解释：读 v3 的人看到的与从前一模一样，而不带该属性的生产者产出的仍是合法的 v4 行。这是**对 wire 形状的增补**，而本仓规矩是 wire 形状**按版本增长、不做就地修改**。

**边界（写明，因为它会被依赖）**

该值**由客户端提供**，与 `guestId` 性质相同——它是**归因线索，不是身份凭证**，也不能证明两行来自同一台物理设备。它是**链外列**：从不进入 hash payload，故写入它不可能破坏既有链。

---

## v1.3.1 — 2026-09-25

**PATCH — a descriptive field named a file that is no longer where it says.**

**What changed**

The `note` on `governance-binding-v1-vector.json`:

```
- 由 scripts/lib/protocol-algorithms.mjs 单源生成
+ 由 runner/lib/protocol-algorithms.mjs 单源生成
```

**Why**

The algorithm single source moved into this repository when the language-neutral runners did, and this
vector kept naming its old address in the runtime repository — a path that a reader following it would
not find. Third parties read these notes as provenance; one that points nowhere is worse than none.

**Why this is a PATCH and not a MINOR**

The repository's test — *would a third party reproducing against the same corpus get a different
answer?* — comes out no. The `note` takes part in no conformance judgment: the protocol conformance
runner reads `gateOutcomeByStrategy`, `derivation` and `denyChecks` out of this file, and nothing else.
No `expect`, no assertion and no wire shape moves.

This is the second application of the README's exception clause (`v1.0.1` was the first).

---

**PATCH · 非规范性内容的更正：一个描述字段，指着一个已经不在那里的文件。**

**改了什么**

`governance-binding-v1-vector.json` 的 `note`：

```
- 由 scripts/lib/protocol-algorithms.mjs 单源生成
+ 由 runner/lib/protocol-algorithms.mjs 单源生成
```

**为什么**

算法单源随语言中性 runner 一起搬进了本仓，而这份向量仍写着它在 runtime 仓的旧地址 ——
照它去找的人找不到。第三方把这些 note 当出处读；指不到东西的 note 比没有更糟。

**为什么这是 PATCH 而不是 MINOR**

按本仓的判据 —— **「第三方按同一份语料复现，结果会不会变？」** —— **不会**：`note` 不参与任何
conformance 判定 —— 协议合规 runner 从这份文件里读的是 `gateOutcomeByStrategy`、`derivation`
与 `denyChecks`，仅此三样。没有 `expect`、没有断言、也没有任何 wire 形状移动。

这是 README 那条例外条款的**第二个**适用案例（第一个是 `v1.0.1`）。

---

## v1.3.0 — 2026-09-24

**MINOR — additive: a new failure-semantics vector, carrying the confirmation artifact's destination binding.**

**Added**

`failure-semantics-v2-vector.json` — the eight outcomes of v1 plus one:
`confirmation_audience_mismatch_rejected`, bound to the new corpus case `FP-11`.

**Why**

A confirmation artifact recorded *what* would be written (tool plus exact arguments) and never *where*.
The delegation token has an `aud` and the receiving system checks it; the confirmation had no equivalent,
so the same artifact stayed valid when pointed at a different destination and the runtime held nothing to
contradict it. The new outcome makes that a named failure with an invariant rather than a hole: the
artifact binds a destination, and reusing it across destinations does not execute.

**Why this is additive**

The outcome list is the vector's normative content, so v1 is not rewritten — it stays frozen at
`failure-semantics-v1-vector.json` and both files coexist. The runtime gate reads v2. No wire object is
added or changed: the new outcome reuses `confirmation-decision`, the same carrier
`confirmation_replay_rejected` already binds.

---

**MINOR · 加性：新增一份 failure-semantics 向量，承载确认 artifact 的目的地绑定。**

**新增**

`failure-semantics-v2-vector.json` —— v1 的八条加一条：`confirmation_audience_mismatch_rejected`，
绑定新语料用例 `FP-11`。

**为什么**

确认 artifact 记了**写什么**（工具 + 精确参数），却从未记**写到哪**。委托 token 有 `aud` 且由目标系统校验，
确认没有对应物，于是同一个 artifact 指向另一个目的地时依然有效，运行时手里没有任何东西与它矛盾。
新结局把这件事从「一个洞」变成「一类有名有据的失败」：artifact 绑一个目的地，跨目标复用不执行。

**为什么是加性**

结局清单就是本向量的**规范性内容**，故 v1 不重写 —— 它冻结留在 `failure-semantics-v1-vector.json`，两份并存。
运行时门禁读 v2。不新增也不改任何 wire 对象：新结局复用 `confirmation-decision`，与
`confirmation_replay_rejected` 同一个承载面。

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
