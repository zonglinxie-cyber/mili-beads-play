import { FREE_PALETTE, PATTERNS } from "./patterns.ts";
import { isAllowedStorySelection, type StorySelection } from "./play-content.ts";

export type GameSave = {
  completed?: string[];
  boards?: Record<string, string[]>;
  activityDates?: string[];
  stages?: Record<string, StageSelection>;
  colorways?: Record<string, string>;
  stories?: Record<string, StorySelection>;
  drawings?: FreeDrawing[];
};
export type { StorySelection };

export const STAGE_SCENE_IDS = ["starship-cabin", "cloud-post", "candy-park"] as const;
export const STAGE_EFFECT_IDS = ["star-trail", "bubble-orbit", "confetti-rain"] as const;
export type StageSceneId = typeof STAGE_SCENE_IDS[number];
export type StageEffectId = typeof STAGE_EFFECT_IDS[number];
export type StageSelection = { scene: StageSceneId; effect: StageEffectId };

/** 孩子在自由画板上的一幅创作。cells 是 18×18 的符号数组，"." 表示空格。 */
export type FreeDrawing = {
  id: string;
  name: string;
  cells: string[];
  scene: StageSceneId;
  effect: StageEffectId;
  updatedAt: string;
};

export const FREE_DRAWING_LIMIT = 24;

export type SaveSnapshot = {
  completed: string[];
  boards: Record<string, string[]>;
  activityDates: string[];
  stages: Record<string, StageSelection>;
  colorways: Record<string, string>;
  stories: Record<string, StorySelection>;
  drawings: FreeDrawing[];
};

type ReadableStorage = Pick<Storage, "getItem">;

export const SAVE_KEY = "mili-game-v3";
export const LEGACY_SAVE_KEYS = ["mili-game-v2"];
export const DELETE_PENDING_KEY = "mili-game-delete-pending-v1";
export const DELETE_TOMBSTONE = JSON.stringify({ version: 1, pending: true });
export const LEGACY_CLEAN_KEY = "mili-game-legacy-clean-v1";
export const LEGACY_CLEAN_VALUE = "1";

const BOARD_SIZE = 18;

export const emptySaveSnapshot = (): SaveSnapshot => ({
  completed: [],
  boards: {},
  activityDates: [],
  stages: {},
  colorways: {},
  stories: {},
  drawings: [],
});

export const normalizeSave = (value: unknown): SaveSnapshot => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("save root must be an object");
  const source = value as Record<string, unknown>;
  if (source.completed !== undefined && !Array.isArray(source.completed)) throw new Error("completed must be an array");
  if (source.boards !== undefined && (!source.boards || typeof source.boards !== "object" || Array.isArray(source.boards))) throw new Error("boards must be an object");
  if (source.activityDates !== undefined && !Array.isArray(source.activityDates)) throw new Error("activityDates must be an array");
  if (source.stages !== undefined && (!source.stages || typeof source.stages !== "object" || Array.isArray(source.stages))) throw new Error("stages must be an object");
  if (source.colorways !== undefined && (!source.colorways || typeof source.colorways !== "object" || Array.isArray(source.colorways))) throw new Error("colorways must be an object");
  if (source.stories !== undefined && (!source.stories || typeof source.stories !== "object" || Array.isArray(source.stories))) throw new Error("stories must be an object");
  if (source.drawings !== undefined && !Array.isArray(source.drawings)) throw new Error("drawings must be an array");

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
  const scenes = new Set<string>(STAGE_SCENE_IDS);
  const effects = new Set<string>(STAGE_EFFECT_IDS);
  const stages: Record<string, StageSelection> = {};
  if (source.stages && typeof source.stages === "object" && !Array.isArray(source.stages)) {
    for (const pattern of PATTERNS) {
      const candidate = (source.stages as Record<string, unknown>)[pattern.id];
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
      const stage = candidate as Record<string, unknown>;
      if (typeof stage.scene === "string" && scenes.has(stage.scene) && typeof stage.effect === "string" && effects.has(stage.effect)) {
        stages[pattern.id] = { scene: stage.scene as StageSceneId, effect: stage.effect as StageEffectId };
      }
    }
  }
  const colorways: Record<string, string> = {};
  if (source.colorways && typeof source.colorways === "object" && !Array.isArray(source.colorways)) {
    for (const pattern of PATTERNS) {
      const candidate = (source.colorways as Record<string, unknown>)[pattern.id];
      if (typeof candidate !== "string") continue;
      const options = (pattern as typeof pattern & { colorways?: { id: string }[] }).colorways;
      if (Array.isArray(options) && options.some(option => option && typeof option.id === "string" && option.id === candidate)) {
        colorways[pattern.id] = candidate;
      }
    }
  }
  const stories: Record<string, StorySelection> = {};
  if (source.stories && typeof source.stories === "object" && !Array.isArray(source.stories)) {
    for (const pattern of PATTERNS) {
      const candidate = (source.stories as Record<string, unknown>)[pattern.id];
      if (isAllowedStorySelection(pattern.id, candidate)) stories[pattern.id] = { who: candidate.who, doing: candidate.doing };
    }
  }
  const drawings: FreeDrawing[] = [];
  if (Array.isArray(source.drawings)) {
    const symbols = new Set(Object.keys(FREE_PALETTE));
    const seen = new Set<string>();
    for (const item of source.drawings) {
      if (drawings.length >= FREE_DRAWING_LIMIT) break;
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const candidate = item as Record<string, unknown>;
      if (typeof candidate.id !== "string" || !/^draw-[a-z0-9]+$/.test(candidate.id) || seen.has(candidate.id)) continue;
      if (typeof candidate.name !== "string" || !candidate.name.trim() || candidate.name.length > 20) continue;
      if (!Array.isArray(candidate.cells) || candidate.cells.length !== BOARD_SIZE * BOARD_SIZE) continue;
      const cells = candidate.cells.map(cell => typeof cell === "string" && symbols.has(cell) ? cell : ".");
      const scene = typeof candidate.scene === "string" && scenes.has(candidate.scene) ? candidate.scene as StageSceneId : STAGE_SCENE_IDS[0];
      const effect = typeof candidate.effect === "string" && effects.has(candidate.effect) ? candidate.effect as StageEffectId : STAGE_EFFECT_IDS[0];
      const updatedAt = typeof candidate.updatedAt === "string" && !Number.isNaN(Date.parse(candidate.updatedAt)) ? candidate.updatedAt : "";
      seen.add(candidate.id);
      drawings.push({ id: candidate.id, name: candidate.name, cells, scene, effect, updatedAt });
    }
  }
  return { completed, boards, activityDates, stages, colorways, stories, drawings };
};

export const parseSaveSnapshot = (raw: string): SaveSnapshot => normalizeSave(JSON.parse(raw));

export const readLocalSave = (storage?: ReadableStorage): SaveSnapshot => {
  const source = storage ?? (typeof localStorage === "undefined" ? undefined : localStorage);
  if (!source) return emptySaveSnapshot();
  for (const key of [SAVE_KEY, ...LEGACY_SAVE_KEYS]) {
    const raw = source.getItem(key);
    if (!raw) continue;
    try { return parseSaveSnapshot(raw); } catch { /* try an older intact save */ }
  }
  return emptySaveSnapshot();
};

export const serializeSave = (snapshot: SaveSnapshot) => JSON.stringify(snapshot);
