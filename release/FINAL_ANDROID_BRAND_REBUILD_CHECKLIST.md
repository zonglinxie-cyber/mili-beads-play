# Android 品牌资产替换后的最终重建与复验命令

> 当前仅保存命令，**品牌资源未冻结前不要执行**。首次安装步骤会卸载模拟器里的测试包并清除其本机进度，只能对 `mili_phone` 测试模拟器执行。

## 0. 固定环境与输出目录

```bash
set -euo pipefail
cd "/Users/derekfly3/Documents/ChatGPT/米粒的拼豆助手"

export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

ANDROID_ADB="$ANDROID_HOME/platform-tools/adb"
ANDROID_AAPT="$ANDROID_HOME/build-tools/36.0.0/aapt2"
ANDROID_APKANALYZER="$ANDROID_HOME/cmdline-tools/latest/bin/apkanalyzer"
ANDROID_SERIAL="emulator-5554"
ANDROID_PACKAGE="family.mili.beads"
VERIFY_OUT="release/native-verification-brand-final"
mkdir -p "$VERIFY_OUT" "$VERIFY_OUT/splash-frames"

"$ANDROID_ADB" devices -l | tee "$VERIFY_OUT/00-devices.txt"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell getprop ro.build.version.release | tee "$VERIFY_OUT/00-android-version.txt"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell getprop ro.build.version.sdk | tee "$VERIFY_OUT/00-api-level.txt"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell wm size | tee "$VERIFY_OUT/00-display-size.txt"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell wm density | tee "$VERIFY_OUT/00-display-density.txt"
```

预期：Android 15 / API 35，物理显示 1080×2400。

为后续点击提供一个按可见文字或无障碍标签定位的帮助函数：

```bash
dump_ui() {
  local name="$1"
  "$ANDROID_ADB" -s "$ANDROID_SERIAL" shell uiautomator dump /sdcard/mili-window.xml >/dev/null
  "$ANDROID_ADB" -s "$ANDROID_SERIAL" pull /sdcard/mili-window.xml "$VERIFY_OUT/$name.xml" >/dev/null
}

tap_label() {
  local label="$1"
  dump_ui current-ui
  local point
  point=$(LABEL="$label" perl -0777 -ne '
    $l=$ENV{"LABEL"};
    if (/(?:text|content-desc)="\Q$l\E"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/) {
      print int(($1+$3)/2), " ", int(($2+$4)/2);
    }
  ' "$VERIFY_OUT/current-ui.xml")
  test -n "$point" || { echo "找不到可见控件：$label" >&2; return 1; }
  "$ANDROID_ADB" -s "$ANDROID_SERIAL" shell input tap $point
}
```

## 1. 品牌资源冻结取证

```bash
shasum -a 256 \
  public/app-icon-1024.png \
  ios/App/App/Assets.xcassets/AppIcon.appiconset/* \
  android/app/src/main/res/mipmap-*/ic_launcher*.png \
  android/app/src/main/res/mipmap-anydpi-v26/*.xml \
  android/app/src/main/res/drawable*/splash.png \
  android/app/src/main/res/values/ic_launcher_background.xml \
  android/app/src/main/res/values/styles.xml \
  | tee "$VERIFY_OUT/01-brand-source-sha256.txt"

git status --short | tee "$VERIFY_OUT/01-git-status-before-build.txt"
```

人工检查：图标前景没有贴边；自适应图标安全区内主体不被圆形遮罩裁切；竖屏启动图为当前品牌，不含旧模板或 ChatGPT 标志。

## 2. 唯一一次 Native 同步与干净重建

```bash
npm ci
npm run build 2>&1 | tee "$VERIFY_OUT/02-web-build.log"
npm run lint 2>&1 | tee "$VERIFY_OUT/02-lint.log"
npm test 2>&1 | tee "$VERIFY_OUT/02-tests.log"

# 品牌资源冻结后，本轮只执行这一次 cap sync。
npm run native:build 2>&1 | tee "$VERIFY_OUT/02-native-build-and-sync.log"

./android/gradlew -p android clean assembleDebug bundleRelease lintDebug testDebugUnitTest \
  2>&1 | tee "$VERIFY_OUT/02-android-clean-build.log"

shasum -a 256 \
  android/app/build/outputs/apk/debug/app-debug.apk \
  android/app/build/outputs/bundle/release/app-release.aab \
  | tee "$VERIFY_OUT/02-package-sha256.txt"
```

预期：所有命令退出码为 0；Debug APK 和 Release AAB 均重新生成。

## 3. 核对 APK 身份、Manifest 与内置 Web 资源

```bash
"$ANDROID_AAPT" dump badging android/app/build/outputs/apk/debug/app-debug.apk \
  | tee "$VERIFY_OUT/03-apk-badging.txt"

"$ANDROID_APKANALYZER" manifest print android/app/build/outputs/apk/debug/app-debug.apk \
  | tee "$VERIFY_OUT/03-apk-manifest.xml"

rg -n 'package="family.mili.beads"|android:label="米粒拼豆社"|android:icon|android:roundIcon|uses-sdk|INTERNET' \
  "$VERIFY_OUT/03-apk-manifest.xml" | tee "$VERIFY_OUT/03-manifest-key-lines.txt"

APK_TMP=$(mktemp -d)
unzip -qq android/app/build/outputs/apk/debug/app-debug.apk 'assets/public/*' -d "$APK_TMP"
{
  echo 'native-web'
  shasum -a 256 native-web/index.html native-web/assets/*
  echo 'apk-assets-public'
  shasum -a 256 "$APK_TMP"/assets/public/index.html "$APK_TMP"/assets/public/assets/*
} | tee "$VERIFY_OUT/03-apk-native-web-match.txt"

unzip -l android/app/build/outputs/apk/debug/app-debug.apk \
  | rg 'mipmap|splash|ic_launcher|assets/public' \
  | tee "$VERIFY_OUT/03-packaged-brand-and-web-files.txt"
```

通过条件：包名 `family.mili.beads`、名称“米粒拼豆社”、target SDK 36、无 `INTERNET` 权限；APK 内 `assets/public` 与 `native-web` 对应文件哈希逐项相同。

## 4. 全新安装与 Launcher 图标视觉取证

此步骤会清除模拟器中旧测试进度：

```bash
"$ANDROID_ADB" -s "$ANDROID_SERIAL" uninstall "$ANDROID_PACKAGE" || true
"$ANDROID_ADB" -s "$ANDROID_SERIAL" install android/app/build/outputs/apk/debug/app-debug.apk \
  2>&1 | tee "$VERIFY_OUT/04-fresh-install.txt"

"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am start -a android.intent.action.MAIN -c android.intent.category.HOME
sleep 2
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell input swipe 540 2250 540 400 700
sleep 2
dump_ui 04-launcher-app-drawer
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/04-launcher-icon.png"
rg -n '米粒拼豆社' "$VERIFY_OUT/04-launcher-app-drawer.xml" \
  | tee "$VERIFY_OUT/04-launcher-label-node.txt"
```

若首屏没有该图标，继续在应用抽屉内滚动，直到 `dump_ui` 能找到“米粒拼豆社”再截图；禁止用旧截图代替。人工检查截图：图标是最终品牌；圆形遮罩无裁切、无白边、无旧图标；应用名完整可读。

## 5. Splash 启动视觉取证

从 Launcher 图标真实启动并录制 8 秒，再生成逐帧联系表：

```bash
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am force-stop "$ANDROID_PACKAGE"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am start -a android.intent.action.MAIN -c android.intent.category.HOME
sleep 2
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell input swipe 540 2250 540 400 700
sleep 2

"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell screenrecord --time-limit 8 /sdcard/mili-brand-launch.mp4 >/dev/null 2>&1 &
SCREENRECORD_PID=$!
sleep 1
tap_label "米粒拼豆社"
wait "$SCREENRECORD_PID"

"$ANDROID_ADB" -s "$ANDROID_SERIAL" pull /sdcard/mili-brand-launch.mp4 "$VERIFY_OUT/05-brand-launch.mp4"
ffmpeg -y -i "$VERIFY_OUT/05-brand-launch.mp4" -vf 'fps=20,scale=540:-2' \
  "$VERIFY_OUT/splash-frames/frame-%03d.png" 2> "$VERIFY_OUT/05-ffmpeg-frames.log"
ffmpeg -y -i "$VERIFY_OUT/05-brand-launch.mp4" -vf 'fps=8,scale=270:-2,tile=4x4' \
  -frames:v 1 "$VERIFY_OUT/05-splash-contact-sheet.png" 2> "$VERIFY_OUT/05-ffmpeg-contact-sheet.log"
```

人工检查 `05-splash-contact-sheet.png` 和起始帧：品牌启动图没有拉伸、裁切、白闪、黑闪或旧模板；从 Splash 到首页背景过渡自然。保留至少一张清晰 Splash 帧作为商店审核证据。

## 6. Android 15 离线冷启动

```bash
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell settings put global airplane_mode_on 1
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell svc wifi disable
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell svc data disable
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am force-stop "$ANDROID_PACKAGE"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" logcat -c

"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am start -W -S -n "$ANDROID_PACKAGE/.MainActivity" \
  | tee "$VERIFY_OUT/06-offline-cold-start.txt"
sleep 7
dump_ui 06-offline-home
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/06-offline-home.png"
{
  echo "airplane_mode_on=$("$ANDROID_ADB" -s "$ANDROID_SERIAL" shell settings get global airplane_mode_on | tr -d '\r')"
  echo "wifi_on=$("$ANDROID_ADB" -s "$ANDROID_SERIAL" shell settings get global wifi_on | tr -d '\r')"
  "$ANDROID_ADB" -s "$ANDROID_SERIAL" shell dumpsys activity activities | rg -m1 'topResumedActivity'
  rg -o 'text="[^"]+"|content-desc="[^"]+"' "$VERIFY_OUT/06-offline-home.xml" | head -30
} | tee -a "$VERIFY_OUT/06-offline-cold-start.txt"
```

通过条件：`LaunchState: COLD`，Top activity 为 `family.mili.beads/.MainActivity`，首页完整出现并可点击“开始挑战”。

## 7. 内置家长与隐私说明

```bash
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell input swipe 540 2050 540 450 900
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell input swipe 540 2050 540 450 900
sleep 2
tap_label "家长与隐私说明"
sleep 2
dump_ui 07-parent-privacy
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/07-parent-privacy.png"
rg -o 'text="[^"]+"|content-desc="[^"]+"' "$VERIFY_OUT/07-parent-privacy.xml" \
  | head -100 | tee "$VERIFY_OUT/07-parent-privacy-visible.txt"
```

通过条件：仍在 `family.mili.beads/.MainActivity`；弹窗包含“家长与隐私说明”、本机保存、不收集数据、删除方式与成人熨烫提示，不打开浏览器或线上 URL。

## 8. 打印图与 Android 系统分享面板

```bash
tap_label "← 返回游戏"
sleep 2
tap_label "开始挑战 →"
sleep 2
tap_label "生成打印图"
sleep 3
dump_ui 08-print-preview
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/08-print-preview.png"
rg -o 'text="高清 PNG · 1200×1500"|text="保存或分享"' "$VERIFY_OUT/08-print-preview.xml" \
  | tee "$VERIFY_OUT/08-print-preview-assertions.txt"

"$ANDROID_ADB" -s "$ANDROID_SERIAL" logcat -c
tap_label "保存或分享"
sleep 4
dump_ui 08-android-sharesheet
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/08-android-sharesheet.png"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell dumpsys activity activities \
  | rg -n 'ChooserActivity|android.intent.action.CHOOSER|content://family.mili.beads.fileprovider|readUriPermissions' \
  | tee "$VERIFY_OUT/08-share-activity.txt"
rg -o 'text="[^"]+"|content-desc="[^"]+"' "$VERIFY_OUT/08-android-sharesheet.xml" \
  | head -100 | tee "$VERIFY_OUT/08-sharesheet-visible.txt"

# Debug 包可额外核对实际生成 PNG 尺寸。
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out run-as "$ANDROID_PACKAGE" sh -c 'cat cache/*.png' \
  > "$VERIFY_OUT/08-shared-print.png"
sips -g pixelWidth -g pixelHeight "$VERIFY_OUT/08-shared-print.png" \
  | tee "$VERIFY_OUT/08-shared-print-dimensions.txt"
```

通过条件：预览全图和色号清单完整；只有一个原生“保存或分享”按钮；系统 Chooser 显示图片缩略图、Quick Share / Print / Drive 等目标；URI authority 为 `family.mili.beads.fileprovider`；PNG 为 1200×1500。

## 9. 单颗进度跨强杀冷启恢复

先返回应用并清数据，按严格固定路径执行：

```bash
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell input keyevent 4
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell pm clear "$ANDROID_PACKAGE"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am start -W -S -n "$ANDROID_PACKAGE/.MainActivity" \
  | tee "$VERIFY_OUT/09-persistence-fresh-start.txt"
sleep 7

tap_label "开始挑战 →"
sleep 3
tap_label "开始拼 ↓"
sleep 3
tap_label "第5行第6格，墨黑"
sleep 3
dump_ui 09-one-bead-before-restart
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/09-one-bead-before-restart.png"
rg -o 'text="1/170 颗 · 错误 0"|text="1/2 颗"|text="墨黑 1/37"' \
  "$VERIFY_OUT/09-one-bead-before-restart.xml" | tee "$VERIFY_OUT/09-counts-before-restart.txt"

"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am force-stop "$ANDROID_PACKAGE"
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell am start -W -S -n "$ANDROID_PACKAGE/.MainActivity" \
  | tee "$VERIFY_OUT/09-persistence-cold-restart.txt"
sleep 7
tap_label "开始挑战 →"
sleep 3
dump_ui 09-one-bead-restored
"$ANDROID_ADB" -s "$ANDROID_SERIAL" exec-out screencap -p > "$VERIFY_OUT/09-one-bead-restored.png"
rg -o 'text="1/170 颗 · 错误 0"|text="1/2 颗"|text="墨黑 1/37"' \
  "$VERIFY_OUT/09-one-bead-restored.xml" | tee "$VERIFY_OUT/09-counts-restored.txt"
```

通过条件：重启前后均必须同时得到三行：`1/170`、`1/2`、`墨黑 1/37`。不要在 WebView 尚未生成可访问性树时使用固定坐标；否则会产生之前的假阴性。

## 10. 应用模块 Instrumentation 3/3

只运行 `:app` 模块；不要调用聚合 `connectedDebugAndroidTest`，后者会误跑 Capacitor 库的空测试包并触发第三方 Kotlin 重复类问题。

```bash
./android/gradlew -p android :app:connectedDebugAndroidTest \
  2>&1 | tee "$VERIFY_OUT/10-app-instrumentation.log"

cp 'android/app/build/outputs/androidTest-results/connected/debug/TEST-mili_phone(AVD) - 15-_app-.xml' \
  "$VERIFY_OUT/10-app-instrumentation-results.xml"

rg -n 'testsuite|testcase' "$VERIFY_OUT/10-app-instrumentation-results.xml" \
  | tee "$VERIFY_OUT/10-app-instrumentation-summary.txt"
```

通过条件：`tests="2" failures="0" errors="0"`；两项分别为正式包名校验和 `MainActivity` / Capacitor WebView 可见。

## 11. 恢复测试环境并收口

```bash
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell settings put global airplane_mode_on 0
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell svc wifi enable
"$ANDROID_ADB" -s "$ANDROID_SERIAL" shell svc data enable
{
  echo "airplane_mode_on=$("$ANDROID_ADB" -s "$ANDROID_SERIAL" shell settings get global airplane_mode_on | tr -d '\r')"
  echo "wifi_on=$("$ANDROID_ADB" -s "$ANDROID_SERIAL" shell settings get global wifi_on | tr -d '\r')"
} | tee "$VERIFY_OUT/11-environment-restored.txt"

git status --short | tee "$VERIFY_OUT/11-git-status-after-verification.txt"
```

最终结论必须列出：最终源码/品牌资源/APK/AAB SHA-256、Launcher 截图、Splash 帧、离线冷启、内置隐私、PNG 尺寸与 Sharesheet、进度恢复三项计数、Instrumentation 3/3；任何缺失项标为“未验证”，不能凭代码存在声称通过。
