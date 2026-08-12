import test from "node:test";
import assert from "node:assert/strict";
import { PATTERNS, connectedComponents, targetCount } from "../app/patterns.ts";

test("pattern catalog has valid 18x18 printable grids", () => {
  assert.equal(PATTERNS.length, 12);
  for (const pattern of PATTERNS) {
    assert.equal(pattern.rows.length, 18, pattern.id);
    assert.ok(pattern.rows.every(row => row.length === 18), pattern.id);
    assert.ok(targetCount(pattern) >= 90 && targetCount(pattern) <= 180, pattern.id);
  }
});

test("release-ready patterns have honest colors, sturdy pieces and animation layers", () => {
  const releaseReady = PATTERNS.filter(pattern => pattern.layers.length > 0);
  assert.ok(releaseReady.length >= 6);
  for (const pattern of releaseReady) {
    const used = new Set(pattern.rows.join("").replaceAll(".", ""));
    assert.deepEqual([...used].sort(), Object.keys(pattern.palette).sort(), `${pattern.id} colors`);
    assert.ok(used.size >= 5 && used.size <= 6, `${pattern.id} color count`);
    assert.equal(pattern.layers.length, 18, `${pattern.id} layers`);
    assert.equal(pattern.layers.join("").length, 324, `${pattern.id} layer coverage`);
    const pieces = connectedComponents(pattern);
    assert.ok(pieces.every(size => size >= 4), `${pattern.id} physical pieces`);
    assert.deepEqual(pattern.pieceSizes, pieces, `${pattern.id} honest piece count`);
  }
});
