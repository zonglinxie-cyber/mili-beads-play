"use client";
/* eslint-disable @next/next/no-img-element -- generated posters are local canvas data URLs */

import { PointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Flame, Home as HomeIcon, Play, Plus, RotateCcw, Sparkles, Star, X } from "lucide-react";
import { PATTERNS, Pattern, targetCount } from "./patterns";
import { PrivacyContent } from "./privacy-content";

type Poster = { src: string; filename: string; kind: "print" | "work" };
type GameSave = { completed?: string[]; boards?: Record<string, string[]>; activityDates?: string[] };

const BOARD_SIZE = 18;
const ZONE_SIZE = 6;
const SAVE_KEY = "mili-game-v3";
const LEGACY_SAVE_KEYS = ["mili-game-v2"];
const ZONE_LABELS = ["左上", "上中", "右上", "左中", "正中", "右中", "左下", "下中", "右下"];

const keys = (p: Pattern) => Object.keys(p.palette);
const localDay = () => new Date().toLocaleDateString("en-CA");
const dayDifference = (newer: string, older: string) => Math.round((Date.parse(`${newer}T12:00:00`) - Date.parse(`${older}T12:00:00`)) / 86400000);
const normalizeSave = (value: unknown): GameSave => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const validIds = new Set(PATTERNS.map(pattern => pattern.id));
  const completed = Array.isArray(source.completed)
    ? Array.from(new Set(source.completed.filter((id): id is string => typeof id === "string" && validIds.has(id))))
    : [];
  const activityDates = Array.isArray(source.activityDates)
    ? Array.from(new Set(source.activityDates.filter((date): date is string => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T12:00:00`)))))
    : [];
  const boards: Record<string, string[]> = {};
  if (source.boards && typeof source.boards === "object" && !Array.isArray(source.boards)) {
    for (const pattern of PATTERNS) {
      const candidate = (source.boards as Record<string, unknown>)[pattern.id];
      if (!Array.isArray(candidate) || candidate.length !== BOARD_SIZE * BOARD_SIZE) continue;
      const target = pattern.rows.join("").split("");
      boards[pattern.id] = candidate.map((cell, index) => typeof cell === "string" && cell === target[index] ? cell : ".");
    }
  }
  return { completed, boards, activityDates };
};
const readSave = (): GameSave => {
  if (typeof window === "undefined") return {};
  for (const key of [SAVE_KEY, ...LEGACY_SAVE_KEYS]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try { return normalizeSave(JSON.parse(raw)); } catch { /* try an older intact save */ }
  }
  return {};
};
const streakFrom = (dates: string[]) => {
  const unique = Array.from(new Set(dates)).sort().reverse();
  if (!unique.length || dayDifference(localDay(), unique[0]) > 1) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length && dayDifference(unique[i - 1], unique[i]) === 1; i += 1) streak += 1;
  return streak;
};

const zoneIndices = (zone: number) => {
  const startRow = Math.floor(zone / 3) * ZONE_SIZE;
  const startCol = (zone % 3) * ZONE_SIZE;
  return Array.from({ length: ZONE_SIZE * ZONE_SIZE }, (_, index) => {
    const row = startRow + Math.floor(index / ZONE_SIZE);
    const col = startCol + index % ZONE_SIZE;
    return row * BOARD_SIZE + col;
  });
};

function DialogFrame({ className, label, onClose, children }: { className: string; label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, []);
  return <div className={className} role="dialog" aria-modal="true" aria-label={label} ref={ref}>{children}</div>;
}

function Art({ pattern, bead = false, board, hint = false, selected, animated = false }: { pattern: Pattern; bead?: boolean; board?: string[]; hint?: boolean; selected?: string; animated?: boolean }) {
  const cells = pattern.rows.join("").split("");
  const layerCells = pattern.layers.length === pattern.rows.length ? pattern.layers.join("").split("") : cells.map(cell => cell === "." ? "." : "B");
  const renderGrid = (layer?: "B" | "P" | "F") => <div className={`art ${bead ? "beads" : "pixels"} ${layer ? `art-layer art-layer-${layer}` : ""}`} style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
    {cells.map((target, i) => {
      const value = board?.[i] ?? target;
      const visible = !layer || layerCells[i] === layer;
      const shown = visible ? value : ".";
      const color = shown !== "." ? pattern.palette[shown]?.color : undefined;
      const ghost = !layer && hint && shown === "." && target === selected;
      return <i key={i} className={`${shown === "." ? "empty" : "filled"} ${ghost ? "ghost" : ""}`} style={{ backgroundColor: color ?? (ghost && selected ? pattern.palette[selected].color : undefined) }} />;
    })}
  </div>;
  if (!animated) return renderGrid();
  return <div className={`layered-art scene-${pattern.motion}`} style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
    {renderGrid("B")}{renderGrid("P")}{renderGrid("F")}
  </div>;
}

function Card({ pattern, onOpen, finished }: { pattern: Pattern; onOpen: () => void; finished: boolean }) {
  return <button className="pattern-card" onClick={onOpen}>
    <div className="card-art"><Art pattern={pattern} />{finished && <span className="complete-mark"><Check aria-hidden="true"/>已完成</span>}</div>
    <div className="card-info"><div><span>{pattern.category}</span><span>{pattern.level}</span></div><h3>{pattern.name}</h3><p>{pattern.story}</p><footer><b>{targetCount(pattern)} 颗</b><b>{pattern.pieceLabel}</b><ChevronRight aria-hidden="true"/></footer></div>
  </button>;
}

function makePoster(pattern: Pattern, kind: "print" | "work") {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const isWork = kind === "work";
  ctx.fillStyle = isWork ? "#f8edda" : "#fffdf8"; ctx.fillRect(0, 0, 1200, 1500);
  if (isWork) {
    const glow = ctx.createRadialGradient(600, 670, 120, 600, 670, 680);
    glow.addColorStop(0, "#ffe2b2"); glow.addColorStop(1, "#eadff600");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1200, 1400);
  }
  ctx.fillStyle = "#27233b"; ctx.font = "900 70px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(isWork ? `米粒完成了·${pattern.name}` : pattern.name, 600, 105);
  ctx.fillStyle = "#8b7180"; ctx.font = "32px sans-serif";
  ctx.fillText(isWork ? pattern.story : `${targetCount(pattern)} 颗 · 约 ${pattern.minutes} 分钟`, 600, 158);
  const cell = Math.floor(900 / pattern.rows[0].length); const size = cell * pattern.rows[0].length; const left = (1200 - size) / 2; const top = 215;
  ctx.fillStyle = "#e8ddcd"; ctx.beginPath(); ctx.roundRect(left - 18, top - 18, size + 36, size + 36, 30); ctx.fill();
  pattern.rows.forEach((row, y) => [...row].forEach((value, x) => {
    const cx = left + x * cell + cell / 2; const cy = top + y * cell + cell / 2;
    ctx.fillStyle = value === "." ? "#fbf3e8" : pattern.palette[value].color;
    if (isWork && value !== ".") {
      ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4a3d4d70"; ctx.lineWidth = value === "W" ? 4 : 2; ctx.stroke();
    } else {
      ctx.fillRect(left + x * cell + 2, top + y * cell + 2, cell - 4, cell - 4);
      ctx.strokeStyle = value === "W" ? "#786f78" : "#d8cbb9"; ctx.lineWidth = value === "W" ? 3 : 1; ctx.strokeRect(left + x * cell + 2, top + y * cell + 2, cell - 4, cell - 4);
    }
  }));
  const legendTop = top + size + 70;
  ctx.textAlign = "left"; ctx.fillStyle = "#27233b"; ctx.font = "800 34px sans-serif";
  ctx.fillText(isWork ? "我的拼豆作品" : "颜色清单", 115, legendTop);
  keys(pattern).forEach((key, index) => {
    const col = index % 3; const row = Math.floor(index / 3); const x = 115 + col * 340; const y = legendTop + 60 + row * 66;
    ctx.fillStyle = pattern.palette[key].color; ctx.beginPath(); ctx.arc(x + 18, y - 10, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#625b69"; ctx.font = "26px sans-serif";
    const count = pattern.rows.join("").split("").filter(v => v === key).length;
    ctx.fillText(`${pattern.palette[key].name}  ${count} 颗`, x + 48, y);
  });
  ctx.textAlign = "center"; ctx.fillStyle = "#a26a66"; ctx.font = "700 26px sans-serif";
  ctx.fillText(isWork ? "米粒拼豆社 · 把小豆子拼成大冒险" : "请由大人完成熨烫与裁剪", 600, 1450);
  return canvas.toDataURL("image/png");
}

export default function Home() {
  const [tab, setTab] = useState<"home" | "library" | "game" | "works">("home");
  const [activeId, setActiveId] = useState(PATTERNS[0].id);
  const [board, setBoard] = useState<string[]>([]);
  const [selected, setSelected] = useState("O");
  const [drawing, setDrawing] = useState(false);
  const [hint, setHint] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("全部");
  const [zone, setZone] = useState(0);
  const [completed, setCompleted] = useState<string[]>(() => {
    return readSave().completed ?? [];
  });
  const [savedBoards, setSavedBoards] = useState<Record<string, string[]>>(() => {
    return readSave().boards ?? {};
  });
  const [activityDates, setActivityDates] = useState<string[]>(() => readSave().activityDates ?? []);
  const [celebrate, setCelebrate] = useState(false);
  const [poster, setPoster] = useState<Poster | null>(null);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [installEvent, setInstallEvent] = useState<Event & { prompt?: () => Promise<void> } | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const pattern = PATTERNS.find(p => p.id === activeId) ?? PATTERNS[0];
  const target = pattern.rows.join("").split("");
  const done = board.reduce((n, v, i) => n + (v !== "." && v === target[i] ? 1 : 0), 0);
  const total = targetCount(pattern);
  const progress = Math.round(done / total * 100);
  const categories = ["全部", ...Array.from(new Set(PATTERNS.map(p => p.category)))];
  const streak = streakFrom(activityDates);
  const milestone = Math.min(completed.length % 4, 4);
  const animationPattern = PATTERNS.find(p => p.id === animationId);
  const activeZoneIndices = zoneIndices(zone);
  const activeZoneTargets = activeZoneIndices.filter(index => target[index] !== ".");
  const activeZoneDone = activeZoneTargets.filter(index => board[index] === target[index]).length;
  const overlayOpen = Boolean(celebrate || poster || animationPattern || showPrivacy || confirmReset);

  useEffect(() => {
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as Event & { prompt?: () => Promise<void> }); };
    window.addEventListener("beforeinstallprompt", handleInstall);
    const isNativeShell = location.hostname === "localhost";
    if (!isNativeShell && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  useEffect(() => { localStorage.setItem(SAVE_KEY, JSON.stringify({ completed, boards: savedBoards, activityDates })); }, [completed, savedBoards, activityDates]);

  const openGame = (id: string) => {
    const next = PATTERNS.find(p => p.id === id) ?? PATTERNS[0];
    const nextTarget = next.rows.join("").split("");
    const saved = savedBoards[id];
    const safeBoard = saved?.length === nextTarget.length ? saved.map((value, index) => value === nextTarget[index] ? value : ".") : Array(nextTarget.length).fill(".");
    setActiveId(id); setBoard(safeBoard); setSelected(keys(next)[0]);
    setMistakes(0); setHint(true); setZone(0); setCelebrate(false); setTab("game"); window.scrollTo(0, 0);
  };

  const paint = (index: number) => {
    if (target[index] === "." || board[index] === target[index]) return;
    if (selected !== target[index]) {
      setMistakes(m => m + 1); setMessage(`这里需要${pattern.palette[target[index]].name}`);
      navigator.vibrate?.(30); window.setTimeout(() => setMessage(""), 900); return;
    }
    setBoard(prev => { const next = [...prev]; next[index] = selected; setSavedBoards(all => ({...all,[pattern.id]:next})); const nextDone = next.filter((v,i)=>v !== "." && v === target[i]).length;
      if (nextDone === total) { setCelebrate(true); setCompleted(c => c.includes(pattern.id) ? c : [...c, pattern.id]); setActivityDates(d => d.includes(localDay()) ? d : [...d,localDay()]); navigator.vibrate?.([40,40,80]); }
      else if (activeZoneTargets.length && activeZoneTargets.every(zoneIndex => next[zoneIndex] === target[zoneIndex])) {
        const nextZone = Array.from({ length: 9 }, (_, offset) => (zone + offset + 1) % 9).find(candidate => zoneIndices(candidate).some(zoneIndex => target[zoneIndex] !== "." && next[zoneIndex] !== target[zoneIndex]));
        if (nextZone !== undefined) { setZone(nextZone); setMessage(`太棒了！接着拼${ZONE_LABELS[nextZone]}`); window.setTimeout(() => setMessage(""), 1200); }
      }
      return next;
    });
  };

  const handlePointer = (event: PointerEvent<HTMLButtonElement>, index: number) => { event.preventDefault(); paint(index); };
  const currentColorDone = board.filter((v,i) => v === selected && v === target[i]).length;
  const currentColorTotal = target.filter(v => v === selected).length;
  const showPoster = (kind: "print" | "work") => {
    const src = makePoster(pattern, kind);
    if (src) { setShareStatus(""); setPoster({ src, kind, filename: `米粒拼豆-${pattern.name}-${kind === "print" ? "高清图纸" : "作品卡"}.png` }); }
  };
  const downloadPoster = () => {
    if (!poster) return;
    const link = document.createElement("a"); link.href = poster.src; link.download = poster.filename; link.click();
  };
  const sharePoster = async () => {
    if (!poster) return;
    setShareStatus("正在准备高清图…");
    try {
      if (Capacitor.isNativePlatform()) {
        const data = poster.src.split(",")[1];
        const written = await Filesystem.writeFile({ path: poster.filename, data, directory: Directory.Cache });
        await Share.share({ title: poster.filename.replace(/\.png$/, ""), files: [written.uri], dialogTitle: "保存或分享图片" });
        setShareStatus("已打开系统保存与分享");
      } else if (navigator.share) {
        const blob = await (await fetch(poster.src)).blob();
        const file = new File([blob], poster.filename, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: poster.filename, files: [file] });
        else downloadPoster();
        setShareStatus("高清图已处理");
      } else { downloadPoster(); setShareStatus("高清图已下载"); }
    } catch { setShareStatus("没有保存，可以再试一次"); }
  };
  const printPoster = () => {
    if (!poster) return;
    const page = window.open("", "_blank"); if (!page) return;
    const image = page.document.createElement("img"); image.src = poster.src; image.style.width = "100%";
    page.document.body.style.margin = "0"; page.document.body.appendChild(image); image.onload = () => page.print();
  };

  return <main>
    <div className="app app-shell" inert={overlayOpen ? true : undefined} aria-hidden={overlayOpen ? true : undefined}>
      {tab !== "game" && <header className="app-header"><button className="logo" onClick={()=>setTab("home")}><span>米</span><div><b>米粒拼豆社</b><small>把小豆子拼成大冒险</small></div></button><button className="round" onClick={()=>setTab("works")} aria-label="打开作品册"><Star aria-hidden="true"/></button></header>}

      {tab === "home" && <>
        <section className="home-hero"><div className="hero-copy"><span>今日动态任务</span><h1>火箭猫<br/>冲出云层</h1><p>拼好以后，让尾焰亮起来，带它飞向星星。</p><button onClick={()=>openGame("rocket-cat")}>开始挑战 <ArrowRight aria-hidden="true"/></button></div><div className="hero-art"><Art pattern={PATTERNS[0]} animated/><Sparkles aria-hidden="true"/><Star aria-hidden="true"/></div></section>
        <section className="quick-status"><div><span>{streak ? <Flame aria-hidden="true"/> : <Sparkles aria-hidden="true"/>}</span><p><b>{streak ? `连续创作 ${streak} 天` : "今天来点亮第一颗星"}</b><small>{completed.length ? `已收藏 ${completed.length} 个作品` : "完成一张图纸，记录会留在手机里"}</small></p></div><em>{milestone}/4</em></section>
        <section className="section-title"><div><small>米粒精选</small><h2>一眼就想拼的图纸</h2></div><button onClick={()=>setTab("library")}>查看全部</button></section>
        <div className="featured-list">{PATTERNS.slice(1,4).map(p=><Card key={p.id} pattern={p} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} />)}</div>
        <section className="mystery-card"><div><span>?</span></div><section><small>神秘拼豆</small><h2>不看答案，边拼边猜</h2><p>每完成一种颜色，揭开一部分图案。</p><button onClick={()=>{openGame("moon-rabbit");setHint(false)}}>试试看</button></section></section>
        {installEvent && <button className="install-banner" onClick={()=>installEvent.prompt?.()}><span><Plus aria-hidden="true"/></span><p><b>放到手机桌面</b><small>像普通游戏一样，点一下就能玩</small></p><i>安装</i></button>}
        <button className="parent-link" onClick={()=>setShowPrivacy(true)}>家长与隐私说明</button>
      </>}

      {tab === "library" && <section className="library"><div className="page-head"><small>图纸宝库</small><h1>今天拼哪个？</h1><p>所有图形都完整展示，点开就能直接玩。</p></div><div className="filters">{categories.map(c=><button key={c} className={filter===c?"active":""} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="library-list">{PATTERNS.filter(p=>filter==="全部"||p.category===filter).map(p=><Card key={p.id} pattern={p} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} />)}</div></section>}

      {tab === "game" && <section className="game-screen">
        <header className="game-header"><button onClick={()=>setTab("library")} aria-label="返回图纸宝库"><ArrowLeft aria-hidden="true"/></button><div><b>{pattern.name}</b><small>{done}/{total} 颗 · 错误 {mistakes}</small></div><button onClick={()=>setHint(v=>!v)}>{hint?"关提示":"开提示"}</button></header>
        <div className="game-progress" role="progressbar" aria-label="拼豆完成度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{width:`${progress}%`}} /><b>{progress}%</b></div>
        <div className="reference"><div><span>完整图纸</span><aside><button onClick={()=>showPoster("print")}>生成打印图</button><button onClick={()=>gameRef.current?.scrollIntoView({behavior:"smooth"})}>开始拼 <ArrowDown aria-hidden="true"/></button></aside></div><Art pattern={pattern} /></div>
        <div className="color-goal"><i style={{background:pattern.palette[selected].color}}/><p><b>现在拼：{pattern.palette[selected].name}</b><small>{currentColorDone}/{currentColorTotal} 颗 · {hint?"闪烁位置就是目标":"提示已关闭"}</small></p></div>
        <div className="zone-picker" aria-label="选择放大分区"><div><b>放大拼：{ZONE_LABELS[zone]}</b><small>{activeZoneDone}/{activeZoneTargets.length} 颗</small></div><div>{ZONE_LABELS.map((label,index)=>{const part=zoneIndices(index);const partTargets=part.filter(i=>target[i]!==".");const partDone=partTargets.filter(i=>board[i]===target[i]).length;return <button key={label} className={zone===index?"active":""} onClick={()=>setZone(index)} aria-pressed={zone===index} aria-label={`${label}，${partDone}/${partTargets.length}颗`}>{partTargets.length>0&&partDone===partTargets.length?<Check aria-hidden="true"/>:index+1}</button>})}</div></div>
        <div className="play-board" ref={gameRef} onPointerLeave={()=>setDrawing(false)}><div className="touch-grid" style={{"--cols":ZONE_SIZE} as React.CSSProperties}>{activeZoneIndices.map(index=>{const cell=target[index];if(cell===".") return <span key={index} className="outside" aria-hidden="true"/>;return <button key={index} aria-label={`第${Math.floor(index/BOARD_SIZE)+1}行第${index%BOARD_SIZE+1}格，${pattern.palette[cell].name}`} className={`${board[index]!=="."?"placed":""} ${hint&&cell===selected&&board[index]==="."?"target-hint":""}`} style={board[index]!=="."?{background:pattern.palette[board[index]].color}:undefined} onPointerDown={e=>{setDrawing(true);handlePointer(e,index)}} onPointerEnter={e=>{if(drawing)handlePointer(e,index)}} onPointerUp={()=>setDrawing(false)} />})}</div>{message&&<div className="bubble" role="status" aria-live="polite">{message}</div>}</div>
        <div className="palette"><div className="palette-head"><b>选择豆子颜色</b><button onClick={()=>setConfirmReset(true)}><RotateCcw aria-hidden="true"/>重新开始</button></div><div>{keys(pattern).map(k=>{const count=target.filter(v=>v===k).length;const placed=board.filter((v,i)=>v===k&&v===target[i]).length;return <button key={k} className={selected===k?"active":""} onClick={()=>setSelected(k)}><i style={{background:pattern.palette[k].color}}/><span>{pattern.palette[k].name}<small>{placed}/{count}</small></span>{placed===count&&<em><Check aria-hidden="true"/></em>}</button>})}</div></div>
      </section>}

      {tab === "works" && <section className="works"><div className="page-head"><small>米粒的作品册</small><h1>{completed.length} 个闪亮作品</h1><p>每完成一幅，都会保存在这台手机里，家长可以随时清除。</p></div>{completed.length?<div className="work-grid">{PATTERNS.filter(p=>completed.includes(p.id)).map(p=><article key={p.id}><button onClick={()=>openGame(p.id)}><Art pattern={p}/><b>{p.name}</b><small>点击再玩</small></button><button className="work-play" onClick={()=>setAnimationId(p.id)}><Play aria-hidden="true"/>播放动画</button></article>)}</div>:<div className="no-works"><span><Sparkles aria-hidden="true"/></span><h2>第一颗星星还在等你</h2><p>完成一张图纸，它就会出现在这里。</p><button onClick={()=>openGame("rocket-cat")}>去完成第一幅</button></div>}</section>}

      {tab !== "game" && <nav className="nav"><button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><span><HomeIcon aria-hidden="true"/></span>首页</button><button className={tab==="library"?"active":""} onClick={()=>setTab("library")}><span><BookOpen aria-hidden="true"/></span>图纸</button><button className="play" onClick={()=>openGame(PATTERNS.find(p=>!completed.includes(p.id))?.id??PATTERNS[0].id)}><span><Play aria-hidden="true"/></span>开拼</button><button className={tab==="works"?"active":""} onClick={()=>setTab("works")}><span><Star aria-hidden="true"/></span>作品</button></nav>}
    </div>
    {celebrate&&<DialogFrame className="finish-sheet" label="拼豆完成" onClose={()=>setCelebrate(false)}><div className="sparkles">{Array.from({length:10},(_,i)=><i key={i}>✦</i>)}</div><div className="confetti">✦ · ● · ✦</div><div className="motion-stage mini"><Art pattern={pattern} animated/></div><h2>完成啦，米粒！</h2><p>{pattern.animation}</p><div><button onClick={()=>{setCelebrate(false);setAnimationId(pattern.id)}}>播放动画</button><button onClick={()=>{setCelebrate(false);showPoster("work")}}>生成作品卡</button><button onClick={()=>{setCelebrate(false);setTab("works")}}>放进作品册</button><button onClick={()=>setCelebrate(false)}>再看看</button></div></DialogFrame>}
    {poster && <DialogFrame className="poster-sheet" label={poster.kind === "print" ? "高清可打印图纸" : "米粒的作品卡"} onClose={()=>setPoster(null)}><section><button className="poster-close" onClick={()=>setPoster(null)} aria-label="关闭"><X aria-hidden="true"/></button><small>{poster.kind === "print" ? "高清可打印图纸" : "米粒的作品卡"}</small><img src={poster.src} alt={`${pattern.name}拼豆${poster.kind === "print" ? "图纸" : "作品卡"}`} /><div className={Capacitor.isNativePlatform()?"single-action":undefined}><button onClick={sharePoster}>{Capacitor.isNativePlatform()?"保存或分享":"保存高清图"}</button>{!Capacitor.isNativePlatform()&&<button onClick={printPoster}>打印</button>}</div><p role="status" aria-live="polite">{shareStatus || "高清 PNG · 1200×1500"}</p></section></DialogFrame>}
    {animationPattern && <DialogFrame className="animation-sheet" label={`${animationPattern.name}动画`} onClose={()=>setAnimationId(null)}><section><button className="animation-close" onClick={()=>setAnimationId(null)} aria-label="关闭动画"><X aria-hidden="true"/></button><small>作品动起来了</small><h2>{animationPattern.name}</h2><div className={`motion-stage scene-${animationPattern.motion}`}><div className="motion-trail" aria-hidden="true">✦ · ✦</div><Art pattern={animationPattern} bead animated/></div><ul className="motion-story"><li><b>角色</b>{animationPattern.motionPlan.body}</li><li><b>道具</b>{animationPattern.motionPlan.prop}</li><li><b>特效</b>{animationPattern.motionPlan.fx}</li></ul><button className="replay" onClick={()=>{setAnimationId(null);requestAnimationFrame(()=>setAnimationId(animationPattern.id))}}>再播放一次</button></section></DialogFrame>}
    {showPrivacy && <DialogFrame className="privacy-sheet" label="家长与隐私" onClose={()=>setShowPrivacy(false)}><PrivacyContent onBack={()=>setShowPrivacy(false)} onDelete={()=>{if(window.confirm("确定清除本机全部拼豆进度和作品吗？")){localStorage.removeItem(SAVE_KEY);LEGACY_SAVE_KEYS.forEach(key=>localStorage.removeItem(key));setCompleted([]);setSavedBoards({});setActivityDates([]);setShowPrivacy(false);setTab("home")}}}/></DialogFrame>}
    {confirmReset && <DialogFrame className="confirm-sheet" label="确认重新开始" onClose={()=>setConfirmReset(false)}><section><h2>要重新开始吗？</h2><p>已经拼好的 {done} 颗豆子会被清空，这一步不能撤销。</p><div><button onClick={()=>setConfirmReset(false)}>继续拼</button><button className="danger" onClick={()=>{const empty=Array(target.length).fill(".");setBoard(empty);setSavedBoards(all=>({...all,[pattern.id]:empty}));setConfirmReset(false)}}>确认清空</button></div></section></DialogFrame>}
  </main>;
}
