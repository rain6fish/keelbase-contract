#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Check that a release tag is on main and that what it points at passed CI.
 *
 * A tag cannot be taken back, and it can be cut from a branch commit that never
 * reached main, or from a commit whose CI never ran — v1.22.0 was both until its
 * release line was merged. This runs on every tag push and fails before any
 * consumer can treat the tag as a release.
 *
 * Green CI is looked for on the tagged commit first. A push hook that rewrites
 * what lands on main leaves the author's commit as a parent of the hook's merge
 * rather than as the head any push ran CI on, so no run will ever carry its SHA;
 * in that case the check accepts the commit that first carried the tagged one
 * onto main (`git rev-list --ancestry-path <tag>..<main>`, oldest entry) — the
 * push that introduced it, whose CI covered the tagged content.
 *
 *   node scripts/check-tag-lineage.mjs --tag v1.23.0 --main origin/main --workflow CI
 *
 * Exit codes
 *   0  the tag is on main, and it or the commit that carried it onto main has a
 *      completed successful CI run
 *   1  the tag is not on main, or neither commit has a green CI run
 *   2  the check cannot read its inputs (no tag, no ancestry, no gh)
 *
 * —— 中文 ——
 * 检查发布 tag 是否在 main 上、它指向的内容是否过了 CI。
 *
 * tag 收不回来，而它可以打在从未进 main 的分支提交上，或打在 CI 从未跑过的提交上——
 * v1.22.0 在发布线并入 main 之前两者都占。本检查在每次 tag 推送时运行，任何消费方
 * 把它当发布之前，先让它失败。
 *
 * 绿的 CI 先在被打了 tag 的提交上找。推送钩子会改写落到 main 上的东西，于是作者的提交
 * 成了钩子那笔合并的**父**、而不是任何一次推送跑 CI 时的 head，任何运行都不会带它的 SHA；
 * 这种情况下改为接受「第一次把它带进 main 的那笔」——`git rev-list --ancestry-path
 * <tag>..<main>` 里最老的一条，也就是引入它的那次推送，其 CI 覆盖了被 tag 的内容。
 *
 *   node scripts/check-tag-lineage.mjs --tag v1.23.0 --main origin/main --workflow CI
 *
 * 退出码
 *   0  tag 在 main 上，且它本身或把它带进 main 的那笔有一次已完成、成功的 CI
 *   1  tag 不在 main 上，或两者都没有绿的 CI
 *   2  输入读不出（无 tag、无祖先关系、无 gh）
 */
import { execFileSync } from 'node:child_process'

function value(name, fallback) {
  const i = process.argv.indexOf(name)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim()
}

function stop(code, message) {
  const label = code === 0 ? 'OK' : code === 1 ? 'FAIL' : 'UNKNOWN'
  console.error(`${label} ${message}`)
  process.exit(code)
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('usage: node scripts/check-tag-lineage.mjs --tag <tag> [--main origin/main] [--workflow CI] [--root DIR]')
  process.exit(0)
}

const root = value('--root', process.cwd())
const tag = value('--tag', process.env.GITHUB_REF_NAME || '')
if (!tag) stop(2, 'no --tag and GITHUB_REF_NAME is unset / 未给 --tag，且 GITHUB_REF_NAME 为空')

let commit
try {
  commit = run('git', ['-C', root, 'rev-parse', '--verify', `${tag}^{commit}`])
} catch {
  stop(2, `no such tag: ${tag} / 没有这个 tag：${tag}`)
}

const main = value('--main', (() => {
  try {
    run('git', ['-C', root, 'rev-parse', '--verify', 'origin/main'])
    return 'origin/main'
  } catch {
    return 'main'
  }
})())

try {
  run('git', ['-C', root, 'merge-base', '--is-ancestor', commit, main])
} catch (error) {
  if (error.status === 1) {
    stop(1, `${tag} (${commit.slice(0, 12)}) is not on ${main} — tag a commit that is on main / ${tag} 不在 ${main} 上：请给 main 上的提交打 tag`)
  }
  stop(2, `cannot read ancestry of ${commit} against ${main}: ${error.message} / 读不出 ${commit} 与 ${main} 的祖先关系`)
}

const workflow = value('--workflow', 'CI')

function greenRun(sha) {
  let raw
  try {
    raw = run('gh', ['run', 'list', '--commit', sha, '--workflow', workflow, '--limit', '20', '--json', 'status,conclusion'])
  } catch (error) {
    stop(2, `cannot read ${workflow} runs for ${sha}: ${error.message} / 读不出 ${sha} 的 ${workflow} 运行记录`)
  }

  let runs
  try {
    runs = JSON.parse(raw)
  } catch {
    stop(2, 'gh returned unreadable JSON / gh 返回的 JSON 读不出')
  }

  return runs.some((r) => r.status === 'completed' && r.conclusion === 'success')
}

if (greenRun(commit)) {
  stop(0, `${tag} = ${commit.slice(0, 12)} is on ${main} and has a green ${workflow} run / ${tag} 在 ${main} 上，且有绿的 ${workflow} 运行`)
}

// The push hook leaves the author's commit as a parent of its merge, so that commit never headed a
// push and no run carries its SHA. The commit that first carried it onto main is the push to judge.
// 推送钩子把作者的提交留成它那笔合并的父，于是该提交从未当过某次推送的 head、也没有运行带它的 SHA。
// 第一次把它带进 main 的那笔，才是该判的那次推送。
let carrier = ''
try {
  carrier = run('git', ['-C', root, 'rev-list', '--ancestry-path', `${commit}..${main}`])
    .split('\n')
    .filter(Boolean)
    .pop() || ''
} catch (error) {
  stop(2, `cannot walk the ancestry path from ${commit} to ${main}: ${error.message} / 走不通 ${commit} 到 ${main} 的祖先路径`)
}

if (carrier && carrier !== commit && greenRun(carrier)) {
  stop(0, `${tag} = ${commit.slice(0, 12)} reached ${main} through ${carrier.slice(0, 12)}, whose ${workflow} run is green; the push hook rewrote the commit, so no run carries its own SHA / ${tag} 经 ${carrier.slice(0, 12)} 进 ${main}，该提交的 ${workflow} 为绿；推送钩子改写了提交，故没有运行带它自己的 SHA`)
}

stop(1, `no completed successful ${workflow} run for ${commit}${carrier && carrier !== commit ? ` or for ${carrier}, the commit that carried it onto ${main}` : ''} — push main, wait for CI, then tag / ${commit}${carrier && carrier !== commit ? ` 与把它带进 ${main} 的 ${carrier}` : ''} 都没有已完成且成功的 ${workflow} 运行：先推 main、等 CI 绿，再打 tag`)
