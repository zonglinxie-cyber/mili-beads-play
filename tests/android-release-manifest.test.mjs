import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const candidates = [
  new URL("../android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml", import.meta.url),
  new URL("../android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml", import.meta.url),
];

async function existingMergedReleaseManifest() {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next Android Gradle Plugin output location.
    }
  }
  assert.fail("找不到 release merged manifest；请先运行 ./android/gradlew -p android :app:processReleaseMainManifest");
}

test("Android release manifest stays offline, private and non-debuggable", async () => {
  const manifestUrl = await existingMergedReleaseManifest();
  const [manifest, filePaths, backupRules, extractionRules] = await Promise.all([
    readFile(manifestUrl, "utf8"),
    readFile(new URL("../android/app/src/main/res/xml/file_paths.xml", import.meta.url), "utf8"),
    readFile(new URL("../android/app/src/main/res/xml/backup_rules.xml", import.meta.url), "utf8"),
    readFile(new URL("../android/app/src/main/res/xml/data_extraction_rules.xml", import.meta.url), "utf8"),
  ]);
  const application = manifest.match(/<application\b[\s\S]*?>/)?.[0];

  assert.ok(application, "release manifest 必须包含 application 节点");
  assert.match(manifest, /android:targetSdkVersion="36"/, "release 必须 target Android API 36");
  assert.doesNotMatch(manifest, /<uses-permission\b[^>]*android:name="android\.permission\.INTERNET"/, "离线儿童应用不得声明 INTERNET 权限");
  assert.match(application, /android:usesCleartextTraffic="false"/, "release 必须禁用明文网络流量");
  assert.match(application, /android:allowBackup="false"/, "本地儿童进度不得进入 Android 自动备份");
  assert.match(application, /android:dataExtractionRules="@xml\/data_extraction_rules"/, "Android 12+ 必须显式禁用云备份和设备迁移");
  assert.match(application, /android:fullBackupContent="@xml\/backup_rules"/, "Android 11 及以下必须显式排除全部本地数据");
  assert.doesNotMatch(application, /android:debuggable="true"/, "release 构建不得开启 debuggable");
  assert.match(backupRules, /<exclude domain="sharedpref" path="\."\s*\/>/, "旧版备份规则必须排除 WebView/SharedPreferences 进度");
  assert.match(extractionRules, /<cloud-backup[\s\S]*?<exclude domain="sharedpref" path="\."\s*\/>/, "云备份必须排除本地进度");
  assert.match(extractionRules, /<device-transfer>[\s\S]*?<exclude domain="device_sharedpref" path="\."\s*\/>/, "设备迁移必须排除本地进度");
  assert.match(filePaths, /<cache-path\b/, "分享文件只允许来自应用缓存目录");
  assert.doesNotMatch(filePaths, /<external-(?:path|files-path)\b/, "FileProvider 不得暴露外部存储目录");
});

test("Android durable store acknowledges synchronous disk commits", async () => {
  const [plugin, activity] = await Promise.all([
    readFile(new URL("../android/app/src/main/java/family/mili/beads/DurableStorePlugin.java", import.meta.url), "utf8"),
    readFile(new URL("../android/app/src/main/java/family/mili/beads/MainActivity.java", import.meta.url), "utf8"),
  ]);
  assert.match(plugin, /@CapacitorPlugin\(name = "DurableStore"\)/);
  assert.equal((plugin.match(/\.commit\(\)/g) ?? []).length, 3, "新存档 set/remove 与旧命名空间清理都必须同步 commit");
  assert.doesNotMatch(plugin, /\.apply\(\)/, "耐久桥不得用异步 SharedPreferences.apply");
  assert.match(plugin, /if \(!preferences\(\)\.edit\(\)\.putString\(key, value\)\.commit\(\)\)/, "set 失败必须 reject");
  assert.match(plugin, /if \(!preferences\(\)\.edit\(\)\.remove\(key\)\.commit\(\)\)/, "remove 失败必须 reject");
  assert.match(plugin, /getSharedPreferences\(LEGACY_GROUP, Activity\.MODE_PRIVATE\)/, "升级清理必须读取旧 CapacitorStorage 命名空间");
  assert.match(plugin, /if \(!legacyPreferences\(\)\.edit\(\)\.clear\(\)\.commit\(\)\)/, "旧命名空间清理也必须同步 commit");
  assert.match(activity, /registerPlugin\(DurableStorePlugin\.class\);[\s\S]*?super\.onCreate\(savedInstanceState\);/, "MainActivity 必须在桥初始化前注册插件");
});
