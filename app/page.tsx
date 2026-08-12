"use client";
/* eslint-disable @next/next/no-img-element -- generated posters are local canvas data URLs */

import { PointerEvent, useEffect, useRef, useState } from "react";

type Pattern = {
  id: string;
  name: string;
  story: string;
  level: "轻松" | "进阶" | "挑战";
  category: string;
  minutes: number;
  motion: "launch" | "float" | "twist" | "sway" | "hop" | "drum" | "bounce" | "roll" | "glide";
  animation: string;
  palette: Record<string, { name: string; color: string }>;
  rows: string[];
};

type Poster = { src: string; filename: string; kind: "print" | "work" };
type GameSave = { completed?: string[]; boards?: Record<string, string[]>; activityDates?: string[] };

const P = {
  K: { name: "墨黑", color: "#29283b" }, W: { name: "奶油白", color: "#fff5df" },
  O: { name: "蜜橘", color: "#ee7b52" }, Y: { name: "星光黄", color: "#f5c95d" },
  P: { name: "樱花粉", color: "#ef91a7" }, R: { name: "莓果红", color: "#cf4e61" },
  B: { name: "湖水蓝", color: "#5daabe" }, N: { name: "深海蓝", color: "#355276" },
  G: { name: "叶子绿", color: "#6ba270" }, L: { name: "嫩芽绿", color: "#a8ca79" },
  C: { name: "可可棕", color: "#8a5d4a" }, T: { name: "焦糖", color: "#c58a5b" },
  V: { name: "葡萄紫", color: "#775f9c" }, S: { name: "浅紫", color: "#b7a0d2" },
};

const rows18 = (lines: string[]) => lines.map(line => {
  const row = line.replaceAll(" ", ".");
  if (row.length > 18) throw new Error(`图纸超过 18 格：${line}`);
  return row.padEnd(18, ".");
});

const PATTERNS: Pattern[] = [
  { id:"rocket-cat", name:"火箭背包橘猫", story:"点火！橘猫冲出云层去抓第一颗星", level:"进阶", category:"冒险", minutes:38, motion:"launch", animation:"尾焰喷射，橘猫穿过云层抓住一颗星", palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,R:P.R,N:P.N}, rows:rows18([
    "   Y", "  YYY    K   K", "   Y    KOK KOK", "      KOOOOOOOK", "     KOWOOKWOOK", "     KOOOOOOOOK", "      KOWWWOOK", "    RRRKOOOOK", "   RNNRKKKKK", "  RNNNR OO", "  RNNNR OOO", "   RRR OOOO", "      OO OO", "     OO   OO", "    Y  R R", "   YYYRRRRR", "    Y RYR", "       Y"] )},
  { id:"cloud-otter", name:"云朵冲浪水獭", story:"撑开小伞，踩着云浪拐一个大弯", level:"进阶", category:"奇想", minutes:36, motion:"glide", animation:"云朵像浪一样起伏，水獭撑伞滑过彩虹", palette:{K:P.K,W:P.W,C:P.C,T:P.T,B:P.B,N:P.N,Y:P.Y}, rows:rows18([
    "        NNN", "      NNBBBN", "    NNBBBBBBN", "      T  N", "    CCCCC", "   CTTTTTC", "  CTTKTTKTC", "  CTTTWTTTC", "   CTTTTTC", "    CTTTCC", "   CCTTT C", "  C TTT  CC", "    CTT C", " WWWCTTCWW", "WWWWWWWWWWW", " WWWBWWBWWW", "   BBBBB", "    B B"] )},
  { id:"star-dragon", name:"追星小青龙", story:"绕着月亮转半圈，把掉下来的星星接住", level:"挑战", category:"国风", minutes:48, motion:"twist", animation:"小龙盘旋上升，尾巴甩出一圈星光", palette:{K:P.K,W:P.W,Y:P.Y,G:P.G,L:P.L,O:P.O,B:P.B}, rows:rows18([
    "           Y", "          YYY", "  YY     YYYYY", " YGGY      Y", "YGLGGGGG", " GLGKGLGG", "  GLLLLGGGG", "   GLOWLLLGG", "    GLLLLLG", "   GGGGLLG", "  GG  GLLGG", " GG   GLLLG", " G   GGLLG", "GG  GGLLGG", " GGGGLLGG", "   GLLLG", "   GGGG", "    B"] )},
  { id:"bottle-jelly", name:"瓶中发光水母", story:"摇一摇玻璃瓶，海底星光就醒来了", level:"进阶", category:"海洋", minutes:42, motion:"sway", animation:"水母轻轻摆动触手，瓶子里冒出发光泡泡", palette:{K:P.K,W:P.W,P:P.P,B:P.B,N:P.N,V:P.V,Y:P.Y}, rows:rows18([
    "       NNNN", "      NNNNNN", "      WW  WW", "     WBBBBBBW", "    WBBYBBBBBW", "   WBBVVVVVBBBW", "   WBVVPPPVVBBW", "   WBVPKPKPVBBW", "   WBVVPPPVVBBW", "   WBBVVVVVBBBW", "   WBBBPVPBBBBW", "   WBBP V PBBBW", "   WBBP V PBBBW", "    WBP P PBBW", "    WBBBBBBBW", "     WBBBBBW", "      WWWWW", "       WWW"] )},
  { id:"frog-post", name:"青蛙邮差跳水坑", story:"信封飞起来了，但它一封都不会弄丢", level:"进阶", category:"冒险", minutes:35, motion:"hop", animation:"青蛙跃过水坑，三封彩色信在身后排成弧线", palette:{K:P.K,W:P.W,G:P.G,L:P.L,Y:P.Y,B:P.B,R:P.R}, rows:rows18([
    "          WW", "  W      WRW", " WYW      WW", "  WW  L   ", "    LLL LLL", "   LGGGLGGGL", "   LGKGGGKGL", "    GGGGGGG", "   YGGGWGGGY", "  YYGGGGGGGYY", "    GLLLLG", "   GLLLLLLG", "  GGLL  LLGG", " GG      G", "G       G", "   BBB      BBB", " BBBBBB  BBBBBB", "  BBB      BBB"] )},
  { id:"lion-poles", name:"醒狮飞越梅花桩", story:"锣鼓一响，小醒狮腾空去咬最高的红包", level:"挑战", category:"国风", minutes:52, motion:"drum", animation:"醒狮眨眼摆头，踩着梅花桩完成一次飞跃", palette:{K:P.K,W:P.W,Y:P.Y,O:P.O,R:P.R,G:P.G}, rows:rows18([
    "      RRR", "     RYYR     R", "   RRWWWWRR  RRR", "  RWWKWWKWRRRYR", " RWWWWOWWWWRR", " RRYWWWWYRR", "  YYRRRRYY", "   OOOOOO", "  OOWOOWOO", "  OOOKOOKO", "  ROOOOOOR", " RRRO  ORRR", " R  OOOO  R", "    R  R", " GGG R  R  GGG", "  G  R  R   G", "     R  R", "   RRR  RRR"] )},
  { id:"moon-rabbit", name:"月兔投递星星", story:"它把新做好的星星装进月亮邮袋", level:"轻松", category:"童话", minutes:30, motion:"bounce", animation:"月兔捣出一颗星，再把它抛进弯月邮袋", palette:{K:P.K,W:P.W,P:P.P,Y:P.Y,N:P.N,S:P.S}, rows:rows18([
    "      WW WW", "     WWPWPWW", "     WWWWWWW", "    WWKWWKWWW", "    WWWPWWWWW", "     WWWWWWW", "      WWWWW", "    S WWWWW N", "   SS WWWWW NN", "  SSS WWWWW NNN", "  SSSS WWW NNNN", "   SSSS WWNNNN", "    SSS WWNNN", " Y   SS WWN   Y", "YYY   S WW   YYY", " Y      WW    Y", "       YYY", "        Y"] )},
  { id:"sushi-train", name:"寿司列车猫店长", story:"小火车开动，今日特供追着客人跑", level:"挑战", category:"美食", minutes:46, motion:"roll", animation:"寿司小火车滚动起来，猫店长挥爪报站", palette:{K:P.K,W:P.W,O:P.O,P:P.P,R:P.R,G:P.G,C:P.C}, rows:rows18([
    " K      K", "KWK    KWK", "KWWKKKKWWK", "KWWWWWWWWK", "KWKWWWWKWK", "KWWWWWWWWK", " KKWWWWKK", "   KWWK", " KKKKKKKKKK", "KOOOWWWOOOOK", "KORRWWWORROK", "KOWWWWWWWWOK", "KKKKKKKKKKKK", " C  C  C  C", "CCCCCCCCCCCCCC", "  KKK   KKK", " KWWWK KWWWK", "  KKK   KKK"] )},
  { id:"icecream-rocket", name:"冰淇淋火箭起飞", story:"草莓味燃料装满，下一站甜甜星", level:"进阶", category:"奇想", minutes:40, motion:"launch", animation:"甜筒火箭喷出彩色糖粒，飞向甜甜星", palette:{K:P.K,W:P.W,P:P.P,R:P.R,B:P.B,N:P.N,Y:P.Y,C:P.C}, rows:rows18([
    "          Y", "         YYY", "      WWW Y", "     WPPPW", "    WPPKPPW", "    WPPPPPW", "     WPPPW", "    WWWWWWW", "   WBBBBBBBW", "  WBBBYBBBBBW", "  WBBBBBBBBBW", "  NNNNNNNNNNN", "    CCCCCCC", "     CCCCC", "      CCC", "     R Y R", "    RRYYYRR", "     R Y R"] )},
  { id:"rainbow-duck", name:"滑板鸭飞越彩虹", story:"压低身体，从彩虹最高处起跳", level:"轻松", category:"运动", minutes:28, motion:"glide", animation:"滑板鸭压低身体，从彩虹坡道跃到半空", palette:{K:P.K,W:P.W,Y:P.Y,O:P.O,B:P.B,R:P.R,G:P.G}, rows:rows18([
    "      BBB", "    BBYYYY", "   BYYKYYY", "  BYYYYYOYY", "   YYYOOOYY", "    YYYYYY", "   BBYYYYBB", "  BBBYYYYBBB", "     YY YY", "    YY  YY", "  KKKKKKKKKK", " KRRRRRRRRRRK", "  KKKK KKKK", "        R", "      RRYY", "    RRYYGG", "  RRYYGGBB", "RRYYGGBB"] )},
  { id:"whale-castle", name:"鲸鱼驮着星星城", story:"鲸鱼每喷一次水，城堡就升高一层", level:"挑战", category:"奇想", minutes:50, motion:"float", animation:"鲸鱼缓缓浮游，背上的小城亮起一扇扇窗", palette:{K:P.K,W:P.W,Y:P.Y,B:P.B,N:P.N,V:P.V,P:P.P}, rows:rows18([
    "      Y Y", "     YYYYY", "     NNNNN", "    NNYNNYN", "    NNNNNNN", "      N N", "    VVVVVVV", "  WWWWWWWWWWW", " NNBBBBBBBBBBNN", "NBBBBBBBBBBBBBBN", "NBBBWBBBBBWBBBBN", "NBBBBBBKBBBBBBBN", " NBBBBBWWBBBBBN", "  NNBBBBBBBBNN", "    NNNNNNN", "      NNN", "  WWW PNP WWW", " WWWW  N  WWWW"] )},
  { id:"lantern-fox", name:"九尾狐提灯夜游", story:"九条尾巴太多？这次只让三条轮流点灯", level:"挑战", category:"国风", minutes:48, motion:"sway", animation:"三条大尾巴像扇子展开，灯笼一盏接一盏亮起", palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,R:P.R,V:P.V,P:P.P}, rows:rows18([
    "  Y          Y", " YYY        YYY", "  Y    OO    Y", "      OWWO", "     OOOOOO", "    OOKOOKOO", "    OOOOWOOO", "     OOOOOO", "    RROOOORR", "  RR RROORR RR", " RR  RROORR  RR", "R P  RROORR  P R", " PPP RROORR PPP", "  P  VRRRRV  P", " VVVVV RR VVVVV", "V V V  RR  V V V", "   Y   RR   Y", "  YYY      YYY"] )},
];

PATTERNS.forEach(pattern => {
  if (pattern.rows.length !== 18 || pattern.rows.some(row => row.length !== 18)) throw new Error(`图纸尺寸错误：${pattern.id}`);
  const allowed = new Set([".", ...Object.keys(pattern.palette)]);
  if (pattern.rows.some(row => [...row].some(cell => !allowed.has(cell)))) throw new Error(`图纸含未知色号：${pattern.id}`);
});

const keys = (p: Pattern) => Object.keys(p.palette);
const targetCount = (p: Pattern) => p.rows.join("").split("").filter(c => c !== ".").length;
const localDay = () => new Date().toLocaleDateString("en-CA");
const dayDifference = (newer: string, older: string) => Math.round((Date.parse(`${newer}T12:00:00`) - Date.parse(`${older}T12:00:00`)) / 86400000);
const readSave = (): GameSave => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("mili-game-v2") ?? "{}"); } catch { return {}; }
};
const streakFrom = (dates: string[]) => {
  const unique = Array.from(new Set(dates)).sort().reverse();
  if (!unique.length || dayDifference(localDay(), unique[0]) > 1) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length && dayDifference(unique[i - 1], unique[i]) === 1; i += 1) streak += 1;
  return streak;
};

function Art({ pattern, bead = false, board, hint = false, selected, animated = false }: { pattern: Pattern; bead?: boolean; board?: string[]; hint?: boolean; selected?: string; animated?: boolean }) {
  const cells = pattern.rows.join("").split("");
  return <div className={`art ${bead ? "beads" : "pixels"} ${animated ? `animated motion-${pattern.motion}` : ""}`} style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
    {cells.map((target, i) => {
      const value = board?.[i] ?? target;
      const color = value !== "." ? pattern.palette[value]?.color : undefined;
      const ghost = hint && value === "." && target === selected;
      return <i key={i} className={`${value === "." ? "empty" : "filled"} ${ghost ? "ghost" : ""}`} style={{ backgroundColor: color ?? (ghost && selected ? pattern.palette[selected].color : undefined) }} />;
    })}
  </div>;
}

function Card({ pattern, onOpen, finished }: { pattern: Pattern; onOpen: () => void; finished: boolean }) {
  return <button className="pattern-card" onClick={onOpen}>
    <div className="card-art"><Art pattern={pattern} />{finished && <span className="complete-mark">✓ 已完成</span>}</div>
    <div className="card-info"><div><span>{pattern.category}</span><span>{pattern.level}</span></div><h3>{pattern.name}</h3><p>{pattern.story}</p><footer><b>{targetCount(pattern)} 颗</b><b>约 {pattern.minutes} 分钟</b><i>›</i></footer></div>
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
  ctx.fillStyle = "#f2e7d8"; ctx.beginPath(); ctx.roundRect(left - 18, top - 18, size + 36, size + 36, 30); ctx.fill();
  pattern.rows.forEach((row, y) => [...row].forEach((value, x) => {
    const cx = left + x * cell + cell / 2; const cy = top + y * cell + cell / 2;
    ctx.fillStyle = value === "." ? "#fffaf2" : pattern.palette[value].color;
    if (isWork && value !== ".") {
      ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4a3d4d20"; ctx.lineWidth = 2; ctx.stroke();
    } else {
      ctx.fillRect(left + x * cell + 2, top + y * cell + 2, cell - 4, cell - 4);
      ctx.strokeStyle = "#eadfce"; ctx.lineWidth = 1; ctx.strokeRect(left + x * cell + 2, top + y * cell + 2, cell - 4, cell - 4);
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

  useEffect(() => {
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as Event & { prompt?: () => Promise<void> }); };
    window.addEventListener("beforeinstallprompt", handleInstall);
    const isNativeShell = location.hostname === "localhost";
    if (!isNativeShell && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  useEffect(() => { localStorage.setItem("mili-game-v2", JSON.stringify({ completed, boards: savedBoards, activityDates })); }, [completed, savedBoards, activityDates]);

  const openGame = (id: string) => {
    const next = PATTERNS.find(p => p.id === id) ?? PATTERNS[0];
    setActiveId(id); setBoard(savedBoards[id]?.length === next.rows.join("").length ? savedBoards[id] : Array(next.rows.join("").length).fill(".")); setSelected(keys(next)[0]);
    setMistakes(0); setHint(true); setCelebrate(false); setTab("game"); window.scrollTo(0, 0);
  };

  const paint = (index: number) => {
    if (target[index] === "." || board[index] === target[index]) return;
    if (selected !== target[index]) {
      setMistakes(m => m + 1); setMessage(`这里需要${pattern.palette[target[index]].name}`);
      navigator.vibrate?.(30); window.setTimeout(() => setMessage(""), 900); return;
    }
    setBoard(prev => { const next = [...prev]; next[index] = selected; setSavedBoards(all => ({...all,[pattern.id]:next})); const nextDone = next.filter((v,i)=>v !== "." && v === target[i]).length;
      if (nextDone === total) { setCelebrate(true); setCompleted(c => c.includes(pattern.id) ? c : [...c, pattern.id]); setActivityDates(d => d.includes(localDay()) ? d : [...d,localDay()]); navigator.vibrate?.([40,40,80]); }
      return next;
    });
  };

  const handlePointer = (event: PointerEvent<HTMLButtonElement>, index: number) => { event.preventDefault(); paint(index); };
  const currentColorDone = board.filter((v,i) => v === selected && v === target[i]).length;
  const currentColorTotal = target.filter(v => v === selected).length;
  const showPoster = (kind: "print" | "work") => {
    const src = makePoster(pattern, kind);
    if (src) setPoster({ src, kind, filename: `米粒拼豆-${pattern.name}-${kind === "print" ? "高清图纸" : "作品卡"}.png` });
  };
  const downloadPoster = () => {
    if (!poster) return;
    const link = document.createElement("a"); link.href = poster.src; link.download = poster.filename; link.click();
  };
  const printPoster = () => {
    if (!poster) return;
    const page = window.open("", "_blank"); if (!page) return;
    const image = page.document.createElement("img"); image.src = poster.src; image.style.width = "100%";
    page.document.body.style.margin = "0"; page.document.body.appendChild(image); image.onload = () => page.print();
  };

  return <main>
    <div className="app">
      {tab !== "game" && <header className="app-header"><button className="logo" onClick={()=>setTab("home")}><span>米</span><div><b>米粒拼豆社</b><small>把小豆子拼成大冒险</small></div></button><button className="round" onClick={()=>setTab("works")}>★</button></header>}

      {tab === "home" && <>
        <section className="home-hero"><div className="hero-copy"><span>今日动态任务</span><h1>火箭猫<br/>冲出云层</h1><p>拼好以后，让尾焰亮起来，带它飞向星星。</p><button onClick={()=>openGame("rocket-cat")}>开始挑战 <b>→</b></button></div><div className="hero-art"><Art pattern={PATTERNS[0]} animated/><i>✦</i><i>✦</i></div></section>
        <section className="quick-status"><div><span>{streak ? "🔥" : "✦"}</span><p><b>{streak ? `连续创作 ${streak} 天` : "今天来点亮第一颗星"}</b><small>{completed.length ? `已收藏 ${completed.length} 个作品` : "完成一张图纸，记录会留在手机里"}</small></p></div><em>{milestone}/4</em></section>
        <section className="section-title"><div><small>米粒精选</small><h2>一眼就想拼的图纸</h2></div><button onClick={()=>setTab("library")}>查看全部</button></section>
        <div className="featured-list">{PATTERNS.slice(1,4).map(p=><Card key={p.id} pattern={p} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} />)}</div>
        <section className="mystery-card"><div><span>?</span></div><section><small>神秘拼豆</small><h2>不看答案，边拼边猜</h2><p>每完成一种颜色，揭开一部分图案。</p><button onClick={()=>{openGame("moon-rabbit");setHint(false)}}>试试看</button></section></section>
        {installEvent && <button className="install-banner" onClick={()=>installEvent.prompt?.()}><span>＋</span><p><b>放到手机桌面</b><small>像普通游戏一样，点一下就能玩</small></p><i>安装</i></button>}
        <a className="parent-link" href="/privacy">家长与隐私说明</a>
      </>}

      {tab === "library" && <section className="library"><div className="page-head"><small>图纸宝库</small><h1>今天拼哪个？</h1><p>所有图形都完整展示，点开就能直接玩。</p></div><div className="filters">{categories.map(c=><button key={c} className={filter===c?"active":""} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="library-list">{PATTERNS.filter(p=>filter==="全部"||p.category===filter).map(p=><Card key={p.id} pattern={p} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} />)}</div></section>}

      {tab === "game" && <section className="game-screen">
        <header className="game-header"><button onClick={()=>setTab("library")}>‹</button><div><b>{pattern.name}</b><small>{done}/{total} 颗 · 错误 {mistakes}</small></div><button onClick={()=>setHint(v=>!v)}>{hint?"关提示":"开提示"}</button></header>
        <div className="game-progress"><i style={{width:`${progress}%`}} /><b>{progress}%</b></div>
        <div className="reference"><div><span>完整图纸</span><aside><button onClick={()=>showPoster("print")}>生成打印图</button><button onClick={()=>gameRef.current?.scrollIntoView({behavior:"smooth"})}>开始拼 ↓</button></aside></div><Art pattern={pattern} /></div>
        <div className="color-goal"><i style={{background:pattern.palette[selected].color}}/><p><b>现在拼：{pattern.palette[selected].name}</b><small>{currentColorDone}/{currentColorTotal} 颗 · {hint?"闪烁位置就是目标":"提示已关闭"}</small></p></div>
        <div className="play-board" ref={gameRef} onPointerLeave={()=>setDrawing(false)}><div className="touch-grid" style={{"--cols":pattern.rows[0].length} as React.CSSProperties}>{target.map((cell,index)=><button key={index} aria-label={cell==="."?"空白格":`第${index+1}格，${pattern.palette[cell].name}`} className={`${cell==="."?"outside":""} ${board[index]!=="."?"placed":""} ${hint&&cell===selected&&board[index]==="."?"target-hint":""}`} style={board[index]!=="."?{background:pattern.palette[board[index]].color}:undefined} onPointerDown={e=>{setDrawing(true);handlePointer(e,index)}} onPointerEnter={e=>{if(drawing)handlePointer(e,index)}} onPointerUp={()=>setDrawing(false)} />)}</div>{message&&<div className="bubble" role="status" aria-live="polite">{message}</div>}</div>
        <div className="palette"><div className="palette-head"><b>选择豆子颜色</b><button onClick={()=>{const empty=Array(target.length).fill(".");setBoard(empty);setSavedBoards(all=>({...all,[pattern.id]:empty}))}}>重新开始</button></div><div>{keys(pattern).map(k=>{const count=target.filter(v=>v===k).length;const placed=board.filter(v=>v===k).length;return <button key={k} className={selected===k?"active":""} onClick={()=>setSelected(k)}><i style={{background:pattern.palette[k].color}}/><span>{pattern.palette[k].name}<small>{placed}/{count}</small></span>{placed===count&&<em>✓</em>}</button>})}</div></div>
        {celebrate&&<div className="finish-sheet"><div className="sparkles">{Array.from({length:10},(_,i)=><i key={i}>✦</i>)}</div><div className="confetti">✦ · ● · ✦</div><div className="motion-stage mini"><Art pattern={pattern} animated/></div><h2>完成啦，米粒！</h2><p>{pattern.animation}</p><div><button onClick={()=>setAnimationId(pattern.id)}>播放动画</button><button onClick={()=>showPoster("work")}>生成作品卡</button><button onClick={()=>setTab("works")}>放进作品册</button><button onClick={()=>setCelebrate(false)}>再看看</button></div></div>}
      </section>}

      {tab === "works" && <section className="works"><div className="page-head"><small>米粒的作品册</small><h1>{completed.length} 个闪亮作品</h1><p>每完成一幅，都会永久收藏在这台手机里。</p></div>{completed.length?<div className="work-grid">{PATTERNS.filter(p=>completed.includes(p.id)).map(p=><article key={p.id}><button onClick={()=>openGame(p.id)}><Art pattern={p}/><b>{p.name}</b><small>点击再玩</small></button><button className="work-play" onClick={()=>setAnimationId(p.id)}>▶ 播放动画</button></article>)}</div>:<div className="no-works"><span>✦</span><h2>第一颗星星还在等你</h2><p>完成一张图纸，它就会出现在这里。</p><button onClick={()=>openGame("rocket-cat")}>去完成第一幅</button></div>}</section>}

      {tab !== "game" && <nav className="nav"><button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><span>⌂</span>首页</button><button className={tab==="library"?"active":""} onClick={()=>setTab("library")}><span>▦</span>图纸</button><button className="play" onClick={()=>openGame(PATTERNS.find(p=>!completed.includes(p.id))?.id??PATTERNS[0].id)}><span>▶</span>开拼</button><button className={tab==="works"?"active":""} onClick={()=>setTab("works")}><span>★</span>作品</button></nav>}
      {poster && <div className="poster-sheet"><section><button className="poster-close" onClick={()=>setPoster(null)} aria-label="关闭">×</button><small>{poster.kind === "print" ? "高清可打印图纸" : "米粒的作品卡"}</small><img src={poster.src} alt={`${pattern.name}拼豆${poster.kind === "print" ? "图纸" : "作品卡"}`} /><div><button onClick={downloadPoster}>保存高清图</button><button onClick={printPoster}>打印</button></div><p>手机上也可长按图片保存</p></section></div>}
      {animationPattern && <div className="animation-sheet" role="dialog" aria-modal="true" aria-label={`${animationPattern.name}动画`}><section><button className="animation-close" onClick={()=>setAnimationId(null)} aria-label="关闭动画">×</button><small>作品动起来了</small><h2>{animationPattern.name}</h2><div className="motion-stage"><div className="motion-trail">✦ · ✦</div><Art pattern={animationPattern} bead animated/></div><p>{animationPattern.animation}</p><button className="replay" onClick={()=>{setAnimationId(null);requestAnimationFrame(()=>setAnimationId(animationPattern.id))}}>再播放一次</button></section></div>}
    </div>
  </main>;
}
