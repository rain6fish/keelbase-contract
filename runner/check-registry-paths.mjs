#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
/**
 * Registry path resolution — a **report-only** check.
 *
 * `wire-schema-registry.json` is the index from a contract id to the schema file its wire shape is
 * frozen in. Its `objects[].schema` is written two ways, and two entries point at files that are not
 * on disk:
 *
 *   rule A  `schema` is a bare name and the object carries a `version` ⇒ schemas/<version>/<schema>
 *   rule B  `schema` already carries its `vN/` segment               ⇒ schemas/<schema>
 *   neither `sse-event` / `confirmation-request` name a `-vN` suffixed file that does not exist
 *           (the real files drop the suffix).
 *
 * Nothing else checks this: `verify-full-profile.mjs` keys schemas by their `$id`, not by this field,
 * and `verify-protocol-conformance.mjs` reads vectors. So the two broken entries have sat here unseen.
 * Fixing them is a contract change and is tracked as ADR-0007 §3 Q10, so they are **allowlisted** here
 * as frozen debt rather than silently ignored.
 *
 * This check **reports** every entry it cannot resolve and separates the known debt from anything new.
 * It is report-only: it exits 0 either way. `--strict` exits 1 on any unresolved entry that is not the
 * frozen debt — the gate to switch on once Q10 lands.
 *
 * Usage:  node runner/check-registry-paths.mjs            # report-only, always exit 0
 *         node runner/check-registry-paths.mjs --strict   # exit 1 on new breakage
 *
 * ── 中文 ────────────────────────────────────────────────────────────────────────
 *
 * **registry 路径解析 —— 一条「只报告」的检查。**
 *
 * `wire-schema-registry.json` 是「契约 id → 该 wire 形状冻结在哪个 schema 文件」的索引。它的
 * `objects[].schema` 被写成两种编码，且有两条指着一个磁盘上不存在的文件：
 *
 *   规则 A  `schema` 是裸名、对象另带 `version` ⇒ schemas/<version>/<schema>
 *   规则 B  `schema` 自带 `vN/` 段             ⇒ schemas/<schema>
 *   两条都不命中 `sse-event` / `confirmation-request` 写了一个带 `-vN` 后缀、并不存在的文件
 *              （真文件不带该后缀）。
 *
 * 除此之外没有东西查这一点：`verify-full-profile.mjs` 按 schema 的 `$id` 建索引、**不读**这个字段，
 * `verify-protocol-conformance.mjs` 读的是语料。故那两条破损一直无人看见。修它属契约改动，记作
 * ADR-0007 §3 **Q10** —— 所以这里把它们**显式 allowlist** 为冻结的债，而不是无声放过。
 *
 * 本检查**报告**每一条解析不出的条目，并把「已知的债」与「新出现的」分开。它是**只报告**的：无论
 * 如何都退出 0。`--strict` 会在**非冻结债**的解析失败上退出 1 —— 那是 Q10 落地后要打开的门。
 *
 * 用法：node runner/check-registry-paths.mjs            # 只报告，恒退 0
 *       node runner/check-registry-paths.mjs --strict   # 新破损即退 1
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..'); // the contract itself is this repository's root / 契约本身就是本仓根

/**
 * Frozen debt: registry ids whose `schema` names a file that is not on disk. Fixing them is a contract
 * change (ADR-0007 §3 Q10), so they are named here instead of silenced. Remove an id once Q10 lands.
 *
 * 冻结的债：`schema` 指着一个磁盘上不存在的文件的 registry id。修它属契约改动（ADR-0007 §3 Q10），
 * 故在此点名、而不是无视。Q10 落地后逐条移除。
 */
const KNOWN_DEBT = new Map([
  ['sse-event', 'names `sse-event-v2.schema.json`; the file is `schemas/v2/sse-event.schema.json`'],
  ['confirmation-request', 'names `confirmation-request-v3.schema.json`; the file is `schemas/v3/confirmation-request.schema.json`'],
]);

const STRICT = process.argv.slice(2).includes('--strict');

const registry = JSON.parse(readFileSync(join(ROOT, 'wire-schema-registry.json'), 'utf8'));
const schemasRoot = resolve(ROOT, registry.schemasDir);
const objects = registry.objects;

let ruleA = 0;
let ruleB = 0;
const unresolved = [];
for (const obj of objects) {
  const schema = obj.schema;
  const candidates = [];
  if (schema.includes('/')) candidates.push(join(schemasRoot, schema)); // rule B / 规则 B
  if (obj.version) candidates.push(join(schemasRoot, String(obj.version), schema)); // rule A / 规则 A
  if (candidates.some((p) => existsSync(p))) {
    if (schema.includes('/')) ruleB++; else ruleA++;
  } else {
    unresolved.push({ id: obj.id, schema, tried: candidates });
  }
}

const newBreakage = unresolved.filter((u) => !KNOWN_DEBT.has(u.id));
const debtHit = unresolved.filter((u) => KNOWN_DEBT.has(u.id));
// An allowlisted id that now resolves is not a problem — Q10 may have fixed it. Report it so the
// allowlist can be pruned. / 已 allowlist 的 id 现在能解析了，不是问题 —— Q10 可能已修好它；报出来好清 allowlist。
const resolvedDebt = [...KNOWN_DEBT.keys()].filter(
  (id) => !unresolved.some((u) => u.id === id) && objects.some((o) => o.id === id),
);
const goneDebt = [...KNOWN_DEBT.keys()].filter((id) => !objects.some((o) => o.id === id));

console.log('═══ registry 路径解析（report-only）═══');
console.log(`  registry: ${objects.length} objects · 规则 A ${ruleA} · 规则 B ${ruleB} · 解析不出 ${unresolved.length}`);

for (const u of unresolved) {
  const isDebt = KNOWN_DEBT.has(u.id);
  console.log(`  ${isDebt ? '•' : '✗'} ${u.id} -> ${u.schema}${isDebt ? '   [冻结的债 · Q10]' : '   [新破损！]'}`);
  for (const p of u.tried) console.log(`       tried: ${p.replace(ROOT, '.').replace(/\\/g, '/')}`);
}
if (resolvedDebt.length) console.log(`  ℹ 可清出 allowlist（现已解析）：${resolvedDebt.join(', ')}`);
if (goneDebt.length) console.log(`  ℹ allowlist 里这些 id 已不在 registry：${goneDebt.join(', ')}`);

if (newBreakage.length === 0) {
  console.log(`✓ 无新破损（冻结的债 ${debtHit.length} 条 · 见 ADR-0007 §3 Q10）`);
} else {
  console.log(`✗ 新破损 ${newBreakage.length} 条：${newBreakage.map((u) => u.id).join(', ')}`);
}

// Report-only by default: the frozen debt is not a reason to go red, and a new breakage is reported
// either way. `--strict` turns a new breakage into a non-zero exit — the gate for after Q10.
// 默认只报告：冻结的债不该让门变红，而新破损无论哪种模式都会被报出来。`--strict` 把新破损变成非零退出码
// —— 那是 Q10 之后要打开的门。
if (STRICT && newBreakage.length > 0) process.exit(1);
