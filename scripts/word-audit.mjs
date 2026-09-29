#!/usr/bin/env node
// 空洞词与修辞词统计程序。
//
// 用途：对历史会话中助手输出的文本做检索，统计候选词的分布，
// 为“书面语替换表”提供依据。统计单位是会话数（含该词的会话个数）。
//
// 用法：node scripts/word-audit.mjs [输出文件]

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { zstdDecompressSync } from 'node:zlib';

const DSH_SESSIONS = 'C:/Users/87878/.dsh/sessions';
const CLAUDE_PROJECTS = 'C:/Users/87878/.claude/projects';
const OUTPUT = process.argv[2] ?? 'word-audit.md';

// 候选词：按类别分组，便于观察聚类。
const CANDIDATES = {
  生硬名词: [
    '赋能', '闭环', '抓手', '颗粒度', '心智', '生态', '链路', '底座', '范式', '维度',
    '矩阵', '闭环链路', '护城河', '飞轮', '痛点', '卡点', '堵点', '组合拳', '里程碑',
  ],
  空洞动词: [
    '落地', '对齐', '拉齐', '拉通', '倒逼', '沉淀', '复盘', '抓手', '打法', '打通',
    '打通链路', '穿透', '触达', '复用', '反哺', '聚焦', '协同', '联动', '闭环',
  ],
  修辞色彩: [
    '落入', '赋能于', '宛如', '犹如', '堪称', '无异于', '犹如一', '举足轻重',
    '至关重要', '不可或缺', '淋漓尽致', '可见一斑', '不言而喻', '毋庸置疑',
    '不可同日而语', '如虎添翼', '锦上添花', '水到渠成', '一蹴而就', '对症下药',
  ],
  套话连接: [
    '综上所述', '值得注意的是', '总而言之', '不难看出', '由此可见', '换言之',
    '换句话说', '众所周知', '一言以蔽之', '首先其次', '在此基础上',
  ],
  情绪与程度: [
    '极大', '极大地', '显著地', '深深地', '充分地', '完美地', '优雅地',
    '极其', '尤为', '格外', '颇为', '着实', '的确',
  ],
};

// 只从助手文本中统计：用户文本、技能正文与代码块都要排除。
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

// 去掉围栏代码块，避免把代码与规则示例计入。
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

// 第一类语料：DSH 会话记录，zstd 压缩后为 JSONL。
for (const file of collectFiles(DSH_SESSIONS, '.zstd')) {
  if (!file.includes('session')) continue;
  try {
    const text = stripFences(
      zstdDecompressSync(readFileSync(file))
        .toString('utf8')
        .split(/\r?\n/)
        .map(extractAssistantText)
        .join('\n'),
    );
    if (text.trim().length > 0) sessions.push({ source: 'dsh', file, text });
  } catch {
    // 读取失败的会话跳过，不影响统计口径。
  }
}

// 第二类语料：Claude Code 会话记录，JSONL 明文。
for (const file of collectFiles(CLAUDE_PROJECTS, '.jsonl')) {
  try {
    const text = stripFences(
      readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .map(extractAssistantText)
        .join('\n'),
    );
    if (text.trim().length > 0) sessions.push({ source: 'claude', file, text });
  } catch {
    // 同上。
  }
}

const totalChars = sessions.reduce((sum, item) => sum + item.text.length, 0);

const rows = [];
for (const [group, words] of Object.entries(CANDIDATES)) {
  for (const word of words) {
    const hitSessions = sessions.filter((item) => item.text.includes(word));
    if (hitSessions.length === 0) continue;
    const occurrences = hitSessions.reduce(
      (sum, item) => sum + item.text.split(word).length - 1,
      0,
    );
    rows.push({
      group,
      word,
      sessions: hitSessions.length,
      occurrences,
      sources: [...new Set(hitSessions.map((item) => item.source))].join('/'),
    });
  }
}

rows.sort((a, b) => b.sessions - a.sessions || b.occurrences - a.occurrences);

const lines = [];
lines.push('# 空洞词与修辞词统计');
lines.push('');
lines.push(`统计语料：${sessions.length} 个会话（DSH ${sessions.filter((s) => s.source === 'dsh').length} 个，Claude Code ${sessions.filter((s) => s.source === 'claude').length} 个）。`);
lines.push(`助手文本总量：约 ${totalChars.toLocaleString('en-US')} 字符。`);
lines.push('');
lines.push('统计口径：会话数指包含该词的会话个数，出现次数指全部会话中的累计次数。');
lines.push('');
lines.push('| 类别 | 词 | 会话数 | 出现次数 | 语料来源 |');
lines.push('|---|---|---|---|---|');
for (const row of rows) {
  lines.push(`| ${row.group} | ${row.word} | ${row.sessions} | ${row.occurrences} | ${row.sources} |`);
}
lines.push('');
lines.push(`命中词数：${rows.length} 个。`);

writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
console.log(`统计会话：${sessions.length} 个`);
console.log(`助手文本：约 ${totalChars.toLocaleString('en-US')} 字符`);
console.log(`命中候选词：${rows.length} 个`);
console.log('');
for (const row of rows.slice(0, 40)) {
  console.log(`${String(row.sessions).padStart(4)} 会话  ${String(row.occurrences).padStart(5)} 次  [${row.group}] ${row.word}`);
}
console.log('');
console.log(`结果已写入 ${OUTPUT}`);
