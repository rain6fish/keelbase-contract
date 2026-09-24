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
| [`lib/protocol-algorithms.mjs`](lib/protocol-algorithms.mjs) | The deterministic single source `verify-protocol-conformance.mjs` checks against (Node's `crypto` only) |

`verify-full-profile.mjs`'s **online** half points at a running runtime and measures *that runtime's*
conformance. This repository's CI does not run that half — the contract has no runtime to measure;
whoever is being measured runs it.

```bash
npm ci
npm run check          # both offline halves: registry samples × schema, then the vectors × the algorithms
```

## The runtime repository consumes these; it does not keep a copy

The runtime repository's build and CI take these **from here**, through the submodule, at the commit it
pins: its vector generator and one report renderer import the algorithm single source, and its CI runs
`verify-protocol-conformance.mjs`. A vector and the code that produces it therefore cannot drift apart
without one of the two gates going red.

That is why these two were *moved* rather than copied: the algorithms are the contract's, and a second
copy would be a second authority.

## The full-profile runner still has a twin over there

`verify-full-profile.mjs` has no copy there either. That repository's `full-profile` CI job reaches the
runner **here**, through the submodule, at the commit it pins: its wrapper script starts an isolated
backend, runs this file against it, and passes `--out` so the gap table still lands in that repository's
`docs/benchmark/`.

A second copy did live there until 2026-09-24. It existed because the wrapper pointed at a fixed path
while the pinned submodule did not yet carry this directory — the condition its own header set for its
deletion. Moving the runners in met that condition, so the copy went.

## The open question

Should the runners ride the **version line**? Today they do not: this directory arrived on `main` as
repository furniture, and furniture takes no version number — so a consumer that pins a *tag* cannot
receive the tools alongside the contract, while a consumer that pins a *commit* (which is what the
runtime repository does) can.

That is a gap in the rule rather than in this directory, and it is recorded as open rather than worked
around: either the runners belong to the version line (so a pinned tag brings the tool with the
contract), or a consumer that wants them pins a commit. The runtime repository took the second route
when it moved its copies out — this is why the question is still open rather than closed by that move:
it settles what *that* consumer does, not what a tag is supposed to carry.

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
| [`lib/protocol-algorithms.mjs`](lib/protocol-algorithms.mjs) | `verify-protocol-conformance.mjs` 据以断言的确定性单源（只依赖 Node `crypto`） |

`verify-full-profile.mjs` 的**在线半**指向一个正在跑的 runtime、量**那个 runtime** 的合规度。
本仓 CI **不跑**它 —— 契约没有 runtime 可量；谁被量，谁自己跑。

```bash
npm ci
npm run check          # 两个离线半：先 registry 样本 × schema，再语料 × 算法
```

## runtime 仓**消费**这两份，不留副本

runtime 仓的构建与 CI 是**从这里**取这两样的 —— 经 submodule、按它钉住的那个提交：它的语料生成器与
一个报告渲染件 import 那份算法单源，它的 CI 则跑 `verify-protocol-conformance.mjs`。于是一份语料和
产出它的代码不可能悄悄分叉：两道门禁里必有一道会红。

这两份是**搬**过来的，不是复制的：算法是契约的，而第二份副本就是第二个权威。

## full-profile runner 在那边仍有一份孪生

`verify-full-profile.mjs` 在那边**也不留副本**。那个仓的 `full-profile` CI job 是**从这里**取 runner
的 —— 经 submodule、按它钉住的那个提交：它的包装脚本起一个隔离后端、拿这个文件去量，并传 `--out`
让缺口表仍落在那个仓的 `docs/benchmark/`。

那里在 2026-09-24 之前确实还有第二份。它存在，是因为包装脚本指向一个固定路径，而当时所钉的 submodule
还不含本目录 —— 这正是它自己文件头为「删它」设的条件。runner 搬入使该条件成立，那份副本随之删除。

## 未决的问题

runner 该不该走**版本线**？今天不走：本目录是作为**仓库家具**加进 `main` 的，而家具不占版本号 ——
于是**钉 tag 的消费方取不到**这些工具，而**钉提交**的消费方（runtime 仓正是如此）取得到。

这是**规则本身的缺口**，不是本目录的问题；记为**未决**而非绕过：要么 runner 属于版本线
（钉 tag 就能连同契约一起拿到工具），要么想要它的消费方**钉提交**。runtime 仓在把自持副本搬走时
走的是后一条 —— 也正因如此，那个动作**没有关闭**这个问题：它定的是**那个**消费方怎么做，
不是「一个 tag 该不该带上这些工具」。

## 边界

**本目录只放语言中立的部分。** 各语言自己的测试夹具（TS 的 vitest、Java 的 JUnit）留在各自实现仓，
**不进本仓** —— 把它们混进来，正是本仓要防的事。
