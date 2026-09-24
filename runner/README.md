# runner/ — language-neutral compliance runners

This directory holds **language-neutral compliance runners**: they read only this repository's contract
(registry + schemas + vectors), **import no implementation source, and carry no `if (runtime)` branch**.
Any runtime can be pointed at them — that is the *criterion* for "the implementation is replaceable",
not a figure of speech.

## What is here

| Runner | What it checks |
|---|---|
| [`verify-full-profile.mjs`](verify-full-profile.mjs) | The Full profile's **offline half**: every registry sample validated against the schema its entry names |

Its **online** half points at a running runtime and measures *that runtime's* conformance. This
repository's CI does not run that half — the contract has no runtime to measure; whoever is being
measured runs it.

```bash
npm ci
npm run check          # = node runner/verify-full-profile.mjs --offline-only
```

## Not here yet

Two runners remain in the TS runtime repository:

| Runner | What it checks |
|---|---|
| `scripts/verify-protocol-conformance.mjs` | Protocol conformance: canonical JSON, the audit hash chain, the delegation token, risk derivation, governance binding |
| `scripts/lib/protocol-algorithms.mjs` | The deterministic single-source those runners share (Node's `crypto` only) |

They are not here because that repository's own build and CI import them directly, and moving them means
the algorithm single-source also has to be imported from here — one change, not two, or the window in
between leaves a build broken. That repository now consumes this one, so the change is possible; it has
not been made.

## The boundary

**Only the language-neutral parts belong here.** Each language's own test fixtures (the TS runtime's
vitest, the Java runtime's JUnit) stay in their own repositories and **do not come in** — mixing them in
is the thing this repository exists to prevent.

---

# runner/ — 语言中性合规 runner

本目录放**语言中性的合规 runner**：只读本仓的契约（registry + schema + 向量），
**不 import 任何实现源码、不出现 `if (runtime)` 分支**。任何 runtime 指过来都应能跑 ——
这是「实现可替换」这句话的**判据**，而不是修辞。

## 本目录现在有什么

| runner | 查什么 |
|---|---|
| [`verify-full-profile.mjs`](verify-full-profile.mjs) | Full 剖面的**离线半**：registry 每个对象的样本过它条目所指的 schema |

它的**在线半**指向一个正在跑的 runtime、量**那个 runtime** 的合规度。本仓 CI **不跑**它 ——
契约没有 runtime 可量；谁被量，谁自己跑。

```bash
npm ci
npm run check          # = node runner/verify-full-profile.mjs --offline-only
```

## 尚未迁入

两个 runner 仍在 TS runtime 仓：

| runner | 查什么 |
|---|---|
| `scripts/verify-protocol-conformance.mjs` | 协议合规：canonical JSON · 审计哈希链 · 委托 token · 风险派生 · 治理绑定 |
| `scripts/lib/protocol-algorithms.mjs` | 上述 runner 共用的确定性单源（只依赖 Node `crypto`） |

它们还没来，是因为那个仓自己的构建与 CI 直接 import 它们，而搬迁意味着**算法单源也要改为从这里 import**
—— 必须**一步做完、不做两步**，否则中间那段时间会留下一个构建中断的窗口。TS runtime 现在已消费本仓，
所以这一步是可行的；只是还没做。

## 边界

**本目录只放语言中立的部分。** 各语言自己的测试夹具（TS 的 vitest、Java 的 JUnit）留在各自实现仓，
**不进本仓** —— 把它们混进来，正是本仓要防的事。
