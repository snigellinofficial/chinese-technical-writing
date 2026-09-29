// 临时自检：确认列举引出语规则能命中目标句式，且不误伤结果句。
// 规则本身只做提示：列举内容另行分行时，才要求引出语以冒号收尾。
// 用法：node self-test.mjs
import { LIST_INTRO_PERIOD, LONG_CLAUSE } from './scripts/rules.mjs';

const quantityCases = [
  ['下述内容分为五个部分。', true],
  ['规则包含三类判据。', true],
  ['检查分为两项。', true],
  ['本章共分四节。', true],
  ['用代词时只能有一个含义。', false],
  ['避免孤立编号，同级标题不只有一个。', false],
  ['规则分为六节，各节的作用如下：', false],
  ['上述四个问题存在一个共同点，即四者都能通过语法检查。', false],
  ['该判断标准是读者能否从该词得到确切含义。', false],
];

const longCases = [
  [
    '引用第三方内容时注明出处全篇转载时在开头显著位置注明作者和出处并链接原文使用外部图片时在图片下方或者文末标明来源',
    true,
  ],
  ['引用第三方内容时，注明出处。全篇转载时，在开头显著位置注明作者和出处，并链接原文。', false],
];

let failed = 0;
const check = (label, expression, cases) => {
  for (const [text, expected] of cases) {
    // 使用 match 而非 test：test 在带 g 标志的表达式上会保留 lastIndex。
    const actual = text.match(expression) !== null;
    const ok = actual === expected;
    if (!ok) failed += 1;
    console.log(`${ok ? '通过' : '失败'}  ${label}  期望 ${expected}  实际 ${actual}  ${text.slice(0, 22)}`);
  }
};

check('列举引出语', LIST_INTRO_PERIOD, quantityCases);
check('长句未切分', LONG_CLAUSE, longCases);
console.log(failed === 0 ? '全部通过' : `失败 ${failed} 项`);
process.exit(failed === 0 ? 0 : 1);
