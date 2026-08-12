# 上架检查表

## 已完成

- [x] 无账号直接使用
- [x] 360 / 390 px 手机尺寸视觉验收
- [x] 12 张原创 18×18 动作主题图纸，逐张尺寸与色号校验
- [x] 移动端 E2E 真实完成 170 颗火箭猫全链路：放豆、100% 庆祝、三层动画、1200×1500 高清 PNG 下载
- [x] 移动端 E2E 刷新后局部放豆进度、完成记录和作品册均恢复；误点重新开始可取消且不丢进度
- [x] PWA manifest 与 Service Worker 基础文件
- [x] 192 / 512 / 1024 应用图标和 Apple Touch Icon
- [x] 家长与隐私说明
- [x] 无广告、无聊天、无内购
- [x] 商店名称、描述、关键词和截图清单
- [x] Web 构建、Lint、13 项发布静态门禁和 5 项移动端 E2E
- [x] Capacitor iOS / Android 原生工程
- [x] iOS Privacy Manifest；Android 禁止系统备份、无 INTERNET 权限、禁用明文流量
- [x] Android release manifest 自动检查：target 36、无 INTERNET、非 debuggable、无备份、禁明文
- [x] Android 15 最终包离线冷启动、内置隐私页、单颗触控放豆和系统分享面板实测
- [x] Android Debug APK 与未签名 Release AAB 产物
- [x] Android JVM 基础测试可运行；设备烟雾测试覆盖真实 `MainActivity` 启动和 WebView 可见
- [x] Web 预览可生成 1200 × 1500 打印图和完成作品卡
- [x] 12 张图纸均有角色 / 道具 / 特效数据层；9 套动作驱动独立动画舞台
- [x] Android 原生内容包内置 HTML、JavaScript 与 CSS
- [x] Android / iOS 原生图标与启动页完成品牌替换；确定性门禁拒绝 Capacitor 模板素材回归
- [x] v2 本机存档可迁移到 v3；损坏的新存档会回退到完好的旧存档并过滤非法数据

## 仍需验证后才能声称通过

- [ ] Android/iOS 原生 WebView 完整拼完一张图、庆祝、动画和作品册；Android 完整逻辑已由同源码 Web E2E 覆盖，iOS 仍待真机
- [x] Android 最终 APK 放 1 颗后强杀冷启动、重进同图恢复 `1/170`、分区 `1/2`、墨黑 `1/37`
- [x] Android 生成 1200×1500 PNG 后调起系统分享面板，显示 Quick Share / Print / Drive；iOS 仍待真机
- [x] PWA 首次在线加载并取得 Service Worker 控制后，断网重载仍能打开首页和开始挑战
- [x] Android 15 `mili_phone` 模拟器设备烟雾测试 2/2 通过
- [x] 最终候选包重新运行 `:app:connectedDebugAndroidTest`，2/2 通过
- [ ] iOS 真机安装、冷启动、离线与辅助功能验收
- [x] 6×6 放大分区将可拼豆格提升到至少 44 px；弹层具备初始焦点、Esc、焦点圈、焦点循环和底层 inert
- [ ] iOS VoiceOver / Android TalkBack 真机回归

## 提交商店前需要开发者账户完成

- [ ] 在 Apple Developer / Google Play Console 建立应用记录
- [ ] 在开发者账户确认 `family.mili.beads` 可用，或替换最终 Bundle ID
- [ ] 填写开发者名称、支持邮箱和隐私政策公网地址
- [ ] 使用真机截取商店截图
- [ ] 签名并上传原生安装包
- [ ] 填写儿童类应用问卷与内容分级

当前交付同时包含可安装移动 Web App、Android 可安装测试包、Android 商店格式 AAB 和 iOS / Android 原生工程。提交商店仍需开发者账户和正式签名证书；这些属于账户发行权限，不应伪造。
