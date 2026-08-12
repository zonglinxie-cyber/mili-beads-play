#!/usr/bin/env node
// Capture only: drives the final production build through the same 170-click path
// as tests/e2e/game-flow.spec.ts. It does not modify app state or source files.

import { chromium } from "@playwright/test";
import { PATTERNS } from "../../app/patterns.ts";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT = path.join(ROOT, "release/store-assets-v10/raw-final-states");
const BASE_URL = process.env.MILI_CAPTURE_URL ?? "http://127.0.0.1:4322";
const pattern = PATTERNS[0];
const zoneLabels = ["左上", "上中", "右上", "左中", "正中", "右中", "左下", "下中", "右下"];

async function captureSet(browser, { name, viewport, deviceScaleFactor }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor, locale: "zh-CN" });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT, `${name}-01-home.png`) });

  await page.getByRole("button", { name: /开始挑战/ }).click();
  await page.getByRole("button", { name: /^左上，/ }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(OUT, `${name}-02-game-zones.png`) });

  for (let zone = 0; zone < 9; zone += 1) {
    await page.getByRole("button", { name: new RegExp(`^${zoneLabels[zone]}，`) }).click();
    const startRow = Math.floor(zone / 3) * 6;
    const startCol = (zone % 3) * 6;
    for (const key of Object.keys(pattern.palette)) {
      const color = pattern.palette[key].name;
      const targets = [];
      for (let y = startRow; y < startRow + 6; y += 1) {
        for (let x = startCol; x < startCol + 6; x += 1) {
          if (pattern.rows[y][x] === key) targets.push(y * 18 + x);
        }
      }
      if (!targets.length) continue;
      await page.getByRole("button", { name: new RegExp(`^${color} `) }).click();
      for (const index of targets) {
        const cell = page.getByRole("button", { name: `第${Math.floor(index / 18) + 1}行第${index % 18 + 1}格，${color}` });
        if (await cell.count()) await cell.click();
      }
    }
  }

  const finish = page.getByRole("dialog", { name: "拼豆完成" });
  await finish.waitFor({ state: "visible" });
  // The final paint can leave the underlying page scrolled; the modal is fixed,
  // but normalize the capture origin to avoid viewport-driver composition quirks.
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(350);
  const progress = await page.locator(".game-progress b").textContent();
  const completionTitle = await finish.getByText("完成啦，米粒！").textContent();
  if (progress !== "100%" || !completionTitle) throw new Error(`${name}: completion proof failed (${progress})`);
  await page.screenshot({ path: path.join(OUT, `${name}-03-complete.png`) });

  await finish.getByRole("button", { name: "播放动画" }).click();
  const animation = page.getByRole("dialog", { name: `${pattern.name}动画` });
  await animation.waitFor({ state: "visible" });
  for (const text of [pattern.motionPlan.body, pattern.motionPlan.prop, pattern.motionPlan.fx]) {
    if (!(await animation.getByText(text).isVisible())) throw new Error(`${name}: missing animation layer text: ${text}`);
  }
  await page.screenshot({ path: path.join(OUT, `${name}-04-animation.png`) });
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "生成打印图" }).click();
  const poster = page.getByRole("dialog", { name: "高清可打印图纸" });
  await poster.waitFor({ state: "visible" });
  const img = poster.locator("img");
  const natural = await img.evaluate(image => ({ width: image.naturalWidth, height: image.naturalHeight, src: image.src }));
  if (natural.width !== 1200 || natural.height !== 1500) throw new Error(`${name}: poster is ${natural.width}x${natural.height}`);
  await page.screenshot({ path: path.join(OUT, `${name}-05-print-preview.png`) });
  const base64 = natural.src.split(",")[1];
  await import("node:fs/promises").then(fs => fs.writeFile(path.join(OUT, `${name}-poster-1200x1500.png`), Buffer.from(base64, "base64")));

  await context.close();
  return { name, progress, completionTitle, poster: { width: natural.width, height: natural.height } };
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  const results = [];
  results.push(await captureSet(browser, { name: "play", viewport: { width: 540, height: 1080 }, deviceScaleFactor: 2 }));
  results.push(await captureSet(browser, { name: "iphone-web-composite", viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 }));
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}
