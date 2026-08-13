import { expect, test, type Page } from "@playwright/test";
import { PATTERNS, targetCount } from "../../app/patterns";
import { buildSpotPuzzle, spotZoneOf } from "../../app/play-content";

const pattern = PATTERNS[0];
const secondaryPattern = PATTERNS[1];
const patternTotal = targetCount(pattern);
const zoneLabels = ["左上", "上中", "右上", "左中", "正中", "右中", "左下", "下中", "右下"];
const openFeatured = (page: Page) => page.getByRole("button", { name: /选玩法开拼|继续拼/ });

test("three offline modes provide distinct, honest interactions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("本周精选")).toBeVisible();
  await expect(page.getByLabel(/全库进度0\//)).toBeVisible();
  await expect(page.getByText("今日动态任务")).toHaveCount(0);

  await openFeatured(page).click();
  const picker = page.getByRole("region", { name: "选择玩法" });
  await expect(picker.getByRole("button", { name: /实体制作助手/ })).toBeVisible();
  await expect(picker.getByRole("button", { name: /手机拼豆/ })).toBeVisible();
  await expect(picker.getByRole("button", { name: /轮廓猜猜/ })).toBeVisible();

  await picker.getByRole("button", { name: /实体制作助手/ }).click();
  const assistantAction = page.locator(".assistant-action");
  await expect(assistantAction).toContainText("本区还剩");
  const assistantButton = assistantAction.getByRole("button", { name: "这一组已拼好" });
  const assistantBox = await assistantButton.boundingBox();
  expect(assistantBox?.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator(".zone-thumb").first()).toBeVisible();
  await assistantButton.click();
  await expect(page.locator(".game-screen")).not.toContainText(`0/${patternTotal} 颗`);
  await expect(assistantAction.getByRole("button", { name: /这一组已拼好|取消这一组/ })).toBeVisible();
  await page.getByRole("button", { name: "重新选择玩法" }).click();

  await picker.getByRole("button", { name: /手机拼豆/ }).click();
  await expect(page.getByRole("status", { name: "角色说话" })).toContainText("尖耳");
  await expect(page.getByRole("button", { name: "撤销一步" })).toBeDisabled();
  let openCell = page.locator(".touch-grid button:not(.placed)").first();
  if (!await openCell.count()) {
    await page.getByRole("button", { name: /^上中，/ }).click();
    openCell = page.locator(".touch-grid button:not(.placed)").first();
  }
  const openCellLabel = await openCell.getAttribute("aria-label");
  const colorName = openCellLabel?.split("，").at(-1) ?? "";
  await page.getByRole("button", { name: new RegExp(`^${colorName} `) }).click();
  await openCell.click();
  await expect(page.getByRole("button", { name: "撤销一步" })).toBeEnabled();
  await page.getByRole("button", { name: "撤销一步" }).click();
  await expect(openCell).not.toHaveClass(/placed/);
  await page.getByRole("button", { name: "重新选择玩法" }).click();

  await picker.getByRole("button", { name: /轮廓猜猜/ }).click();
  await expect(page.locator(".mystery-art i.silhouette").first()).toBeVisible();
  await expect(page.getByText(/轮廓已揭开 0\//)).toBeVisible();
});

test("a chosen colorway persists through play, print, and the works stage", async ({ page }) => {
  const colorways = pattern.colorways ?? [];
  test.skip(colorways.length < 2, "final catalog has not supplied multiple colorways yet");
  const second = colorways[1];
  const changedSymbol = Object.keys(pattern.palette).find(symbol => second.palette[symbol]?.name !== pattern.palette[symbol]?.name || second.palette[symbol]?.color !== pattern.palette[symbol]?.color);
  expect(changedSymbol).toBeTruthy();
  const expected = second.palette[changedSymbol!] ?? pattern.palette[changedSymbol!];
  const rgb = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(expected.color);
  const expectedCssColor = rgb ? `rgb(${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)})` : expected.color;

  await page.goto("/");
  await openFeatured(page).click();
  await page.getByRole("button", { name: `${second.name}配色` }).click();
  await expect.poll(() => page.evaluate(({ patternId, colorwayId }) => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").colorways?.[patternId] === colorwayId, { patternId: pattern.id, colorwayId: second.id })).toBe(true);
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await expect(page.getByRole("button", { name: new RegExp(`^${expected.name} `) })).toBeVisible();
  await expect(page.locator(`.reference .art i[data-symbol="${changedSymbol}"]`).first()).toHaveCSS("background-color", expectedCssColor);

  await page.reload();
  await openFeatured(page).click();
  await expect(page.getByRole("button", { name: `${second.name}配色` })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await page.getByRole("button", { name: "生成打印图" }).click();
  const poster = page.getByRole("dialog", { name: "高清可打印图纸" });
  await expect(poster).toContainText(second.name);
  await expect(poster.locator("img")).toHaveAttribute("alt", new RegExp(second.name));
  await page.keyboard.press("Escape");

  await page.evaluate(({ id, colorway }) => {
    const value = JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}");
    value.completed = [id];
    value.colorways = { [id]: colorway };
    localStorage.setItem("mili-game-v3", JSON.stringify(value));
  }, { id: pattern.id, colorway: second.id });
  await page.reload();
  await page.getByRole("button", { name: "打开作品册" }).click();
  await expect(page.locator(".work-grid article").first()).toContainText(second.name);
  await page.locator(".work-grid article").first().getByRole("button", { name: new RegExp(pattern.name) }).click();
  const stage = page.getByRole("dialog", { name: `${pattern.name}的小舞台` });
  await expect(stage).toContainText(second.name);
  await expect(stage.locator(`.stage-character i[data-symbol="${changedSymbol}"]`).first()).toHaveCSS("background-color", expectedCssColor);
});

test("a child can complete a pattern, animate it, export it, and recover the work", async ({ page }) => {
  await page.goto("/");
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();

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
        if (!await cell.count() || await cell.evaluate(node => node.classList.contains("placed"))) continue;
        await cell.click();
      }
    }
  }

  const finish = page.getByRole("dialog", { name: "拼豆完成" });
  await expect(finish).toBeVisible();
  await expect(page.locator(".game-progress b")).toHaveText("100%");
  await expect(finish.getByText("完成啦，米粒！")).toBeVisible();
  await expect(finish.getByText("作品马上会走进小舞台")).toBeVisible();

  const stage = page.getByRole("dialog", { name: `${pattern.name}的小舞台` });
  await expect(stage).toBeVisible({ timeout: 5000 });
  await expect(finish).toBeHidden();
  await expect(stage.getByText("编一句故事")).toBeVisible();
  await expect(stage.getByText("追风围巾猫在星空船舱把围巾扬起来。金色星光绕着它转了一圈。")).toBeVisible();
  await expect(stage.locator('.stage-preview')).toHaveAttribute('data-scene', 'starship-cabin');
  const cloudButton = stage.getByRole("button", { name: "云端邮局" });
  const cloudBox = await cloudButton.boundingBox();
  expect(cloudBox?.height).toBeGreaterThanOrEqual(44);
  await cloudButton.click();
  await stage.getByRole("button", { name: "泡泡环游" }).click();
  await expect(stage.locator('.stage-preview')).toHaveAttribute('data-scene', 'cloud-post');
  await expect(stage.locator('.stage-preview')).toHaveAttribute('data-effect', 'bubble-orbit');
  await expect(stage.getByText("追风围巾猫在云端邮局把围巾扬起来。小泡泡轻轻飘过身边。")).toBeVisible();
  await stage.getByRole("button", { name: "往前冲一程" }).click();
  await expect.poll(() => page.evaluate(patternId => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").stages?.[patternId], pattern.id)).toEqual({ scene: "cloud-post", effect: "bubble-orbit" });
  await expect.poll(() => page.evaluate(patternId => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").stories?.[patternId], pattern.id)).toEqual({ who: "wind-cat", doing: "race-ahead" });
  await stage.getByRole("button", { name: "做成作品卡" }).click();
  const workPoster = page.getByRole("dialog", { name: "米粒的作品卡" });
  await expect(workPoster).toBeVisible();
  await expect(stage).toBeHidden();
  const workSize = await workPoster.locator("img").evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, height: image.naturalHeight }));
  expect(workSize).toEqual({ width: 1200, height: 1500 });
  await page.keyboard.press("Escape");

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
  await expect(page.locator(".work-grid b")).toHaveText(pattern.name);
  await expect(page.getByText("蜜橘飞行队 · 云端邮局")).toBeVisible();
  await expect(page.locator(".work-story")).toHaveText("追风围巾猫在云端邮局往前冲一程。");
  await page.getByRole("button", { name: new RegExp(`${pattern.name}.*云端邮局`) }).click();
  await expect(page.getByRole("dialog", { name: `${pattern.name}的小舞台` }).locator('.stage-preview')).toHaveAttribute('data-effect', 'bubble-orbit');
});

test("the installed PWA reloads its shell after the network goes offline", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: new RegExp(pattern.name) })).toBeVisible();
  await expect(openFeatured(page)).toBeVisible();
});

test("partial bead progress survives a cold page reload", async ({ page }) => {
  await page.goto("/");
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await page.getByRole("button", { name: /^左上，/ }).click();
  const firstColor = pattern.palette[pattern.rows.join("").split("").find(cell => cell !== ".")!].name;
  await page.getByRole("button", { name: new RegExp(`^${firstColor} `) }).click();
  await page.getByRole("button", { name: new RegExp(`，${firstColor}$`) }).first().click();
  await expect(page.locator(".game-screen")).toContainText(`1/${patternTotal} 颗`);
  const persistedBeforeReload = await page.evaluate(patternId => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").boards?.[patternId], pattern.id);
  expect(persistedBeforeReload?.filter((cell: string) => cell !== ".")).toHaveLength(1);
  await page.waitForTimeout(300);
  await page.reload();
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await expect(page.locator(".game-screen")).toContainText(`1/${patternTotal} 颗`);
});

test("a valid legacy save survives upgrade even when the new save is corrupt", async ({ page }) => {
  await page.goto("/");
  const target = pattern.rows.join("").split("");
  const firstTarget = target.findIndex(cell => cell !== ".");
  const board = Array(18 * 18).fill(".");
  board[firstTarget] = target[firstTarget];
  await page.evaluate(({ savedBoard, patternId, completedId }) => {
    localStorage.setItem("mili-game-v3", "{not-json");
    localStorage.setItem("mili-game-v2", JSON.stringify({
      completed: [completedId, "unknown-pattern"],
      boards: { [patternId]: savedBoard, broken: "not-a-board" },
      activityDates: ["2026-08-12", "bad-date"],
    }));
  }, { savedBoard: board, patternId: pattern.id, completedId: secondaryPattern.id });
  await page.reload();
  await expect(page.getByText("已收藏 1 个作品")).toBeVisible();
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await expect(page.locator(".game-screen")).toContainText(`1/${patternTotal} 颗`);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").completed)).toEqual([secondaryPattern.id]);
});

test("reset, privacy and reduced motion are safe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await page.getByRole("button", { name: /^上中，/ }).click();
  const resetColor = pattern.palette[pattern.rows.join("").split("").find(cell => cell !== ".")!].name;
  await page.getByRole("button", { name: new RegExp(`^${resetColor} `) }).click();
  const target = page.getByRole("button", { name: new RegExp(`，${resetColor}$`) }).first();
  await target.click();
  await page.getByRole("button", { name: "重新开始" }).click();
  const confirm = page.getByRole("dialog", { name: "确认重新开始" });
  await expect(confirm).toBeVisible();
  await expect(confirm.getByRole("button", { name: "继续拼" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(confirm).toBeHidden();
  await expect(page.locator(".game-screen")).toContainText(`1/${patternTotal} 颗`);

  await page.getByRole("button", { name: "返回首页" }).click();
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
  await page.evaluate(({ currentId, legacyId }) => {
    localStorage.setItem("mili-game-v3", JSON.stringify({ completed: [currentId], boards: {}, activityDates: ["2026-08-12"] }));
    localStorage.setItem("mili-game-v2", JSON.stringify({ completed: [legacyId], boards: {}, activityDates: [] }));
  }, { currentId: secondaryPattern.id, legacyId: pattern.id });
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
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();
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

test("a completed work can replay as a colorway spot-the-difference without rewriting the save", async ({ page }) => {
  const board = pattern.rows.join("").split("");
  const puzzle = buildSpotPuzzle(pattern, pattern.colorways[0].id);
  expect(puzzle).toBeTruthy();
  const first = puzzle!.swapped[0];
  const firstZone = spotZoneOf(first);

  await page.goto("/");
  await page.evaluate(({ id, savedBoard, colorway }) => {
    localStorage.setItem("mili-game-v3", JSON.stringify({
      completed: [id],
      boards: { [id]: savedBoard },
      activityDates: ["2026-08-13"],
      colorways: { [id]: colorway },
    }));
  }, { id: pattern.id, savedBoard: board, colorway: pattern.colorways[0].id });
  await page.reload();
  await page.getByRole("button", { name: "打开作品册" }).click();
  await page.getByRole("button", { name: "配色找不同" }).click();
  await expect(page.getByRole("status", { name: "角色说话" })).toContainText("队服");
  await expect(page.getByText(`找到 0/${puzzle!.swapped.length} 颗`)).toBeVisible();
  await page.getByRole("button", { name: new RegExp(`^${zoneLabels[firstZone]}，`) }).click();
  await page.getByRole("button", { name: `第${Math.floor(first / 18) + 1}行第${first % 18 + 1}格，换了队服` }).click();
  await expect(page.getByText(`找到 1/${puzzle!.swapped.length} 颗`)).toBeVisible();
  await expect.poll(() => page.evaluate(patternId => JSON.parse(localStorage.getItem("mili-game-v3") ?? "{}").boards?.[patternId], pattern.id)).toEqual(board);
});

test("mobile tap mode can erase a correctly placed bead", async ({ page }) => {
  await page.goto("/");
  await openFeatured(page).click();
  await page.getByRole("button", { name: /手机拼豆/ }).click();
  await expect(page.getByRole("button", { name: "点击模式" })).toBeVisible();
  await page.getByRole("button", { name: /^左上，/ }).click();
  const firstColor = pattern.palette[pattern.rows.join("").split("").find(cell => cell !== ".")!].name;
  await page.getByRole("button", { name: new RegExp(`^${firstColor} `) }).click();
  const cell = page.getByRole("button", { name: new RegExp(`，${firstColor}$`) }).first();
  await cell.click();
  await expect(page.locator(".game-screen")).toContainText(`1/${patternTotal} 颗`);
  await cell.click();
  await expect(page.locator(".game-screen")).toContainText(`0/${patternTotal} 颗`);
  await expect(page.getByRole("status", { name: "角色说话" })).toContainText("已擦掉");
});

test("a free drawing can be saved and reopened from the works shelf", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /开始画/ }).click();
  await expect(page.getByText("18×18 · 12 种颜色")).toBeVisible();
  await page.getByRole("button", { name: "番茄红" }).click();
  await page.getByRole("button", { name: "第1行第1格" }).click();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByRole("status")).toContainText("作品已保存");
  await page.getByRole("button", { name: "返回首页" }).click();
  await page.getByRole("button", { name: "打开作品册" }).click();
  await expect(page.getByRole("heading", { name: "自由画板作品" })).toBeVisible();
  await expect(page.getByText("我的作品 1")).toBeVisible();
  await page.getByRole("button", { name: "进入小舞台" }).click();
  await expect(page.getByRole("dialog", { name: "我的作品 1的小舞台" })).toBeVisible();
});

