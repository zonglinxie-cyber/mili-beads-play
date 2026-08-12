# 首发地区决策｜排除中国大陆

## 决策

**v1.0 在 Google Play 和 Apple App Store 的首发公开发行中排除 China mainland / 中国大陆。**

这不是价值判断，而是发行路径判断：当前没有可验证的中国大陆游戏审批号、配套主体文件与 ICP 备案信息。将中国大陆勾入首发只会制造一个无法兑现的合规承诺，不会让产品更“完整”。

## Apple 操作

App Store Connect → Pricing and Availability → App Availability：

1. 选择 **Specific Countries or Regions**；
2. 选择实际计划首发的国家 / 地区；
3. **取消 China mainland**；
4. 建议取消“自动包含未来新增地区”；
5. 保存后在 Availability 明细里确认 China mainland 状态为 `Not Available`。

Apple 官方说明中国大陆的一些应用需要 ICP 备案信息，游戏还必须取得 NPPA approval number 并提交支持文件：<https://developer.apple.com/help/app-store-connect/reference/app-information/app-information>。地区设置操作：<https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store>。

## Google Play 操作

Play Console → Reach and devices / Countries and regions（后台名称可能调整）：

1. 选择实际计划首发地区；
2. 如后台列出 China / China mainland，不选择；
3. 不使用“全球”作为偷懒替代；
4. 保存后导出或截图地区列表，放入发行审计记录。

## 首发建议地区原则

当前界面仅有简体中文。首发可优先选择能被团队真实支持、且简体中文用户可合理使用的非中国大陆地区；**具体列表由账号持有人和运营负责人确认：`【P0：最终首发国家/地区清单】`**。

不要在没有英文、本地化支持和客服能力评估时机械开启 174 个地区。商店允许上架不等于产品已对所有地区做好适龄、消费者保护与支持准备。

## 以后进入中国大陆的重开条件

只有全部满足后才单独开启：

- [ ] `【P0：符合要求的发行 / 运营主体】`
- [ ] `【P0：有效 ICP Filing Number，且与商店元数据主体一致】`
- [ ] `【P0：游戏 NPPA approval number / ISBN 及批复文件】`
- [ ] `【P0：营业执照及必要授权链】`
- [ ] 中文隐私、儿童保护、实名 / 防沉迷等适用义务经中国大陆专业法律顾问核对
- [ ] 商店包、域名、客服、数据路径与批准版本一致
- [ ] Apple / Google 后台地区材料审核通过

在这些条件未完成前，不把中国大陆的缺席描述为“商店技术问题”，也不通过错误分类为工具应用规避游戏材料。
