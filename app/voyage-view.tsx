/* eslint-disable @next/next/no-img-element -- companion avatar matches the rest of the offline shell */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import type { Pattern } from "./patterns";
import {
  ATTUNE_COST,
  BURST_COST,
  DIR_LABELS,
  VOYAGE_VIEW,
  buildVoyageWorld,
  canMixColors,
  createVoyageRun,
  directionBetween,
  encounterAt,
  isGapCell,
  lanternMax,
  neighborsOf,
  reduceVoyage,
  stampAt,
  viewportOrigin,
  visibleCells,
  voyageSeedFor,
  voyageTask,
  type VoyageAction,
  type VoyageRun,
} from "./voyage";

type VoyageViewProps = {
  catalog: Pattern[];
  voyages: Record<string, VoyageRun>;
  completedIds: readonly string[];
  resolvePattern: (id: string) => Pattern;
  initialPatternId?: string | null;
  headerAvatar: string;
  headerAvatar2x: string;
  onBack: () => void;
  onPersist: (run: VoyageRun) => void;
  onCraft: (id: string) => void;
};

const COACH_KEY = "mili-voyage-coach-v2";

function PixelArt({ pattern }: { pattern: Pattern }) {
  const cells = pattern.rows.join("").split("");
  return <div className="art pixels voyage-mini-art" style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
    {cells.map((cell, index) => <i key={index} className={cell === "." ? "empty" : "filled"} style={cell !== "." ? { backgroundColor: pattern.palette[cell]?.color } : undefined} />)}
  </div>;
}

const readCoach = () => {
  try { return localStorage.getItem(COACH_KEY) === "1"; } catch { return false; }
};

export function VoyageView({
  catalog,
  voyages,
  completedIds,
  resolvePattern,
  initialPatternId = null,
  headerAvatar,
  headerAvatar2x,
  onBack,
  onPersist,
  onCraft,
}: VoyageViewProps) {
  const [activeId, setActiveId] = useState<string | null>(initialPatternId);
  const [mixArmed, setMixArmed] = useState(false);
  const [riddleOpen, setRiddleOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [confirmMoon, setConfirmMoon] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [coachStep, setCoachStep] = useState(() => readCoach() ? -1 : 0);
  const [message, setMessage] = useState("");
  const messageTimer = useRef<number | null>(null);
  const booted = useRef<string | null>(null);

  const starters = catalog.filter(item => !item.advanced);
  const extras = catalog.filter(item => item.advanced);
  const pattern = activeId ? resolvePattern(activeId) : null;
  const saved = activeId ? voyages[activeId] : undefined;
  const world = useMemo(() => {
    if (!pattern) return null;
    return buildVoyageWorld(pattern, saved?.seed ?? voyageSeedFor(pattern.id));
  }, [pattern, saved?.seed]);
  const run = saved && world ? saved : world ? createVoyageRun(world, "default") : null;

  useEffect(() => () => {
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
  }, []);

  useEffect(() => {
    if (!world || !activeId || voyages[activeId] || booted.current === activeId) return;
    booted.current = activeId;
    onPersist(createVoyageRun(world));
  }, [activeId, world, voyages, onPersist]);

  const say = (text: string, ms = 3200) => {
    setMessage(text);
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => { setMessage(""); messageTimer.current = null; }, ms);
  };

  const apply = (action: VoyageAction) => {
    if (!world || !run) return;
    const result = reduceVoyage(world, run, action);
    onPersist(result.run);
    say(result.message);
    if (result.kind === "win") setCelebrate(true);
    const encounter = encounterAt(world, result.run);
    if (action.type === "step" && encounter?.kind === "riddle") setRiddleOpen(true);
    if (action.type === "answer" && result.kind === "ok") setRiddleOpen(false);
    if (action.type === "bridge" && result.kind === "ok") setMixArmed(false);
    if (result.kind === "block") navigator.vibrate?.(20);
  };

  const actOnCell = (index: number) => {
    if (!world || !run) return;
    if (mixArmed && isGapCell(world, run, index)) {
      apply({ type: "bridge", index });
      return;
    }
    if (index === run.position) {
      if (stampAt(world, run)) apply({ type: "attune" });
      else if (encounterAt(world, run)?.kind === "riddle") setRiddleOpen(true);
      else say(voyageTask(world, run).how);
      return;
    }
    apply({ type: "step", index });
  };

  useEffect(() => {
    if (!world || !run || !activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const next = event.key === "ArrowUp" ? run.position - world.width
        : event.key === "ArrowRight" ? run.position + 1
          : event.key === "ArrowDown" ? run.position + world.width
            : event.key === "ArrowLeft" ? run.position - 1
              : -1;
      if (next < 0 || !neighborsOf(run.position, world.width, world.height).includes(next)) return;
      event.preventDefault();
      actOnCell(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const dismissCoach = () => {
    setCoachStep(-1);
    try { localStorage.setItem(COACH_KEY, "1"); } catch { /* keep going without remembering */ }
  };

  const openMap = (id: string, freshMoon = false) => {
    const source = resolvePattern(id);
    const existing = voyages[id];
    const seed = !freshMoon && existing?.seed ? existing.seed : voyageSeedFor(id);
    const nextWorld = buildVoyageWorld(source, seed);
    const nextRun = !freshMoon && existing && existing.seed === seed
      ? existing
      : createVoyageRun(nextWorld, existing?.colorwayId ?? "default");
    onPersist(nextRun);
    setActiveId(id);
    setMixArmed(false);
    setRiddleOpen(false);
    setCelebrate(false);
    setConfirmMoon(false);
    setShowMore(false);
    setMessage("");
  };

  if (!activeId || !world || !run || !pattern) {
    const seals = catalog.filter(item => voyages[item.id]?.complete).length;
    return <section className="voyage-screen voyage-hub">
      <header className="voyage-header">
        <button type="button" onClick={onBack} aria-label="返回首页"><ArrowLeft aria-hidden="true" /></button>
        <div>
          <b>夜航探图</b>
          <small>走进图里送信</small>
        </div>
        <span className="voyage-seal-count" aria-label={`已完成${seals}张`}>{seals}/{catalog.length}</span>
      </header>
      <div className="voyage-howto">
        <p><b>怎么玩</b></p>
        <ol>
          <li>选一张图走进去。</li>
          <li>你是写着「我」的那一格。</li>
          <li>只点旁边带白圈的豆子，一格一格走。</li>
          <li>先拿到「信」，再走到「到」。</li>
        </ol>
      </div>
      <p className="voyage-weather">先点第一张就行。</p>
      <div className="voyage-islands">
        {starters.map((item, order) => {
          const shown = resolvePattern(item.id);
          const state = voyages[item.id];
          return <button key={item.id} type="button" className={`voyage-island${order === 0 ? " is-start" : ""}${state?.complete ? " is-done" : ""}${state && !state.complete ? " is-mid" : ""}`} onClick={() => openMap(item.id)}>
            <PixelArt pattern={shown} />
            <span>
              <b>{item.name}</b>
              <small>{state?.complete ? "送完了" : state ? "上次走到一半" : order === 0 ? "从这里开始" : completedIds.includes(item.id) ? "图纸拼过了，夜里还能走" : "还没走过"}</small>
            </span>
            <em>{state?.complete ? "再走" : state ? "继续" : order === 0 ? "开始" : "进去"}</em>
          </button>;
        })}
      </div>
      {extras.length > 0 && <details className="voyage-help">
        <summary>更大的图</summary>
        <div className="voyage-islands">
          {extras.map(item => {
            const shown = resolvePattern(item.id);
            const state = voyages[item.id];
            return <button key={item.id} type="button" className={`voyage-island${state?.complete ? " is-done" : ""}`} onClick={() => openMap(item.id)}>
              <PixelArt pattern={shown} />
              <span><b>{item.name}</b><small>大图，慢慢走</small></span>
              <em>{state ? "继续" : "进去"}</em>
            </button>;
          })}
        </div>
      </details>}
    </section>;
  }

  const visible = visibleCells(world, run);
  const view = viewportOrigin(world, run);
  const viewSize = Math.min(VOYAGE_VIEW, world.width, world.height);
  const task = voyageTask(world, run);
  const stamp = stampAt(world, run);
  const encounter = encounterAt(world, run);
  const walkable = new Set(neighborsOf(run.position, world.width, world.height).filter(index => {
    const symbol = world.cells[index];
    return symbol !== "." || run.ghosts.includes(index);
  }));
  const lamp = `${run.lantern}/${lanternMax(world)}`;
  const paletteKeys = Object.keys(world.palette);
  const lettersLeft = world.letters.filter(item => !run.letters.includes(item.id)).length;
  const stampsLeft = world.stamps.filter(item => !run.stamps.includes(item.id)).length;

  const markFor = (index: number) => {
    if (index === run.position) return "我";
    if (task.nextIndex === index) {
      const dir = directionBetween(run.position, index, world.width);
      return dir !== null ? DIR_LABELS[dir] : "走";
    }
    if (walkable.has(index)) return "走";
    if (world.letters.some(item => item.from === index && !run.letters.includes(item.id) && run.carrying !== item.id)) return "信";
    if (world.letters.some(item => item.to === index && !run.letters.includes(item.id))) return "到";
    if (world.stamps.some(item => item.index === index && !run.stamps.includes(item.id))) return "印";
    return "";
  };

  return <section className="voyage-screen voyage-play">
    <header className="voyage-header">
      <button type="button" onClick={() => { setActiveId(null); setCelebrate(false); }} aria-label="返回夜航地图"><ArrowLeft aria-hidden="true" /></button>
      <div>
        <b>{world.name}</b>
        <small>灯还剩 {lamp}</small>
      </div>
      <button type="button" className="voyage-moon" onClick={() => setShowMore(value => !value)}>{showMore ? "收起" : "更多"}</button>
    </header>

    <div className="voyage-mission">
      <small>现在做什么</small>
      <b>{task.title}</b>
      <p>{message || task.how}</p>
    </div>

    <div className="voyage-board">
      <div className="voyage-grid" style={{ "--cols": viewSize } as React.CSSProperties}>
        {Array.from({ length: viewSize * viewSize }, (_, slot) => {
          const row = view.row + Math.floor(slot / viewSize);
          const col = view.col + (slot % viewSize);
          if (row >= world.height || col >= world.width) return <span key={slot} className="voyage-cell is-void" aria-hidden="true" />;
          const index = row * world.width + col;
          const symbol = world.cells[index];
          const ghost = run.ghosts.includes(index);
          const empty = symbol === "." && !ghost;
          if (empty && !mixArmed) return <span key={index} className="voyage-cell is-void" aria-hidden="true" />;
          const shown = visible.has(index);
          const here = index === run.position;
          const next = task.nextIndex === index;
          const step = walkable.has(index);
          const color = shown && symbol !== "." ? world.palette[symbol]?.color : undefined;
          const mark = shown ? markFor(index) : "";
          const rowNo = row + 1;
          const colNo = col + 1;
          const name = symbol !== "." ? world.palette[symbol]?.name ?? "豆子" : "空地";
          return <button
            key={index}
            type="button"
            aria-label={here ? `第${rowNo}行第${colNo}格，米粒在这里` : next ? `第${rowNo}行第${colNo}格，下一步，${name}` : `第${rowNo}行第${colNo}格，${name}`}
            className={[
              "voyage-cell",
              empty ? "is-void is-gap" : "",
              !shown ? "is-fog" : "",
              here ? "is-player" : "",
              ghost ? "is-ghost" : "",
              step && !here ? "is-step" : "",
              next ? "is-next" : "",
            ].filter(Boolean).join(" ")}
            style={color ? { backgroundColor: color } : undefined}
            onClick={() => actOnCell(index)}
          >{mark ? <em>{mark}</em> : null}</button>;
        })}
      </div>
      <p className="voyage-legend">亮圈=能走 · 「我」=你 · 「信」=去拿 · 「到」=送到</p>
    </div>

    <div className="voyage-score">信还差 {lettersLeft} 封 · 印还差 {stampsLeft} 枚</div>

    {task.action === "attune" && stamp && (
      <button type="button" className="voyage-primary" onClick={() => apply({ type: "attune" })}>
        拿走印章
      </button>
    )}
    {task.action === "bridge" && (
      <button type="button" className={`voyage-primary${mixArmed ? " is-on" : ""}`} onClick={() => setMixArmed(true)}>
        {mixArmed ? "再点两颗豆子中间的空格" : "搭一座桥"}
      </button>
    )}
    {run.lantern <= 2 && (
      <button type="button" className="voyage-secondary" onClick={() => apply({ type: "burst" })}>
        灯快灭了，点亮附近
      </button>
    )}

    {showMore && <div className="voyage-more">
      <button type="button" onClick={() => apply({ type: "burst" })}>点亮附近 · {BURST_COST}点暖色</button>
      <button type="button" onClick={() => setMixArmed(value => !value)}>{mixArmed ? "取消搭桥" : "搭一座桥"}</button>
      <button type="button" disabled={!stamp} onClick={() => apply({ type: "attune" })}>拿走印章 · {ATTUNE_COST}</button>
      <button type="button" onClick={() => setConfirmMoon(true)}>重新开始</button>
      <button type="button" onClick={() => onCraft(pattern.id)}>去拼这张图纸</button>
      <div className="voyage-charges" aria-label="颜色点数">
        {paletteKeys.map(key => (
          <button
            key={key}
            type="button"
            className={run.mixA === key || run.mixB === key ? "active" : ""}
            onClick={() => {
              const slot = !run.mixA || run.mixA === key ? "a" : "b";
              apply({ type: "select-mix", slot, color: (run.mixA === key || run.mixB === key) ? null : key });
              setMixArmed(true);
            }}
          >
            <i style={{ background: world.palette[key].color }} />
            <span>{world.palette[key].name}</span>
            <small>{run.charges[key] ?? 0}</small>
          </button>
        ))}
      </div>
      {mixArmed && run.mixA && run.mixB && !canMixColors(world, run.mixA, run.mixB) && <p className="voyage-mix-note">这两种颜色混不出桥。</p>}
    </div>}

    {coachStep >= 0 && <div className="voyage-sheet voyage-coach" role="dialog" aria-modal="true" aria-label="怎么玩">
      <section>
        <img src={headerAvatar} srcSet={`${headerAvatar2x} 2x`} width="48" height="48" alt="" />
        {coachStep === 0
          ? <><h2>你是「我」</h2><p>亮圈那一格就是你。一次只能点旁边一格，像走格子。</p></>
          : <><h2>先拿信，再送到</h2><p>走到写着「信」的豆子会捡起来。再走到写着「到」的绿点，信就送出去了。</p></>}
        <div className="voyage-sheet-actions">
          {coachStep === 0
            ? <button type="button" onClick={() => setCoachStep(1)}>下一句</button>
            : <button type="button" onClick={dismissCoach}><Check aria-hidden="true" />开始走</button>}
        </div>
      </section>
    </div>}

    {riddleOpen && encounter?.kind === "riddle" && <div className="voyage-sheet" role="dialog" aria-modal="true" aria-label="猜颜色">
      <section>
        <h2>猜一猜</h2>
        <p>{encounter.prompt}</p>
        <div>
          {paletteKeys.map(key => (
            <button key={key} type="button" onClick={() => apply({ type: "answer", color: key })}>
              <i style={{ background: world.palette[key].color }} />
              {world.palette[key].name}
            </button>
          ))}
        </div>
        <button type="button" className="voyage-sheet-close" onClick={() => setRiddleOpen(false)}>先走开</button>
      </section>
    </div>}

    {confirmMoon && <div className="voyage-sheet" role="dialog" aria-modal="true" aria-label="重新开始">
      <section>
        <h2>从头走？</h2>
        <p>已经走的路会清掉。</p>
        <div className="voyage-sheet-actions">
          <button type="button" onClick={() => setConfirmMoon(false)}>继续走</button>
          <button type="button" className="danger" onClick={() => openMap(pattern.id, true)}>重新开始</button>
        </div>
      </section>
    </div>}

    {celebrate && <div className="voyage-sheet voyage-win" role="dialog" aria-modal="true" aria-label="夜航完成">
      <section>
        <div className="celebration-icons" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <Sparkles key={index} />)}</div>
        <h2>送完啦</h2>
        <p>{world.name}的信都送到了。</p>
        <div className="voyage-sheet-actions">
          <button type="button" onClick={() => { setCelebrate(false); setActiveId(null); }}><Check aria-hidden="true" />回地图</button>
          <button type="button" onClick={() => onCraft(pattern.id)}>去拼这张图纸</button>
        </div>
      </section>
    </div>}
  </section>;
}
