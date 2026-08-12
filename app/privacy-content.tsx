import { ArrowLeft } from "lucide-react";

type PrivacyContentProps = {
  onBack?: () => void;
  onDelete?: () => void;
};

export function PrivacyContent({ onBack, onDelete }: PrivacyContentProps) {
  return <article className="privacy-card">
    {onBack && <button className="privacy-back" onClick={onBack}><ArrowLeft aria-hidden="true"/>返回游戏</button>}
    <small>给家长的说明</small>
    <h1>家长与隐私说明</h1>
    <p>米粒拼豆社是一款为家庭使用设计的儿童拼豆游戏，不要求注册账号，不包含广告、公开聊天、排行榜或应用内购买。</p>

    <h2>谁在提供这款应用</h2>
    <p>开发与数据责任方：“米粒拼豆社”家庭独立开发项目。正式商店发行前，应用页面和本政策将同时公布可验证的支持邮箱。</p>

    <h2>会保存什么</h2>
    <p>应用仅在当前设备本机保存图纸进度、完成记录和作品册。应用自身不会把这些记录发送给开发者或第三方；若家长开启了操作系统备份，系统可能按自身规则备份应用数据。</p>

    <h2>不会收集什么</h2>
    <p>当前版本不收集姓名、年龄、学校、位置、通讯录或照片，不使用第三方行为追踪。游戏可能调用设备震动提供轻微触觉反馈，用户可以在系统设置中关闭。</p>

    <h2>保留与删除</h2>
    <p>记录会保留到家长在本页选择“清除本机游戏记录”、清除网站数据或卸载应用为止。删除后无法由开发者恢复，因为开发者没有这些数据的服务器副本。</p>

    <h2>儿童使用建议</h2>
    <p>游戏中的熨烫和裁剪步骤必须由成年人完成。建议每次使用 20–30 分钟，并注意眼睛休息。应用没有外部社区、陌生人互动或导向儿童的外部链接。</p>

    {onDelete && <button className="privacy-delete" onClick={onDelete}>清除本机游戏记录</button>}
    <p className="privacy-updated">更新日期：2026 年 8 月 12 日</p>
  </article>;
}
