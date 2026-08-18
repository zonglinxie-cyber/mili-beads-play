import test from "node:test";
import assert from "node:assert/strict";
import { PATTERNS, ADVANCED_PATTERNS } from "../app/patterns.ts";
import { CHILD_PATTERN_FORBIDDEN } from "../app/pattern-metadata.ts";
import {
  ATTUNE_COST,
  MIX_COST,
  buildVoyageWorld,
  canMixColors,
  childVoyageCorpus,
  colorFamily,
  constraintLine,
  createVoyageRun,
  currentGoalIndex,
  isGapCell,
  voyageTask,
  neighborsOf,
  reduceVoyage,
  sanitizeVoyageRun,
  sanitizeVoyages,
  voyageComplete,
  voyageHint,
  voyageProgress,
  voyageSeedFor,
  weatherLine,
} from "../app/voyage.ts";

const tiny = {
  id: "tiny-isles",
  name: "测试双岛",
  rows: [
    "RRR...",
    "R.R.BB",
    "RRR.BB",
    "....BB",
    "YYY.BB",
    "YYY...",
  ],
  palette: {
    R: { name: "草莓红", color: "#e05040" },
    B: { name: "湖水蓝", color: "#5b8fd6" },
    Y: { name: "星光黄", color: "#f5c95d" },
  },
};

const refill = (run) => ({
  ...run,
  lantern: 12,
  charges: Object.fromEntries(Object.keys(run.charges).map(key => [key, 6])),
});

test("color families split warm, cool, soft and ink", () => {
  assert.equal(colorFamily("#e05040"), "warm");
  assert.equal(colorFamily("#5b8fd6"), "cool");
  assert.equal(colorFamily("#fff5df"), "soft");
  assert.equal(colorFamily("#29283b"), "ink");
});

test("every catalog pattern becomes a connected-enough night map", () => {
  for (const pattern of [...PATTERNS, ...ADVANCED_PATTERNS]) {
    const world = buildVoyageWorld(pattern, voyageSeedFor(pattern.id, "2026-08-18"));
    const run = createVoyageRun(world);
    assert.equal(world.patternId, pattern.id);
    assert.ok(world.cells[world.start] !== ".", pattern.id);
    assert.ok(world.letters.length >= 1, pattern.id);
    assert.ok(world.stamps.length >= 1, pattern.id);
    assert.equal(world.seed, ` ${pattern.id}:2026-08-18`.trim());
    assert.match(weatherLine(world), /今晚/);
    assert.ok(voyageHint(world, run).length >= 6, pattern.id);
    const progress = voyageProgress(world, run);
    assert.equal(progress.complete, false);
    assert.equal(progress.letterTotal, world.letters.length);
    const again = buildVoyageWorld(pattern, world.seed);
    assert.deepEqual(again.letters.map(item => item.id), world.letters.map(item => item.id));
    assert.deepEqual(again.stamps.map(item => item.index), world.stamps.map(item => item.index));
    assert.equal(constraintLine(world, world.letters[0].constraint).length > 4, true);
  }
});

test("tiny islands generate a mixable gap between the red and blue shores", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  assert.equal(world.width, 6);
  assert.equal(world.height, 6);
  const run = createVoyageRun(world);
  const gaps = world.cells.flatMap((cell, index) => cell === "." && isGapCell(world, run, index) ? [index] : []);
  assert.ok(gaps.includes(9), `expected gap at row1 col3, got ${gaps.join(",")}`);
  assert.equal(canMixColors(world, "R", "B"), true);
  assert.equal(canMixColors(world, "R", "R"), false);
});

test("a courier can only step to an orthogonal neighbor", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const run = createVoyageRun(world);
  const far = run.position === 0 ? 2 : 0;
  const blocked = reduceVoyage(world, run, { type: "step", index: far });
  assert.equal(blocked.kind, "block");
  assert.equal(blocked.run.position, run.position);
  const near = neighborsOf(run.position, world.width, world.height).find(index => world.cells[index] !== ".");
  assert.ok(near !== undefined);
  const moved = reduceVoyage(world, run, { type: "step", index: near });
  assert.equal(moved.run.position, near);
  assert.equal(moved.run.steps, 1);
  assert.ok(moved.run.visited.includes(near));
});

test("charges grow faster when the courier follows one color river", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  let run = createVoyageRun(world);
  run = { ...run, position: 0, streakColor: null, streakLen: 0, charges: { R: 0, B: 0, Y: 0 }, lantern: 12 };
  const first = reduceVoyage(world, run, { type: "step", index: 1 });
  const second = reduceVoyage(world, first.run, { type: "step", index: 2 });
  assert.ok(second.run.charges.R > first.run.charges.R);
  assert.ok(second.run.streakLen >= 2);
});

test("attune spends three matching charges and mix spends two of each color", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  assert.ok(world.stamps.length >= 1);
  const start = createVoyageRun(world);
  const stamp = world.stamps[0];
  const poor = reduceVoyage(world, { ...start, position: stamp.index, charges: { R: 1, B: 1, Y: 1 } }, { type: "attune" });
  assert.equal(poor.kind, "block");
  const rich = reduceVoyage(world, refill({ ...start, position: stamp.index }), { type: "attune" });
  assert.equal(rich.run.stamps.includes(stamp.id), true);
  assert.equal(rich.run.charges[stamp.color], 6 - ATTUNE_COST);

  const mixed = reduceVoyage(world, refill({ ...start, position: 8, mixA: "R", mixB: "B" }), { type: "bridge", index: 9 });
  assert.equal(mixed.run.ghosts.includes(9), true);
  assert.equal(mixed.run.charges.R, 6 - MIX_COST);
  assert.equal(mixed.run.charges.B, 6 - MIX_COST);
  const crossed = reduceVoyage(world, mixed.run, { type: "step", index: 9 });
  assert.equal(crossed.run.position, 9);
});

test("an avoid letter returns home when the forbidden color is stepped on", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const letter = { id: "mail-0", from: 0, to: 1, fromName: "红岸", toName: "邻格", constraint: { kind: "avoid", color: "B" } };
  const patched = { ...world, letters: [letter] };
  const ready = {
    ...createVoyageRun(patched),
    position: 0,
    carrying: "mail-0",
    carryTouched: ["R", "B"],
    lantern: 12,
  };
  const bounced = reduceVoyage(patched, ready, { type: "step", index: 1 });
  assert.equal(bounced.run.position, 1);
  assert.equal(bounced.run.carrying, null);
  assert.equal(bounced.run.letters.includes("mail-0"), false);
  assert.match(bounced.message, /飞回去|踩到/);
});

test("a clean avoid letter can be delivered and a need-stamp letter waits for the seal", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  assert.ok(world.stamps.length >= 1);
  const stamp = world.stamps[0];
  const avoid = { id: "mail-0", from: 0, to: 1, fromName: "红岸", toName: "邻格", constraint: { kind: "avoid", color: "B" } };
  const locked = { id: "mail-1", from: 1, to: 2, fromName: "邻格", toName: "更远", constraint: { kind: "need-stamp", stampId: stamp.id } };
  const patched = { ...world, letters: [avoid, locked] };
  const delivered = reduceVoyage(patched, {
    ...createVoyageRun(patched),
    position: 0,
    carrying: "mail-0",
    carryTouched: ["R"],
    lantern: 12,
  }, { type: "step", index: 1 });
  assert.equal(delivered.run.letters.includes("mail-0"), true);
  const denied = reduceVoyage(patched, { ...delivered.run, carrying: "mail-1", position: 1, stamps: [], carryTouched: ["R"] }, { type: "step", index: 2 });
  assert.equal(denied.run.letters.includes("mail-1"), false);
  assert.match(denied.message, /印章/);
  const sealed = reduceVoyage(patched, { ...delivered.run, carrying: "mail-1", position: 1, stamps: [stamp.id], carryTouched: ["R"] }, { type: "step", index: 2 });
  assert.equal(sealed.run.letters.includes("mail-1"), true);
});

test("riddle rewards the right color and ignores the wrong one", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const riddle = world.encounters.find(item => item.kind === "riddle");
  assert.ok(riddle?.answerColor);
  const run = { ...createVoyageRun(world), position: riddle.index, lantern: 4, charges: { R: 0, B: 0, Y: 0 } };
  const miss = reduceVoyage(world, run, { type: "answer", color: riddle.answerColor === "R" ? "B" : "R" });
  assert.equal(miss.kind, "soft");
  assert.equal(miss.run.encounters.includes(riddle.id), false);
  const hit = reduceVoyage(world, run, { type: "answer", color: riddle.answerColor });
  assert.equal(hit.run.encounters.includes(riddle.id), true);
  assert.ok(hit.run.lantern > run.lantern);
  assert.ok(hit.run.charges[riddle.answerColor] >= 2);
});

test("collecting every letter and stamp marks the night map complete", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const run = {
    ...createVoyageRun(world),
    letters: world.letters.map(item => item.id),
    stamps: world.stamps.map(item => item.id),
  };
  assert.equal(voyageComplete(world, run), true);
  const result = reduceVoyage(world, { ...run, letters: world.letters.map(item => item.id).slice(0, -1), carrying: world.letters.at(-1).id, position: world.letters.at(-1).from, lantern: 12, stamps: world.stamps.map(item => item.id), carryTouched: [], carryWindSteps: 8, carryPassedGlow: true, charges: { R: 6, B: 6, Y: 6 } }, { type: "step", index: world.letters.at(-1).to });
  if (neighborsOf(world.letters.at(-1).from, world.width, world.height).includes(world.letters.at(-1).to)) {
    assert.equal(result.kind === "win" || result.run.letters.length === world.letters.length, true);
  }
});

test("sanitize drops foreign ids and rebuilds a walkable courier", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const raw = {
    patternId: tiny.id,
    seed: world.seed,
    colorwayId: "classic",
    position: 999,
    visited: [0, "no", -1],
    ghosts: [9, 0],
    charges: { R: 99, Z: 3 },
    lantern: 80,
    lastGlow: 0,
    stamps: ["stamp-0", "invented"],
    letters: ["mail-0"],
    carrying: "mail-0",
    carryTouched: ["R", "nope"],
    carryWindSteps: -3,
    carryPassedGlow: true,
    encounters: ["enc-riddle"],
    steps: 4,
    mixA: "R",
    mixB: "ghost",
    streakColor: "R",
    streakLen: 2,
    complete: false,
  };
  const clean = sanitizeVoyageRun(raw, world);
  assert.ok(clean);
  assert.equal(clean.position, world.start);
  assert.deepEqual(clean.ghosts, [9]);
  assert.equal(clean.charges.R, 6);
  assert.equal(clean.charges.Z, undefined);
  assert.ok(clean.lantern <= 9);
  assert.deepEqual(clean.stamps, world.stamps[0] ? ["stamp-0"] : []);
  assert.equal(clean.carrying, null);
  assert.equal(clean.mixB, null);
  const bag = sanitizeVoyages({ [tiny.id]: raw, "unknown": raw }, [tiny]);
  assert.ok(bag[tiny.id]);
  assert.equal(bag.unknown, undefined);
});

test("child-facing voyage copy stays free of adult finishing recipes", () => {
  assert.doesNotMatch(childVoyageCorpus(), CHILD_PATTERN_FORBIDDEN);
  assert.doesNotMatch(childVoyageCorpus(), /https?:\/\//);
  for (const pattern of PATTERNS.slice(0, 3)) {
    const world = buildVoyageWorld(pattern, voyageSeedFor(pattern.id, "2026-08-18"));
    const run = createVoyageRun(world);
    const text = [weatherLine(world), voyageHint(world, run), ...world.letters.map(item => constraintLine(world, item.constraint)), ...world.encounters.map(item => item.prompt)].join("\n");
    assert.doesNotMatch(text, CHILD_PATTERN_FORBIDDEN);
  }
});

test("current goal prefers the carried letter destination", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const letter = world.letters[0];
  const run = { ...createVoyageRun(world), carrying: letter.id };
  assert.equal(currentGoalIndex(world, run), letter.to);
});

test("the coach task tells the courier the next tap in plain words", () => {
  const world = buildVoyageWorld(tiny, voyageSeedFor(tiny.id, "2026-08-18"));
  const start = createVoyageRun(world);
  const task = voyageTask(world, start);
  assert.ok(task.title.length >= 2);
  assert.match(task.how, /信|印|走|圈/);
  if (task.action === "walk" && task.nextIndex !== null) {
    assert.ok(neighborsOf(start.position, world.width, world.height).includes(task.nextIndex));
  }
  const onStamp = { ...start, position: world.stamps[0].index, stamps: [] };
  assert.equal(voyageTask(world, onStamp).action, "attune");
  assert.match(voyageTask(world, onStamp).how, /印章/);
});
