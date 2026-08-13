import test from "node:test";
import assert from "node:assert/strict";
import { PATTERNS, connectedComponents, targetCount } from "../app/patterns.ts";

const FIRST_RELEASE_IDS = ["scarf-sprint", "heart-frame", "bow-cat", "berry-sundae", "berry-boba", "balloon-bear", "moon-rabbit", "sushi-train", "whale-castle", "fox-kite", "otter-sub", "skate-duck"];
const REDTEAM_EXCLUDED_IDS = ["rocket-cat", "star-dragon", "frog-post", "rainbow-duck", "penguin-igloo"];

test("catalog contains the family play pool", () => {
  assert.deepEqual(PATTERNS.map(pattern => pattern.id), FIRST_RELEASE_IDS);
  assert.equal(new Set(PATTERNS.map(pattern => pattern.id)).size, PATTERNS.length, "unique ids");
  assert.equal(new Set(PATTERNS.map(pattern => pattern.name)).size, PATTERNS.length, "unique names");
  for (const rejected of REDTEAM_EXCLUDED_IDS) assert.equal(PATTERNS.some(pattern => pattern.id === rejected), false, `${rejected} must stay excluded`);
});

test("every printable grid passes the physical structure and colour-necessity gates", () => {
  for (const pattern of PATTERNS) {
    assert.equal(pattern.rows.length, 18, pattern.id);
    assert.ok(pattern.rows.every(row => row.length === 18), pattern.id);
    const beads = targetCount(pattern);
    assert.ok(beads > 0 && beads <= 180, `${pattern.id} bead budget`);

    const used = new Set(pattern.rows.join("").replaceAll(".", ""));
    assert.deepEqual([...used].sort(), Object.keys(pattern.palette).sort(), `${pattern.id} exact palette`);
    assert.ok(used.size >= 4 && used.size <= 6, `${pattern.id} necessary colours`);
    for (const symbol of used) {
      const count = pattern.rows.join("").split("").filter(cell => cell === symbol).length;
      assert.ok(count >= 4, `${pattern.id}:${symbol} at least four beads`);
      assert.ok(count / beads >= .03, `${pattern.id}:${symbol} at least three percent`);
    }

    const pieces = connectedComponents(pattern);
    assert.ok(pieces.every(size => size >= 24), `${pattern.id} has no small physical piece`);
    assert.deepEqual(pattern.pieceSizes, pieces, `${pattern.id} honest piece declaration`);
    assert.equal(pattern.pieceLabel, pieces.length === 1 ? "一体成品" : pattern.pieceLabel, `${pattern.id} honest piece label`);
  }
});

test("all five patterns ship three complete manually-authored colourways", () => {
  for (const pattern of PATTERNS) {
    assert.equal(pattern.colorways.length, 3, pattern.id);
    assert.equal(new Set(pattern.colorways.map(colorway => colorway.id)).size, 3, `${pattern.id} unique colorway ids`);
    assert.equal(new Set(pattern.colorways.map(colorway => colorway.name)).size, 3, `${pattern.id} unique colorway names`);
    const symbols = Object.keys(pattern.palette).sort();
    for (const colorway of pattern.colorways) {
      assert.deepEqual(Object.keys(colorway.palette).sort(), symbols, `${pattern.id}/${colorway.id} symbols`);
      for (const bead of Object.values(colorway.palette)) {
        assert.ok(bead.name.trim(), `${pattern.id}/${colorway.id} colour name`);
        assert.match(bead.color, /^#[0-9a-f]{6}$/i, `${pattern.id}/${colorway.id} screen colour`);
      }
    }
    assert.deepEqual(pattern.colorways[0].palette, pattern.palette, `${pattern.id} first colorway is canonical`);
  }
});

test("animation layers, safe making guidance and provenance are complete", () => {
  for (const pattern of PATTERNS) {
    assert.equal(pattern.layers.length, 18, `${pattern.id} layers`);
    assert.equal(pattern.layers.join("").length, 324, `${pattern.id} layer coverage`);
    assert.ok(pattern.layers.join("").split("").every((layer, index) =>
      (pattern.rows.join("")[index] === ".") === (layer === ".") && ".BPF".includes(layer)
    ), `${pattern.id} exact layer occupancy`);
    assert.ok(pattern.skillTip.trim() && pattern.playIdea.trim(), `${pattern.id} play guidance`);
    assert.equal(pattern.assemblyNotes.length, 2, `${pattern.id} assembly notes`);
    assert.equal(pattern.childFinishLine, "拼好后请大人帮忙", `${pattern.id} child boundary`);
    assert.ok(pattern.provenance, `${pattern.id} provenance`);
    assert.match(pattern.provenance.gridHash, /^[0-9a-f]{64}$/i, `${pattern.id} grid hash`);
    assert.match(pattern.provenance.sourceHash, /^[0-9a-f]{64}$/i, `${pattern.id} source hash`);
  }
});
