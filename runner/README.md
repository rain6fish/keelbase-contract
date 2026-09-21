# runner/ — 语言中性合规 runner

本目录预留给**语言中性的合规 runner**：只读本仓的契约（registry + schema + 向量），
**不 import 任何实现源码、不出现 `if (runtime)` 分支**。任何 runtime 指过来都应能跑——
这是「实现可替换」这句话的**判据**，而不是修辞。

**当前为空。** 候选脚本仍在 TS runtime 仓内：

| 脚本 | 作用 |
|---|---|
| `scripts/verify-protocol-conformance.mjs` | 协议合规认证套件（canonical / hash / 委托 token / 风险派生 / 治理绑定） |
| `scripts/verify-full-profile.mjs` | Full 剖面合规（wire 形状冻结 + 前端契约面） |
| `scripts/lib/protocol-algorithms.mjs` | 上述两者的确定性算法单源（只依赖 Node 内置 `crypto`） |

**为什么还没迁进来**：这三个脚本同时被那个仓的构建与 CI 直接引用，而迁入本仓需要它们**改为从本仓读取**——
那一步必须与 TS runtime 改为「消费本契约」**同批**进行，否则中间会留下一个构建中断的窗口。故推迟。

**迁入时的边界**：本目录**只放语言中立的部分**。各语言自己的测试夹具（TS 的 vitest / Java 的 JUnit）
留在各自实现仓，**不进本仓**——把它们混进来，正是本仓要防的事。
