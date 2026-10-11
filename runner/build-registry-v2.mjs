#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
/**
 * Writes `wire-schema-registry-v2.json` — the same index, with one encoding for `objects[].schema`.
 *
 * `wire-schema-registry.json` writes that field two ways (both documented in
 * `check-registry-paths.mjs`), and two of its entries name a file that is not on disk at all:
 *
 *   rule A  a bare name, with the `version` field beside it      ⇒ schemas/<version>/<schema>
 *   rule B  the `vN/` segment written into `schema` as well      ⇒ schemas/<schema>
 *   broken  `sse-event` and `confirmation-request` carry a `-vN` suffix in the file name that the
 *           real file does not have
 *
 * v2 keeps **rule A everywhere** — the entry's `version` already says which version it is, so repeating
 * it inside the file name buys nothing and costs the reader a second rule. The two broken entries are
 * resolved to the files that actually exist, which is a correction of a typo and not a choice of
 * encoding; ADR-0007 §3 `Q10` settles both in one go.
 *
 * **Additive**: v1 is not edited, and nothing consumes v2 yet — the migration is what
 * `MIGRATION-registry-v2.md` describes. The registry carries its own `registryVersion`, so this is not
 * a change to the contract's version line.
 *
 *   node runner/build-registry-v2.mjs
 *
 * 写出 `wire-schema-registry-v2.json` —— 同一份索引，`objects[].schema` 只用一种编码。
 *
 * `wire-schema-registry.json` 把那个字段写成两种（两种都在 `check-registry-paths.mjs` 里记着），且其中两条
 * 指的**根本不是磁盘上的文件**：
 *
 *   A 裸名，版本由旁边的 `version` 字段带                                   ⇒ schemas/<version>/<schema>
 *   B 连 `vN/` 段一起写进 `schema`                                        ⇒ schemas/<schema>
 *   坏 `sse-event` 与 `confirmation-request` 的文件名里带了个 `-vN` 后缀，而真文件没有
 *
 * v2 **一律取 A** —— 条目自己的 `version` 已经说了是哪个版本，再在文件名里重复一遍**买不到什么、却让读的人
 * 多背一条规则**。那两条坏的是**指到了不存在的文件名**，改回实存文件是**改错字、不是选编码**；ADR-0007 §3
 * 的 `Q10` 把两件一并定下。
 *
 * **加性**：v1 一字不动，也还没有消费方用 v2 —— 迁移是 `MIGRATION-registry-v2.md` 说的事。registry 有它自己的
 * `registryVersion`，故这**不是**对契约版本线的改动。
 *
 *   node runner/build-registry-v2.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const V1 = join(ROOT, 'wire-schema-registry.json');
const V2 = join(ROOT, 'wire-schema-registry-v2.json');

const v1 = JSON.parse(readFileSync(V1, 'utf8'));
const missing = [];

// The bare name is whatever resolves. Trying the real paths rather than rewriting strings is what lets
// the two broken entries come out right without a special case per entry.
// 裸名就是**能解析到的那个**。试真实路径、而不是改写字符串，正是不必为那两条坏的各写一个特例的原因。
const objects = v1.objects.map((o) => {
  const candidates = [join(ROOT, `schemas/${o.version}/${o.schema}`), join(ROOT, `schemas/${o.schema}`), join(ROOT, `schemas/${o.version}/${o.id}.schema.json`)];
  const hit = candidates.find((c) => existsSync(c));
  if (!hit) {
    missing.push(`${o.id} (version ${o.version}, schema "${o.schema}")`);
    return o;
  }
  const bare = hit.replace(/\\/g, '/').split(`schemas/${o.version}/`).pop();
  return { ...o, schema: bare };
});

if (missing.length) {
  console.error('these entries resolve to no file — fix the registry before rebuilding v2:');
  for (const m of missing) console.error('  ' + m);
  process.exit(1);
}

const v2 = {
  registryVersion: 'v2',
  title: v1.title,
  license: v1.license,
  note:
    'Same index as v1, with `objects[].schema` written one way: the bare file name, resolved as ' +
    '`schemas/<version>/<schema>` with `version` beside it. The `vN/` segment no longer appears inside ' +
    'the file name, and the two entries v1 pointed at a non-existent `-vN` file now name the files that ' +
    'exist (ADR-0007 §3 Q10). v1 is unchanged — see MIGRATION-registry-v2.md.',
  schemasDir: v1.schemasDir,
  supportSchemas: v1.supportSchemas,
  objects,
};

writeFileSync(V2, `${JSON.stringify(v2, null, 2)}\n`);
console.log(`wrote wire-schema-registry-v2.json — ${objects.length} objects, one encoding (rule A)`);
