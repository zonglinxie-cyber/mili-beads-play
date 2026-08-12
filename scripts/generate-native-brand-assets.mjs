#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = join(root, "public/app-icon-1024.png");
const checkOnly = process.argv.includes("--check");
const pngOptions = { compressionLevel: 9, adaptiveFiltering: false, palette: false };
const brandPurple = "#7D55C9";
const launchCream = "#FFF7EA";

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

function roundedMask(size, radius = Math.round(size * 0.2)) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" fill="white"/></svg>`,
  );
}

function circularMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  );
}

async function legacyLauncher(size) {
  return sharp(sourcePath)
    .resize(size, size, { fit: "cover", kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .composite([{ input: roundedMask(size), blend: "dest-in" }])
    .png(pngOptions)
    .toBuffer();
}

async function roundLauncher(size) {
  const artworkSize = Math.round(size * 0.88);
  const artwork = await sharp(sourcePath)
    .resize(artworkSize, artworkSize, { fit: "cover", kernel: sharp.kernel.lanczos3 })
    .png(pngOptions)
    .toBuffer();
  const inset = Math.floor((size - artworkSize) / 2);
  return sharp({
    create: { width: size, height: size, channels: 4, background: brandPurple },
  })
    .composite([
      { input: artwork, left: inset, top: inset },
      { input: circularMask(size), blend: "dest-in" },
    ])
    .png(pngOptions)
    .toBuffer();
}

async function adaptiveForeground(size) {
  const artworkSize = Math.round(size * 0.76);
  const resized = await sharp(sourcePath)
    .resize(artworkSize, artworkSize, { fit: "contain", kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .composite([{ input: roundedMask(artworkSize), blend: "dest-in" }])
    .png(pngOptions)
    .toBuffer();
  const inset = Math.floor((size - artworkSize) / 2);

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, left: inset, top: inset }])
    .png(pngOptions)
    .toBuffer();
}

function launchBackdrop(width, height) {
  const short = Math.min(width, height);
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${launchCream}"/>
          <stop offset="1" stop-color="#F1E9FF"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <circle cx="${width * 0.12}" cy="${height * 0.16}" r="${short * 0.026}" fill="#FF8A45" opacity="0.58"/>
      <circle cx="${width * 0.88}" cy="${height * 0.22}" r="${short * 0.018}" fill="#FFD24A" opacity="0.82"/>
      <circle cx="${width * 0.14}" cy="${height * 0.84}" r="${short * 0.014}" fill="${brandPurple}" opacity="0.34"/>
      <circle cx="${width * 0.84}" cy="${height * 0.82}" r="${short * 0.024}" fill="#FFB2A7" opacity="0.52"/>
    </svg>
  `);
}

async function brandedSplash(width, height, badgeRatio = 0.42) {
  const badgeSize = Math.round(Math.min(width, height) * badgeRatio);
  const badge = await sharp(sourcePath)
    .resize(badgeSize, badgeSize, { fit: "cover", kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .composite([{ input: roundedMask(badgeSize), blend: "dest-in" }])
    .png(pngOptions)
    .toBuffer();
  const shadow = await sharp(roundedMask(badgeSize))
    .tint("#594080")
    .blur(Math.max(3, badgeSize * 0.035))
    .modulate({ brightness: 0.72 })
    .png(pngOptions)
    .toBuffer();
  const left = Math.round((width - badgeSize) / 2);
  const top = Math.round((height - badgeSize) / 2);
  const shadowOffset = Math.max(2, Math.round(badgeSize * 0.035));

  return sharp(launchBackdrop(width, height))
    .composite([
      { input: shadow, left: left + shadowOffset, top: top + shadowOffset, blend: "over" },
      { input: badge, left, top, blend: "over" },
    ])
    .removeAlpha()
    .png(pngOptions)
    .toBuffer();
}

async function nativePreview() {
  const iosSplash = await brandedSplash(2732, 2732, 0.28);
  const [phone, landscape, square, foreground] = await Promise.all([
    sharp(iosSplash).resize(390, 844, { fit: "cover" }).png(pngOptions).toBuffer(),
    sharp(iosSplash).resize(720, 405, { fit: "cover" }).png(pngOptions).toBuffer(),
    legacyLauncher(260),
    adaptiveForeground(260),
  ]);
  const round = await roundLauncher(260);
  const panel = Buffer.from(`
    <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1000" fill="#211B2F"/>
      <rect x="70" y="55" width="430" height="890" rx="54" fill="#FFFFFF" opacity="0.08"/>
      <rect x="550" y="55" width="980" height="500" rx="42" fill="#FFFFFF" opacity="0.08"/>
      <rect x="550" y="605" width="980" height="340" rx="42" fill="#FFFFFF" opacity="0.08"/>
    </svg>
  `);

  return sharp(panel)
    .composite([
      { input: phone, left: 90, top: 78 },
      { input: landscape, left: 680, top: 102 },
      { input: square, left: 590, top: 645 },
      { input: foreground, left: 925, top: 645 },
      { input: round, left: 1260, top: 645 },
    ])
    .png(pngOptions)
    .toBuffer();
}

async function plannedAssets() {
  const assets = new Map();

  for (const [density, sizes] of Object.entries(androidIconSizes)) {
    const base = join(root, `android/app/src/main/res/mipmap-${density}`);
    assets.set(join(base, "ic_launcher.png"), await legacyLauncher(sizes.launcher));
    assets.set(join(base, "ic_launcher_round.png"), await roundLauncher(sizes.launcher));
    assets.set(join(base, "ic_launcher_foreground.png"), await adaptiveForeground(sizes.foreground));
  }

  for (const [relativePath, [width, height]] of Object.entries(androidSplashSizes)) {
    assets.set(
      join(root, "android/app/src/main/res", relativePath),
      await brandedSplash(width, height),
    );
  }

  const iosSplash = await brandedSplash(2732, 2732, 0.28);
  for (const name of iosSplashNames) {
    assets.set(join(root, "ios/App/App/Assets.xcassets/Splash.imageset", name), iosSplash);
  }

  assets.set(join(root, "release/native-brand-preview.png"), await nativePreview());
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
console.log(`${checkOnly ? "verified" : "generated"} ${assets.size} native brand assets from public/app-icon-1024.png`);
