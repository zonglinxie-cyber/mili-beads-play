# P0 外部权限与提交缺口清单

> 定义：任何 P0 未完成，项目可以继续测试，但不能诚实地声称“已经能提交并上架”。以下项目都依赖账号、身份、证书或外部服务，本仓库不能替你完成或伪造。

## P0-01 开发者主体与可验证联系方式

- [ ] 法定开发者 / 权利人全称：`【P0：真实姓名或注册实体全称】`
- [ ] 公开开发者名称：`【P0：Google Play 展示名称】`
- [ ] App Store Copyright 权利人：`【P0：© 2026 …】`
- [ ] 支持邮箱：`【P0：长期可用、可公开、可接收审核与家长请求】`
- [ ] 审核邮箱：`【P0：审核期每日检查】`
- [ ] 审核联系人姓名：`【P0：真实姓名】`
- [ ] 审核联系电话：`【P0：含国家码，审核期可接听】`
- [ ] 账号要求的真实地址 / 电话 / 身份验证已完成。

**完成证据：** 两个后台的 Account / Developer profile 截图或导出，不以 README 自填为证。

## P0-02 开发者账号与协议

- [ ] `【P0：Apple Developer Program 账号 / Team ID】` 有效，协议已接受。
- [ ] `【P0：App Store Connect 角色】` 至少具备创建、上传、隐私和提交所需权限。
- [ ] `【P0：Google Play Developer account ID】` 已验证，协议与付款资料状态正常。
- [ ] Google 账号类型 / 创建日期已确认；若为 2023-11-13 后新个人账号，完成 12 名测试者连续 14 天 closed test 和 production access 申请。
- [ ] 如向 EU 分发，Apple DSA trader / non-trader 与 Google 相关 trader 信息由主体如实申报。

**完成证据：** 后台状态页；不能用本地构建代替。

## P0-03 最终应用标识

- [ ] Apple Developer 中 `family.mili.beads` App ID 可注册且归当前 Team。
- [ ] Play Console 中 `family.mili.beads` 未被占用且新应用记录已创建。
- [ ] 两边最终构建、商店记录、签名与隐私 URL 使用同一产品身份。
- [ ] 若任一平台不可用，先确定新反向域名，再统一修改源码 / 原生工程并全量重建复测；不要只改后台。

**完成证据：** Apple Identifiers、App Store Connect app record、Play app record。

## P0-04 隐私政策与支持页

- [ ] 隐私政策 HTTPS URL：`【P0：https://…】`
- [ ] 支持页 HTTPS URL：`【P0：https://…】`
- [ ] 可选隐私选择 URL：`【P0：https://…#delete】`
- [ ] 无需登录、无地理封锁、无过期证书、移动端可读。
- [ ] 公网政策与应用内政策一致，替换“家庭独立开发项目 / 上架前公布邮箱”等占位表述。
- [ ] 明确本机存档、临时 PNG、系统分享、保留 / 删除边界和联系方。

**完成证据：** 未登录浏览器从至少两个网络打开并保存截图；商店后台 URL 预览通过。

## P0-05 Android 正式签名与上传

- [ ] Play App Signing 已配置。
- [ ] 上传密钥 / keystore 已生成、离线备份并记录负责人：`【P0：负责人，不在本文件写密码】`。
- [ ] 使用正式上传密钥签名 release AAB；当前交付的 unsigned AAB 不能提交。
- [ ] 上传后在 App Bundle Explorer 复核 package、versionCode、target 36、权限和签名证书指纹。
- [ ] 如 versionCode 1 已占用，递增后重新构建。

**完成证据：** Play 接受 AAB、App Bundle Explorer 与签名证书页。

## P0-06 Apple 证书、描述文件与 archive

- [ ] Apple Distribution certificate 有效。
- [ ] App Store provisioning profile 与 `family.mili.beads` 一致。
- [ ] Xcode Archive 使用正确 Team、Release 配置和 version/build。
- [ ] Validate App 成功，上传后构建通过 processing。
- [ ] 最终候选在真实 iPhone 做冷启动、离线、完整拼图、家长门、系统分享、VoiceOver / Dynamic Type 基础回归。

**完成证据：** Xcode Organizer / App Store Connect build、签名详情、真机测试记录。

## P0-07 商店截图与素材

- [ ] Google Play 最终素材实际上传校验通过。
- [ ] Apple 使用最终签名构建的真实 iPhone / 对应 Simulator 截图；不能把 `app-store-iphone69-web-composite-*` 当成真机证据。
- [ ] 真实截图包含主页、九区拼制、完成、动画、图像预览，无调试 UI / 浏览器边框 / 虚构功能。
- [ ] App 图标、截图、功能图和构建中的品牌一致。

**完成证据：** 商店媒体管理页 + 原始截图采集记录。

## P0-08 年龄、隐私、内容与地区表单

- [ ] Google：仅 Ages 9–12、Ads No、Data Safety No collection/No sharing、IARC 真实答案。
- [ ] Apple：Made for Kids Ages 9–11、App Privacy No collection、Age Rating 真实答案。
- [ ] 两边审核备注已粘贴并复核家长门路径。
- [ ] 首发地区明确排除 China mainland；后台列表有证据。
- [ ] 最终计算内容等级已记录；若与预期不符，原因已查明。

## P0-09 12 图原创权利确认

- [ ] `07-ORIGINAL-PATTERN-RIGHTS-LEDGER.md` 中真实权利人和签署人已填写。
- [ ] 权利人确认 12 图、名称、故事、配色与动画分层为本项目原创委托 / 创作成果，且有权在两个商店全球发行（排除地区不影响权利范围）。
- [ ] 权利人确认没有使用第三方角色、品牌、IP 素材或受限生成素材。
- [ ] 开源软件许可清单另行保留；不要把代码框架许可与图案版权混为一谈。

## P0 清零签字

```text
版本：1.0 / build 1 / Android versionCode 1
最终 commit：________________________
Apple build ID：_____________________
Google release ID：__________________
账号负责人：________________________
隐私负责人：________________________
内容权利人：________________________
地区清单复核人：____________________
签字日期：__________________________
```
