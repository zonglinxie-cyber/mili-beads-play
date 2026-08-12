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
  const [manifest, filePaths] = await Promise.all([
    readFile(manifestUrl, "utf8"),
    readFile(new URL("../android/app/src/main/res/xml/file_paths.xml", import.meta.url), "utf8"),
  ]);
  const application = manifest.match(/<application\b[\s\S]*?>/)?.[0];

  assert.ok(application, "release manifest 必须包含 application 节点");
  assert.match(manifest, /android:targetSdkVersion="36"/, "release 必须 target Android API 36");
  assert.doesNotMatch(manifest, /<uses-permission\b[^>]*android:name="android\.permission\.INTERNET"/, "离线儿童应用不得声明 INTERNET 权限");
  assert.match(application, /android:usesCleartextTraffic="false"/, "release 必须禁用明文网络流量");
  assert.match(application, /android:allowBackup="false"/, "本地儿童进度不得进入 Android 自动备份");
  assert.doesNotMatch(application, /android:debuggable="true"/, "release 构建不得开启 debuggable");
  assert.match(filePaths, /<cache-path\b/, "分享文件只允许来自应用缓存目录");
  assert.doesNotMatch(filePaths, /<external-(?:path|files-path)\b/, "FileProvider 不得暴露外部存储目录");
});
