#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = join(root, "release/brand-grid-v5/candidates/scarf-sprint.json");
const approvedSourceHash = "dfa203e47796a3a70787f3fcafd9512dcb53899aa75a5881ac6152c0647c7083";
const checkOnly = process.argv.includes("--check");
const pngOptions = { compressionLevel: 9, adaptiveFiltering: false, palette: false };
const brandBackground = "#403655";
const launchCream = "#FFF9ED";
const launchLavender = "#E9DFF5";
const fontPath = "/System/Library/Fonts/Hiragino Sans GB.ttc";
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const sourceBytes = await readFile(sourcePath);
const sourceHash = createHash("sha256").update(sourceBytes).digest("hex");

const androidIconSizes = {
  mdpi: { launcher: 48, foreground: 108 },
  hdpi: { launcher: 72, foreground: 162 },
  xhdpi: { launcher: 96, foreground: 216 },
  xxhdpi: { launcher: 144, foreground: 324 },
  xxxhdpi: { launcher: 192, foreground: 432 },
};

const androidSplashSizes = {
  "drawable/splash.png": [480, 320],
  "drawable-land-mdpi/splash.png": [480, 320],
  "drawable-land-hdpi/splash.png": [800, 480],
  "drawable-land-xhdpi/splash.png": [1280, 720],
  "drawable-land-xxhdpi/splash.png": [1600, 960],
  "drawable-land-xxxhdpi/splash.png": [1920, 1280],
  "drawable-port-mdpi/splash.png": [320, 480],
  "drawable-port-hdpi/splash.png": [480, 800],
  "drawable-port-xhdpi/splash.png": [720, 1280],
  "drawable-port-xxhdpi/splash.png": [960, 1600],
  "drawable-port-xxxhdpi/splash.png": [1280, 1920],
};

const iosSplashNames = [
  "splash-2732x2732.png",
  "splash-2732x2732-1.png",
  "splash-2732x2732-2.png",
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function validateSource() {
  if (sourceHash !== approvedSourceHash) {
    throw new Error(`selected brand source hash changed: ${sourceHash}`);
  }
  if (source.id !== "scarf-sprint") throw new Error(`unexpected brand source: ${source.id}`);
  if (source.dimensions?.columns !== 18 || source.dimensions?.rows !== 18) {
    throw new Error("brand source must be an 18x18 grid");
  }
  if (!Array.isArray(source.rows) || source.rows.length !== 18 || source.rows.some((row) => row.length !== 18)) {
    throw new Error("brand source rows must be exactly 18x18");
  }
  const codes = new Set(Object.keys(source.palette));
  const occupied = source.rows.flatMap((row, y) => [...row].map((code, x) => ({ code, x, y })))
    .filter(({ code }) => code !== ".");
  if (occupied.length !== 153 || codes.size !== 6) throw new Error("selected source metrics changed");
  if (occupied.some(({ code }) => !codes.has(code))) throw new Error("brand grid contains an unknown palette code");
  return occupied;
}

const beads = validateSource();
const bounds = beads.reduce(
  (result, bead) => ({
    minX: Math.min(result.minX, bead.x),
    minY: Math.min(result.minY, bead.y),
    maxX: Math.max(result.maxX, bead.x),
    maxY: Math.max(result.maxY, bead.y),
  }),
  { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
);
bounds.width = bounds.maxX - bounds.minX + 1;
bounds.height = bounds.maxY - bounds.minY + 1;

function roundedMask(size, radius = Math.round(size * 0.22)) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" fill="white"/></svg>`,
  );
}

function circularMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  );
}

function beadSvg(size, { scale = 0.86, background = null, holes = size > 64, stroke = size >= 128 } = {}) {
  const cell = Math.min((size * scale) / bounds.width, (size * scale) / bounds.height);
  const contentWidth = bounds.width * cell;
  const contentHeight = bounds.height * cell;
  const left = (size - contentWidth) / 2;
  const top = (size - contentHeight) / 2;
  const radius = cell * (size <= 64 ? 0.46 : 0.445);
  const holeRadius = Math.max(0.75, cell * 0.17);
  const circles = beads.map(({ code, x, y }) => {
    const cx = left + (x - bounds.minX + 0.5) * cell;
    const cy = top + (y - bounds.minY + 0.5) * cell;
    const fill = source.palette[code].hex;
    const outline = stroke ? ` stroke="#FFFFFF" stroke-opacity="0.52" stroke-width="${Math.max(0.7, cell * 0.055)}"` : "";
    const hole = holes && background
      ? `<circle cx="${cx}" cy="${cy}" r="${holeRadius}" fill="${background}"/>`
      : "";
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}"${outline}/>${hole}`;
  }).join("");
  const base = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : "";
  return Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${base}${circles}</svg>`);
}

async function renderMark(size, options = {}) {
  return sharp(beadSvg(size, options)).png(pngOptions).toBuffer();
}

async function appIcon(size) {
  return sharp(await renderMark(size, { background: brandBackground, scale: size <= 64 ? 0.91 : 0.86 }))
    .removeAlpha()
    .png(pngOptions)
    .toBuffer();
}

async function adaptiveForeground(size) {
  return sharp(await renderMark(size, { background: null, scale: 0.6, holes: false, stroke: false }))
    .ensureAlpha()
    .png(pngOptions)
    .toBuffer();
}

async function roundLauncher(size) {
  return sharp(await appIcon(size))
    .ensureAlpha()
    .composite([{ input: circularMask(size), blend: "dest-in" }])
    .png(pngOptions)
    .toBuffer();
}

function faviconSvg() {
  return beadSvg(64, { background: brandBackground, scale: 0.91, holes: false, stroke: false });
}

async function rasterText(text, width, height, color, bold = false) {
  const markup = `<span foreground="${color}" font_weight="${bold ? 700 : 500}">${escapeXml(text)}</span>`;
  return sharp({
    text: {
      text: markup,
      font: "Hiragino Sans GB",
      fontfile: fontPath,
      width: Math.max(32, Math.round(width)),
      height: Math.max(16, Math.round(height)),
      align: "centre",
      justify: false,
      rgba: true,
    },
  }).png(pngOptions).toBuffer();
}

async function brandedSplash(width, height) {
  const landscape = width > height * 1.2;
  const short = Math.min(width, height);
  const canvas = sharp({ create: { width, height, channels: 3, background: launchCream } });
  const accent = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 ${height * 0.82} Q ${width * 0.5} ${height * 0.72} ${width} ${height * 0.86} V ${height} H 0 Z" fill="${launchLavender}"/>
    <path d="M0 ${height * 0.9} Q ${width * 0.54} ${height * 0.82} ${width} ${height * 0.94} V ${height} H 0 Z" fill="#D9C8EC" opacity="0.82"/>
  </svg>`);
  const artSize = Math.round(landscape ? Math.min(height * 0.72, width * 0.36) : Math.min(width * 0.62, height * 0.39));
  const mark = await renderMark(artSize, { background: null, scale: 0.94, holes: false, stroke: artSize >= 128 });
  const titleMaxWidth = landscape ? width * 0.42 : width * 0.78;
  const title = await rasterText("米粒拼豆社", titleMaxWidth, short * 0.105, "#29283B", true);
  const tagline = await rasterText("把小豆子拼成大冒险", titleMaxWidth, short * 0.058, "#5D4B81", false);
  const titleMeta = await sharp(title).metadata();
  const taglineMeta = await sharp(tagline).metadata();
  const barWidth = Math.round(short * 0.24);
  const barHeight = Math.max(4, Math.round(short * 0.012));
  const bars = Buffer.from(`<svg width="${barWidth}" height="${barHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${barWidth * 0.29}" height="${barHeight}" rx="${barHeight / 2}" fill="#EE7B52"/>
    <rect x="${barWidth * 0.355}" width="${barWidth * 0.29}" height="${barHeight}" rx="${barHeight / 2}" fill="#5DAABE"/>
    <rect x="${barWidth * 0.71}" width="${barWidth * 0.29}" height="${barHeight}" rx="${barHeight / 2}" fill="#F5C95D"/>
  </svg>`);

  let artLeft;
  let artTop;
  let titleLeft;
  let titleTop;
  let taglineLeft;
  let taglineTop;
  let barsLeft;
  let barsTop;
  if (landscape) {
    artLeft = Math.round(width * 0.24 - artSize / 2);
    artTop = Math.round((height - artSize) / 2);
    const textCenter = width * 0.7;
    titleLeft = Math.round(textCenter - titleMeta.width / 2);
    titleTop = Math.round(height * 0.35);
    taglineLeft = Math.round(textCenter - taglineMeta.width / 2);
    taglineTop = Math.round(height * 0.53);
    barsLeft = Math.round(textCenter - barWidth / 2);
    barsTop = Math.round(height * 0.68);
  } else {
    artLeft = Math.round((width - artSize) / 2);
    artTop = Math.round(height * 0.16);
    titleLeft = Math.round((width - titleMeta.width) / 2);
    titleTop = Math.round(artTop + artSize + height * 0.035);
    taglineLeft = Math.round((width - taglineMeta.width) / 2);
    taglineTop = Math.round(titleTop + titleMeta.height + height * 0.012);
    barsLeft = Math.round((width - barWidth) / 2);
    barsTop = Math.round(taglineTop + taglineMeta.height + height * 0.035);
  }

  return canvas
    .composite([
      { input: accent, left: 0, top: 0 },
      { input: mark, left: artLeft, top: artTop },
      { input: title, left: titleLeft, top: titleTop },
      { input: tagline, left: taglineLeft, top: taglineTop },
      { input: bars, left: barsLeft, top: barsTop },
    ])
    .removeAlpha()
    .png(pngOptions)
    .toBuffer();
}

async function openGraphCard() {
  const mascot = await renderMark(470, { background: null, scale: 0.94, holes: false, stroke: true });
  const title = await rasterText("米粒拼豆社", 520, 112, "#29283B", true);
  const tagline = await rasterText("把小豆子拼成大冒险", 520, 66, "#5D4B81", false);
  const detail = await rasterText("18×18 可实作网格角色 · 分区拼制 · 作品小剧场", 570, 40, "#756D7A", false);
  const bg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${launchCream}"/>
    <path d="M0 510 Q 520 430 1200 540 V630 H0Z" fill="${launchLavender}"/>
    <rect x="720" y="0" width="480" height="630" fill="${brandBackground}"/>
  </svg>`);
  return sharp(bg)
    .composite([
      { input: title, left: 72, top: 128 },
      { input: tagline, left: 72, top: 252 },
      { input: detail, left: 68, top: 356 },
      { input: mascot, left: 725, top: 78 },
    ])
    .removeAlpha()
    .png(pngOptions)
    .toBuffer();
}

async function playFeatureGraphic() {
  const mascot = await renderMark(390, { background: null, scale: 0.94, holes: false, stroke: true });
  const title = await rasterText("把小豆子", 480, 70, "#29283B", true);
  const title2 = await rasterText("拼成大冒险", 480, 70, "#5D4B81", true);
  const detail = await rasterText("找图纸 · 分区拼 · 打印收藏", 450, 38, "#756D7A", false);
  const bg = Buffer.from(`<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="500" fill="${launchCream}"/>
    <path d="M0 420 Q 440 330 1024 425 V500 H0Z" fill="${launchLavender}"/>
    <rect x="650" y="0" width="374" height="500" fill="${brandBackground}"/>
  </svg>`);
  return sharp(bg).composite([
    { input: title, left: 58, top: 90 },
    { input: title2, left: 58, top: 172 },
    { input: detail, left: 55, top: 280 },
    { input: mascot, left: 648, top: 52 },
  ]).removeAlpha().png(pngOptions).toBuffer();
}

async function blindSizeBoard() {
  const width = 1200;
  const height = 820;
  const sizes = [38, 64, 128, 64, 38, 128, 64, 128, 38, 64, 38, 128];
  const backgrounds = ["#FFF9ED", "#E8DDF3", "#29283B", "#FFFFFF"];
  const cells = [];
  for (let index = 0; index < sizes.length; index += 1) {
    const size = sizes[index];
    const tileWidth = 260;
    const tileHeight = 170;
    const tile = sharp({ create: { width: tileWidth, height: tileHeight, channels: 3, background: backgrounds[index % backgrounds.length] } });
    const mark = await appIcon(size);
    const left = Math.round((tileWidth - size) / 2);
    const top = Math.round((tileHeight - size) / 2);
    const rendered = await tile.composite([{ input: mark, left, top }]).png(pngOptions).toBuffer();
    cells.push({ input: rendered, left: 45 + (index % 4) * 290, top: 45 + Math.floor(index / 4) * 245 });
  }
  return sharp({ create: { width, height, channels: 3, background: "#D8CDE5" } })
    .composite(cells)
    .png(pngOptions)
    .toBuffer();
}

async function launcherMaskBoard() {
  const icon = await appIcon(360);
  const round = await sharp(icon).ensureAlpha().composite([{ input: circularMask(360), blend: "dest-in" }]).png(pngOptions).toBuffer();
  const squircle = await sharp(icon).ensureAlpha().composite([{ input: roundedMask(360, 98), blend: "dest-in" }]).png(pngOptions).toBuffer();
  const foreground = await adaptiveForeground(360);
  const adaptive = await sharp({ create: { width: 360, height: 360, channels: 3, background: brandBackground } })
    .composite([{ input: foreground, left: 0, top: 0 }]).png(pngOptions).toBuffer();
  const bg = Buffer.from(`<svg width="1600" height="520" xmlns="http://www.w3.org/2000/svg"><rect width="1600" height="520" fill="#E8DFF1"/></svg>`);
  return sharp(bg).composite([
    { input: icon, left: 32, top: 80 },
    { input: round, left: 424, top: 80 },
    { input: squircle, left: 816, top: 80 },
    { input: adaptive, left: 1208, top: 80 },
  ]).png(pngOptions).toBuffer();
}

async function nativePreview() {
  const [phoneSplash, landscapeSplash, square, foreground] = await Promise.all([
    brandedSplash(390, 844),
    brandedSplash(720, 405),
    appIcon(260),
    adaptiveForeground(260),
  ]);
  const panel = Buffer.from(`<svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1000" fill="#211B2F"/>
    <rect x="70" y="55" width="430" height="890" rx="54" fill="#FFFFFF" opacity="0.08"/>
    <rect x="550" y="55" width="980" height="500" rx="42" fill="#FFFFFF" opacity="0.08"/>
    <rect x="550" y="605" width="980" height="340" rx="42" fill="#FFFFFF" opacity="0.08"/>
  </svg>`);
  const adaptive = await sharp({ create: { width: 260, height: 260, channels: 3, background: brandBackground } })
    .composite([{ input: foreground, left: 0, top: 0 }]).png(pngOptions).toBuffer();
  return sharp(panel).composite([
    { input: phoneSplash, left: 90, top: 78 },
    { input: landscapeSplash, left: 680, top: 102 },
    { input: square, left: 590, top: 645 },
    { input: adaptive, left: 925, top: 645 },
    { input: await roundLauncher(260), left: 1260, top: 645 },
  ]).png(pngOptions).toBuffer();
}

function manifestWeb() {
  return Buffer.from(`${JSON.stringify({
    name: "米粒拼豆社",
    short_name: "米粒拼豆",
    description: "给米粒的拼豆图纸与触控游戏",
    start_url: "/",
    display: "standalone",
    background_color: launchCream.toLowerCase(),
    theme_color: brandBackground.toLowerCase(),
    icons: [
      { src: "/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  }, null, 2)}\n`);
}

function androidBrandColors() {
  return Buffer.from(`<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${brandBackground}</color>\n    <color name="splash_background">${launchCream}</color>\n</resources>\n`);
}

function brandReadme() {
  return Buffer.from(`# 米粒拼豆社品牌资产 v5 集成候选\n\n本目录的所有可见角色豆点，都由 \`${relative(root, sourcePath)}\` 的 18×18 坐标确定性生成。源 JSON SHA-256 为 \`${sourceHash}\`；角色共 153 颗、6 色、单一连通主件。\n\n- \`render-1024/512/192/128.png\`：大尺寸圆豆版，显示豆孔。\n- \`render-64/38.png\`：从相同 18×18 坐标分别直接光栅化的清晰实心豆专版，不是大图机械缩小。\n- \`blind-size-board.png\`：不带标签的多背景尺寸板，仅用于后续现场盲看。\n- \`launcher-mask-board.png\`：方形、圆形、圆角遮罩与 Android adaptive 60% 前景安全区预览。\n- \`native-preview.png\`：竖屏／横屏启动画面与启动器预览。\n- \`SHA256SUMS.txt\`：源 JSON 与所有确定性派生交付物（清单自身除外）的逐文件哈希。\n\n## 放行边界\n\n独立红队结论是 **Go-to-validate / No-Go-to-ship**。当前只完成坐标、尺寸、透明通道、模拟遮罩安全区和确定性门禁。**没有做过真实 8–10 岁儿童盲测，没有真实拼豆摆放／熨烫实物验证，也没有目标 Android/iOS 真机 Launcher 验证。** 因此这些文件是验证候选，不是已经获准上架的品牌证据。\n`);
}

async function plannedAssets() {
  await access(fontPath, fsConstants.R_OK);
  const assets = new Map();
  const renders = new Map();
  for (const size of [1024, 512, 192, 128, 64, 38]) renders.set(size, await appIcon(size));
  const transparentRenders = new Map();
  for (const size of [1024, 512, 192, 128, 64, 38]) {
    transparentRenders.set(size, await renderMark(size, {
      background: null,
      scale: size <= 64 ? 0.91 : 0.86,
      holes: false,
      stroke: size >= 128,
    }));
  }

    assets.set(join(root, "public/app-icon-1024.png"), renders.get(1024));
    assets.set(join(root, "public/app-icon-512.png"), renders.get(512));
    assets.set(join(root, "public/app-icon-192.png"), renders.get(192));
    assets.set(join(root, "public/apple-touch-icon.png"), await appIcon(180));
  for (const size of [128, 64, 38]) {
    assets.set(join(root, `public/brand-avatar-${size}.png`), renders.get(size));
    assets.set(join(root, `native-public/brand-avatar-${size}.png`), renders.get(size));
  }
  assets.set(join(root, "public/favicon.svg"), faviconSvg());
  assets.set(join(root, "public/manifest.webmanifest"), manifestWeb());
  assets.set(join(root, "public/og-v2.png"), await openGraphCard());

  assets.set(join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"), renders.get(1024));
  const iosSplash = await brandedSplash(2732, 2732);
  for (const name of iosSplashNames) {
    assets.set(join(root, "ios/App/App/Assets.xcassets/Splash.imageset", name), iosSplash);
  }

  for (const [density, sizes] of Object.entries(androidIconSizes)) {
    const base = join(root, `android/app/src/main/res/mipmap-${density}`);
    assets.set(join(base, "ic_launcher.png"), await appIcon(sizes.launcher));
    assets.set(join(base, "ic_launcher_round.png"), await roundLauncher(sizes.launcher));
    assets.set(join(base, "ic_launcher_foreground.png"), await adaptiveForeground(sizes.foreground));
  }
  for (const [relativePath, [width, height]] of Object.entries(androidSplashSizes)) {
    assets.set(join(root, "android/app/src/main/res", relativePath), await brandedSplash(width, height));
  }
  assets.set(join(root, "android/app/src/main/res/values/ic_launcher_background.xml"), androidBrandColors());

  const brandV5 = join(root, "release/brand-v5-integration");
  for (const [size, rendered] of transparentRenders) assets.set(join(brandV5, `render-${size}.png`), rendered);
  assets.set(join(brandV5, "blind-size-board.png"), await blindSizeBoard());
  assets.set(join(brandV5, "launcher-mask-board.png"), await launcherMaskBoard());
  assets.set(join(brandV5, "native-preview.png"), await nativePreview());
  assets.set(join(brandV5, "README.md"), brandReadme());

  assets.set(join(root, "release/store-assets-v10/google-play-icon-512.png"),
    await sharp(renders.get(512)).ensureAlpha().png(pngOptions).toBuffer());
  assets.set(join(root, "release/store-assets-v10/google-play-feature-graphic-1024x500.png"), await playFeatureGraphic());
  const storeReadmePath = join(root, "release/store-assets-v10/README.md");
  let storeReadme = await readFile(storeReadmePath, "utf8");
  storeReadme = storeReadme
    .replace(/^# .*$/m, "# 上架候选素材 v10 · 网格品牌 v5 验证候选")
    .replace(
      /^本目录包含.*$/m,
      "本目录包含 Google Play 候选素材与 App Store 构图草案。截图来自 Web 生产构建，完成/动画/打印状态通过与 E2E 相同的真实点击路径生成。当前品牌图标候选已替换为从 18×18 `scarf-sprint` JSON 坐标确定性生成的网格猫，来源、哈希、预览与证据边界见 `../brand-v5-integration/README.md`。独立红队只给出 **Go-to-validate / No-Go-to-ship**：这里的尺寸与遮罩板是工程预览，不是已完成的儿童盲测、实物熟烫或真机 Launcher 证据。",
    )
    .replace(
      /^- `google-play-icon-512\.png`：.*$/m,
      "- `google-play-icon-512.png`：网格品牌 v5 验证候选的独立 32-bit RGBA 文件，512×512、Alpha 通道全为 255、低于 1 MB；源图本身已是满幅品牌背景，没有烘焙圆角或黑角，供 Play 动态遮罩验证。",
    );
  assets.set(storeReadmePath, Buffer.from(storeReadme));

  const storeManifestPath = join(root, "release/store-assets-v10/manifest.json");
  const storeManifest = JSON.parse(await readFile(storeManifestPath, "utf8"));
  storeManifest.generatedAt = "2026-08-13";
  storeManifest.provenance.featureGraphic = "Deterministic validation-candidate composition using the selected scarf-sprint 18x18 grid JSON source and current app palette.";
  storeManifest.provenance.icon = "Opaque RGBA 32-bit deterministic validation-candidate derivative of the selected 18x18 scarf-sprint grid JSON, with a full-square brand background for Play dynamic masking.";
  storeManifest.provenance.brandSource = {
    path: relative(root, sourcePath),
    sha256: sourceHash,
    realChildBlindTest: false,
    physicalBeadAndIronTest: false,
    realDeviceLauncherTest: false,
    releaseDecision: "Go-to-validate / No-Go-to-ship",
  };
  const storeFeature = assets.get(join(root, "release/store-assets-v10/google-play-feature-graphic-1024x500.png"));
  const storeIcon = assets.get(join(root, "release/store-assets-v10/google-play-icon-512.png"));
  const featureInfo = await sharp(storeFeature).metadata();
  const iconInfo = await sharp(storeIcon).metadata();
  storeManifest.assets = storeManifest.assets.map((asset) => {
    if (asset.file === "google-play-feature-graphic-1024x500.png") {
      return { ...asset, width: featureInfo.width, height: featureInfo.height, mode: "RGB", bytes: storeFeature.length };
    }
    if (asset.file === "google-play-icon-512.png") {
      return { ...asset, width: iconInfo.width, height: iconInfo.height, mode: "RGBA", bytes: storeIcon.length };
    }
    return asset;
  });
  assets.set(storeManifestPath, Buffer.from(`${JSON.stringify(storeManifest, null, 2)}\n`));

  const assetManifest = {
    schemaVersion: 1,
    generatedAt: "2026-08-13",
    source: {
      path: relative(root, sourcePath),
      sha256: sourceHash,
      id: source.id,
      dimensions: source.dimensions,
      occupiedBeads: beads.length,
      palette: source.palette,
    },
    rendering: {
      large: "128px and above: exact coordinate circles with holes",
      small: "64px and 38px: separately rasterized exact coordinate solid beads",
      adaptive: "transparent foreground, 60% canvas safe area, solid exact coordinate beads",
      appStoreAndPlay: "opaque full-bleed square; no baked rounded corners",
    },
    evidenceBoundary: {
      realChildBlindTest: false,
      physicalBeadAndIronTest: false,
      realDeviceLauncherTest: false,
      releaseDecision: "Go-to-validate / No-Go-to-ship",
    },
  };
  assets.set(join(brandV5, "manifest.json"), Buffer.from(`${JSON.stringify(assetManifest, null, 2)}\n`));

  const checksumLines = [
    `${sourceHash}  ${relative(root, sourcePath)}`,
    ...[...assets.entries()]
      .map(([path, data]) => `${createHash("sha256").update(data).digest("hex")}  ${relative(root, path)}`)
      .sort(),
  ];
  assets.set(join(brandV5, "SHA256SUMS.txt"), Buffer.from(`${checksumLines.join("\n")}\n`));
  return assets;
}

async function writeOrCheck(path, expected) {
  if (checkOnly) {
    try {
      await access(path, fsConstants.R_OK);
      const actual = await readFile(path);
      if (!actual.equals(expected)) throw new Error(`brand asset is stale: ${path}`);
      return;
    } catch (error) {
      if (error?.message?.startsWith("brand asset is stale")) throw error;
      throw new Error(`brand asset is missing: ${path}`, { cause: error });
    }
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, expected);
}

const assets = await plannedAssets();
for (const [path, data] of assets) await writeOrCheck(path, data);
console.log(`${checkOnly ? "verified" : "generated"} ${assets.size} web/native brand assets from ${relative(root, sourcePath)} (${sourceHash})`);
