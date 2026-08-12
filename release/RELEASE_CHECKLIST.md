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
- [x] 系统保存/分享入口由长按与随机算术两步家长门保护
- [x] 无广告、无聊天、无内购
- [x] 商店名称、描述、关键词和截图清单
- [x] Web 构建、Lint、28 项发布静态门禁和 7 项移动端 E2E
- [x] Capacitor iOS / Android 原生工程
- [x] iOS Privacy Manifest；Android 禁止系统备份、无 INTERNET 权限、禁用明文流量
- [x] Android release manifest 自动检查：target 36、无 INTERNET、非 debuggable、无备份、禁明文
- [x] Android 15 最终包离线冷启动、内置隐私页、单颗触控放豆和系统分享面板实测
- [x] Android Debug APK 与未签名 Release AAB 产物
- [x] Android JVM 测试校验正式包名与版本；设备烟雾测试覆盖真实 `MainActivity`、WebView 和 DurableStore/旧存储清理
- [x] Web 预览可生成 1200 × 1500 打印图和完成作品卡
- [x] 12 张图纸均有角色 / 道具 / 特效数据层；9 套动作驱动独立动画舞台
- [x] Android 原生内容包内置 HTML、JavaScript 与 CSS
- [x] Android / iOS 原生图标与启动页完成品牌替换；确定性门禁拒绝 Capacitor 模板素材回归
- [x] v2 本机存档可迁移到 v3；损坏的新存档会回退到完好的旧存档并过滤非法数据
- [x] 原生端使用应用自有 DurableStore 耐久存档；Android 同步 `commit()`、iOS 原子文件写，放豆必须在原生写入确认后才更新界面
- [x] 原生存档恢复有独立加载/错误态；损坏存档会回退且修复，清除操作用串行队列和 DurableStore tombstone 防止旧记录复活
- [x] Android 最终包完成 3 轮“原生写入返回后立即强杀”，冷启动均恢复 `1/170`、分区 `1/2`、墨黑 `1/37`
- [x] Android 最终包实测 v3/v2 迁移、旧 tombstone、新 tombstone 原生返回后强杀、空界面确认后强杀，旧作品均未复活

## 仍需验证后才能声称通过

- [ ] Android/iOS 原生 WebView 完整拼完一张图、庆祝、动画和作品册；Android 完整逻辑已由同源码 Web E2E 覆盖，iOS 仍待真机
- [x] Android 最终 APK 放 1 颗后强杀冷启动、重进同图恢复 `1/170`、分区 `1/2`、墨黑 `1/37`
- [x] Android 生成 1200×1500 PNG 后调起系统分享面板，显示 Quick Share / Print / Drive；iOS 仍待真机
- [x] PWA 首次在线加载并取得 Service Worker 控制后，断网重载仍能打开首页和开始挑战
- [x] Android 15 `mili_phone` 模拟器设备烟雾测试 3/3 通过
- [x] 最终候选包重新运行 `:app:connectedDebugAndroidTest`，3/3 通过
- [ ] iOS 真机安装、冷启动、离线与辅助功能验收
- [x] 6×6 放大分区将可拼豆格提升到至少 44 px；弹层具备初始焦点、Esc、焦点圈、焦点循环和底层 inert
- [ ] iOS VoiceOver / Android TalkBack 真机回归

## 提交商店前需要开发者账户完成

- [ ] 在 Apple Developer / Google Play Console 建立应用记录
- [ ] 在开发者账户确认 `family.mili.beads` 可用，或替换最终 Bundle ID
- [ ] 确认正式发行主体名称，并提供持续监控的支持/隐私邮箱（不得使用占位文本）
- [ ] 将公开 `/privacy` 和 `/support` URL 填入两家控制台；Support URL 必须包含真实联系方式
- [ ] 使用真机截取商店截图
- [ ] 签名并上传原生安装包
- [ ] Google Target Audience 仅选 9–12，完成 Families、Data Safety“无收集/无共享”、Ads“No”、IARC 与 App access
- [ ] Apple Made for Kids 选择 9–11，完成 App Privacy“No collection”、年龄分级、审核联系人和审核说明
- [ ] 若 Google 个人开发者账号创建于 2023-11-13 之后，完成 12 名测试者连续 14 天 closed test 和真机账号验证
- [ ] Apple 首发销售地区排除中国大陆；没有版号/出版批复等材料前不得勾选中国大陆

当前交付同时包含可安装移动 Web App、Android 可安装测试包、Android 商店格式 AAB 和 iOS / Android 原生工程。提交商店仍需开发者账户和正式签名证书；这些属于账户发行权限，不应伪造。
