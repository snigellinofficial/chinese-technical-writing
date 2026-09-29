#!/usr/bin/env node
// 动词聚类统计程序。
//
// 用途：从历史会话的助手文本中提取动词性片段，按后缀结构聚类，
// 为“空洞动词与口语动词”排除表提供候选词。
//
// 用法：node scripts/verb-cluster.mjs [输出文件]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { zstdDecompressSync } from 'node:zlib';

const DSH_SESSIONS = 'C:/Users/87878/.dsh/sessions';
const CLAUDE_PROJECTS = 'C:/Users/87878/.claude/projects';
const OUTPUT = process.argv[2] ?? 'verb-cluster.md';

// 后缀结构：单字动词加补语或者体标记，属于口语结构的典型形态。
const SUFFIXES = ['成', '了', '出', '好', '完', '上', '下', '掉', '住', '到', '起来', '一下', '一遍', '一轮'];

// 结构化动词：前置的虚化动词，本身不承载动作含义。
const FILLER_HEADS = ['进行', '加以', '予以', '给予', '做出', '作出', '开展', '实施', '实现', '取得', '形成', '产生', '存在'];

// 单字动词候选，用于与后缀组合后统计。
const SINGLE_VERBS = [
  '写', '放', '取', '改', '看', '做', '弄', '拿', '给', '跑', '装', '拆', '查', '读', '记',
  '删', '补', '调', '测', '配', '连', '接', '开', '关', '收', '发', '过', '走', '想', '说',
];

// 已经列入词表的词，统计时单独标记。
const KNOWN = new Set([
  '落盘', '跑一遍', '搞定', '弄错', '放入', '取出', '看着', '写成', '放进', '改成', '看成',
  '进行', '加以', '予以', '给予',
]);

function extractAssistantText(line) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    return '';
  }
  const role = record.role ?? record.message?.role ?? record.type;
  if (role !== 'assistant') return '';
  const content = record.content ?? record.message?.content;
  const parts = [];
  if (typeof content === 'string') parts.push(content);
  else if (Array.isArray(content)) {
    for (const block of content) {
      if (typeof block === 'string') parts.push(block);
      else if (block?.type === 'text' && typeof block.text === 'string') parts.push(block.text);
    }
  }
  return parts.join('\n');
}

const stripFences = (text) => text.replace(/```[\s\S]*?```/g, ' ');

function collectFiles(root, extension) {
  const found = [];
  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.name.endsWith(extension)) found.push(full);
    }
  };
  visit(root);
  return found;
}

const sessions = [];

for (const file of collectFiles(DSH_SESSIONS, '.zstd')) {
  if (!file.includes('session')) continue;
  try {
    const text = stripFences(
      zstdDecompressSync(readFileSync(file)).toString('utf8').split(/\r?\n/).map(extractAssistantText).join('\n'),
    );
    if (text.trim().length > 0) sessions.push({ source: 'dsh', text });
  } catch {
    // 读取失败的会话跳过。
  }
}

for (const file of collectFiles(CLAUDE_PROJECTS, '.jsonl')) {
  try {
    const text = stripFences(readFileSync(file, 'utf8').split(/\r?\n/).map(extractAssistantText).join('\n'));
    if (text.trim().length > 0) sessions.push({ source: 'claude', text });
  } catch {
    // 同上。
  }
}

// 候选片段：单字动词加后缀，以及虚化动词本身。
const patterns = [];
for (const verb of SINGLE_VERBS) {
  for (const suffix of SUFFIXES) {
    patterns.push({ pattern: new RegExp(`${verb}${suffix}`, 'g'), form: `${verb}${suffix}` });
  }
}
for (const head of FILLER_HEADS) {
  patterns.push({ pattern: new RegExp(`${head}[\\u4e00-\\u9fff]{2}`, 'g'), form: `${head}＋双字名词` });
}

const rows = [];
for (const { pattern, form } of patterns) {
  const hitSessions = [];
  let occurrences = 0;
  for (const session of sessions) {
    const matches = session.text.match(pattern);
    if (matches && matches.length > 0) {
      hitSessions.push(session.source);
      occurrences += matches.length;
    }
  }
  if (hitSessions.length === 0) continue;
  rows.push({
    form,
    sessions: hitSessions.length,
    occurrences,
    registered: KNOWN.has(form.replace('＋双字名词', '')) ? '已登记' : '',
  });
}

rows.sort((a, b) => b.sessions - a.sessions || b.occurrences - a.occurrences);

const lines = [];
lines.push('# 动词聚类统计');
lines.push('');
lines.push(`统计语料：${sessions.length} 个会话。`);
lines.push('');
lines.push('统计口径：会话数指出现该片段的会话个数，出现次数指累计次数。');
lines.push('“已登记”表示该词已经列入替换表。');
lines.push('');
lines.push('| 动词片段 | 会话数 | 出现次数 | 是否已登记 |');
lines.push('|---|---|---|---|');
for (const row of rows) {
  lines.push(`| ${row.form} | ${row.sessions} | ${row.occurrences} | ${row.registered} |`);
}
lines.push('');
lines.push(`命中片段：${rows.length} 个。`);

writeFileSync(OUTPUT, lines.join('\n'), 'utf8');

console.log(`统计会话：${sessions.length} 个`);
console.log(`命中片段：${rows.length} 个`);
console.log('');
console.log('会话数  出现次数  是否已登记  片段');
for (const row of rows.slice(0, 45)) {
  console.log(
    `${String(row.sessions).padStart(6)}  ${String(row.occurrences).padStart(8)}  ${(row.registered || '未登记').padEnd(8)}  ${row.form}`,
  );
}
console.log('');
console.log(`结果已写入 ${OUTPUT}`);
