import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const rootUrl = new URL("../", import.meta.url);
const expectedSourceHash = "dfa203e47796a3a70787f3fcafd9512dcb53899aa75a5881ac6152c0647c7083";
const knownAiSourceHash = "441af858f1bbf8391bbfb27d99aa60813a584ce07eecc0124b9d3c78796b5aa3";
const knownTemplateHashes = new Set([
  "1b5002b74a5500e697298ced06ca2811ac33f2771f236f3c720ff23243890530",
  "5cf98b4451bd99b20df26f9e608a46946118be6b0ae90762f9ca1786a30c76ff",
  "513d9bf54096023ee3ea11d4562854240ad4fdf4d0f765fb08ae1a4032a1cc4d",
  "58e78a618778926b1f6d9472a6468de878de8530970934e94aab5ba4ba08cc00",
]);

const representativeNativeAssets = [
  "../android/app/src/main/res/mipmap-mdpi/ic_launcher.png",
  "../android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png",
  "../android/app/src/main/res/drawable/splash.png",
  "../ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png",
];

async function metadata(relativePath) {
  return sharp(fileURLToPath(new URL(relativePath, import.meta.url))).metadata();
}

test("native assets deterministically derive from the selected 18x18 grid JSON", async () => {
  const sourceBytes = await readFile(new URL("../release/brand-grid-v5/candidates/scarf-sprint.json", import.meta.url));
  assert.equal(createHash("sha256").update(sourceBytes).digest("hex"), expectedSourceHash);
  const source = JSON.parse(sourceBytes);
  assert.deepEqual(source.dimensions, { columns: 18, rows: 18 });
  assert.equal(source.id, "scarf-sprint");
  assert.equal(source.rows.join("").replaceAll(".", "").length, 153);
  assert.equal(Object.keys(source.palette).length, 6);

  const { stdout } = await execFileAsync(
    process.execPath,
    ["scripts/generate-native-brand-assets.mjs", "--check"],
    { cwd: fileURLToPath(rootUrl) },
  );
  assert.match(stdout, /^verified 60 web\/native brand assets from release\/brand-grid-v5\/candidates\/scarf-sprint\.json/m);

  const appIcon = await readFile(new URL("../public/app-icon-1024.png", import.meta.url));
  assert.notEqual(createHash("sha256").update(appIcon).digest("hex"), knownAiSourceHash, "旧 AI 摄影源不得回归");
  for (const path of representativeNativeAssets) {
    const asset = await readFile(new URL(path, import.meta.url));
    assert.equal(knownTemplateHashes.has(createHash("sha256").update(asset).digest("hex")), false, `${path} 不得恢复模板 PNG`);
  }
});

test("large, small, store, adaptive and splash assets use their correct rendering contracts", async () => {
  for (const [path, width, height] of [
    ["../public/app-icon-1024.png", 1024, 1024],
    ["../public/app-icon-512.png", 512, 512],
    ["../release/brand-v5-integration/render-38.png", 38, 38],
    ["../release/brand-v5-integration/render-64.png", 64, 64],
    ["../release/store-assets-v10/google-play-feature-graphic-1024x500.png", 1024, 500],
  ]) {
    const info = await metadata(path);
    assert.equal(info.width, width, path);
    assert.equal(info.height, height, path);
  }

  assert.equal((await metadata("../public/app-icon-1024.png")).hasAlpha, false, "iOS icon must be opaque and full-bleed");
  assert.equal((await metadata("../release/store-assets-v10/google-play-icon-512.png")).hasAlpha, true, "Play asset must be 32-bit RGBA");
  assert.equal((await metadata("../android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png")).hasAlpha, true, "adaptive foreground must be transparent");
  assert.equal((await metadata("../release/brand-v5-integration/render-38.png")).hasAlpha, true, "coordinate render must not bake a square badge");

  const [readme, manifest, favicon, webManifest] = await Promise.all([
    readFile(new URL("../release/brand-v5-integration/README.md", import.meta.url), "utf8"),
    readFile(new URL("../release/brand-v5-integration/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  ]);
  assert.match(readme, /没有做过真实 8–10 岁儿童盲测/);
  assert.match(readme, /没有真实拼豆摆放／熨烫实物验证/);
  assert.match(readme, /Go-to-validate \/ No-Go-to-ship/);
  assert.equal(JSON.parse(manifest).evidenceBoundary.realChildBlindTest, false);
  assert.equal(JSON.parse(manifest).evidenceBoundary.physicalBeadAndIronTest, false);
  assert.equal(JSON.parse(manifest).evidenceBoundary.realDeviceLauncherTest, false);
  assert.equal((favicon.match(/<circle /g) ?? []).length, 153, "favicon 的可见豆必须逐一对应 JSON 坐标");
  assert.equal(JSON.parse(webManifest).theme_color, "#403655");
});

test("brand checksum ledger covers the source and every generated delivery asset", async () => {
  const ledger = await readFile(new URL("../release/brand-v5-integration/SHA256SUMS.txt", import.meta.url), "utf8");
  const entries = ledger.trim().split("\n").map((line) => {
    const match = line.match(/^([a-f0-9]{64}) {2}(.+)$/);
    assert.ok(match, `invalid checksum line: ${line}`);
    return { expected: match[1], path: match[2] };
  });
  assert.equal(entries.length, 60, "source plus 59 generated outputs must be hashed");
  assert.equal(new Set(entries.map(({ path }) => path)).size, entries.length, "checksum paths must be unique");
  for (const { expected, path } of entries) {
    const bytes = await readFile(new URL(`../${path}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected, path);
  }
});

test("Capacitor template launcher vectors and colors cannot return", async () => {
  const [colors, styles, launchScreen] = await Promise.all([
    readFile(new URL("../android/app/src/main/res/values/ic_launcher_background.xml", import.meta.url), "utf8"),
    readFile(new URL("../android/app/src/main/res/values/styles.xml", import.meta.url), "utf8"),
    readFile(new URL("../ios/App/App/Base.lproj/LaunchScreen.storyboard", import.meta.url), "utf8"),
  ]);
  assert.match(colors, /#403655/, "adaptive icon must use the grid-brand background");
  assert.match(colors, /#FFF9ED/, "launch surface must use brand cream");
  assert.match(styles, /windowSplashScreenAnimatedIcon[^\n]*@mipmap\/ic_launcher_foreground/);
  assert.match(launchScreen, /image="Splash"/);
  assert.doesNotMatch(`${colors}\n${styles}`, /#26A69A|M66\.94,46\.02/i);

  for (const path of [
    "../android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml",
    "../android/app/src/main/res/drawable/ic_launcher_background.xml",
  ]) {
    await assert.rejects(access(new URL(path, import.meta.url)), { code: "ENOENT" });
  }
});
