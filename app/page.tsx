"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";

type Pattern = {
  id: string;
  name: string;
  story: string;
  level: "轻松" | "进阶" | "挑战";
  category: string;
  minutes: number;
  palette: Record<string, { name: string; color: string }>;
  rows: string[];
};

const P = {
  K: { name: "墨黑", color: "#29283b" }, W: { name: "奶油白", color: "#fff5df" },
  O: { name: "蜜橘", color: "#ee7b52" }, Y: { name: "星光黄", color: "#f5c95d" },
  P: { name: "樱花粉", color: "#ef91a7" }, R: { name: "莓果红", color: "#cf4e61" },
  B: { name: "湖水蓝", color: "#5daabe" }, N: { name: "深海蓝", color: "#355276" },
  G: { name: "叶子绿", color: "#6ba270" }, L: { name: "嫩芽绿", color: "#a8ca79" },
  C: { name: "可可棕", color: "#8a5d4a" }, T: { name: "焦糖", color: "#c58a5b" },
  V: { name: "葡萄紫", color: "#775f9c" }, S: { name: "浅紫", color: "#b7a0d2" },
};

const PATTERNS: Pattern[] = [
  { id:"astro-cat", name:"宇航员小猫", story:"米粒号今天要去月球捡星星", level:"进阶", category:"小动物", minutes:35, palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,B:P.B,N:P.N}, rows:[
    "..................","......K....K......",".....KOK..KOK.....","....KOOOKKOOOK....","...KOOOOOOOOOOK...","..KOOOWOOOOOWOOK..","..KOOKWKOOOKWKOOK.","..KOOOOOYOOOOOOK..","...KOOOKKOOOOK....","....KKOOOOOOKK....","...NWWKKKKKKWWN...","..NWWWWWWWWWWWWN..","..NWBWWWWWWWWBWN..","..NWWWWWWWWWWWWN..","...NNNWWWWWWNNN...",".....N.N..N.N.....","....NN.N..N.NN....",".................."]},
  { id:"capy-spa", name:"泡汤卡皮巴拉", story:"头顶小橘子，今天什么都不着急", level:"轻松", category:"小动物", minutes:25, palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,C:P.C,T:P.T,B:P.B}, rows:[
    "..................","........OO........",".......OOOO.......",".......OGGO.......","....CCCCCCCCCC....","...CTTTTTTTTTTC...","..CTTTKTTTTKTTC...","..CTTTTTTTTTTTTC..","..CTTTTTKTTTTTTC..","...CTTTKKTTTTTC...","....CCTTTTTTCC....",".BBBBCCCCCCCCBBBB.","BBBBBBBBBBBBBBBBBB","BBBWBBBBWBBBBWBBBB","BBBBBBBBBBBBBBBBBB",".BBBBBBBBBBBBBBBB.","...BBBBBBBBBBBB...",".................."]},
  { id:"cloud-dragon", name:"云间小青龙", story:"一甩尾巴，就把乌云扫走啦", level:"挑战", category:"神话", minutes:55, palette:{K:P.K,W:P.W,Y:P.Y,G:P.G,L:P.L,R:P.R,B:P.B}, rows:[
    "....YY......YY....","...Y..Y....Y..Y...","....GGGGGGGGGG....","...GLLGLLLLGLLG...","..GLLKLLLLLLKLLG..","..GLLLLLYYLLLLLG..","...GLLLRRLLLLG....","....GGLLLLGGG.....","......GLLLLLG.....",".......GGLLLGG....","..WWW....GLLLLG...",".WWWWW...GGLLLLG..","WWW.WWW....GLLLG..",".WWWWW......GLLG..","..WWW.....GGLLLG..","..........GLLGG...","..........GGG.....",".................."]},
  { id:"jelly-orbit", name:"星环水母", story:"透明的小伞里装着一整片银河", level:"进阶", category:"海洋", minutes:40, palette:{K:P.K,W:P.W,P:P.P,B:P.B,N:P.N,V:P.V,Y:P.Y}, rows:[
    ".......YY.........","...Y..........Y...","......NNNNNN......","....NNVVVVVVNN....","...NVVVVVVVVVVN...","..NVVBVVVVVVBVVN..","..NVVVVVVVVVVVVN..","..NVVVWVVVWVVVVN..","...NVVVVVVVVVVN...","....NNNNNNNNNN....",".....P.P..P.P.....","....P..P..P..P....","....P..P.P...P....","...P...P.P....P...","...P...P......P...","..P...........P...","..................",".................."]},
  { id:"strawberry-home", name:"草莓精灵小屋", story:"屋顶熟了，门后住着一只小精灵", level:"进阶", category:"童话", minutes:45, palette:{K:P.K,W:P.W,R:P.R,P:P.P,G:P.G,L:P.L,C:P.C,Y:P.Y}, rows:[
    ".......GG.........","......GLLG........",".....GGGGGG.......","....RRRRRRRRRR....","...RRWRRWRRWRRR...","..RRRRRRRRRRRRRR..",".RRRWRRRWRRRWRRRR.","..RRRRRRRRRRRRRR..","...RRRRRRRRRRRR...","....WWWWWWWWWW....","...WWWWWWWWWWWW...","...WWCCWWWWCCWW...","...WWCCWWWWCCWW...","...WWWWCCCCWWWW...","...WWWWCKKCWWWW...","..GGGGGCCCCGGGGG..",".GGGGGGGGGGGGGGGG.",".................."]},
  { id:"sushi-cat", name:"寿司店长猫", story:"今日特供：三文鱼握寿司和猫爪茶", level:"挑战", category:"小动物", minutes:50, palette:{K:P.K,W:P.W,O:P.O,P:P.P,R:P.R,G:P.G,C:P.C}, rows:[
    "....K........K....","...KWK......KWK...","..KWWWKKKKKKWWWK..","..KWWWWWWWWWWWWK..",".KWWKWWWWWWWWKWWK.",".KWWWWWWKWWWWWWWK.","..KWWWKKKKKWWWWK..","...KKWWWWWWWKKK...","....KWWWWWWWK.....","...KKKKKKKKKKK....","..KOOOOOOOOOOOK...","..KORRRRRRRRROK...","..KOWWWWWWWWWOK...","..KOOOOOOOOOOOK...","...KKKKKKKKKKK....","....G.G....G.G....","...GGG......GGG...",".................."]},
  { id:"moon-rabbit", name:"捣星星的月兔", story:"今晚不捣年糕，改做亮晶晶的星星", level:"轻松", category:"童话", minutes:30, palette:{K:P.K,W:P.W,P:P.P,Y:P.Y,N:P.N,S:P.S}, rows:[
    "......WW..WW......",".....WWPWWPWW.....",".....WWWWWWWW.....","....WWKWWWWKWW....","....WWWWPWWWWW....",".....WWWWWWWW.....","......WWWWWW......",".....SWWWWWWN.....","....SSWWWWWWNN....","...SSSWWWWWWNNN...","...SSSSWWWWNNNN...","....SSSSWWNNNN....",".....SSSWWNNN.....","..Y...SSWWNN...Y..",".YYY...SWWN...YYY.","..Y.....WW.....Y..","..................",".................."]},
  { id:"frog-rain", name:"雨天青蛙邮差", story:"踩过三个水坑，把彩虹信送到家", level:"进阶", category:"小动物", minutes:38, palette:{K:P.K,W:P.W,G:P.G,L:P.L,Y:P.Y,B:P.B,R:P.R}, rows:[
    "....LL......LL....","...LGGL....LGGL...","..LGKGLGGGGLGKGL..","..LGGGGGGGGGGGGL..","...GGGWGGGWGGGG...","....GGGGGGGGGG....","...YGGGGGGGGGGY...","..YYYGLLLLLLGYYY..","....GLLLLLLLLG....","....GLRLLLLRLG....","....GLLLLLLLLG....",".....GGLLLLGG.....","......GLLLLG......","..BBBBG....GBBBB..","BBBBBBB....BBBBBBB","..BBB........BBB..","..................",".................."]},
  { id:"rocket-shop", name:"银河冰淇淋火箭", story:"燃料是草莓味，目的地是甜甜星", level:"挑战", category:"太空", minutes:52, palette:{K:P.K,W:P.W,P:P.P,R:P.R,B:P.B,N:P.N,Y:P.Y}, rows:[
    "........Y.........",".......YYY........",".......NNN........","......NWWWN.......",".....NWWBWWN......",".....NWWBWWN......","....NWWWWWWWN.....","....NWPWWWPWN.....","....NWWWWWWWN.....","...NNWWWWWWWNN....","..NPNNNNNNNNNPN...",".NPPPNWWWWWNPPPN..","....NWWWWWWWN.....","....NNNNNNNNN.....",".....R.R.R.R......","....RR.R.R.RR.....",".....R...R.R......",".................."]},
  { id:"duck-skate", name:"滑板小鸭", story:"戴好头盔，沿着彩虹斜坡出发", level:"轻松", category:"运动", minutes:28, palette:{K:P.K,W:P.W,Y:P.Y,O:P.O,B:P.B,R:P.R,G:P.G}, rows:[
    "......YYYY........","....YYYYYYYY......","...YYKYYYYKYYY....","...YYYYOYYYYYY....","....YYOOOYYYY.....",".....YYYYYY.......","....BYYYYYYB......","...BBYYYYYYBB.....","...BBYYYYYYBB.....","....BYYYYYYB......",".....YY..YY.......",".....YY..YY.......","..RRRRRRRRRRRRR...",".RRGGRRRRRRGGRRR..","...GG......GG.....","..................","..................",".................."]},
];

const keys = (p: Pattern) => Object.keys(p.palette);
const targetCount = (p: Pattern) => p.rows.join("").split("").filter(c => c !== ".").length;

function Art({ pattern, bead = false, board, hint = false, selected }: { pattern: Pattern; bead?: boolean; board?: string[]; hint?: boolean; selected?: string }) {
  const cells = pattern.rows.join("").split("");
  return <div className={`art ${bead ? "beads" : "pixels"}`} style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
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
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("mili-game-v2") ?? "{}").completed ?? []; } catch { return []; }
  });
  const [savedBoards, setSavedBoards] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("mili-game-v2") ?? "{}").boards ?? {}; } catch { return {}; }
  });
  const [celebrate, setCelebrate] = useState(false);
  const [installEvent, setInstallEvent] = useState<Event & { prompt?: () => Promise<void> } | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const pattern = PATTERNS.find(p => p.id === activeId) ?? PATTERNS[0];
  const target = pattern.rows.join("").split("");
  const done = board.reduce((n, v, i) => n + (v !== "." && v === target[i] ? 1 : 0), 0);
  const total = targetCount(pattern);
  const progress = Math.round(done / total * 100);
  const categories = ["全部", ...Array.from(new Set(PATTERNS.map(p => p.category)))];

  useEffect(() => {
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as Event & { prompt?: () => Promise<void> }); };
    window.addEventListener("beforeinstallprompt", handleInstall);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  useEffect(() => { localStorage.setItem("mili-game-v2", JSON.stringify({ completed, boards: savedBoards })); }, [completed, savedBoards]);

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
      if (nextDone === total) { setCelebrate(true); setCompleted(c => c.includes(pattern.id) ? c : [...c, pattern.id]); navigator.vibrate?.([40,40,80]); }
      return next;
    });
  };

  const handlePointer = (event: PointerEvent<HTMLButtonElement>, index: number) => { event.preventDefault(); paint(index); };
  const currentColorDone = board.filter((v,i) => v === selected && v === target[i]).length;
  const currentColorTotal = target.filter(v => v === selected).length;

  return <main>
    <div className="app">
      {tab !== "game" && <header className="app-header"><button className="logo" onClick={()=>setTab("home")}><span>米</span><div><b>米粒拼豆社</b><small>把小豆子拼成大冒险</small></div></button><button className="round" onClick={()=>setTab("works")}>★</button></header>}

      {tab === "home" && <>
        <section className="home-hero"><div className="hero-copy"><span>今日神秘任务</span><h1>宇航员小猫<br/>登月倒计时</h1><p>跟着色号，把每颗小豆子放回正确的位置。</p><button onClick={()=>openGame("astro-cat")}>开始挑战 <b>→</b></button></div><div className="hero-art"><Art pattern={PATTERNS[0]} /><i>✦</i><i>✦</i></div></section>
        <section className="quick-status"><div><span>🔥</span><p><b>连续创作 3 天</b><small>再完成 1 张，点亮星星徽章</small></p></div><em>3/4</em></section>
        <section className="section-title"><div><small>米粒精选</small><h2>一眼就想拼的图纸</h2></div><button onClick={()=>setTab("library")}>查看全部</button></section>
        <div className="featured-list">{PATTERNS.slice(1,4).map(p=><Card key={p.id} pattern={p} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} />)}</div>
        <section className="mystery-card"><div><span>?</span></div><section><small>神秘拼豆</small><h2>不看答案，边拼边猜</h2><p>每完成一种颜色，揭开一部分图案。</p><button onClick={()=>{openGame("moon-rabbit");setHint(false)}}>试试看</button></section></section>
        {installEvent && <button className="install-banner" onClick={()=>installEvent.prompt?.()}><span>＋</span><p><b>放到手机桌面</b><small>像普通游戏一样，点一下就能玩</small></p><i>安装</i></button>}
      </>}

      {tab === "library" && <section className="library"><div className="page-head"><small>图纸宝库</small><h1>今天拼哪个？</h1><p>所有图形都完整展示，点开就能直接玩。</p></div><div className="filters">{categories.map(c=><button key={c} className={filter===c?"active":""} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="library-list">{PATTERNS.filter(p=>filter==="全部"||p.category===filter).map(p=><Card key={p.id} pattern={p} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} />)}</div></section>}

      {tab === "game" && <section className="game-screen">
        <header className="game-header"><button onClick={()=>setTab("library")}>‹</button><div><b>{pattern.name}</b><small>{done}/{total} 颗 · 错误 {mistakes}</small></div><button onClick={()=>setHint(v=>!v)}>{hint?"关提示":"开提示"}</button></header>
        <div className="game-progress"><i style={{width:`${progress}%`}} /><b>{progress}%</b></div>
        <div className="reference"><div><span>完整图纸</span><button onClick={()=>gameRef.current?.scrollIntoView({behavior:"smooth"})}>开始拼 ↓</button></div><Art pattern={pattern} /></div>
        <div className="color-goal"><i style={{background:pattern.palette[selected].color}}/><p><b>现在拼：{pattern.palette[selected].name}</b><small>{currentColorDone}/{currentColorTotal} 颗 · {hint?"闪烁位置就是目标":"提示已关闭"}</small></p></div>
        <div className="play-board" ref={gameRef} onPointerLeave={()=>setDrawing(false)}><div className="touch-grid" style={{"--cols":pattern.rows[0].length} as React.CSSProperties}>{target.map((cell,i)=><button key={i} aria-label={`第${i+1}格`} className={`${cell==="."?"outside":""} ${board[i]!=="."?"placed":""} ${hint&&cell===selected&&board[i]==="."?"target-hint":""}`} style={board[i]!=="."?{background:pattern.palette[board[i]].color}:undefined} onPointerDown={e=>{setDrawing(true);handlePointer(e,i)}} onPointerEnter={e=>{if(drawing)handlePointer(e,i)}} onPointerUp={()=>setDrawing(false)} />)}</div>{message&&<div className="bubble">{message}</div>}</div>
        <div className="palette"><div className="palette-head"><b>选择豆子颜色</b><button onClick={()=>{const empty=Array(target.length).fill(".");setBoard(empty);setSavedBoards(all=>({...all,[pattern.id]:empty}))}}>重新开始</button></div><div>{keys(pattern).map(k=>{const count=target.filter(v=>v===k).length;const placed=board.filter(v=>v===k).length;return <button key={k} className={selected===k?"active":""} onClick={()=>setSelected(k)}><i style={{background:pattern.palette[k].color}}/><span>{pattern.palette[k].name}<small>{placed}/{count}</small></span>{placed===count&&<em>✓</em>}</button>})}</div></div>
        {celebrate&&<div className="finish-sheet"><div className="confetti">✦ · ● · ✦</div><Art pattern={pattern}/><h2>完成啦，米粒！</h2><p>{pattern.story}</p><div><button onClick={()=>setTab("works")}>放进作品册</button><button onClick={()=>setCelebrate(false)}>再看看作品</button></div></div>}
      </section>}

      {tab === "works" && <section className="works"><div className="page-head"><small>米粒的作品册</small><h1>{completed.length} 个闪亮作品</h1><p>每完成一幅，都会永久收藏在这台手机里。</p></div>{completed.length?<div className="work-grid">{PATTERNS.filter(p=>completed.includes(p.id)).map(p=><button key={p.id} onClick={()=>openGame(p.id)}><Art pattern={p}/><b>{p.name}</b><small>完成 · 点击再玩</small></button>)}</div>:<div className="no-works"><span>✦</span><h2>第一颗星星还在等你</h2><p>完成一张图纸，它就会出现在这里。</p><button onClick={()=>openGame("astro-cat")}>去完成第一幅</button></div>}</section>}

      {tab !== "game" && <nav className="nav"><button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><span>⌂</span>首页</button><button className={tab==="library"?"active":""} onClick={()=>setTab("library")}><span>▦</span>图纸</button><button className="play" onClick={()=>openGame(PATTERNS.find(p=>!completed.includes(p.id))?.id??PATTERNS[0].id)}><span>▶</span>开拼</button><button className={tab==="works"?"active":""} onClick={()=>setTab("works")}><span>★</span>作品</button></nav>}
    </div>
  </main>;
}
