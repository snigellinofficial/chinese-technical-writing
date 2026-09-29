"""从像素字体中抽取所需字符，生成嵌入用的 WOFF2 子集。

用法：python tools/make-font-subset.py <源字体> <输出文件> <字符…>

输出为 base64 文本，可直接用于 SVG 或 CSS 的 data URI。
"""

import base64
import io
import sys

from fontTools import subset


def main():
    source = sys.argv[1]
    output = sys.argv[2]
    characters = "".join(sys.argv[3:])
    text = "".join(sorted(set(characters)))

    options = subset.Options()
    # 不压缩，输出 TTF。WOFF2 需要 brotli 模块，环境未安装。
    options.desubroutinize = True
    options.layout_features = []
    options.name_IDs = []
    options.notdef_outline = False
    options.recalc_bounds = True
    options.drop_tables += ["DSIG"]

    font = subset.load_font(source, options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)

    buffer = io.BytesIO()
    subset.save_font(font, buffer, options)
    data = buffer.getvalue()

    with open(output, "w", encoding="ascii") as handle:
        handle.write(base64.b64encode(data).decode("ascii"))

    print(f"字符数 {len(text)}，子集 {len(data)} 字节，base64 {len(base64.b64encode(data))} 字符")
    print(f"已写入 {output}")


if __name__ == "__main__":
    main()
