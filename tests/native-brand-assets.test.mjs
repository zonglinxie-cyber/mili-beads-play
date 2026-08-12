import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootUrl = new URL("../", import.meta.url);
const expectedSourceHash = "9115a018a9f279c5559e02b6cdfe7fb0685527fcf9d3816535179c53c2a0cfde";
const knownTemplateHashes = new Set([
  "1b5002b74a5500e697298ced06ca2811ac33f2771f236f3c720ff23243890530", // iOS Capacitor splash
  "5cf98b4451bd99b20df26f9e608a46946118be6b0ae90762f9ca1786a30c76ff", // Android Capacitor splash
  "513d9bf54096023ee3ea11d4562854240ad4fdf4d0f765fb08ae1a4032a1cc4d", // Android template launcher
  "58e78a618778926b1f6d9472a6468de878de8530970934e94aab5ba4ba08cc00", // Android robot foreground
]);

const representativeNativeAssets = [
  "../android/app/src/main/res/mipmap-mdpi/ic_launcher.png",
  "../android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png",
  "../android/app/src/main/res/drawable/splash.png",
  "../ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png",
];

test("native assets are deterministic derivatives of the approved brand icon", async () => {
  const source = await readFile(new URL("../public/app-icon-1024.png", import.meta.url));
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    expectedSourceHash,
    "品牌源图已变化；请审阅新图标后再显式更新门禁哈希",
  );

  const { stdout } = await execFileAsync(
    process.execPath,
    ["scripts/generate-native-brand-assets.mjs", "--check"],
    { cwd: fileURLToPath(rootUrl) },
  );
  assert.match(stdout, /^verified 30 native brand assets/m);

  for (const path of representativeNativeAssets) {
    const asset = await readFile(new URL(path, import.meta.url));
    const hash = createHash("sha256").update(asset).digest("hex");
    assert.equal(knownTemplateHashes.has(hash), false, `${path} 不得恢复已知 Capacitor 模板 PNG`);
  }
});

test("Capacitor template launcher vectors and colors cannot return", async () => {
  const [colors, styles] = await Promise.all([
    readFile(new URL("../android/app/src/main/res/values/ic_launcher_background.xml", import.meta.url), "utf8"),
    readFile(new URL("../android/app/src/main/res/values/styles.xml", import.meta.url), "utf8"),
  ]);

  assert.match(colors, /#7D55C9/, "adaptive icon 必须使用品牌紫背景");
  assert.match(colors, /#FFF7EA/, "Android 12 启动页必须使用品牌奶油色");
  assert.match(styles, /windowSplashScreenAnimatedIcon[^\n]*@mipmap\/ic_launcher_foreground/);
  assert.doesNotMatch(`${colors}\n${styles}`, /#26A69A|M66\.94,46\.02/i, "不得恢复 Capacitor/Android 模板品牌");

  for (const path of [
    "../android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml",
    "../android/app/src/main/res/drawable/ic_launcher_background.xml",
  ]) {
    await assert.rejects(access(new URL(path, import.meta.url)), { code: "ENOENT" });
  }
});
