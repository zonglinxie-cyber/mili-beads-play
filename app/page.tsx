"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type Pattern = {
  id: number;
  title: string;
  sub: string;
  category: string;
  difficulty: "入门" | "简单" | "进阶";
  time: string;
  colors: number;
  tone: string[];
  emoji: string;
  size: number;
  liked?: boolean;
};

const patterns: Pattern[] = [
  { id: 1, title: "晚安小狐狸", sub: "森林里的暖暖好梦", category: "小动物", difficulty: "简单", time: "25 分钟", colors: 5, tone: ["#ff7f48", "#ffe8c5", "#593e42"], emoji: "🦊", size: 16, liked: true },
  { id: 2, title: "草莓小屋", sub: "甜甜的花园角落", category: "甜品", difficulty: "入门", time: "18 分钟", colors: 4, tone: ["#ff7189", "#ffced7", "#6cb587"], emoji: "🍓", size: 14 },
  { id: 3, title: "云朵小猫", sub: "把好心情戴在头顶", category: "小动物", difficulty: "入门", time: "20 分钟", colors: 4, tone: ["#8f79dd", "#fff4df", "#5d5777"], emoji: "🐱", size: 15, liked: true },
  { id: 4, title: "彩虹冰淇淋", sub: "一口吃掉夏天", category: "甜品", difficulty: "简单", time: "22 分钟", colors: 7, tone: ["#ffc355", "#ff8099", "#62cfd1"], emoji: "🍦", size: 16 },
  { id: 5, title: "太空小火箭", sub: "飞去收集星光", category: "交通", difficulty: "简单", time: "28 分钟", colors: 6, tone: ["#6f77e9", "#ffb65c", "#f4f1f0"], emoji: "🚀", size: 18 },
  { id: 6, title: "小花盆", sub: "每天开一朵好心情", category: "植物", difficulty: "入门", time: "16 分钟", colors: 5, tone: ["#f17696", "#58bd83", "#f6be68"], emoji: "🌼", size: 13 },
];

const fox = [
  "0000011111100000",
  "0001122222211000",
  "0012222222221000",
  "0122222222222100",
  "1222222222222210",
  "1222332223322210",
  "1223342224332210",
  "1222224442222210",
  "0122244444222100",
  "0012224442221000",
  "0001222222210000",
  "0000122222100000",
  "0000011111000000",
].join("");

const foxColors = ["transparent", "#563b46", "#fb7650", "#fff4de", "#f4bd73"];

function BeadArt({ pattern, large = false }: { pattern: Pattern; large?: boolean }) {
  const cells = useMemo(() => Array.from({ length: pattern.size * pattern.size }, (_, i) => (i * 7 + pattern.id * 3) % 13 < 7), [pattern]);
  return (
    <div className={`bead-art ${large ? "bead-art-large" : ""}`} style={{ "--a": pattern.tone[0], "--b": pattern.tone[1], "--c": pattern.tone[2], "--n": pattern.size } as React.CSSProperties} aria-label={`${pattern.title} 拼豆预览`}>
      {cells.map((show, i) => <i key={i} className={show ? "on" : ""} />)}
      <span>{pattern.emoji}</span>
    </div>
  );
}

function FoxGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`fox-grid ${compact ? "compact" : ""}`} aria-label="晚安小狐狸拼豆图纸">
      {Array.from(fox).map((cell, index) => (
        <i key={index} style={{ background: foxColors[Number(cell)] }} />
      ))}
    </div>
  );
}

function printPattern() {
  const printable = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>晚安小狐狸｜拼豆图纸</title><style>body{font-family:Arial,"PingFang SC",sans-serif;color:#382d3b;padding:24px}.head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #eee;padding-bottom:14px}h1{margin:0;font-size:28px}.tag{background:#fff0e9;padding:6px 10px;border-radius:16px}.grid{display:grid;grid-template-columns:repeat(16,18px);gap:2px;margin:28px 0}.grid i{height:18px;border-radius:50%;box-shadow:inset 0 -2px 1px #0002}.legend{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.legend div{padding:9px;background:#faf7f1;border-radius:8px}small{color:#7c7180}</style></head><body><div class="head"><div><h1>晚安小狐狸</h1><small>16 × 13 格 · 简单 · 约 25 分钟</small></div><span class="tag">米粒的拼豆助手</span></div><div class="grid">${Array.from(fox).map(c=>`<i style="background:${foxColors[Number(c)]}"></i>`).join("")}</div><h3>配色清单</h3><div class="legend"><div>深棕 · 18 颗</div><div>橘色 · 95 颗</div><div>奶油白 · 42 颗</div><div>浅焦糖 · 20 颗</div></div><p><small>小提醒：熨烫请让大人帮忙，并使用烘焙纸隔开。</small></p><script>window.print()</script></body></html>`;
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (w) { w.document.write(printable); w.document.close(); }
}

export default function Home() {
  const [tab, setTab] = useState<"home" | "library" | "magic" | "mine">("home");
  const [filter, setFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<number[]>([1, 3]);
  const [notice, setNotice] = useState("");
  const [magicMode, setMagicMode] = useState<"animate" | "poster">("animate");
  const [uploadName, setUploadName] = useState("");
  const [magicResult, setMagicResult] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const visiblePatterns = patterns.filter((p) => (filter === "全部" || p.category === filter) && `${p.title}${p.sub}`.includes(search));
  const toast = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const selectPattern = (name: string) => { setTab("home"); toast(`已打开「${name}」的图纸`); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { setUploadName(file.name); setMagicResult(false); }
  };

  return (
    <main>
      <section className="mobile-shell">
        <header className="topbar">
          <button className="brand" onClick={() => setTab("home")} aria-label="返回首页"><span className="brand-mark">✦</span><span>米粒的<br /><b>拼豆助手</b></span></button>
          <div className="top-actions"><button aria-label="搜索图纸" onClick={() => setTab("library")}>⌕</button><button className="avatar" aria-label="我的作品" onClick={() => setTab("mine")}>米</button></div>
        </header>

        {tab === "home" && <>
          <section className="welcome">
            <div><p className="eyebrow">今天也来做点可爱的吧！</p><h1>嗨，米粒 <span>✦</span></h1><p>发现喜欢的图纸，把小小的豆子拼成大大的快乐。</p></div>
            <div className="sparkle-cloud">☁<b>✦</b></div>
          </section>
          <section className="continue-card card">
            <div className="card-title-row"><div><p className="eyebrow">继续制作</p><h2>晚安小狐狸 <span>🦊</span></h2></div><button className="more" onClick={() => selectPattern("晚安小狐狸")}>查看图纸 ›</button></div>
            <div className="continue-content"><div className="fox-frame"><FoxGrid compact /></div><div className="progress-info"><div className="progress-label"><b>第 8 步 / 共 13 步</b><span>61%</span></div><div className="progress"><i /></div><p>先完成脸颊的奶油白，再拼上小鼻子。</p><button className="primary small" onClick={() => toast("已从第 8 步继续，慢慢来就很好！")}>继续拼</button></div></div>
          </section>
          <section className="section-head"><div><p className="eyebrow">灵感图纸库</p><h2>今天想拼什么？</h2></div><button className="more" onClick={() => setTab("library")}>查看全部 ›</button></section>
          <div className="chip-row" aria-label="图纸分类">{["全部", "小动物", "甜品", "植物", "交通"].map(c => <button className={filter === c ? "chip active" : "chip"} key={c} onClick={() => { setFilter(c); setTab("library"); }}>{c === "全部" ? "✦ 全部" : c}</button>)}</div>
          <section className="pattern-scroller">{patterns.slice(0, 4).map(p => <PatternCard key={p.id} pattern={p} liked={liked.includes(p.id)} onLike={() => setLiked(v => v.includes(p.id) ? v.filter(x => x !== p.id) : [...v, p.id])} onSelect={() => selectPattern(p.title)} />)}</section>
          <section className="magic-banner" onClick={() => setTab("magic")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setTab("magic")}>
            <div className="magic-icon">✦<i>✦</i></div><div><p className="eyebrow">把作品变成魔法</p><h2>拼好的作品，动起来！</h2><p>上传一张作品照片，生成趣味小动画或纪念海报。</p></div><span>›</span>
          </section>
          <section className="safe-note"><span>♡</span><p><b>给小小创作者的提醒</b><br />需要熨烫时，记得请大人一起帮忙喔。</p></section>
        </>}

        {tab === "library" && <section className="library-page">
          <div className="page-heading"><p className="eyebrow">原创灵感图纸库</p><h1>找一张想做的吧</h1><p>每张图纸都有配色、格数和打印版。</p></div>
          <label className="search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜小动物、甜品……" /><button onClick={() => setSearch("")} aria-label="清除搜索">×</button></label>
          <div className="chip-row filters">{["全部", "小动物", "甜品", "植物", "交通"].map(c => <button className={filter === c ? "chip active" : "chip"} key={c} onClick={() => setFilter(c)}>{c}</button>)}</div>
          <div className="library-grid">{visiblePatterns.map(p => <PatternCard key={p.id} pattern={p} liked={liked.includes(p.id)} onLike={() => setLiked(v => v.includes(p.id) ? v.filter(x => x !== p.id) : [...v, p.id])} onSelect={() => selectPattern(p.title)} />)}</div>
          {!visiblePatterns.length && <div className="empty">没有找到这张图纸<br /><button className="text-button" onClick={() => { setSearch(""); setFilter("全部"); }}>看看全部图纸</button></div>}
          <div className="source-note">图纸为本应用原创示例或将来取得授权的作品。发布别人的图纸前，要先征得作者同意。</div>
        </section>}

        {tab === "magic" && <section className="magic-page">
          <div className="page-heading magic-heading"><p className="eyebrow">创作魔法屋</p><h1>让作品去冒险</h1><p>在家长陪同下上传作品照片，做一张专属纪念。</p></div>
          <div className="magic-tabs"><button className={magicMode === "animate" ? "selected" : ""} onClick={() => { setMagicMode("animate"); setMagicResult(false); }}><span>✦</span>作品小动画</button><button className={magicMode === "poster" ? "selected" : ""} onClick={() => { setMagicMode("poster"); setMagicResult(false); }}><span>▧</span>作品纪念卡</button></div>
          <div className="upload-card">
            <div className={`upload-preview ${magicResult ? "result" : ""}`}>{magicResult ? <><div className="result-art"><FoxGrid compact /></div><i className="orbit">✦</i><i className="orbit two">♥</i></> : <><span>▧</span><b>{uploadName || "放一张拼豆作品照片"}</b><small>照片仅用于这次创作，不会公开给陌生人。</small></>}</div>
            <input ref={uploadRef} onChange={onUpload} type="file" accept="image/*" hidden />
            <button className="secondary" onClick={() => uploadRef.current?.click()}>{uploadName ? "换一张照片" : "选择照片"}</button>
          </div>
          <div className="style-section"><div className="section-head"><div><p className="eyebrow">挑一个魔法</p><h2>{magicMode === "animate" ? "它会怎么动？" : "留住这一刻"}</h2></div></div><div className="style-grid">{(magicMode === "animate" ? [["🪽", "挥挥小手", "轻轻摇摆，闪出星光"], ["☁", "飞进云朵", "在软软的云上散步"], ["🌟", "星光出场", "像小明星一样登场"]] : [["🖼️", "花园纪念卡", "温柔的花花边框"], ["🎪", "马戏团海报", "热闹又有点淘气"], ["🌙", "晚安故事卡", "有月亮和小星星"]]).map(([icon, title, desc], index) => <button className={`style-option ${index === 0 ? "picked" : ""}`} key={title}><span>{icon}</span><b>{title}</b><small>{desc}</small></button>)}</div></div>
          <button className="primary make-button" disabled={!uploadName} onClick={() => { setMagicResult(true); toast(magicMode === "animate" ? "小狐狸已经开始挥手啦！" : "纪念卡制作完成啦！"); }}>{magicMode === "animate" ? "✦ 生成小动画" : "✦ 生成纪念卡"}</button>
          <p className="parent-note">家长说明：正式上线时，生成服务应提供明确的照片保存期限与删除入口；不要收集孩子姓名、学校或位置。</p>
        </section>}

        {tab === "mine" && <section className="mine-page"><div className="profile-hero"><div className="big-avatar">米</div><div><p className="eyebrow">小小创作者</p><h1>米粒的作品集</h1><p>这个月已经完成 3 个小作品！</p></div></div><div className="stats"><div><b>3</b><span>完成作品</span></div><div><b>5</b><span>收藏图纸</span></div><div><b>240</b><span>快乐豆子</span></div></div><section className="achievement"><span>🏅</span><div><b>第一枚创作徽章</b><p>完成第一张图纸，就能点亮它。</p></div></section><section className="section-head"><div><p className="eyebrow">收藏夹</p><h2>下次想做</h2></div></section><div className="library-grid">{patterns.filter(p => liked.includes(p.id)).map(p => <PatternCard key={p.id} pattern={p} liked onLike={() => setLiked(v => v.filter(x => x !== p.id))} onSelect={() => selectPattern(p.title)} />)}</div></section>}

        <nav className="bottom-nav" aria-label="主导航"><button className={tab === "home" ? "current" : ""} onClick={() => setTab("home")}><span>⌂</span>首页</button><button className={tab === "library" ? "current" : ""} onClick={() => setTab("library")}><span>▦</span>图纸</button><button className={tab === "magic" ? "current plus" : "plus"} onClick={() => setTab("magic")}><span>✦</span>魔法屋</button><button className={tab === "mine" ? "current" : ""} onClick={() => setTab("mine")}><span>☺</span>我的</button></nav>
      </section>
      <aside className="desktop-story"><div className="story-card"><p className="eyebrow">米粒的拼豆助手 · MVP</p><h2>先把孩子真正会用的体验做对。</h2><p>手机端原型包含可浏览的原创图纸、可打印的格子版，以及受家长监督的作品变身入口。</p><div className="checklist"><span>✓ 图纸库不直接搬运作者作品</span><span>✓ 熨烫安全提示写进流程</span><span>✓ 儿童照片默认不公开</span></div><button onClick={printPattern}>打印「晚安小狐狸」示例图纸</button></div></aside>
      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

function PatternCard({ pattern, liked, onLike, onSelect }: { pattern: Pattern; liked: boolean; onLike: () => void; onSelect: () => void }) {
  return <article className="pattern-card"><button className={`heart ${liked ? "liked" : ""}`} onClick={onLike} aria-label={liked ? "取消收藏" : "收藏图纸"}>{liked ? "♥" : "♡"}</button><button className="pattern-visual" onClick={onSelect} aria-label={`打开${pattern.title}`}><BeadArt pattern={pattern} /></button><div className="pattern-copy"><div className="difficulty"><span className={pattern.difficulty}>{pattern.difficulty}</span><small>{pattern.time}</small></div><h3>{pattern.title}</h3><p>{pattern.sub}</p><button className="print-link" onClick={pattern.id === 1 ? printPattern : () => onSelect()}>▣ {pattern.id === 1 ? "打印图纸" : "查看图纸"}</button></div></article>;
}
