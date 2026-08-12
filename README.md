# 米粒拼豆社

一款为 9 岁儿童设计的无账号、无广告、离线优先拼豆游戏。支持 Web/PWA、Android 和 iOS 原生容器。

## 产品原则

- 不登录，进度只在本机保存。
- 拼制界面使用放大分区，保留完整图纸作为参照。
- 图纸必须通过尺寸、颗数、实际用色和实物连通性校验。
- 熨烫和裁剪必须由成年人完成。

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

开发者账户、正式签名、商店数据声明和上架素材的待办项见 `release/RELEASE_CHECKLIST.md`。
