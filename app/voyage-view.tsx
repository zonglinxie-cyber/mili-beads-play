/* eslint-disable @next/next/no-img-element -- companion avatar matches the rest of the offline shell */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Compass, Mail, Moon, Sparkles, Wind } from "lucide-react";
import type { Pattern } from "./patterns";
import {
  ATTUNE_COST,
  BURST_COST,
  MIX_COST,
  MOON_LABELS,
  VOYAGE_VIEW,
  WIND_LABELS,
  buildVoyageWorld,
  canMixColors,
  constraintLine,
  createVoyageRun,
  currentLetter,
  encounterAt,
  isGapCell,
  isGlowCell,
  lanternMax,
  neighborsOf,
  reduceVoyage,
  stampAt,
  viewportOrigin,
  visibleCells,
  voyageHint,
  voyageProgress,
  voyageSeedFor,
  weatherLine,
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

function PixelArt({ pattern }: { pattern: Pattern }) {
  const cells = pattern.rows.join("").split("");
  return <div className="art pixels voyage-mini-art" style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
    {cells.map((cell, index) => <i key={index} className={cell === "." ? "empty" : "filled"} style={cell !== "." ? { backgroundColor: pattern.palette[cell]?.color } : undefined} />)}
  </div>;
}

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
  const [message, setMessage] = useState("");
  const messageTimer = useRef<number | null>(null);
  const booted = useRef<string | null>(null);

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

  const say = (text: string, ms = 2800) => {
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
      else say(voyageHint(world, run));
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
    say(weatherLine(nextWorld));
  };

  if (!activeId || !world || !run || !pattern) {
    const seals = catalog.filter(item => voyages[item.id]?.complete).length;
    return <section className="voyage-screen voyage-hub">
      <header className="voyage-header">
        <button type="button" onClick={onBack} aria-label="返回首页"><ArrowLeft aria-hidden="true" /></button>
        <div>
          <b>夜航探图</b>
          <small>提着灯走进图案里</small>
        </div>
        <span className="voyage-seal-count" aria-label={`已盖章${seals}/${catalog.length}`}>{seals}/{catalog.length}</span>
      </header>
      <p className="voyage-weather"><Moon aria-hidden="true" />今晚可以选一座岛。满月路更亮，逆风更费灯。</p>
      <div className="voyage-islands">
        {catalog.map(item => {
          const shown = resolvePattern(item.id);
          const state = voyages[item.id];
          const crafted = completedIds.includes(item.id);
          return <button key={item.id} type="button" className={`voyage-island${state?.complete ? " is-done" : ""}${state && !state.complete ? " is-mid" : ""}`} onClick={() => openMap(item.id)}>
            <PixelArt pattern={shown} />
            <span>
              <b>{item.name}</b>
              <small>{state?.complete ? "夜航印章已盖" : state ? `已走 ${state.steps} 步` : crafted ? "图纸已拼，夜里还能再走" : "还没走过的夜路"}</small>
            </span>
            <em>{state?.complete ? "再走" : state ? "继续" : "出发"}</em>
          </button>;
        })}
      </div>
    </section>;
  }

  const visible = visibleCells(world, run);
  const view = viewportOrigin(world, run);
  const viewSize = Math.min(VOYAGE_VIEW, world.width, world.height);
  const progress = voyageProgress(world, run);
  const letter = currentLetter(world, run);
  const stamp = stampAt(world, run);
  const encounter = encounterAt(world, run);
  const percent = Math.round(((progress.letters + progress.stamps) / Math.max(1, progress.letterTotal + progress.stampTotal)) * 100);
  const paletteKeys = Object.keys(world.palette);

  const cellLabel = (index: number) => {
    const row = Math.floor(index / world.width) + 1;
    const col = (index % world.width) + 1;
    if (index === run.position) return `第${row}行第${col}格，米粒在这里`;
    if (!visible.has(index)) return `第${row}行第${col}格，还在夜里`;
    if (run.ghosts.includes(index)) return `第${row}行第${col}格，豆桥`;
    const symbol = world.cells[index];
    if (symbol === ".") return `第${row}行第${col}格，空地`;
    return `第${row}行第${col}格，${world.palette[symbol]?.name ?? "豆子"}`;
  };

  return <section className="voyage-screen voyage-play">
    <header className="voyage-header">
      <button type="button" onClick={() => { setActiveId(null); setCelebrate(false); }} aria-label="返回夜航地图"><ArrowLeft aria-hidden="true" /></button>
      <div>
        <b>{world.name}</b>
        <small>灯 {run.lantern}/{lanternMax(world)} · {WIND_LABELS[world.weather.wind]} · {MOON_LABELS[world.weather.moon]}</small>
      </div>
      <button type="button" className="voyage-moon" onClick={() => setConfirmMoon(true)}>新月亮</button>
    </header>
    <div className="voyage-progress" role="progressbar" aria-label="夜航完成度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><i style={{ width: `${percent}%` }} /><b>{percent}%</b></div>
    <div className="voyage-status">
      <p><Mail aria-hidden="true" />信 {progress.letters}/{progress.letterTotal}</p>
      <p><Compass aria-hidden="true" />印 {progress.stamps}/{progress.stampTotal}</p>
      <p><Wind aria-hidden="true" />{weatherLine(world)}</p>
    </div>
    {letter && <div className="voyage-letter">
      <b>{run.carrying ? `正在送：${letter.toName}` : `下一封：${letter.fromName}`}</b>
      <small>{constraintLine(world, letter.constraint)}</small>
    </div>}
    <div className="voyage-board">
      <div className="companion" role="status" aria-live="polite" aria-label="角色说话">
        <img src={headerAvatar} srcSet={`${headerAvatar2x} 2x`} width="38" height="38" alt="" />
        <p>{message || voyageHint(world, run)}</p>
      </div>
      <div className="voyage-minimap" aria-hidden="true" style={{ "--cols": world.width } as React.CSSProperties}>
        {world.cells.map((cell, index) => {
          const shown = visible.has(index);
          const color = shown && cell !== "." ? world.palette[cell]?.color : undefined;
          return <i key={index} className={`${index === run.position ? "is-here" : ""} ${!shown ? "is-fog" : ""} ${run.ghosts.includes(index) ? "is-ghost" : ""}`} style={color ? { background: color } : undefined} />;
        })}
      </div>
      <div className="voyage-grid" style={{ "--cols": viewSize } as React.CSSProperties}>
        {Array.from({ length: viewSize * viewSize }, (_, slot) => {
          const row = view.row + Math.floor(slot / viewSize);
          const col = view.col + (slot % viewSize);
          if (row >= world.height || col >= world.width) return <span key={slot} className="voyage-cell is-void" aria-hidden="true" />;
          const index = row * world.width + col;
          const symbol = world.cells[index];
          const shown = visible.has(index);
          const here = index === run.position;
          const ghost = run.ghosts.includes(index);
          const glow = isGlowCell(world, index);
          const gap = mixArmed && isGapCell(world, run, index);
          const color = shown && symbol !== "." ? world.palette[symbol]?.color : undefined;
          return <button
            key={index}
            type="button"
            aria-label={cellLabel(index)}
            className={[
              "voyage-cell",
              symbol === "." && !ghost ? "is-void" : "",
              !shown ? "is-fog" : "",
              here ? "is-player" : "",
              ghost ? "is-ghost" : "",
              glow && shown ? "is-glow" : "",
              gap ? "is-gap" : "",
              world.stamps.some(item => item.index === index && !run.stamps.includes(item.id)) && shown ? "has-stamp" : "",
              world.letters.some(item => item.from === index && !run.letters.includes(item.id) && run.carrying !== item.id) && shown ? "has-mail" : "",
              world.letters.some(item => item.to === index && !run.letters.includes(item.id)) && shown ? "has-dest" : "",
            ].filter(Boolean).join(" ")}
            style={color ? { backgroundColor: color } : undefined}
            onClick={() => actOnCell(index)}
          />;
        })}
      </div>
    </div>
    <div className="voyage-actions">
      <button type="button" onClick={() => apply({ type: "burst" })}>点亮 · {BURST_COST}暖</button>
      <button type="button" className={mixArmed ? "active" : ""} onClick={() => setMixArmed(value => !value)}>{mixArmed ? "点空格开桥" : `开桥 · ${MIX_COST}+${MIX_COST}`}</button>
      <button type="button" onClick={() => apply({ type: "attune" })} disabled={!stamp}>取印 · {ATTUNE_COST}</button>
    </div>
    <div className="voyage-charges" aria-label="颜色力气">
      {paletteKeys.map(key => (
        <button
          key={key}
          type="button"
          className={`${run.mixA === key || run.mixB === key ? "active" : ""}`}
          aria-pressed={run.mixA === key || run.mixB === key}
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
    <details className="voyage-help">
      <summary>怎么玩</summary>
      <ul>
        <li>点身边的豆子走路。灯会慢慢暗，走到发光的豆子就能再亮。</li>
        <li>顺着一种颜色走，这种颜色的力气涨得更快。</li>
        <li>力气够了就能取印、点亮黑夜，或把两种颜色混成豆桥。</li>
        <li>送信有规矩：有的路不能踩某种颜色，有的门口要印章。</li>
        <li>逆风更费灯。顺着今晚的风走，信也更容易送到。</li>
      </ul>
    </details>
    <button type="button" className="voyage-craft" onClick={() => onCraft(pattern.id)}>去拼这张图纸</button>

    {riddleOpen && encounter?.kind === "riddle" && <div className="voyage-sheet" role="dialog" aria-modal="true" aria-label="猜颜色">
      <section>
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

    {confirmMoon && <div className="voyage-sheet" role="dialog" aria-modal="true" aria-label="等新月亮">
      <section>
        <h2>等新月亮？</h2>
        <p>今晚的风和信会重排，已经走的路会清掉。</p>
        <div className="voyage-sheet-actions">
          <button type="button" onClick={() => setConfirmMoon(false)}>继续今晚</button>
          <button type="button" className="danger" onClick={() => openMap(pattern.id, true)}>重新出发</button>
        </div>
      </section>
    </div>}

    {celebrate && <div className="voyage-sheet voyage-win" role="dialog" aria-modal="true" aria-label="夜航完成">
      <section>
        <div className="celebration-icons" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <Sparkles key={index} />)}</div>
        <h2>夜航印章盖好了</h2>
        <p>{world.name}的信都送到了。灯还亮着。</p>
        <div className="voyage-sheet-actions">
          <button type="button" onClick={() => { setCelebrate(false); setActiveId(null); }}><Check aria-hidden="true" />回地图</button>
          <button type="button" onClick={() => onCraft(pattern.id)}>去拼实体图纸</button>
        </div>
      </section>
    </div>}
  </section>;
}
