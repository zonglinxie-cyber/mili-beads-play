export const DESK_SLOT_COUNT = 8;

export type DeskItem = {
  slot: number;
  kind: "pattern" | "drawing";
  id: string;
};

export type DeskSave = {
  scene: "starship-cabin" | "cloud-post" | "candy-park";
  effect: "star-trail" | "bubble-orbit" | "confetti-rain";
  items: DeskItem[];
};

export const emptyDesk = (): DeskSave => ({
  scene: "starship-cabin",
  effect: "star-trail",
  items: [],
});

const isSlot = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value < DESK_SLOT_COUNT;

export const sanitizeDesk = (
  raw: unknown,
  allowed: { completed: readonly string[]; drawingIds: ReadonlySet<string> },
): DeskSave => {
  const fallback = emptyDesk();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
  const source = raw as Record<string, unknown>;
  const scene = source.scene === "starship-cabin" || source.scene === "cloud-post" || source.scene === "candy-park"
    ? source.scene
    : fallback.scene;
  const effect = source.effect === "star-trail" || source.effect === "bubble-orbit" || source.effect === "confetti-rain"
    ? source.effect
    : fallback.effect;
  if (!Array.isArray(source.items)) return { scene, effect, items: [] };

  const usedSlots = new Set<number>();
  const usedKeys = new Set<string>();
  const items: DeskItem[] = [];
  for (const entry of source.items) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    if (!isSlot(candidate.slot) || usedSlots.has(candidate.slot)) continue;
    if (candidate.kind !== "pattern" && candidate.kind !== "drawing") continue;
    if (typeof candidate.id !== "string" || !candidate.id) continue;
    const key = `${candidate.kind}:${candidate.id}`;
    if (usedKeys.has(key)) continue;
    if (candidate.kind === "pattern" && !allowed.completed.includes(candidate.id)) continue;
    if (candidate.kind === "drawing" && !allowed.drawingIds.has(candidate.id)) continue;
    usedSlots.add(candidate.slot);
    usedKeys.add(key);
    items.push({ slot: candidate.slot, kind: candidate.kind, id: candidate.id });
  }
  items.sort((left, right) => left.slot - right.slot);
  return { scene, effect, items };
};

export const seatCompletedWorks = (desk: DeskSave, patternIds: readonly string[]): DeskSave => {
  const seated = new Set(desk.items.filter(item => item.kind === "pattern").map(item => item.id));
  const taken = new Set(desk.items.map(item => item.slot));
  const items = [...desk.items];
  for (const id of patternIds) {
    if (seated.has(id)) continue;
    let slot = -1;
    for (let index = 0; index < DESK_SLOT_COUNT; index += 1) {
      if (!taken.has(index)) { slot = index; break; }
    }
    if (slot === -1) break;
    taken.add(slot);
    seated.add(id);
    items.push({ slot, kind: "pattern", id });
  }
  items.sort((left, right) => left.slot - right.slot);
  return { ...desk, items };
};

export const swapDeskSlots = (desk: DeskSave, from: number, to: number): DeskSave => {
  if (!isSlot(from) || !isSlot(to) || from === to) return desk;
  const items = desk.items.map(item => {
    if (item.slot === from) return { ...item, slot: to };
    if (item.slot === to) return { ...item, slot: from };
    return item;
  });
  items.sort((left, right) => left.slot - right.slot);
  return { ...desk, items };
};

export const desksEqual = (left: DeskSave, right: DeskSave) =>
  left.scene === right.scene
  && left.effect === right.effect
  && left.items.length === right.items.length
  && left.items.every((item, index) => {
    const other = right.items[index];
    return item.slot === other.slot && item.kind === other.kind && item.id === other.id;
  });
