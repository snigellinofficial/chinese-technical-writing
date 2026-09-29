#!/usr/bin/env node
// 违规样例提取程序。
//
// 用途：从历史会话的助手文本中筛出命中各类规则的句子，
// 为说明页的规则实例提供真实语料。输出按类别分组。
//
// 用法：node scripts/sample-extract.mjs [输出文件] [每类上限]

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { zstdDecompressSync } from 'node:zlib';

const DSH_SESSIONS = 'C:/Users/87878/.dsh/sessions';
const CLAUDE_PROJECTS = 'C:/Users/87878/.claude/projects';
const OUTPUT = process.argv[2] ?? 'sample-extract.md';
const LIMIT = Number(process.argv[3] ?? 40);

// 分类规则：每类给出标签、判定表达式与筛选说明。
const CATEGORIES = [
  {
    label: '无效否定与无效对比',
    test: /不是[^。；]{0,20}而是/,
    note: '被否定之物未必出现过',
  },
  {
    label: '评断性恭维',
    test: /(这条区分很重要|这个想法很好|言之有理|完全正确|提得很好|很有价值|值得肯定|非常专业|你说得对|很有见地)/,
    note: '评价用户意见的价值',
  },
  {
    label: '修辞色彩词',
    test: /(落入|宛如|犹如|堪称|无异于|如虎添翼|锦上添花|淋漓尽致)/,
    note: '词素带比喻形象',
  },
  {
    label: '空洞大词',
    test: /(落地|对齐|拉齐|聚焦|闭环|链路|维度|抓手|痛点|赋能|颗粒度|沉淀|打通)/,
    note: '含义模糊而语气强烈',
  },
  {
    label: '空洞动词',
    test: /(指向|关乎|意味着|进行分析|进行处理|进行明确)/,
    note: '语义空洞，可换成具体动作',
  },
  {
    label: '单字动词加补语',
    test: /(写完|写好|装好|装完|跑完|删掉|关掉|补上|取出|放进|写成)/,
    note: '口语结构',
  },
  {
    label: '缩略化表达',
    test: /(写清|讲清|理清|摸清)/,
    note: '动词短语压成名词短语',
  },
  {
    label: '名词短语加冒号',
    test: /[\u4e00-\u9fff]{2,10}：[^“”\s]/,
    note: '解释型冒号',
  },
  {
    label: '主语或宾语省略',
    test: /^(同步时|处理时|修改时|整理时|核对时|检查时)/,
    note: '缺施动者或者对象',
  },
  {
    label: '时间状态缺失',
    test: /^(我|我们)(在|把|将)?[^。；]{0,20}(补上|修改|新增|调整|删除|更新)/,
    note: '计划中的动作未标明',
  },
  {
    label: '口语虚词',
    test: /(然后|其实|的话|而已|差不多|搞定)/,
    note: '口语化连接与语气词',
  },
  {
    label: '成对套话句式',
    test: /(由此可见|换言之|换句话说|综上所述|不难看出|众所周知|在此基础上)/,
    note: '成对套话',
  },
  {
    label: '长句未切分',
    test: /[^，；、：,;]{56,}/,
    note: '连续 56 字以上无停顿',
  },
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
    if (text.trim().length > 0) sessions.push({ source: 'dsh', file, text });
  } catch {
    // 读取失败的会话跳过。
  }
}

for (const file of collectFiles(CLAUDE_PROJECTS, '.jsonl')) {
  try {
    const text = stripFences(readFileSync(file, 'utf8').split(/\r?\n/).map(extractAssistantText).join('\n'));
    if (text.trim().length > 0) sessions.push({ source: 'claude', file, text });
  } catch {
    // 同上。
  }
}

// 句子切分：以全角句号、分号、换行为界，长度限制在 12 至 120 字之间。
const splitSentences = (text) =>
  text
    .split(/[。；\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 12 && item.length <= 120);

const results = new Map();
for (const category of CATEGORIES) results.set(category.label, new Map());

for (const session of sessions) {
  const seenInSession = new Set();
  for (const sentence of splitSentences(session.text)) {
    for (const category of CATEGORIES) {
      const store = results.get(category.label);
      if (store.size >= LIMIT * 3) continue;
      if (!category.test.test(sentence)) continue;
      const key = sentence;
      if (!store.has(key)) store.set(key, { count: 0, sources: new Set() });
      const entry = store.get(key);
      entry.count += 1;
      entry.sources.add(session.source);
      seenInSession.add(category.label);
    }
  }
}

const lines = [];
lines.push('# 违规样例提取');
lines.push('');
lines.push(`语料：${sessions.length} 个会话。`);
lines.push('');
lines.push('说明：下表按类别列出命中规则的原始语句，用于说明页的规则实例。');
lines.push('');

for (const category of CATEGORIES) {
  const store = results.get(category.label);
  const rows = [...store.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, LIMIT);
  lines.push(`## ${category.label}`);
  lines.push('');
  lines.push(`判定说明：${category.note}`);
  lines.push('');
  if (rows.length === 0) {
    lines.push('（语料中未命中）');
    lines.push('');
    continue;
  }
  lines.push('| 原始语句 | 命中次数 | 来源 |');
  lines.push('|---|---|---|');
  for (const [sentence, meta] of rows) {
    const text = sentence.replace(/\|/g, '\\|');
    lines.push(`| ${text} | ${meta.count} | ${[...meta.sources].join('/')} |`);
  }
  lines.push('');
}

writeFileSync(OUTPUT, lines.join('\n'), 'utf8');

console.log(`语料会话：${sessions.length} 个`);
for (const category of CATEGORIES) {
  const store = results.get(category.label);
  console.log(`\n== ${category.label}（${store.size} 条候选）==`);
  const rows = [...store.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 6);
  for (const [sentence, meta] of rows) {
    console.log(`${String(meta.count).padStart(3)} 次  ${sentence.slice(0, 60)}`);
  }
}
console.log(`\n结果已写入 ${OUTPUT}`);
