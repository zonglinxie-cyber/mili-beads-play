# 原生包构建与验证

## 交付产物

- `artifacts/mili-beads-android-test.apk`：已使用 Android Debug 证书签名，可直接安装测试。
- `artifacts/mili-beads-android-release-unsigned.aab`：Google Play 提交格式，需用开发者自己的 upload key 完成正式签名。
- `artifacts/mili-beads-ios-project.zip`：已经内置离线游戏资源的 Xcode 工程。

## 已验证

- 应用 ID：`family.mili.beads`
- 版本：`1.0 (1)`
- Android：`minSdk 24`，`targetSdk 36`
- Android Gradle `assembleDebug`、`bundleRelease`、`lintDebug`、`testDebugUnitTest` 通过。
- Android 15 / 1080 × 2400 模拟真机安装和冷启动通过。
- 首页、完整宇航员小猫图纸和触控放豆通过；进度由 `0/170` 正确更新到 `1/170`。
- 原生游戏资源完全内置，无网络也能运行。
- iOS `Info.plist` 和 `PrivacyInfo.xcprivacy` 格式验证通过。

## 本机重新构建

```bash
npm install
npm run native:build

export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
./android/gradlew -p android assembleDebug bundleRelease lintDebug testDebugUnitTest
```

Android 商店正式签名和 iOS Archive 必须在开发者自己的 Google Play / Apple Developer 账户下完成，不能用临时证书代替。

## SHA-256

- Android APK: `425db3753d22a2fdc8636d1b894c7af5e765e72471c2fb406ab43c26b4944f1d`
- Android AAB: `5f4d9c4c6f3d7f05ba03f38940dc2ec8fba9b4e9389c11587de050393db808d7`
- iOS project: `34d743fbf84ce9a17db60fe0b3e8082094a0128cc1aa915c333771b7c8d9b7e2`
