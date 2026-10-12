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
 * It has a `--check` mode, and `npm run check` runs that mode: v2 is a **generated** file that is
 * committed, so the one thing that must not happen is v1 moving while v2 quietly stays where it was.
 * `--check` rebuilds in memory and compares text, so a hand-edit anywhere — not only a stale `schema` —
 * is caught.
 *
 *   node runner/build-registry-v2.mjs           # write
 *   node runner/build-registry-v2.mjs --check   # exit 1 unless the committed file is what a rebuild gives
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
 * 它有一个 `--check` 模式，而 `npm run check` 跑的就是它：v2 是**生成物**、又**入库**，故最不该发生的一件事就是
 * **v1 动了、v2 悄悄留在原处**。`--check` 在内存里重建并**按文本**比对，所以**任何**手改（不只是过期的
 * `schema`）都会被抓到。
 *
 *   node runner/build-registry-v2.mjs           # 写入
 *   node runner/build-registry-v2.mjs --check   # 提交那份不等于重建结果就退 1
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const V1 = join(ROOT, 'wire-schema-registry.json');
const V2 = join(ROOT, 'wire-schema-registry-v2.json');

const CHECK = process.argv.slice(2).includes('--check');

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

const rendered = `${JSON.stringify(v2, null, 2)}\n`;

if (CHECK) {
  const onDisk = existsSync(V2) ? readFileSync(V2, 'utf8') : null;
  if (onDisk === rendered) {
    console.log(`✓ wire-schema-registry-v2.json is what a rebuild of v1 gives — ${objects.length} objects, one encoding (rule A)`);
    process.exit(0);
  }
  console.error('✗ wire-schema-registry-v2.json is not what a rebuild of v1 gives:');
  if (onDisk === null) {
    console.error('  the file is missing — run: node runner/build-registry-v2.mjs');
  } else {
    // Name the first line that differs, so the message points at something rather than saying "different".
    // 点名**第一处不同**的那一行，好让信息指出一个位置，而不是只说「不一样」。
    const a = onDisk.split('\n');
    const b = rendered.split('\n');
    let i = 0;
    while (i < Math.max(a.length, b.length) && a[i] === b[i]) i += 1;
    console.error(`  first difference at line ${i + 1}:`);
    console.error(`    on disk: ${a[i] ?? '(end of file)'}`);
    console.error(`    rebuild: ${b[i] ?? '(end of file)'}`);
    console.error('  if v1 changed on purpose, rebuild: node runner/build-registry-v2.mjs');
  }
  process.exit(1);
}

writeFileSync(V2, rendered);
console.log(`wrote wire-schema-registry-v2.json — ${objects.length} objects, one encoding (rule A)`);
