import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const projectUrl = new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url);
const schemeUrl = new URL("../ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme", import.meta.url);
const packageUrl = new URL("../ios/App/CapApp-SPM/Package.swift", import.meta.url);
const resolvedUrl = new URL("../ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved", import.meta.url);
const privacyUrl = new URL("../ios/App/App/PrivacyInfo.xcprivacy", import.meta.url);
const infoUrl = new URL("../ios/App/App/Info.plist", import.meta.url);
const pageUrl = new URL("../app/page.tsx", import.meta.url);
const privacyPageUrl = new URL("../app/privacy/page.tsx", import.meta.url);
const supportPageUrl = new URL("../app/support/page.tsx", import.meta.url);
const durableStoreUrl = new URL("../ios/App/App/DurableStorePlugin.swift", import.meta.url);
const bridgeControllerUrl = new URL("../ios/App/App/MiliBridgeViewController.swift", import.meta.url);
const sceneDelegateUrl = new URL("../ios/App/App/SceneDelegate.swift", import.meta.url);
const mainStoryboardUrl = new URL("../ios/App/App/Base.lproj/Main.storyboard", import.meta.url);
const storeAssetsUrl = new URL("../release/store-assets-v10/", import.meta.url);

function plistValuePattern(key, valuePattern) {
  return new RegExp(`<key>\\s*${key}\\s*<\\/key>\\s*${valuePattern}`);
}

async function assertOpaquePng(url, width, height, label) {
  const png = await readFile(url);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  assert.deepEqual(png.subarray(0, 8), signature, `${label} 必须是有效 PNG`);
  assert.equal(png.toString("ascii", 12, 16), "IHDR", `${label} 首个数据块必须是 IHDR`);
  assert.equal(png.readUInt32BE(16), width, `${label} 宽度必须是 ${width}px`);
  assert.equal(png.readUInt32BE(20), height, `${label} 高度必须是 ${height}px`);
  assert.ok([0, 2, 3].includes(png[25]), `${label} IHDR color type 不得包含 alpha 通道`);
  assert.equal(png.includes(Buffer.from("tRNS", "ascii")), false, `${label} 不得通过 tRNS 声明透明度`);
  assert.ok(png.includes(Buffer.from("IDAT", "ascii")), `${label} 必须包含图像数据`);
}

test("iOS privacy manifest is packaged and declares the required-reason API", async () => {
  const [project, privacy] = await Promise.all([
    readFile(projectUrl, "utf8"),
    readFile(privacyUrl, "utf8"),
  ]);
  const resourcesSection = project.match(
    /\/\* Begin PBXResourcesBuildPhase section \*\/([\s\S]*?)\/\* End PBXResourcesBuildPhase section \*\//,
  )?.[1];

  assert.ok(resourcesSection, "Xcode 项目必须包含 Resources build phase");
  assert.match(project, /PrivacyInfo\.xcprivacy \*\/ = \{isa = PBXFileReference;/, "PrivacyInfo.xcprivacy 必须在 Xcode 项目中有文件引用");
  assert.match(project, /PrivacyInfo\.xcprivacy in Resources \*\/ = \{isa = PBXBuildFile;/, "PrivacyInfo.xcprivacy 必须创建 Resources build file");
  assert.match(resourcesSection, /PrivacyInfo\.xcprivacy in Resources/, "PrivacyInfo.xcprivacy 必须进入 App target Resources");
  assert.match(
    privacy,
    plistValuePattern("NSPrivacyAccessedAPIType", "<string>\\s*NSPrivacyAccessedAPICategoryFileTimestamp\\s*<\\/string>"),
    "PrivacyInfo 必须声明文件时间戳 API",
  );
  assert.match(privacy, /<string>\s*C617\.1\s*<\/string>/, "文件时间戳 API 必须声明 C617.1 理由");
  assert.match(
    privacy,
    plistValuePattern("NSPrivacyAccessedAPIType", "<string>\\s*NSPrivacyAccessedAPICategoryUserDefaults\\s*<\\/string>"),
    "Preferences 存档必须声明 UserDefaults API",
  );
  assert.match(privacy, /<string>\s*CA92\.1\s*<\/string>/, "UserDefaults API 必须声明 CA92.1 理由");
  assert.match(privacy, plistValuePattern("NSPrivacyTracking", "<false\\s*\\/?>"), "当前版本必须明确不追踪");
  assert.match(privacy, /<key>\s*NSPrivacyCollectedDataTypes\s*<\/key>\s*<array\s*\/?>/, "当前版本的已收集数据类型必须为空");
});

test("iOS release identity and Xcode 26 project metadata are explicit", async () => {
  const [info, project] = await Promise.all([
    readFile(infoUrl, "utf8"),
    readFile(projectUrl, "utf8"),
  ]);

  assert.equal((project.match(/PRODUCT_BUNDLE_IDENTIFIER = family\.mili\.beads;/g) ?? []).length, 2, "Debug/Release 必须共用确定 Bundle ID");
  assert.equal((project.match(/MARKETING_VERSION = 1\.0;/g) ?? []).length, 2, "Debug/Release 必须共用 1.0 版本");
  assert.equal((project.match(/CURRENT_PROJECT_VERSION = 1;/g) ?? []).length, 2, "Debug/Release 必须共用 build 1");
  assert.equal((project.match(/PRODUCT_BUNDLE_DISPLAY_NAME = "米粒拼豆社";/g) ?? []).length, 2, "Debug/Release 必须共用中文展示名");
  assert.match(info, plistValuePattern("CFBundleDisplayName", "<string>\\s*\\$\\(PRODUCT_BUNDLE_DISPLAY_NAME\\)\\s*<\\/string>"));
  assert.match(project, /LastUpgradeCheck = 2600;/, "项目必须标记已由 Xcode 26 升级");
  assert.match(project, /LastSwiftUpdateCheck = 2600;/, "Swift 升级元数据必须对齐 Xcode 26");
  assert.doesNotMatch(project, /\bCODE_SIGN_IDENTITY\s*=/, "不得锁定某台机器的开发证书");
  assert.doesNotMatch(project, /\bDEVELOPMENT_TEAM\s*=/, "不得伪造或锁定未提供的 Apple Team ID");
});

test("Info.plist is export-compliance ready, Chinese and free of unused permissions", async () => {
  const info = await readFile(infoUrl, "utf8");

  assert.match(info, plistValuePattern("ITSAppUsesNonExemptEncryption", "<false\\s*\\/?>"), "Info.plist 必须声明不使用非豁免加密");
  assert.match(info, plistValuePattern("CFBundleDevelopmentRegion", "<string>\\s*zh_CN\\s*<\\/string>"), "iOS 默认开发语言必须是简体中文");
  assert.match(
    info,
    /<key>\s*CFBundleLocalizations\s*<\/key>\s*<array>[\s\S]*?<string>\s*zh-Hans\s*<\/string>[\s\S]*?<\/array>/,
    "Info.plist 必须显式声明 zh-Hans 本地化",
  );
  assert.doesNotMatch(info, /<key>\s*NS[A-Za-z]+UsageDescription\s*<\/key>/, "不得声明当前版本没有使用的系统权限");
  assert.doesNotMatch(info, /<key>\s*(?:CFBundleURLTypes|LSApplicationQueriesSchemes|UIBackgroundModes)\s*<\/key>/, "不得声明未使用的 URL scheme 或后台模式");
});

test("the app is iPhone-only, portrait-only and consistently targets iOS 15", async () => {
  const [info, project, packageManifest] = await Promise.all([
    readFile(infoUrl, "utf8"),
    readFile(projectUrl, "utf8"),
    readFile(packageUrl, "utf8"),
  ]);

  const targetedFamilies = [...project.matchAll(/TARGETED_DEVICE_FAMILY\s*=\s*"?([^";]+)"?;/g)].map((match) => match[1].trim());
  const catalystValues = [...project.matchAll(/SUPPORTS_MACCATALYST\s*=\s*([^;]+);/g)].map((match) => match[1].trim());
  const deploymentTargets = [...project.matchAll(/IPHONEOS_DEPLOYMENT_TARGET\s*=\s*([^;]+);/g)].map((match) => match[1].trim());

  assert.equal(targetedFamilies.length, 2, "App target Debug/Release 都必须声明设备家族");
  assert.deepEqual([...new Set(targetedFamilies)], ["1"], "iOS target 必须仅面向 iPhone");
  assert.equal(catalystValues.length, 2, "App target Debug/Release 都必须显式禁用 Mac Catalyst");
  assert.deepEqual([...new Set(catalystValues)], ["NO"], "SUPPORTS_MACCATALYST 必须为 NO");
  assert.ok(deploymentTargets.length >= 4, "Project 和 App target 的 Debug/Release 都必须声明最低系统");
  assert.deepEqual([...new Set(deploymentTargets)], ["15.0"], "所有 iOS 构建配置必须统一最低 iOS 15");
  assert.match(packageManifest, /platforms:\s*\[\.iOS\(\.v15\)\]/, "Swift Package 最低系统必须同步为 iOS 15");
  assert.doesNotMatch(info, /UISupportedInterfaceOrientations~ipad/, "iPhone-only 应用不得保留 iPad 方向配置");
  assert.match(info, plistValuePattern("UISupportedInterfaceOrientations", "<array>\\s*<string>\\s*UIInterfaceOrientationPortrait\\s*<\\/string>\\s*<\\/array>"), "应用必须仅支持竖屏");
});

test("the shared App scheme archives the Release configuration", async () => {
  const scheme = await readFile(schemeUrl, "utf8");

  assert.match(scheme, /LastUpgradeVersion\s*=\s*"2600"/, "shared scheme 必须对齐 Xcode 26");
  assert.match(scheme, /BuildableName\s*=\s*"App\.app"/, "shared scheme 必须指向 App.app");
  assert.match(scheme, /buildForArchiving\s*=\s*"YES"/, "App build action 必须参与 Archive");
  assert.match(scheme, /<ArchiveAction\s+buildConfiguration\s*=\s*"Release"/, "Archive 必须使用 Release 配置");
});

test("SwiftPM production dependencies are reproducibly pinned", async () => {
  const [packageManifest, resolvedRaw] = await Promise.all([
    readFile(packageUrl, "utf8"),
    readFile(resolvedUrl, "utf8"),
  ]);
  const resolved = JSON.parse(resolvedRaw);
  const pins = Object.fromEntries(resolved.pins.map((pin) => [pin.identity, pin.state]));

  assert.equal(resolved.version, 2, "Package.resolved 必须使用当前 v2 格式");
  assert.deepEqual(Object.keys(pins).sort(), ["capacitor-swift-pm", "ion-ios-filesystem"], "依赖锁不得出现未审计的远程包");
  assert.equal(pins["capacitor-swift-pm"]?.version, "8.5.0", "Capacitor SwiftPM 必须锁定 8.5.0");
  assert.equal(pins["capacitor-swift-pm"]?.revision, "4f71d0b979f2f957326f04353eca7604ee937e1e");
  assert.equal(pins["ion-ios-filesystem"]?.version, "1.1.2", "ion-ios-filesystem 必须锁定 1.1.2");
  assert.equal(pins["ion-ios-filesystem"]?.revision, "0d81e26e828ff9582807e2339112cedf2e0fab85");
  assert.match(packageManifest, /capacitor-swift-pm\.git", exact: "8\.5\.0"/, "Package.swift 不得使用漂移的 Capacitor 版本范围");
  assert.match(packageManifest, /\.package\(name: "CapacitorFilesystem", path:/);
  assert.match(packageManifest, /\.package\(name: "CapacitorPreferences", path:/);
  assert.match(packageManifest, /\.package\(name: "CapacitorShare", path:/);
});

test("iOS durable store is registered and writes atomically", async () => {
  const [project, plugin, controller, scene, storyboard] = await Promise.all([
    readFile(projectUrl, "utf8"),
    readFile(durableStoreUrl, "utf8"),
    readFile(bridgeControllerUrl, "utf8"),
    readFile(sceneDelegateUrl, "utf8"),
    readFile(mainStoryboardUrl, "utf8"),
  ]);
  assert.match(plugin, /class DurableStorePlugin: CAPPlugin, CAPBridgedPlugin/);
  assert.match(plugin, /Data\(value\.utf8\)\.write\(to: url, options: \[\.atomic\]\)/, "iOS 持久写必须原子替换");
  assert.match(plugin, /FileHandle\(forWritingTo: url\)[\s\S]*?handle\.synchronize\(\)[\s\S]*?handle\.close\(\)/, "原子替换后必须同步文件再确认保存成功");
  assert.match(plugin, /key != "\."[\s\S]*?key != "\.\."/, "文件键不得允许当前目录或上级目录穿越");
  assert.match(plugin, /"CapacitorStorage\.\\\(key\)"/, "升级清理必须使用旧 Preferences 的精确 UserDefaults 前缀");
  assert.match(plugin, /hasPrefix\("CapacitorStorage\."\)/, "只能清理旧 Preferences 命名空间");
  assert.match(plugin, /defaults\.synchronize\(\)/, "旧 UserDefaults 清理必须等待同步结果");
  assert.match(controller, /bridge\?\.registerPluginInstance\(DurableStorePlugin\(\)\)/, "自定义桥必须注册耐久插件实例");
  assert.doesNotMatch(controller, /registerPluginType/, "默认自动注册桥会忽略 registerPluginType");
  assert.match(scene, /rootViewController = MiliBridgeViewController\(\)/, "Scene 必须使用自定义桥控制器");
  assert.match(storyboard, /customClass="MiliBridgeViewController" customModule="App"/, "Storyboard 入口也必须使用自定义桥控制器");
  assert.match(project, /DurableStorePlugin\.swift in Sources/);
  assert.match(project, /MiliBridgeViewController\.swift in Sources/);
});

test("Kids-facing save, share and print actions stay behind a fresh parental gate", async () => {
  const [page, privacyPage, supportPage] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(privacyPageUrl, "utf8"),
    readFile(supportPageUrl, "utf8"),
  ]);

  assert.match(page, /globalThis\.crypto\?\.getRandomValues/, "家长题目应优先使用系统随机源");
  assert.match(page, /const makeParentChallenge = \(previous\?: ParentChallenge\)/, "答错后必须能排除上一题");
  assert.match(page, /const left = 237 \+ randomInt\(556\);[\s\S]*?const right = 24 \+ randomInt\(65\);[\s\S]*?operator: "×", answer: left \* right/, "家长验证必须使用 237–792 乘 24–88 的随机成人级题目");
  assert.match(page, /useState<ParentAction \| null>\(null\)/, "长按状态必须精确区分保存/分享与打印按钮");
  assert.match(page, /window\.setTimeout\(\(\) => \{[\s\S]*?setParentChallenge\(makeParentChallenge\(\)\);[\s\S]*?\}, 1400\)/, "系统操作前必须先持续长按");
  assert.match(page, /startParentHold\("share"\)/, "保存/分享必须进入家长门");
  assert.match(page, /startParentHold\("print"\)/, "浏览器打印也必须进入家长门");
  assert.equal((page.match(/await performPosterShare\(\)/g) ?? []).length, 1, "performPosterShare 只能由验证成功分支调用");
  assert.doesNotMatch(page, /onClick=\{performPosterShare\}/, "不得恢复绕过家长门的直接分享按钮");
  assert.match(page, /makeParentChallenge\(parentChallenge\)/, "答错后必须换一道新题，不得复用旧答案");
  assert.match(privacyPage, /<PrivacyContent\s*\/?>/, "公开 /privacy 路由必须可构建");
  assert.match(supportPage, /<h1>支持与常见问题<\/h1>/, "公开 /support 路由必须可构建");
});

test("App Store and iOS PNG assets have submission-safe dimensions and no alpha", async () => {
  const appStoreScreenshots = (await readdir(storeAssetsUrl))
    .filter((name) => /^app-store-iphone69-.*-1320x2868\.png$/.test(name))
    .sort();
  assert.equal(appStoreScreenshots.length, 5, "应提供 5 张 6.9 英寸 iPhone 商店截图");

  await Promise.all([
    assertOpaquePng(new URL("../public/app-icon-1024.png", import.meta.url), 1024, 1024, "Web/App Store 1024 图标"),
    assertOpaquePng(new URL("../public/app-icon-512.png", import.meta.url), 512, 512, "Web/Play 源 512 图标"),
    assertOpaquePng(new URL("../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", import.meta.url), 1024, 1024, "iOS AppIcon"),
    ...["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"].map((name) =>
      assertOpaquePng(new URL(`../ios/App/App/Assets.xcassets/Splash.imageset/${name}`, import.meta.url), 2732, 2732, `iOS Splash ${name}`),
    ),
    ...appStoreScreenshots.map((name) => assertOpaquePng(new URL(name, storeAssetsUrl), 1320, 2868, `App Store 截图 ${name}`)),
  ]);
});
