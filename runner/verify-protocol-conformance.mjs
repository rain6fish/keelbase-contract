#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
/**
 * AI Governance Protocol Conformance: the protocol's own conformance suite.
 *
 * Deterministic and language-neutral. What it reads is the contract and nothing else — the frozen
 * machine-checkable vectors at this repository's root (the prose specification lives with the product
 * documentation, `docs/protocols/ai-governance-protocol.md` in the main repository):
 *   1. audit hash chain (§2): canonicalJSON / hash / legacy derivation / chain verification (tamper detection).
 *   2. delegation token (§3): JWT HS256 signing + independent verification (aud / iss / exp / sub prefix).
 *   3. tool risk tiering (§4): resolveRiskLevel derivation + RISK_STRATEGY + requiresConfirmation.
 *   4. governance binding (§4.3/§4.4): strategy → gate-outcome semantics + the authorization deny vocabulary.
 *
 * The algorithms are this repository's single source (`runner/lib/protocol-algorithms.mjs`) — the same
 * source the vector generator over in the runtime repository imports. A vector edited by hand is caught
 * by that generator's `--check` gate; a case whose expected value stops following the algorithms is
 * caught here.
 *
 * History: the assertions were moved onto the vectors on 2026-09-09 (CE-1); before that they were written
 * against one implementation by hand.
 *
 * Usage: node runner/verify-protocol-conformance.mjs
 * Output: reports/protocol-conformance-<ts>.json + .md (machine-readable, gitignored)
 *
 * 协议合规认证套件：确定性、语言无关。它读的只有契约本身 —— 本仓根目录下冻结的机器可校验语料
 * （散文规格随产品文档走，在主仓 `docs/protocols/ai-governance-protocol.md`）：
 *   1. 审计哈希链（§2）：canonicalJSON / hash / legacy 派生 / 链校验（篡改检测）。
 *   2. 委托 token（§3）：JWT HS256 签发 + 独立验签（aud 限定 / iss / exp / sub 前缀）。
 *   3. 工具风险分级（§4）：resolveRiskLevel 派生 + RISK_STRATEGY + requiresConfirmation。
 *   4. 治理绑定（§4.3/§4.4）：策略→放行决策语义 + 授权拒绝依据词表。
 *
 * 算法来自本仓的单源（`runner/lib/protocol-algorithms.mjs`）—— 与 runtime 仓那个语料生成器
 * import 的是同一份。手改语料由那边的生成器 `--check` 门禁拦；用例的期望值不再跟随算法，由这里拦。
 *
 * 沿革：断言在 2026-09-09（CE-1）改为跑在语料上；此前是对着某一实现手写的。
 *
 * 用法：node runner/verify-protocol-conformance.mjs
 * 输出：reports/protocol-conformance-<ts>.json + .md（机器可读，已 gitignore）
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canonicalJSON,
  legacyChainKey,
  chainHash,
  verifyChain,
  signJwt,
  verifyJwt,
  RISK_STRATEGY,
  resolveRiskLevel,
  needsConfirmation,
} from './lib/protocol-algorithms.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The repository root is the contract itself; in the runtime repository this pointed at specs/protocol.
// 本仓根就是契约本身；在主仓时这里指向 specs/protocol。
const SPECS = (name) => JSON.parse(readFileSync(resolve(__dirname, `../${name}`), 'utf8'));

const startMs = Date.now();
const results = [];
const ok = (name, detail = '') => { results.push({ name, pass: true, detail }); console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`); };
const bad = (name, detail = '') => { results.push({ name, pass: false, detail }); console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`); };

console.log('═══ AI Governance Protocol Conformance（A1 · CE-1 语料驱动）═══\n');

/* ═══════════ 审计哈希链（协议 §2）——canonical 金样本 + hash 向量 ═══════════ */

console.log('─ 审计哈希链（协议 §2）─');

const canonicalVectors = SPECS('canonical-json-v1-vector.json');
for (const c of canonicalVectors.cases) {
  const got = canonicalJSON(c.input);
  got === c.canonicalBytes ? ok(c.name, got) : bad(c.name, `期望 ${c.canonicalBytes}，实得 ${got}`);
}

const hashVectors = SPECS('audit-hash-v1-vector.json');
for (const c of hashVectors.cases) {
  switch (c.kind) {
    case 'hex': {
      const got = chainHash(c.key, c.prevHash, c.payload);
      /^[0-9a-f]{64}$/.test(got) && got === c.expectHex
        ? ok(c.name, got.slice(0, 16) + '…')
        : bad(c.name, `期望 ${c.expectHex}，实得 ${got}`);
      break;
    }
    case 'determinism': {
      const h1 = chainHash(c.key, c.prevHash, c.payload);
      const h2 = chainHash(c.key, c.prevHash, c.payload);
      h1 === h2 && h1 === c.expectHex ? ok(c.name, '') : bad(c.name, `两次不一致或 ≠ 金样本（${h1}/${h2}）`);
      break;
    }
    case 'tamper': {
      const hA = chainHash(c.key, c.prevHash, c.payloadA);
      const hB = chainHash(c.key, c.prevHash, c.payloadB);
      hA !== hB ? ok(c.name, '') : bad(c.name, '篡改前后 hash 相同（异常）');
      break;
    }
    case 'genesis': {
      const genesisHash = chainHash(c.key, null, c.payload);
      const emptyStrHash = chainHash(c.key, '', c.payload);
      genesisHash !== emptyStrHash
        ? ok(c.name, '')
        : bad(c.name, 'genesis 与空串应产生不同 hash');
      break;
    }
    case 'legacy': {
      const got = legacyChainKey(c.secret);
      got === c.expectHex && /^[0-9a-f]{64}$/.test(got)
        ? ok(c.name, got.slice(0, 16) + '…')
        : bad(c.name, `期望 ${c.expectHex}，实得 ${got}`);
      break;
    }
    case 'chain': {
      const rows = c.rows;
      const keys = c.keys;
      const payloadFor = (row) => (c.payloadOverrides ?? []).find((o) => o.id === row.id)?.payload ?? row.payload;
      const got = verifyChain(rows, keys, payloadFor);
      const pass = c.expect.valid
        ? got.valid && got.checked === c.expect.checked
        : !got.valid && got.brokenIndex === c.expect.brokenIndex;
      pass
        ? ok(c.name, c.expect.valid ? `checked=${got.checked}` : `brokenIndex=${got.brokenIndex}`)
        : bad(c.name, JSON.stringify({ expect: c.expect, got }));
      break;
    }
    default:
      bad(c.name, `未知 kind：${c.kind}`);
  }
}

/* ═══════════ 委托 token（协议 §3）——claims 模板 + verifier 设置 ═══════════ */

console.log('\n─ 委托 token（协议 §3）─');

const tokenVectors = SPECS('delegation-token-v1-vector.json');
const baseNow = Math.floor(Date.now() / 1000);
for (const c of tokenVectors.cases) {
  const { iatBeforeSec = 60, expAfterSec = 240 } = c.lifetime ?? {};
  const claims = { ...c.claims, iat: baseNow - iatBeforeSec, exp: baseNow + expAfterSec };
  let token = signJwt(claims, c.secret);
  if (c.mutate === 'payload') {
    // 篡改 payload 段（保留原签名）→ 验签必须失败
    const [h, , sig] = token.split('.');
    token = `${h}.${Buffer.from('{"x":1}').toString('base64url')}.${sig}`;
  }
  const res = verifyJwt(token, c.secret, { audience: c.verifier?.audience, now: baseNow });
  let pass = res.ok === c.expect.ok;
  if (pass && c.expect.ok && c.expect.sub) pass = res.payload.sub === c.expect.sub;
  if (pass && c.expect.ok && c.expect.subPrefix) pass = res.payload.sub.startsWith(c.expect.subPrefix);
  if (pass && !c.expect.ok && res.reason) {
    ok(c.name, res.reason);
  } else if (pass) {
    ok(c.name, c.expect.ok ? `sub=${res.payload.sub}` : '');
  } else {
    bad(c.name, `期望 ${JSON.stringify(c.expect)}，实得 ${JSON.stringify(res)}`);
  }
}

/* ═══════════ 工具风险分级（协议 §4） ═══════════ */

console.log('\n─ 工具风险分级（协议 §4）─');

const riskVectors = SPECS('risk-level-v1-vector.json');
const strategiesMatch = JSON.stringify(RISK_STRATEGY) === JSON.stringify(riskVectors.strategies);
strategiesMatch ? ok('RISK_STRATEGY 表与语料一致', '') : bad('RISK_STRATEGY 表与语料一致', '实现与语料 strategies 漂移');
for (const c of riskVectors.cases) {
  const level = resolveRiskLevel(c.in);
  const pass = level === c.expect.level && RISK_STRATEGY[level] === c.expect.strategy && needsConfirmation(level) === c.expect.needsConfirmation;
  pass
    ? ok(c.name, `${level}/${RISK_STRATEGY[level]}`)
    : bad(c.name, `期望 ${JSON.stringify(c.expect)}，实得 ${level}/${RISK_STRATEGY[level]}`);
}

/* ═══════════ 治理绑定（协议 §4.3/§4.4，CE-3 薄片） ═══════════ */

console.log('\n─ 治理绑定（协议 §4.3/§4.4）─');

const bindingVectors = SPECS('governance-binding-v1-vector.json');
{
  const strategies = [...new Set(Object.values(RISK_STRATEGY))].sort();
  const bound = Object.keys(bindingVectors.gateOutcomeByStrategy).sort();
  JSON.stringify(bound) === JSON.stringify(strategies)
    ? ok('gateOutcomeByStrategy 覆盖 RISK_STRATEGY 全部策略值', bound.join(','))
    : bad('gateOutcomeByStrategy 覆盖 RISK_STRATEGY 全部策略值', `期望 ${strategies}，实得 ${bound}`);

  let allOk = true;
  for (const d of bindingVectors.derivation) {
    const o = bindingVectors.gateOutcomeByStrategy[d.strategy];
    const consistent =
      !!o &&
      o.requiresConfirmation === d.requiresConfirmation &&
      (o.requiresConfirmation || o.requiresApproval) === needsConfirmation(d.riskLevel) &&
      o.blocked === (d.strategy === 'block') &&
      o.executes === !(o.requiresConfirmation || o.requiresApproval || o.blocked);
    if (!consistent) {
      allOk = false;
      bad(`绑定一致 ${d.riskLevel}`, JSON.stringify({ derivation: d, outcome: o }));
    }
  }
  allOk &&
    ok(
      'R0..R5 → 策略 → 放行决策 逐级一致（executes/确认/审批/阻断 与 needsConfirmation 互洽）',
      `${bindingVectors.derivation.length} 级`,
    );

  const denies = bindingVectors.denyChecks;
  denies.length > 0 && new Set(denies).size === denies.length
    ? ok('授权拒绝依据词表唯一且非空（可解释授权封闭词汇）', denies.join(','))
    : bad('授权拒绝依据词表唯一且非空', JSON.stringify(denies));
}

/* ═══════════ 报告 ═══════════ */

const passCount = results.filter((r) => r.pass).length;
const elapsed = Date.now() - startMs;
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const report = {
  gate: 'AI Governance Protocol Conformance（协议合规认证套件，A1 · CE-1 语料驱动）',
  protocol: 'ai-governance-protocol（审计链 / 委托 token / 工具风险分级）',
  vectors: {
    canonical: canonicalVectors.vectorVersion,
    auditHash: hashVectors.vectorVersion,
    delegationToken: tokenVectors.vectorVersion,
    riskLevel: riskVectors.vectorVersion,
    governanceBinding: bindingVectors.vectorVersion,
  },
  date: ts,
  pass: passCount,
  total: results.length,
  elapsedSec: Math.round(elapsed / 1000),
  implementations: [
    {
      // What is being measured is the reference algorithms this repository ships, not a runtime.
      // 被量的是本仓随契约发布的参考算法，不是某个 runtime。
      name: 'contract reference algorithms（runner/lib/protocol-algorithms.mjs）',
      audited: true,
      auditedAt: ts,
    },
  ],
  cases: results,
};
// Reports are build output, not contract content: they land in reports/, which is gitignored.
// 报告是构建产物、不是契约内容：落在 reports/，已 gitignore。
mkdirSync(resolve(__dirname, '../reports'), { recursive: true });
const base = resolve(__dirname, `../reports/protocol-conformance-${ts}`);
writeFileSync(`${base}.json`, JSON.stringify(report, null, 2));
const md = [
  `# AI Governance Protocol Conformance（${ts}）`, '',
  `- ${passCount}/${results.length} 通过 ｜ 总耗时 ${Math.round(elapsed / 1000)}s ｜ 协议：审计链 / 委托 token / 工具风险分级（语料驱动，本仓根目录）`, '',
  '| # | 断言 | 结果 | 详情 |', '|---|------|------|------|',
  ...results.map((r, i) => `| ${i + 1} | ${r.name} | ${r.pass ? '✅' : '❌'} | ${r.detail} |`), '',
].join('\n');
writeFileSync(`${base}.md`, md);

console.log(`\n═══ Conformance 结果：${passCount}/${results.length} 通过（${Math.round(elapsed / 1000)}s）═══`);
console.log(`报告：reports/protocol-conformance-${ts}.md`);
process.exit(passCount === results.length ? 0 : 1);
