import { expect, test } from "@playwright/test";
import { PATTERNS } from "../../app/patterns";

const pattern = PATTERNS[0];
const zoneLabels = ["左上", "上中", "右上", "左中", "正中", "右中", "左下", "下中", "右下"];

test("a child can complete a pattern, animate it, export it, and recover the work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /开始挑战/ }).click();

  const firstTarget = pattern.rows.join("").split("").findIndex(cell => cell !== ".");
  const firstName = pattern.palette[pattern.rows.join("")[firstTarget]].name;
  const firstZone = Math.floor(Math.floor(firstTarget / 18) / 6) * 3 + Math.floor((firstTarget % 18) / 6);
  await page.getByRole("button", { name: new RegExp(`^${zoneLabels[firstZone]}，`) }).click();
  await page.getByRole("button", { name: new RegExp(`^${firstName} `) }).click();
  const firstCell = page.getByRole("button", { name: `第${Math.floor(firstTarget / 18) + 1}行第${firstTarget % 18 + 1}格，${firstName}` });
  const targetBox = await firstCell.boundingBox();
  expect(targetBox?.width).toBeGreaterThanOrEqual(44);
  expect(targetBox?.height).toBeGreaterThanOrEqual(44);

  for (let zone = 0; zone < 9; zone += 1) {
    await page.getByRole("button", { name: new RegExp(`^${zoneLabels[zone]}，`) }).click();
    const startRow = Math.floor(zone / 3) * 6;
    const startCol = (zone % 3) * 6;
    for (const key of Object.keys(pattern.palette)) {
      const color = pattern.palette[key].name;
      const targets: number[] = [];
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
  await expect(finish).toBeVisible();
  await expect(page.locator(".game-progress b")).toHaveText("100%");
  await expect(finish.getByText("完成啦，米粒！")).toBeVisible();

  await finish.getByRole("button", { name: "播放动画" }).click();
  const animation = page.getByRole("dialog", { name: `${pattern.name}动画` });
  await expect(animation).toBeVisible();
  await expect(animation.getByText(pattern.motionPlan.body)).toBeVisible();
  await expect(animation.getByText(pattern.motionPlan.prop)).toBeVisible();
  await expect(animation.getByText(pattern.motionPlan.fx)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(animation).toBeHidden();

  await page.getByRole("button", { name: "生成打印图" }).click();
  const poster = page.getByRole("dialog", { name: "高清可打印图纸" });
  await expect(poster).toBeVisible();
  const imageSize = await poster.locator("img").evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, height: image.naturalHeight }));
  expect(imageSize).toEqual({ width: 1200, height: 1500 });
  const parentButton = poster.getByRole("button", { name: "家长长按·保存高清图" });
  await parentButton.dispatchEvent("pointerdown");
  await page.waitForTimeout(1500);
  const parentGate = page.getByRole("dialog", { name: "家长验证" });
  await expect(parentGate).toBeVisible();
  await expect(parentGate.locator("input")).toBeFocused();
  const firstProblem = await parentGate.locator("strong").innerText();
  await parentGate.locator("input").fill("999");
  await parentGate.getByRole("button", { name: "验证并继续" }).click();
  await expect(parentGate.getByRole("alert")).toContainText("答案不对");
  await expect(parentGate.locator("strong")).not.toHaveText(firstProblem);
  const problem = await parentGate.locator("strong").innerText();
  const match = problem.match(/(\d+)\s*×\s*(\d+)/);
  expect(match).not.toBeNull();
  const answer = Number(match?.[1]) * Number(match?.[2]);
  const downloadPromise = page.waitForEvent("download");
  await parentGate.locator("input").fill(String(answer));
  await parentGate.getByRole("button", { name: "验证并继续" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(pattern.name);
  await page.keyboard.press("Escape");

  await page.reload();
  await expect(page.getByText("已收藏 1 个作品")).toBeVisible();
  await page.getByRole("button", { name: "打开作品册" }).click();
  await expect(page.getByRole("heading", { name: "1 个闪亮作品" })).toBeVisible();
  await expect(page.getByText(pattern.name)).toBeVisible();
});

test("the installed PWA reloads its shell after the network goes offline", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: /火箭猫/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /开始挑战/ })).toBeVisible();
});

test("partial bead progress survives a cold page reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /开始挑战/ }).click();
  await page.getByRole("button", { name: /^左上，/ }).click();
  await page.getByRole("button", { name: /^墨黑 / }).click();
  await page.getByRole("button", { name: /，墨黑$/ }).first().click();
  await expect(page.locator(".game-screen")).toContainText("1/170 颗");
  const persistedBeforeReload = await page.evaluate(() => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").boards?.["rocket-cat"]);
  expect(persistedBeforeReload?.filter((cell: string) => cell !== ".")).toHaveLength(1);
  await page.waitForTimeout(300);
  await page.reload();
  await page.getByRole("button", { name: /开始挑战/ }).click();
  await expect(page.locator(".game-screen")).toContainText("1/170 颗");
});

test("a valid legacy save survives upgrade even when the new save is corrupt", async ({ page }) => {
  await page.goto("/");
  const target = pattern.rows.join("").split("");
  const firstTarget = target.findIndex(cell => cell !== ".");
  const board = Array(18 * 18).fill(".");
  board[firstTarget] = target[firstTarget];
  await page.evaluate(({ savedBoard }) => {
    localStorage.setItem("mili-game-v3", "{not-json");
    localStorage.setItem("mili-game-v2", JSON.stringify({
      completed: ["bottle-jelly", "unknown-pattern"],
      boards: { "rocket-cat": savedBoard, broken: "not-a-board" },
      activityDates: ["2026-08-12", "bad-date"],
    }));
  }, { savedBoard: board });
  await page.reload();
  await expect(page.getByText("已收藏 1 个作品")).toBeVisible();
  await page.getByRole("button", { name: /开始挑战/ }).click();
  await expect(page.locator(".game-screen")).toContainText("1/170 颗");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").completed)).toEqual(["bottle-jelly"]);
});

test("reset, privacy and reduced motion are safe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: /开始挑战/ }).click();
  await page.getByRole("button", { name: /^上中，/ }).click();
  await page.getByRole("button", { name: /^墨黑 / }).click();
  const target = page.getByRole("button", { name: /，墨黑$/ }).first();
  await target.click();
  await page.getByRole("button", { name: "重新开始" }).click();
  const confirm = page.getByRole("dialog", { name: "确认重新开始" });
  await expect(confirm).toBeVisible();
  await expect(confirm.getByRole("button", { name: "继续拼" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(confirm).toBeHidden();
  await expect(page.locator(".game-screen")).toContainText("1/170 颗");

  await page.getByRole("button", { name: "返回图纸宝库" }).click();
  await page.getByRole("button", { name: "首页" }).click();
  await page.getByRole("button", { name: "家长与隐私说明" }).click();
  const privacy = page.getByRole("dialog", { name: "家长与隐私" });
  await expect(privacy).toBeVisible();
  await expect(privacy.getByText("当前设备本机")).toBeVisible();
  await expect(privacy.getByText("保留与删除")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(privacy).toBeHidden();
});

test("clearing local records survives a reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("mili-game-v3", JSON.stringify({ completed: ["bottle-jelly"], boards: {}, activityDates: ["2026-08-12"] }));
    localStorage.setItem("mili-game-v2", JSON.stringify({ completed: ["rocket-cat"], boards: {}, activityDates: [] }));
  });
  await page.reload();
  await expect(page.getByText("已收藏 1 个作品")).toBeVisible();
  await page.getByRole("button", { name: "家长与隐私说明" }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "清除本机游戏记录" }).click();
  await expect(page.getByText("今天来点亮第一颗星")).toBeVisible();
  await expect.poll(() => page.evaluate(() => [localStorage.getItem("mili-game-v3"), localStorage.getItem("mili-game-v2"), localStorage.getItem("mili-game-delete-pending-v1")])).toEqual([null, null, null]);
  await page.reload();
  await expect(page.getByText("今天来点亮第一颗星")).toBeVisible();
});

test("the parental gate cannot be bypassed by a short hold or stale answer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /开始挑战/ }).click();
  await page.getByRole("button", { name: "生成打印图" }).click();
  const poster = page.getByRole("dialog", { name: "高清可打印图纸" });
  const posterLayer = page.locator(".poster-sheet");
  const parentButton = poster.getByRole("button", { name: "家长长按·保存高清图" });

  await parentButton.dispatchEvent("pointerdown");
  await page.waitForTimeout(250);
  await parentButton.dispatchEvent("pointerup");
  await page.waitForTimeout(1500);
  await expect(page.getByRole("dialog", { name: "家长验证" })).toBeHidden();

  await parentButton.dispatchEvent("pointerdown");
  await page.waitForTimeout(1500);
  const gate = page.getByRole("dialog", { name: "家长验证" });
  await expect(gate).toBeVisible();
  await expect(posterLayer).toHaveAttribute("aria-hidden", "true");
  await page.keyboard.press("Escape");
  await expect(gate).toBeHidden();
  await expect(poster).toBeVisible();
});
