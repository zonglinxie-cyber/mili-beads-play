import test from "node:test";
import assert from "node:assert/strict";
import { STORYBOOK_PAGES, STORYBOOK_TITLE } from "../app/storybook.ts";
import { currentStoryPageIndex, isStoryPageUnlocked, storyPatternIds, storyQuestState } from "../app/quest.ts";

test("an empty album starts at the cover and asks to meet the scarf cat", () => {
  const quest = storyQuestState([]);
  assert.equal(quest.currentIndex, 0);
  assert.equal(quest.currentPatternId, "scarf-sprint");
  assert.equal(quest.completedStops, 0);
  assert.equal(quest.allDone, false);
  assert.equal(quest.homeKicker, "故事绘本");
  assert.equal(quest.homeTitle, STORYBOOK_TITLE);
  assert.equal(quest.homeLine, "先认识送信的猫");
  assert.equal(quest.homeCta, "去送信");
  assert.match(quest.craftLabel, /追风围巾猫/);
  assert.equal(isStoryPageUnlocked(0, []), true);
  assert.equal(isStoryPageUnlocked(1, []), true);
  assert.equal(isStoryPageUnlocked(2, []), false);
});

test("finishing the scarf cat advances the book to the moon rabbit", () => {
  const quest = storyQuestState(["scarf-sprint"]);
  assert.equal(currentStoryPageIndex(["scarf-sprint"]), 2);
  assert.equal(quest.currentPatternId, "moon-rabbit");
  assert.equal(quest.currentPage.kicker, "第二站");
  assert.equal(quest.homeKicker, "继续送信");
  assert.match(quest.homeTitle, /月兔认得地址/);
  assert.match(quest.homeLine, /月兔/);
  assert.equal(isStoryPageUnlocked(1, ["scarf-sprint"]), true);
  assert.equal(isStoryPageUnlocked(2, ["scarf-sprint"]), true);
  assert.equal(isStoryPageUnlocked(3, ["scarf-sprint"]), false);
});

test("completing every story pattern enters the review state", () => {
  const ids = storyPatternIds();
  assert.deepEqual(ids[0], "scarf-sprint");
  assert.ok(ids.includes("bow-cat"));
  const quest = storyQuestState(ids);
  assert.equal(quest.allDone, true);
  assert.equal(quest.completedStops, ids.length);
  assert.equal(quest.currentIndex, STORYBOOK_PAGES.length - 1);
  assert.equal(quest.homeKicker, "信送到了");
  assert.equal(quest.homeLine, "去书桌上排队");
  assert.equal(quest.homeCta, "看书桌");
  assert.equal(isStoryPageUnlocked(STORYBOOK_PAGES.length - 1, ids), true);
});
