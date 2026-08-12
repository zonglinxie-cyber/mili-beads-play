import { PATTERNS } from "./patterns.ts";

export type GameSave = {
  completed?: string[];
  boards?: Record<string, string[]>;
  activityDates?: string[];
};

export type SaveSnapshot = {
  completed: string[];
  boards: Record<string, string[]>;
  activityDates: string[];
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
});

export const normalizeSave = (value: unknown): SaveSnapshot => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("save root must be an object");
  const source = value as Record<string, unknown>;
  if (source.completed !== undefined && !Array.isArray(source.completed)) throw new Error("completed must be an array");
  if (source.boards !== undefined && (!source.boards || typeof source.boards !== "object" || Array.isArray(source.boards))) throw new Error("boards must be an object");
  if (source.activityDates !== undefined && !Array.isArray(source.activityDates)) throw new Error("activityDates must be an array");

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
