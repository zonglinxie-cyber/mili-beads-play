import Link from "next/link";

export default function PrivacyPage() {
  return <main style={{maxWidth:680,margin:"0 auto",padding:"32px 22px",fontFamily:'"Noto Sans SC",sans-serif',lineHeight:1.75,color:"#27233b"}}>
    <Link href="/" style={{color:"#5d4b81",textDecoration:"none",fontWeight:700}}>← 返回米粒拼豆社</Link>
    <h1 style={{fontSize:30,marginTop:26}}>家长与隐私说明</h1>
    <p>米粒拼豆社是一款为家庭使用设计的儿童拼豆游戏，不要求注册账号，不包含广告、公开聊天、排行榜或应用内购买。</p>
    <h2>数据如何保存</h2>
    <p>图纸进度、完成记录和作品册只保存在当前设备的浏览器中，不会上传到服务器。清除浏览器数据会同时清除这些记录。</p>
    <h2>权限与个人信息</h2>
    <p>当前版本不收集姓名、年龄、学校、位置、通讯录或照片，也不使用第三方行为追踪。游戏可能调用设备震动提供轻微触觉反馈，用户可以在系统设置中关闭。</p>
    <h2>儿童使用建议</h2>
    <p>游戏中的熨烫和裁剪步骤必须由成年人完成。建议每次使用 20–30 分钟并注意眼睛休息。</p>
    <h2>家长控制</h2>
    <p>本游戏没有外部社区和陌生人互动。家长可以通过浏览器的“清除网站数据”功能移除本机全部游戏记录。</p>
    <p style={{marginTop:32,color:"#7d788a",fontSize:13}}>更新日期：2026 年 8 月 12 日</p>
  </main>;
}
