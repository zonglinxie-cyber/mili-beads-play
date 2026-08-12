import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  return <main className="privacy-page">
    <Link href="/" className="privacy-route-back"><ArrowLeft aria-hidden="true"/>返回米粒拼豆社</Link>
    <article className="privacy-card">
      <small>给家长的帮助</small>
      <h1>支持与常见问题</h1>
      <p>米粒拼豆社无需登录、没有广告或内购。拼豆进度和作品记录只保存在当前设备。</p>

      <h2>图纸或进度没有显示</h2>
      <p>请先返回首页，再重新打开同一张图纸。不要清除应用数据或浏览器网站数据；这些操作会永久删除本机进度。</p>

      <h2>无法保存或分享图片</h2>
      <p>请由家长持续按住保存按钮，完成随机算术验证，再在系统面板中选择保存或分享目标。应用不会读取相册或通讯录。</p>

      <h2>实体拼豆安全</h2>
      <p>熨烫、裁剪和使用高温工具必须由成年人完成。小颗粒应远离低龄儿童和宠物。</p>

      <h2>联系我们</h2>
      <p>持续监控的支持邮箱将在正式商店提交前填写。邮箱未填写前，本页只用于发行准备，不能作为 App Store 或 Google Play 的正式 Support URL。</p>

      <h2>隐私</h2>
      <p><Link href="/privacy">查看家长与隐私说明</Link></p>
      <p className="privacy-updated">更新日期：2026 年 8 月 12 日</p>
    </article>
  </main>;
}
