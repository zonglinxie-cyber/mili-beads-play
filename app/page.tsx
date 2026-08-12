"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Difficulty = "挑战" | "高手" | "大师";
type PixelProject = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  structure: string;
  difficulty: Difficulty;
  time: string;
  beads: number;
  size: number;
  parts: string[];
  palette: string[];
  colorNames: string[];
  source: string;
  featured?: boolean;
};

const PROJECTS: PixelProject[] = [
  { id: "owl", title: "月光猫头鹰夜灯", tagline: "三层叠景，背后放一颗小灯", category: "光影", structure: "三层景深", difficulty: "高手", time: "约 3 小时", beads: 986, size: 24, parts: ["月夜背景", "猫头鹰前景", "底座卡槽"], palette: ["#251f4f", "#5b4a9d", "#f2c75c", "#f8e9c4", "#a76c4a", "#dd765d"], colorNames: ["午夜蓝", "星云紫", "月光黄", "奶油白", "栗子棕", "晚霞橘"], source: "原创改编 · 立体灯结构", featured: true },
  { id: "carousel", title: "草莓旋转木马", tagline: "八块插接，转盘真的可以转", category: "机关", structure: "旋转机关", difficulty: "大师", time: "约 5 小时", beads: 1480, size: 24, parts: ["顶棚 A", "顶棚 B", "木马 ×2", "中心轴", "旋转底盘", "支架 ×2"], palette: ["#c73e64", "#f0819c", "#ffd7a8", "#fff4dc", "#65a878", "#8b5a57"], colorNames: ["莓果红", "草莓粉", "奶油黄", "珍珠白", "叶子绿", "可可棕"], source: "原创改编 · 插接转盘" },
  { id: "jelly", title: "深海水母摇摇乐", tagline: "透明夹层里藏着会流动的星砂", category: "摇摇乐", structure: "透明夹层", difficulty: "挑战", time: "约 2 小时", beads: 720, size: 24, parts: ["深海背板", "水母轮廓", "透明夹层框", "封面装饰"], palette: ["#152c55", "#315f91", "#66c6cf", "#b8eff0", "#f3a9cf", "#f8e6a3"], colorNames: ["深海蓝", "潮汐蓝", "水光青", "冰晶白", "珊瑚粉", "星砂黄"], source: "原创改编 · 摇摇夹层", featured: true },
  { id: "rabbit", title: "银河小兔飞船", tagline: "打开舱门，小兔会探出脑袋", category: "机关", structure: "翻盖机关", difficulty: "高手", time: "约 3.5 小时", beads: 1120, size: 24, parts: ["飞船正面", "飞船背面", "翻盖舱门", "小兔机关", "火焰支架"], palette: ["#3d347a", "#7667c6", "#e8e5f7", "#79c6d2", "#f08b72", "#f5cc61"], colorNames: ["宇宙紫", "星环紫", "月尘白", "舷窗青", "火焰橘", "星光黄"], source: "原创改编 · 翻盖活动件" },
  { id: "cabin", title: "森林蘑菇收纳屋", tagline: "屋顶能拿下来，里面可以藏宝物", category: "实用", structure: "立体收纳", difficulty: "大师", time: "约 6 小时", beads: 1860, size: 24, parts: ["正面墙", "背面墙", "侧墙 ×2", "蘑菇屋顶 ×2", "地板", "门窗装饰"], palette: ["#7b3e3e", "#d95c55", "#f5d8b2", "#8fba6b", "#476d4e", "#e8a85c"], colorNames: ["砖红", "蘑菇红", "木屋米", "苔藓绿", "森林绿", "蜂蜜黄"], source: "原创改编 · 可开合盒体", featured: true },
  { id: "koi", title: "樱花锦鲤景深画", tagline: "前中后三层，侧看像一个小池塘", category: "光影", structure: "四层景深", difficulty: "高手", time: "约 4 小时", beads: 1360, size: 24, parts: ["池水背景", "锦鲤中景", "水草前景", "樱花边框"], palette: ["#28576f", "#4d91a3", "#a7d4c8", "#ef866f", "#f4b8bf", "#f6e8ca"], colorNames: ["湖底蓝", "水波青", "浅荷绿", "锦鲤橘", "樱花粉", "月白"], source: "原创改编 · 多层画框" },
  { id: "dragon", title: "会摆尾的云间小龙", tagline: "四段身体用线连接，拿起来会摆动", category: "机关", structure: "活动关节", difficulty: "挑战", time: "约 2.5 小时", beads: 890, size: 24, parts: ["龙头", "身体前段", "身体后段", "云朵底座"], palette: ["#255a57", "#4f9b7b", "#a8db9c", "#f5df8c", "#f7f0dc", "#d76d5c"], colorNames: ["墨玉绿", "翡翠绿", "嫩芽绿", "龙角金", "云朵白", "朱砂红"], source: "原创改编 · 线连接关节" },
  { id: "aquarium", title: "桌面迷你水族箱", tagline: "六面插接，鱼儿能在卡槽里换位置", category: "实用", structure: "立体场景", difficulty: "大师", time: "约 5.5 小时", beads: 1720, size: 24, parts: ["正面水箱", "背面水箱", "侧板 ×2", "顶板", "底板", "可换鱼儿 ×3"], palette: ["#204b6c", "#438aa0", "#8bd0cf", "#f6dc77", "#ef7f62", "#75534a"], colorNames: ["深水蓝", "玻璃青", "泡泡青", "沙滩黄", "小鱼橘", "沉木棕"], source: "原创改编 · 可换场景" },
];

const categories = ["全部", "机关", "光影", "摇摇乐", "实用"];

function createGrid(project: PixelProject, partIndex = 0) {
  const n = project.size;
  const grid = Array<number>(n * n).fill(-1);
  const set = (x: number, y: number, c: number) => { if (x >= 0 && y >= 0 && x < n && y < n) grid[y * n + x] = c; };
  const ellipse = (cx: number, cy: number, rx: number, ry: number, c: number) => {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (((x - cx) ** 2) / rx ** 2 + ((y - cy) ** 2) / ry ** 2 <= 1) set(x, y, c);
  };
  const rect = (x1: number, y1: number, x2: number, y2: number, c: number) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, c); };
  const line = (x1: number, y1: number, x2: number, y2: number, c: number, w = 1) => {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i++) { const x = Math.round(x1 + (x2 - x1) * i / steps); const y = Math.round(y1 + (y2 - y1) * i / steps); for (let yy = -w; yy <= w; yy++) for (let xx = -w; xx <= w; xx++) set(x + xx, y + yy, c); }
  };

  if (project.id === "owl") {
    rect(2, 2, 21, 21, 0); ellipse(17, 6, 4, 4, 2); ellipse(9, 12, 7, 8, 4); ellipse(9, 12, 5, 6, 1); ellipse(6.5, 10, 2.2, 2.2, 3); ellipse(11.5, 10, 2.2, 2.2, 3); set(7, 10, 0); set(11, 10, 0); set(9, 12, 2); line(3, 19, 18, 19, 4); [[4,5],[7,3],[20,12],[18,17],[4,15]].forEach(([x,y])=>set(x,y,2));
  } else if (project.id === "carousel") {
    ellipse(12, 6, 10, 4, 0); for (let x = 3; x < 22; x++) if (x % 4 < 2) line(x, 4, x, 8, 1); rect(11, 6, 13, 20, 5); ellipse(12, 20, 10, 2, 0); ellipse(8, 14, 4, 2, 3); ellipse(16, 14, 4, 2, 3); line(6, 12, 6, 18, 5); line(18, 12, 18, 18, 5); set(5,13,4); set(19,13,4); rect(2,21,21,22,2);
  } else if (project.id === "jelly") {
    rect(2, 2, 21, 21, 0); for (let y=3;y<21;y+=4) for(let x=4+(y%3);x<21;x+=6) set(x,y,5); ellipse(12, 10, 7, 6, 2); rect(5,10,19,12,2); ellipse(9,10,1,1,3); ellipse(15,10,1,1,3); line(7,13,6,20,4); line(10,13,11,21,3); line(14,13,13,21,4); line(17,13,18,20,3); ellipse(12,4,3,1,1);
  } else if (project.id === "rabbit") {
    ellipse(12, 14, 10, 7, 1); ellipse(12, 12, 6, 5, 3); ellipse(12, 11, 4, 4, 2); ellipse(10,7,1.5,4,2); ellipse(14,7,1.5,4,2); set(10,11,0); set(14,11,0); set(12,13,4); line(4,14,1,10,5); line(20,14,23,10,5); ellipse(12,20,4,2,4); set(11,21,5); set(13,21,5);
  } else if (project.id === "cabin") {
    rect(4,9,20,21,2); for (let y=9;y<22;y+=3) line(4,y,20,y,5); for(let y=3;y<11;y++) ellipse(12,y,10-y/3,3,1); ellipse(12,5,10,4,0); for(let x=5;x<20;x+=5) ellipse(x,5,1,1,3); rect(9,14,14,21,0); rect(6,12,8,15,5); rect(16,12,18,15,5); set(13,18,5); line(3,21,21,21,4);
  } else if (project.id === "koi") {
    rect(2,2,21,21,0); for(let y=4;y<21;y+=4) line(3,y,20,y-1,1); ellipse(9,11,5,2.5,3); ellipse(16,15,5,2.5,5); set(5,11,5); set(13,15,3); line(4,11,2,9,3); line(20,15,22,17,5); ellipse(6,6,3,1,4); ellipse(18,7,3,1,4); for(let x=3;x<22;x+=4) set(x,3+(x%5),2);
  } else if (project.id === "dragon") {
    ellipse(8,9,6,5,1); ellipse(15,14,7,5,2); ellipse(20,18,3,2,1); ellipse(6,8,2,2,3); set(5,8,0); line(4,5,2,2,3); line(8,5,10,2,3); line(10,12,17,17,2,1); line(17,17,22,20,1,1); line(5,13,3,18,5); ellipse(12,21,10,2,4);
  } else {
    rect(2,3,21,21,0); rect(3,4,20,19,1); for(let x=4;x<20;x+=4) set(x,6+(x%7),2); ellipse(9,12,4,2,4); ellipse(16,9,3,1.5,3); line(4,18,20,18,5); for(let x=5;x<21;x+=3) line(x,18,x-1,14,5); for(let y=5;y<18;y+=4) set(19,y,2);
  }

  if (partIndex > 0) {
    const shifted = Array<number>(n*n).fill(-1);
    grid.forEach((v,i) => { if (v >= 0) { const x=i%n, y=Math.floor(i/n); const nx=(x+partIndex*2)%n; if ((x+y+partIndex)%4 !== 0) shifted[y*n+nx]=(v+partIndex)%project.palette.length; }});
    return shifted;
  }
  return grid;
}

function countColors(grid: number[], colors: number) {
  return Array.from({ length: colors }, (_, color) => grid.filter(v => v === color).length);
}

function PixelBoard({ project, part = 0, focus = null, compact = false, zoom = 1 }: { project: PixelProject; part?: number; focus?: number | null; compact?: boolean; zoom?: number }) {
  const grid = useMemo(() => createGrid(project, part), [project, part]);
  return <div className={`pixel-board ${compact ? "compact" : ""}`} style={{ "--grid": project.size, "--zoom": zoom } as React.CSSProperties} aria-label={`${project.title}${project.parts[part]}图纸`}>
    {grid.map((color, i) => <i key={i} className={color < 0 ? "empty" : focus !== null && color !== focus ? "muted-bead" : ""} style={color < 0 ? undefined : { backgroundColor: project.palette[color] }}><span>{color >= 0 ? color + 1 : ""}</span></i>)}
  </div>;
}

function ProjectCard({ project, onOpen, favorite, onFavorite }: { project: PixelProject; onOpen: () => void; favorite: boolean; onFavorite: () => void }) {
  return <article className="project-card">
    <button className={`favorite ${favorite ? "saved" : ""}`} onClick={onFavorite} aria-label={favorite ? "取消收藏" : "收藏"}>{favorite ? "♥" : "♡"}</button>
    <button className="project-art" onClick={onOpen}><PixelBoard project={project} compact /><span className="structure-tag">{project.structure}</span></button>
    <div className="project-copy"><div className="meta"><span className={project.difficulty}>{project.difficulty}</span><small>{project.time}</small></div><h3>{project.title}</h3><p>{project.tagline}</p><div className="card-foot"><b>{project.parts.length} 个零件</b><button onClick={onOpen}>打开图纸 →</button></div></div>
  </article>;
}

function printProject(project: PixelProject, part: number) {
  const grid = createGrid(project, part);
  const counts = countColors(grid, project.palette.length);
  const cells = grid.map(v => `<i class="${v < 0 ? "empty" : ""}" style="${v < 0 ? "" : `background:${project.palette[v]}`}">${v < 0 ? "" : v + 1}</i>`).join("");
  const legend = counts.map((count,i)=>`<div><i style="background:${project.palette[i]}"></i><b>${i+1} · ${project.colorNames[i]}</b><span>${count} 颗</span></div>`).join("");
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return;
  popup.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${project.title}｜${project.parts[part]}</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,"PingFang SC",sans-serif;color:#2b2940}header{display:flex;justify-content:space-between;border-bottom:2px solid #2b2940;padding-bottom:10px}h1{font-size:24px;margin:0 0 4px}p{margin:0;color:#777;font-size:12px}.grid{display:grid;grid-template-columns:repeat(${project.size},1fr);width:174mm;height:174mm;margin:10mm auto;gap:.35mm}.grid i{display:grid;place-items:center;border-radius:50%;border:.2mm solid #0002;font-size:5.5pt;font-style:normal;color:#222}.grid i.empty{border:.2mm solid #ddd;border-radius:0}.legend{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.legend div{display:grid;grid-template-columns:18px 1fr auto;gap:7px;align-items:center;border:1px solid #ddd;padding:6px;border-radius:6px;font-size:10px}.legend i{width:16px;height:16px;border-radius:50%}.legend span{color:#777}.tip{margin-top:10px;padding:8px;background:#f4f1ec}.tip b{color:#d35f50}</style></head><body><header><div><h1>${project.title}</h1><p>零件 ${part+1}/${project.parts.length} · ${project.parts[part]} · ${project.size} × ${project.size} 格</p></div><p>米粒的拼豆助手</p></header><div class="grid">${cells}</div><div class="legend">${legend}</div><p class="tip"><b>装配提示：</b>完成全部零件后先试拼，再由大人隔烘焙纸熨烫。活动接口不要熨得过度。</p><script>window.print()</script></body></html>`);
  popup.document.close();
}

export default function Home() {
  const [screen, setScreen] = useState<"discover" | "library" | "detail" | "magic" | "mine">("discover");
  const [activeId, setActiveId] = useState("owl");
  const [part, setPart] = useState(0);
  const [focusColor, setFocusColor] = useState<number | null>(null);
  const [doneColors, setDoneColors] = useState<number[]>([]);
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["owl", "jelly", "cabin"]);
  const [toast, setToast] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [magicMode, setMagicMode] = useState<"move" | "scene">("move");
  const [magicStyle, setMagicStyle] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [boardZoom, setBoardZoom] = useState(1);
  const [fullscreenBoard, setFullscreenBoard] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const project = PROJECTS.find(p => p.id === activeId) ?? PROJECTS[0];
  const grid = useMemo(() => createGrid(project, part), [project, part]);
  const counts = useMemo(() => countColors(grid, project.palette.length), [grid, project]);
  const filtered = PROJECTS.filter(p => (category === "全部" || p.category === category) && `${p.title}${p.tagline}${p.structure}`.includes(query));
  const progress = Math.round(doneColors.length / project.palette.length * 100);

  useEffect(() => {
    const saved = window.localStorage.getItem("mili-beads-state");
    if (saved) try { const data = JSON.parse(saved); setFavorites(data.favorites ?? favorites); } catch { /* ignore old data */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { window.localStorage.setItem("mili-beads-state", JSON.stringify({ favorites })); }, [favorites]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 1800); };
  const openProject = (id: string) => { setActiveId(id); setPart(0); setFocusColor(null); setDoneColors([]); setBoardZoom(1); setScreen("detail"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleFavorite = (id: string) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const onUpload = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; if (imageUrl) URL.revokeObjectURL(imageUrl); setImageUrl(URL.createObjectURL(file)); setImageName(file.name); setGenerated(false); };

  return <main>
    <section className="app-shell">
      <header className="topbar"><button className="brand" onClick={() => setScreen("discover")}><span>米</span><div><b>米粒的拼豆助手</b><small>今天拼一个不一样的</small></div></button><button className="profile" onClick={() => setScreen("mine")}>M</button></header>

      {screen === "discover" && <>
        <section className="hero"><p className="kicker">今天的宝藏图纸</p><h1>会发光、会转，<br />还会藏小秘密。</h1><p>这里没有随手就能搜到的小图。挑一个真正值得慢慢完成的作品吧。</p><button onClick={() => openProject("carousel")}>挑战旋转木马 <span>→</span></button><div className="hero-board"><PixelBoard project={PROJECTS[1]} compact /><i>✦</i><i>✦</i></div></section>
        <section className="section-heading"><div><p className="kicker">本周精选</p><h2>有机关的图纸</h2></div><button onClick={() => { setCategory("机关"); setScreen("library"); }}>全部 8 张 →</button></section>
        <div className="story-strip">{PROJECTS.filter(p => p.featured).map(p => <button key={p.id} onClick={() => openProject(p.id)}><span><PixelBoard project={p} compact /></span><b>{p.title}</b><small>{p.structure}</small></button>)}</div>
        <section className="continue-panel"><div><p className="kicker">继续上次的制作</p><h2>月光猫头鹰夜灯</h2><p>猫头鹰前景 · 颜色 3/6</p><div className="progress"><i style={{ width: "50%" }} /></div><button onClick={() => openProject("owl")}>继续拼</button></div><PixelBoard project={PROJECTS[0]} compact /></section>
        <section className="section-heading"><div><p className="kicker">按玩法找</p><h2>她今天想玩什么？</h2></div></section>
        <div className="play-grid">{[["↻","会动的","转盘、关节和翻盖","机关"],["✧","会发光的","夜灯和透明叠景","光影"],["⠿","能装东西","盒子、笔筒和摆件","实用"],["⋆","摇一摇的","星砂在夹层里流动","摇摇乐"]].map(([icon,title,sub,cat])=><button key={title} onClick={()=>{setCategory(cat);setScreen("library")}}><span>{icon}</span><div><b>{title}</b><small>{sub}</small></div><i>→</i></button>)}</div>
        <button className="magic-teaser" onClick={() => setScreen("magic")}><span>✦</span><div><b>作品完成以后呢？</b><p>拍一张照片，让它摇摆、飞行，进入故事场景。</p></div><i>→</i></button>
      </>}

      {screen === "library" && <section className="library-page">
        <div className="page-title"><p className="kicker">宝藏图纸库</p><h1>挑一个大工程</h1><p>按结构找，不再被普通的小图案淹没。</p></div>
        <label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜夜灯、机关、收纳盒…" />{query && <button onClick={()=>setQuery("")}>×</button>}</label>
        <div className="chips">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="result-count"><b>{filtered.length} 个不常见的作品</b><span>按挑战感精选</span></div>
        <div className="project-grid">{filtered.map(p=><ProjectCard key={p.id} project={p} onOpen={()=>openProject(p.id)} favorite={favorites.includes(p.id)} onFavorite={()=>toggleFavorite(p.id)} />)}</div>
        {!filtered.length && <div className="empty">暂时没找到。换个结构词试试吧。</div>}
      </section>}

      {screen === "detail" && <section className="detail-page">
        <button className="back" onClick={()=>setScreen("library")}>← 返回图纸库</button>
        <div className="detail-head"><div><span className={`level ${project.difficulty}`}>{project.difficulty}</span><span>{project.structure}</span></div><h1>{project.title}</h1><p>{project.tagline}</p><small>{project.source}</small></div>
        <div className="detail-stats"><div><b>{project.parts.length}</b><span>零件</span></div><div><b>{project.beads.toLocaleString()}</b><span>约需豆子</span></div><div><b>{project.time.replace("约 ","")}</b><span>预计用时</span></div></div>
        <div className="board-panel"><div className="board-toolbar"><div><b>{project.parts[part]}</b><small>{project.size} × {project.size} 格 · 完整图纸</small></div><div className="board-actions"><button onClick={()=>printProject(project,part)}>打印</button><button className="full-board-button" onClick={()=>setFullscreenBoard(true)}>全屏看图</button></div></div><div className="board-fit"><PixelBoard project={project} part={part} focus={focusColor} /></div><p className="board-hint">图形已按底板完整显示，不裁切；点“全屏看图”可放大拖动。</p></div>
        <div className="part-picker"><div className="section-heading"><div><p className="kicker">零件 {part+1}/{project.parts.length}</p><h2>先拼哪一块？</h2></div></div><div>{project.parts.map((name,i)=><button key={`${name}-${i}`} className={part===i?"active":""} onClick={()=>{setPart(i);setDoneColors([]);setFocusColor(null)}}><span>{i+1}</span>{name}</button>)}</div></div>
        <div className="color-assistant"><div className="assistant-head"><div><p className="kicker">专心拼豆模式</p><h2>一次只看一种颜色</h2></div><b>{progress}%</b></div><div className="progress"><i style={{width:`${progress}%`}} /></div><div className="color-list">{project.palette.map((color,i)=><button key={color} className={`${focusColor===i?"focused":""} ${doneColors.includes(i)?"done":""}`} onClick={()=>setFocusColor(focusColor===i?null:i)}><i style={{background:color}} /><span><b>{i+1} · {project.colorNames[i]}</b><small>{counts[i]} 颗</small></span><em onClick={(e)=>{e.stopPropagation();setDoneColors(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i])}}>{doneColors.includes(i)?"✓":"○"}</em></button>)}</div><button className="show-all" onClick={()=>setFocusColor(null)}>显示全部颜色</button></div>
        <div className="assembly"><p className="kicker">最后一步</p><h2>装配顺序</h2><ol><li><span>1</span><p><b>完成并压平所有零件</b>趁温热时夹在厚书中，保持平整。</p></li><li><span>2</span><p><b>先试插，不要用力</b>卡槽过紧时请大人修剪，不要硬掰。</p></li><li><span>3</span><p><b>装上活动机关</b>转轴和关节少熨一点，活动会更顺畅。</p></li></ol></div>
      </section>}

      {screen === "magic" && <section className="magic-page">
        <div className="page-title"><p className="kicker">作品实验室</p><h1>让她的作品活一下</h1><p>使用手机里的成品照片，不需要重新画。</p></div>
        <div className="mode-tabs"><button className={magicMode==="move"?"active":""} onClick={()=>{setMagicMode("move");setGenerated(false)}}>会动的小作品</button><button className={magicMode==="scene"?"active":""} onClick={()=>{setMagicMode("scene");setGenerated(false)}}>故事场景卡</button></div>
        <div className={`magic-canvas scene-${magicStyle} ${generated?`generated ${magicMode}`:""}`}>{imageUrl ? <img src={imageUrl} alt="上传的拼豆作品" /> : <div className="upload-empty"><span>＋</span><b>先拍一张完成的作品</b><small>尽量从正上方拍，背景越干净越好</small></div>}{generated && <><i className="spark s1">✦</i><i className="spark s2">✦</i><strong>{magicMode==="scene"?["今晚去月球散步","潜入糖果海底城","森林探险队，出发！"][magicStyle]:"米粒的作品动起来啦！"}</strong></>}</div>
        <input ref={uploadRef} hidden type="file" accept="image/*" capture="environment" onChange={onUpload} />
        <button className="upload-button" onClick={()=>uploadRef.current?.click()}>{imageName?"换一张照片":"拍照或选择照片"}</button>
        <div className="magic-styles"><p className="kicker">{magicMode==="move"?"选择动作":"选择一个世界"}</p><div>{(magicMode==="move"?[["↔","左右摇摆"],["↟","开心跳跳"],["◌","慢慢旋转"]]:[["☾","月球散步"],["♒","糖果海底"],["♧","魔法森林"]]).map(([icon,label],i)=><button key={label} className={magicStyle===i?"active":""} onClick={()=>{setMagicStyle(i);setGenerated(false)}}><span>{icon}</span><b>{label}</b></button>)}</div></div>
        <button className="generate" disabled={!imageUrl} onClick={()=>{setGenerated(true);notify("魔法完成，给米粒看看吧！")}}>✦ {magicMode==="move"?"让它动起来":"进入这个世界"}</button>
        <p className="privacy">照片只在这台设备当前页面中使用；刷新页面后就会消失。</p>
      </section>}

      {screen === "mine" && <section className="mine-page"><div className="profile-hero"><span>米</span><div><p className="kicker">九岁的小小工程师</p><h1>米粒的收藏夹</h1><p>收藏了 {favorites.length} 个想挑战的作品</p></div></div><div className="badge-row"><div><b>3</b><small>完成作品</small></div><div><b>{favorites.length}</b><small>宝藏图纸</small></div><div><b>2,846</b><small>用掉豆子</small></div></div><div className="project-grid">{PROJECTS.filter(p=>favorites.includes(p.id)).map(p=><ProjectCard key={p.id} project={p} onOpen={()=>openProject(p.id)} favorite onFavorite={()=>toggleFavorite(p.id)} />)}</div></section>}

      {screen !== "detail" && <nav className="bottom-nav"><button className={screen==="discover"?"active":""} onClick={()=>setScreen("discover")}><span>⌂</span>发现</button><button className={screen==="library"?"active":""} onClick={()=>setScreen("library")}><span>▦</span>图纸</button><button className={`magic-nav ${screen==="magic"?"active":""}`} onClick={()=>setScreen("magic")}><span>✦</span>实验室</button><button className={screen==="mine"?"active":""} onClick={()=>setScreen("mine")}><span>☺</span>米粒</button></nav>}
    </section>
    {fullscreenBoard && <div className="fullscreen-board" role="dialog" aria-modal="true" aria-label={`${project.title}全屏图纸`}><header><button onClick={()=>setFullscreenBoard(false)}>← 退出全屏</button><div><b>{project.parts[part]}</b><small>{project.size} × {project.size} 格</small></div><button onClick={()=>printProject(project,part)}>打印</button></header><div className="fullscreen-canvas"><div className="zoom-board"><PixelBoard project={project} part={part} focus={focusColor} zoom={boardZoom} /></div></div><footer><button onClick={()=>setBoardZoom(z=>Math.max(.8,Number((z-.25).toFixed(2))))}>－</button><button onClick={()=>setBoardZoom(1)}>适合屏幕</button><b>{Math.round(boardZoom*100)}%</b><button onClick={()=>setBoardZoom(z=>Math.min(2.5,Number((z+.25).toFixed(2))))}>＋</button></footer></div>}
    {toast && <div className="toast">{toast}</div>}
  </main>;
}
