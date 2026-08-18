"use client";
/* eslint-disable @next/next/no-img-element -- generated posters are local canvas data URLs */

import { ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, Flame, Home as HomeIcon, Palette, Play, Plus, RotateCcw, Sparkles, Star, X } from "lucide-react";
import { DeskView } from "./desk-view";
import { desksEqual, emptyDesk, sanitizeDesk, seatCompletedWorks, swapDeskSlots, type DeskSave } from "./desk";
import { ADVANCED_PATTERNS, FREE_PALETTE, PATTERNS, Pattern, findPattern, isAdvancedPattern, targetCount } from "./patterns";
import { formatEstimatedMinutes, materialPlan, patternPresentation } from "./pattern-metadata";
import { buildSpotPuzzle, companionIdle, companionIdleSpot, companionLine, composeStory, defaultStorySelection, storyDoingOptions, storyWhoOptions, spotZoneOf, type PlayMode, type SpotPuzzle } from "./play-content";
import { PrivacyContent } from "./privacy-content";
import { isStoryPageUnlocked, isStoryPattern, storyPatternIds, storyQuestState } from "./quest";
import { DELETE_PENDING_KEY, DELETE_TOMBSTONE, emptySaveSnapshot, FREE_DRAWING_LIMIT, FreeDrawing, GameSave, LEGACY_CLEAN_KEY, LEGACY_CLEAN_VALUE, LEGACY_SAVE_KEYS, normalizeSave, readLocalSave, SAVE_KEY, SaveSnapshot, serializeSave, StageEffectId, StageSceneId, StageSelection, StorySelection, VoyageRun } from "./save-store";
import { VoyageView } from "./voyage-view";
import { voyageSealCount } from "./voyage";
import { STORYBOOK_PAGES, STORYBOOK_TITLE, storybookPattern } from "./storybook";

type Poster = { src: string; filename: string; kind: "print" | "work"; patternName: string; colorwayName: string };
type ParentChallenge = { left: number; right: number; operator: "×"; answer: number };
type ParentAction = "share" | "print";
type SavePhase = "hydrating" | "ready" | "read-error" | "deleting" | "delete-error";
type PatternColorway = { id: string; name: string; palette: Pattern["palette"] };
type PatternWithColorways = Pattern & { colorways?: PatternColorway[] };

const BOARD_SIZE = 18;
const ZONE_SIZE = 6;
const ZONE_LABELS = ["左上", "上中", "右上", "左中", "正中", "右中", "左下", "下中", "右下"];
const publicFile = (name: string) => `${import.meta.env.BASE_URL ?? "/"}${name}`;
const HEADER_AVATAR = publicFile("header-avatar-64.png");
const HEADER_AVATAR_2X = publicFile("header-avatar-128.png");
const STAGE_SCENES: { id: StageSceneId; name: string; image: string }[] = [
  { id: "starship-cabin", name: "星空船舱", image: publicFile("stages/starship-cabin.webp") },
  { id: "cloud-post", name: "云端邮局", image: publicFile("stages/cloud-post.webp") },
  { id: "candy-park", name: "糖果游乐园", image: publicFile("stages/candy-park.webp") },
];
const STAGE_EFFECTS: { id: StageEffectId; name: string; note: string }[] = [
  { id: "star-trail", name: "追星光带", note: "金色星光绕着作品闪烁" },
  { id: "bubble-orbit", name: "泡泡环游", note: "透亮泡泡轻轻飘过舞台" },
  { id: "confetti-rain", name: "彩纸烟花", note: "小彩纸从高处落下庆祝" },
];
const DEFAULT_STAGE: StageSelection = { scene: "starship-cabin", effect: "star-trail" };
const FEATURED_PATTERN = PATTERNS[0];
const MYSTERY_PATTERN = PATTERNS.find(pattern => pattern.id === "moon-rabbit") ?? PATTERNS[1] ?? FEATURED_PATTERN;
const IOS_INSTALL_HINT_KEY = "mili-ios-install-hint";

const placedCount = (pattern: Pattern, board?: string[]) => {
  const target = pattern.rows.join("");
  if (!board || board.length !== target.length) return 0;
  return board.reduce((n, value, index) => n + (value !== "." && value === target[index] ? 1 : 0), 0);
};
const isIosSafari = () => {
  const agent = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(agent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios && /Safari/i.test(agent) && !/CriOS|FxiOS|EdgiOS/i.test(agent);
};
const isStandaloneDisplay = () => window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
const iosInstallHintListeners = new Set<() => void>();
const subscribeIosInstallHint = (listener: () => void) => {
  iosInstallHintListeners.add(listener);
  return () => { iosInstallHintListeners.delete(listener); };
};
const notifyIosInstallHint = () => { for (const listener of iosInstallHintListeners) listener(); };
const readIosInstallHint = () => {
  if (Capacitor.isNativePlatform()) return false;
  try {
    return !isStandaloneDisplay() && isIosSafari() && localStorage.getItem(IOS_INSTALL_HINT_KEY) !== "dismissed";
  } catch {
    return false;
  }
};

const keys = (p: Pattern) => Object.keys(p.palette);
const colorwayOptions = (pattern: Pattern): PatternColorway[] => {
  const options = (pattern as PatternWithColorways).colorways;
  return Array.isArray(options) && options.length
    ? options
    : [{ id: "default", name: "经典配色", palette: pattern.palette }];
};
const selectedColorway = (pattern: Pattern, id?: string) => {
  const options = colorwayOptions(pattern);
  return options.find(option => option.id === id) ?? options[0];
};
const resolvedPattern = (pattern: Pattern, id?: string): Pattern => {
  const option = selectedColorway(pattern, id);
  return { ...pattern, palette: { ...pattern.palette, ...option.palette } };
};
const emptyDrawBoard = () => Array(BOARD_SIZE * BOARD_SIZE).fill(".");
const newDrawingId = () => `draw-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const drawingToPattern = (drawing: FreeDrawing): Pattern => {
  const rows: string[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) rows.push(drawing.cells.slice(row * BOARD_SIZE, (row + 1) * BOARD_SIZE).join(""));
  const used = [...new Set(drawing.cells.filter(cell => cell !== "." && FREE_PALETTE[cell]))];
  const palette = Object.fromEntries(used.map(key => [key, FREE_PALETTE[key]]));
  return {
    id: drawing.id,
    name: drawing.name,
    story: "我在自由画板上创作的图案",
    category: "自由画板",
    motion: "float",
    animation: "整体轻轻浮动",
    motionPlan: { body: "整体浮动", prop: "", fx: "" },
    pieceLabel: "自由作品",
    pieceSizes: [drawing.cells.filter(cell => cell !== ".").length],
    skillTip: "",
    estimatedMinutes: [0, 0],
    difficultyAxes: { beads: 0, colorChanges: 0, pieces: 1, articulationPoints: 0, symmetry: 0, repetition: 0 },
    difficultyLabel: "自由创作",
    difficultyWhy: "",
    playIdea: "这是你自己创作的图案",
    assemblyNotes: ["这是自由画板作品，按自己想法拼豆。"],
    childFinishLine: "拼好后请大人帮忙",
    reserveByColor: {},
    palette: Object.keys(palette).length ? palette : { R: FREE_PALETTE.R },
    colorways: [],
    rows,
    layers: rows.map(row => row.replace(/[^.]/g, "B")),
  };
};
const localDay = () => new Date().toLocaleDateString("en-CA");
const dayDifference = (newer: string, older: string) => Math.round((Date.parse(`${newer}T12:00:00`) - Date.parse(`${older}T12:00:00`)) / 86400000);
const randomInt = (maximum: number) => {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) { globalThis.crypto.getRandomValues(values); return values[0] % maximum; }
  return Math.floor(Math.random() * maximum);
};
const makeParentChallenge = (previous?: ParentChallenge): ParentChallenge => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const left = 237 + randomInt(556);
    const right = 24 + randomInt(65);
    const challenge: ParentChallenge = { left, right, operator: "×", answer: left * right };
    if (!previous || challenge.left !== previous.left || challenge.right !== previous.right) return challenge;
  }
  const left = previous!.left === 792 ? 791 : previous!.left + 1;
  return { ...previous!, left, answer: left * previous!.right };
};
const streakFrom = (dates: string[]) => {
  const unique = Array.from(new Set(dates)).sort().reverse();
  if (!unique.length || dayDifference(localDay(), unique[0]) > 1) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length && dayDifference(unique[i - 1], unique[i]) === 1; i += 1) streak += 1;
  return streak;
};

const zoneIndices = (zone: number, boardSize = BOARD_SIZE) => {
  if (boardSize > 18) return Array.from({ length: boardSize * boardSize }, (_, index) => index);
  const startRow = Math.floor(zone / 3) * ZONE_SIZE;
  const startCol = (zone % 3) * ZONE_SIZE;
  return Array.from({ length: ZONE_SIZE * ZONE_SIZE }, (_, index) => {
    const row = startRow + Math.floor(index / ZONE_SIZE);
    const col = startCol + index % ZONE_SIZE;
    return row * boardSize + col;
  });
};

const firstOpenColor = (target: string[], board: string[], paletteKeys: string[]) =>
  paletteKeys.find(color => target.some((cell, index) => cell === color && board[index] !== color)) ?? paletteKeys[0];

const firstOpenZone = (target: string[], board: string[], color: string, from = 0, boardSize = BOARD_SIZE) => {
  if (boardSize > 18) return 0;
  return Array.from({ length: 9 }, (_, offset) => (from + offset) % 9)
    .find(zone => zoneIndices(zone, boardSize).some(index => target[index] === color && board[index] !== color)) ?? 0;
};

function DialogFrame({ className, label, onClose, children, inactive = false }: { className: string; label: string; onClose: () => void; children: ReactNode; inactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const inactiveRef = useRef(inactive);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => { inactiveRef.current = inactive; }, [inactive]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? []);
    if (!inactiveRef.current) focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (inactiveRef.current) return;
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
  return <div className={className} role="dialog" aria-modal={inactive ? undefined : true} aria-hidden={inactive ? true : undefined} inert={inactive ? true : undefined} aria-label={label} ref={ref}>{children}</div>;
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
      return <i key={i} data-symbol={shown !== "." ? shown : undefined} className={`${shown === "." ? "empty" : "filled"} ${ghost ? "ghost" : ""}`} style={{ backgroundColor: color ?? (ghost && selected ? pattern.palette[selected].color : undefined) }} />;
    })}
  </div>;
  if (!animated) return renderGrid();
  return <div className={`layered-art scene-${pattern.motion}`} style={{ "--cols": pattern.rows[0].length } as React.CSSProperties}>
    {renderGrid("B")}{renderGrid("P")}{renderGrid("F")}
  </div>;
}

function MysteryArt({ pattern, revealed }: { pattern: Pattern; revealed: string[] }) {
  const cells = pattern.rows.join("").split("");
  return <div className="art pixels mystery-art" style={{ "--cols": pattern.rows[0].length } as React.CSSProperties} aria-label={`已揭开${revealed.length}种颜色的轮廓`}>
    {cells.map((target, index) => {
      const isOutside = target === ".";
      const isRevealed = revealed.includes(target);
      return <i key={index} className={isOutside ? "empty" : isRevealed ? "filled revealed" : "silhouette"} style={isRevealed ? { backgroundColor: pattern.palette[target].color } : undefined} />;
    })}
  </div>;
}

function StagePreview({ pattern, selection, compact = false }: { pattern: Pattern; selection: StageSelection; compact?: boolean }) {
  const scene = STAGE_SCENES.find(item => item.id === selection.scene) ?? STAGE_SCENES[0];
  const effect = STAGE_EFFECTS.find(item => item.id === selection.effect) ?? STAGE_EFFECTS[0];
  const isAdvanced = isAdvancedPattern(pattern);
  return <div className={`stage-preview${compact ? " compact" : ""}${isAdvanced ? " advanced-stage" : ""}`} data-scene={selection.scene} data-effect={selection.effect} role="img" aria-label={`${pattern.name}在${scene.name}，${effect.name}`}>
    <img className="stage-background" src={scene.image} alt="" />
    <div className={`stage-effect effect-${selection.effect}`} aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
    <div className={`stage-character${isAdvanced ? " stage-character-advanced" : ""}`}><Art pattern={pattern} bead animated /></div>
  </div>;
}

function ZoneThumb({ pattern, board, target, zone, spot }: { pattern: Pattern; board: string[]; target: string[]; zone: number; spot?: { swapped: Set<number>; found: Set<number>; otherPalette: Pattern["palette"] } }) {
  return <span className="zone-thumb" aria-hidden="true">
    {zoneIndices(zone).map(index => {
      const cell = target[index];
      if (cell === ".") return <i key={index} className="empty" />;
      const swapped = Boolean(spot?.swapped.has(index));
      const found = Boolean(spot?.found.has(index));
      const placed = spot ? !swapped || found : cell !== "." && board[index] === cell;
      const color = swapped && !found && spot ? spot.otherPalette[cell]?.color : pattern.palette[cell].color;
      return <i key={index} className={placed ? "placed" : "pending"} style={{ background: color }} />;
    })}
  </span>;
}

function DrawThumb({ cells }: { cells: string[] }) {
  return <div className="art pixels" style={{ "--cols": BOARD_SIZE } as React.CSSProperties}>
    {cells.map((cell, index) => <i key={index} className={cell === "." ? "empty" : "filled"} style={cell !== "." ? { backgroundColor: FREE_PALETTE[cell]?.color } : undefined} />)}
  </div>;
}

function HomeTile({ pattern, colorwayId, onOpen, finished, placed }: { pattern: Pattern; colorwayId?: string; onOpen: () => void; finished: boolean; placed?: number }) {
  const shown = resolvedPattern(pattern, colorwayId);
  const presentation = patternPresentation(pattern);
  const total = targetCount(pattern);
  const inProgress = Boolean(placed) && !finished;
  return <button className={`home-tile${pattern.advanced ? " advanced-tile" : ""}`} onClick={onOpen}>
    <div className="home-tile-art"><Art pattern={shown} />{finished && <span className="complete-mark"><Check aria-hidden="true"/>已完成</span>}{inProgress && <span className="progress-mark">继续拼 {placed}/{total}</span>}</div>
    <b>{pattern.name}</b>
    <small>{inProgress ? `已拼 ${placed} 颗` : pattern.advanced ? `${total} 颗 · ${presentation.difficultyLabel}` : pattern.category === "书桌" ? `${total} 颗 · 拼完能摆` : `${total} 颗 · ${presentation.difficultyLabel}`}</small>
  </button>;
}

const loadCanvasImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image); image.onerror = reject; image.src = src;
});

async function makePoster(pattern: Pattern, kind: "print" | "work", selection: StageSelection = DEFAULT_STAGE, colorwayName = "经典配色", storyText = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const isWork = kind === "work";
  const presentation = patternPresentation(pattern);
  const supplies = materialPlan(pattern);
  ctx.fillStyle = isWork ? "#f8edda" : "#fffdf8"; ctx.fillRect(0, 0, 1200, 1500);
  ctx.fillStyle = "#27233b"; ctx.font = "900 70px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(isWork ? `米粒完成了·${pattern.name}` : pattern.name, 600, 105);
  const scene = STAGE_SCENES.find(item => item.id === selection.scene) ?? STAGE_SCENES[0];
  const effect = STAGE_EFFECTS.find(item => item.id === selection.effect) ?? STAGE_EFFECTS[0];
  ctx.fillStyle = "#8b7180"; ctx.font = "32px sans-serif";
  ctx.fillText(isWork ? `${colorwayName} · ${scene.name} · ${effect.name}` : `${colorwayName} · ${targetCount(pattern)} 颗 · ${presentation.difficultyLabel} · ${formatEstimatedMinutes(presentation.estimatedMinutes)}`, 600, 158);
  const cell = Math.floor((isWork ? 650 : 900) / pattern.rows[0].length); const size = cell * pattern.rows[0].length; const left = (1200 - size) / 2; const top = isWork ? 470 : 235;
  if (isWork) {
    const background = await loadCanvasImage(scene.image);
    ctx.save(); ctx.beginPath(); ctx.roundRect(90, 205, 1020, 1020, 36); ctx.clip();
    ctx.drawImage(background, 90, 205, 1020, 1020);
    const points = [[210,330],[900,300],[1030,520],[180,700],[960,880],[320,1040],[820,1100],[600,350],[430,850],[740,680],[250,940],[990,1070]];
    points.forEach(([x,y], index) => {
      if (selection.effect === "star-trail") {
        ctx.fillStyle = index % 2 ? "#fff5a3" : "#ffd45c"; ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI/4); ctx.fillRect(-8,-8,16,16); ctx.restore();
      } else if (selection.effect === "bubble-orbit") {
        ctx.beginPath(); ctx.arc(x,y,12 + index % 3 * 5,0,Math.PI*2); ctx.fillStyle = "#d9f7ff66"; ctx.fill(); ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 4; ctx.stroke();
      } else {
        ctx.fillStyle = ["#ff6d78","#78d8be","#ffd45c","#a98be8"][index%4]; ctx.save(); ctx.translate(x,y); ctx.rotate(index*.5); ctx.fillRect(-6,-14,12,28); ctx.restore();
      }
    });
    ctx.restore();
  } else {
    ctx.fillStyle = "#e8ddcd"; ctx.beginPath(); ctx.roundRect(left - 18, top - 18, size + 36, size + 36, 30); ctx.fill();
  }
  pattern.rows.forEach((row, y) => [...row].forEach((value, x) => {
    if (isWork && value === ".") return;
    const cx = left + x * cell + cell / 2; const cy = top + y * cell + cell / 2;
    ctx.fillStyle = value === "." ? (isWork ? "transparent" : "#fbf3e8") : pattern.palette[value].color;
    if (isWork && value !== ".") {
      ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4a3d4d70"; ctx.lineWidth = value === "W" ? 4 : 2; ctx.stroke();
    } else {
      ctx.fillRect(left + x * cell + 2, top + y * cell + 2, cell - 4, cell - 4);
      ctx.strokeStyle = value === "W" ? "#786f78" : "#d8cbb9"; ctx.lineWidth = value === "W" ? 3 : 1; ctx.strokeRect(left + x * cell + 2, top + y * cell + 2, cell - 4, cell - 4);
    }
  }));
  const legendTop = isWork ? 1290 : top + size + 70;
  ctx.textAlign = "left"; ctx.fillStyle = "#27233b"; ctx.font = "800 34px sans-serif";
  ctx.fillText(isWork ? "我的拼豆作品" : "颜色清单", 115, legendTop);
  if (!isWork) supplies.forEach((item, index) => {
    const col = index % 2; const row = Math.floor(index / 2); const x = 115 + col * 500; const y = legendTop + 55 + row * 55;
    ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(x + 15, y - 8, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#625b69"; ctx.font = "22px sans-serif";
    ctx.fillText(`${item.name}  实需 ${item.required} + 备用 ${item.reserve} = 建议 ${item.recommended}`, x + 42, y);
  });
  if (isWork) {
    ctx.textAlign = "center"; ctx.fillStyle = "#625b69"; ctx.font = "28px sans-serif";
    const storyLines = (storyText || pattern.story).split("。").filter(Boolean).map(line => `${line}。`).slice(0, 2);
    storyLines.forEach((line, index) => ctx.fillText(line, 600, 1340 + index * 36));
  }
  ctx.textAlign = "center"; ctx.fillStyle = "#a26a66"; ctx.font = "700 26px sans-serif";
  ctx.fillText(isWork ? "米粒拼豆社 · 把小豆子拼成大冒险" : "孩子只负责摆豆；拼好后交给家长。家长按所用品牌说明操作并先试做。", 600, 1450);
  return canvas.toDataURL("image/png");
}

export default function Home() {
  const [initialSave] = useState<GameSave>(() => readLocalSave());
  const isNative = Capacitor.isNativePlatform();
  const [tab, setTab] = useState<"home" | "library" | "game" | "works" | "draw" | "voyage">("home");
  const [voyagePatternId, setVoyagePatternId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(PATTERNS[0].id);
  const [board, setBoard] = useState<string[]>([]);
  const [selected, setSelected] = useState("O");
  const [drawing, setDrawing] = useState(false);
  const [tapMode, setTapMode] = useState(true);
  const [hint, setHint] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [mode, setMode] = useState<PlayMode | null>(null);
  const [replay, setReplay] = useState(false);
  const [spotPuzzle, setSpotPuzzle] = useState<SpotPuzzle | null>(null);
  const [spotFound, setSpotFound] = useState<number[]>([]);
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("全部");
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [zone, setZone] = useState(0);
  const [completed, setCompleted] = useState<string[]>(() => initialSave.completed ?? []);
  const [savedBoards, setSavedBoards] = useState<Record<string, string[]>>(() => initialSave.boards ?? {});
  const [activityDates, setActivityDates] = useState<string[]>(() => initialSave.activityDates ?? []);
  const [stages, setStages] = useState<Record<string, StageSelection>>(() => initialSave.stages ?? {});
  const [colorways, setColorways] = useState<Record<string, string>>(() => initialSave.colorways ?? {});
  const [stories, setStories] = useState<Record<string, StorySelection>>(() => initialSave.stories ?? {});
  const [savedDrawings, setSavedDrawings] = useState<FreeDrawing[]>(() => initialSave.drawings ?? []);
  const [desk, setDesk] = useState<DeskSave>(() => initialSave.desk ?? emptyDesk());
  const [voyages, setVoyages] = useState<Record<string, VoyageRun>>(() => initialSave.voyages ?? {});
  const [deskSlot, setDeskSlot] = useState<number | null>(null);
  const [drawCells, setDrawCells] = useState<string[]>(() => emptyDrawBoard());
  const [drawSelected, setDrawSelected] = useState("R");
  const [drawingName, setDrawingName] = useState("");
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);
  const [dynamicStagePattern, setDynamicStagePattern] = useState<Pattern | null>(null);
  const [stageDrawing, setStageDrawing] = useState<FreeDrawing | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [poster, setPoster] = useState<Poster | null>(null);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [storyPage, setStoryPage] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [parentHold, setParentHold] = useState<ParentAction | null>(null);
  const [parentChallenge, setParentChallenge] = useState<ParentChallenge | null>(null);
  const [parentAction, setParentAction] = useState<ParentAction | null>(null);
  const [parentAnswer, setParentAnswer] = useState("");
  const [parentError, setParentError] = useState("");
  const [installEvent, setInstallEvent] = useState<Event & { prompt?: () => Promise<void> } | null>(null);
  const iosInstallHint = useSyncExternalStore(subscribeIosInstallHint, readIosInstallHint, () => false);
  const [savePhase, setSavePhaseState] = useState<SavePhase>(() => isNative ? "hydrating" : "ready");
  const [saveError, setSaveError] = useState("");
  const gameRef = useRef<HTMLDivElement>(null);
  const parentHoldTimer = useRef<number | null>(null);
  const nativeSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const savePhaseRef = useRef<SavePhase>(isNative ? "hydrating" : "ready");
  const saveGenerationRef = useRef(0);
  const deleteRequestedRef = useRef(false);
  const canonicalSaveRef = useRef<SaveSnapshot>({
    completed: initialSave.completed ?? [],
    boards: initialSave.boards ?? {},
    activityDates: initialSave.activityDates ?? [],
    stages: initialSave.stages ?? {},
    colorways: initialSave.colorways ?? {},
    stories: initialSave.stories ?? {},
    drawings: initialSave.drawings ?? [],
    desk: initialSave.desk ?? emptyDesk(),
    voyages: initialSave.voyages ?? {},
  });
  const boardRef = useRef(board);
  const completedRef = useRef(completed);
  const savedBoardsRef = useRef(savedBoards);
  const activityDatesRef = useRef(activityDates);
  const stagesRef = useRef(stages);
  const colorwaysRef = useRef(colorways);
  const storiesRef = useRef(stories);
  const drawingsRef = useRef(savedDrawings);
  const deskRef = useRef(desk);
  const voyagesRef = useRef(voyages);
  const drawCellsRef = useRef(drawCells);
  const drawSelectedRef = useRef(drawSelected);
  const drawStrokeRef = useRef<"paint" | "erase" | null>(null);
  const replayRef = useRef(false);
  const [originTab, setOriginTab] = useState<"home" | "library" | "works">("home");
  const messageTimer = useRef<number | null>(null);
  const basePattern = findPattern(activeId);
  const pattern = resolvedPattern(basePattern, colorways[basePattern.id]);
  const activeColorway = selectedColorway(basePattern, colorways[basePattern.id]);
  const availableColorways = colorwayOptions(basePattern);
  const patternInfo = patternPresentation(pattern);
  const patternSupplies = materialPlan(pattern);
  const target = pattern.rows.join("").split("");
  const done = board.reduce((n, v, i) => n + (v !== "." && v === target[i] ? 1 : 0), 0);
  const total = targetCount(pattern);
  const progress = Math.round(done / total * 100);
  const currentBoardSize = pattern.rows[0]?.length ?? BOARD_SIZE;
  const isAdvancedPlay = isAdvancedPattern(basePattern);
  const categories = ["全部", ...Array.from(new Set(PATTERNS.map(p => p.category))), ...(ADVANCED_PATTERNS.length ? ["进阶"] : [])];
  const streak = streakFrom(activityDates);
  const animationBasePattern = animationId ? (PATTERNS.find(p => p.id === animationId) ?? ADVANCED_PATTERNS.find(p => p.id === animationId)) : undefined;
  const animationPattern = dynamicStagePattern ?? (animationBasePattern ? resolvedPattern(animationBasePattern, colorways[animationBasePattern.id]) : undefined);
  const animationColorway = animationBasePattern ? selectedColorway(animationBasePattern, colorways[animationBasePattern.id]) : undefined;
  const activeStageSelection = stageDrawing
    ? { scene: stageDrawing.scene, effect: stageDrawing.effect }
    : animationPattern ? (stages[animationPattern.id] ?? DEFAULT_STAGE) : DEFAULT_STAGE;
  const activeStageScene = STAGE_SCENES.find(item => item.id === activeStageSelection.scene) ?? STAGE_SCENES[0];
  const activeStageEffect = STAGE_EFFECTS.find(item => item.id === activeStageSelection.effect) ?? STAGE_EFFECTS[0];
  const activeStorySelection = animationPattern ? (stories[animationPattern.id] ?? defaultStorySelection(animationPattern.id)) : undefined;
  const activeStory = animationPattern ? composeStory(animationPattern.id, activeStorySelection, activeStageSelection.scene, activeStageSelection.effect) : undefined;
  const activeZoneIndices = zoneIndices(zone, currentBoardSize);
  const activeZoneTargets = activeZoneIndices.filter(index => target[index] !== ".");
  const activeZoneDone = activeZoneTargets.filter(index => board[index] === target[index]).length;
  const activeZoneColorTargets = activeZoneIndices.filter(index => target[index] === selected);
  const activeZoneColorDone = activeZoneColorTargets.filter(index => board[index] === target[index]).length;
  const completedColors = keys(pattern).filter(color => target.every((cell, index) => cell !== color || board[index] === color));
  const spotSwapped = new Set(spotPuzzle?.swapped ?? []);
  const spotFoundSet = new Set(spotFound);
  const spotLeft = Math.max(0, (spotPuzzle?.swapped.length ?? 0) - spotFound.length);
  const spotOther = spotPuzzle ? colorwayOptions(basePattern).find(option => option.id === spotPuzzle.otherId) : undefined;
  const displayProgress = mode === "spot" && spotPuzzle ? Math.round(spotFound.length / Math.max(1, spotPuzzle.swapped.length) * 100) : progress;
  const overlayOpen = Boolean(celebrate || poster || animationPattern || showPrivacy || confirmReset || parentChallenge || storyPage !== null);

  const setSavePhase = (phase: SavePhase) => {
    savePhaseRef.current = phase;
    setSavePhaseState(phase);
  };

  const enqueueNative = <T,>(operation: () => Promise<T>): Promise<T> => {
    const result = nativeSaveQueue.current.then(operation, operation);
    nativeSaveQueue.current = result.then(() => undefined, () => undefined);
    return result;
  };

  const commitSnapshot = (snapshot: SaveSnapshot, persistLocal = true) => {
    canonicalSaveRef.current = snapshot;
    completedRef.current = snapshot.completed;
    savedBoardsRef.current = snapshot.boards;
    activityDatesRef.current = snapshot.activityDates;
    stagesRef.current = snapshot.stages;
    colorwaysRef.current = snapshot.colorways;
    storiesRef.current = snapshot.stories;
    drawingsRef.current = snapshot.drawings;
    deskRef.current = snapshot.desk;
    voyagesRef.current = snapshot.voyages;
    setCompleted(snapshot.completed);
    setSavedBoards(snapshot.boards);
    setActivityDates(snapshot.activityDates);
    setStages(snapshot.stages);
    setColorways(snapshot.colorways);
    setStories(snapshot.stories);
    setSavedDrawings(snapshot.drawings);
    setDesk(snapshot.desk);
    setVoyages(snapshot.voyages);
    if (persistLocal) localStorage.setItem(SAVE_KEY, serializeSave(snapshot));
  };

  const clearDeletedSnapshot = () => {
    const empty = emptySaveSnapshot();
    localStorage.removeItem(SAVE_KEY);
    LEGACY_SAVE_KEYS.forEach(key => localStorage.removeItem(key));
    commitSnapshot(empty, false);
    boardRef.current = [];
    setBoard([]);
    drawCellsRef.current = emptyDrawBoard();
    setDrawCells(emptyDrawBoard());
    drawSelectedRef.current = "R";
    setDrawSelected("R");
    setDrawingName("");
    setEditingDrawingId(null);
    setDynamicStagePattern(null);
    setStageDrawing(null);
    setAnimationId(null);
  };

  const completeDeleteTransaction = async (generation: number, writeTombstone: boolean) => {
    const assertCurrent = () => {
      if (generation !== saveGenerationRef.current || savePhaseRef.current !== "deleting") throw new Error("stale delete transaction");
    };
    const empty = emptySaveSnapshot();
    if (isNative) {
      if (writeTombstone) {
        await enqueueNative(() => DurableStore.set({ key: DELETE_PENDING_KEY, value: DELETE_TOMBSTONE }));
        assertCurrent();
      }
      await enqueueNative(() => DurableStore.remove({ key: SAVE_KEY }));
      assertCurrent();
      // Keep a durable empty canonical snapshot before retiring the tombstone.
      // This prevents a not-yet-flushed WebView localStorage copy from reviving deleted work.
      await enqueueNative(() => DurableStore.set({ key: SAVE_KEY, value: serializeSave(empty) }));
      assertCurrent();
      await enqueueNative(() => DurableStore.clearLegacy());
      assertCurrent();
      await enqueueNative(() => DurableStore.set({ key: LEGACY_CLEAN_KEY, value: LEGACY_CLEAN_VALUE }));
      assertCurrent();
    } else {
      localStorage.setItem(DELETE_PENDING_KEY, DELETE_TOMBSTONE);
    }
    clearDeletedSnapshot();
    if (isNative) {
      await enqueueNative(() => DurableStore.remove({ key: DELETE_PENDING_KEY }));
      assertCurrent();
    }
    localStorage.removeItem(DELETE_PENDING_KEY);
    deleteRequestedRef.current = false;
    setSavePhase("ready");
  };

  useEffect(() => {
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as Event & { prompt?: () => Promise<void> }); };
    window.addEventListener("beforeinstallprompt", handleInstall);
    const isNativeShell = location.hostname === "localhost";
    if (!isNativeShell && "serviceWorker" in navigator) navigator.serviceWorker.register(publicFile("sw.js")).catch(() => undefined);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  const hydrateNativeSave = async () => {
    if (!isNative) return;
    const generation = ++saveGenerationRef.current;
    deleteRequestedRef.current = false;
    setSaveError("");
    setSavePhase("hydrating");
    try {
      const { value: deletePending } = await DurableStore.get({ key: DELETE_PENDING_KEY });
      if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
      if (deletePending) {
        deleteRequestedRef.current = true;
        setSavePhase("deleting");
        await completeDeleteTransaction(generation, false);
        return;
      }

      const { value: legacyCleanValue } = await DurableStore.get({ key: LEGACY_CLEAN_KEY });
      const legacyClean = legacyCleanValue === LEGACY_CLEAN_VALUE;
      if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
      if (!legacyClean) {
        const { value: legacyDeletePending } = await DurableStore.getLegacy({ key: DELETE_PENDING_KEY });
        if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
        if (legacyDeletePending) {
          deleteRequestedRef.current = true;
          setSavePhase("deleting");
          await completeDeleteTransaction(generation, true);
          return;
        }
      }

      const { value } = await DurableStore.get({ key: SAVE_KEY });
      if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
      let snapshot: SaveSnapshot | undefined;
      if (value) {
        try { snapshot = normalizeSave(JSON.parse(value)); }
        catch { /* fall through to an intact legacy or local snapshot */ }
      }
      if (!snapshot) {
        if (!legacyClean) {
          for (const legacyKey of [SAVE_KEY, ...LEGACY_SAVE_KEYS]) {
            const { value: legacyValue } = await DurableStore.getLegacy({ key: legacyKey });
            if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
            if (!legacyValue) continue;
            try { snapshot = normalizeSave(JSON.parse(legacyValue)); break; }
            catch { /* try the next intact legacy generation */ }
          }
        }
        snapshot ??= readLocalSave();
        await enqueueNative(() => DurableStore.set({ key: SAVE_KEY, value: serializeSave(snapshot) }));
      }
      if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
      if (!legacyClean) {
        await enqueueNative(() => DurableStore.clearLegacy());
        await enqueueNative(() => DurableStore.set({ key: LEGACY_CLEAN_KEY, value: LEGACY_CLEAN_VALUE }));
        if (generation !== saveGenerationRef.current || savePhaseRef.current !== "hydrating") return;
      }
      commitSnapshot(snapshot);
      setSavePhase("ready");
    } catch {
      if (generation !== saveGenerationRef.current) return;
      if (deleteRequestedRef.current) {
        setSaveError("清除尚未完成，旧记录不会显示，请点击重试。");
        setSavePhase("delete-error");
      } else {
        setSaveError("进度恢复失败，未写入任何新数据。");
        setSavePhase("read-error");
      }
    }
  };

  useEffect(() => {
    if (!isNative) {
      commitSnapshot(canonicalSaveRef.current);
      return;
    }
    void hydrateNativeSave();
    // The mount-only hydration owns its own generation guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!celebrate) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 400 : isAdvancedPlay ? 2800 : 1800;
    const timer = window.setTimeout(() => {
      setCelebrate(false);
      setStageDrawing(null);
      setDynamicStagePattern(null);
      setAnimationId(pattern.id);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [celebrate, pattern.id, isAdvancedPlay]);

  useEffect(() => () => {
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
  }, []);

  const persistSaveNow = async (nextCompleted: string[], nextBoards: Record<string, string[]>, nextActivityDates: string[], nextStages = stagesRef.current, nextColorways = colorwaysRef.current, nextStories = storiesRef.current, nextDrawings = drawingsRef.current, nextDesk = deskRef.current, nextVoyages = voyagesRef.current) => {
    if (savePhaseRef.current !== "ready") throw new Error("save store is not writable");
    const generation = saveGenerationRef.current;
    const snapshot: SaveSnapshot = { completed: nextCompleted, boards: nextBoards, activityDates: nextActivityDates, stages: nextStages, colorways: nextColorways, stories: nextStories, drawings: nextDrawings, desk: nextDesk, voyages: nextVoyages };
    if (isNative) await enqueueNative(() => DurableStore.set({ key: SAVE_KEY, value: serializeSave(snapshot) }));
    if (generation !== saveGenerationRef.current || savePhaseRef.current !== "ready") throw new Error("stale save write");
    commitSnapshot(snapshot);
  };

  const seatedStoryDesk = (nextCompleted: string[], base = deskRef.current) =>
    seatCompletedWorks(base, storyPatternIds().filter(id => nextCompleted.includes(id)));

  const persistVoyage = async (run: VoyageRun) => {
    const nextVoyages = { ...voyagesRef.current, [run.patternId]: run };
    voyagesRef.current = nextVoyages;
    setVoyages(nextVoyages);
    let nextActivityDates = activityDatesRef.current;
    if (run.complete) {
      const today = localDay();
      if (!nextActivityDates.includes(today)) nextActivityDates = [...nextActivityDates, today];
    }
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, nextActivityDates, stagesRef.current, colorwaysRef.current, storiesRef.current, drawingsRef.current, deskRef.current, nextVoyages);
    } catch {
      say("夜航没有保存，请再走一步");
    }
  };

  const openVoyage = (id?: string) => {
    if (savePhaseRef.current !== "ready") return;
    if (tab === "home" || tab === "library" || tab === "works" || tab === "game") setOriginTab(tab === "game" ? originTab : tab);
    setVoyagePatternId(id ?? null);
    setTab("voyage");
    window.scrollTo(0, 0);
  };

  const persistDeskNow = async (nextDesk: DeskSave) => {
    if (desksEqual(nextDesk, deskRef.current)) return true;
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, activityDatesRef.current, stagesRef.current, colorwaysRef.current, storiesRef.current, drawingsRef.current, nextDesk);
      return true;
    } catch {
      say("书桌没有保存，请再试一次");
      return false;
    }
  };

  const ensureDeskSeats = async () => {
    const nextDesk = seatedStoryDesk(completedRef.current);
    if (desksEqual(nextDesk, deskRef.current)) return;
    await persistDeskNow(nextDesk);
  };

  const openStorybook = () => {
    const quest = storyQuestState(completedRef.current);
    if (quest.allDone) {
      setTab("works");
      void ensureDeskSeats();
      return;
    }
    setStoryPage(quest.currentIndex);
  };

  const openWorks = () => {
    setTab("works");
    void ensureDeskSeats();
  };

  const say = (text: string, ms = 2400) => {
    setMessage(text);
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => { setMessage(""); messageTimer.current = null; }, ms);
  };

  const openGame = (id: string, nextMode?: PlayMode) => {
    if (savePhaseRef.current !== "ready") return;
    if (tab === "home" || tab === "library" || tab === "works") setOriginTab(tab);
    const next = findPattern(id);
    const nextTarget = next.rows.join("").split("");
    const saved = savedBoards[id];
    const safeBoard = saved?.length === nextTarget.length ? saved.map((value, index) => value === nextTarget[index] ? value : ".") : Array(nextTarget.length).fill(".");
    const startColor = firstOpenColor(nextTarget, safeBoard, keys(next));
    const boardSize = next.rows[0]?.length ?? BOARD_SIZE;
    const isAdvanced = isAdvancedPattern(next);
    if (isAdvanced && !nextMode) nextMode = "mobile";
    boardRef.current = safeBoard;
    setActiveId(id); setBoard(safeBoard); setSelected(startColor);
    setMistakes(0); setHint(nextMode !== "mystery"); setMode(nextMode ?? null); setUndoStack([]);
    setReplay(false); replayRef.current = false; setSpotPuzzle(null); setSpotFound([]);
    if (isAdvanced) setTapMode(true);
    setZone(firstOpenZone(nextTarget, safeBoard, startColor, 0, boardSize)); setCelebrate(false); setTab("game"); window.scrollTo(0, 0);
    if (nextMode) say(companionLine(id, nextMode, "start"));
  };

  const enterPlayMode = (nextMode: PlayMode) => {
    const startColor = firstOpenColor(target, boardRef.current, keys(pattern));
    setSelected(startColor);
    setZone(firstOpenZone(target, boardRef.current, startColor, 0, currentBoardSize));
    setHint(nextMode !== "mystery");
    setUndoStack([]);
    setMode(nextMode);
    say(companionLine(pattern.id, nextMode, "start"));
  };

  const leaveReplay = () => {
    setReplay(false);
    replayRef.current = false;
    setSpotPuzzle(null);
    setSpotFound([]);
    setMode(null);
    setStageDrawing(null);
    setDynamicStagePattern(null);
    setAnimationId(pattern.id);
    setTab("works");
  };

  const openReplay = (id: string, nextMode: "mystery" | "spot") => {
    if (savePhaseRef.current !== "ready") return;
    const next = findPattern(id);
    const nextTarget = next.rows.join("").split("");
    const home = selectedColorway(next, colorwaysRef.current[id]);
    replayRef.current = true;
    setReplay(true);
    setActiveId(id);
    setMistakes(0);
    setUndoStack([]);
    setCelebrate(false);
    setAnimationId(null);
    setDynamicStagePattern(null);
    setStageDrawing(null);
    if (nextMode === "spot") {
      const puzzle = buildSpotPuzzle(next, home.id);
      if (!puzzle) { replayRef.current = false; setReplay(false); say("这幅图没有配色找不同模式"); return; }
      setSpotPuzzle(puzzle);
      setSpotFound([]);
      setHint(false);
      setMode("spot");
      setZone(spotZoneOf(puzzle.swapped[0] ?? 0));
      setTab("game");
      window.scrollTo(0, 0);
      say(companionLine(id, "spot", "start"));
      return;
    }
    const empty = Array(nextTarget.length).fill(".");
    boardRef.current = empty;
    setBoard(empty);
    setSpotPuzzle(null);
    setSpotFound([]);
    const startColor = firstOpenColor(nextTarget, empty, keys(next));
    setSelected(startColor);
    setZone(firstOpenZone(nextTarget, empty, startColor, 0, next.rows[0]?.length ?? BOARD_SIZE));
    setHint(false);
    setMode("mystery");
    setTab("game");
    window.scrollTo(0, 0);
    say(companionLine(id, "mystery", "start"));
  };

  const openStageFromFinish = () => {
    setCelebrate(false);
    if (replayRef.current) {
      replayRef.current = false;
      setReplay(false);
      setSpotPuzzle(null);
      setSpotFound([]);
      setMode(null);
      setTab("works");
    }
    setStageDrawing(null);
    setDynamicStagePattern(null);
    setAnimationId(pattern.id);
  };

  const deleteAllSaveData = async () => {
    if (savePhaseRef.current !== "ready") return;
    if (!window.confirm("确定清除本机全部拼豆进度和作品吗？")) return;
    const generation = ++saveGenerationRef.current;
    deleteRequestedRef.current = true;
    setShowPrivacy(false);
    setTab("home");
    setSaveError("");
    setSavePhase("deleting");
    try {
      await completeDeleteTransaction(generation, true);
    } catch {
      if (generation !== saveGenerationRef.current) return;
      setSaveError("清除尚未完成，旧记录不会显示，请点击重试。");
      setSavePhase("delete-error");
    }
  };

  const retrySaveOperation = async () => {
    await hydrateNativeSave();
  };

  const saveBoardChange = async (next: string[], failure: string) => {
    const nextBoards = { ...savedBoardsRef.current, [pattern.id]: next };
    let nextCompleted = completedRef.current;
    let nextActivityDates = activityDatesRef.current;
    let nextStories = storiesRef.current;
    const nextDone = next.filter((value, cellIndex) => value !== "." && value === target[cellIndex]).length;
    if (replayRef.current) {
      setBoard(next);
      if (nextDone === total) { setCelebrate(true); navigator.vibrate?.([40,40,80]); }
      return true;
    }
    let nextDesk = deskRef.current;
    if (nextDone === total) {
      nextCompleted = nextCompleted.includes(pattern.id) ? nextCompleted : [...nextCompleted, pattern.id];
      const today = localDay();
      nextActivityDates = nextActivityDates.includes(today) ? nextActivityDates : [...nextActivityDates, today];
      if (!nextStories[pattern.id] && storyWhoOptions(pattern.id).length) nextStories = { ...nextStories, [pattern.id]: defaultStorySelection(pattern.id) };
      if (isStoryPattern(pattern.id)) nextDesk = seatedStoryDesk(nextCompleted);
    }
    try {
      await persistSaveNow(nextCompleted, nextBoards, nextActivityDates, stagesRef.current, colorwaysRef.current, nextStories, drawingsRef.current, nextDesk);
    } catch {
      boardRef.current = canonicalSaveRef.current.boards[pattern.id] ?? board;
      say(failure, 1600);
      return false;
    }
    setBoard(next); setSavedBoards(nextBoards); setCompleted(nextCompleted); setActivityDates(nextActivityDates); setStories(nextStories); setDesk(nextDesk);
    if (nextDone === total) { setCelebrate(true); navigator.vibrate?.([40,40,80]); }
    return true;
  };

  const guideAfterPlacement = (previous: string[], next: string[], color: string) => {
    const nextDone = next.filter((value, cellIndex) => value !== "." && value === target[cellIndex]).length;
    if (nextDone === total) return;
    const colorDone = target.every((cell, index) => cell !== color || next[index] === color);
    const colorWasDone = target.every((cell, index) => cell !== color || previous[index] === color);
    const zoneComplete = Boolean(activeZoneTargets.length && activeZoneTargets.every(zoneIndex => next[zoneIndex] === target[zoneIndex]));
    if (colorDone && !colorWasDone) {
      const nextColor = firstOpenColor(target, next, keys(pattern));
      setSelected(nextColor);
      if (mode === "assistant") setZone(firstOpenZone(target, next, nextColor, 0, currentBoardSize));
      else if (zoneComplete && !isAdvancedPlay) {
        const nextZone = Array.from({ length: 9 }, (_, offset) => (zone + offset + 1) % 9).find(candidate => zoneIndices(candidate, currentBoardSize).some(zoneIndex => target[zoneIndex] !== "." && next[zoneIndex] !== target[zoneIndex]));
        if (nextZone !== undefined) setZone(nextZone);
      }
      say(mode === "mystery"
        ? companionLine(pattern.id, mode, "mysteryReveal", { color: pattern.palette[color].name, nextColor: pattern.palette[nextColor].name })
        : companionLine(pattern.id, mode ?? "mobile", "colorDone", { color: pattern.palette[color].name, nextColor: pattern.palette[nextColor].name }));
      return;
    }
    if (mode === "assistant") {
      const nextZone = firstOpenZone(target, next, color, (zone + 1) % 9, currentBoardSize);
      setZone(nextZone);
      say(companionLine(pattern.id, "assistant", "zoneNext", { zone: ZONE_LABELS[nextZone], color: pattern.palette[color].name }));
      return;
    }
    if (zoneComplete && !isAdvancedPlay) {
      const nextZone = Array.from({ length: 9 }, (_, offset) => (zone + offset + 1) % 9).find(candidate => zoneIndices(candidate, currentBoardSize).some(zoneIndex => target[zoneIndex] !== "." && next[zoneIndex] !== target[zoneIndex]));
      if (nextZone !== undefined) { setZone(nextZone); say(companionLine(pattern.id, mode ?? "mobile", "zoneDone", { zone: ZONE_LABELS[nextZone] })); }
    }
  };

  const erase = async (index: number) => {
    if (savePhaseRef.current !== "ready" || target[index] === ".") return;
    const previous = boardRef.current;
    if (previous[index] !== target[index]) return;
    if (mode !== "mobile" || previous[index] !== selected) return;
    const next = [...previous];
    next[index] = ".";
    boardRef.current = next;
    if (!await saveBoardChange(next, "这颗豆子没有擦掉，请再点一次")) return;
    setUndoStack(stack => [...stack.slice(-19), previous]);
    say(companionLine(pattern.id, "mobile", "erase"), 1600);
  };

  const paint = async (index: number) => {
    if (savePhaseRef.current !== "ready" || target[index] === ".") return;
    const previous = boardRef.current;
    if (previous[index] === target[index]) return;
    if (selected !== target[index]) {
      setMistakes(m => m + 1);
      navigator.vibrate?.(30);
      say(companionLine(pattern.id, mode ?? "mobile", "mistake", { needed: pattern.palette[target[index]].name }), 1600);
      return;
    }
    const next = [...previous];
    next[index] = selected;
    boardRef.current = next;
    if (!await saveBoardChange(next, "这颗豆子没有保存，请再点一次")) return;
    setUndoStack(stack => [...stack.slice(-19), previous]);
    guideAfterPlacement(previous, next, selected);
  };

  const paintDrawCell = (index: number, stroke?: "paint" | "erase") => {
    const color = drawSelectedRef.current;
    const next = [...drawCellsRef.current];
    const action = stroke ?? (next[index] === color ? "erase" : "paint");
    next[index] = action === "erase" ? "." : color;
    drawCellsRef.current = next;
    setDrawCells(next);
    return action;
  };

  const openBlankDrawing = () => {
    const blank = emptyDrawBoard();
    drawCellsRef.current = blank;
    drawStrokeRef.current = null;
    setEditingDrawingId(null);
    setDrawCells(blank);
    setDrawSelected("R");
    drawSelectedRef.current = "R";
    setDrawingName("");
    setTab("draw");
  };

  const loadDrawing = (id: string) => {
    const drawing = drawingsRef.current.find(item => item.id === id);
    if (!drawing) return;
    const cells = [...drawing.cells];
    drawCellsRef.current = cells;
    drawStrokeRef.current = null;
    setEditingDrawingId(drawing.id);
    setDrawCells(cells);
    setDrawSelected("R");
    drawSelectedRef.current = "R";
    setDrawingName(drawing.name);
    setTab("draw");
  };

  const saveDrawing = async () => {
    const cells = drawCellsRef.current;
    if (!cells.some(cell => cell !== ".")) { say("画板上还没有图案", 1600); return; }
    let name = drawingName.trim();
    if (!name) name = `我的作品 ${drawingsRef.current.length + 1}`;
    if (name.length > 20) name = name.slice(0, 20);
    const now = new Date().toISOString();
    const previous = drawingsRef.current;
    let nextDrawings: FreeDrawing[];
    let savedId = editingDrawingId;
    if (editingDrawingId && previous.some(item => item.id === editingDrawingId)) {
      nextDrawings = previous.map(item => item.id === editingDrawingId ? { ...item, cells: [...cells], name, updatedAt: now } : item);
    } else {
      savedId = newDrawingId();
      const newDrawing: FreeDrawing = { id: savedId, name, cells: [...cells], scene: "starship-cabin", effect: "star-trail", updatedAt: now };
      nextDrawings = [...previous, newDrawing].slice(-FREE_DRAWING_LIMIT);
    }
    drawingsRef.current = nextDrawings;
    setSavedDrawings(nextDrawings);
    setDrawingName(name);
    setEditingDrawingId(savedId);
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, activityDatesRef.current, stagesRef.current, colorwaysRef.current, storiesRef.current, nextDrawings, sanitizeDesk(deskRef.current, { completed: completedRef.current, drawingIds: new Set(nextDrawings.map(item => item.id)) }));
      say("作品已保存", 1000);
    } catch {
      drawingsRef.current = previous;
      setSavedDrawings(previous);
      say("保存失败，请再试一次");
    }
  };

  const saveDrawingStage = async (nextDrawing: FreeDrawing) => {
    const previous = drawingsRef.current;
    const nextDrawings = previous.map(item => item.id === nextDrawing.id ? nextDrawing : item);
    drawingsRef.current = nextDrawings;
    setSavedDrawings(nextDrawings);
    setStageDrawing(nextDrawing);
    setDynamicStagePattern(drawingToPattern(nextDrawing));
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, activityDatesRef.current, stagesRef.current, colorwaysRef.current, storiesRef.current, nextDrawings);
    } catch {
      drawingsRef.current = previous;
      setSavedDrawings(previous);
      setStageDrawing(previous.find(item => item.id === nextDrawing.id) ?? null);
      say("小舞台没有保存，请再试一次");
    }
  };

  const closeStage = () => {
    setAnimationId(null);
    setDynamicStagePattern(null);
    setStageDrawing(null);
  };

  const openPatternStage = (id: string) => {
    setStageDrawing(null);
    setDynamicStagePattern(null);
    setAnimationId(id);
  };

  const showDrawingOnStage = (drawing: FreeDrawing) => {
    setStageDrawing(drawing);
    setDynamicStagePattern(drawingToPattern(drawing));
    setAnimationId(drawing.id);
  };

  const paintSpot = (index: number) => {
    if (!spotPuzzle || target[index] === ".") return;
    if (spotFoundSet.has(index)) return;
    if (spotSwapped.has(index)) {
      const next = [...spotFound, index];
      setSpotFound(next);
      const left = spotPuzzle.swapped.length - next.length;
      if (left <= 0) {
        say(companionLine(pattern.id, "spot", "spotDone"));
        setCelebrate(true);
        navigator.vibrate?.([40,40,80]);
      } else {
        say(companionLine(pattern.id, "spot", "spotHit", { count: String(left) }));
      }
      return;
    }
    setMistakes(m => m + 1);
    navigator.vibrate?.(30);
    say(companionLine(pattern.id, "spot", "spotMiss"), 1600);
  };

  const toggleZoneColor = async () => {
    if (!activeZoneColorTargets.length || savePhaseRef.current !== "ready") return;
    const shouldPlace = activeZoneColorTargets.some(index => boardRef.current[index] !== selected);
    const previous = boardRef.current;
    const next = [...previous];
    activeZoneColorTargets.forEach(index => { next[index] = shouldPlace ? selected : "."; });
    boardRef.current = next;
    if (await saveBoardChange(next, "这一组没有保存，请再试一次")) {
      setUndoStack(stack => [...stack.slice(-19), previous]);
      if (shouldPlace) guideAfterPlacement(previous, next, selected);
      else {
        say(companionLine(pattern.id, "assistant", "groupCancel", { color: pattern.palette[selected].name }));
      }
    }
  };

  const undoLast = async () => {
    const previous = undoStack.at(-1);
    if (!previous || savePhaseRef.current !== "ready") return;
    const current = boardRef.current;
    boardRef.current = previous;
    if (await saveBoardChange(previous, "撤销没有保存，请再试一次")) setUndoStack(stack => stack.slice(0, -1));
    else boardRef.current = current;
  };

  const currentColorDone = board.filter((v,i) => v === selected && v === target[i]).length;
  const currentColorTotal = target.filter(v => v === selected).length;
  const saveStage = async (patternId: string, selection: StageSelection) => {
    const previousStages = stagesRef.current;
    const nextStages = { ...stagesRef.current, [patternId]: selection };
    stagesRef.current = nextStages;
    setStages(nextStages);
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, activityDatesRef.current, nextStages);
    } catch {
      stagesRef.current = previousStages; setStages(previousStages);
      say("小舞台没有保存，请再试一次");
    }
  };
  const chooseStageScene = (scene: StageSceneId) => {
    if (stageDrawing) {
      void saveDrawingStage({ ...stageDrawing, scene, updatedAt: new Date().toISOString() });
      return;
    }
    if (animationPattern) void saveStage(animationPattern.id, { ...activeStageSelection, scene });
  };
  const chooseStageEffect = (effect: StageEffectId) => {
    if (stageDrawing) {
      void saveDrawingStage({ ...stageDrawing, effect, updatedAt: new Date().toISOString() });
      return;
    }
    if (animationPattern) void saveStage(animationPattern.id, { ...activeStageSelection, effect });
  };
  const saveStory = async (patternId: string, selection: StorySelection) => {
    if (savePhaseRef.current !== "ready" || !storyWhoOptions(patternId).some(option => option.id === selection.who) || !storyDoingOptions(patternId).some(option => option.id === selection.doing)) return;
    const previousStories = storiesRef.current;
    const nextStories = { ...previousStories, [patternId]: selection };
    storiesRef.current = nextStories;
    setStories(nextStories);
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, activityDatesRef.current, stagesRef.current, colorwaysRef.current, nextStories);
    } catch {
      storiesRef.current = previousStories; setStories(previousStories);
      say("故事没有保存，请再试一次");
    }
  };
  const chooseStoryWho = (who: string) => {
    if (!animationPattern) return;
    void saveStory(animationPattern.id, { who, doing: (stories[animationPattern.id] ?? defaultStorySelection(animationPattern.id)).doing });
  };
  const chooseStoryDoing = (doing: string) => {
    if (!animationPattern) return;
    void saveStory(animationPattern.id, { who: (stories[animationPattern.id] ?? defaultStorySelection(animationPattern.id)).who, doing });
  };
  const chooseColorway = async (colorwayId: string) => {
    if (savePhaseRef.current !== "ready" || !colorwayOptions(basePattern).some(option => option.id === colorwayId)) return;
    const previousColorways = colorwaysRef.current;
    const nextColorways = { ...previousColorways, [basePattern.id]: colorwayId };
    colorwaysRef.current = nextColorways;
    setColorways(nextColorways);
    try {
      await persistSaveNow(completedRef.current, savedBoardsRef.current, activityDatesRef.current, stagesRef.current, nextColorways);
      const nextPattern = resolvedPattern(basePattern, colorwayId);
      if (!nextPattern.palette[selected]) setSelected(keys(nextPattern)[0]);
      say(`已换成${selectedColorway(basePattern, colorwayId).name}`, 1000);
    } catch {
      colorwaysRef.current = previousColorways;
      setColorways(previousColorways);
      say("配色没有保存，请再试一次");
    }
  };
  const showPoster = async (kind: "print" | "work", posterPattern = pattern) => {
    const selection = stagesRef.current[posterPattern.id] ?? DEFAULT_STAGE;
    const original = findPattern(posterPattern.id);
    const colorway = selectedColorway(original, colorwaysRef.current[posterPattern.id]);
    const printablePattern = resolvedPattern(original, colorway.id);
    const src = await makePoster(printablePattern, kind, selection, colorway.name, composeStory(printablePattern.id, storiesRef.current[posterPattern.id], selection.scene, selection.effect).text);
    if (src) { setShareStatus(""); setPoster({ src, kind, patternName: printablePattern.name, colorwayName: colorway.name, filename: `米粒拼豆-${printablePattern.name}-${colorway.name}-${kind === "print" ? "高清图纸" : "作品卡"}.png` }); }
  };
  const downloadPoster = () => {
    if (!poster) return;
    const link = document.createElement("a"); link.href = poster.src; link.download = poster.filename; link.click();
  };
  const performPosterShare = async () => {
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
  const clearParentHold = () => {
    if (parentHoldTimer.current !== null) window.clearTimeout(parentHoldTimer.current);
    parentHoldTimer.current = null; setParentHold(null);
  };
  const startParentHold = (action: ParentAction) => {
    clearParentHold(); setParentHold(action); setParentError("");
    parentHoldTimer.current = window.setTimeout(() => {
      setParentHold(null); parentHoldTimer.current = null;
      setParentAnswer(""); setParentAction(action); setParentChallenge(makeParentChallenge());
    }, 1400);
  };
  const verifyParent = async () => {
    if (!parentChallenge) return;
    if (Number(parentAnswer) !== parentChallenge.answer) {
      setParentAnswer(""); setParentError("答案不对，请家长再算一题。"); setParentChallenge(makeParentChallenge(parentChallenge)); return;
    }
    const action = parentAction;
    setParentChallenge(null); setParentAction(null); setParentAnswer(""); setParentError("");
    if (action === "print") printPoster();
    else if (action === "share") await performPosterShare();
  };
  const printPoster = () => {
    if (!poster) return;
    const page = window.open("", "_blank"); if (!page) return;
    const image = page.document.createElement("img"); image.src = poster.src; image.style.width = "100%";
    page.document.body.style.margin = "0"; page.document.body.appendChild(image); image.onload = () => page.print();
  };
  const handlePlayPointerDown = (index: number) => {
    if (mode === "spot") { paintSpot(index); return; }
    if (mode === "assistant") {
      if (target[index] !== selected) setSelected(target[index]);
      else void toggleZoneColor();
      return;
    }
    if (mode === "mobile") {
      if (boardRef.current[index] === target[index]) {
        void erase(index);
        return;
      }
      if (!tapMode) setDrawing(true);
      void paint(index);
      return;
    }
    setDrawing(true);
    void paint(index);
  };
  const featuredPlaced = placedCount(FEATURED_PATTERN, savedBoards[FEATURED_PATTERN.id]);
  const featuredTotal = targetCount(FEATURED_PATTERN);
  const featuredContinue = featuredPlaced > 0 && !completed.includes(FEATURED_PATTERN.id);
  const dismissIosInstallHint = () => {
    localStorage.setItem(IOS_INSTALL_HINT_KEY, "dismissed");
    notifyIosInstallHint();
  };
  const bookPage = storyPage === null ? null : STORYBOOK_PAGES[storyPage];
  const bookCast = bookPage ? storybookPattern(bookPage.patternId) : null;
  const bookArt = bookCast ? resolvedPattern(bookCast, colorways[bookCast.id]) : null;
  const quest = storyQuestState(completed);
  const nextStoryIndex = (storyPage ?? 0) + 1;
  const nextStoryUnlocked = nextStoryIndex < STORYBOOK_PAGES.length && isStoryPageUnlocked(nextStoryIndex, completed);
  const nextStoryName = nextStoryIndex < STORYBOOK_PAGES.length ? storybookPattern(STORYBOOK_PAGES[nextStoryIndex].patternId).name : "";
  const finishQuest = storyQuestState(completed);
  const storyJustFinished = isStoryPattern(pattern.id) && completed.includes(pattern.id);

  return <main>
    <div className="app app-shell" inert={overlayOpen ? true : undefined} aria-hidden={overlayOpen ? true : undefined}>
      {tab !== "game" && tab !== "draw" && tab !== "voyage" && <header className="app-header"><button className="logo" disabled={savePhase !== "ready"} onClick={()=>{ setAdvancedFilter(false); setTab("home"); }}><span><img src={HEADER_AVATAR} srcSet={`${HEADER_AVATAR_2X} 2x`} width="38" height="38" alt="" /></span><div><b>米粒拼豆社</b><small>把小豆子拼成大冒险</small></div></button><button className="round" disabled={savePhase !== "ready"} onClick={openWorks} aria-label="打开作品册"><Star aria-hidden="true"/></button></header>}

      {savePhase !== "ready" && tab !== "game" && <section className="save-gate" role="status" aria-live="polite"><div><span><img src={HEADER_AVATAR} width="48" height="48" alt="" /></span><h1>{savePhase === "hydrating" || savePhase === "deleting" ? "正在保护米粒的作品" : "进度暂时没有恢复"}</h1><p>{savePhase === "hydrating" ? "正在从本机存档恢复，请稍等。" : savePhase === "deleting" ? "正在清除本机记录，完成前不会显示旧作品。" : saveError}</p>{(savePhase === "read-error" || savePhase === "delete-error") && <button onClick={()=>void retrySaveOperation()}>{savePhase === "delete-error" ? "重试清除" : "重试恢复"}</button>}</div></section>}

      {savePhase === "ready" && tab === "home" && <>
        <button className="home-story" onClick={openStorybook}>
          <span className="home-story-art" aria-hidden="true">{quest.allDone || completed.includes(quest.currentPatternId) ? <Art pattern={resolvedPattern(storybookPattern(quest.currentPatternId), colorways[quest.currentPatternId])} animated/> : <MysteryArt pattern={resolvedPattern(storybookPattern(quest.currentPatternId), colorways[quest.currentPatternId])} revealed={[]}/>}</span>
          <span><small>{quest.homeKicker}</small><b>{quest.homeTitle}</b><i>{quest.homeLine}</i></span>
          <em>{quest.homeCta}</em>
        </button>
        <button className="home-draw" onClick={openBlankDrawing}>
          <span className="home-draw-art" aria-hidden="true"><Palette aria-hidden="true"/></span>
          <span><small>自由画板</small><b>画一个自己的图案</b><i>选颜色涂格子，拼出你的想法</i></span>
          <em>开始画</em>
        </button>
        <button className="home-voyage" onClick={() => openVoyage()}>
          <span className="home-voyage-art" aria-hidden="true"><Compass aria-hidden="true"/></span>
          <span><small>夜航探图</small><b>走进图里送信</b><i>点旁边的豆子，一格一格走到信那里</i></span>
          <em>{voyageSealCount(voyages) ? `已走完 ${voyageSealCount(voyages)}` : "去送信"}</em>
        </button>
        <section className="home-featured">
          <button type="button" className="home-featured-art" onClick={()=>openGame(FEATURED_PATTERN.id)} aria-label={`打开${FEATURED_PATTERN.name}`}>
            <Art pattern={resolvedPattern(FEATURED_PATTERN,colorways[FEATURED_PATTERN.id])} animated/>
            {completed.includes(FEATURED_PATTERN.id) && <span className="complete-mark"><Check aria-hidden="true"/>已完成</span>}
          </button>
          <div className="home-featured-copy">
            <span>本周精选</span>
            <h1>{FEATURED_PATTERN.name}</h1>
            <p>{featuredContinue ? `已拼 ${featuredPlaced}/${featuredTotal} 颗，接着放就好` : `${featuredTotal} 颗 · ${patternPresentation(FEATURED_PATTERN).difficultyLabel}`}</p>
            <button type="button" onClick={()=>openGame(FEATURED_PATTERN.id)}>{featuredContinue ? `继续拼 ${featuredPlaced}/${featuredTotal}` : <>选玩法开拼 <ArrowRight aria-hidden="true"/></>}</button>
          </div>
        </section>
        <section className="home-catalog">
          <h2>再选一张</h2>
          <p className="home-catalog-hint">爱心相框、小猫立牌、甜筒和奶茶，拼完能立在书桌上</p>
          <div className="home-grid">{PATTERNS.map(p=><HomeTile key={p.id} pattern={p} colorwayId={colorways[p.id]} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} placed={placedCount(p, savedBoards[p.id])} />)}</div>
        </section>
        {ADVANCED_PATTERNS.length > 0 && (
          <section className="home-catalog home-advanced-block">
            <h2>进阶挑战 · {ADVANCED_PATTERNS.length} 张大图纸</h2>
            <p className="home-catalog-hint">飞龙、火箭、虎鲨都在这里。29×29，慢慢拼</p>
            <div className="home-grid">{ADVANCED_PATTERNS.map(p=><HomeTile key={p.id} pattern={p} colorwayId={colorways[p.id]} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} placed={placedCount(p, savedBoards[p.id])} />)}</div>
          </section>
        )}
        <section className="quick-status"><div><span>{streak ? <Flame aria-hidden="true"/> : <Sparkles aria-hidden="true"/>}</span><p><b>{streak ? `连续创作 ${streak} 天` : "今天来点亮第一颗星"}</b><small>{completed.length ? `已收藏 ${completed.length} 个作品` : "完成一张图纸，记录会留在手机里"}</small></p></div><em aria-label={`全库进度${completed.length}/${PATTERNS.length}`}>全库 {completed.length}/{PATTERNS.length}</em></section>
        <button className="home-mystery" onClick={()=>openGame(MYSTERY_PATTERN.id,"mystery")}>
          <span aria-hidden="true"><MysteryArt pattern={resolvedPattern(MYSTERY_PATTERN, colorways[MYSTERY_PATTERN.id])} revealed={[]}/></span>
          <span><small>轮廓猜猜</small><b>先看剪影再揭晓</b></span>
          <em>开始猜图</em>
        </button>
        {installEvent && <button className="install-banner" onClick={()=>installEvent.prompt?.()}><span><Plus aria-hidden="true"/></span><p><b>放到手机桌面</b><small>像普通游戏一样，点一下就能玩</small></p><i>安装</i></button>}
        {iosInstallHint && !installEvent && <button className="install-banner" onClick={dismissIosInstallHint}><span><Plus aria-hidden="true"/></span><p><b>想放到桌面</b><small>点底部分享，再选「添加到主屏幕」</small></p><i>知道了</i></button>}
        <button className="parent-link" onClick={()=>setShowPrivacy(true)}>家长与隐私说明</button>
      </>}

      {savePhase === "ready" && tab === "library" && <section className="library">
        <div className="page-head">
          <small>{advancedFilter ? "进阶挑战" : "图纸宝库"}</small>
          <h1>{advancedFilter ? "选一张大图纸" : "今天拼哪个？"}</h1>
          {advancedFilter && <p>29×29 大网格 · 慢慢拼，完成就是大作品</p>}
        </div>
        <div className="filters">{categories.map(c=><button key={c} className={(c==="进阶" ? advancedFilter : !advancedFilter && filter===c)?"active":""} onClick={()=>{ if (c==="进阶") setAdvancedFilter(true); else { setAdvancedFilter(false); setFilter(c); } }}>{c}</button>)}</div>
        <div className="home-grid">{(advancedFilter ? ADVANCED_PATTERNS : PATTERNS.filter(p=>filter==="全部"||p.category===filter)).map(p=><HomeTile key={p.id} pattern={p} colorwayId={colorways[p.id]} onOpen={()=>openGame(p.id)} finished={completed.includes(p.id)} placed={placedCount(p, savedBoards[p.id])} />)}</div>
      </section>}

      {savePhase === "ready" && tab === "game" && <section className="game-screen" data-mode={mode ?? "pick"}>
        <header className="game-header"><button onClick={()=>replay ? leaveReplay() : setTab(originTab)} aria-label={replay ? "返回作品册" : originTab === "home" ? "返回首页" : originTab === "works" ? "返回作品册" : "返回图纸宝库"}><ArrowLeft aria-hidden="true"/></button><div><b>{pattern.name}</b><small>{mode === "spot" && spotPuzzle ? `找到 ${spotFound.length}/${spotPuzzle.swapped.length} 颗 · ${spotPuzzle.homeName}` : isAdvancedPlay ? `已拼 ${done}/${total} 颗` : `${done}/${total} 颗${mode && mode !== "assistant" && mode !== "spot" ? ` · 错误 ${mistakes}` : ""}${activeColorway ? ` · ${activeColorway.name}` : ""}`}</small></div><div className="game-header-actions">{mode === "mobile" && !isAdvancedPlay && <button type="button" onClick={()=>setTapMode(v=>!v)}>{tapMode ? "点击模式" : "拖动模式"}</button>}{mode && mode !== "assistant" && mode !== "spot" ? <button onClick={()=>setHint(v=>!v)}>{hint?"关提示":"开提示"}</button> : <span />}</div></header>
        <div className="game-progress" role="progressbar" aria-label={mode === "spot" ? "找不同完成度" : "拼豆完成度"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={displayProgress}><i style={{width:`${displayProgress}%`}} /><b>{displayProgress}%</b></div>
        {!mode && <section className="mode-picker" aria-label="选择玩法"><div className="mode-preview" aria-hidden="true"><Art pattern={pattern} /></div><small>{pattern.name} · {patternInfo.difficultyLabel} · {formatEstimatedMinutes(patternInfo.estimatedMinutes)}</small><h1>先选配色，再开拼</h1><fieldset className="colorway-picker"><legend>我的配色</legend><div>{availableColorways.map(option=><button key={option.id} className={activeColorway.id===option.id?"active":""} aria-pressed={activeColorway.id===option.id} aria-label={`${option.name}配色`} onClick={()=>void chooseColorway(option.id)}><span>{keys(pattern).map(symbol=><i key={symbol} style={{background:(option.palette[symbol]??basePattern.palette[symbol])?.color}}/>)}</span><b>{option.name}</b>{activeColorway.id===option.id&&<Check aria-hidden="true"/>}</button>)}</div></fieldset><h2>选一种玩法</h2><div className="playmode-options">{!isAdvancedPlay && <button onClick={()=>enterPlayMode("assistant")}><b>实体制作助手</b><span>照着实体板，一区一色记下</span></button>}<button onClick={()=>enterPlayMode("mobile")}><b>手机拼豆</b><span>先选颜色，再点格子放豆</span></button>{!isAdvancedPlay && <button onClick={()=>enterPlayMode("mystery")}><b>轮廓猜猜</b><span>先看剪影，拼完才揭晓</span></button>}<button onClick={()=>openVoyage(pattern.id)}><b>夜航探图</b><span>点旁边的豆子走路，先拿信再送到</span></button></div><p className="child-safety-line">你只负责摆豆。摆完不要拿下来，连同拼板一起交给家长。</p></section>}
        {mode && <>
        <div className="play-chrome">
          <div className="mode-strip"><button onClick={()=>{ if (replay) leaveReplay(); else if (isAdvancedPlay) setTab(originTab); else { setMode(null); setUndoStack([]); } }} aria-label={replay ? "返回作品册" : isAdvancedPlay ? "返回图纸" : "重新选择玩法"}>{mode === "assistant" ? "实体制作助手" : mode === "mobile" ? "手机拼豆" : mode === "spot" ? "配色找不同" : "轮廓猜猜"}<small>{replay ? "回小舞台" : isAdvancedPlay ? "返回" : "换玩法"}</small></button>{!replay && <button onClick={()=>void showPoster("print")}>生成打印图</button>}{mode !== "assistant" && mode !== "spot" && <button onClick={()=>void undoLast()} disabled={!undoStack.length} aria-label="撤销一步">撤销一步</button>}</div>
          {mode === "mystery" && <div className="reference mystery-reference compact-reference"><div><span>轮廓已揭开 {completedColors.length}/{keys(pattern).length} 色</span></div><MysteryArt pattern={pattern} revealed={completedColors}/></div>}
          {mode === "spot" && spotPuzzle && <div className="reference compact-reference"><div><span>我的配色 · {spotPuzzle.homeName}</span></div><Art pattern={pattern} /></div>}
          {mode === "spot" && spotPuzzle ? <div className="color-goal"><i style={{background: spotOther?.palette[target.find(cell => cell !== ".") ?? ""]?.color ?? "#ec6f5d"}}/><p><b>找出换了队服的豆子</b><small>对照{spotPuzzle.homeName}，还差 {spotLeft} 颗 · 点错 {mistakes}</small></p></div> : <div className="color-goal"><i style={{background:pattern.palette[selected].color}}/><p><b>现在拼：{pattern.palette[selected].name}</b><small>{currentColorDone}/{currentColorTotal} 颗 · {mode === "mystery" ? (completedColors.includes(selected) ? "这一层已揭开" : `还差 ${currentColorTotal-currentColorDone} 颗揭开`) : mode === "assistant" ? "点这个颜色的豆子，整组会一起记下" : tapMode ? "先选颜色，再点格子放豆；点已放豆子可擦掉" : hint ? "点空格放豆，点已放的豆子可擦掉" : "提示已关闭，点已放的豆子可擦掉"}</small></p></div>}
          {!isAdvancedPlay && <div className="zone-picker" aria-label="选择放大分区"><div><b>现在放大：{ZONE_LABELS[zone]}</b><small>{mode === "spot" ? `${activeZoneIndices.filter(index => spotSwapped.has(index) && spotFoundSet.has(index)).length}/${activeZoneIndices.filter(index => spotSwapped.has(index)).length} 颗` : `${activeZoneDone}/${activeZoneTargets.length} 颗`}</small></div><div>{ZONE_LABELS.map((label,index)=>{const part=zoneIndices(index);const partTargets=part.filter(i=>target[i]!==".");const partDone=partTargets.filter(i=>board[i]===target[i]).length;const empty=!partTargets.length;const zoneSwaps=part.filter(i=>spotSwapped.has(i));const zoneSwapFound=zoneSwaps.filter(i=>spotFoundSet.has(i)).length;const zoneComplete=mode==="spot"?zoneSwaps.length>0&&zoneSwapFound===zoneSwaps.length:partTargets.length>0&&partDone===partTargets.length;return <button key={label} className={`${zone===index?"active":""}${empty?" empty-zone":""}${zoneComplete?" zone-done":""}`} onClick={()=>{setZone(index);gameRef.current?.scrollIntoView({block:"nearest"})}} aria-pressed={zone===index} aria-label={mode==="spot"?`${label}，找到${zoneSwapFound}/${zoneSwaps.length}颗`:`${label}，${partDone}/${partTargets.length}颗`}><ZoneThumb pattern={pattern} board={board} target={target} zone={index} spot={mode==="spot"&&spotPuzzle&&spotOther?{swapped:spotSwapped,found:spotFoundSet,otherPalette:spotOther.palette}:undefined}/><b>{label}</b>{zoneComplete&&<em><Check aria-hidden="true"/></em>}</button>})}</div></div>}
        </div>
        <div className={`play-board${isAdvancedPlay ? " advanced" : ""}`} ref={gameRef} onPointerLeave={()=>setDrawing(false)}>
          <div className="companion" role="status" aria-live="polite" aria-label="角色说话">
            <img src={HEADER_AVATAR} srcSet={`${HEADER_AVATAR_2X} 2x`} width="38" height="38" alt="" />
            <p>{message || (mode === "spot" ? companionIdleSpot(spotLeft) : companionIdle(pattern.id, pattern.palette[selected]?.name ?? ""))}</p>
          </div>
          <div className={`touch-grid${mode==="assistant"?" preview":""}${isAdvancedPlay?" advanced":""}`} style={{"--cols": isAdvancedPlay ? currentBoardSize : ZONE_SIZE} as React.CSSProperties}>{activeZoneIndices.map(index=>{const cell=target[index];if(cell===".") return <span key={index} className="outside" aria-hidden="true"/>;const swapped=spotSwapped.has(index);const found=spotFoundSet.has(index);const spotColor=mode==="spot"?((swapped&&!found?spotOther?.palette[cell]?.color:pattern.palette[cell].color)??pattern.palette[cell].color):undefined;const label=mode==="spot"?`第${Math.floor(index/currentBoardSize)+1}行第${index%currentBoardSize+1}格，${found?"已找回家":swapped?"换了队服":"原来的颜色"}`:`第${Math.floor(index/currentBoardSize)+1}行第${index%currentBoardSize+1}格，${pattern.palette[cell].name}`;return <button key={index} aria-label={label} className={`${mode==="spot"||board[index]!=="."?"placed":""} ${hint&&mode!=="assistant"&&mode!=="spot"&&cell===selected&&board[index]==="."?"target-hint":""} ${mode==="assistant"&&cell===selected?"assistant-target":""} ${mode==="spot"&&swapped&&!found?"spot-swap":""} ${mode==="spot"&&found?"spot-found":""}`} style={mode==="spot"?{background:spotColor}:board[index]!=="."?{background:pattern.palette[board[index]].color}:undefined} onPointerDown={e=>{ if (!(isAdvancedPlay && tapMode)) e.preventDefault(); handlePlayPointerDown(index); }} onPointerEnter={e=>{if(mode==="mobile"&&tapMode) return; if(mode!=="assistant"&&mode!=="spot"&&drawing){e.preventDefault(); void paint(index);}}} onPointerUp={()=>setDrawing(false)} />})}</div>{mode==="assistant"&&<div className="assistant-action"><p><b>{ZONE_LABELS[zone]} · {pattern.palette[selected].name}</b><small>本区还剩 {Math.max(0,activeZoneColorTargets.length-activeZoneColorDone)} 颗，共 {activeZoneColorTargets.length} 颗</small></p><button onClick={()=>void toggleZoneColor()} disabled={!activeZoneColorTargets.length}>{activeZoneColorTargets.length>0&&activeZoneColorDone===activeZoneColorTargets.length?"取消这一组":"这一组已拼好"}</button></div>}
        </div>
        {mode !== "spot" && <div className="palette"><div className="palette-head"><b>选择豆子颜色</b><button onClick={()=>setConfirmReset(true)}><RotateCcw aria-hidden="true"/>重新开始</button></div><div>{keys(pattern).map(k=>{const count=target.filter(v=>v===k).length;const placed=board.filter((v,i)=>v===k&&v===target[i]).length;return <button key={k} className={selected===k?"active":""} onClick={()=>setSelected(k)}><i style={{background:pattern.palette[k].color}}/><span>{pattern.palette[k].name}<small>{placed}/{count}</small></span>{placed===count&&<em><Check aria-hidden="true"/></em>}</button>})}</div></div>}
        {mode !== "spot" && <details className="pattern-more"><summary>{mode === "assistant" ? "对照完整图纸和备豆表" : "查看完整图纸和说明"}</summary><div className="reference"><Art pattern={pattern} /></div><section className="pattern-guide" aria-label="图纸说明"><div><small>{patternInfo.difficultyLabel}</small><b>{formatEstimatedMinutes(patternInfo.estimatedMinutes)}</b><p>{patternInfo.difficultyWhy}</p></div><div><small>玩法灵感</small><b>{patternInfo.playIdea}</b><p>这是故事灵感，不是儿童加工说明；需要成型或检查时交给家长。</p></div><ul>{patternInfo.assemblyNotes.map(note=><li key={note}>{note}</li>)}</ul><div className="material-table" role="table" aria-label="按颜色计算的建议准备量"><div role="row"><b role="columnheader">颜色</b><b role="columnheader">实需</b><b role="columnheader">备用</b><b role="columnheader">建议准备</b></div>{patternSupplies.map(item=><div role="row" key={item.key}><span role="cell"><i style={{background:item.color}}/>{item.name}</span><span role="cell">{item.required}</span><span role="cell">+{item.reserve}</span><strong role="cell">{item.recommended}</strong></div>)}</div><p className="child-safety-line compact">{patternInfo.childFinishLine}：保持图案在拼板上，不要自己做后续加工。</p></section></details>}
        </>}
      </section>}

      {savePhase === "ready" && tab === "voyage" && <VoyageView
        catalog={[...PATTERNS, ...ADVANCED_PATTERNS]}
        voyages={voyages}
        completedIds={completed}
        resolvePattern={id => resolvedPattern(findPattern(id), colorways[id])}
        initialPatternId={voyagePatternId}
        headerAvatar={HEADER_AVATAR}
        headerAvatar2x={HEADER_AVATAR_2X}
        onBack={() => { setVoyagePatternId(null); setTab(originTab); }}
        onPersist={run => { void persistVoyage(run); }}
        onCraft={id => { setVoyagePatternId(null); openGame(id); }}
      />}

      {savePhase === "ready" && tab === "draw" && <section className="draw-screen">
        <header className="draw-header">
          <button type="button" onClick={()=>setTab("home")} aria-label="返回首页"><ArrowLeft aria-hidden="true"/></button>
          <div><b>{editingDrawingId ? "编辑作品" : "自由画板"}</b><small>18×18 · 12 种颜色</small></div>
          <button type="button" onClick={()=>void saveDrawing()} disabled={!drawCells.some(cell => cell !== ".")}><Check aria-hidden="true"/>保存</button>
        </header>
        {message && <p className="draw-status" role="status" aria-live="polite">{message}</p>}
        <div className="draw-canvas" onPointerLeave={()=>{ drawStrokeRef.current = null; setDrawing(false); }} onPointerUp={()=>{ drawStrokeRef.current = null; setDrawing(false); }}>
          <div className="touch-grid" style={{ "--cols": BOARD_SIZE } as React.CSSProperties}>
            {drawCells.map((cell, index) => (
              <button
                key={index}
                type="button"
                className={cell !== "." ? "filled" : "empty"}
                style={cell !== "." ? { backgroundColor: FREE_PALETTE[cell]?.color } : undefined}
                aria-label={`第${Math.floor(index / BOARD_SIZE) + 1}行第${(index % BOARD_SIZE) + 1}格${cell !== "." && FREE_PALETTE[cell] ? `，${FREE_PALETTE[cell].name}` : ""}`}
                onPointerDown={event => {
                  event.preventDefault();
                  setDrawing(true);
                  drawStrokeRef.current = paintDrawCell(index);
                }}
                onPointerEnter={event => {
                  if (!drawStrokeRef.current) return;
                  event.preventDefault();
                  paintDrawCell(index, drawStrokeRef.current);
                }}
                onPointerUp={()=>{ drawStrokeRef.current = null; setDrawing(false); }}
              />
            ))}
          </div>
        </div>
        <div className="draw-palette">
          <div className="palette-head">
            <b>选颜色</b>
            <button type="button" onClick={()=>{ if (drawCells.some(cell => cell !== ".")) { const blank = emptyDrawBoard(); drawCellsRef.current = blank; setDrawCells(blank); } }}><RotateCcw aria-hidden="true"/>清空</button>
          </div>
          <div className="draw-colors">
            {Object.entries(FREE_PALETTE).map(([key, color]) => (
              <button key={key} type="button" className={drawSelected === key ? "active" : ""} onClick={()=>{ drawSelectedRef.current = key; setDrawSelected(key); }} aria-label={color.name} aria-pressed={drawSelected === key}>
                <i style={{ background: color.color }} />
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
        {savedDrawings.length > 0 && <div className="draw-saved-list">
          <h3>我的作品</h3>
          <div className="draw-grid">
            {savedDrawings.map(item => (
              <button key={item.id} type="button" className="draw-thumb" onClick={()=>loadDrawing(item.id)}>
                <DrawThumb cells={item.cells} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>}
      </section>}

      {savePhase === "ready" && tab === "works" && <section className="works">
        <DeskView
          desk={desk}
          drawings={savedDrawings}
          colorways={colorways}
          scenes={STAGE_SCENES}
          effects={STAGE_EFFECTS}
          nextQuest={quest.allDone ? null : { id: quest.currentPatternId, name: quest.currentName, pattern: resolvedPattern(storybookPattern(quest.currentPatternId), colorways[quest.currentPatternId]) }}
          selectedSlot={deskSlot}
          onSelectSlot={slot => setDeskSlot(current => current === slot ? null : slot)}
          onMove={(from, direction) => { void persistDeskNow(swapDeskSlots(deskRef.current, from, from + direction)).then(ok => { if (ok) setDeskSlot(from + direction); }); }}
          onOpenItem={item => { if (item.kind === "pattern") openPatternStage(item.id); else { const drawing = savedDrawings.find(entry => entry.id === item.id); if (drawing) showDrawingOnStage(drawing); } }}
          onOpenQuest={id => openGame(id)}
          onChangeScene={scene => { void persistDeskNow({ ...deskRef.current, scene }); }}
          onChangeEffect={effect => { void persistDeskNow({ ...deskRef.current, effect }); }}
        />
        <div className="page-head"><small>米粒的作品册</small><h1>{completed.length} 个闪亮作品</h1><p>每完成一幅，都会保存在这台手机里，家长可以随时清除。</p></div>
        {completed.length ? <div className="work-grid">{[...PATTERNS, ...ADVANCED_PATTERNS].filter(p=>completed.includes(p.id)).map(p=>{const selection=stages[p.id]??DEFAULT_STAGE;const scene=STAGE_SCENES.find(item=>item.id===selection.scene)??STAGE_SCENES[0];const colorway=selectedColorway(p,colorways[p.id]);const workPattern=resolvedPattern(p,colorway.id);const story=composeStory(p.id,stories[p.id],selection.scene,selection.effect);return <article key={p.id}><button onClick={()=>openPatternStage(p.id)}><StagePreview pattern={workPattern} selection={selection} compact/><b>{p.name}</b><small>{colorway.name} · {scene.name}{voyages[p.id]?.complete ? " · 夜航印章" : ""}</small><p className="work-story">{story.line}</p></button><div className="work-actions"><button className="work-play" onClick={()=>openPatternStage(p.id)}><Play aria-hidden="true"/>进入小舞台</button>{colorwayOptions(p).length>1 && <button className="work-play secondary" onClick={()=>openReplay(p.id,"spot")}>配色找不同</button>}<button className="work-play secondary" onClick={()=>openVoyage(p.id)}>夜航探图</button></div></article>})}</div> : savedDrawings.length ? null : <div className="no-works"><span><Sparkles aria-hidden="true"/></span><h2>第一颗星星还在等你</h2><p>完成一张图纸，它就会出现在这里。</p><button onClick={()=>openGame(FEATURED_PATTERN.id)}>去完成第一幅</button></div>}
        {savedDrawings.length > 0 && <section className="works-drawings">
          <h2>自由画板作品</h2>
          <div className="work-grid">
            {savedDrawings.map(item => {
              const selection: StageSelection = { scene: item.scene, effect: item.effect };
              const scene = STAGE_SCENES.find(entry => entry.id === item.scene) ?? STAGE_SCENES[0];
              return <article key={item.id}>
                <button type="button" onClick={()=>showDrawingOnStage(item)}>
                  <StagePreview pattern={drawingToPattern(item)} selection={selection} compact/>
                  <b>{item.name}</b>
                  <small>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("zh-CN") : scene.name}</small>
                </button>
                <div className="work-actions">
                  <button className="work-play" onClick={()=>showDrawingOnStage(item)}><Play aria-hidden="true"/>进入小舞台</button>
                  <button className="work-play secondary" onClick={()=>loadDrawing(item.id)}>编辑</button>
                </div>
              </article>;
            })}
          </div>
        </section>}
      </section>}

      {savePhase === "ready" && tab !== "game" && tab !== "draw" && tab !== "voyage" && <nav className="nav"><button className={tab==="home"?"active":""} onClick={()=>{ setAdvancedFilter(false); setTab("home"); }}><span><HomeIcon aria-hidden="true"/></span>首页</button><button className={tab==="library"?"active":""} onClick={()=>{ if (tab !== "library") setAdvancedFilter(false); setTab("library"); }}><span><BookOpen aria-hidden="true"/></span>图纸</button><button className="play" onClick={()=>openGame(PATTERNS.find(p=>!completed.includes(p.id))?.id??PATTERNS[0].id)}><span><Play aria-hidden="true"/></span>开拼</button><button className={tab==="works"?"active":""} onClick={openWorks}><span><Star aria-hidden="true"/></span>作品</button></nav>}
    </div>
    {celebrate&&<DialogFrame className="finish-sheet" label={mode === "spot" ? "找不同完成" : "拼豆完成"} onClose={openStageFromFinish}><div className="celebration-icons" aria-hidden="true">{Array.from({length:8},(_,i)=><Sparkles key={i}/>)}</div><div className="motion-stage mini"><Art pattern={pattern} animated/></div><h2>{mode === "spot" ? "找齐啦，米粒！" : "完成啦，米粒！"}</h2><p>{mode === "spot" ? "换队服的豆子都回家了" : storyJustFinished ? (finishQuest.allDone ? "信送到了！大家在书桌上排队。" : `${pattern.name}走上了书桌`) : "作品马上会走进小舞台"}</p><div className="finish-actions"><button onClick={openStageFromFinish}>进入小舞台</button>{storyJustFinished && <button onClick={()=>{ setCelebrate(false); openWorks(); }}>去书桌看看</button>}</div></DialogFrame>}
    {poster && <DialogFrame className="poster-sheet" label={poster.kind === "print" ? "高清可打印图纸" : "米粒的作品卡"} inactive={Boolean(parentChallenge)} onClose={()=>{clearParentHold();setPoster(null)}}><section><button className="poster-close" onClick={()=>{clearParentHold();setPoster(null)}} aria-label="关闭"><X aria-hidden="true"/></button><small>{poster.kind === "print" ? "高清可打印图纸" : "米粒的作品卡"} · {poster.colorwayName}</small><img src={poster.src} alt={`${poster.patternName}${poster.colorwayName}拼豆${poster.kind === "print" ? "图纸" : "作品卡"}`} /><div className={Capacitor.isNativePlatform()?"single-action":undefined}><button className={parentHold==="share"?"parent-hold active":"parent-hold"} aria-describedby="parent-action-help" onPointerDown={()=>startParentHold("share")} onPointerUp={clearParentHold} onPointerCancel={clearParentHold} onPointerLeave={clearParentHold} onKeyDown={event=>{if((event.key===" "||event.key==="Enter")&&!event.repeat)startParentHold("share")}} onKeyUp={event=>{if(event.key===" "||event.key==="Enter")clearParentHold()}}>{Capacitor.isNativePlatform()?"家长长按·保存或分享":"家长长按·保存高清图"}</button>{!Capacitor.isNativePlatform()&&<button className={parentHold==="print"?"parent-hold active":"parent-hold"} aria-describedby="parent-action-help" onPointerDown={()=>startParentHold("print")} onPointerUp={clearParentHold} onPointerCancel={clearParentHold} onPointerLeave={clearParentHold} onKeyDown={event=>{if((event.key===" "||event.key==="Enter")&&!event.repeat)startParentHold("print")}} onKeyUp={event=>{if(event.key===" "||event.key==="Enter")clearParentHold()}}>家长长按·打印</button>}</div><p id="parent-action-help" role="status" aria-live="polite">{parentHold?"请继续按住…":shareStatus || "高清 PNG · 1200×1500 · 保存/分享/打印需家长操作"}</p></section></DialogFrame>}
    {animationPattern && <DialogFrame className="animation-sheet stage-sheet" label={`${animationPattern.name}的小舞台`} onClose={closeStage}><section><button className="animation-close" onClick={closeStage} aria-label="关闭小舞台"><X aria-hidden="true"/></button><small>我的小舞台 · {stageDrawing ? "自由画板" : animationColorway?.name}</small><h2>{animationPattern.name}</h2><StagePreview pattern={animationPattern} selection={activeStageSelection}/><div className="stage-customizer"><fieldset><legend>选舞台</legend><div>{STAGE_SCENES.map(item=><button key={item.id} className={activeStageSelection.scene===item.id?"active":""} aria-pressed={activeStageSelection.scene===item.id} onClick={()=>chooseStageScene(item.id)}><img src={item.image} alt=""/><span>{item.name}</span></button>)}</div></fieldset><fieldset><legend>选特效</legend><div>{STAGE_EFFECTS.map(item=><button key={item.id} className={activeStageSelection.effect===item.id?"active":""} aria-pressed={activeStageSelection.effect===item.id} onClick={()=>chooseStageEffect(item.id)}><i className={`effect-swatch effect-${item.id}`} aria-hidden="true"/><span>{item.name}</span></button>)}</div></fieldset></div>{storyWhoOptions(animationPattern.id).length > 0 && <div className="story-customizer"><p className="story-kicker">编一句故事</p><fieldset><legend>谁来演</legend><div>{storyWhoOptions(animationPattern.id).map(option=><button key={option.id} className={activeStorySelection?.who===option.id?"active":""} aria-pressed={activeStorySelection?.who===option.id} onClick={()=>chooseStoryWho(option.id)}>{option.label}</button>)}</div></fieldset><fieldset><legend>在这里做什么</legend><div>{storyDoingOptions(animationPattern.id).map(option=><button key={option.id} className={activeStorySelection?.doing===option.id?"active":""} aria-pressed={activeStorySelection?.doing===option.id} onClick={()=>chooseStoryDoing(option.id)}>{option.label}</button>)}</div></fieldset><p className="story-preview" aria-live="polite">{activeStory?.text}</p></div>}<p className="stage-choice-note">{stageDrawing ? "自由画板" : animationColorway?.name} · {activeStageScene.name} · {activeStageEffect.note}</p><div className="stage-actions"><button onClick={()=>{closeStage();void showPoster("work",animationPattern)}}>做成作品卡</button>{stageDrawing ? <button onClick={()=>{ const id = stageDrawing.id; closeStage(); loadDrawing(id); }}>继续画</button> : <>{colorwayOptions(animationPattern).length>1 && <button onClick={()=>openReplay(animationPattern.id,"spot")}>配色找不同</button>}{!isAdvancedPattern(animationPattern) && <button onClick={()=>openReplay(animationPattern.id,"mystery")}>轮廓再猜一次</button>}</>}</div></section></DialogFrame>}
    {showPrivacy && <DialogFrame className="privacy-sheet" label="家长与隐私" onClose={()=>setShowPrivacy(false)}><PrivacyContent onBack={()=>setShowPrivacy(false)} onDelete={deleteAllSaveData}/></DialogFrame>}
    {bookPage && bookCast && bookArt && <DialogFrame className="story-sheet" label={STORYBOOK_TITLE} onClose={()=>setStoryPage(null)}>
        <section>
          <button className="animation-close" onClick={()=>setStoryPage(null)} aria-label="关闭绘本"><X aria-hidden="true"/></button>
          <small>{bookPage.kicker} · {(storyPage ?? 0) + 1}/{STORYBOOK_PAGES.length}</small>
          <div className="story-art" aria-hidden="true"><Art pattern={bookArt} animated/></div>
          <h2>{bookPage.title}</h2>
          <p>{bookPage.text}</p>
          <button className="story-craft" onClick={()=>{ const id = bookCast.id; setStoryPage(null); if (completed.includes(id)) openWorks(); else openGame(id); }}>{completed.includes(bookCast.id) ? `去书桌上找${bookCast.name}` : `去拼出${bookCast.name}`}</button>
          <div className="story-nav">
            <button disabled={storyPage === 0} onClick={()=>setStoryPage((storyPage ?? 0) - 1)}>上一页</button>
            <button disabled={!nextStoryUnlocked} onClick={()=>setStoryPage(nextStoryIndex)}>{storyPage === STORYBOOK_PAGES.length - 1 ? "读完了" : nextStoryUnlocked ? "下一页" : `先拼出${nextStoryName}`}</button>
          </div>
        </section>
      </DialogFrame>}
    {confirmReset && <DialogFrame className="confirm-sheet" label="确认重新开始" onClose={()=>setConfirmReset(false)}><section><h2>要重新开始吗？</h2><p>已经拼好的 {done} 颗豆子会被清空，这一步不能撤销。</p><div><button onClick={()=>setConfirmReset(false)}>继续拼</button><button className="danger" onClick={async()=>{const empty=Array(target.length).fill(".");const nextBoards={...savedBoardsRef.current,[pattern.id]:empty};try{await persistSaveNow(completedRef.current,nextBoards,activityDatesRef.current);boardRef.current=empty;setBoard(empty);setSavedBoards(nextBoards);setConfirmReset(false)}catch{say("清空失败，进度仍保留")}}}>确认清空</button></div></section></DialogFrame>}
    {parentChallenge && <DialogFrame className="parent-gate" label="家长验证" onClose={()=>{setParentChallenge(null);setParentAction(null);setParentAnswer("");setParentError("")}}><form onSubmit={event=>{event.preventDefault();void verifyParent()}}><small>家长操作</small><h2>请交给家长</h2><p>{parentAction==="print"?"打印会打开新窗口。":"保存或分享会打开系统面板。"}这是成人区，请家长计算：</p><strong aria-label={`${parentChallenge.left}${parentChallenge.operator}${parentChallenge.right}等于多少`}>{parentChallenge.left} {parentChallenge.operator} {parentChallenge.right} = ?</strong><label htmlFor="parent-answer">答案</label><input id="parent-answer" name="parent-answer" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={parentAnswer} onChange={event=>setParentAnswer(event.target.value.replace(/\D/g,"").slice(0,5))} aria-describedby={parentError?"parent-error":undefined}/>{parentError&&<p id="parent-error" className="gate-error" role="alert">{parentError}</p>}<div><button type="button" onClick={()=>{setParentChallenge(null);setParentAction(null);setParentAnswer("");setParentError("")}}>取消</button><button type="submit" disabled={!parentAnswer}>验证并继续</button></div></form></DialogFrame>}
  </main>;
}
