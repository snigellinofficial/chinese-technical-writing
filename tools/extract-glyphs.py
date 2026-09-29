"""从 BDF 点阵字体中取出指定字符的点阵。

BDF 为文本格式，字形以十六进制行给出，本程序按行解析。

用法：python tools/extract-glyphs.py <bdf 文件> <字符> [<字符> ...] [--rects]
默认输出点阵图案；加 --rects 时输出 SVG 的 rect 列表。
"""

import sys


def parse_bdf(path):
    """返回 {码位: (宽, 高, [行字符串])}。"""
    glyphs = {}
    encoding = None
    bbx = None
    rows = []
    in_bitmap = False

    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        for raw in handle:
            line = raw.strip()
            if line.startswith("ENCODING "):
                encoding = int(line.split()[1])
            elif line.startswith("BBX "):
                parts = line.split()
                bbx = (int(parts[1]), int(parts[2]))
            elif line == "BITMAP":
                in_bitmap = True
                rows = []
            elif line == "ENDCHAR":
                if encoding is not None and bbx is not None and rows:
                    glyphs[encoding] = (bbx[0], bbx[1], rows)
                encoding = None
                bbx = None
                rows = []
                in_bitmap = False
            elif in_bitmap:
                rows.append(line)

    return glyphs


def to_pattern(width, rows):
    """十六进制行转成井号与句点的图案，按位宽截取。"""
    pattern = []
    for row in rows:
        bits = bin(int(row, 16))[2:].zfill(len(row) * 4)
        pattern.append("".join("#" if bit == "1" else "." for bit in bits[-width:]))
    return pattern


def to_rects(pattern, size, offset_x=0, offset_y=0):
    rects = []
    for y, row in enumerate(pattern):
        for x, cell in enumerate(row):
            if cell != "#":
                continue
            rects.append(
                f'<rect x="{offset_x + x * size}" y="{offset_y + y * size}" '
                f'width="{size}" height="{size}"/>'
            )
    return rects


def main():
    args = [item for item in sys.argv[1:] if item != "--rects"]
    as_rects = "--rects" in sys.argv
    path = args[0]
    characters = args[1:]

    glyphs = parse_bdf(path)
    print(f"载入字形 {len(glyphs)} 个，来源 {path}")

    for character in characters:
        code = ord(character)
        if code not in glyphs:
            print(f"\n字符 {character} U+{code:04X} 字形缺失")
            continue
        width, height, rows = glyphs[code]
        pattern = to_pattern(width, rows)
        if as_rects:
            print(f"\n# {character} U+{code:04X} {width}x{height}")
            for rect in to_rects(pattern, 1):
                print(rect)
            continue
        print(f"\n字符 {character} U+{code:04X}  {width} x {height}")
        for row in pattern:
            print("  " + row)


if __name__ == "__main__":
    main()
