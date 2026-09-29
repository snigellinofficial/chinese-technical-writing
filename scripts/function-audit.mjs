#!/usr/bin/env node
// 虚词与句式模板统计程序。
//
// 用途：从历史会话的助手文本中统计口语化虚词与配对句式的分布，
// 为词表与句式表提供依据。
//
// 用法：node scripts/function-audit.mjs [输出文件]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { zstdDecompressSync } from 'node:zlib';

const DSH_SESSIONS = 'C:/Users/87878/.dsh/sessions';
const CLAUDE_PROJECTS = 'C:/Users/87878/.claude/projects';
const OUTPUT = process.argv[2] ?? 'function-audit.md';

// 口语化虚词与连接词，以及对应的书面表述。
const FUNCTION_WORDS = new Map([
  ['然后', '随后，接着'],
  ['所以', '因此'],
  ['但是', '然而，不过'],
  ['而且', '并且，同时'],
  ['其实', '实际上'],
  ['比较', '较为'],
  ['特别', '尤其'],
  ['挺', '较'],
  ['蛮', '较'],
  ['反正', '无论如何'],
  ['差不多', '大约'],
  ['一下', '（删除或者改为具体动作）'],
  ['一些', '若干'],
  ['一点', '少量'],
  ['有点', '略微'],
  ['特别地', '尤其'],
  ['非常', '（给出依据或者数值）'],
  ['真的', '确实'],
  ['确实', '（给出依据）'],
  ['基本', '大体'],
  ['基本上', '大体上'],
  ['大概', '大约'],
  ['估计', '预计'],
  ['可能', '（保留情态，不得改为必然）'],
  ['应该', '应当'],
  ['需要', '须'],
  ['可以', '可'],
  ['如果', '若'],
  ['因为', '由于'],
  ['为了', '为'],
  ['关于', '就'],
  ['对于', '就'],
  ['通过', '经'],
  ['按照', '依'],
  ['根据', '据'],
  ['由于', '因'],
  ['以及', '及'],
  ['并且', '并'],
  ['或者', '或'],
  ['还是', '或'],
  ['而已', '（删除）'],
  ['罢了', '（删除）'],
  ['的话', '（删除）'],
  ['来说', '（删除）'],
]);

// 配对句式模板：成对出现时统计，用于识别套话结构。
const PATTERNS = [
  ['不是……而是……', /不是[^。；]{0,20}而是/g],
  ['不仅……而且……', /不仅[^。；]{0,20}而且/g],
  ['既……又……', /既[^。；]{0,12}又/g],
  ['一方面……另一方面……', /一方面[^。；]{0,30}另一方面/g],
  ['既……也……', /既[^。；]{0,12}也/g],
  ['无论……都……', /无论[^。；]{0,20}都/g],
  ['如果……就……', /如果[^。；]{0,20}就/g],
  ['虽然……但是……', /虽然[^。；]{0,20}但是/g],
  ['因为……所以……', /因为[^。；]{0,20}所以/g],
  ['首先……其次……', /首先[^。；]{0,30}其次/g],
  ['第一……第二……', /第一[^。；]{0,20}第二/g],
  ['其一……其二……', /其一[^。；]{0,20}其二/g],
  ['值得注意的是', /值得注意的是/g],
  ['综上所述', /综上所述/g],
  ['由此可见', /由此可见/g],
  ['换言之', /换言之/g],
  ['换句话说', /换句话说/g],
  ['总而言之', /总而言之/g],
  ['不难看出', /不难看出/g],
  ['众所周知', /众所周知/g],
  ['一方面', /一方面/g],
  ['另一方面', /另一方面/g],
  ['与此同时', /与此同时/g],
  ['在此基础上', /在此基础上/g],
  ['从某种意义上', /从某种意义上/g],
];

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

const countHits = (test) => {
  let sessionCount = 0;
  let occurrences = 0;
  for (const session of sessions) {
    const matches = session.text.match(test);
    if (matches && matches.length > 0) {
      sessionCount += 1;
      occurrences += matches.length;
    }
  }
  return { sessionCount, occurrences };
};

const wordRows = [];
for (const [word, formal] of FUNCTION_WORDS) {
  const { sessionCount, occurrences } = countHits(new RegExp(word, 'g'));
  if (sessionCount === 0) continue;
  wordRows.push({ word, formal, sessionCount, occurrences });
}
wordRows.sort((a, b) => b.sessionCount - a.sessionCount || b.occurrences - a.occurrences);

const patternRows = [];
for (const [label, test] of PATTERNS) {
  const { sessionCount, occurrences } = countHits(new RegExp(test.source, 'g'));
  if (sessionCount === 0) continue;
  patternRows.push({ label, sessionCount, occurrences });
}
patternRows.sort((a, b) => b.sessionCount - a.sessionCount || b.occurrences - a.occurrences);

const lines = [];
lines.push('# 虚词与句式模板统计');
lines.push('');
lines.push(`统计语料：${sessions.length} 个会话。`);
lines.push('');
lines.push('统计口径：会话数指出现该对象的会话个数，出现次数指累计次数。');
lines.push('');
lines.push('## 虚词与连接词');
lines.push('');
lines.push('| 词 | 书面表述 | 会话数 | 出现次数 |');
lines.push('|---|---|---|---|');
for (const row of wordRows) {
  lines.push(`| ${row.word} | ${row.formal} | ${row.sessionCount} | ${row.occurrences} |`);
}
lines.push('');
lines.push('## 句式模板');
lines.push('');
lines.push('| 句式 | 会话数 | 出现次数 |');
lines.push('|---|---|---|');
for (const row of patternRows) {
  lines.push(`| ${row.label} | ${row.sessionCount} | ${row.occurrences} |`);
}
lines.push('');
lines.push(`命中虚词：${wordRows.length} 个；命中句式：${patternRows.length} 个。`);

writeFileSync(OUTPUT, lines.join('\n'), 'utf8');

console.log(`统计会话：${sessions.length} 个`);
console.log('');
console.log('虚词与连接词（前 20）');
for (const row of wordRows.slice(0, 20)) {
  console.log(`${String(row.sessionCount).padStart(4)} 会话 ${String(row.occurrences).padStart(6)} 次  ${row.word} -> ${row.formal}`);
}
console.log('');
console.log('句式模板（前 20）');
for (const row of patternRows.slice(0, 20)) {
  console.log(`${String(row.sessionCount).padStart(4)} 会话 ${String(row.occurrences).padStart(6)} 次  ${row.label}`);
}
console.log('');
console.log(`结果已写入 ${OUTPUT}`);
