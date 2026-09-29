// 生成项目名称图。
//
// 字形来自像素字体 Zpix（MIT 许可）。字体经子集化后以 data URI 嵌入 SVG，
// 因此图像不依赖访问者的本机字体，也不包含位图。
//
// 子集由 tools/make-font-subset.py 生成，保存在 build/zpix-subset.b64。
// 运行方式：node make-banner.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const CJK = '让我们讲中文！';
const LATIN = 'LET US SPEAK CHINESE';

const SUBSET_PATH = 'build/zpix-subset.b64';
const OUTPUT_PATH = 'assets/banner.svg';

// 字形按 12 像素设计，故尺寸与坐标都取 12 的整数倍，避免缩放模糊。
const PIXEL = 24;
const CJK_SIZE = PIXEL * 2;
const LATIN_SIZE = PIXEL;
const TRACKING = PIXEL / 2;
const GAP = PIXEL * 2;
const PAD_X = PIXEL * 3;
const PAD_Y = PIXEL * 1.5;

const BG = '#0b1220';
const CREAM = '#e8d8a8';
const AMBER = '#facc15';
const MARK = '#334155';

const subset = readFileSync(SUBSET_PATH, 'utf8').trim();

// 按字形宽度估算两行文字的宽度，用于确定画布与居中位置。
const cjkWidth = [...CJK].length * CJK_SIZE;
const latinWidth = LATIN.length * (LATIN_SIZE + TRACKING) - TRACKING;

const contentWidth = Math.max(cjkWidth, latinWidth);
const width = Math.ceil((contentWidth + PAD_X * 2) / 12) * 12;
const height = PAD_Y * 2 + CJK_SIZE + GAP + LATIN_SIZE;

const centerX = width / 2;
const cjkBaseline = PAD_Y + CJK_SIZE;
const latinBaseline = cjkBaseline + GAP + LATIN_SIZE;

// 四角十字标记，边长取字形的一个像素单位。
const arm = PIXEL;
const inset = PIXEL;
const marks = [];
for (const [x, y] of [
  [inset, inset],
  [width - inset - PIXEL, inset],
  [inset, height - inset - PIXEL],
  [width - inset - PIXEL, height - inset - PIXEL],
]) {
  marks.push(`    <rect x="${x + arm / 2 - PIXEL / 6}" y="${y}" width="${PIXEL / 3}" height="${PIXEL}"/>`);
  marks.push(`    <rect x="${x}" y="${y + arm / 2 - PIXEL / 6}" width="${PIXEL}" height="${PIXEL / 3}"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${CJK}${LATIN}">
  <title>${CJK}${LATIN}</title>
  <desc>字形取自像素字体 Zpix，该字体以 MIT 许可发布。</desc>
  <defs>
    <style>
      @font-face {
        font-family: 'Zpix Embedded';
        src: url(data:font/ttf;base64,${subset}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .cjk { font-family: 'Zpix Embedded', monospace; font-size: ${CJK_SIZE}px; fill: ${CREAM}; }
      .latin { font-family: 'Zpix Embedded', monospace; font-size: ${LATIN_SIZE}px; letter-spacing: ${TRACKING}px; fill: ${AMBER}; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="${BG}"/>
  <g fill="${MARK}" shape-rendering="crispEdges">
${marks.join('\n')}
  </g>
  <text class="cjk" x="${centerX}" y="${cjkBaseline}" text-anchor="middle">${CJK}</text>
  <text class="latin" x="${centerX}" y="${latinBaseline}" text-anchor="middle">${LATIN}</text>
</svg>
`;

writeFileSync(OUTPUT_PATH, svg, 'utf8');
console.log(`画布 ${width} x ${height}`);
console.log(`中文宽约 ${cjkWidth}，英文宽约 ${Math.round(latinWidth)}`);
console.log(`内嵌子集 ${subset.length} 字符`);
console.log(`已写入 ${OUTPUT_PATH}，${Buffer.byteLength(svg)} 字节`);
