# Changelog

契约与一致性向量共用**一条版本线**——两者从不独立演进，故不拆成两条。
版本规则（MAJOR / MINOR / PATCH 各指什么）见 [README §版本与演进](./README.md#版本与演进--versioning)。

---

## v1.17.0 — 2026-11-01

**MINOR — an effect's result id may be text, because not every business object is numbered.**

**What changed**

`side-effect-revoke` moves to **v7** and `trace-step` moves to **v4**, each beside its frozen
predecessor. In both, `resultId` — `item` / `traceItem` in the first, `traceEffect` in the second —
now accepts a string as well as a number. No field is added, removed or renamed, and nothing moves out
of `required`. Three samples carrying a Flowable instance id are added: one per `side-effect-revoke`
shape and one `trace-step`. `schemas/v6/` and `schemas/v3/` are unchanged.

**Why**

The effect ledger names the row a write produced. A consumer that records it honestly hit a business
object whose key is a UUID — a Flowable process instance — and the frozen schemas typed that field as
a number, so the only payloads that could conform were the ones that could not name the row. The
other objects in the family already had this right: `audit-action-report`, `evidence-package`,
`confirmation-decision` and `external-effects-*` have accepted `["number", "string"]` for some time.
This closes the gap on the two that carry the effect list and the trace.

The v1.17.0 artifacts are cut from the `v1.16.0` tag rather than from `main`'s tip: the membership
change that follows it (`7a250e5`) is unreleased, and the v1.17.0 tag does not contain it.

**Impact on consumers.** Every payload accepted by v6 / v3 is still accepted, unchanged: a numeric id
is valid, and both objects remain `additionalProperties:false`, so a v6 consumer rejects only a
payload that actually carries a text id. A consumer that never records a UUID-keyed object needs no
change; one that does pins v7 / v4.

**MINOR —— 副作用的结果 id 可以是文本，因为不是每个业务对象都有编号。**

**改了什么**

`side-effect-revoke` 升到 **v7**、`trace-step` 升到 **v4**，各自与冻结的前代并列。两者里 `resultId` ——
前者是 `item` / `traceItem`、后者是 `traceEffect` —— 现在在数字之外接受字符串。没有字段被新增、删除或
改名，也没有任何字段移出 `required`。新增三份带 Flowable 实例 id 的样例：`side-effect-revoke` 的两个形状
各一份，`trace-step` 一份。`schemas/v6/` 与 `schemas/v3/` 一字未动。

**为什么**

副作用账本要点出一次写**产出了哪一行**。一个诚实记账的消费方碰上了键为 UUID 的业务对象（Flowable 流程
实例），而冻结 schema 把这个字段定成数字，于是能合规的载荷只剩**说不出那一行**的那些。同一族里其它对象早已
是对的：`audit-action-report`、`evidence-package`、`confirmation-decision` 与 `external-effects-*` 接受
`["number", "string"]` 已有一段时间。本次补上的是承载副作用清单与轨迹的那两个。

v1.17.0 的产物从 `v1.16.0` tag 切出、不是从 `main` 的末端：它之后的成员性改动（`7a250e5`）尚未发布，`v1.17.0` tag 不含它。

**对消费方的影响。** v6 / v3 接受的每一份载荷现在仍被接受、形状不变：数字 id 合法，且两个对象仍是
`additionalProperties:false`，故 v6 消费者只在载荷**真的携带**文本 id 时才拒它。从不记录 UUID 型对象的
消费方无需改动；记录的那一种钉 v7 / v4。
## v1.16.0 — 2026-10-30

**MINOR — the action report names the gate that refused, and chain verification brings its denominator.**

**What changed**

`audit-action-report`, `audit-chain-verification` and `audit-usage-stats` move to **v2**, each side by
side with its frozen v1 predecessor. The action report gains `refused` in `summary` and in every `byDay`
bucket, and `byDay` now classifies a row by the `outcome` column `summary` reads rather than a regex over
`errorMessage`. Usage stats gains the same `refused` in each `byDay` bucket, so its daily segments still
add up to the categories the report counts. Chain verification gains `tableRows` beside `checked`.
`schemas/v1/` and everything `v1.15.0` published stay exactly where they are; the three v1 samples become
negative samples that must be rejected.

**Why**

`blocked` and `refused` are two gates, not one: the risk policy never reaches a decision, while the
governance / authorization gate refuses after one. v1 counted only the first, so a refused call fell into
`errors` next to genuine execution failures — and because `byDay` classified by `errorMessage` while
`summary` read `outcome`, the two halves of one response disagreed about the same row. A rate computed
over `checked` alone has a second problem: a row without a `hash` is never verified, so the denominator a
reader cannot see makes the rate look better or worse than it is.

**Impact on consumers.** A consumer that never meets a refused call and never quotes a verification rate
needs no change; one that reports either pins v2. The objects remain `additionalProperties:false`, so a
v1 consumer rejects a v2 payload — the version has to be followed, not guessed.

**MINOR —— 报表点名拒绝它的那道闸，链校验带上分母。**

**改了什么**

`audit-action-report`、`audit-chain-verification` 与 `audit-usage-stats` 升到 **v2**，各自与冻结的 v1 前代并列。
Action Report 的 `summary` 与每个 `byDay` 桶新增 `refused`，且 `byDay` 改为按 `summary` 读的那一列 `outcome`
分类，不再用 `errorMessage` 正则。用量统计在每个 `byDay` 桶加同一个 `refused`，按日分段才仍加得回报表数的那些
类别。链校验在 `checked` 旁新增 `tableRows`。`schemas/v1/` 与 `v1.15.0` 发布的一切仍在原处、一字不改；三份
v1 样例转为必须被拒的负样例。

**为什么**

`blocked` 与 `refused` 是两道闸，不是一道：风险策略压根没到过裁决，而治理 / 授权闸是在裁决之后拒绝。v1 只数
前者，于是被拒的调用落进 `errors`，与真正的执行失败混在一起；又因为 `byDay` 按 `errorMessage` 分行、而
`summary` 读 `outcome`，同一份响应的两半对同一行给出不同答案。只看 `checked` 的验证率还有第二个问题：`hash`
为空的行从不参与校验，读者看不见的那个分母会让这个比率显得比实际更好或更差。

**对消费方的影响。** 从不会遇到被拒调用、也不引用验证率的消费方无需改动；要报这两样的一方钉 v2。对象仍是
`additionalProperties:false`，故按 v1 校验的消费者会拒掉 v2 载荷 —— 版本要跟，不能猜。

## v1.15.0 — 2026-10-28

**MINOR — the outcome vocabulary learns "nothing ran".**

**What changed**

`ai-audit-log-row` moves to **v7**, side by side with its frozen predecessors. Its `outcome` enum gains
one value, `not_executed`, for a `tool_call` whose confirmation window closed with no decision: the call
never ran, and `failed` — "it was tried and it broke" — was the only word the vocabulary offered it.
`schemas/v1/` through `schemas/v6/`, and everything `v1.14.0` published, stay exactly where they are.

A new vector, `ai-audit-log-outcome-v2-vector.json`, pins the extended vocabulary: `not_executed` joins
`legalByAction.tool_call`, with its own definition and a conformance case. **`…outcome-v1-vector.json` is
untouched** — a published vector is not rewritten, so the two live side by side and `runner/` now checks
both. The registry entry for `ai-audit-log-row` moves to v7 and lists a v7 sample of that shape.

**Why**

A row that ends without running is not a row that ran and failed, and the TypeScript reference runtime
had to write `failed` for it. The P0-19 ② readings measured the cost: that row answers "what came of
this" with a word that says an attempt happened, and a reader of the row alone cannot tell the two
apart. `pending` cannot carry it either — the window is over — and `timeout` is legal only on
`tool_confirmation`, where the fact recorded is the decision's endpoint, not the call's.

**Impact on consumers.** Rows stay valid under v6 apart from the one new value, so a consumer that
never meets a timed-out call needs no change; one that wants to tell "never ran" from "ran and failed"
pins v7 and accepts `not_executed`.

**MINOR —— 结局词表学会了「一次都没跑」。**

**改了什么**

`ai-audit-log-row` 升到 **v7**，与冻结的前几版并列。`outcome` 的 enum 加一个值 `not_executed`，用于
确认窗口到期、无人裁决的 `tool_call`：那次调用一次都没跑，而 `failed`（「试过、坏了」）是词表此前唯一
能给它用的词。`schemas/v1/` 到 `schemas/v6/`、以及 `v1.14.0` 发布的一切，仍在原处、一字不改。

新增向量 `ai-audit-log-outcome-v2-vector.json` 钉住扩展后的词表：`not_executed` 进入
`legalByAction.tool_call`，带自己的定义与一条 conformance case。**`…outcome-v1-vector.json` 逐字未动**
—— 已发布的向量不重写，故两份并列、`runner/` 现在两份都检。registry 里 `ai-audit-log-row` 的条目随升
v7，并登记一份该形态的 v7 样例。

**为什么**

一次以「没有执行」收场的记录，不是一次跑过又失败的记录，而 TypeScript 参照实现此前只能给它写
`failed`。P0-19 ② 的读数把代价量了出来：那一格「这次怎么了」用一个「试过」的词作答，只读这一行的
读者分辨不出两者。`pending` 也接不住它 —— 窗口已经过去；`timeout` 只对 `tool_confirmation` 合法，
而那一行记的是**裁决**的终点，不是调用的。

**对消费方的影响。** 除这一个新值外，行在 v6 下仍合法，故从不会遇到超时调用的消费方无需改动；想区分
「没发生」与「跑过并失败」的一方须把 pin 升到 v7 并接受 `not_executed`。

## v1.14.0 — 2026-10-20

**MINOR — the execution id both audit and effect rows already carry is now declared.**

**What changed**

`ai-audit-log-row` and `side-effect-revoke` each move to **v6**, side by side with their frozen
predecessors. Both gain an optional `executionId` on the row that belongs to one governed execution:
the audit row itself, and the `item` / `traceItem` definitions of the side-effect object. The two
objects remain `additionalProperties:false`, so the field is declared exactly where it is emitted and
nowhere else; `revokeResult` and `revokeBatch` are untouched. The field is **not** in `required` in
either object — a v5-shaped payload without it stays valid, which the new no-`executionId` samples
assert on every check. `schemas/v1/` through `schemas/v5/` and everything `v1.13.0` published stay
exactly where they are.

The registry entries for both objects move to v6, name the new schemas, and list samples that cover
the field in both objects, including a shared UUID (`6f3c2a9e-…`) that pairs one audit row with one
effect item and its trace item. A bilingual v6 note records the change in the registry's own note.

**Why**

The Java runtime mints one UUID per governed execution (`GovernedExecutionEngine.run`: `executionId =
UUID.randomUUID().toString()`) and writes that same value into both the audit row (`AuditLog.executionId`)
and the side-effect row (`SideEffect.executionId`); both tables are queried by it
(`findByExecutionIdOrderByIdAsc`). Neither frozen wire declared it. The consequence was concrete: an
effect and its audit row could only be paired by tool + user + time, which is a guess, not a join —
two attempts of the same call in the same minute are indistinguishable.

The field is optional because the concept is not universal: the TypeScript reference implementation
has no execution id at all (no `executionId` / `actionId` anywhere under `Server-NestJS/src`), so a
runtime without it sends `null` or omits the key. It is a chain-external column: it never enters the
hash payload, exactly like `ip`, `guestId`, `deviceId`, `outcome` and `tool`.

**Consumer impact.** Old payloads remain valid under v6, so a consumer that does not read the field
needs no change. A consumer that wants to join effects to audit rows must raise its pin to v6; one
still validating against v5 will reject a v6 payload that carries `executionId`, because both objects
are `additionalProperties:false`.

**MINOR —— 审计行与副作用行早已同值的执行 id，现在写进契约。**

**改了什么**

`ai-audit-log-row` 与 `side-effect-revoke` 各升到 **v6**，与各自冻结的前一版并列。两者都加上**可选**
`executionId`，落在属于同一次受治理执行的那一行上：审计行本身，以及副作用对象的 `item` / `traceItem`
两个定义。两个对象仍是 `additionalProperties:false`，故字段只声明在实际下发的位置；`revokeResult` 与
`revokeBatch` 一字未动。该字段**不进**任一对象的 `required` —— 不带它的 v5 形态载荷仍然合法，新增的
「不带 `executionId`」样例每次检查都会断言这一点。`schemas/v1/` 到 `schemas/v5/`、以及 `v1.13.0`
发布的一切，仍在原处、一字不改。

registry 里两个条目随升 v6，指向新 schema，并登记覆盖该字段的样例（两个对象都有），其中三条共用同一个
UUID（`6f3c2a9e-…`），把一条审计行与一个副作用 item、以及它的 trace item 配在一起。registry 自己的
`note` 追加了一条中英双语的 v6 说明。

**为什么**

Java 运行时为每一次受治理执行生成一个 UUID（`GovernedExecutionEngine.run`：`executionId =
UUID.randomUUID().toString()`），并把**同一个值**写进审计行（`AuditLog.executionId`）与副作用行
（`SideEffect.executionId`）；两张表都按它查询（`findByExecutionIdOrderByIdAsc`）。两份冻结 wire 却都
没有声明它。后果是具体的：一条副作用与它的审计行此前只能靠 tool + user + 时间配对 —— 那是猜测、不是
连接；同一分钟内同一调用的两次尝试根本无法区分。

字段做成可选，是因为这个概念并不普适：TypeScript 参照实现整体没有 execution id（`Server-NestJS/src`
下没有任何 `executionId` / `actionId`），故没有该概念的运行时发 `null` 或省略该键。它是链外列：永不进入
hash payload，与 `ip`、`guestId`、`deviceId`、`outcome`、`tool` 同一性质。

**对消费方的影响。** 旧载荷在 v6 下仍然合法，故不读该字段的消费方无需改动。想用这个键把副作用与审计行
连起来的消费方，须把 pin 升到 v6；仍按 v5 校验的一方会拒掉带 `executionId` 的 v6 载荷，因为两个对象都是
`additionalProperties:false`。

## v1.13.0 — 2026-10-20

**MINOR — the trace's effect now declares the lifecycle status it always carried.**

**What changed**

`trace-step` moves to **v3**. The `traceEffect` definition gains a required `status`, a frozen enum of
`executed` / `revoked` / `revoking_external` / `revoke_failed` — the same four values `side-effect-revoke`
already declares. Nothing else moves: `effectId`, `resultType`, `resultId`, `targetTitle`, `revocable`,
`before` and `after` keep their v2 shapes and semantics, the `type` and `outcome` enums are untouched,
and the existing v2 sample still validates under v3. A new sample,
`schemas/v3/samples/trace-step-effect.json`, exercises an `effect` step so the new field is covered by
the offline check rather than only described. `schemas/v1/` and `schemas/v2/` stay exactly where they
are.

**Why**

The trace endpoint has emitted `status` since the effect projection was normalized: `normalizeStatus`
produces the reading once, `decision-trace.service.ts` passes it through untouched, and the relation is
documented in both places. The schema never named it, and `additionalProperties: true` made that
invisible — every sample and every runtime payload validated whether or not the declaration was
correct. That silence is the problem: a consumer reading the schema would not know the field exists,
and a future rename would break nobody's check. Declaring it costs one additive version and makes the
contract match what the trace actually sends.

**MINOR —— 轨迹里的副作用补上它一直携带的生命周期状态。**

**改了什么**

`trace-step` 升到 **v3**。`traceEffect` 定义新增必填 `status`，取值为冻结枚举
`executed` / `revoked` / `revoking_external` / `revoke_failed` —— 与 `side-effect-revoke` 早已声明的
**同样是这四个值**。其余一字未动：`effectId`、`resultType`、`resultId`、`targetTitle`、`revocable`、
`before`、`after` 保持 v2 的形状与语义，`type` 与 `outcome` 两个枚举不动，既有的 v2 样例在 v3 下
**仍然通过**。新增样例 `schemas/v3/samples/trace-step-effect.json` 覆盖一个 `effect` 步，使新字段被离线
检查真正执行到，而不只是被描述一句。`schemas/v1/` 与 `schemas/v2/` 仍在原处、一字不改。

**为什么**

自副作用投影归一以来，轨迹端点就一直在下发 `status`：`normalizeStatus` 只产生一次读数，
`decision-trace.service.ts` 原样透传，两处都有文档说明。schema 却从未命名它，而
`additionalProperties: true` 让这件事**不可见** —— 无论声明对不对，每份样例、每份运行时载荷都照样通过。
这种沉默才是问题：读 schema 的消费方无从知道该字段存在，将来改名也不会有任何检查失败。补声明只花一个
加性版本，换来契约与轨迹实际下发的形状一致。

## v1.12.0 — 2026-10-17

**MINOR — the confirmation summary is declared as the object that was always being sent.**

**What changed**

`confirmation-request` moves to **v4**. Both `summary` declarations — the top-level one and
`run.items[].summary`, the per-action one in a batch — change from `string` to the
**`{ key, fallback, params? }`** object the server has emitted since the presentation text moved
server-side. `key` and `fallback` are required, `params` is an optional map of names to string values,
and the object is `additionalProperties:false`. Nothing else in the payload changes: v2's `impact` and
v3's `revokeClass` are carried forward. Schemas and samples for v1/v2/v3 stay exactly where they are;
the v3 samples still validate under the v3 schema.

`sse-event` moves to **v3** for two reasons. Its `confirmation_request` branch must reference the
current payload version. An envelope that pins v3 would keep declaring the string shape after the
payload moved on — the same envelope-versus-payload drift v2 repaired in September. The event-name
enum and the decision reference are unchanged. The `tool_start` / `tool_end` branches carried the
same string-versus-object drift: both declared `summary` as a string while the runtime has always
sent the presentation-text object, and `tool_start` may send `null` for a read tool with no label.
v3 declares the object at both — nullable on `tool_start` — and adds a sample for each branch.
Leaving them as they were would have published a version that rejects the payload it was written
for.

The registry gains `negativeSamples`, and the offline half of the runner now requires each listed
sample to be **rejected**. The two negative samples are the frozen v3 samples themselves — the exact
payload shape this version retires — so the rejection is asserted against the real old form rather
than a hand-kept copy; under v4 they fail with `summary must be object`. Each entry also names the
schema it must be valid under (`validUnder`), and the runner checks that first: a fixture that drifts
into an unrelated violation is reported as an invalid sample, not counted as a rejection. An
unresolved schema counts as a failure rather than an unverified "rejection", and the summary line is
always emitted, so a registry that lost its negative samples cannot leave the report green with no
trace. Without this pass a schema that grew permissive enough to accept both shapes would still show
green.

**Why**

`CONF-4`: the server has always sent `{key, fallback, params?}` — the summary is a deterministic
function of tool name and arguments, written by `ToolPresentationService.writeSummary` — while every
confirmation-request schema from v1 through v3 declared `string`. No gate caught it because the
runtime's binding test only compared **key sets** with the schema, and the contract's offline check
only fed it **positive** samples: a string-declaring schema accepts no object sample, but the
reverse — an object-declaring schema that still accepts a string — was never asked. The fix is the
declaration plus the missing half of the gate.

**MINOR —— 确认摘要按其一直实际下发的对象来声明。**

**改了什么**

`confirmation-request` 升到 **v4**。**两处** `summary` —— 顶层的，以及批量 run 里逐条的
`run.items[].summary` —— 由 `string` 改为服务端自呈现文案迁到服务端以来**一直实际下发**的
**`{ key, fallback, params? }`** 对象。`key` 与 `fallback` 必填，`params` 是可选的「名字到字符串值」映射，
对象本身 `additionalProperties:false`。载荷其余部分不变：v2 的 `impact` 与 v3 的 `revokeClass` 原样保留。
v1/v2/v3 的 schema 与样例一字不动、仍在原处；v3 的样例仍按 v3 schema 校验。

`sse-event` 升到 **v3**，有两个理由。它的 `confirmation_request` 分支必须引用**当前**载荷版本。信封若钉住
v3，就会在载荷已经前进之后继续声明字符串形状 —— 这正是九月 v2 修过的「信封与内层载荷版本脱节」。事件名枚举
与决策引用均未动。`tool_start` / `tool_end` 两处带着**同一类**字符串对对象的漂移：它们都把 `summary` 声明为
字符串，而运行时一直发的是呈现文案对象，且 `tool_start` 在只读工具没有标签时可能发 `null`。v3 把两处都改为
该对象（`tool_start` 可为 null），并各补一份样例。留着不改，等于发布一版**会拒掉它本来要承载的载荷**的契约。

registry 新增 `negativeSamples`，runner 的离线半现在要求其中每一条**被拒**。两条负样例就是**冻结的 v3
样例本身** —— 正是本版要退掉的那种载荷形状 —— 故拒绝是拿**真实的旧形态**去证的，而不是一份手工维护的副本；
在 v4 下它们以 `summary must be object` 失败。每条还注明它必须在哪份 schema 下合法（`validUnder`），runner
**先核这一条**：一份漂移出无关违规的样例会被报成「样例本身不合法」，而不是被算作一次拒绝。schema 未解析现在
判为**失败**、而不是一次未经比较的「被拒」，且汇总行**总是**输出，故一个丢了负样例的 registry 不可能在报告上
不留痕迹地变绿。没有这一遍，一个松到新旧形状都收的 schema 照样会显示绿灯。

**为什么**

`CONF-4`：服务端一直发 `{key, fallback, params?}` —— 摘要是（工具名，参数）的确定性函数，由
`ToolPresentationService.writeSummary` 写出 —— 而 v1 到 v3 的每一份 confirmation-request schema 都声明
`string`。没有闸门拦住它，因为运行时的绑定测试只与 schema 比对**键集**，而契约的离线检查只喂**正**样例：
声明字符串的 schema 不接受对象样例，但反过来 —— 声明对象的 schema 是否仍然接受字符串 —— 从没有人问过。
修的就是这处声明，加上闸门缺掉的那一半。

## v1.11.0 — 2026-10-17

**MINOR — a side-effect row can finally say who caused it.**

**What changed**

`side-effect-revoke` moves to **v5**, adding an optional `userId` to **both** `item` and `traceItem` —
the caller whose call produced the write. `required` is unchanged and both objects keep
`additionalProperties:false`, so a v4-shaped payload still validates and a frozen v4 sample still reads
under the v5 schema. The v4 schema and samples stay in `schemas/v4/` untouched; the new samples live in
`schemas/v5/samples/`, including one without `userId` that holds the additive claim to the check.

Both branches, not only `item`: the Java runtime answers the console's list with the `traceItem` shape
(its rows carry `argsHash` and the two snapshots), and a branch that declares nothing new would reject
the field it is now sent. The reference runtime's console list uses `item`; one field name serves both
readers because it is the same fact, and a version that declared it in one place only would force the
two consumers apart for no gain.

**Why**

`JV-65`: the entity and the `side_effects.user_id` column have existed since 2026-09-29, and the frozen
side-effect object never carried the value — so a console reading that object could show what the AI
wrote and when, but not **who** it wrote for. The field was already stored; this is the declaration that lets a reader see it. Optional rather
than required, because v4's payloads are real and must keep validating: additive means alongside, and
the no-user-id sample is the assertion of that.

**MINOR —— 副作用行终于说得出「是谁引起的」。**

**改了什么**

`side-effect-revoke` 升到 **v5**，给 **`item` 与 `traceItem` 两处**各加一个可选 `userId` —— 发起那次写的
调用方。`required` 不变、两个对象仍是 `additionalProperties:false`，故 v4 形态的载荷照样合法、冻结的 v4
样例也照样能按 v5 schema 读。v4 的 schema 与样例在 `schemas/v4/` 里一字不动；新样例住在
`schemas/v5/samples/`，其中一条**不带** `userId`，把「加性」这句话交给检查去证。

两处都加，不只是 `item`：Java 运行时答控制台那张列表用的是 `traceItem` 形状（它的行带 `argsHash` 与两个
快照），一个什么都没新声明的分支会**拒掉**现在发给它的这个字段。参照实现的控制台列表走 `item`；一个字段名
同时服务两个读者，因为它说的是**同一件事**，而只在一处声明的版本会平白把两个消费方推开。

**为什么**

`JV-65`：实体与 `side_effects.user_id` 列自 2026-09-29 就在，而**冻结的副作用对象**从没带过这个值 —— 于是
按那个对象读的控制台能显示 AI 写了什么、什么时候写的，却说不出**为谁**写的。值本来就在存，这次补的是**让读者看得见它的声明**。做成
可选而非必需，因为 v4 的载荷是真实存在的、必须继续合法：加性就是「并在旁边」，而那条不带 `userId` 的
样例正是这句话的断言。

## v1.10.0 — 2026-10-16

**MINOR — the evidence package gains a fourth format, and the one thing it was never able to say.**

**What changed**

`evidence-package` moves to **v6**, adding `format` **`keelbase-audit-evidence/4`**. The `/4` branch is
the `/3` branch **verbatim** apart from two deltas, and the generator that produced it asserts exactly
that: `format.const` changes, and `coverage` joins `required`. A new `definitions.coverage` carries it.

`coverage` says what the package was read from and what reading it cannot show: `registryRevision`
(which revision of the gap registry judged it), `scope` (the period), `sources` (only the sources that
were actually read, with row counts), `verdict` (`complete` / `partial` / `unknown`) and `gaps` (each
with a stable `id`, a `severity`, whether it `affects` this package or the whole deployment, and an
English `statement`).

Untouched: every `/1`..`/3` branch, the signature section, and the folded shapes. The v3 schemas and
samples stay in `schemas/v3/` as frozen history.

**Why**

The governance chain's second breakpoint says it plainly — the claim that the recorded rows are a
faithful and complete projection of the business actions is an **assumption**. A package silent about
its own coverage lets a reader take that silence for completeness, which is the one thing an audit
record must never invite.

**Why a new format rather than an optional field on `/3`.** The whole value of the section is that a
package *cannot* omit it. An optional field is one a producer may skip, which is precisely the failure
mode this exists to remove; and adding `coverage` to `/3`'s `required` would make every already
published `/3` package invalid. So `/4` is "the format that has to state its coverage", and `/1`..`/3`
stay valid as history. Note what a `/4` package can still say: `verdict` may well be `unknown` — no
external anchor is obtainable today — and that is the honest answer, not a defect.

**MINOR —— 证据包多出第四档格式，以及它一直说不出那句话的能力。**

**改了什么**

`evidence-package` 升到 **v6**，新增 `format` **`keelbase-audit-evidence/4`**。`/4` 分支是 `/3` 分支的
**逐字副本**，只有两处增量 —— 而生成它的那段脚本**正是这么自证的**：`format.const` 变，`coverage` 进
`required`。承载它的是一个新增的 `definitions.coverage`。

`coverage` 说的是这份包**从什么读来**、以及**这么读看不了什么**：`registryRevision`（由哪一版缺口登记表
判的）、`scope`（期间）、`sources`（**只列真的读过的**源与行数）、`verdict`（`complete` / `partial` /
`unknown`）、`gaps`（每条带稳定 `id`、`severity`、影响的是**这份包**还是**整个部署**，以及一句英文
`statement`）。

未动：`/1`..`/3` 的每一个分支、签名段、以及各折叠形状。v3 的 schema 与样例留在 `schemas/v3/` 作为冻结
历史。

**为什么**

治理链的**断点二**把话说得很白 —— 「账上的行集合是业务动作成员的忠实且完整投影」**只是一个假设**。
一份对自己的覆盖面保持沉默的包，会让读者把那句沉默读成「完整」，而那是审计记录**最不该招来**的读法。

**为什么是新档而不是给 `/3` 加个可选字段。** 这一段的全部价值在于**一份包不可能省略它**。可选字段就是
生产者**可以跳过**的字段，而那恰恰是它要消除的失效模式；而把 `coverage` 加进 `/3` 的 `required` 会让
**每一份已发布的 `/3` 包变成非法**。故 `/4` = 「**必须交代覆盖**的那一档格式」，`/1`..`/3` 作为历史仍然
合法。注意一份 `/4` 包**仍然可能**说 `verdict: unknown` —— 今天拿不到外部锚 —— 那是**诚实的答案，不是
缺陷**。

## v1.9.0 — 2026-10-13

**MINOR — the conversation views learn a name and a count, and both are optional.**

**What changed**

`conversation-data` moves to **v2**, gaining two optional fields: `title` (a name the user gave the
conversation) and `messageCount`. `conversation-meta` moves to **v2**, gaining `title` alone.
`required` is unchanged in both, so a v1-shaped payload is still valid and the frozen v1 samples still
validate against the v2 schemas. The v1 schemas and samples stay in `schemas/v1/` as frozen history.

Untouched: the `role` enum, the derived `timestamp`, and the deliberate shape of `conversation-meta` —
it still carries no message text, neither `messages` nor `summary`.

**Why**

The web workbench turns the assistant into the landing surface and lists recent conversations as a
**work ledger**. Each row wants a name the user chose and a message count, and neither could be added
without writing the shape down first: the registry is the single source of what a conversation view
*is*, and a consumer binds to it. Both fields are additive in the way the rule asks for — nothing
obliges a consumer to move — and an absent `title` stays absent rather than becoming a sentinel, so a
conversation with no name stays distinguishable from one named "".

**MINOR —— 会话视图各得一个名字与一个条数，两者都可选。**

**改了什么**

`conversation-data` 升到 **v2**，加两个可选字段：`title`（用户给会话起的名字）与 `messageCount`。
`conversation-meta` 升到 **v2**，只加 `title`。两者的 `required` 都不变，故 v1 形态的载荷仍然合法、
冻结的 v1 样例也照旧通过 v2 的校验。v1 的 schema 与样例留在 `schemas/v1/` 作为冻结历史。

未动：`role` 枚举、派生的 `timestamp`，以及 `conversation-meta` 刻意保持的形状——它仍不含任何消息
文本，既无 `messages` 也无 `summary`。

**为什么**

Web 工作台把助手变成落地页，并把最近的会话列成**工作账本**。每一行想要一个用户自己起的名字和一个
消息条数，而这两样必须先写进形状里：注册表是「会话视图**是什么**」的唯一真源，消费方绑的就是它。
两个字段都是规则所要求的**加性**变更——没有谁被迫跟进——且未设的 `title` 保持**缺席**而不是变成哨兵，
故「没有名字的会话」与「名字是空串的会话」仍然分得开。



**MINOR — the registry gains a second index with one encoding, and the paths gate stops carrying an allowance.**

**What changed**

`wire-schema-registry-v2.json` is the same index with one thing settled: how `objects[].schema` is
written. It is now always the bare file name, resolved as `schemas/<version>/<schema>` with the entry's
own `version` beside it. Eight entries carried the `vN/` segment inside the name **as well as** in
`version`; v2 writes it once.

Two entries stop naming files that are not on disk. `sse-event` and `confirmation-request` carried a
`-vN` suffix inside the file name that the real files do not have; v2 names `sse-event.schema.json` and
`confirmation-request.schema.json`, which is what is there. That half is a correction, not an encoding
choice.

`MIGRATION-registry-v2.md` is the page a consumer works from: it says what moved, who reads the index
today, and in which order the move happens. Its consumer list names the four TypeScript specs that
resolve a `schema` into a path, and the four more that read the index without resolving one.

**Why**

A field with two spellings is a rule the reader has to know twice, and it bought nothing: the version
was already beside the name. Worse, two of the entries had been resolving to nothing for nineteen days
and nobody noticed, because no runner read that field — the runtime keys schemas by `$id` and the
conformance runner reads vectors. A gate over that field was added in `v1.7.0`; it could not be a gate
while it had a frozen allowance to carry, and the allowance could not go until the encoding was settled.

**Why this is a MINOR and not furniture**

The version line follows the schemas, the vectors and `wire-schema-registry.json` — see *Versioning* in
the README — and a second registry index is on that line. It is additive in the way the rule asks for:
v1 is unchanged, nothing obliges a consumer to move, the contract's schemas are untouched, and no
reading anybody reproduces comes out differently. The builder and the migration page under `runner/` are
furniture by that same rule and would warrant nothing on their own; the gate's move to v2 is furniture
too, and is recorded here because it is what the version-line change was for.

---

**MINOR —— registry 多了一份只用一种编码的索引，路径那道闸也卸下了它的豁免。**

**改了什么**

`wire-schema-registry-v2.json` 与 v1 是同一份索引，只把一件事定死：`objects[].schema` 怎么写。它现在
**一律是裸文件名**，按 `schemas/<version>/<schema>` 解析，版本由条目自己的 `version` 带。**八条**既把
`vN/` 写进文件名、又写进 `version`；v2 只写一次。

**两条**不再指着一个磁盘上不存在的文件。`sse-event` 与 `confirmation-request` 的文件名里带了个真文件
没有的 `-vN` 后缀；v2 写的是 `sse-event.schema.json` 与 `confirmation-request.schema.json`，也就是**实存
的那两个**。这半边是**改错**，不是选编码。

`MIGRATION-registry-v2.md` 是消费方照它做的那一页：写清改了什么、今天谁在读这份索引、以及按什么顺序迁。
它的消费方表点了**四个**会把 `schema` 解析成路径的 TS spec，以及另**四个**只读索引、不解析路径的。

**为什么**

一个字段有两种写法，就是让读的人**多背一条规则**，而它什么也买不到：版本本来就写在名字旁边。更糟的是，
那两条**已经指向不存在的东西十九天**而无人在意 —— 因为**没有任何 runner 读那个字段**（运行时按 `$id`
建索引、conformance runner 读的是语料）。覆盖该字段的闸是在 `v1.7.0` 加的；**只要它还背着一条冻结的豁免，
它就成不了闸**，而那条豁免在编码定下来之前去不掉。

**为什么这是 MINOR、不是家具**

版本线跟的是 schema、向量与 `wire-schema-registry.json`（见 README《版本与演进》），而**第二份 registry
索引就在这条线上**。它按那条规则要的**加性**方式加的：v1 一字未动、**没有任何一条要求消费方必须迁**、
契约的 schema 未被触碰、**任何人复现出的读数都不会不同**。`runner/` 下的构建器与迁移页按同一条规则属
**家具**，单凭它们**不占版本号**；那道闸改读 v2 同属家具，记在这里只因为它是这次版本线改动**为了什么**。

---

## v1.7.0 — 2026-10-11

**MINOR — an audit row says what happened without anyone parsing its prose, the tenant becomes a dimension of its own, and the registry's paths get a gate.**

**What changed**

`ai-audit-log-row` gains a **v5**: two out-of-chain attribution columns, `outcome` — a frozen
vocabulary — and `tool`, the tool the row is about. Nine samples carry one value each, so a consumer
can replay every one of them, and a new vector, `ai-audit-log-outcome-v1-vector.json`, pins the
vocabulary together with which values are legal for which `action`, and replays that grouping in cases
the conformance runner checks. The hash payload and `action`'s enum are untouched.

`org-membership-scope` gains its own **v5**: `tenant` sits beside `org` rather than inside it, and it is
not required — the main repository has no tenant concept today, so requiring it would write a field
into the contract that no implementation emits.

The runner gains a **report-only** gate over registry path resolution, which turned up two paths that
resolve to nothing; they are frozen debt and named as such rather than silently accepted.

**Why**

The evaluation surface read an audit row's outcome by matching free text in `detail` and took the tool
name from its first token — a parse that only works on one of the two implementations, whose `detail`
grammars differ (`<tool> <verb> …` against `<tool>(<argsJson>)`). `action` cannot answer it: it is a
frozen enum whose values name what kind of thing happened, never how one turned out.

Two of the ten values were found by reading the writers rather than the design, and both are shapes
that already existed: `timeout`, the contract's own word from `confirmation-lifecycle-v2` for an ending
nobody decides — neither a decline nor a failure — and `attempted` for a row that only records the try,
because an intent row is not an ending and its result is the row after it. Folding either into an
existing value would have erased a distinction the data already carries.

Which values are legal depends on `action`, and the grouping is closed rather than permissive: a row
that carries an outcome its action does not allow is a mistake the vector names outright. Folding the
tenant into `org` would have made "changed organisation" and "changed tenant" indistinguishable on the
wire, which is why it is a sibling and not a child.

---

**MINOR —— 审计行不用谁去解析它的散文就能说出发生了什么；租户成了自己的一维；registry 的路径有了一道闸。**

**改了什么**

`ai-audit-log-row` 出 **v5**：两列**链外归因列** —— `outcome`（冻结词表）与 `tool`（本行所属的工具）。
九份样例一个值一份，消费方可以逐个复跑；新增向量 `ai-audit-log-outcome-v1-vector.json`，把词表连同
「哪些值对哪种 `action` 合法」一并钉住，并把那套分组写成 conformance runner 会跑的 case。**hash 载荷与
`action` 的 enum 一字未动。**

`org-membership-scope` 出自己的 **v5**：`tenant` 放在 `org` **旁边**、不是**里面**，且**不在** `required`
里 —— 主仓今天没有租户概念，做成必需等于把一个**没有任何实现产出**的字段写进契约。

runner 新增一道 registry 路径解析的**只报告**门禁，它查出两条**解析不到任何东西**的路径；它们是被冻结的
债，**点名列出**，而不是悄悄放过。

**为什么**

评估面此前从 `detail` 里靠匹配自由文本读出结局、并拿第一个 token 当工具名 —— 而那个解析**只在两个实现中的
一个上成立**，因为两者的 `detail` 文法不同（`<tool> <动词> …` 对 `<tool>(<argsJson>)`）。`action` 答不了这件
事：它是冻结 enum，取值只说明**发生了哪一类事**，永远说不出**这一次的结局**。

十个值里有**两个**是**读写入点**、而不是设计时发现的，且两者都是**已经存在**的形状：`timeout`（「等待窗口
走完、没人裁」的那个结局，用的是契约自己在 `confirmation-lifecycle-v2` 里的词 —— 既不是拒绝、也不是失败），
以及 `attempted`（只记「试过」的那一行 —— **intent 行不是一次结局**，它的结局在**后面**那一行）。把任一个折进
已有的值，都会抹掉数据本来就带着的区分。

哪些值合法**取决于 `action`**，而那套分组是**封闭**的、不是宽松的：一行带了它那个 action 不允许的结局，
就是**向量会直接点名**的错误。把租户折进 `org`，会让「换了组织」与「换了租户」在 wire 上**不可分** ——
这正是它做**兄弟**、不做**子项**的缘故。

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
