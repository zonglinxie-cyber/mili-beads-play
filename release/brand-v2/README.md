# 米粒拼豆社品牌 v2：选择与复现记录

记录日期：2026-08-12（Asia/Shanghai）

## 最终选择

最终选择 `selected-v4-raw.png` 作为品牌 v2 的原始视觉基底。原始生成文件为：

- `/Users/derekfly3/.codex/generated_images/019ff55f-a3fb-7ed0-8959-6bcf884ab6e6/exec-486ca6e1-3c15-4ff6-90f0-7b92754162e6.png`
- 生成时间：2026-08-12 22:25:41 +0800
- 原始文件 SHA-256：`61aae53e0723cb37cad074c65e46eb861c328bc4c9fbc2da44eec01291d20a96`

经确定性 1024×1024 RGB PNG 归一化后，仓库内唯一品牌源为：

- `public/app-icon-1024.png`
- SHA-256：`441af858f1bbf8391bbfb27d99aa60813a584ce07eecc0124b9d3c78796b5aa3`

该哈希固定在 `tests/native-brand-assets.test.mjs`，所有 Web、Android、iOS 派生资产由 `scripts/generate-native-brand-assets.mjs` 生成并可用 `npm run assets:native:check` 逐字节复核。

## 候选来源与选择理由

- `before-app-icon-1024.png`：旧版品牌源，SHA-256 `9115a018a9f279c5559e02b6cdfe7fb0685527fcf9d3816535179c53c2a0cfde`。宇航头盔明确，但耳朵低、口鼻团块偏圆，在 64px 下容易被读成熊、水獭或普通圆脸动物，因此淘汰。
- `candidate-v1-raw.png`：第一版高耳猫，原始文件 `exec-6191155f-54f7-458c-b931-3df1ed63bdcd.png`，生成时间 2026-08-12 22:17:40 +0800，SHA-256 `7450e68ba76a9f93d9cbd22c271356122ed21934802e144207b058bad3330595`。猫类特征清楚，但头盔更像奶油项链，宇航员身份弱，因此未选。
- `candidate-v3-raw.png`：第三版宇航猫，原始文件 `exec-d1218b25-624b-4260-9397-1df8060fbbfe.png`，生成时间 2026-08-12 22:23:30 +0800，SHA-256 `ef547ab8ed7eece73f4ecadf08d08d8c42dffdfd85cd316261a2a8f9494f245f`。猫与头盔轮廓都完整，但额头三条深色纹在 64px 下显得皱眉、偏虎，耳内奶油色削弱幼态，因此未选。
- `selected-v4-raw.png`：在 v3 基础上定向精修；保留高耳、六根胡须、W 形微笑、宇航头盔、三颗领口按钮和黄色星星，同时改为粉色耳内、圆眼和更轻的额纹。64/128/192/512 对比中，猫类识别、儿童友好度和宇航主题兼顾最好，因此选定。
- `rejected-v5-raw.png`：最终追加候选，原始文件 `exec-0d18e495-a119-4e42-b873-c502c064db48.png`，生成时间 2026-08-12 22:27:56 +0800，SHA-256 `75be4bfb0bb840c8da24defe9f318ecab057bfbba4219cb7f7a6928524d0eb56`。鼻子更明确，但双眼方向与左右胡须长度不够一致，脸部占比也压缩了宇航服轮廓；没有因为版本号更高而覆盖 v4。

本目录的 `blindtest-*.png`、`final-compare-*.png` 保存同裁切、同尺寸的视觉选择证据；`pattern-audit-*.png` 记录了 12 张产品图案与品牌图标的区别。

## 重要边界

品牌图标是 AI 生成后经人工多尺寸筛选、确定性归一化的拼豆质感品牌资产，不是逐颗可复刻的图纸，也不承诺固定豆数、规则底板坐标或物理熔拼结果。应用内 18×18 图纸才是可打印、可逐格制作的产品内容。商店功能图同时展示品牌猫与真实 18×18 图纸，以避免混淆。

## 确定性派生资产

`scripts/generate-native-brand-assets.mjs` 当前从唯一 1024 源生成 40 个 Web/native 文件：

- Web：`public/brand-avatar-64.png`、`public/brand-avatar-128.png`、`public/app-icon-192.png`、`public/app-icon-512.png`、`public/apple-touch-icon.png`、高耳宇航猫 `public/favicon.svg` 与 1200×630 `public/og-v2.png` 分享卡。两个小头像还会逐字节复制到 `native-public/`，供离线原生 WebView 头部加载。
- iOS：`ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`；三张 2732×2732 `Splash.imageset` 启动图。
- Android：mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi 的 legacy launcher、round launcher、adaptive foreground；11 张横竖屏 splash。
- QA：`release/native-brand-preview.png`。

商店素材由 `release/store-assets-v10/build_store_assets.py` 生成：

- `google-play-icon-512.png`：品牌 v2 的 512×512、32-bit RGBA 上架图标；文件保留 Alpha 通道但每个像素的 Alpha 值均为 255，满足 Google Play 对“32-bit PNG (with alpha)”和全幅方形底图的组合要求。
- `google-play-feature-graphic-1024x500.png`：品牌 v2 猫作为识别锚点，背后保留真实 18×18 火箭猫图纸作为玩法证据。
- `review-contact-sheet.jpg` 与 `manifest.json`：视觉复核、尺寸、模式、哈希和来源记录。

商店截图必须由 `capture_final_states.mjs` 从实际 Web 构建重新捕获；生成脚本不会把旧截图伪造成已更新界面。
