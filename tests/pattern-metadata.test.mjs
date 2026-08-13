import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PATTERNS } from "../app/patterns.ts";
import {
  CHILD_PATTERN_FORBIDDEN,
  colorCounts,
  deriveDifficultyAxes,
  formatEstimatedMinutes,
  materialPlan,
  patternPresentation,
} from "../app/pattern-metadata.ts";

test("difficulty axes are deterministic and explain real sources of effort", () => {
  const sample = {
    rows: ["AA.", "AB.", "..C"],
    palette: {
      A: { name: "甲", color: "#111111" },
      B: { name: "乙", color: "#222222" },
      C: { name: "丙", color: "#333333" },
    },
  };
  assert.deepEqual(deriveDifficultyAxes(sample), {
    beads: 5,
    colorChanges: 2,
    pieces: 2,
    articulationPoints: 0,
    symmetry: 2,
    repetition: 2,
  });
  const presentation = patternPresentation(sample);
  assert.ok(presentation.estimatedMinutes[0] < presentation.estimatedMinutes[1]);
  assert.match(presentation.difficultyWhy, /5 颗、3 色、2 处相邻换色/);
  assert.match(formatEstimatedMinutes(presentation.estimatedMinutes), /^预计摆豆 \d+–\d+ 分钟$/);
});

test("material plan states required plus reserve equals recommended for every colour", () => {
  for (const pattern of PATTERNS) {
    const counts = colorCounts(pattern);
    const rows = materialPlan(pattern);
    assert.deepEqual(rows.map(row => row.key).sort(), Object.keys(pattern.palette).sort(), pattern.id);
    for (const row of rows) {
      assert.equal(row.required, counts[row.key], `${pattern.id}:${row.key} required`);
      assert.ok(Number.isInteger(row.reserve) && row.reserve >= 0, `${pattern.id}:${row.key} reserve`);
      assert.equal(row.recommended, row.required + row.reserve, `${pattern.id}:${row.key} equation`);
    }
  }
});

test("child-facing pattern metadata contains no adult finishing recipes", async () => {
  const source = await readFile(new URL("../app/patterns.ts", import.meta.url), "utf8");
  // This intentionally fails until the v13 catalog replaces the unsafe legacy
  // metadata. Do not weaken this test to make the old rows appear acceptable.
  assert.doesNotMatch(source, /recommendedUse\s*:|minutes\s*:|spareBeads\s*:/, "legacy metadata must be removed, not hidden in UI");
  for (const pattern of PATTERNS) {
    const childContent = [
      pattern.playIdea,
      pattern.skillTip,
      ...(pattern.assemblyNotes ?? []),
      pattern.childFinishLine,
    ].filter(Boolean).join("\n");
    assert.doesNotMatch(childContent, CHILD_PATTERN_FORBIDDEN, pattern.id);
    assert.match(pattern.childFinishLine ?? "", /拼好后请大人帮忙/, `${pattern.id} child finish line`);
    assert.ok(pattern.estimatedMinutes && pattern.estimatedMinutes[0] < pattern.estimatedMinutes[1], `${pattern.id} honest range`);
    assert.deepEqual(pattern.difficultyAxes, deriveDifficultyAxes(pattern), `${pattern.id} difficulty axes`);
    assert.ok(pattern.difficultyLabel?.trim() && pattern.difficultyWhy?.trim(), `${pattern.id} difficulty explanation`);
    assert.ok(pattern.playIdea?.trim(), `${pattern.id} play idea`);
    assert.deepEqual(Object.keys(pattern.reserveByColor ?? {}).sort(), Object.keys(pattern.palette).sort(), `${pattern.id} reserves cover colours`);
  }
});

test("kids flow and posters state the child/adult boundary without universal recipes", async () => {
  const [page, privacy, support] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy-content.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/support/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /你只负责摆豆/);
  assert.match(page, /孩子只负责摆豆/);
  assert.match(page, /家长按所用品牌说明操作并先试做/);
  assert.match(privacy, /孩子只负责按图摆豆/);
  assert.match(privacy, /所用拼豆品牌的官方说明/);
  assert.match(support, /孩子只负责按图摆豆/);
  assert.doesNotMatch([page, privacy, support].join("\n"), /\d+\s*°|\d+\s*℃|\d+\s*秒/);
});
