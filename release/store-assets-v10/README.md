# 最终上架素材 v10

本目录只包含独立商店素材，不修改应用源码，也不执行 `cap sync`。截图来自最终 Web 生产构建，完成/动画/打印状态通过与 E2E 相同的 170 颗真实点击路径生成；未引入新的 AI 图像。

## 已生成

- `google-play-feature-graphic-1024x500.png`：Google Play 功能宣传图，1024×500、RGB、无 Alpha。
- `google-play-icon-512.png`：当前 512 图标的独立 RGBA 32-bit 上架版，512×512、Alpha 全不透明、低于 1 MB；已机械清除原图烘焙的黑色圆角外框并补为满幅紫色背景，适配 Play 动态圆角。
- `google-play-phone-01..05-1080x2160.png`：首页、9 区放大拼制、完成庆祝、三层动画、1200×1500 打印图预览；均为 1080×2160、RGB、无 Alpha。
- `app-store-iphone69-web-composite-01..05-1320x2868.png`：同一组五种状态，符合 iPhone 6.9 英寸 1320×2868 文件规格。**这些是最终网页状态按目标视口渲染的构图，不是真机截图。**
- `print-source-rocket-cat-1200x1500.png`：网页实际生成的高清打印源图，浏览器 natural size 已断言为 1200×1500。
- `manifest.json`：尺寸、色彩模式、字节数与来源记录。

## 规格依据与判断

- Google Play 功能宣传图要求 1024×500，JPEG 或 24-bit PNG 且无 Alpha。
- Google Play 图标要求 512×512、32-bit PNG、sRGB、最大 1024 KB，并由 Play 动态施加圆角。当前 `public/app-icon-512.png` 是 512×512 sRGB，但为 24-bit RGB，且已经烘焙黑色圆角外框，所以**源文件不应直接上传**。本目录的独立上架版已机械转为 RGBA 32-bit、Alpha 全不透明并恢复满幅背景。
- Google Play 手机截图要求最短边至少 320、最长边不超过 3840，且最长边不能超过最短边两倍。本目录导出为 1080×2160，恰好 2:1，RGB、无 Alpha，满足文件级上传约束。
- App Store iPhone 6.9 英寸接受 1320×2868。本目录五张 iPhone 文件满足像素与无 Alpha 要求；但它们是 Web 构图，非真机截图，提交前应由负责人确认是否采用。

## 完成证据

- 最终代码哈希以 `manifest.json` 的 `provenance.codeHashes` 为准；生成脚本会直接从当前源码计算，避免素材说明与最终构建漂移。
- Play 与 iPhone 两次独立流程均断言：`100%`、`完成啦，米粒！`、角色/道具/特效三层文案全部可见、打印图 natural size 为 `1200×1500`。
- `TARGETED_DEVICE_FAMILY=1`，当前只面向 iPhone，因此没有生成 iPad 截图。
- 冷静保留项：正式提交前仍需在 Play Console/App Store Connect 做一次实际上传校验；iPhone 五张是明确标注的 Web 构图，不是真机截图。

规格来源：

- Google Play “Add preview assets to showcase your app”：https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
- Google Play “Icon design specifications”：https://developer.android.com/distribute/google-play/resources/icon-design-specifications?hl=en
- Apple “Screenshot specifications”：https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/

重新捕获与生成（先启动最终生产服务）：

```bash
node --experimental-strip-types release/store-assets-v10/capture_final_states.mjs
python3 release/store-assets-v10/build_store_assets.py
```
