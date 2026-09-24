# runner/ — language-neutral compliance runners

This directory holds **language-neutral compliance runners**: they read only this repository's contract
(registry + schemas + vectors), **import no implementation source, and carry no `if (runtime)` branch**.
Any runtime can be pointed at them — that is the *criterion* for "the implementation is replaceable",
not a figure of speech.

## What is here

| Runner | What it checks |
|---|---|
| [`verify-full-profile.mjs`](verify-full-profile.mjs) | The Full profile's **offline half**: every registry sample validated against the schema its entry names |
| [`verify-protocol-conformance.mjs`](verify-protocol-conformance.mjs) | Protocol conformance: canonical JSON, the audit hash chain, the delegation token, risk derivation, governance binding |
| [`lib/protocol-algorithms.mjs`](lib/protocol-algorithms.mjs) | The deterministic single source both runners share (Node's `crypto` only) |

`verify-full-profile.mjs`'s **online** half points at a running runtime and measures *that runtime's*
conformance. This repository's CI does not run that half — the contract has no runtime to measure;
whoever is being measured runs it.

```bash
npm ci
npm run check          # both offline halves: registry samples × schema, then the vectors × the algorithms
```

## The runtime repository consumes these; it does not keep a copy

The runtime repository's build and CI import `verify-protocol-conformance.mjs` and
`lib/protocol-algorithms.mjs` **from here**, through the submodule, at the commit it pins. Its vector
generator imports the same algorithm single source, so a vector and the code that produces it cannot
drift apart without one of the two gates going red.

That is why these two were *moved* rather than copied: the algorithms are the contract's, and a second
copy would be a second authority.

## The full-profile runner still has a twin over there

`verify-full-profile.mjs` **also still exists** at `scripts/verify-full-profile.mjs` in the runtime
repository, because its CI's `full-profile` job invokes it through a wrapper script that points at a
fixed path. The two copies differ only in two path lines (where the contract is, where reports go).

The condition that copy was waiting on is now met — the runtime's pin contains this directory — so it
can be deleted and the wrapper repointed here. That is a separate change: it moves a CI wrapper rather
than only a path, and it is the same question as the one below, one file further along.

## The open question

Should the runners ride the **version line**? Today they do not: this directory arrived on `main` as
repository furniture, and furniture takes no version number — so a consumer that pins a *tag* cannot
receive the tools alongside the contract, while a consumer that pins a *commit* (which is what the
runtime repository does) can.

That is a gap in the rule rather than in this directory, and it is recorded as open rather than worked
around: either the runners belong to the version line (so a pinned tag brings the tool with the
contract), or each consumer keeps its own copy.

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
| [`verify-protocol-conformance.mjs`](verify-protocol-conformance.mjs) | 协议合规：canonical JSON · 审计哈希链 · 委托 token · 风险派生 · 治理绑定 |
| [`lib/protocol-algorithms.mjs`](lib/protocol-algorithms.mjs) | 两个 runner 共用的确定性单源（只依赖 Node `crypto`） |

`verify-full-profile.mjs` 的**在线半**指向一个正在跑的 runtime、量**那个 runtime** 的合规度。
本仓 CI **不跑**它 —— 契约没有 runtime 可量；谁被量，谁自己跑。

```bash
npm ci
npm run check          # 两个离线半：先 registry 样本 × schema，再语料 × 算法
```

## runtime 仓**消费**这两份，不留副本

runtime 仓的构建与 CI 是**从这里** import `verify-protocol-conformance.mjs` 与
`lib/protocol-algorithms.mjs` 的 —— 经 submodule、按它钉住的那个提交。它的语料生成器 import 的是
同一份算法单源，于是一份语料和产出它的代码不可能悄悄分叉：两道门禁里必有一道会红。

这两份是**搬**过来的，不是复制的：算法是契约的，而第二份副本就是第二个权威。

## full-profile runner 在那边仍有一份孪生

`verify-full-profile.mjs` 在 runtime 仓**也还存在**（`scripts/verify-full-profile.mjs`），因为它 CI 的
`full-profile` job 通过一个包装脚本调用它，而那个脚本指向一个固定路径。两份只差两行路径
（契约在哪、报告写哪）。

那份副本当初等的条件**现在满足了** —— runtime 所钉的提交已包含本目录 —— 所以它可以删、包装脚本也可以
改指到这里。那是**另一步**：它动的是一个 CI 包装脚本，而不只是一行路径；而且它与下面那个问题同源，
只是多走了一个文件。

## 未决的问题

runner 该不该走**版本线**？今天不走：本目录是作为**仓库家具**加进 `main` 的，而家具不占版本号 ——
于是**钉 tag 的消费方取不到**这些工具，而**钉提交**的消费方（runtime 仓正是如此）取得到。

这是**规则本身的缺口**，不是本目录的问题；记为**未决**而非绕过：要么 runner 属于版本线
（钉 tag 就能连同契约一起拿到工具），要么各消费方自持副本。

## 边界

**本目录只放语言中立的部分。** 各语言自己的测试夹具（TS 的 vitest、Java 的 JUnit）留在各自实现仓，
**不进本仓** —— 把它们混进来，正是本仓要防的事。
