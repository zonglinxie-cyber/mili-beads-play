import test from "node:test";
import assert from "node:assert/strict";
import { FREE_PALETTE, PATTERNS, ADVANCED_PATTERNS } from "../app/patterns.ts";
import { DELETE_PENDING_KEY, DELETE_TOMBSTONE, emptySaveSnapshot, FREE_DRAWING_LIMIT, normalizeSave, readLocalSave, SAVE_KEY } from "../app/save-store.ts";
import { voyageSeedFor } from "../app/voyage.ts";

const storageFrom = (values) => ({ getItem: key => values[key] ?? null });
const primary = PATTERNS[0];
const secondary = PATTERNS[1];

test("a corrupt current save falls back to an intact legacy save", () => {
  const target = primary.rows.join("").split("");
  const first = target.findIndex(cell => cell !== ".");
  const board = Array(18 * 18).fill(".");
  board[first] = target[first];
  const save = readLocalSave(storageFrom({
    [SAVE_KEY]: "{broken",
    "mili-game-v2": JSON.stringify({ completed: [secondary.id, "unknown"], boards: { [primary.id]: board }, activityDates: ["2026-08-12", "bad"] }),
  }));

  assert.deepEqual(save.completed, [secondary.id]);
  assert.equal(save.boards[primary.id].filter(cell => cell !== ".").length, 1);
  assert.deepEqual(save.activityDates, ["2026-08-12"]);
  assert.deepEqual(save.stages, {});
  assert.deepEqual(save.colorways, {});
  assert.deepEqual(save.stories, {});
});

test("structurally corrupt saves are rejected instead of becoming an empty canonical save", () => {
  assert.throws(() => normalizeSave([]), /save root/);
  assert.throws(() => normalizeSave({ boards: [] }), /boards/);
  assert.throws(() => normalizeSave({ completed: "rocket-cat" }), /completed/);
  assert.throws(() => normalizeSave({ stages: [] }), /stages/);
  assert.throws(() => normalizeSave({ colorways: [] }), /colorways/);
  assert.throws(() => normalizeSave({ stories: [] }), /stories/);
  assert.throws(() => normalizeSave({ drawings: {} }), /drawings/);
  assert.throws(() => normalizeSave({ voyages: [] }), /voyages/);
  assert.deepEqual(readLocalSave(storageFrom({ [SAVE_KEY]: JSON.stringify({ boards: [] }) })), emptySaveSnapshot());
});

test("free drawings round-trip, sanitize foreign symbols and enforce the cap", () => {
  const symbols = Object.keys(FREE_PALETTE);
  const cells = Array(18 * 18).fill(".");
  cells[0] = symbols[0];
  cells[1] = "?";
  cells[2] = 42;
  const valid = { id: "draw-abc123", name: "我的创作 1", cells, scene: "cloud-post", effect: "confetti-rain", updatedAt: "2026-08-13T08:00:00.000Z" };
  const save = normalizeSave({ drawings: [
    valid,
    { ...valid },
    { ...valid, id: "draw-UPPER" },
    { ...valid, id: "draw-short", cells: ["."] },
    { ...valid, id: "draw-noname", name: "  " },
    { ...valid, id: "draw-badstage", scene: "uploaded-photo", effect: "script", updatedAt: "not-a-date" },
    "not-an-object",
  ] });
  assert.equal(save.drawings.length, 2);
  assert.deepEqual(save.drawings[0], { ...valid, cells: cells.map(cell => typeof cell === "string" && symbols.includes(cell) ? cell : ".") });
  assert.deepEqual(save.drawings[1], { id: "draw-badstage", name: valid.name, cells: save.drawings[0].cells, scene: "starship-cabin", effect: "star-trail", updatedAt: "" });
  const overflow = Array.from({ length: FREE_DRAWING_LIMIT + 5 }, (_, index) => ({ ...valid, id: `draw-item${index}` }));
  assert.equal(normalizeSave({ drawings: overflow }).drawings.length, FREE_DRAWING_LIMIT);
  assert.deepEqual(emptySaveSnapshot().drawings, []);
});

test("stage personalization is allowlisted per known pattern and migrates safely", () => {
  const save = normalizeSave({
    completed: [primary.id],
    stages: {
      [primary.id]: { scene: "cloud-post", effect: "bubble-orbit" },
      "moon-rabbit": { scene: "uploaded-photo", effect: "script" },
      "unknown-pattern": { scene: "candy-park", effect: "confetti-rain" },
    },
  });
  assert.deepEqual(save.stages, { [primary.id]: { scene: "cloud-post", effect: "bubble-orbit" } });
  assert.deepEqual(normalizeSave({ completed: [], boards: {}, activityDates: [] }).stages, {});
  assert.deepEqual(emptySaveSnapshot().stages, {});
});

test("colorway personalization is strictly allowlisted per pattern", () => {
  const pattern = PATTERNS.find(candidate => Array.isArray(candidate.colorways) && candidate.colorways.length > 1);
  if (!pattern) {
    assert.deepEqual(normalizeSave({ colorways: { [primary.id]: "invented" } }).colorways, {});
    return;
  }
  const allowed = pattern.colorways[1].id;
  const save = normalizeSave({
    colorways: {
      [pattern.id]: allowed,
      "unknown-pattern": allowed,
      [PATTERNS.find(candidate => candidate.id !== pattern.id)?.id ?? "other"]: "invented",
    },
  });
  assert.deepEqual(save.colorways, { [pattern.id]: allowed });
  assert.deepEqual(normalizeSave({ completed: [], boards: {}, activityDates: [] }).colorways, {});
  assert.deepEqual(emptySaveSnapshot().colorways, {});
});

test("story personalization is strictly allowlisted per pattern", () => {
  const save = normalizeSave({
    stories: {
      [primary.id]: { who: "wind-cat", doing: "lift-scarf" },
      "moon-rabbit": { who: "invented", doing: "send-mail" },
      "unknown-pattern": { who: "wind-cat", doing: "lift-scarf" },
    },
  });
  assert.deepEqual(save.stories, { [primary.id]: { who: "wind-cat", doing: "lift-scarf" } });
  assert.deepEqual(normalizeSave({ completed: [], boards: {}, activityDates: [] }).stories, {});
  assert.deepEqual(emptySaveSnapshot().stories, {});
});

test("the native deletion tombstone is versioned and uses a separate durable key", () => {
  assert.notEqual(DELETE_PENDING_KEY, SAVE_KEY);
  assert.deepEqual(JSON.parse(DELETE_TOMBSTONE), { version: 1, pending: true });
});

test("desk placements survive a round-trip and drop figures that left the album", () => {
  const desk = {
    scene: "candy-park",
    effect: "confetti-rain",
    items: [
      { slot: 0, kind: "pattern", id: primary.id },
      { slot: 1, kind: "pattern", id: secondary.id },
    ],
  };
  const kept = normalizeSave({ completed: [primary.id], desk });
  assert.deepEqual(kept.desk, {
    scene: "candy-park",
    effect: "confetti-rain",
    items: [{ slot: 0, kind: "pattern", id: primary.id }],
  });
  assert.deepEqual(normalizeSave({ completed: [], boards: {}, activityDates: [] }).desk, emptySaveSnapshot().desk);
  assert.deepEqual(emptySaveSnapshot().desk, { scene: "starship-cabin", effect: "star-trail", items: [] });
  assert.deepEqual(emptySaveSnapshot().voyages, {});
});

test("voyage runs persist per known pattern and drop invented maps", () => {
  const run = {
    patternId: primary.id,
    seed: voyageSeedFor(primary.id, "2026-08-18"),
    colorwayId: "default",
    position: 0,
    visited: [0],
    ghosts: [],
    charges: { X: 9 },
    lantern: 4,
    lastGlow: 0,
    stamps: ["invented"],
    letters: [],
    carrying: null,
    carryTouched: [],
    carryWindSteps: 0,
    carryPassedGlow: false,
    encounters: [],
    steps: 3,
    mixA: null,
    mixB: null,
    streakColor: null,
    streakLen: 0,
    complete: false,
  };
  const save = normalizeSave({
    voyages: {
      [primary.id]: run,
      "unknown-pattern": run,
    },
  });
  assert.equal(save.voyages[primary.id]?.patternId, primary.id);
  assert.equal(save.voyages[primary.id]?.steps, 3);
  assert.equal(save.voyages["unknown-pattern"], undefined);
  assert.deepEqual(normalizeSave({ completed: [], boards: {}, activityDates: [] }).voyages, {});
});

test("advanced pattern boards persist at their native grid size", () => {
  const pattern = ADVANCED_PATTERNS[0];
  const target = pattern.rows.join("").split("");
  const first = target.findIndex(cell => cell !== ".");
  const board = Array(target.length).fill(".");
  board[first] = target[first];
  const save = normalizeSave({ completed: [pattern.id], boards: { [pattern.id]: board } });
  assert.deepEqual(save.completed, [pattern.id]);
  assert.equal(save.boards[pattern.id].length, target.length);
  assert.equal(save.boards[pattern.id].filter(cell => cell !== ".").length, 1);
  const tooSmall = normalizeSave({ boards: { [pattern.id]: Array(18 * 18).fill(".") } });
  assert.equal(tooSmall.boards[pattern.id], undefined);
});
