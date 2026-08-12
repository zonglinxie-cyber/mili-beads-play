# 米粒拼豆社｜商店提交资料包 v11

状态基准：2026-08-12，首发候选 1.0（Android `versionCode 1` / iOS build `1`）

产品 ID（代码现状）：`family.mili.beads`

适用范围：Google Play 与 Apple App Store 首次公开发行

> **这是一套“照填稿”，不是已完成提交的证明。** 商店后台、开发者身份、联系信息、签名证书与地区资质均无法从仓库推断；所有此类未知项已列为 **P0 占位符**，必须由账号持有人填入真实、可验证信息，禁止编造。

## 一页结论

| 项目 | v11 决策 / 口径 |
|---|---|
| 产品定位 | 面向 9 岁儿童的离线拼豆创作游戏；不是通用工具，也不是社交应用 |
| Google 目标年龄 | **仅选 Ages 9–12**；不要为了扩大曝光顺手勾选其他年龄 |
| Apple Kids Category | **Made for Kids → Ages 9–11**；该选择获批后不可随意撤销，后续版本持续受 Kids Category 规则约束 |
| 账号 | 无注册、无登录、无游客 ID、无跨设备账号 |
| 广告 / 商业化 | 无广告、无交叉推广、无应用内购买、无订阅、免费 |
| 数据 | 应用及集成 SDK 不把用户数据传出设备；Web 进度在本机 `localStorage`，原生进度在应用自有 DurableStore；iOS Privacy Manifest 声明零收集、零追踪 |
| 分享 | 只有生成的拼豆 PNG 可经系统分享面板导出；必须先长按 1.4 秒并解一道随机三位数乘以两位数的成人题；无应用内社区、无陌生人互动 |
| 内容分级预期 | Google IARC 各敏感内容答“否/无”，预期低龄级别；Apple 各内容描述符 `None`，预期 4+，再选 Kids 9–11。**最终等级以后台计算为准** |
| 首发地区 | 公开发行，但 **排除 China mainland / 中国大陆**；不要选“所有地区”后忘记排除 |
| 原创权利 | 12 张图纸由本项目以代码网格原创实现，逐图有哈希台账；仍需真实权利人签署确认，当前作者身份为 P0 |
| 目前不可提交的硬缺口 | 开发者账号身份与权限、支持邮箱、隐私政策公网 URL、最终 Bundle ID 占用、Android 上传密钥、Apple 发行证书/描述文件、真实 iPhone 截图、账号条件式 Play 闭测 |

## 使用顺序

1. 先完成 [`06-P0-EXTERNAL-BLOCKERS.md`](./06-P0-EXTERNAL-BLOCKERS.md)；P0 未清零前不要点击 Submit。
2. Google Play 按 [`01-GOOGLE-PLAY-CONSOLE.md`](./01-GOOGLE-PLAY-CONSOLE.md) 逐项照填。
3. Apple 按 [`02-APP-STORE-CONNECT.md`](./02-APP-STORE-CONNECT.md) 逐项照填。
4. 将 [`03-APP-REVIEW-NOTES-BILINGUAL.md`](./03-APP-REVIEW-NOTES-BILINGUAL.md) 对应版本粘贴到审核备注。
5. 用 [`04-PRIVACY-AND-KIDS-DECLARATIONS.md`](./04-PRIVACY-AND-KIDS-DECLARATIONS.md) 统一隐私、儿童与分级口径。
6. 按 [`05-REGION-DECISION.md`](./05-REGION-DECISION.md) 设置地区；首发排除中国大陆。
7. 权利人签署并冻结 [`07-ORIGINAL-PATTERN-RIGHTS-LEDGER.md`](./07-ORIGINAL-PATTERN-RIGHTS-LEDGER.md)。
8. 提交前跑完 [`08-PRE-SUBMISSION-FINAL-CHECK.md`](./08-PRE-SUBMISSION-FINAL-CHECK.md)。

## 证据边界

已由仓库直接证明的事实：

- Android / iOS 标识当前均为 `family.mili.beads`，版本 1.0 / build 1。
- Android `targetSdkVersion=36`，未声明 `INTERNET`、`AD_ID`、位置、相机、麦克风、相册或外部存储权限；`allowBackup=false`、`usesCleartextTraffic=false`。
- iOS `PrivacyInfo.xcprivacy`：`NSPrivacyCollectedDataTypes=[]`、`NSPrivacyTracking=false`、无追踪域名；声明 Capacitor 内部仍使用的 UserDefaults `CA92.1` 与本机文件操作所需的文件时间戳 `C617.1`。
- 依赖中无广告、分析、登录、推送、支付或云数据库 SDK。
- 进度、作品册和完成日期保存在本机；应用内可清除。
- 系统分享只导出应用生成的 1200×1500 PNG，且位于家长门之后。
- 12 张图纸的结构、像素、配色、动画分层与逐图哈希可从 `app/patterns.ts` 重建。

仍需账号持有人证明或完成的事实：

- 法定权利人 / 开发者主体、联系邮箱、电话、地址、账号类型与商店协议状态。
- 包名在两个开发者账号中是否可注册、签名和上传。
- 隐私政策是否已经部署到公开、稳定、无需登录的 HTTPS URL。
- App Store Connect / Play Console 实际问卷显示内容及最终计算等级。
- 真实签名构建、真实 iPhone 截图、真机审核版本与后台上传版本是否完全一致。

## 官方依据（2026-08-12 核对）

- Google Play Families Policies：<https://support.google.com/googleplay/android-developer/answer/9893335?hl=en>
- Google Play Target audience and content：<https://support.google.com/googleplay/android-developer/answer/9867159?hl=en>
- Google Play Data safety：<https://support.google.com/googleplay/android-developer/answer/10787469?hl=en>
- Google Play App content / review declarations：<https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-EN>
- Google Play content ratings / IARC：<https://support.google.com/googleplay/android-developer/answer/9859655?hl=en>
- Google Play target API requirements：<https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB_ALL>
- Google Play new personal account testing：<https://support.google.com/googleplay/android-developer/answer/14151465?hl=en>
- Apple App Review Guidelines（重点 1.3、2.3、4.2、5.1.1）：<https://developer.apple.com/app-store/review/guidelines/>
- Apple Kids：<https://developer.apple.com/kids/>
- Apple App Privacy：<https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy>
- Apple age rating：<https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/>
- Apple screenshot specifications：<https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/>
- Apple App information / China mainland metadata：<https://developer.apple.com/help/app-store-connect/reference/app-information/app-information>
- Apple availability：<https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store>

以上链接及本文其他官方链接共 22 个，已在 2026-08-12 以未登录 HTTP 请求逐一确认可达（HTTP 200）。网页政策会更新；实际提交日仍须再次核对后台最新问题和官方全文。

## 变更纪律

- 如果以后加入分析、崩溃上报、广告、云存档、登录、推送、用户上传、生成式 AI、外部内容、聊天、排行榜或内购，**本资料包全部隐私与儿童口径立即失效**，必须重新审计后再发版。
- 如果任何第三方 SDK 在运行时把设备或诊断数据传出设备，“无收集”就不成立；不要只看应用自身代码。
- 如果分享流程不再经过当前家长门，Kids Category / Families 的审核说明必须重写，并先修复产品。
