import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const buildGradleUrl = new URL("../android/app/build.gradle", import.meta.url);
const gitignoreUrl = new URL("../.gitignore", import.meta.url);

test("Android release signing uses four environment variables and no checked-in secrets", async () => {
  const buildGradle = await readFile(buildGradleUrl, "utf8");
  const expectedVariables = [
    "MILI_ANDROID_KEYSTORE",
    "MILI_ANDROID_KEYSTORE_PASSWORD",
    "MILI_ANDROID_KEY_ALIAS",
    "MILI_ANDROID_KEY_PASSWORD",
  ];

  for (const variable of expectedVariables) {
    assert.match(buildGradle, new RegExp(`['"]${variable}['"]`), `${variable} 必须从环境变量接入`);
  }
  assert.equal(new Set(buildGradle.match(/MILI_ANDROID_[A-Z_]+/g) ?? []).size, 4, "签名入口必须恰好使用四个文档化环境变量");
  assert.match(buildGradle, /System\.getenv\(environmentName\)/, "签名值必须来自进程环境，而不是 Gradle 属性文件");
  assert.doesNotMatch(buildGradle, /System\.getenv\(environmentName\)\?\.trim\(\)/, "不得 trim 或改写密码环境变量");
  assert.doesNotMatch(buildGradle, /storePassword\s+["'][^"']+["']/, "不得在 build.gradle 写入 store password 字面量");
  assert.doesNotMatch(buildGradle, /keyPassword\s+["'][^"']+["']/, "不得在 build.gradle 写入 key password 字面量");
});

test("Android release signing is all-or-none and keeps the zero-variable unsigned fallback", async () => {
  const buildGradle = await readFile(buildGradleUrl, "utf8");

  assert.match(buildGradle, /configuredReleaseSigningVariables && configuredReleaseSigningVariables\.size\(\) != releaseSigningEnvironment\.size\(\)/, "签名环境半配置必须直接失败");
  assert.match(buildGradle, /throw new GradleException\("Android release signing is only partially configured\./, "半配置错误必须清晰可诊断");
  assert.match(buildGradle, /def releaseSigningEnabled = configuredReleaseSigningVariables\.size\(\) == releaseSigningEnvironment\.size\(\)/, "仅四项齐全时才可启用签名");
  assert.match(buildGradle, /if \(releaseSigningEnabled\) \{\s*signingConfig signingConfigs\.release\s*\}/s, "release build 只能在四项齐全时绑定签名配置");
  assert.match(buildGradle, /bundleRelease will produce an unsigned local candidate; it is not upload-ready/, "零配置回退必须明确标注 unsigned 且不可上传");
  assert.match(buildGradle, /releaseKeystore\.isFile\(\)/, "启用签名前必须验证 keystore 路径指向文件");
  assert.match(buildGradle, /!new File\(releaseSigningValues\.storeFile\)\.isAbsolute\(\)/, "keystore 必须使用绝对路径");
  assert.match(buildGradle, /releaseKeystore\.toPath\(\)\.startsWith\(repositoryRoot\.toPath\(\)\)/, "keystore 必须位于仓库外");
  assert.match(buildGradle, /tasks\.register\('bundleUnsignedReleaseCandidate', Copy\)/, "unsigned 回退必须提供显式命名的候选包任务");
  assert.match(buildGradle, /mili-beads-android-release-unsigned\.aab/, "unsigned 候选包文件名必须明确标注 unsigned");
});

test("common Android key container formats are ignored by git", async () => {
  const gitignore = await readFile(gitignoreUrl, "utf8");
  for (const pattern of ["*.jks", "*.keystore", "*.p12", "*.pfx"]) {
    assert.ok(gitignore.split(/\r?\n/).includes(pattern), `${pattern} 必须在 .gitignore 中`);
  }
});
