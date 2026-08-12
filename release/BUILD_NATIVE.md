# 原生包构建与验证

## 交付产物

- `artifacts/mili-beads-android-test.apk`：已使用 Android Debug 证书签名，可直接安装测试。
- `artifacts/mili-beads-android-release-unsigned.aab`：Google Play 提交格式，需用开发者自己的 upload key 完成正式签名。
- `artifacts/mili-beads-ios-project.zip`：已经内置离线游戏资源的 Xcode 工程。

## 已验证

- 应用 ID：`family.mili.beads`
- 版本：`1.0 (1)`
- Android：`minSdk 24`，`targetSdk 36`
- Android Debug APK 与 unsigned Release AAB 已构建；下方 SHA-256 对应当前交付产物。
- Android 15 / 1080 × 2400 模拟器曾完成安装、冷启动和单颗触控放豆人工检查。
- 当前火箭背包橘猫图纸含 170 颗；完整 170 颗完成、庆祝、分层动画、1200×1500 高清图下载、刷新恢复及旧版本存档迁移链路已由 390 × 844 移动端 E2E 自动化走通。
- Android 原生游戏 HTML、JavaScript 与 CSS 已内置于安装包；release merged manifest 无 `INTERNET` 权限、禁用明文流量和系统自动备份，并由 Node 测试检查。
- Android 设备烟雾测试已在 Android 15 `mili_phone` 模拟器运行 2/2 通过：校验包名，并真实启动 `MainActivity`、确认 Capacitor WebView 可见。
- Android 最终 APK 已验证放置 1 颗后强杀冷启动，重新进入同一图纸仍为 `1/170`；1200×1500 PNG 可真实调起系统分享面板并提供 Print / Drive 等目标。
- Android / iOS 原生安装图标与启动页均已替换为米粒宇航橘猫品牌素材，并由确定性生成门禁阻止 Capacitor 模板素材回归。
- iOS `Info.plist` 和 `PrivacyInfo.xcprivacy` 已完成格式检查；iOS 真机 Archive 与端到端验证仍待开发者账户环境完成。

## 本机重新构建

```bash
npm install
npm run native:build

export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
./android/gradlew -p android assembleDebug bundleRelease lintDebug testDebugUnitTest
./android/gradlew -p android :app:connectedDebugAndroidTest
node --test tests/android-release-manifest.test.mjs
```

`testDebugUnitTest` 当前只覆盖本地 JVM 基础测试，不等同于应用交互验收；原生启动以 `:app:connectedDebugAndroidTest` 为准。不要调用未限定模块的 `connectedDebugAndroidTest`，它还会构建 Capacitor 库模块自身的空测试包，与应用验收无关。

网页端 1200 × 1500 PNG 的生成与下载已由 E2E 验证。原生端使用系统“保存或分享”面板，不再声称提供未验证的 WebView 直接打印；Android 系统分享面板与 iOS 真机落地状态以 `RELEASE_CHECKLIST.md` 为准。

Android 商店正式签名和 iOS Archive 必须在开发者自己的 Google Play / Apple Developer 账户下完成，不能用临时证书代替。

## SHA-256

- Android APK: `355d6fc6e7f416e90040721ca409484eadd85e86b1a40cab571b32c654c48537`
- Android AAB: `b7ad29895220898b87a464146b86ca1c5bffaedb27301744c4ebdf8e8c71e027`
- iOS project: `81e79afa33a29c0dd22a5a29715e1c97b5a141a746e9e6664abba1c4fc9b25fc`
