// SPDX-License-Identifier: Apache-2.0

/**
 * A markdown table cell that cannot break its own table.
 *
 * Every field this repository writes into a report's table is free text, and the cell separator is
 * `|` — so a value containing one splits the row and takes the table's structure with it. The
 * reports this guards are evidence, and a row that silently becomes two is worse than a row that
 * says something odd: the reader cannot tell a broken cell from a short one. Newlines break a cell
 * the same way, so they are covered here too.
 *
 * The escaping keeps the value rather than substituting it: a `|` inside a detail is a fact about
 * what was checked, and replacing it with another character would make the record say something
 * that was never true.
 *
 * 一个不会弄坏自己所在表格的 markdown 单元。
 *
 * 本仓写进报告表格的每个字段都是自由文本，而单元分隔符是 `|` —— 因此值里出现一个竖线就会把该行切开、
 * 连带毁掉表格结构。这里守着的那些报告是**证据**，而一行悄悄变成两行比一行说得古怪更糟：读者分不出
 * 「单元坏了」和「本来就短」。换行同样会破单元，故一并在此处理。
 *
 * 转义**保留**原值、而不是替换它：detail 里的一个竖线是关于「查过什么」的事实，换成别的字符会让记录
 * 说出从未成立的话。
 */
export function mdCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}
