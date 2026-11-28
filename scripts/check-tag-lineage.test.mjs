// SPDX-License-Identifier: Apache-2.0
// CLI contract tests for the tag-lineage gate: a tag off main, a tag whose own commit ran CI, a tag the
// push hook rewrote into a merge (so no run carries its SHA), and the case where neither commit was
// green. These drive the real command against throwaway repositories, with a fake `gh` on PATH.
//
// tag 血统闸的 CLI 契约测试：不在 main 上的 tag、自身跑过 CI 的 tag、被推送钩子改写成合并因而没有任何
// 运行带其 SHA 的 tag，以及两者都不绿的情形。用例拿临时仓驱动**真正会跑的那个命令**，PATH 上放一个假 `gh`。
//
// The fake `gh` is a POSIX shell script, so these cases are skipped on Windows — Node cannot spawn a
// `.cmd` shim for a bare `gh` there. CI runs them on Ubuntu.
//
// 假 `gh` 是一段 POSIX shell 脚本，因此这些用例在 Windows 上跳过 —— 那里的 Node 不会为一个裸 `gh`
// 去 spawn `.cmd` 垫片。CI 在 Ubuntu 上跑它们。
//
// usage: node --test scripts/check-tag-lineage.test.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT = fileURLToPath(new URL('./check-tag-lineage.mjs', import.meta.url))
const posix = process.platform !== 'win32'

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`)
  return r.stdout.trim()
}

function commit(dir, message) {
  git(dir, ['commit', '-q', '--allow-empty', '-m', message])
  return git(dir, ['rev-parse', 'HEAD'])
}

const FAKE_GH = `#!/bin/sh
# Answers \`gh run list --commit <sha>\` from $FAKE_GH_RUNS, one "<sha> <conclusion>" per line.
sha=""
while [ $# -gt 0 ]; do
  case "$1" in
    --commit) sha="$2"; shift 2 ;;
    *) shift ;;
  esac
done
if [ -z "$sha" ] || [ ! -f "$FAKE_GH_RUNS" ]; then printf '[]\\n'; exit 0; fi
line=$(grep "^$sha " "$FAKE_GH_RUNS" || true)
if [ -z "$line" ]; then printf '[]\\n'; exit 0; fi
printf '[{"status":"completed","conclusion":"%s"}]\\n' "\${line#* }"
`

// A repository whose main holds one branch commit through a merge, the shape a push hook leaves: the
// author's commit is a parent of the merge, and no run ever carries its SHA.
// 一个仓：main 经一次合并持有一条分支提交，正是推送钩子留下的形状 —— 作者的提交是合并的父，没有任何运行带它的 SHA。
function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tag-lineage-'))
  git(dir, ['-c', 'init.defaultBranch=main', 'init', '-q', '.'])
  git(dir, ['config', 'user.name', 't'])
  git(dir, ['config', 'user.email', 't@t'])

  const base = commit(dir, 'base')
  git(dir, ['checkout', '-q', '-b', 'release-line'])
  const authored = commit(dir, 'authored on a branch')
  git(dir, ['checkout', '-q', 'main'])
  const tip = commit(dir, 'main moves on')
  git(dir, ['merge', '-q', '--no-ff', 'release-line', '-m', 'merge the release line'])
  const carrier = git(dir, ['rev-parse', 'HEAD'])

  // One commit past the merge, so a tag can sit on a branch commit main never took.
  // 合并之后再走一笔，好让某个 tag 落在 main 从未取走的分支提交上。
  git(dir, ['checkout', '-q', 'release-line'])
  const offMain = commit(dir, 'authored after the merge')
  git(dir, ['checkout', '-q', 'main'])

  git(dir, ['update-ref', 'refs/remotes/origin/main', carrier])

  const binDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tag-lineage-bin-'))
  const fakeGh = path.join(binDir, 'gh')
  fs.writeFileSync(fakeGh, FAKE_GH, 'utf8')
  fs.chmodSync(fakeGh, 0o755)
  const runs = path.join(binDir, 'runs.txt')
  fs.writeFileSync(runs, '', 'utf8')

  return { dir, base, authored, tip, carrier, offMain, binDir, runs }
}

function runGate(repo, tag, tagCommit) {
  git(repo.dir, ['tag', '-f', tag, tagCommit])
  const r = spawnSync(process.execPath, [SCRIPT, '--tag', tag, '--main', 'origin/main', '--root', repo.dir], {
    cwd: repo.dir,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${repo.binDir}${path.delimiter}${process.env.PATH}`, FAKE_GH_RUNS: repo.runs },
  })
  return { status: r.status, out: `${r.stdout}${r.stderr}` }
}

function green(repo, sha) {
  fs.appendFileSync(repo.runs, `${sha} success\n`, 'utf8')
}

test('a tag off main is refused before any CI lookup', { skip: !posix && 'fake gh is a POSIX shell script' }, () => {
  const repo = makeRepo()
  green(repo, repo.offMain) // even a green run does not excuse the lineage
  const r = runGate(repo, 'v9.0.0', repo.offMain)
  assert.equal(r.status, 1)
  assert.match(r.out, /is not on origin\/main/)
})

test('a tag whose own commit ran CI passes', { skip: !posix && 'fake gh is a POSIX shell script' }, () => {
  const repo = makeRepo()
  green(repo, repo.carrier)
  const r = runGate(repo, 'v9.0.1', repo.carrier)
  assert.equal(r.status, 0)
  assert.match(r.out, /has a green CI run/)
})

test('a tag the push hook rewrote passes on the commit that carried it onto main', { skip: !posix && 'fake gh is a POSIX shell script' }, () => {
  const repo = makeRepo()
  green(repo, repo.carrier)
  const r = runGate(repo, 'v9.0.2', repo.authored)
  assert.equal(r.status, 0)
  assert.match(r.out, new RegExp(`reached origin/main through ${repo.carrier.slice(0, 12)}`))
})

test('neither the tag nor its carrier green is a failure naming both', { skip: !posix && 'fake gh is a POSIX shell script' }, () => {
  const repo = makeRepo()
  fs.appendFileSync(repo.runs, `${repo.carrier} failure\n`, 'utf8')
  const r = runGate(repo, 'v9.0.3', repo.authored)
  assert.equal(r.status, 1)
  assert.match(r.out, new RegExp(`for ${repo.authored} or for ${repo.carrier}, the commit that carried it onto origin/main`))
})

test('a tag on the tip with no run of its own has no carrier to fall back on', { skip: !posix && 'fake gh is a POSIX shell script' }, () => {
  const repo = makeRepo()
  const r = runGate(repo, 'v9.0.4', repo.carrier)
  assert.equal(r.status, 1)
  assert.doesNotMatch(r.out, /the commit that carried it/)
})
