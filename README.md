# KeelBase Contract / KeelBase 契约

> 本仓是 KeelBase「AI 治理协议」的**机器可校验契约**：wire 对象 Schema、语言无关一致性向量，以及两者共用的一条版本线。
> Hosts the KeelBase AI-governance protocol as a machine-checkable contract: the wire-object schemas, the language-neutral conformance vectors, and the single version line they share.

**本仓不隶属于任何实现。** TS runtime 与 Java runtime 各自**平行**消费它——两者都只是消费者，**没有任何一个实现有权单方面改动它**。协议语义的源在本仓；实现跟随契约，而不是契约跟随某一个实现。

<!-- BEGIN keelbase-family:en sha256:553edd65ddeac1995e55f8e80cc50aa154960df63bf60e5dda1827b16eac8578 -->
## 🧬 The KeelBase family

<p align="center">
  <img src="https://raw.githubusercontent.com/rain6fish/KeelBase/main/docs/branding/keelbase-family-en.svg" alt="The KeelBase family — a host adapter, two runtimes that are peers, the bridge, and the contract all of them consume" width="880">
</p>

> KeelBase is **one protocol with several implementations and hosts** — not a set of competing
> products. The contract is the source of truth; runtimes and hosts consume it, and none of them
> owns it. Every repository here is **Apache-2.0**.

```text
  host adapters   KeelBase-YuDao
                  └ governance added to a mature enterprise platform (yudao)

  runtimes        KeelBase (TypeScript)   ·   KeelBase4J (Java / Spring)
                  └ two carriers of the same protocol — peers, not translations

  bridge          KeelBase-java-starter
                  └ wire an existing Java/Spring system in as governed AI tools

  contract        keelbase-contract
                  └ wire schemas + conformance vectors + the version line they share
```

| Repository | Role | Stack | Status |
|---|---|---|---|
| [`KeelBase`](https://github.com/rain6fish/KeelBase) | Reference implementation · product documentation · demo | TypeScript · NestJS · Vue · Flutter · Taro | active |
| [`KeelBase4J`](https://github.com/rain6fish/KeelBase4J) | The Java carrier of the same protocol | Java 17 · Spring Boot | active |
| [`KeelBase-java-starter`](https://github.com/rain6fish/KeelBase-java-starter) | Wire an existing Java/Spring system in as governed AI tools | Maven · Gradle | 0.1.x |
| [`KeelBase-YuDao`](https://github.com/rain6fish/KeelBase-YuDao) | Host adapter — the governance layer on a yudao platform | Java · Vue 3 | active |
| [`keelbase-contract`](https://github.com/rain6fish/keelbase-contract) | The protocol itself — schemas, vectors, the version line | JSON Schema | v1.x |

**Where to start** — see it run: [`KeelBase`](https://github.com/rain6fish/KeelBase) (60-second
Docker) · make an existing Java system AI-capable:
[`KeelBase-java-starter`](https://github.com/rain6fish/KeelBase-java-starter) · you already run yudao:
[`KeelBase-YuDao`](https://github.com/rain6fish/KeelBase-YuDao) · implement the protocol:
[`keelbase-contract`](https://github.com/rain6fish/keelbase-contract).

Which contract version each runtime answers for is maintained **once**, in the main repository — see
[Compatibility](https://github.com/rain6fish/KeelBase#-compatibility). It is not duplicated here.
<!-- END keelbase-family:en -->

<!-- BEGIN keelbase-family:zh sha256:cc21dacd4382cad1e520b0f2b43fe47b25146bddf82f13bf64eb12b7cc6a16f2 -->
## 🧬 KeelBase 家族

<p align="center">
  <img src="https://raw.githubusercontent.com/rain6fish/KeelBase/main/docs/branding/keelbase-family-zh.svg" alt="KeelBase 家族架构图——宿主适配、两个互为平行的 runtime、桥接，以及它们共同消费的契约" width="880">
</p>

> KeelBase 是**一套协议、多个实现与多种宿主**——不是几个互相竞争的产品。契约是唯一真源，
> 各 runtime 与各宿主消费它，**谁也不拥有它**。这里每个仓都是 **Apache-2.0**。

```text
  宿主适配   KeelBase-YuDao
             └ 在成熟企业平台上补治理层（芋道）

  runtime    KeelBase（TypeScript）  ·  KeelBase4J（Java / Spring）
             └ 同一协议的两个载体——互为平行，不是翻译关系

  桥接       KeelBase-java-starter
             └ 把存量 Java/Spring 系统接成受治理的 AI 工具

  契约       keelbase-contract
             └ 线缆 schema + 一致性向量 + 两者共用的版本线
```

| 仓 | 角色 | 技术栈 | 状态 |
|---|---|---|---|
| [`KeelBase`](https://github.com/rain6fish/KeelBase) | 参考实现 · 产品文档 · 演示 | TypeScript · NestJS · Vue · Flutter · Taro | 活跃 |
| [`KeelBase4J`](https://github.com/rain6fish/KeelBase4J) | 同一协议的 Java 载体 | Java 17 · Spring Boot | 活跃 |
| [`KeelBase-java-starter`](https://github.com/rain6fish/KeelBase-java-starter) | 把存量 Java/Spring 系统接成受治理的 AI 工具 | Maven · Gradle | 0.1.x |
| [`KeelBase-YuDao`](https://github.com/rain6fish/KeelBase-YuDao) | 宿主适配——芋道平台上的治理层 | Java · Vue 3 | 活跃 |
| [`keelbase-contract`](https://github.com/rain6fish/keelbase-contract) | 协议本体——schema、向量、版本线 | JSON Schema | v1.x |

**从哪里开始** —— 想看它跑起来：[`KeelBase`](https://github.com/rain6fish/KeelBase)（60 秒
Docker）· 想让存量 Java 系统具备 AI 能力：
[`KeelBase-java-starter`](https://github.com/rain6fish/KeelBase-java-starter) · 你已经在用芋道：
[`KeelBase-YuDao`](https://github.com/rain6fish/KeelBase-YuDao) · 想实现这个协议：
[`keelbase-contract`](https://github.com/rain6fish/keelbase-contract)。

每个 runtime 对着哪一版契约应答，**只在主仓维护一处**——见
[兼容矩阵](https://github.com/rain6fish/KeelBase/blob/main/README.zh-CN.md#-兼容矩阵)。此处不重复。
<!-- END keelbase-family:zh -->

## 目录 / Layout

```
.
├── canonical-json-v1-vector.json     # §2.3 canonicalJSON 金样本（flat/nested/array/null/number/unicode 边界）
├── audit-hash-v1-vector.json         # §2 hash / legacy 派生 / 链校验 / 篡改反例
├── ai-audit-log-outcome-v1-vector.json # AI 审计行 outcome 词表（结构化结果码）
├── delegation-token-v1-vector.json   # §3 委托 token（相对时间构造 → 确定性、无时间戳）
├── risk-level-v1-vector.json         # §4 风险分级派生 + RISK_STRATEGY 表
├── governance-binding-v1-vector.json # §4.3/§4.4 策略→放行决策绑定 + deny 依据词表
├── failure-semantics-v1-vector.json  # 失败语义 wire 级绑定：失败词汇 → 承载 schema → 语料 FP
├── failure-semantics-v2-vector.json  # 失败语义 v2（当前）
├── confirmation-lifecycle-v1-vector.json   # 确认生命周期 v1（冻结留档）
├── confirmation-lifecycle-v2-vector.json   # 确认生命周期 v2（当前）
├── wire-schema-registry.json         # wire 对象冻结清单（对象 → schema → 样例 / 负样例{path,validUnder}）+ schemasDir
├── schemas/
│   ├── v1/ … vN/                     # 按版本分层的 wire 形状（draft-07，$id 互引用）
│   └── …/samples/*.json              # 每对象代表样例
├── runner/                           # 语言中性合规 runner（见 runner/README.md）
└── CHANGELOG.md
```

> ⚠ **`schemas/` 的目录名本身是契约的一部分**：`wire-schema-registry.json` 的 `schemasDir` 指向它。改名即改契约内容。
> 版本现状**以 registry 为准**（写在别处易腐）：查权威版本用 `wire-schema-registry.json` 的 `objects[].version`。

## 版本与演进 / Versioning

**加性规则（本仓的根本约束）：协议只增不改——新版本与旧版本并存；`v1.0.0` 之后，已发布的文件不得被重写或删除。唯一例外见下文「非规范性内容的更正」。**

| 变更类型 | 含义 | 要求 |
|---|---|---|
| **MAJOR** | 破坏性：移除或重命名已发布文件，或改变已发布版本所承诺的语义 | **须 ADR**，且两个实现须同步 |
| **MINOR** | 加性：新增文件——新 wire 对象、既有对象的新 schema 版本（`schemas/vN/`）、新向量 | 已发布文件**不改**；与实现同批落地 |
| **PATCH** | **契约内容**里不参与判定的部分（清单与判据见下文「非规范性内容的更正」） | 规范性内容**一字不改**；须在 `CHANGELOG` 记录改了什么、为什么 |

> **为什么 PATCH 也不许改已发布文件**：已发布版本的文件一旦被重写，第三方按它复现出的结果就与历史对不上——
> 而「第三方能按同一份语料复现」正是本仓存在的理由。要改，就升版本、并列新增。

### 什么**不在**版本线里

**版本线只跟契约与向量走**：schema、向量、`wire-schema-registry.json`。**文档与工具不是契约。**

本 `README`、`CHANGELOG`、`CONTRIBUTING`、`LICENSE`、`.gitattributes`、`runner/` 都不改变任何消费方
复现出的结果，所以它们**不占版本号、不产生 tag**——改了就是改了，不必为它升一个版本。

> 上表三档是**契约内容**的分类。家具类的改动连 PATCH 都不是：它不在这条线上。
> （`CHANGELOG` 是**记录**版本线的那份文件，本身不属于版本线。）

这条界线不是形式主义：若每一处文档改动都要占一个版本号，消费方就得为一份 `CONTRIBUTING` 前进一次
pin——版本线会被家具撑满，真正该被注意的契约变更反而淹没。

### 例外：**非规范性内容**的更正（PATCH 允许改文件）

**判据一句话**：**「第三方按同一份语料复现，结果会不会变？」**

| 判据 | 结论 |
|---|---|
| **不会变** | 属**非规范性内容** → 可作 **PATCH 直接更正**，**但须在 `CHANGELOG` 记录改了什么、为什么** |
| **会变** | **不可加性** → 必须 MINOR 并列新增，或 MAJOR |

**适用（非规范性内容）**

- `samples/` 下**样例的取值**——可用数据，不参与任何 conformance 判定；**前提：更正后仍须通过其 schema 校验**。**例外：** 被列入 `negativeSamples` 的样例，其**被拒**是断言的一部分 —— 它们必须在 `validUnder` 指明的旧 schema 下合法，并被当前 schema 拒绝
- 描述性文本：`title` / `description` / `note` 等**不参与校验**的字段

**不适用（仍是规范性内容，一律不可改）**

- schema 的**结构**：`properties` / `required` / `enum` / `additionalProperties`
- **向量的判定内容**：`expect` 及一切断言依据的字段
- 任何**实现据此判定一致性**的东西

> **为什么需要这条例外**：规则若只有「一律不改」，遇到「样例值触发了密钥扫描器」或「样例值本就写错」
> 这类**必须修、且修了不影响任何判定**的情况，就只剩两条坏出路——要么违规，要么升一个空 MAJOR。
> **例外把「该不该改」变成可判定的问题**，而不是每次临场争论。

## 变更流程 / Change process

- **变更一律在本仓内落地**，且**必须与向量 / schema 同批**（原子性）——契约与它的判定标准不分家。
- **谁有权提**：任何实现都可以**提**；但落必须由本仓完成 —— 「实现先改、契约后补」正是这个仓要消灭的模式。
- **MAJOR 须 ADR**；**MINOR / PATCH** 只需向量与 schema 同批过常规评审。

## 规则细节 / Rules

- **单源**：契约与判据只有一份 —— 语料与 schema 在本仓，实现跟随（落地顺序与原子性见上节「变更流程」）。金样本由现实现生成（实证优先，不预设「正确答案」）。语料与 schema 文件名均含版本段、**不含时间戳**——确定性、可 diff。
- **wire Schema = 固化当前形状**（人工策展快照，非自动派生）。**新增独立 wire 对象** → 加 `schemas/v1/` + registry 条目；**既有对象形状变更** → 先加 `schemas/vN/` 并更新 registry，再改实现。
- **`$id` 取值规则**：**有跨文件相对 `$ref` 的 schema 必须用裸名**（带 `v<N>/` 前缀会把相对引用解析到不存在的目录下）；无跨文件 `$ref` 的才可用 `v<N>/` 前缀。
- 来源锚见各 schema 的 `description` 与 registry 的 `source`（抽取时点行号，权威以实现源码为准）。

## 第三方自认证 / Third-party self-cert

声明兼容本协议的实现可用同一份语料复现：自身实现复算 §2.2 hash、§3 委托 token 验签、§4 风险派生、
§4.3/§4.4 策略→放行决策绑定，与对应的 `*-v1-vector.json` 比对一致即视为通过。
canonical 的嵌套边界语义以 `canonical-json-v1-vector.json` 为准。

## 关联仓库 / Related repositories

Every repository in the family, with its role and status, is listed in the **KeelBase family** section
at the top of this file. The relationship is **parallel**: the protocol lives here; each implementation
and its test fixtures live in their own repository.

家族各仓（角色 · 技术栈 · 状态）见本文开头的 **「KeelBase 家族」** 段。关系是**平行**的：协议在本仓；
各实现与各自的测试夹具在各自仓。

## Consumers / 消费方

The vectors, the schemas and the registry are taken **at a version**, never from `main`: a consumer that
tracks `main` is not pinned to anything, and a compatibility claim is a version rather than a moving
target. Two consumers today, and they consume differently:

- **KeelBase** (the main repository) takes this repository as a **submodule**, pinned to a released
  commit. That is the whole mechanism — CI refuses edits to that path outright, because a protocol
  change made in the consumer is a second contract.
- **KeelBase4J** does not use a submodule. It **vendors** the protocol half of this repository into
  `conformance/vectors/`, and that copy is what its conformance corpus replays against.

**What a vendored copy owes.** It must match the version the consumer *answers for*. A copy states a
version, so it can always be checked against the one it claims; what cannot be checked is a copy that
was taken once and then left behind while the pin moved — that is the drift this section exists to name.
Raising the pin and re-vendoring therefore belong in the **same** change.

**Who checks it.** KeelBase4J's `vector-drift` job checks its snapshot against its own pin and against
the main repository's scenario packs (those live there, not here). KeelBase's `java-vector-drift` job
checks KeelBase4J out and compares its vendored vectors against what this repository's pin gives the
main repository. The second exists because neither of the first two can see the other move: a pin can be
left behind in silence, and the only thing that notices is a comparison **between the two consumers**.

`G0` is KeelBase4J's own name for its conformance run over that snapshot. It is not a version of this
contract and not a file here.

---

向量、schema 与 registry 一律**按版本取**，从不取 `main`：跟 `main` 的消费方等于没有钉版本，而兼容性
承诺是一个**版本**，不是一个会动的目标。今天有两个消费方，取法还不一样：

- **KeelBase**（主仓）以 **submodule** 取本仓，钉在一个已发布的提交上。机制就这一条 —— CI 直接拒绝
  改动那条路径，因为「在消费方里改协议」等于造出第二份契约。
- **KeelBase4J** 不用 submodule。它把本仓的协议那一半 **vendored** 进 `conformance/vectors/`，它的
  conformance 语料重放的就是那份副本。

**一份 vendored 副本欠什么。** 它必须与消费方**所应答的那个版本**一致。副本自己写着版本，所以永远能
对着它自称的那版去核；核不了的是「取了一次、此后 pin 前进了副本没跟」—— 那正是本节的立意所在。因此
**抬 pin 与重新 vendor 属于同一处改动**。

**谁在核。** KeelBase4J 的 `vector-drift` job 拿它自己的 pin（以及主仓的场景包 —— 那些住在主仓、不在
本仓）去核它的快照。KeelBase 的 `java-vector-drift` job 把 KeelBase4J 检出到 runner 上，拿本仓的 pin
交给主仓的那批向量，去核它的 vendored 向量。**后一条之所以存在**：前两条谁也看不见对方动了 —— pin 可以
被无声地落下，而唯一会看见的，是**两个消费方之间**的那次比对。

`G0` 是 KeelBase4J 对自己那次 conformance 跑的称呼，不是本契约的某个版本，也不是本仓里的某个文件。
