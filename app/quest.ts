import { STORYBOOK_PAGES, STORYBOOK_TITLE, storybookPattern, type StoryPage } from "./storybook.ts";

export type StoryQuestState = {
  currentIndex: number;
  currentPage: StoryPage;
  currentPatternId: string;
  currentName: string;
  completedStops: number;
  totalStops: number;
  allDone: boolean;
  homeKicker: string;
  homeTitle: string;
  homeLine: string;
  homeCta: string;
  craftLabel: string;
};

/** First-seen story pattern ids, in book order. Cover and station 1 share scarf-sprint. */
export const storyPatternIds = (): string[] => {
  const ids: string[] = [];
  for (const page of STORYBOOK_PAGES) {
    if (!ids.includes(page.patternId)) ids.push(page.patternId);
  }
  return ids;
};

export const isStoryPattern = (patternId: string) => storyPatternIds().includes(patternId);

export const currentStoryPageIndex = (completed: readonly string[]) => {
  const index = STORYBOOK_PAGES.findIndex(page => !completed.includes(page.patternId));
  return index === -1 ? STORYBOOK_PAGES.length - 1 : index;
};

export const isStoryPageUnlocked = (index: number, completed: readonly string[]) => {
  if (index < 0 || index >= STORYBOOK_PAGES.length) return false;
  const currentIndex = currentStoryPageIndex(completed);
  const page = STORYBOOK_PAGES[index];
  const currentPatternId = STORYBOOK_PAGES[currentIndex].patternId;
  return index <= currentIndex || page.patternId === currentPatternId || completed.includes(page.patternId);
};

export const storyQuestState = (completed: readonly string[]): StoryQuestState => {
  const ids = storyPatternIds();
  const completedStops = ids.filter(id => completed.includes(id)).length;
  const allDone = completedStops === ids.length;
  const currentIndex = currentStoryPageIndex(completed);
  const currentPage = STORYBOOK_PAGES[currentIndex];
  const currentPatternId = currentPage.patternId;
  const currentName = storybookPattern(currentPatternId).name;
  const craftLabel = completed.includes(currentPatternId) ? `去书桌上找${currentName}` : `去拼出${currentName}`;

  if (allDone) {
    return {
      currentIndex,
      currentPage,
      currentPatternId,
      currentName,
      completedStops,
      totalStops: ids.length,
      allDone,
      homeKicker: "信送到了",
      homeTitle: STORYBOOK_TITLE,
      homeLine: "去书桌上排队",
      homeCta: "看书桌",
      craftLabel,
    };
  }

  if (completedStops === 0) {
    return {
      currentIndex,
      currentPage,
      currentPatternId,
      currentName,
      completedStops,
      totalStops: ids.length,
      allDone,
      homeKicker: "故事绘本",
      homeTitle: STORYBOOK_TITLE,
      homeLine: "先认识送信的猫",
      homeCta: "去送信",
      craftLabel,
    };
  }

  return {
    currentIndex,
    currentPage,
    currentPatternId,
    currentName,
    completedStops,
    totalStops: ids.length,
    allDone,
    homeKicker: "继续送信",
    homeTitle: `${currentPage.kicker} · ${currentPage.title}`,
    homeLine: `拼出${currentName}，信才能往下走`,
    homeCta: "打开读",
    craftLabel,
  };
};
