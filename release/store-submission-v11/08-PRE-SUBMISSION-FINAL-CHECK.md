# 提交前最后一遍｜双商店不可跳过清单

## 0. 停止条件

若 `06-P0-EXTERNAL-BLOCKERS.md` 任一 P0 未完成，停止点击 Submit。资料齐全与“包能运行”是两回事。

## 1. 构建身份

- [ ] Android package：`family.mili.beads`
- [ ] Android version：`1.0`，versionCode：`1`（或后台未占用的更高整数）
- [ ] Android target API：36；上传后 App Bundle Explorer 证明
- [ ] iOS bundle：`family.mili.beads`
- [ ] iOS version：`1.0`，build：`1`（或后台未占用的更高整数）
- [ ] 两个平台最终包来自同一冻结 commit：`________________________`
- [ ] 正式签名，不是 debug、ad hoc 或 unsigned 产物

## 2. 功能回归

- [ ] 无网络冷启动可进入首页并打开图纸。
- [ ] 12 图全部完整显示，没有裁切或加载占位。
- [ ] 从零完整拼完至少 1 图，完成态、动画、作品册都正常。
- [ ] 放 1 颗后强退，重进恢复正确。
- [ ] 生成 PNG 尺寸为 1200×1500。
- [ ] 未通过家长门不能打开分享 / 打印；正确答题后可打开系统面板。
- [ ] 答错、取消、旋转 / 后台恢复不绕过家长门。
- [ ] 应用内可查看隐私说明并清除本机记录。
- [ ] iOS VoiceOver / Android TalkBack 基础流程可操作。

## 3. 隐私与权限

- [ ] Android 上传包无 INTERNET、AD_ID、位置、相机、麦克风、通讯录、相册 / 外部存储权限。
- [ ] iOS Privacy Manifest 仍为 zero collected data / no tracking；Required Reason API 与实际依赖一致。
- [ ] 最终依赖无新增 analytics、crash reporting、ads、auth、push、cloud、AI 或支付 SDK。
- [ ] Google Data Safety：No collected / No shared。
- [ ] Apple App Privacy：No collection / No tracking。
- [ ] 公网隐私政策与应用内政策、实际包、两个后台完全一致。

## 4. 儿童与分级

- [ ] Google target audience：仅 Ages 9–12。
- [ ] Google Ads：No；Families 声明与实际一致。
- [ ] Google IARC：Game，各敏感内容 No/None；最终证书已保存。
- [ ] Apple Made for Kids：Ages 9–11。
- [ ] Apple Age Rating 各敏感内容 None；最终全球 / 地区等级已保存。
- [ ] 无外部链接、购买、社交、UGC、广告或儿童可直接分享路径。

## 5. 元数据与素材

- [ ] 名称、描述不承诺当前没有的视频生成、AI、云同步或海量联网图库。
- [ ] 12 图原创权利台账已签署。
- [ ] Google 图标 / 功能图 / 5 张截图实际上传成功。
- [ ] Apple 5 张截图来自最终构建真实设备 / Simulator，不是 Web composite。
- [ ] 截图、图标与安装后的品牌一致，无调试 UI、地址栏、第三方商标。
- [ ] Support URL、Privacy URL、客服邮箱都可公开访问并由真人维护。

## 6. 审核可达性

- [ ] App Access / Sign-in 均声明无需账号。
- [ ] Apple Review contact 姓名、电话、邮箱真实有效。
- [ ] 英文 Review Notes 已粘贴；家长门复现路径逐字与最终 UI 相符。
- [ ] 如审核团队可能找不到长按操作，附最终构建录屏。
- [ ] 手动发布，审核通过后先复核地区和产品页再放行。

## 7. 地区

- [ ] 两个平台均使用具体地区列表，不是无审查的“所有地区”。
- [ ] China mainland 明确为 Not Available / 未选择。
- [ ] 未勾选自动包含未来新增地区，或已有书面审查流程。
- [ ] 最终地区清单：`【P0：附后台导出 / 截图路径】`

## 8. 最终双人复核签字

```text
发行负责人：________________  日期：____________
隐私/儿童声明复核人：________  日期：____________
权利台账签署人：____________  日期：____________

Google Play release / track：____________________
Apple App Store Connect build：__________________
冻结 commit：____________________________________
```
