#!/usr/bin/env node
// 中文写作规范检查程序。
//
// 用法：
//   node scripts/check.mjs                 # 检查当前目录下的 SKILL.md 与 reference.md
//   node scripts/check.mjs 路径1 路径2 …   # 检查指定的文件，目录会被递归展开
//
// 退出码：0 表示没有可直接判定的问题；1 表示存在问题，需要修改。
// 规则表达式集中在 scripts/rules.mjs，本文件只负责读取文件、逐行判定与输出结果。

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import {
  BANNED,
  COLLOQUIAL,
  ELEGANT_IDIOMS,
  FLATTERY,
  FUNCTION_WORDS,
  FUNCTION_OPTIONAL,
  PATTERN_TEMPLATES,
  TRUNCATED,
  NOUN_PHRASE_COLON,
  MISSING_TIME_MARK,
  ABRUPT_TURN,
  ENGLISH_TERM,
  TERM_EXPLAINED,
  TERM_NOISE,
  TERM_EXCEPTIONS,
  JARGON,
  BLOG_TITLE,
  PENDING_STYLE,
  NEGATION_AUDIT,
  BARE_LIST,
  AS_FOLLOWS_INLINE,
  EMPTY_VERB,
  AS_EXPLAINING,
  EXPLANATORY_COLON,
  COLON_ALLOWED,
  COLON_BEFORE_LIST,
  LIST_INTRO_PERIOD,
  LONG_CLAUSE,
  VERB_ASPECT,
} from './rules.mjs';

const CJK = /[\u4e00-\u9fff]/;
const HEADING_TRAILING_PUNCT = /[，。、；：]$/;
const FULL_MARKS = '，。、；：？！（）《》“”⋯—';
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const HALF_TO_FULL = new Map([[',', '，'], [';', '；'], [':', '：'], ['?', '？'], ['!', '！']]);
const INLINE_CODE_EDGE = new RegExp('[\u4e00-\u9fff]`[^`]|[^`]`[\u4e00-\u9fff]', 'g');

const isTableRule = (line) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('|');
const isListItem = (line) => /^\s*([-*|>]|\d+[.、)]|（\d+）)/.test(line);

// 去掉 HTML 注释、行内代码、链接目标与网址，避免把示例代码判为违规。
const maskLine = (line) =>
  line
    .replace(/<!--.*?-->/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/<https?:\/\/[^>]*>/g, '')
    .replace(/https?:\/\/\S+/g, '');

function collectFiles(target) {
  const info = statSync(target);
  if (info.isFile()) return [target];
  const found = [];
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(target, entry.name);
    if (entry.isDirectory()) found.push(...collectFiles(full));
    else if (extname(entry.name).toLowerCase() === '.md') found.push(full);
  }
  return found;
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ['SKILL.md', 'reference.md'];

let files = [];
try {
  files = targets.flatMap((target) => collectFiles(target));
} catch (error) {
  console.error(`无法读取检查目标：${error.message}`);
  process.exit(1);
}

const issues = [];
const audits = [];
const report = (file, line, rule, detail, excerpt) =>
  issues.push({ file, line, rule, detail, excerpt: excerpt.trim().slice(0, 70) });
const audit = (file, line, rule, detail, excerpt) =>
  audits.push({ file, line, rule, detail, excerpt: excerpt.trim().slice(0, 70) });

for (const absolute of files) {
  const file = relative(process.cwd(), absolute).split(sep).join('/');
  if (CJK.test(file.split('/').pop())) {
    report(file, 1, '文件名含中文', '文件名只允许使用小写半角字符', file);
  }

  const content = readFileSync(absolute, 'utf8');
  const lines = content.split(/\r?\n/);
  let inFence = false;

  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    if (/^\s*(```|~~~)/.test(raw)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const heading = raw.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const title = heading[2].trim();
      if (HEADING_TRAILING_PUNCT.test(title)) {
        report(file, lineNumber, '标题末尾点号', '标题末尾不得出现点号', title);
      }
      if (BLOG_TITLE.test(title)) {
        report(file, lineNumber, '标题写法', '标题应当直述主题', title);
      }
    }
    if (isTableRule(raw)) return;

    const line = maskLine(raw);
    if (!CJK.test(line)) return;

    const emoji = line.match(EMOJI);
    if (emoji) report(file, lineNumber, '使用 emoji', `${emoji[0]} 应当删除`, line);

    const adjacency = line.match(/[\u4e00-\u9fff][A-Za-z]|[A-Za-z][\u4e00-\u9fff]/);
    if (adjacency) {
      report(file, lineNumber, '字母与汉字紧邻', `${adjacency[0]} 之间应当有一个半角空格`, line);
    }

    if (/[!！]{2,}/.test(line)) report(file, lineNumber, '感叹号连用', '不得多个感叹号连用', line);

    const fullWidth = line.match(/[\uff10-\uff19\uff21-\uff3a\uff41-\uff5a]/);
    if (fullWidth) report(file, lineNumber, '全角字母或数字', `${fullWidth[0]} 应当改为半角`, line);

    for (const [half, full] of HALF_TO_FULL) {
      const escaped = half.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`[\\u4e00-\\u9fff]${escaped}[\\u4e00-\\u9fff]`).test(line)) {
        report(file, lineNumber, '半角标点夹在汉字之间', `${half} 应当改为全角 ${full}`, line);
      }
    }

    for (const word of BANNED) {
      // 禁令条目按元语言用法写在引号内；表格中的对照示例属于反例。二者都不计入问题。
      const prose = line.replace(/“[^”]*”/g, '');
      const isTableRow = raw.trim().startsWith('|');
      if (prose.includes(word) && !isTableRow) {
        report(file, lineNumber, '套话或追问', `出现“${word}”`, line);
      }
    }

    for (const [colloquial, formal] of COLLOQUIAL) {
      if (line.includes(colloquial)) {
        audit(file, lineNumber, '口语用词', `“${colloquial}”应当改为“${formal}”`, line);
      }
    }

    // 典雅成语属于应保留的表达，命中时提示不要改写。
    for (const idiom of ELEGANT_IDIOMS) {
      if (line.includes(idiom)) {
        audit(file, lineNumber, '典雅成语', `“${idiom}”属于规范书面表达，予以保留`, line);
        break;
      }
    }

    // 评断与恭维之词：命中即列为审计项，提示改为直接陈述。
    for (const word of FLATTERY) {
      if (line.includes(word)) {
        audit(file, lineNumber, '评断与恭维之词', `“${word}”应当改为直接陈述处理方式`, line);
        break;
      }
    }

    // 口语化虚词：命中即列为审计项，提示改为书面表述。
    for (const [word, formal] of FUNCTION_WORDS) {
      if (line.includes(word)) {
        audit(file, lineNumber, '口语虚词', `“${word}”应当改为“${formal}”`, line);
      }
    }

    // 可选择替换的虚词：只在同一行出现多个时提示，避免逐词报出。
    const optionalHits = [...FUNCTION_OPTIONAL.keys()].filter((word) => line.includes(word));
    if (optionalHits.length >= 2) {
      audit(
        file,
        lineNumber,
        '虚词可凝练',
        `“${optionalHits.join('”“')}”可以改用单字形式`,
        line,
      );
    }

    // 句式模板：成对出现的套话结构，命中即提示复核。
    for (const [label, pattern] of PATTERN_TEMPLATES) {
      if (new RegExp(pattern.source).test(line)) {
        audit(file, lineNumber, '句式模板', `“${label}”属于成对套话，确认是否必要`, line);
      }
    }

    // 缩略化表达：命中即列为审计项，提示展开为完整结构。
    for (const [truncated, expanded] of TRUNCATED) {
      if (line.includes(truncated)) {
        audit(file, lineNumber, '缩略化表达', `“${truncated}”应当展开为“${expanded}”`, line);
      }
    }

    // 名词短语加冒号：属于解释型冒号的典型形态。
    if (!heading && !isListItem(raw) && NOUN_PHRASE_COLON.test(raw) && !COLON_ALLOWED.test(line)) {
      audit(
        file,
        lineNumber,
        '名词短语冒号',
        '名词短语不得用冒号引出解释，应当改为完整的动宾结构',
        line,
      );
    }

    // 动作句缺少时间标记：确认完成、进行或者计划状态是否写明。
    if (MISSING_TIME_MARK(line) && !isListItem(raw) && !heading) {
      audit(file, lineNumber, '缺少时间标记', '动作句应当标明完成、进行或者计划状态', line);
    }

    for (const word of JARGON) {
      if (line.includes(word)) {
        audit(file, lineNumber, '高级词', `“${word}”需要确认读者能否理解`, line);
      }
    }

    if (PENDING_STYLE.test(line)) {
      audit(file, lineNumber, '待确认写法', '改用“待确认事项：”加编号列表', line);
    }

    // 排除链接与行内代码之后，检查是否出现长时间没有切分的长句。
    const clause = maskLine(raw).match(LONG_CLAUSE);
    if (clause) {
      audit(file, lineNumber, '长句未切分', '连续 56 字以上没有停顿，应当用逗号或者分号切分', clause[0]);
    }

    if (BARE_LIST.test(line)) {
      audit(file, lineNumber, '并列信息未编号', '并列信息应当用编号或者“首先”“其次”逐项写明', line);
    }

    // 判定之前先去掉引号之内的内容，避免把规则自身的引用判为违规。
    if (AS_FOLLOWS_INLINE.test(line.replace(/“[^”]*”/g, ''))) {
      audit(file, lineNumber, '如下用法', '“如下”之后应当使用冒号并另起一段，段首用顺序词或编号', line);
    }

    // 生硬转折：转折词两侧都是短评价语时，提示展开为完整分句。
    if (ABRUPT_TURN.test(line)) {
      audit(
        file,
        lineNumber,
        '生硬转折',
        '转折词两侧须展开为完整分句，或者拆成两句陈述理由',
        line,
      );
    }

    if (LIST_INTRO_PERIOD.test(raw)) {
      audit(file, lineNumber, '列举引出语用句号', '引出列举的短句应当以冒号收尾', raw);
    }

    // 单字动词加体标记或者补语：确认该结构是否有对应的书面词。
    const aspect = line.match(VERB_ASPECT);
    if (aspect) {
      audit(
        file,
        lineNumber,
        '动词体标记',
        `“${aspect.slice(0, 3).join('”“')}”属于单字动词加补语，确认是否有书面词可替换`,
        line,
      );
    }

    for (const verb of EMPTY_VERB) {
      if (line.includes(verb)) {
        audit(file, lineNumber, '空洞动词', `“${verb}”应当替换为具体动作`, line);
      }
    }

    if (AS_EXPLAINING.test(line)) {
      audit(file, lineNumber, '“作为”用法', '“作为”只用于表示身份归类，引出解释时应当改用“因为”“由于”', line);
    }

    if (
      !heading &&
      !isListItem(raw) &&
      EXPLANATORY_COLON.test(line) &&
      !COLON_ALLOWED.test(line) &&
      !COLON_BEFORE_LIST.test(line)
    ) {
      audit(file, lineNumber, '解释型冒号', '解释语句应当拆成完整句子，用“由于”“因此”连接', line);
    }

    for (const hit of line.replace(/“[^”]*”/g, '').match(NEGATION_AUDIT) ?? []) {
      audit(file, lineNumber, '否定表述', `“${hit}”的被否定之物必须真实出现过`, line);
    }
  });

  // 行内代码两侧与汉字之间要有空格，只检查围栏之外的正文。
  let inlineFence = false;
  content.split(/\r?\n/).forEach((raw, index) => {
    if (/^\s*(```|~~~)/.test(raw)) {
      inlineFence = !inlineFence;
      return;
    }
    if (inlineFence) return;
    const found = raw.match(INLINE_CODE_EDGE);
    if (!found) return;
    const hits = found.filter((snippet) => {
      const edge = snippet.startsWith('`') ? snippet.slice(1, 2) : snippet.slice(0, 1);
      return !FULL_MARKS.includes(edge) && !CJK.test(edge);
    });
    if (hits.length > 0) {
      report(file, index + 1, '行内代码两侧缺空格', `“${hits[0]}”两侧应当有一个半角空格`, raw);
    }
  });

  // 中英混用之一：全文范围内的英文术语，至少应有一处附中文释义。
  // 判定按文件进行：出现两次以上、且全文无括号释义、且不在例外表内的术语列入审计。
  const plain = content.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
  const occurrences = new Map();
  for (const term of plain.match(ENGLISH_TERM) ?? []) {
    occurrences.set(term, (occurrences.get(term) ?? 0) + 1);
  }
  const explained = TERM_EXPLAINED.test(plain);
  for (const [term, count] of occurrences) {
    if (count < 2) continue;
    if (TERM_EXCEPTIONS.has(term)) continue;
    if (TERM_NOISE.test(term)) continue;
    if (explained) continue;
    audit(file, 0, '英文术语未附释义', `“${term}”出现 ${count} 次，全文未见中文释义`, term);
  }
}

console.log(`检查文件：${files.length} 个`);
for (const absolute of files) console.log(`  ${relative(process.cwd(), absolute).split(sep).join('/')}`);

console.log(`\n可直接判定的问题：${issues.length} 处`);
for (const issue of issues) {
  console.log(`${issue.file}:${issue.line}: [${issue.rule}] ${issue.detail}`);
  console.log(`  原文：${issue.excerpt}`);
}

console.log(`\n需要人工核对的审计项：${audits.length} 处`);
for (const item of audits) {
  console.log(`${item.file}:${item.line}: [${item.rule}] ${item.detail}`);
  console.log(`  原文：${item.excerpt}`);
}

if (issues.length > 0) {
  console.error(`\n未通过检查：${issues.length} 处问题需要修改。`);
  process.exit(1);
}
console.log('\n通过检查。审计项需要逐条确认。');
