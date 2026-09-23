# KeelBase Contract / KeelBase 契约

> 本仓是 KeelBase「AI 治理协议」的**机器可校验契约**：wire 对象 Schema、语言无关一致性向量，以及两者共用的一条版本线。
> Hosts the KeelBase AI-governance protocol as a machine-checkable contract: the wire-object schemas, the language-neutral conformance vectors, and the single version line they share.

**本仓不隶属于任何实现。** TS runtime 与 Java runtime 各自**平行**消费它——两者都只是消费者，**没有任何一个实现有权单方面改动它**。协议语义的源在本仓；实现跟随契约，而不是契约跟随某一个实现。

## 目录 / Layout

```
.
├── canonical-json-v1-vector.json     # §2.3 canonicalJSON 金样本（flat/nested/array/null/number/unicode 边界）
├── audit-hash-v1-vector.json         # §2 hash / legacy 派生 / 链校验 / 篡改反例
├── delegation-token-v1-vector.json   # §3 委托 token（相对时间构造 → 确定性、无时间戳）
├── risk-level-v1-vector.json         # §4 风险分级派生 + RISK_STRATEGY 表
├── governance-binding-v1-vector.json # §4.3/§4.4 策略→放行决策绑定 + deny 依据词表
├── failure-semantics-v1-vector.json  # 失败语义 wire 级绑定：失败词汇 → 承载 schema → 语料 FP
├── confirmation-lifecycle-v1-vector.json   # 确认生命周期 v1（冻结留档）
├── confirmation-lifecycle-v2-vector.json   # 确认生命周期 v2（当前）
├── wire-schema-registry.json         # wire 对象冻结清单（对象 → schema → 样例）+ schemasDir
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
| **PATCH** | **契约内容**里不参与判定的部分：`samples/` 的取值、schema 的 `title` / `description` / `note` | 规范性内容**一字不改**；须在 `CHANGELOG` 记录改了什么、为什么 |

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

- `samples/` 下**样例的取值**——可用数据，不参与任何 conformance 判定；**前提：更正后仍须通过其 schema 校验**
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
- **谁有权提**：任何实现都可以**提**；但**没有任何一个实现有权单方面落**。TS 与 Java 都只是消费者。
  「实现先改、契约后补」正是本仓要消灭的模式。
- **MAJOR 须 ADR**；**MINOR / PATCH** 只需向量与 schema 同批过常规评审。

## 规则细节 / Rules

- **单源**：语义变更必须先落本仓（升语料 / Schema 版本）再改实现；金样本由现实现生成（实证优先，不预设「正确答案」）。语料与 schema 文件名均含版本段、**不含时间戳**——确定性、可 diff。
- **wire Schema = 固化当前形状**（人工策展快照，非自动派生）。**新增独立 wire 对象** → 加 `schemas/v1/` + registry 条目；**既有对象形状变更** → 先加 `schemas/vN/` 并更新 registry，再改实现。
- **`$id` 取值规则**：**有跨文件相对 `$ref` 的 schema 必须用裸名**（带 `v<N>/` 前缀会把相对引用解析到不存在的目录下）；无跨文件 `$ref` 的才可用 `v<N>/` 前缀。
- 来源锚见各 schema 的 `description` 与 registry 的 `source`（抽取时点行号，权威以实现源码为准）。

## 第三方自认证 / Third-party self-cert

声明兼容本协议的实现可用同一份语料复现：自身实现复算 §2.2 hash、§3 委托 token 验签、§4 风险派生、
§4.3/§4.4 策略→放行决策绑定，与对应的 `*-v1-vector.json` 比对一致即视为通过。
canonical 的嵌套边界语义以 `canonical-json-v1-vector.json` 为准。

## 关联仓库 / Related repositories

| 仓 | 角色 |
|---|---|
| `rain6fish/KeelBase` | TS runtime（消费者） |
| `rain6fish/KeelBase4J` | Java runtime（消费者） |
| `rain6fish/KeelBase-java-starter` | Java 接入层，Spring Boot Starter |

三个仓与本仓**平行**：协议在本仓，实现与各自的测试夹具在各自仓。
