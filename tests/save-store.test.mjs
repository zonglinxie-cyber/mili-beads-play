import test from "node:test";
import assert from "node:assert/strict";
import { PATTERNS } from "../app/patterns.ts";
import { DELETE_PENDING_KEY, DELETE_TOMBSTONE, emptySaveSnapshot, normalizeSave, readLocalSave, SAVE_KEY } from "../app/save-store.ts";

const storageFrom = (values) => ({ getItem: key => values[key] ?? null });

test("a corrupt current save falls back to an intact legacy save", () => {
  const target = PATTERNS[0].rows.join("").split("");
  const first = target.findIndex(cell => cell !== ".");
  const board = Array(18 * 18).fill(".");
  board[first] = target[first];
  const save = readLocalSave(storageFrom({
    [SAVE_KEY]: "{broken",
    "mili-game-v2": JSON.stringify({ completed: ["bottle-jelly", "unknown"], boards: { "rocket-cat": board }, activityDates: ["2026-08-12", "bad"] }),
  }));

  assert.deepEqual(save.completed, ["bottle-jelly"]);
  assert.equal(save.boards["rocket-cat"].filter(cell => cell !== ".").length, 1);
  assert.deepEqual(save.activityDates, ["2026-08-12"]);
});

test("structurally corrupt saves are rejected instead of becoming an empty canonical save", () => {
  assert.throws(() => normalizeSave([]), /save root/);
  assert.throws(() => normalizeSave({ boards: [] }), /boards/);
  assert.throws(() => normalizeSave({ completed: "rocket-cat" }), /completed/);
  assert.deepEqual(readLocalSave(storageFrom({ [SAVE_KEY]: JSON.stringify({ boards: [] }) })), emptySaveSnapshot());
});

test("the native deletion tombstone is versioned and uses a separate durable key", () => {
  assert.notEqual(DELETE_PENDING_KEY, SAVE_KEY);
  assert.deepEqual(JSON.parse(DELETE_TOMBSTONE), { version: 1, pending: true });
});
