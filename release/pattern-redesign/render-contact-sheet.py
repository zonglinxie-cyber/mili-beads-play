from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parent
patterns = json.loads((ROOT / "proposal-a.json").read_text())["patterns"]
font_path = "/System/Library/Fonts/Hiragino Sans GB.ttc"
title_font = ImageFont.truetype(font_path, 32)
name_font = ImageFont.truetype(font_path, 26)
metric_font = ImageFont.truetype(font_path, 17)

image = Image.new("RGB", (1120, 860), "#f7efe4")
draw = ImageDraw.Draw(image)
draw.text((30, 18), "Proposal A · 18×18 可熔拼豆替换图案", font=title_font, fill="#29283b")
draw.text((30, 62), "圆豆预览 · 实际用色 · 4邻域连通件 · 单豆承重点已检查", font=metric_font, fill="#766b72")

for index, pattern in enumerate(patterns):
    col = index % 3
    row = index // 3
    ox = 25 + col * 365
    oy = 100 + row * 375
    draw.rounded_rectangle((ox, oy, ox + 340, oy + 350), 24, fill="#fffdfa", outline="#decfbe", width=2)
    cell = 14
    gx = ox + 44
    gy = oy + 16
    draw.rounded_rectangle((gx - 8, gy - 8, gx + 260, gy + 260), 13, fill="#eee2d4")
    for y, row_data in enumerate(pattern["rows"]):
        for x, key in enumerate(row_data):
            if key == ".":
                continue
            cx = gx + x * cell + 7
            cy = gy + y * cell + 7
            draw.ellipse(
                (cx - 6, cy - 6, cx + 6, cy + 6),
                fill=pattern["palette"][key]["color"],
                outline="#413644",
                width=1,
            )
    draw.text((ox + 18, oy + 287), pattern["name"], font=name_font, fill="#29283b")
    metrics = pattern["metrics"]
    sizes = "/".join(str(size) for size in metrics["componentSizes"])
    draw.text(
        (ox + 18, oy + 323),
        f'{metrics["beads"]}颗 · {metrics["usedColors"]}色 · {metrics["components"]}件({sizes}) · 承重点{metrics["structuralPinches"]}',
        font=metric_font,
        fill="#756a73",
    )

image.save(ROOT / "contact-sheet-a.png")
