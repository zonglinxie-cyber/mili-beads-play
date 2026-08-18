import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { PATTERNS } from "../app/patterns.ts";

const port = 4317;
let server;

test.before(async () => {
  server = spawn("npm", ["run", "start", "--", "--port", String(port)], { stdio: "ignore" });
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}`); if (r.ok) return; } catch { /* server is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("preview server did not start");
});

test.after(() => server?.kill());

test("renders the complete mobile bead game shell", async () => {
  const html = await fetch(`http://127.0.0.1:${port}`).then(r => r.text());
  assert.match(html, /米粒拼豆社/);
  assert.match(html, /本周精选/);
  assert.match(html, /夜航探图/);
  assert.match(html, /再选一张/);
  assert.match(html, /图纸/);
  for (const pattern of PATTERNS) assert.match(html, new RegExp(pattern.name));
  assert.doesNotMatch(html, /SkeletonPreview|codex-preview|ChatGPT 登录/);
});

test("ships installable offline assets", async () => {
  const [manifest, sw] = await Promise.all([
    fetch(`http://127.0.0.1:${port}/manifest.webmanifest`).then(r => r.json()),
    fetch(`http://127.0.0.1:${port}/sw.js`).then(r => r.text()),
  ]);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.short_name, "米粒拼豆");
  assert.match(sw, /mili-beads-v9/);
  assert.match(sw, /"privacy"/);
  assert.match(sw, /"support"/);
  assert.match(sw, /clients\.claim/);
});

test("ships a real playable pattern catalog", async () => {
  const fs = await import("node:fs/promises");
  const [source, catalog, playContent] = await Promise.all([
    fs.readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    fs.readFile(new URL("../app/patterns.ts", import.meta.url), "utf8"),
    fs.readFile(new URL("../app/play-content.ts", import.meta.url), "utf8"),
  ]);
  assert.match(catalog, /export const PATTERNS: Pattern\[\]/);
  assert.equal(PATTERNS.length, 12);
  assert.deepEqual(PATTERNS.map(pattern => pattern.id), ["scarf-sprint", "heart-frame", "bow-cat", "berry-sundae", "berry-boba", "balloon-bear", "moon-rabbit", "sushi-train", "whale-castle", "fox-kite", "otter-sub", "skate-duck"]);
  assert.match(source, /onPointerDown/);
  assert.match(source, /setSavedBoards/);
  assert.match(source, /finish-sheet/);
  assert.match(source, /makePoster/);
  assert.match(source, /生成打印图/);
  assert.match(source, /做成作品卡/);
  assert.match(source, /进入小舞台/);
  assert.match(source, /ZoneThumb/);
  assert.match(source, /openStageFromFinish/);
  assert.match(playContent, /export type PlayMode = BuildMode \| "spot"/);
  assert.match(source, /enterPlayMode\("assistant"\)/);
  assert.match(source, /配色找不同/);
  assert.match(source, /这一组已拼好/);
  assert.match(source, /撤销一步/);
  assert.match(source, /MysteryArt/);
  assert.match(source, /编一句故事/);
  assert.match(source, /角色说话/);
  assert.doesNotMatch(source, /今日动态任务/);
  assert.match(catalog, /PATTERNS\.forEach/);
});

test("provides a parent-facing privacy page", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/privacy`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /家长与隐私说明/);
  assert.match(html, /不包含广告/);
  assert.match(html, /当前设备/);
  assert.match(html, /故事卡/);
});

test("provides a public parent support page", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/support`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /支持与常见问题/);
  assert.match(html, /联系我们/);
});

test("native save mutations share a guarded queue and recover interrupted deletion", async () => {
  const fs = await import("node:fs/promises");
  const source = await fs.readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /type SavePhase = "hydrating" \| "ready" \| "read-error" \| "deleting" \| "delete-error"/);
  assert.match(source, /const enqueueNative = <T,>/);
  assert.match(source, /DurableStore\.set\(\{ key: SAVE_KEY/);
  assert.match(source, /enqueueNative\(\(\) => DurableStore\.remove\(\{ key: SAVE_KEY \}\)\)/);
  assert.match(source, /DurableStore\.get\(\{ key: DELETE_PENDING_KEY \}\)/);
  assert.match(source, /enqueueNative\(\(\) => DurableStore\.set\(\{ key: DELETE_PENDING_KEY, value: DELETE_TOMBSTONE \}\)\)/);
  assert.match(source, /enqueueNative\(\(\) => DurableStore\.remove\(\{ key: DELETE_PENDING_KEY \}\)\)/);
  assert.match(source, /DurableStore\.getLegacy\(\{ key: DELETE_PENDING_KEY \}\)/, "升级时必须先兑现旧版删除标记");
  assert.match(source, /for \(const legacyKey of \[SAVE_KEY, \.\.\.LEGACY_SAVE_KEYS\]\)/, "新存储为空时必须按 v3→v2 迁移旧版进度");
  assert.match(source, /enqueueNative\(\(\) => DurableStore\.clearLegacy\(\)\)/, "迁移或清除后必须清理整个旧版命名空间");
  assert.match(source, /DurableStore\.set\(\{ key: LEGACY_CLEAN_KEY, value: LEGACY_CLEAN_VALUE \}\)/, "旧仓清理完成后必须落耐久完成标记");
  assert.ok(source.indexOf("DurableStore.get({ key: DELETE_PENDING_KEY })") < source.indexOf("DurableStore.get({ key: SAVE_KEY })"));
  assert.ok(source.indexOf("DurableStore.getLegacy({ key: DELETE_PENDING_KEY })") < source.indexOf("DurableStore.get({ key: SAVE_KEY })"));
  assert.ok(source.indexOf("DurableStore.set({ key: DELETE_PENDING_KEY, value: DELETE_TOMBSTONE })") < source.indexOf("DurableStore.remove({ key: SAVE_KEY })"));
  assert.ok(source.indexOf("DurableStore.remove({ key: SAVE_KEY })") < source.indexOf("DurableStore.remove({ key: DELETE_PENDING_KEY })"));
  assert.match(source, /DurableStore\.set\(\{ key: SAVE_KEY, value: serializeSave\(empty\) \}\)/);
  assert.doesNotMatch(source, /localStorage\.getItem\(DELETE_PENDING_KEY\)/);
  assert.match(source, /saveGenerationRef\.current/);
  assert.match(source, /savePhaseRef\.current !== "ready"/);
  assert.doesNotMatch(source, /void (?:Preferences|DurableStore)\.remove/);
  assert.doesNotMatch(source, /\.catch\(\(\) => setSaveReady\(true\)\)/);
});
