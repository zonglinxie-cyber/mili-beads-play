# 米粒拼豆社

一款为 9 岁儿童设计的无账号、无广告、离线优先拼豆游戏。支持 Web/PWA、Android 和 iOS 原生容器。

## 产品原则

- 不登录，进度只在本机保存。
- 拼制界面使用放大分区，保留完整图纸作为参照。
- 图纸必须通过尺寸、颗数、实际用色和实物连通性校验。
- 熨烫和裁剪必须由成年人完成。
- 系统保存、分享和打印属于家长操作，必须通过每次随机家长验证。

## 开发命令

```bash
npm install
npm run dev
npm run lint
npm test
npm run native:build
```

Android 设备烟雾测试：

```bash
cd android
./gradlew :app:connectedDebugAndroidTest
```

## 发行状态

当前是提交前候选工程，不是已上架成品。开发者主体、持续监控的支持邮箱、正式签名、控制台声明、iOS 26 构建和真实 iPhone 截图等外部待办见 `release/RELEASE_CHECKLIST.md`；这些门槛未完成前不得声称“可直接提交商店”。

iOS `PrivacyInfo.xcprivacy` 当前声明零收集、零追踪，并按实际依赖列出 UserDefaults `CA92.1` 与文件时间戳 `C617.1`。最终 Archive 后仍须用 Xcode 隐私报告复核。
