# Google Play Console｜逐项照填稿

入口通常位于 Play Console → 选择应用 → **Policy and programs / App content**。后台文案会随账号和地区略有变化；以实际问题为准，不要机械忽略新增问项。

## A. 创建应用

| Play Console 项 | 建议填写 | 备注 |
|---|---|---|
| App name | `米粒拼豆社` | 当前显示名称 |
| Default language | `Chinese – Simplified (zh-CN)` | 首发仅有简体中文界面 |
| App or game | `Game` | 有关卡式拼制、完成反馈、作品册和动画 |
| Free or paid | `Free` | 无内购、无订阅 |
| Package name | `family.mili.beads` | **P0：先由账号持有人确认可用且与最终签名 AAB 一致** |
| Developer name | `【P0：填写经 Play 验证的公开开发者名称】` | 不得填“米粒拼豆社家庭项目”冒充法律主体 |
| Contact email | `【P0：可长期收信并由真人处理的支持邮箱】` | 会用于用户支持或审核联系 |
| Privacy policy URL | `【P0：https://公开域名/…/privacy】` | 必须公开、稳定、无需登录、与应用内政策一致 |

### 建议商店文案

**Short description（建议稿）**

`照着原创图纸逐颗拼豆，完成后收藏作品、播放动画并生成高清图。`

**Full description（建议稿）**

```text
米粒拼豆社是一款为 9–12 岁孩子设计的安静拼豆创作游戏。

从火箭背包橘猫、云朵冲浪水獭、追星小青龙、瓶中发光水母、醒狮飞越梅花桩等 12 个原创主题中选择作品，按照完整 18×18 图纸和颜色提示逐颗完成。九宫格放大拼制让手机上的每一颗豆子更容易点准。

主要功能：
• 12 张原创 18×18 拼豆图纸
• 每张约 120–170 颗，适合分阶段完成
• 角色、道具、特效三层完成动画
• 本机自动保存进度与作品册
• 生成 1200×1500 高清图纸或作品卡
• 保存、分享和打印须通过家长验证
• 可离线使用

本应用无需账号，不含广告、聊天、排行榜、应用内购买或订阅，也不会将游戏进度发送给开发者或第三方。

安全提示：实际拼豆的熨烫和裁剪必须由成年人完成。
```

不要写“AI 视频生成”“海量图库”“持续联网更新”等当前版本没有的功能。

## B. App access（应用访问）

| 问题 | 选择 / 填写 |
|---|---|
| Is all or some functionality restricted? | `All functionality is available without special access` / 不受限制 |
| Login credentials | 不适用；无账号、无登录、无订阅墙、无地区内账号权限 |
| Instructions | 可留空；如后台必须填写：`No account or sign-in is required. Launch the app and tap 开始挑战.` |

## C. Ads（广告）

| 问题 | 选择 |
|---|---|
| Does your app contain ads? | **No** |
| Families ads SDK certification | 不适用，因为没有广告 SDK、交叉推广或付费植入 |

这里的“无广告”是产品承诺。以后即使只放自家应用交叉推广，也要重新审计 Families 商业内容口径。

## D. Target audience and content

官方要求只选择真正为其设计且已适配的年龄段；不要为了覆盖成人用户而多勾。参见 <https://support.google.com/googleplay/android-developer/answer/9867159?hl=en>。

| 问题 | 选择 / 填写 |
|---|---|
| Target age groups | **Ages 9–12，仅此一项** |
| Does the store listing unintentionally appeal to children? | 本应用明确以儿童为目标；按后台针对儿童应用的路径如实继续 |
| Store presence / Families | 如出现加入 Families / Teacher Approved 相关确认：声明目标为儿童并确认遵守 Families；Teacher Approved 是另行评估，不要宣称已获认证 |
| Target audience rationale | `The app was designed for children ages 9–12: 18×18 visual puzzles, 6×6 enlarged touch zones, reading-light instructions, no social features, no ads, and adult-gated export.` |

### Families 自检答复

- 儿童可见内容是否适龄：**是**。
- 是否只是网站 WebView：**否**。它是随包内置、离线可运行的交互式游戏，有进度、本机作品册、逐格校验、图像生成、三层动画和原生分享。
- 是否传输儿童个人或敏感信息：**否**。
- 是否请求 `AD_ID`、位置、电话标识、相机、麦克风：**否**。
- 是否包含未获准用于儿童服务的登录 / 广告 / 分析 SDK：**否**。
- 是否包含社交功能：**否**。系统分享不是应用内社区；它只在成人操作后把应用生成的 PNG 交给 OS。
- 是否含 AR：**否**。
- 是否含商业内容：**否**。

Families 官方规则：<https://support.google.com/googleplay/android-developer/answer/9893335?hl=en>。

## E. Data safety

官方定义中，“collect”核心是从应用将数据传出用户设备；即使完全不收集也必须完成表单并提供隐私政策 URL。参见 <https://support.google.com/googleplay/android-developer/answer/10787469?hl=en>。

| Data safety 问题 | 选择 |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Data shared with third parties | **No data shared** |
| Data collected | **No data collected** |
| Data types | 全部不勾选 |
| Encryption in transit | 表单选择“No collection”后通常不再出现；若出现，不要用“不适用”冒充“是”，按后台允许项选择 `Not applicable / No data transmitted` |
| Deletion request mechanism | 无服务端数据或账号；隐私政策说明本机删除方式。若“No collection”路径不提问，不额外勾选 |
| Committed to follow Families Policy | 若后台提供且账号持有人完成全项复核，可勾选；它不是第三方认证 |
| Independent security review | **No / 不声明**，除非未来确有有效独立认证 |

**本机数据不列为 Play “collected”数据：**拼豆格进度、已完成图 ID、活动日期仅保存在应用本机沙盒。应用生成的 PNG 只有家长主动通过系统分享面板时才交给家长选择的目的地；应用开发者不接收。该外发是用户主动动作，不是应用或 SDK 后台收集。

## F. Content rating（IARC）

在 Policy → App content → Content ratings 中选择 **Game**，使用真实 IARC 联系邮箱：`【P0：IARC 联系邮箱】`。

当前内容事实建议：

| 内容描述符 | 回答 |
|---|---|
| Violence / fear / horror | `No / None` |
| Sexuality / nudity | `No / None` |
| Language / profanity | `No / None` |
| Controlled substances | `No / None` |
| Gambling / simulated gambling / wagering | `No / None` |
| Loot boxes / random paid items | `No` |
| User-generated content | `No` |
| User interaction / chat / free-form exchange | `No` |
| Location sharing | `No` |
| Digital goods purchase | `No` |
| Ads | `No` |
| Unrestricted Internet / external content | `No` |
| Shares user-provided personal information | `No` |

**不要手填“Everyone/PEGI 3”等结果。** 提交问卷后由 IARC 计算；如果结果高于预期，先查是否误把系统 PNG 分享申报成社交 / UGC，再根据真实功能纠正问卷，不要篡改事实去追求低等级。官方说明：<https://support.google.com/googleplay/android-developer/answer/9859655?hl=en>。

## G. 其他 App content 声明

| 声明 | 建议 |
|---|---|
| News app | `No` |
| Health app | `No` |
| Financial features | `No` |
| Government app | `No` |
| COVID / medical | `No` |
| Data deletion | 无账号、无服务端数据；如后台要求删除 URL：`【P0：隐私选择/删除说明公网 URL】`，说明应用内“家长与隐私说明 → 清除本机游戏记录”或卸载 |
| Permissions declarations | 当前无受限 / 高风险权限，不应触发；如后台触发，先检查上传 AAB Manifest，不要乱填理由 |

## H. Release / technical

| 项目 | 建议 / 状态 |
|---|---|
| Target API | 当前代码 `targetSdkVersion 36`，满足 2026-08-31 起新应用 API 36 要求；上传后仍核对 App Bundle Explorer |
| App signing | **P0：创建 Play App Signing，保管上传密钥，上传正式签名 AAB** |
| Version | `1.0` / version code `1`；若后台已有 code 1，必须递增，不能覆盖 |
| Countries / regions | 选择计划覆盖的具体地区，**排除 China mainland**；见 `05-REGION-DECISION.md` |
| Release name | `1.0 首发`（内部可见） |
| Release notes zh-CN | `首个正式版本：12 张原创拼豆图纸、九宫格放大拼制、本机进度与作品册、完成动画和家长验证后的高清图保存与分享。` |

API 官方截止日期：<https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB_ALL>。

## I. 新个人账号闭测条件（账号条件式 P0）

**P0：账号持有人先确认 Play 开发者账号类型与创建日期。** 若为 2023-11-13 之后创建的个人账号，生产权限通常要求：

- 至少 12 名测试者加入 closed test；
- 连续保持加入至少 14 天；
- 有真实测试参与和反馈记录；
- 然后在 Dashboard 申请 production access，回答测试与准备度问题。

不要预先声称此项完成。官方规则：<https://support.google.com/googleplay/android-developer/answer/14151465?hl=en>。

## J. 提交前 Play 专项核对

- [ ] 上传的 AAB 包名、versionCode、target API 与本文件一致。
- [ ] App Bundle Explorer 权限列表仍无 INTERNET、AD_ID、位置、相机、麦克风和存储权限。
- [ ] Data safety 显示 “No data collected / No data shared”。
- [ ] 目标年龄只选 9–12。
- [ ] Ads = No；IARC = Game，所有敏感内容按真实功能为 No/None。
- [ ] 隐私 URL 从未登录浏览器可访问，且应用内也可打开同等内容。
- [ ] 首发地区未包含中国大陆。
- [ ] 商店图和描述只展示真实功能；不上传带网页浏览器边框、调试条或虚构 UI 的素材。
- [ ] 如适用，12 人 / 14 天闭测与生产权限已经由后台证明完成。
