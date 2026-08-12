# App Store Connect｜逐项照填稿

## A. New App / App Information

| App Store Connect 项 | 建议填写 | 备注 |
|---|---|---|
| Platforms | `iOS` | 当前 `TARGETED_DEVICE_FAMILY=1`，仅 iPhone |
| Name | `米粒拼豆社` | 6 个汉字，低于 30 字符上限 |
| Primary language | `Simplified Chinese` | 当前仅 zh-Hans |
| Bundle ID | `family.mili.beads` | **P0：账号持有人先在 Apple Developer 注册并确认可用；上传构建必须完全一致** |
| SKU | `mili-beads-ios-001` | 可采用；仅账号内部使用。若已占用，换唯一值 |
| User access | `Full Access` 或按团队权限设置 | **P0：由账号管理员决定** |
| Primary category | `Games` | 建议子类 `Puzzle` / `Family`，按后台可选项 |
| Secondary category | `Education` 或不填 | 不要把手工安全提示包装成教育认证 |
| Content rights | `This app does not contain, show, or access third-party content`（若后台问题如此） | 12 图原创；系统图标与框架依开源许可。P0：权利人须签台账 |
| License agreement | `Apple Standard EULA` | 除非已有律师审定的自定义 EULA |

App information 官方字段说明：<https://developer.apple.com/help/app-store-connect/reference/app-information/app-information>。

## B. Kids Category 与年龄分级

### 1. Age Categories and Override

选择：

- **Made for Kids**
- **Ages 9–11**

Apple 明示：一旦 Kids 年龄段获 App Review 批准，不能再随意更改，后续更新继续遵守 Kids Category。不要在不接受长期约束时选择。官方说明：<https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/>。

### 2. Age Rating Questionnaire 建议

| 问题 / 内容描述符 | 回答 |
|---|---|
| Parental controls | **Yes**；当前工具会限制儿童使用保存、分享和打印，符合 Apple 对“限制某些功能”的示例。它不是身份认证；在 Review Notes 解释实现 |
| Age assurance | `No`；没有 Declared Age Range、政府证件、信用卡或年龄估算。数学题家长门不是年龄认证 |
| Messaging / chat | `No` |
| User-generated content | `No` |
| Advertising | `No` |
| Web access / unrestricted web | `No` |
| Gambling / contests / loot boxes | `None / No` |
| Violence | `None` |
| Horror / fear | `None` |
| Mature or suggestive themes | `None` |
| Medical / treatment information | `None` |
| Alcohol, tobacco, drugs | `None` |
| Profanity / crude humor | `None` |
| Sexual content / nudity | `None` |

预期计算等级是低龄（Apple 当前定义允许具有 Parental Controls 的应用仍为 4+），随后以 **Made for Kids 9–11** 指定 Kids Category。最终显示结果以 App Store Connect 为准，不在材料里伪造具体分级。字段定义：<https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions>。

## C. App Privacy

进入 App Privacy → Get Started：

| 问题 | 选择 |
|---|---|
| Do you or your third-party partners collect data from this app? | **No, we do not collect data from this app** |
| Data types | 不进入 / 全部不选 |
| Tracking | **No** |
| Privacy Policy URL | `【P0：https://公开域名/…/privacy】` |
| User Privacy Choices URL | 建议填写 `【P0：https://公开域名/…/privacy#delete】`；如果没有可定位锚点，可先留空，但隐私正文必须说明本机删除 |

Apple 要求回答覆盖应用及第三方合作方，且所有 iOS 应用必须提供隐私政策 URL：<https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy>。

**为何选“No collection”：**进度、完成记录、作品册仅保存在本机；应用没有服务器、账号、分析、广告、推送或云同步。家长主动分享应用生成 PNG 时，目标由系统分享面板和家长选择；开发者不接收该文件。若 Apple 在审核问及系统分享，使用 Review Notes 的明确解释。

## D. Version Information / Product Page

| 字段 | 建议填写 |
|---|---|
| Version | `1.0` |
| Copyright | `© 2026 【P0：真实法定权利人姓名或实体】` |
| Subtitle | `把小豆子拼成大冒险` |
| Promotional text | `12 张原创图纸，逐颗完成后收藏作品、播放动画，并由家长生成高清图。` |
| Keywords | `拼豆,像素画,益智,手工,创意,拼图,亲子,填色` |
| Support URL | `【P0：https://公开支持页】` |
| Marketing URL | 可留空；若填写：`【P0：https://公开产品页】` |
| Privacy Policy URL | `【P0：https://公开域名/…/privacy】` |

### Description（建议稿）

```text
米粒拼豆社是一款为 9–11 岁孩子设计的安静拼豆创作游戏。

孩子可以从火箭背包橘猫、云朵冲浪水獭、追星小青龙、瓶中发光水母、醒狮飞越梅花桩等 12 个原创主题中选择作品，按照完整 18×18 图纸和颜色提示逐颗完成。

• 12 张原创、完整可辨认的拼豆图纸
• 九宫格放大拼制，手机上更容易点准
• 本机自动保存进度和作品册
• 完成后播放角色、道具、特效三层动画
• 生成 1200×1500 高清图纸或作品卡
• 保存、分享和打印均须通过家长验证
• 无账号、无广告、无聊天、无应用内购买
• 内容随应用安装，可离线使用

游戏记录只保存在当前设备，不会发送给开发者或第三方。

安全提示：实际拼豆的熨烫和裁剪必须由成年人完成。
```

由于选择 Kids Category，可以使用面向儿童的元数据；若最终不选 Kids Category，则必须重新审查 “孩子/儿童” 等措辞，Apple Guideline 2.3.8 将这类措辞保留给 Kids Category。

## E. Screenshots / App Preview

- 当前 `release/store-assets-v10/app-store-iphone69-web-composite-*` 是 **Web 合成构图，不是真实设备截图**，不能当作已满足 P0 的证据。
- **P0：用最终签名构建在受支持 iPhone 或对应 Simulator 真正运行后截取 6.9 英寸规格。**
- Apple 当前接受的 6.9 英寸竖屏尺寸包括 1260×2736、1290×2796、1320×2868；以官方表为准：<https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/>。
- 建议上传 5 张真实画面：主页、九宫格拼制、100% 完成、三层动画、高清图预览。
- 截图不得包含浏览器地址栏、伪造设备 UI、开发调试信息或尚未实现的功能。
- 当前仅 iPhone，App Store Connect 不应要求 iPad 截图；若将来开启 iPad 支持，必须新增对应真机 / Simulator 截图与布局验证。

## F. App Review Information

| 字段 | 填写 |
|---|---|
| Contact first name | `【P0：真实审核联系人名】` |
| Contact last name | `【P0：真实审核联系人姓】` |
| Phone number | `【P0：审核期间可接听、带国家码的电话】` |
| Email | `【P0：审核期间持续收信的邮箱】` |
| Sign-in required | `No` |
| Demo account | 不适用；无登录 |
| Notes | 粘贴 `03-APP-REVIEW-NOTES-BILINGUAL.md` 的英文版；中文可附后 |
| Attachment | 可选附一段家长门操作视频；若审核无法发现分享流程，建议附 |

Apple 审核联系字段官方说明：<https://developer.apple.com/documentation/appstoreconnectapi/app-store-review-details>。

## G. Encryption / Export Compliance

当前 `Info.plist` 已声明 `ITSAppUsesNonExemptEncryption=false`。后台按实际构建回答：应用没有自行实现或提供非豁免加密，只使用 Apple / WebKit 平台常规机制；若账号后台问题变化或未来加入网络服务，重新评估，不要盲目沿用。

## H. Pricing and Availability

| 项目 | 建议 |
|---|---|
| Price | `Free` |
| Distribution | `Public` |
| Availability | `Specific Countries or Regions` |
| China mainland | **不要选择** |
| Automatically include future regions | 建议关闭；否则未来新增地区可能绕过地区合规审查 |
| Release option | 建议 `Manually release this version`，先核对所有地区状态再发布 |

Apple 允许选择具体国家或地区：<https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store>。中国大陆游戏还涉及审批号等附加材料：<https://developer.apple.com/help/app-store-connect/reference/app-information/app-information>。详见 `05-REGION-DECISION.md`。

## I. App Review Guidelines 对应说明

| Guideline | 当前应对 |
|---|---|
| 1.3 Kids Category | 无外链、广告、购买；唯一系统分享位于长按 + 随机三位数乘以两位数的成人乘法题家长门之后；无第三方分析/广告 |
| 2.3 Accurate Metadata | 文案、截图只展示 12 图、拼制、动画、本机保存和家长导出；不声称视频生成或云功能 |
| 4.2 Minimum Functionality | 不是网页目录：内置完整交互、逐颗校验、九分区、持久化、作品册、动画、1200×1500 图像生成、原生 Filesystem/Share，可离线运行 |
| 5.1.1 Privacy | 隐私政策在应用内可访问；说明零收集、本机保留和删除；App Privacy 选择 No collection |

Guidelines：<https://developer.apple.com/app-store/review/guidelines/>。

## J. 提交前 Apple 专项核对

- [ ] App record 的 Bundle ID 与最终 archive 一致。
- [ ] 选择 Kids Category Ages 9–11，并接受其不可轻易撤销的长期义务。
- [ ] Age Rating 所有敏感内容如实为 None；后台最终等级已复核。
- [ ] App Privacy 为 No collection / No tracking，隐私 URL 可公开访问。
- [ ] Support URL 与真实联系人有效。
- [ ] 只上传最终构建的真实 iPhone 截图，不把 Web composite 冒充设备截图。
- [ ] App Review Notes 包含无需登录、离线内容、家长门复现、零数据说明。
- [ ] Pricing & Availability 明确排除 China mainland，且没有启用“未来所有新地区”。
- [ ] 最终签名 archive、发行证书、provisioning profile、协议和税务状态均由账号后台证明有效。
