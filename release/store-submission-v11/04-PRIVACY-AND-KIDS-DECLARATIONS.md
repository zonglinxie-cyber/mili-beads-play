# 隐私、儿童、家长门与内容分级｜统一口径

## 1. 不可分裂的核心声明

两个商店、隐私政策、审核备注、客服回复必须统一使用以下事实：

1. **无账号**：不创建账号，不要求登录，不生成开发者可识别的游客账号。
2. **无广告**：无广告 SDK、个性化广告、上下文广告、交叉推广、产品植入。
3. **无购买**：无 IAP、订阅、付费解锁、抽卡或付费随机项目。
4. **无开发者数据收集 / 共享**：应用及集成 SDK 不把用户或设备数据传出设备。
5. **本机存档**：拼制进度、完成图 ID 和活动日期只保存在本机应用容器，直至家长清除或卸载。
6. **无社交**：无聊天、评论、公开作品、好友、排行榜、匹配或陌生人互动。
7. **受控分享**：家长可在家长门后把应用生成的 PNG 交给 OS 分享面板；开发者不接收文件，儿童不能在应用内直接公开发布。
8. **儿童年龄**：Google Play 仅 9–12；Apple Kids Category 9–11。
9. **现实手工安全**：熨烫与裁剪必须由成年人完成。

## 2. 数据流台账

| 数据 / 能力 | 来源 | 保存位置 | 离开设备？ | 开发者/第三方收到？ | 删除方式 | 商店口径 |
|---|---|---|---|---|---|---|
| 拼豆格进度 | 孩子逐格操作 | Web：本机 `localStorage`；原生：应用自有 DurableStore | 否 | 否 | 应用内清除、清网站数据或卸载 | 不属于 Play off-device collection；Apple No collection |
| 完成图 ID | 游戏完成事件 | Web：本机 `localStorage`；原生：应用自有 DurableStore | 否 | 否 | 同上 | No collection |
| 活动日期 | 本机日期 | Web：本机 `localStorage`；原生：应用自有 DurableStore | 否 | 否 | 同上 | No collection |
| 生成 PNG | 应用图纸与 Canvas | 临时内存 / 原生 Cache | 仅家长主动分享时 | 开发者不接收；家长选择的 OS 目的地可能接收 | OS / 缓存管理；可重新生成 | 用户主动分享，不是开发者后台收集 |
| 轻微震动 | 应用事件 | 不保存 | 否 | 否 | 系统关闭触觉 | 非用户数据 |
| UserDefaults API（iOS） | Capacitor 内部状态 | 系统本机应用容器 | 否 | 否 | 卸载应用 | Privacy Manifest `CA92.1`；不是收集数据 |
| 文件时间戳 API（iOS） | Capacitor / 文件操作 | 系统本地 | 否 | 否 | 随临时文件/应用生命周期 | Privacy Manifest `C617.1`；不是收集数据 |
| OS / Store 自身遥测 | Apple / Google 平台 | 平台控制 | 可能 | 由平台按其政策控制 | 平台账号/系统设置 | 不把平台独立处理冒充成应用开发者收集；如未来加入自有 SDK，需重审 |

### 临时 PNG 的保留说明

原生分享前，应用会将 PNG 写入应用 Cache 目录。Cache 可被系统在空间紧张时删除，卸载会删除应用容器；当前 UI 的“清除本机游戏记录”清的是游戏存档，不保证立即清理系统缓存里的既有临时 PNG。隐私文案或客服不得声称该按钮会删除已由用户分享给其他应用的副本。

## 3. Google Play Data Safety 短答案

```text
Collects data: No
Shares data: No
Data types: None
Ads: No
Account creation: No
Data deletion: Local-only data can be cleared in the app or by uninstalling; the developer holds no server copy.
```

Google 将 “collect” 定义为从应用将数据传出设备，并要求即使零收集也完成表单和隐私政策：<https://support.google.com/googleplay/android-developer/answer/10787469?hl=en>。

## 4. Apple App Privacy 短答案

```text
Do you or your third-party partners collect data from this app?
No, we do not collect data from this app.

Tracking: No
Data linked to the user: None
Data not linked to the user: None
```

Apple 要求声明涵盖第三方伙伴代码：<https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy>。

## 5. 家长门说明

### 当前实现

1. 在图纸页面生成打印图 / 完成后生成作品卡；
2. 按钮明确写“家长长按”；
3. 必须持续按住 1.4 秒；
4. 弹出随机三位数乘以两位数的成人乘法题；
5. 输入正确答案后才调用系统分享或打印；
6. 答错会生成新题；取消不会外发。

### 审核结论

- Apple Kids Category 1.3 要求外链、购买机会或其他对儿童的干扰置于 parental gate 后。当前系统分享 / 打印符合“成人区”意图，但最终是否接受由 App Review 决定。规则：<https://developer.apple.com/app-store/review/guidelines/>。
- Google Families 对社交功能要求成人控制与 adult action。当前应用不是社交应用，且无应用内信息交换；系统分享仍额外置于成人动作后。规则：<https://support.google.com/googleplay/android-developer/answer/9893335?hl=en>。
- 家长门不是法律意义上的可验证家长同意，不要将它描述为 COPPA / GDPR consent。应用本身不收集数据，因此无需用它取得数据处理同意。

### 不应做的声明

- 不要说“儿童绝对无法绕过”；数学题和长按属于合理家长门，不是身份认证。
- 不要说“分享不向任何第三方发送”；正确说法是**应用开发者不接收**，目的地由家长在系统面板选择。
- 不要把系统分享申报成应用内聊天 / 社区 / UGC。
- 如果以后允许导入照片、自由绘画、文本或语音，当前分级与隐私口径立即失效。

## 6. Families / Kids 年龄选择

### Google Play

- Target audience：**Ages 9–12，仅此一项**。
- 原因：产品由 18×18 图纸、120–170 颗目标、阅读型说明和九分区触控构成，明显不是 5 岁以下或 6–8 岁专属设计。家长门题目不属于儿童玩法，不能用来证明目标年龄。
- 不勾 13–15、16–17、18+：成年人可以下载不等于产品“为成年人设计”。Google 要求只选择真正设计并适配的年龄段。

### Apple

- Made for Kids：**Ages 9–11**。
- 内容评级与目标年龄是不同概念：问卷可能计算为 4+，但 Kids Category 年龄段仍选择 9–11。
- 获批后需持续遵守 Kids Category；不要把它当作一次性流量标签。

## 7. 内容分级建议

### Google IARC

类别：`Game`。暴力、恐惧、性、粗俗语言、毒品、赌博、付费随机、UGC、聊天、定位、广告、购买、无限制网络访问均为 `No / None`。最终等级由 IARC 计算，不手工保证等级。

### Apple Age Rating

`Parental Controls=Yes`（限制保存、分享和打印），`Age Assurance=No`；所有敏感内容频率为 `None`；Messaging/Chat、UGC、Advertising、Web access、Gambling/Loot boxes 均为 `No`。预期低龄基础等级，并选 Kids 9–11。最终以 App Store Connect 的全球及地区结果为准：<https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/>；字段定义：<https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions>。

## 8. 隐私政策发布前必须补齐

应用内现有政策仍把提供者写成“家庭独立开发项目”，并称支持邮箱将在上架前公布。这不是可提交终态。提交前必须在应用内政策与公网政策同时替换为：

- `【P0：真实开发者 / 数据责任方全称】`
- `【P0：支持与隐私联系邮箱】`
- `【P0：适用的联系地址或司法辖区要求信息】`
- `【P0：公开政策生效日期与版本】`
- 明确临时生成图片、本机存档、系统分享目的地和删除边界。

本资料包按任务约束不修改应用源码；因此这是明确 P0，不是文字润色项。
