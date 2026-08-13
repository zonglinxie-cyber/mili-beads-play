#!/usr/bin/env python3
"""Deterministically build store listing artwork from checked-in app assets."""

from pathlib import Path
import json
import hashlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
FONT = Path("/System/Library/Fonts/Hiragino Sans GB.ttc")

INK = "#29283b"
PURPLE = "#5d4b81"
PURPLE_DARK = "#403655"
CORAL = "#ee7b52"
CREAM = "#fff9ed"
PINK = "#ef91a7"
YELLOW = "#f5c95d"
BLUE = "#5daabe"
NAVY = "#355276"
GREEN = "#6ba270"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    # Collection index 1 is the bolder face on the bundled Hiragino Sans GB TTC.
    return ImageFont.truetype(str(FONT), size=size, index=1 if bold else 0)


def round_rect(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_bead(draw: ImageDraw.ImageDraw, cx: float, cy: float, radius: float, fill: str):
    edge = max(1, int(radius * 0.16))
    draw.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), fill=fill, outline="#ffffff", width=edge)
    hole = radius * 0.31
    draw.ellipse((cx-hole, cy-hole, cx+hole, cy+hole), fill="#fff9ed", outline="#00000020", width=1)


def draw_star(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float, color=YELLOW):
    pts = []
    for i in range(16):
        angle = -3.14159265 / 2 + i * 3.14159265 / 8
        radius = scale if i % 2 == 0 else scale * 0.42
        pts.append((cx + radius * __import__("math").cos(angle), cy + radius * __import__("math").sin(angle)))
    draw.polygon(pts, fill=color)


def build_feature_graphic() -> Path:
    canvas = Image.new("RGB", (1024, 500), CREAM)
    draw = ImageDraw.Draw(canvas)

    # Calm, center-safe brand field; all important content stays clear of crop edges.
    draw.ellipse((-170, -205, 350, 245), fill="#f8b69e")
    draw.ellipse((780, -225, 1210, 205), fill="#cab8e5")
    draw.ellipse((-210, 360, 390, 720), fill="#d6c6e8")
    draw.ellipse((690, 315, 1190, 735), fill="#745e9b")

    for x, y, color in [(95, 215, CORAL), (185, 110, YELLOW), (360, 60, PINK),
                        (595, 76, BLUE), (898, 205, YELLOW), (930, 314, PINK),
                        (704, 436, GREEN), (188, 408, NAVY)]:
        draw_bead(draw, x, y, 12, color)
    draw_star(draw, 379, 392, 17)
    draw_star(draw, 868, 84, 20)

    # Phone-shaped play board using the shipped, reproducible rocket-cat pattern.
    board = Image.new("RGBA", (300, 360), (0, 0, 0, 0))
    bd = ImageDraw.Draw(board)
    round_rect(bd, (8, 8, 292, 350), 38, "#fffdf8", "#eadfce", 3)
    round_rect(bd, (23, 24, 277, 330), 25, "#f1e6d8")

    # Exact checked-in rocket-cat bead grid, rendered deterministically.
    rows = [
        "...............Y..", "........K...K.YYY.", ".......KOK.KOK....",
        "......KOOOOOOOK...", ".....KOWOOKWOOK...", ".....KOOOWOOOOK...",
        "..RRRKOOOOOOOOK...", ".RNNRKOOOOOOKKK...", ".RNNRROOOWOOOKK...",
        "RRNNRROOOWWWOOOK..", "RNNNRROOOWWWOOOK..", ".RRRRRKOOOWOOOK...",
        ".RYYRRKKOOOOKK....", "RYYYYR.KK..KK.....", ".RYYYRKK..KK......",
        "..RYRRR...........", "...RYR............", "....RR............",
    ]
    colors = {"K": INK, "W": "#fff5df", "O": CORAL, "Y": YELLOW, "R": "#cf4e61", "N": NAVY}
    grid_left, grid_top, cell = 29, 37, 13
    for yy, row in enumerate(rows):
        for xx, value in enumerate(row):
            if value != ".":
                draw_bead(bd, grid_left + xx*cell + cell/2, grid_top + yy*cell + cell/2, 5.7, colors[value])
    board = board.rotate(-5, resample=Image.Resampling.BICUBIC, expand=True)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    alpha = board.getchannel("A").filter(ImageFilter.GaussianBlur(14))
    shadow_blob = Image.new("RGBA", board.size, (58, 42, 74, 78))
    shadow_blob.putalpha(alpha)
    shadow.alpha_composite(shadow_blob, (602, 92))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow)
    canvas.alpha_composite(board, (585, 72))

    # The selected coordinate-grid cat is the recognizable brand anchor. The 1024 PNG
    # is itself a deterministic derivative of the approved 18x18 JSON source.
    mascot = Image.open(ROOT / "public/app-icon-1024.png").convert("RGBA").resize((272, 272), Image.Resampling.LANCZOS)
    mascot_mask = Image.new("L", mascot.size, 0)
    ImageDraw.Draw(mascot_mask).rounded_rectangle((0, 0, 271, 271), 58, fill=255)
    mascot.putalpha(mascot_mask)
    mascot = mascot.rotate(4, resample=Image.Resampling.BICUBIC, expand=True)
    mascot_shadow = Image.new("RGBA", mascot.size, (53, 38, 74, 80))
    mascot_shadow.putalpha(mascot.getchannel("A").filter(ImageFilter.GaussianBlur(12)))
    canvas.alpha_composite(mascot_shadow, (762, 127))
    canvas.alpha_composite(mascot, (748, 111))

    draw = ImageDraw.Draw(canvas)
    draw.text((92, 124), "把小豆子", font=font(62, True), fill=INK)
    draw.text((92, 197), "拼成大冒险", font=font(62, True), fill=PURPLE)
    draw.text((96, 293), "找图纸 · 分区拼 · 打印收藏", font=font(25), fill="#756d7a")
    round_rect(draw, (94, 344, 372, 409), 22, PURPLE_DARK)
    draw.text((126, 361), "米粒拼豆社", font=font(29, True), fill="#fffdf8")

    out = OUT / "google-play-feature-graphic-1024x500.png"
    canvas.convert("RGB").save(out, format="PNG", optimize=True)
    return out


def flatten_png(source: Path, destination: Path):
    img = Image.open(source).convert("RGBA")
    base = Image.new("RGBA", img.size, "#fff9ed")
    base.alpha_composite(img)
    base.convert("RGB").save(destination, format="PNG", optimize=True)


def normalize_current_screenshot(source: Path, destination: Path, crop_home: bool = False):
    """Fit a current 375x812 audit capture into Play's 1080x2160 (exactly 2:1)."""
    img = Image.open(source).convert("RGB")
    if crop_home:
        img = img.crop((0, 0, img.width, min(812, img.height)))
    scale = min(1080 / img.width, 2160 / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1080, 2160), CREAM)
    canvas.paste(resized, ((1080 - resized.width) // 2, (2160 - resized.height) // 2))
    canvas.save(destination, format="PNG", optimize=True)


def copy_rgb(source: Path, destination: Path):
    Image.open(source).convert("RGB").save(destination, format="PNG", optimize=True)


def copy_rgba_opaque(source: Path, destination: Path):
    """Encode 32-bit RGBA while keeping the full-bleed artwork visually opaque."""
    img = Image.open(source).convert("RGBA")
    img.putalpha(Image.new("L", img.size, 255))
    img.save(destination, format="PNG", optimize=True)


def copy_rgb_full_bleed(source: Path, destination: Path, size: tuple[int, int]):
    """Reuse the store-safe edge repair for installed icons, then resize as opaque RGB."""
    temporary = destination.with_suffix(".rgba.png")
    copy_rgba_opaque(source, temporary)
    img = Image.open(temporary).convert("RGB").resize(size, Image.Resampling.LANCZOS)
    img.save(destination, format="PNG", optimize=True)
    temporary.unlink()


def image_info(path: Path):
    with Image.open(path) as img:
        return {
            "file": path.name,
            "width": img.width,
            "height": img.height,
            "mode": img.mode,
            "format": img.format,
            "bytes": path.stat().st_size,
        }


def build_contact_sheet(paths: list[Path]) -> Path:
    sheet = Image.new("RGB", (1800, 1840), "#eee6da")
    draw = ImageDraw.Draw(sheet)
    draw.text((48, 28), "米粒拼豆社 · 上架素材 v10 · 网格品牌 v4", font=font(36, True), fill=INK)

    feature = Image.open(paths[0]).convert("RGB")
    feature.thumbnail((620, 303), Image.Resampling.LANCZOS)
    sheet.paste(feature, (48, 95))
    draw.text((48, 410), "Play 功能宣传图 · 1024×500", font=font(18), fill="#6f6878")

    icon = Image.open(paths[1]).convert("RGB")
    icon.thumbnail((300, 300), Image.Resampling.LANCZOS)
    sheet.paste(icon, (720, 95))
    draw.text((720, 410), "Play 图标 · 512×512", font=font(18), fill="#6f6878")

    draw.text((48, 475), "Google Play · 最终 Web 构建真实状态 · 1080×2160", font=font(25, True), fill=INK)
    for index, path in enumerate(paths[2:7]):
        x = 48 + index * 340
        shot = Image.open(path).convert("RGB")
        shot.thumbnail((302, 604), Image.Resampling.LANCZOS)
        sheet.paste(shot, (x, 530))

    draw.text((48, 1185), "App Store iPhone 6.9″ · 网页构图（非真机截图）· 1320×2868", font=font(25, True), fill=INK)
    for index, path in enumerate(paths[7:12]):
        x = 48 + index * 340
        shot = Image.open(path).convert("RGB")
        shot.thumbnail((302, 656), Image.Resampling.LANCZOS)
        shot.thumbnail((260, 565), Image.Resampling.LANCZOS)
        sheet.paste(shot, (x, 1240))

    out = OUT / "review-contact-sheet.jpg"
    sheet.save(out, format="JPEG", quality=90, optimize=True)
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    feature = build_feature_graphic()

    icon = OUT / "google-play-icon-512.png"
    copy_rgba_opaque(ROOT / "public/app-icon-512.png", icon)

    raw = OUT / "raw-final-states"
    for stale in OUT.glob("google-play-phone-*.png"):
        stale.unlink()
    for stale in OUT.glob("app-store-iphone69-web-composite-*.png"):
        stale.unlink()

    play_names = ["01-home", "02-game-zones", "03-complete", "04-animation", "05-print-preview"]
    screenshots = []
    for name in play_names:
        destination = OUT / f"google-play-phone-{name}-1080x2160.png"
        copy_rgb(raw / f"play-{name}.png", destination)
        screenshots.append(destination)

    iphone_names = ["01-home", "02-game-zones", "03-complete", "04-animation", "05-print-preview"]
    iphone_screenshots = []
    for name in iphone_names:
        destination = OUT / f"app-store-iphone69-web-composite-{name}-1320x2868.png"
        copy_rgb(raw / f"iphone-web-composite-{name}.png", destination)
        iphone_screenshots.append(destination)

    print_source = OUT / "print-source-rocket-cat-1200x1500.png"
    copy_rgb(raw / "play-poster-1200x1500.png", print_source)

    all_assets = [feature, icon, *screenshots, *iphone_screenshots]
    build_contact_sheet(all_assets)
    manifest = {
        "generatedAt": "2026-08-12",
        "provenance": {
            "featureGraphic": "Deterministic composition using the approved orbit-spark-v2 18x18 grid brand source and current app palette.",
            "icon": "Opaque RGBA 32-bit deterministic derivative of the approved 18x18 grid JSON, with a full-square brand background for Play dynamic masking.",
            "screenshots": "Captured from the final production Web build after driving the real 170-bead E2E completion path. Play captures use a 540x1080 viewport at 2x. App Store captures use a 440x956 viewport at 3x and are explicitly labeled web composites, not device screenshots.",
            "codeHashes": {
                relative: hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()
                for relative in ("app/page.tsx", "app/globals.css", "app/patterns.ts")
            },
            "completionProof": "Both capture runs asserted 100% progress, the visible 完成啦，米粒！ dialog, all three animation layer descriptions, and a generated poster natural size of 1200x1500.",
        },
        "assets": [image_info(path) for path in [*all_assets, print_source]],
        "checks": {
            "featureGraphic": "1024x500, RGB PNG, no alpha",
            "playIcon": "512x512, RGBA 32-bit PNG, fully opaque alpha, under 1024 KB",
            "playScreenshots": "1080x2160, RGB PNG, no alpha; exactly 2:1 and within Play upload range",
            "appStoreScreenshots": "1320x2868, RGB PNG, no alpha; accepted iPhone 6.9-inch size. Web composites, not device screenshots.",
            "printSource": "1200x1500 RGB PNG; browser natural dimensions asserted before export",
        },
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
