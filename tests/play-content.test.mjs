import test from "node:test";
import assert from "node:assert/strict";
import { PATTERNS } from "../app/patterns.ts";
import { CHILD_PATTERN_FORBIDDEN } from "../app/pattern-metadata.ts";
import {
  buildSpotPuzzle,
  childPlayContentCorpus,
  companionLine,
  composeStory,
  defaultStorySelection,
  isAllowedStorySelection,
  SPOT_DIFF_COUNT,
  storyDoingOptions,
  storyWhoOptions,
} from "../app/play-content.ts";
import { STAGE_EFFECT_IDS, STAGE_SCENE_IDS } from "../app/save-store.ts";

test("every catalog pattern has offline who/doing blocks and safe companion lines", () => {
  for (const pattern of PATTERNS) {
    const who = storyWhoOptions(pattern.id);
    const doing = storyDoingOptions(pattern.id);
    assert.equal(who.length, 3, pattern.id);
    assert.equal(doing.length, 4, pattern.id);
    assert.equal(new Set(who.map(option => option.id)).size, 3, `${pattern.id} unique who`);
    assert.equal(new Set(doing.map(option => option.id)).size, 4, `${pattern.id} unique doing`);
    const start = companionLine(pattern.id, "mobile", "start");
    assert.ok(start.length >= 8 && start.length <= 36, `${pattern.id} start length ${start.length}: ${start}`);
    const story = composeStory(pattern.id, defaultStorySelection(pattern.id), "cloud-post", "bubble-orbit");
    assert.match(story.line, new RegExp(`${who[0].label}在云端邮局${doing[0].label}`), pattern.id);
    assert.match(story.closer, /小泡泡/);
    assert.equal(isAllowedStorySelection(pattern.id, defaultStorySelection(pattern.id)), true);
    assert.equal(isAllowedStorySelection(pattern.id, { who: who[0].id, doing: "invented" }), false);
  }
  assert.equal(storyWhoOptions("unknown").length, 0);
  assert.equal(isAllowedStorySelection("scarf-sprint", { who: "wind-cat" }), false);
});

test("story scenes and effects stay aligned with the saved stage allowlist", () => {
  const sample = composeStory("scarf-sprint", defaultStorySelection("scarf-sprint"), STAGE_SCENE_IDS[0], STAGE_EFFECT_IDS[0]);
  assert.match(sample.line, /星空船舱/);
  assert.match(sample.closer, /金色星光/);
  assert.deepEqual([...STAGE_SCENE_IDS], ["starship-cabin", "cloud-post", "candy-park"]);
  assert.deepEqual([...STAGE_EFFECT_IDS], ["star-trail", "bubble-orbit", "confetti-rain"]);
});

test("completed works can generate a deterministic colorway spot-the-difference puzzle", () => {
  for (const pattern of PATTERNS) {
    const puzzle = buildSpotPuzzle(pattern, pattern.colorways[0].id);
    assert.ok(puzzle, pattern.id);
    assert.equal(puzzle.homeId, pattern.colorways[0].id);
    assert.notEqual(puzzle.otherId, puzzle.homeId);
    assert.equal(puzzle.swapped.length, SPOT_DIFF_COUNT, pattern.id);
    assert.equal(new Set(puzzle.swapped).size, SPOT_DIFF_COUNT, `${pattern.id} unique cells`);
    const cells = pattern.rows.join("").split("");
    const home = pattern.colorways[0];
    const other = pattern.colorways.find(option => option.id === puzzle.otherId);
    for (const index of puzzle.swapped) {
      const symbol = cells[index];
      assert.notEqual(symbol, ".", `${pattern.id} swapped empty`);
      assert.notEqual(home.palette[symbol].color, other.palette[symbol].color, `${pattern.id}:${symbol}`);
    }
    assert.deepEqual(buildSpotPuzzle(pattern, pattern.colorways[0].id)?.swapped, puzzle.swapped);
  }
  assert.match(companionLine("scarf-sprint", "spot", "start"), /队服/);
});

test("child-facing companion and story copy contains no adult finishing recipes", () => {
  assert.doesNotMatch(childPlayContentCorpus(), CHILD_PATTERN_FORBIDDEN);
  assert.doesNotMatch(childPlayContentCorpus(), /https?:\/\//);
});
