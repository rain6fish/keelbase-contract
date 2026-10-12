#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
/**
 * Registry path resolution — every `objects[].schema` must name a file that is on disk.
 *
 * The index is `wire-schema-registry-v2.json`, where `schema` is written **one way**: a bare file name,
 * resolved as `schemas/<version>/<schema>` with the entry's own `version` beside it. v1 carried two
 * encodings and two entries naming files that do not exist; both are settled in v2 (see
 * `MIGRATION-registry-v2.md`), so nothing here is allowlisted any more.
 *
 * Nothing else checks this: `verify-full-profile.mjs` keys schemas by their `$id`, not by this field,
 * and `verify-protocol-conformance.mjs` reads vectors. That is why the two broken entries in v1 sat
 * unseen for nineteen days.
 *
 * Report-only by default; `--strict` exits 1 on any unresolved entry. The remaining consumers move to
 * v2 before the strict form is switched on in `package.json` — see `MIGRATION-registry-v2.md`.
 *
 * Usage:  node runner/check-registry-paths.mjs            # report-only, always exit 0
 *         node runner/check-registry-paths.mjs --strict   # exit 1 on any unresolved entry
 *
 * ── 中文 ────────────────────────────────────────────────────────────────────────
 *
 * **registry 路径解析 —— 每条 `objects[].schema` 都必须指向一个实存文件。**
 *
 * 索引是 `wire-schema-registry-v2.json`，其中 `schema` **只有一种写法**：裸文件名，按
 * `schemas/<version>/<schema>` 解析，版本由条目自己的 `version` 带。v1 有两种编码、且两条指向不存在的
 * 文件；两者都在 v2 里定下了（见 `MIGRATION-registry-v2.md`），**故这里不再有任何 allowlist**。
 *
 * 除此之外没有东西查这一点：`verify-full-profile.mjs` 按 schema 的 `$id` 建索引、**不读**这个字段，
 * `verify-protocol-conformance.mjs` 读的是语料。这正是 v1 里那两条破损躺了十九天无人看见的原因。
 *
 * 默认**只报告**；`--strict` 对**任何**解析不出的条目退 1。其余消费方先迁到 v2，
 * `package.json` 里那步再换 strict —— 见 `MIGRATION-registry-v2.md`。
 *
 * 用法：node runner/check-registry-paths.mjs            # 只报告，恒退 0
 *       node runner/check-registry-paths.mjs --strict   # 任何解析不出即退 1
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..'); // the contract itself is this repository's root / 契约本身就是本仓根

const REGISTRY = 'wire-schema-registry-v2.json';
const STRICT = process.argv.slice(2).includes('--strict');

const registry = JSON.parse(readFileSync(join(ROOT, REGISTRY), 'utf8'));
const schemasRoot = resolve(ROOT, registry.schemasDir);
const objects = registry.objects;

const unresolved = [];
for (const obj of objects) {
  // One rule: the bare name under the entry's own version. A `schema` that carries a `vN/` segment —
  // v1's second encoding — now simply fails to resolve, which is the point of having one rule.
  // 只有一条规则：裸名落在该条目自己的版本目录下。带 `vN/` 段的那种写法（v1 的第二套编码）现在**解析不出**，
  // 而这正是一套规则的意义。
  const path = join(schemasRoot, String(obj.version), obj.schema);
  if (!existsSync(path)) {
    unresolved.push({ id: obj.id, schema: obj.schema, tried: path });
  }
}

console.log(`═══ registry 路径解析（${STRICT ? 'strict' : 'report-only'}）═══`);
console.log(`  registry: ${REGISTRY} · ${objects.length} objects · registryVersion ${registry.registryVersion}`);

for (const u of unresolved) {
  console.log(`  ✗ ${u.id} -> ${u.schema}`);
  console.log(`       tried: ${u.tried.replace(ROOT, '.').replace(/\\/g, '/')}`);
}

if (unresolved.length === 0) {
  console.log('✓ 每条 schema 都解析到实存文件');
} else {
  console.log(`✗ 解析不出 ${unresolved.length} 条：${unresolved.map((u) => u.id).join(', ')}`);
}

// Report-only by default so this can be read before it is a gate; `--strict` is the form `package.json`
// switches to once the consumers have moved.
// 默认只报告，好让它在成为门之前先能被读；消费方迁完之后，`package.json` 换的就是 `--strict` 那一档。
if (STRICT && unresolved.length > 0) process.exit(1);
