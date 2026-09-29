#!/usr/bin/env node
// 中文写作规范检查程序。
//
// 用法：
//   node scripts/check.mjs                 # 检查当前目录下的 SKILL.md 与 reference.md
//   node scripts/check.mjs 路径1 路径2 …   # 检查指定的文件，目录会被递归展开
//
// 退出码：0 表示没有可直接判定的问题；1 表示存在问题，需要修改。

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';

const CJK = /[\u4e00-\u9fff]/;
const HEADING_TRAILING_PUNCT = /[，。、；：]$/;
const FULL_MARKS = '，。、；：？！（）《》“”⋯—';
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const HALF_TO_FULL = new Map([[',', '，'], [';', '；'], [':', '：'], ['?', '？'], ['!', '！']]);

// 套话与追问：命中即计入问题。
const BANNED = ['综上所述', '值得注意的是', '需要我继续吗'];

// 口语用词：命中后提示应当采用的书面表述。
const COLLOQUIAL = new Map([
  ['落盘', '写入文件，储存'],
  ['跑一遍', '执行一次'],
  ['搞定', '完成'],
  ['弄错', '出现错误'],
  ['说白了', '简言之'],
  ['加一块', '一并加入'],
  ['毛病', '问题'],
  ['站不住', '缺乏依据'],
  ['早就有', '已有'],
  ['放进', '置于'],
  ['取出', '提取'],
  ['看着', '看似'],
]);

// 高级词：命中后提示确认读者能否理解，必要时展开为朴实表述。
const JARGON = ['赋能', '闭环', '抓手', '拉齐', '颗粒度', '复用', '落地', '心智'];

// 博客式标题：标题应当直述主题。
const BLOG_TITLE = /(为什么|怎么|如何|你还在|竟然|居然|揭秘|真相|指南$|大全$)/;

// 待确认事项应当写成“待确认事项：”加编号列表。
const PENDING_STYLE = /(一处|一点|一个)(需|要)(你)?确认|需你确认/;

// 以否定衬肯定的句式：需要核对被否定之物是否真实出现过。
const NEGATION_AUDIT =
  /不是[^。；]{0,20}而是|并非[^。；]{0,20}而是|不只是[^。；]{0,20}而是|不在于[^。；]{0,20}而在于/g;

// 并列信息未编号的写法：应当用编号或者“首先”“其次”逐项写明。
const BARE_LIST = /[一二三四五六七八九十两]处[，、][^。；]{2,}[，、][^。；]{2,}[，、]/;

// “如下”引出内容：其后应当使用冒号，并且另起一段。
// 行末的“如下”与“如下：”均符合规范；内容与引出语同行时才需要改为分段。
const AS_FOLLOWS_INLINE = /如下[所示]*[，、。；]|如下[所示]*[^：。；，、\s]{2,}/;

// 跨段列举是否带编号无法由程序可靠判定：列举之后常跟承接段落，二者结构相同。
// 该项列入“参考”文档的实现要点，由输出之前的自检承担。

// 空洞动词：应当替换为具体动作。
const EMPTY_VERB = ['指向', '关乎', '意味着', '赋能于'];
// “作为”引出解释的写法：该词只用于表示身份归类。
// 表示归类时后面接名词短语，因此只检查“作为”引导的动词性解释与“作为……的”结构。
const AS_EXPLAINING = /作为[^，。；：]{0,12}(?:的|地|方式|手段|方法|途径|工具)|作为[^，。；：]{0,20}(?:使用|处理|说明|判断|衡量|解决)/;

// 长句未切分：一段之内连续 56 个字符没有出现逗号、分号、顿号或者句中点号。
const LONG_CLAUSE = /[^，；、：,;]{56,}/;

// 解释型冒号：正文语句中不应当用冒号引出解释。
const EXPLANATORY_COLON = /[\u4e00-\u9fff]：[^“”\s]/;
// 以下情形属于列表引出、引用引出与枚举分档，不计入审计。
const COLON_ALLOWED =
  /(分档|分级|四级|如下|以下|包括|例如|示例|原文|来源|构成|写进|判据|六节|分为|依次|如下所示|两类|三类|四类|五类|几种|若干类|情况|文本|方面|条件|部分|步骤|标准|字段|参数|要求|规定)[^。]{0,8}：/;
// 冒号之后紧接编号、一/二/三列项或者分号，属于列表引出。
const COLON_BEFORE_LIST = /[\u4e00-\u9fff]：(?:[1-9]\d*[.、)]|[（(][1-9\d]+[）)]|[一二三四五六七八九十]、|是|有|包括|例如|[^，。；]{1,12}[，、；])/;

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

  const lines = readFileSync(absolute, 'utf8').split(/\r?\n/);
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
      audit(
        file,
        lineNumber,
        '长句未切分',
        '连续 56 字以上没有停顿，应当用逗号或者分号切分',
        clause[0],
      );
    }

    if (BARE_LIST.test(line)) {
      audit(file, lineNumber, '并列信息未编号', '并列信息应当用编号或者“首先”“其次”逐项写明', line);
    }

    if (AS_FOLLOWS_INLINE.test(line)) {
      audit(file, lineNumber, '如下用法', '“如下”之后应当使用冒号并另起一段，段首用顺序词或编号', line);
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
  readFileSync(absolute, 'utf8')
    .split(/\r?\n/)
    .forEach((raw, index) => {
      if (/^\s*(```|~~~)/.test(raw)) {
        inlineFence = !inlineFence;
        return;
      }
      if (inlineFence) return;
      const found = raw.match(new RegExp('[\u4e00-\u9fff]`[^`]|[^`]`[\u4e00-\u9fff]', 'g'));
      if (!found) return;
      const hits = found.filter((snippet) => {
        const edge = snippet.startsWith('`') ? snippet.slice(1, 2) : snippet.slice(0, 1);
        return !FULL_MARKS.includes(edge) && !CJK.test(edge);
      });
      if (hits.length > 0) {
        report(file, index + 1, '行内代码两侧缺空格', `“${hits[0]}”两侧应当有一个半角空格`, raw);
      }
    });
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
