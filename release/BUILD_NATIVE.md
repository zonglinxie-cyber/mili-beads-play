# 原生包构建与验证

## 交付产物

- `artifacts/mili-beads-android-test.apk`：已使用 Android Debug 证书签名，可直接安装测试。
- `artifacts/mili-beads-android-release-unsigned.aab`：当前零签名环境变量构建出的本地候选包，**明确为 unsigned，不能上传 Google Play**。
- 四项 `MILI_ANDROID_*` 环境变量全部提供后，Gradle 才会用开发者自己的 upload key 签名 Release AAB；密钥和密码不进入仓库。
- `artifacts/mili-beads-ios-project.zip`：已经内置离线游戏资源的 Xcode 工程。

## 已验证

- 应用 ID：`family.mili.beads`
- 版本：`1.0 (1)`
- Android：`minSdk 24`，`targetSdk 36`
- Android Debug APK 与 unsigned Release AAB 已构建；下方 SHA-256 对应当前交付产物。
- Android 15 / 1080 × 2400 模拟器曾完成安装、冷启动和单颗触控放豆人工检查。
- 当前火箭背包橘猫图纸含 170 颗；完整 170 颗完成、庆祝、分层动画、1200×1500 高清图下载、刷新恢复及旧版本存档迁移链路已由 390 × 844 移动端 E2E 自动化走通。
- Android 原生游戏 HTML、JavaScript 与 CSS 已内置于安装包；release merged manifest 无 `INTERNET` 权限、禁用明文流量和系统自动备份，并由 Node 测试检查。
- Android 设备烟雾测试已在 Android 15 `mili_phone` 模拟器运行 3/3 通过：校验包名，真实启动 `MainActivity`、确认 Capacitor WebView 可见，并直接检查 DurableStore 同步写入与旧存储清理。
- Android 最终 Debug APK 已在 Android 15 模拟器完成同哈希原生验收：3 轮“DurableStore 原生写入返回后立即强杀”均恢复 `1/170`、分区 `1/2`、墨黑 `1/37`；v3/v2 旧存档迁移、旧 tombstone、新 tombstone 落盘后强杀、界面清空确认后强杀均未复活旧记录。
- 同一 APK 已通过家长门、Android 系统 Sharesheet、FileProvider 与实际 1200×1500 PNG 校验，并完成 `:app:connectedDebugAndroidTest` 3/3。完整证据见 `native-verification-v11/final-durable-store/VERDICT.md`。
- 原生进度通过应用自有 DurableStore 桥耐久保存：Android SharedPreferences 使用同步 `commit()`，iOS 使用 Application Support 中的原子文件替换并同步文件；每颗豆子在原生写入确认后才显示完成。
- 原生冷启动恢复期间会锁定游戏写入；读取失败不会用空记录覆盖原存档，损坏存档会按旧原生 v3、旧原生 v2、本地副本的顺序修复。首次迁移完成后会耐久清理旧 `CapacitorStorage` 命名空间并写入迁移标记。
- 清除记录与放豆写入共用串行队列；删除前先把 tombstone 写入 DurableStore 并等待落盘确认，冷启动优先读取该标记。清除结束前再写入不含作品数据的空快照并清理新旧存储，避免旧副本在强杀后复活。
- Android / iOS 原生安装图标与启动页均已替换为米粒宇航橘猫品牌素材，并由确定性生成门禁阻止 Capacitor 模板素材回归。
- iOS `Info.plist` 和 `PrivacyInfo.xcprivacy` 已完成格式检查；iOS 真机 Archive 与端到端验证仍待开发者账户环境完成。

## 本机重新构建

```bash
npm install
npm run native:build

export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
./android/gradlew -p android assembleDebug bundleUnsignedReleaseCandidate lintDebug testDebugUnitTest
./android/gradlew -p android :app:connectedDebugAndroidTest
node --test tests/android-release-manifest.test.mjs tests/android-release-signing.test.mjs
```

`testDebugUnitTest` 校验正式包名和版本，但不等同于应用交互验收；原生启动以 `:app:connectedDebugAndroidTest` 为准。不要调用未限定模块的 `connectedDebugAndroidTest`，它还会构建 Capacitor 库模块自身的空测试包，与应用验收无关。

网页端 1200 × 1500 PNG 的生成与下载已由 E2E 验证。原生端使用系统“保存或分享”面板，不再声称提供未验证的 WebView 直接打印；Android 系统分享面板与 iOS 真机落地状态以 `RELEASE_CHECKLIST.md` 为准。

## Android Release 签名接线

Gradle 只接受下面四项环境变量；**四项齐全才启用签名，四项全部未设置才允许生成 unsigned 本地候选，设置一部分会立即失败**：

| 环境变量 | 内容 |
|---|---|
| `MILI_ANDROID_KEYSTORE` | 开发者 upload keystore 的绝对路径；文件应存放在仓库外 |
| `MILI_ANDROID_KEYSTORE_PASSWORD` | keystore 密码 |
| `MILI_ANDROID_KEY_ALIAS` | upload key alias |
| `MILI_ANDROID_KEY_PASSWORD` | upload key 密码 |

先只检查当前状态，不打印任何秘密：

```bash
./android/gradlew -p android :app:releaseSigningStatus
```

无变量时预期输出：

```text
Android release signing: DISABLED. bundleRelease will produce an unsigned local candidate; it is not upload-ready.
```

零变量下使用显式任务生成本地候选：

```bash
./android/gradlew -p android :app:releaseSigningStatus :app:bundleUnsignedReleaseCandidate
```

产物为 `android/app/build/outputs/unsigned-release-candidate/mili-beads-android-release-unsigned.aab`。标准 Gradle 中间产物 `outputs/bundle/release/app-release.aab` 同样未签名，但不得复制到上架目录或上传；只把带 `-unsigned` 的文件视为本地候选。

正式签名构建示例（占位符必须由账号持有人在本机 shell / CI secret store 中替换，**不要写进 `.env`、`gradle.properties`、脚本或文档**）：

```bash
export MILI_ANDROID_KEYSTORE="/absolute/path/outside-repo/upload-keystore.jks"
export MILI_ANDROID_KEYSTORE_PASSWORD="<secret>"
export MILI_ANDROID_KEY_ALIAS="<upload-key-alias>"
export MILI_ANDROID_KEY_PASSWORD="<secret>"

./android/gradlew -p android :app:releaseSigningStatus :app:bundleRelease
```

四项齐全时状态应为 `ENABLED`。构建后必须在 Play Console App Bundle Explorer 核对上传证书、包名、versionCode 和 target API；本地“构建成功”不等于商店已经接受。可用 `jarsigner -verify` 做附加本地检查，但最终签名身份仍以开发者账号后台为准。

`MILI_ANDROID_KEYSTORE` 必须是仓库外现有文件的绝对路径。相对路径或仓库内路径会直接失败；`.gitignore` 同时拒绝常见 `.jks`、`.keystore`、`.p12`、`.pfx` 密钥容器，但 ignore 不是密钥管理系统，仍应使用本机受限目录或 CI secret store。

不要生成临时 keystore 冒充正式 upload key。Android 商店正式签名和 iOS Archive 必须在开发者自己的 Google Play / Apple Developer 账户下完成，不能用临时证书代替。

## SHA-256

- Android Debug APK: `f8071bc688dea51e0c08d86d42fed25ae20157c9211b7298d4bbd2004e702d90`
- Android unsigned AAB: `48b82117f1e5c96865c4a26443e093b4d72418e4fd20bcec0a9c16151e5d7b6c`
- iOS project ZIP: `3e82eb29d24ab67574bba5aa9c429e057a015c22f6dcc0bdbaf54f1843752f69`
