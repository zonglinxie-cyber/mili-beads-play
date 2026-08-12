import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const projectUrl = new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url);
const privacyUrl = new URL("../ios/App/App/PrivacyInfo.xcprivacy", import.meta.url);
const infoUrl = new URL("../ios/App/App/Info.plist", import.meta.url);

function plistValuePattern(key, valuePattern) {
  return new RegExp(`<key>\\s*${key}\\s*<\\/key>\\s*${valuePattern}`);
}

async function assertOpaquePng(url, expectedSize, label, { fullBleed = false } = {}) {
  const png = await readFile(url);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  assert.deepEqual(png.subarray(0, 8), signature, `${label} 必须是有效 PNG`);
  assert.equal(png.toString("ascii", 12, 16), "IHDR", `${label} 首个数据块必须是 IHDR`);
  assert.equal(png.readUInt32BE(16), expectedSize, `${label} 宽度必须是 ${expectedSize}px`);
  assert.equal(png.readUInt32BE(20), expectedSize, `${label} 高度必须是 ${expectedSize}px`);

  const colorType = png[25];
  assert.doesNotMatch(String(colorType), /^(4|6)$/, `${label} IHDR color type 不得包含 alpha 通道`);
  assert.equal(png.includes(Buffer.from("tRNS", "ascii")), false, `${label} 不得通过 tRNS 声明透明度`);
  if (fullBleed) {
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", new URL(url).pathname], { encoding: "utf8" });
    assert.equal(result.status, 0, `${label} 必须可被系统图像工具读取`);
    const firstIdat = png.indexOf(Buffer.from("IDAT", "ascii"));
    assert.ok(firstIdat > 0, `${label} 必须包含图像数据`);
  }
}

test("iOS privacy manifest is packaged in the app target resources", async () => {
  const project = await readFile(projectUrl, "utf8");
  const resourcesSection = project.match(
    /\/\* Begin PBXResourcesBuildPhase section \*\/([\s\S]*?)\/\* End PBXResourcesBuildPhase section \*\//,
  )?.[1];

  assert.ok(resourcesSection, "Xcode 项目必须包含 Resources build phase");
  assert.match(project, /PrivacyInfo\.xcprivacy \*\/ = \{isa = PBXFileReference;/, "PrivacyInfo.xcprivacy 必须在 Xcode 项目中有文件引用");
  assert.match(project, /PrivacyInfo\.xcprivacy in Resources \*\/ = \{isa = PBXBuildFile;/, "PrivacyInfo.xcprivacy 必须创建 Resources build file");
  assert.match(resourcesSection, /PrivacyInfo\.xcprivacy in Resources/, "PrivacyInfo.xcprivacy 必须进入 App target Resources");
});

test("iOS privacy manifest declares Capacitor file timestamp access", async () => {
  const privacy = await readFile(privacyUrl, "utf8");

  assert.match(
    privacy,
    plistValuePattern("NSPrivacyAccessedAPIType", "<string>\\s*NSPrivacyAccessedAPICategoryFileTimestamp\\s*<\\/string>"),
    "PrivacyInfo 必须声明文件时间戳 API",
  );
  assert.match(privacy, /<string>\s*C617\.1\s*<\/string>/, "文件时间戳 API 必须声明 C617.1 理由");
});

test("iOS app is export-compliance ready, Simplified Chinese and iPhone-only", async () => {
  const [info, project] = await Promise.all([
    readFile(infoUrl, "utf8"),
    readFile(projectUrl, "utf8"),
  ]);

  assert.match(
    info,
    plistValuePattern("ITSAppUsesNonExemptEncryption", "<false\\s*\\/?>"),
    "Info.plist 必须声明不使用非豁免加密",
  );
  assert.match(
    info,
    plistValuePattern("CFBundleDevelopmentRegion", "<string>\\s*zh_CN\\s*<\\/string>"),
    "iOS 默认开发语言必须是简体中文",
  );
  assert.match(
    info,
    /<key>\s*CFBundleLocalizations\s*<\/key>\s*<array>[\s\S]*?<string>\s*zh-Hans\s*<\/string>[\s\S]*?<\/array>/,
    "Info.plist 必须显式声明 zh-Hans 本地化",
  );

  const targetedFamilies = [...project.matchAll(/TARGETED_DEVICE_FAMILY\s*=\s*"?([^";]+)"?;/g)]
    .map((match) => match[1].trim());
  assert.ok(targetedFamilies.length >= 2, "Debug 和 Release 都必须声明目标设备家族");
  assert.deepEqual(
    [...new Set(targetedFamilies)],
    ["1"],
    "iOS target 必须仅面向 iPhone (TARGETED_DEVICE_FAMILY=1)",
  );
});

test("store icons have release-safe dimensions and no alpha channel", async () => {
  await Promise.all([
    assertOpaquePng(new URL("../public/app-icon-1024.png", import.meta.url), 1024, "Web/App Store 1024 图标", { fullBleed: true }),
    assertOpaquePng(
      new URL("../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", import.meta.url),
      1024,
      "iOS AppIcon",
      { fullBleed: true },
    ),
  ]);

  try {
    await assertOpaquePng(new URL("../public/app-icon-512.png", import.meta.url), 512, "Google Play 512 图标");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
});
