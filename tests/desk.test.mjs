import test from "node:test";
import assert from "node:assert/strict";
import { DESK_SLOT_COUNT, desksEqual, emptyDesk, sanitizeDesk, seatCompletedWorks, swapDeskSlots } from "../app/desk.ts";

const allowed = (completed = ["scarf-sprint", "moon-rabbit"], drawingIds = ["draw-abc123"]) => ({
  completed,
  drawingIds: new Set(drawingIds),
});

test("completed story works take the first empty seats and ignore duplicates", () => {
  const first = seatCompletedWorks(emptyDesk(), ["scarf-sprint"]);
  assert.deepEqual(first.items, [{ slot: 0, kind: "pattern", id: "scarf-sprint" }]);
  const again = seatCompletedWorks(first, ["scarf-sprint", "moon-rabbit"]);
  assert.deepEqual(again.items, [
    { slot: 0, kind: "pattern", id: "scarf-sprint" },
    { slot: 1, kind: "pattern", id: "moon-rabbit" },
  ]);
  assert.equal(desksEqual(seatCompletedWorks(again, ["moon-rabbit", "scarf-sprint"]), again), true);
});

test("seating stops when the desk is full instead of evicting anyone", () => {
  const ids = Array.from({ length: DESK_SLOT_COUNT + 2 }, (_, index) => `pattern-${index}`);
  const filled = seatCompletedWorks(emptyDesk(), ids);
  assert.equal(filled.items.length, DESK_SLOT_COUNT);
  assert.equal(filled.items.at(-1)?.id, `pattern-${DESK_SLOT_COUNT - 1}`);
});

test("sanitize drops unknown ids, occupied collisions, and out-of-range slots", () => {
  const desk = sanitizeDesk({
    scene: "cloud-post",
    effect: "bubble-orbit",
    items: [
      { slot: 2, kind: "pattern", id: "scarf-sprint" },
      { slot: 2, kind: "pattern", id: "moon-rabbit" },
      { slot: 9, kind: "pattern", id: "moon-rabbit" },
      { slot: 3, kind: "pattern", id: "unknown-cat" },
      { slot: 4, kind: "drawing", id: "draw-abc123" },
      { slot: 5, kind: "drawing", id: "draw-missing" },
      { slot: 1, kind: "prop", id: "scarf-sprint" },
    ],
  }, allowed());
  assert.deepEqual(desk, {
    scene: "cloud-post",
    effect: "bubble-orbit",
    items: [
      { slot: 2, kind: "pattern", id: "scarf-sprint" },
      { slot: 4, kind: "drawing", id: "draw-abc123" },
    ],
  });
  assert.deepEqual(sanitizeDesk({ scene: "uploaded", effect: "script", items: "nope" }, allowed()).scene, "starship-cabin");
  assert.deepEqual(sanitizeDesk(undefined, allowed()), emptyDesk());
});

test("adjacent swap moves a figure into an empty seat without inventing items", () => {
  const desk = { scene: "starship-cabin", effect: "star-trail", items: [{ slot: 1, kind: "pattern", id: "scarf-sprint" }] };
  const moved = swapDeskSlots(desk, 1, 0);
  assert.deepEqual(moved.items, [{ slot: 0, kind: "pattern", id: "scarf-sprint" }]);
  const swapped = swapDeskSlots({
    ...desk,
    items: [
      { slot: 0, kind: "pattern", id: "scarf-sprint" },
      { slot: 1, kind: "pattern", id: "moon-rabbit" },
    ],
  }, 0, 1);
  assert.deepEqual(swapped.items.map(item => item.id), ["moon-rabbit", "scarf-sprint"]);
  assert.deepEqual(swapDeskSlots(desk, 1, 1), desk);
});
