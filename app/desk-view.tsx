import type { CSSProperties } from "react";
import { FREE_PALETTE, findPattern, isAdvancedPattern, type Pattern } from "./patterns";
import { DESK_SLOT_COUNT, type DeskItem, type DeskSave } from "./desk";
import type { FreeDrawing, StageEffectId, StageSceneId } from "./save-store";

type SceneOption = { id: StageSceneId; name: string; image: string };
type EffectOption = { id: StageEffectId; name: string };
type Colorways = Record<string, string>;

const resolvePattern = (pattern: Pattern, colorwayId?: string): Pattern => {
  const option = pattern.colorways.find(entry => entry.id === colorwayId);
  return option ? { ...pattern, palette: { ...pattern.palette, ...option.palette } } : pattern;
};

function PixelArt({ pattern, silhouette = false }: { pattern: Pattern; silhouette?: boolean }) {
  const cells = pattern.rows.join("").split("");
  return <div className="art pixels desk-art" style={{ "--cols": pattern.rows[0].length } as CSSProperties} aria-hidden="true">
    {cells.map((cell, index) => {
      if (cell === ".") return <i key={index} className="empty" />;
      return <i key={index} className={silhouette ? "silhouette" : "filled"} style={silhouette ? undefined : { backgroundColor: pattern.palette[cell]?.color }} />;
    })}
  </div>;
}

function DrawingArt({ cells }: { cells: string[] }) {
  return <div className="art pixels desk-art" style={{ "--cols": 18 } as CSSProperties} aria-hidden="true">
    {cells.map((cell, index) => <i key={index} className={cell === "." ? "empty" : "filled"} style={cell !== "." ? { backgroundColor: FREE_PALETTE[cell]?.color } : undefined} />)}
  </div>;
}

export function DeskView({
  desk,
  drawings,
  colorways,
  scenes,
  effects,
  nextQuest,
  selectedSlot,
  onSelectSlot,
  onMove,
  onOpenItem,
  onOpenQuest,
  onChangeScene,
  onChangeEffect,
}: {
  desk: DeskSave;
  drawings: FreeDrawing[];
  colorways: Colorways;
  scenes: SceneOption[];
  effects: EffectOption[];
  nextQuest: { id: string; name: string; pattern: Pattern } | null;
  selectedSlot: number | null;
  onSelectSlot: (slot: number) => void;
  onMove: (from: number, direction: -1 | 1) => void;
  onOpenItem: (item: DeskItem) => void;
  onOpenQuest: (patternId: string) => void;
  onChangeScene: (id: StageSceneId) => void;
  onChangeEffect: (id: StageEffectId) => void;
}) {
  const scene = scenes.find(item => item.id === desk.scene) ?? scenes[0];
  const seatedIds = new Set(desk.items.filter(item => item.kind === "pattern").map(item => item.id));
  const ghost = nextQuest && !seatedIds.has(nextQuest.id) ? nextQuest : null;
  const ghostSlot = ghost ? Array.from({ length: DESK_SLOT_COUNT }, (_, slot) => slot).find(slot => !desk.items.some(item => item.slot === slot)) : undefined;
  const selected = desk.items.find(item => item.slot === selectedSlot);

  return <section className="desk-world" aria-label="米粒的书桌">
    <div className="desk-head">
      <small>米粒的书桌</small>
      <h2>拼完的朋友站在这里</h2>
      <p>{ghost ? `下一站还是剪影。点${ghost.name}就能开拼。` : "点一个朋友，可以让他们换位子。"}</p>
    </div>
    <div className="desk-stage" data-scene={desk.scene} data-effect={desk.effect}>
      <img className="stage-background" src={scene.image} alt="" />
      <div className={`stage-effect effect-${desk.effect}`} aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
      <div className="desk-slots">
        {Array.from({ length: DESK_SLOT_COUNT }, (_, slot) => {
          const item = desk.items.find(entry => entry.slot === slot);
          const isGhost = ghost && ghostSlot === slot;
          if (item?.kind === "pattern") {
            const base = findPattern(item.id);
            const shown = resolvePattern(base, colorways[item.id]);
            return <button key={slot} type="button" className={`desk-slot${selectedSlot === slot ? " selected" : ""}${isAdvancedPattern(base) ? " advanced" : ""}`} aria-pressed={selectedSlot === slot} aria-label={shown.name} onClick={() => onSelectSlot(slot)} onDoubleClick={() => onOpenItem(item)}>
              <PixelArt pattern={shown} />
              <span>{shown.name}</span>
            </button>;
          }
          if (item?.kind === "drawing") {
            const drawing = drawings.find(entry => entry.id === item.id);
            if (!drawing) return <span key={slot} className="desk-slot empty" />;
            return <button key={slot} type="button" className={`desk-slot${selectedSlot === slot ? " selected" : ""}`} aria-pressed={selectedSlot === slot} aria-label={drawing.name} onClick={() => onSelectSlot(slot)} onDoubleClick={() => onOpenItem(item)}>
              <DrawingArt cells={drawing.cells} />
              <span>{drawing.name}</span>
            </button>;
          }
          if (isGhost && ghost) {
            return <button key={slot} type="button" className="desk-slot ghost" aria-label={`去拼出${ghost.name}`} onClick={() => onOpenQuest(ghost.id)}>
              <PixelArt pattern={ghost.pattern} silhouette />
              <span>去拼出{ghost.name}</span>
            </button>;
          }
          return <span key={slot} className="desk-slot empty" aria-hidden="true" />;
        })}
      </div>
    </div>
    <div className="desk-tools">
      <div className="desk-move">
        <button type="button" disabled={selectedSlot === null || selectedSlot === 0 || !selected} onClick={() => selectedSlot !== null && onMove(selectedSlot, -1)}>往左站</button>
        <button type="button" disabled={selectedSlot === null || selectedSlot === DESK_SLOT_COUNT - 1 || !selected} onClick={() => selectedSlot !== null && onMove(selectedSlot, 1)}>往右站</button>
        {selected && <button type="button" onClick={() => onOpenItem(selected)}>看仔细</button>}
      </div>
      <fieldset>
        <legend>书桌背景</legend>
        <div>{scenes.map(item => <button key={item.id} type="button" className={desk.scene === item.id ? "active" : ""} aria-pressed={desk.scene === item.id} onClick={() => onChangeScene(item.id)}>{item.name}</button>)}</div>
      </fieldset>
      <fieldset>
        <legend>小光点</legend>
        <div>{effects.map(item => <button key={item.id} type="button" className={desk.effect === item.id ? "active" : ""} aria-pressed={desk.effect === item.id} onClick={() => onChangeEffect(item.id)}>{item.name}</button>)}</div>
      </fieldset>
    </div>
  </section>;
}
