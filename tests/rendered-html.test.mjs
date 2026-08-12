import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

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
  assert.match(html, /宇航员小猫/);
  assert.match(html, /一眼就想拼的图纸/);
  assert.match(html, /图纸/);
  assert.doesNotMatch(html, /SkeletonPreview|codex-preview|ChatGPT 登录/);
});

test("ships installable offline assets", async () => {
  const [manifest, sw] = await Promise.all([
    fetch(`http://127.0.0.1:${port}/manifest.webmanifest`).then(r => r.json()),
    fetch(`http://127.0.0.1:${port}/sw.js`).then(r => r.text()),
  ]);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.short_name, "米粒拼豆");
  assert.match(sw, /mili-beads-v1/);
});

test("ships a real playable pattern catalog", async () => {
  const source = await import("node:fs/promises").then(fs => fs.readFile(new URL("../app/page.tsx", import.meta.url), "utf8"));
  assert.match(source, /const PATTERNS: Pattern\[\]/);
  assert.equal((source.match(/id:\s*"[a-z-]+"/g) ?? []).length, 10);
  assert.match(source, /onPointerDown/);
  assert.match(source, /setSavedBoards/);
  assert.match(source, /finish-sheet/);
});

test("provides a parent-facing privacy page", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/privacy`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /家长与隐私说明/);
  assert.match(html, /不包含广告/);
  assert.match(html, /当前设备/);
});
