export type VoyageSource = {
  id: string;
  name: string;
  rows: string[];
  palette: Record<string, { name: string; color: string }>;
  advanced?: boolean;
};

export type ColorFamily = "warm" | "cool" | "soft" | "ink";
export type WindDir = 0 | 1 | 2 | 3;
export type MoonPhase = 0 | 1 | 2 | 3;

export type VoyageConstraint =
  | { kind: "avoid"; color: string }
  | { kind: "need-stamp"; stampId: string }
  | { kind: "min-charge"; color: string; amount: number }
  | { kind: "pass-glow" }
  | { kind: "wind-ride"; steps: number };

export type VoyageLetter = {
  id: string;
  from: number;
  to: number;
  fromName: string;
  toName: string;
  constraint: VoyageConstraint;
};

export type VoyageStamp = {
  id: string;
  index: number;
  color: string;
};

export type VoyageEncounter = {
  id: string;
  index: number;
  kind: "riddle" | "rest" | "friend";
  prompt: string;
  answerColor?: string;
};

export type VoyageNeighborhood = {
  id: number;
  color: string;
  cells: number[];
  centroid: number;
  name: string;
};

export type VoyageWeather = {
  wind: WindDir;
  moon: MoonPhase;
  tideColor: string | null;
};

export type VoyageWorld = {
  patternId: string;
  name: string;
  width: number;
  height: number;
  cells: string[];
  palette: Record<string, { name: string; color: string }>;
  families: Record<string, ColorFamily>;
  start: number;
  neighborhoods: VoyageNeighborhood[];
  stamps: VoyageStamp[];
  letters: VoyageLetter[];
  encounters: VoyageEncounter[];
  bridges: number[];
  glow: number[];
  weather: VoyageWeather;
  seed: string;
};

export type VoyageRun = {
  patternId: string;
  seed: string;
  colorwayId: string;
  position: number;
  visited: number[];
  ghosts: number[];
  charges: Record<string, number>;
  lantern: number;
  lastGlow: number;
  stamps: string[];
  letters: string[];
  carrying: string | null;
  carryTouched: string[];
  carryWindSteps: number;
  carryPassedGlow: boolean;
  encounters: string[];
  steps: number;
  mixA: string | null;
  mixB: string | null;
  streakColor: string | null;
  streakLen: number;
  complete: boolean;
};

export type VoyageAction =
  | { type: "step"; index: number }
  | { type: "attune" }
  | { type: "select-mix"; slot: "a" | "b"; color: string | null }
  | { type: "bridge"; index: number }
  | { type: "burst" }
  | { type: "answer"; color: string };

export type VoyageKind = "ok" | "block" | "soft" | "win";

export type VoyageResult = {
  run: VoyageRun;
  message: string;
  kind: VoyageKind;
};

export const VOYAGE_VIEW = 7;
export const CHARGE_CAP = 6;
export const ATTUNE_COST = 3;
export const MIX_COST = 2;
export const BURST_COST = 2;
export const WIND_LABELS = ["北风", "东风", "南风", "西风"] as const;
export const MOON_LABELS = ["新月", "月牙", "半月", "满月"] as const;
export const DIR_LABELS = ["上", "右", "下", "左"] as const;

const hashSeed = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return hash >>> 0;
};

const makeRng = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const seededShuffle = <T,>(items: T[], seed: number) => {
  const next = [...items];
  const random = makeRng(seed);
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
};

const parseHex = (hex: string) => {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.split("").map(part => `${part}${part}`).join("") : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return { r: 80, g: 80, b: 80 };
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
};

export const colorFamily = (hex: string): ColorFamily => {
  const { r, g, b } = parseHex(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 30 && max < 90) return "ink";
  if (max - min < 42 && max > 178) return "soft";
  if (r >= g && r >= b) return "warm";
  if (b >= r && b >= g) return "cool";
  return r > b ? "warm" : "cool";
};

export const colorWarmth = (hex: string) => {
  const { r, b } = parseHex(hex);
  return r - b;
};

export const todayVoyageDay = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const voyageSeedFor = (patternId: string, day = todayVoyageDay()) => `${patternId}:${day}`;

export const neighborsOf = (index: number, width: number, height: number) => {
  const x = index % width;
  const y = Math.floor(index / width);
  const next: number[] = [];
  if (y > 0) next.push(index - width);
  if (x + 1 < width) next.push(index + 1);
  if (y + 1 < height) next.push(index + width);
  if (x > 0) next.push(index - 1);
  return next;
};

export const directionBetween = (from: number, to: number, width: number): WindDir | null => {
  if (to === from - width) return 0;
  if (to === from + 1 && Math.floor(to / width) === Math.floor(from / width)) return 1;
  if (to === from + width) return 2;
  if (to === from - 1 && Math.floor(to / width) === Math.floor(from / width)) return 3;
  return null;
};

const walkableSet = (world: VoyageWorld, run: VoyageRun) => {
  const open = new Set<number>();
  world.cells.forEach((cell, index) => { if (cell !== ".") open.add(index); });
  for (const ghost of run.ghosts) if (ghost >= 0 && ghost < world.cells.length) open.add(ghost);
  return open;
};

export const isGlowCell = (world: VoyageWorld, index: number) => world.glow.includes(index);

export const lanternMax = (world: VoyageWorld) => 6 + world.weather.moon;

export const visionRadius = (world: VoyageWorld, run: VoyageRun) => {
  const warmCharge = Object.entries(run.charges).reduce((sum, [key, value]) => (
    world.families[key] === "warm" ? sum + value : sum
  ), 0);
  return 1 + world.weather.moon + (warmCharge >= 4 ? 1 : 0);
};

export const manhattan = (a: number, b: number, width: number) => {
  const ax = a % width;
  const ay = Math.floor(a / width);
  const bx = b % width;
  const by = Math.floor(b / width);
  return Math.abs(ax - bx) + Math.abs(ay - by);
};

export const visibleCells = (world: VoyageWorld, run: VoyageRun) => {
  const radius = visionRadius(world, run);
  const seen = new Set(run.visited);
  for (let index = 0; index < world.cells.length; index += 1) {
    if (manhattan(run.position, index, world.width) <= radius) seen.add(index);
  }
  return seen;
};

export const viewportOrigin = (world: VoyageWorld, run: VoyageRun, size = VOYAGE_VIEW) => {
  const row = Math.floor(run.position / world.width);
  const col = run.position % world.width;
  const originRow = Math.max(0, Math.min(Math.max(0, world.height - size), row - Math.floor(size / 2)));
  const originCol = Math.max(0, Math.min(Math.max(0, world.width - size), col - Math.floor(size / 2)));
  return { row: originRow, col: originCol };
};

const colorName = (world: VoyageWorld, key: string) => world.palette[key]?.name ?? "这种颜色";

const districtName = (width: number, height: number, centroid: number, name: string) => {
  const x = centroid % width;
  const y = Math.floor(centroid / width);
  const ns = y < height / 3 ? "北" : y > (height * 2) / 3 ? "南" : "中";
  const ew = x < width / 3 ? "西" : x > (width * 2) / 3 ? "东" : "";
  return `${ns}${ew}的${name}区`;
};

const centroidOf = (cells: number[], width: number) => {
  const meanX = cells.reduce((sum, index) => sum + (index % width), 0) / cells.length;
  const meanY = cells.reduce((sum, index) => sum + Math.floor(index / width), 0) / cells.length;
  return cells.reduce((best, index) => {
    const dx = (index % width) - meanX;
    const dy = Math.floor(index / width) - meanY;
    const score = dx * dx + dy * dy;
    if (!best || score < best.score) return { index, score };
    return best;
  }, null as { index: number; score: number } | null)!.index;
};

const componentsOf = (cells: string[], width: number, height: number, sameColor: boolean) => {
  const seen = new Set<number>();
  const groups: number[][] = [];
  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index] === "." || seen.has(index)) continue;
    const color = cells[index];
    const stack = [index];
    const group = [index];
    seen.add(index);
    while (stack.length) {
      const current = stack.pop()!;
      for (const next of neighborsOf(current, width, height)) {
        if (seen.has(next) || cells[next] === ".") continue;
        if (sameColor && cells[next] !== color) continue;
        seen.add(next);
        stack.push(next);
        group.push(next);
      }
    }
    groups.push(group);
  }
  return groups;
};

const articulationPoints = (cells: string[], width: number, height: number) => {
  const nodes = cells.flatMap((cell, index) => cell === "." ? [] : [index]);
  const nodeSet = new Set(nodes);
  const adjacent = (index: number) => neighborsOf(index, width, height).filter(next => nodeSet.has(next));
  let clock = 0;
  const discovered = new Map<number, number>();
  const low = new Map<number, number>();
  const points = new Set<number>();
  const visit = (node: number, parent: number | null) => {
    clock += 1;
    discovered.set(node, clock);
    low.set(node, clock);
    let children = 0;
    for (const neighbor of adjacent(node)) {
      if (!discovered.has(neighbor)) {
        children += 1;
        visit(neighbor, node);
        low.set(node, Math.min(low.get(node)!, low.get(neighbor)!));
        if (parent === null ? children > 1 : low.get(neighbor)! >= discovered.get(node)!) points.add(node);
      } else if (neighbor !== parent) low.set(node, Math.min(low.get(node)!, discovered.get(neighbor)!));
    }
  };
  for (const node of nodes) if (!discovered.has(node)) visit(node, null);
  return [...points];
};

const spatialRegions = (nodes: number[], width: number, height: number) => {
  if (nodes.length < 6) return [nodes];
  const split = (items: number[], axis: "x" | "y") => {
    const values = items.map(index => axis === "x" ? index % width : Math.floor(index / width)).sort((a, b) => a - b);
    const mid = values[Math.floor(values.length / 2)];
    const left = items.filter(index => (axis === "x" ? index % width : Math.floor(index / width)) < mid);
    const right = items.filter(index => (axis === "x" ? index % width : Math.floor(index / width)) >= mid);
    return left.length >= 3 && right.length >= 3 ? [left, right] : [items];
  };
  let groups = split(nodes, width >= height ? "x" : "y");
  if (groups.length === 1) groups = split(nodes, width >= height ? "y" : "x");
  if (groups.length === 2) {
    const extra: number[][] = [];
    for (const group of groups) extra.push(...(group.length >= 8 ? split(group, "y") : [group]));
    groups = extra;
  }
  return groups;
};

const bfsPath = (from: number, to: number, open: Set<number>, width: number, height: number) => {
  if (!open.has(from) || !open.has(to)) return null;
  if (from === to) return [from];
  const queue = [from];
  const prev = new Map<number, number>([[from, -1]]);
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head];
    for (const next of neighborsOf(current, width, height)) {
      if (!open.has(next) || prev.has(next)) continue;
      prev.set(next, current);
      if (next === to) {
        const path = [to];
        let walk = to;
        while (prev.get(walk) !== -1) {
          walk = prev.get(walk)!;
          path.push(walk);
        }
        return path.reverse();
      }
      queue.push(next);
    }
  }
  return null;
};

const mostUsedColor = (cells: string[]) => {
  const counts: Record<string, number> = {};
  for (const cell of cells) if (cell !== ".") counts[cell] = (counts[cell] ?? 0) + 1;
  return Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0];
};

const edgeColor = (cells: string[], width: number, height: number) => {
  const counts: Record<string, number> = {};
  cells.forEach((cell, index) => {
    if (cell === ".") return;
    if (neighborsOf(index, width, height).some(next => cells[next] === ".")) counts[cell] = (counts[cell] ?? 0) + 1;
  });
  return Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0];
};

const warmestColor = (palette: VoyageSource["palette"]) =>
  Object.entries(palette).sort((left, right) => colorWarmth(right[1].color) - colorWarmth(left[1].color) || left[0].localeCompare(right[0]))[0]?.[0];

const pickWeather = (source: VoyageSource, seed: number): VoyageWeather => {
  const keys = Object.keys(source.palette);
  const wind = (seed % 4) as WindDir;
  const moon = (Math.floor(seed / 7) % 4) as MoonPhase;
  const cool = keys.filter(key => colorFamily(source.palette[key].color) === "cool");
  const tideColor = cool.length && seed % 3 === 1 ? cool[seed % cool.length] : null;
  return { wind, moon, tideColor };
};

export const canMixColors = (world: VoyageWorld, a: string, b: string) => {
  if (!a || !b || a === b) return false;
  if (!world.palette[a] || !world.palette[b]) return false;
  const familyA = world.families[a];
  const familyB = world.families[b];
  if (familyA === "ink" && familyB === "ink") return false;
  return familyA !== familyB || familyA === "soft" || familyB === "soft";
};

export const isGapCell = (world: VoyageWorld, run: VoyageRun, index: number) => {
  if (index < 0 || index >= world.cells.length) return false;
  if (world.cells[index] !== "." || run.ghosts.includes(index)) return false;
  const open = walkableSet(world, run);
  return neighborsOf(index, world.width, world.height).filter(next => open.has(next)).length >= 2;
};

export const stepCost = (world: VoyageWorld, run: VoyageRun, from: number, to: number) => {
  const dir = directionBetween(from, to, world.width);
  let cost = 1;
  if (dir !== null && dir === (world.weather.wind + 2) % 4) cost += 1;
  const symbol = world.cells[to];
  if (symbol !== "." && symbol === world.weather.tideColor && !run.stamps.some(id => world.stamps.find(stamp => stamp.id === id)?.color === symbol)) {
    cost += 1;
  }
  if (world.bridges.includes(to) && run.stamps.length === 0) cost += 1;
  return cost;
};

export const constraintLine = (world: VoyageWorld, constraint: VoyageConstraint) => {
  if (constraint.kind === "avoid") return `走路时别踩${colorName(world, constraint.color)}`;
  if (constraint.kind === "need-stamp") {
    const stamp = world.stamps.find(item => item.id === constraint.stampId);
    return `先拿到${stamp ? colorName(world, stamp.color) : ""}印章才能送到`;
  }
  if (constraint.kind === "min-charge") return `送到前把${colorName(world, constraint.color)}攒到${constraint.amount}点`;
  if (constraint.kind === "pass-glow") return "路上要经过一颗会亮的豆子";
  return `顺着风走${constraint.steps}步`;
};

export const weatherLine = (world: VoyageWorld) => {
  const tide = world.weather.tideColor ? ` · 潮色是${colorName(world, world.weather.tideColor)}` : "";
  return `今晚${WIND_LABELS[world.weather.wind]}，${MOON_LABELS[world.weather.moon]}${tide}`;
};

const buildNeighborhoods = (source: VoyageSource, cells: string[], width: number, height: number) => {
  const colorGroups = componentsOf(cells, width, height, true).filter(group => group.length >= 4);
  const regions = colorGroups.length >= 2
    ? colorGroups
    : spatialRegions(cells.flatMap((cell, index) => cell === "." ? [] : [index]), width, height);
  return regions.map((group, id) => {
    const color = mostUsedColor(group.map(index => cells[index])) ?? cells[group[0]];
    const centroid = centroidOf(group, width);
    return {
      id,
      color,
      cells: group,
      centroid,
      name: districtName(width, height, centroid, source.palette[color]?.name ?? "豆子"),
    };
  });
};

const synthesizeStamps = (cells: string[], width: number, height: number, seed: number, avoid: Set<number>) => {
  const small = componentsOf(cells, width, height, true).filter(group => group.length > 0 && group.length <= 3);
  const scored = cells.flatMap((cell, index) => {
    if (cell === ".") return [];
    const same = neighborsOf(index, width, height).filter(next => cells[next] === cell).length;
    return [{ index, same, color: cell }];
  });
  const seen = new Set<number>();
  const pool: number[] = [];
  const take = (index: number) => {
    if (seen.has(index) || cells[index] === ".") return;
    seen.add(index);
    pool.push(index);
  };
  for (const group of seededShuffle(small, seed)) {
    const pick = group.find(index => !avoid.has(index)) ?? group[0];
    take(pick);
  }
  const tips = seededShuffle(scored, seed ^ 0x51ed).sort((left, right) => left.same - right.same || left.index - right.index);
  for (const item of tips) {
    if (pool.length >= 3) break;
    if (avoid.has(item.index) && pool.length) continue;
    take(item.index);
  }
  if (pool.length < 2) {
    for (const item of seededShuffle(scored.filter(entry => !avoid.has(entry.index)), seed ^ 19)) {
      if (pool.length >= 2) break;
      take(item.index);
    }
  }
  return pool.slice(0, 3).map((index, order) => ({ id: `stamp-${order}`, index, color: cells[index] }));
};

const pickConstraint = (
  worldLike: Pick<VoyageWorld, "cells" | "palette" | "glow" | "stamps" | "width" | "height">,
  from: number,
  to: number,
  slot: number,
  seed: number,
): VoyageConstraint => {
  const open = new Set(worldLike.cells.flatMap((cell, index) => cell === "." ? [] : [index]));
  const path = bfsPath(from, to, open, worldLike.width, worldLike.height) ?? [from, to];
  const pathColors = [...new Set(path.map(index => worldLike.cells[index]).filter(cell => cell !== "."))];
  const avoidColor = pathColors.find(color => color !== worldLike.cells[from] && color !== worldLike.cells[to]) ?? mostUsedColor(worldLike.cells);
  const kinds: VoyageConstraint[] = [];
  if (avoidColor) kinds.push({ kind: "avoid", color: avoidColor });
  if (worldLike.stamps[0]) kinds.push({ kind: "need-stamp", stampId: worldLike.stamps[0].id });
  const chargeColor = worldLike.cells[from] !== "." ? worldLike.cells[from] : Object.keys(worldLike.palette)[0];
  if (chargeColor) kinds.push({ kind: "min-charge", color: chargeColor, amount: 2 });
  if (worldLike.glow.length) kinds.push({ kind: "pass-glow" });
  kinds.push({ kind: "wind-ride", steps: 2 });
  return kinds[(seed + slot * 17) % kinds.length];
};

export const buildVoyageWorld = (source: VoyageSource, seed = voyageSeedFor(source.id)): VoyageWorld => {
  const width = source.rows[0]?.length ?? 0;
  const height = source.rows.length;
  const cells = source.rows.join("").split("");
  if (!width || cells.length !== width * height) throw new Error(`voyage grid broken: ${source.id}`);
  const families = Object.fromEntries(Object.entries(source.palette).map(([key, value]) => [key, colorFamily(value.color)]));
  const numericSeed = hashSeed(seed);
  const weather = pickWeather(source, numericSeed);
  const glow = cells.flatMap((cell, index) => {
    if (cell === ".") return [];
    const family = families[cell];
    return family === "warm" || family === "soft" ? [index] : [];
  });
  const neighborhoods = buildNeighborhoods(source, cells, width, height);
  const startPool = [...neighborhoods].sort((left, right) => right.cells.length - left.cells.length)[0]?.cells ?? cells.flatMap((cell, index) => cell === "." ? [] : [index]);
  const start = startPool.slice().sort((left, right) => Math.floor(left / width) - Math.floor(right / width) || (left % width) - (right % width))[0] ?? cells.findIndex(cell => cell !== ".");
  const bridges = articulationPoints(cells, width, height);
  const reserved = new Set<number>([start, ...neighborhoods.map(item => item.centroid)]);
  const stamps = synthesizeStamps(cells, width, height, numericSeed, reserved);
  const letterCount = source.advanced || neighborhoods.length >= 4 ? 3 : 2;
  const pairSource = neighborhoods.length >= 2
    ? neighborhoods
    : [{ id: 0, color: cells[start], cells: startPool, centroid: start, name: "起点" }, { id: 1, color: cells[start], cells: startPool, centroid: startPool[startPool.length - 1] ?? start, name: "远处" }];
  const shuffled = seededShuffle(pairSource, numericSeed ^ 0x9e3779b9);
  const letters: VoyageLetter[] = [];
  for (let index = 0; index < Math.min(letterCount, Math.max(1, shuffled.length - 1)); index += 1) {
    const fromNb = shuffled[index % shuffled.length];
    const toNb = shuffled[(index + 1) % shuffled.length];
    if (fromNb.centroid === toNb.centroid && letters.length) continue;
    const from = fromNb.centroid;
    const to = toNb.centroid === from
      ? (cells.map((cell, cellIndex) => cell === "." ? -1 : cellIndex).filter(cellIndex => cellIndex >= 0).sort((left, right) => manhattan(right, from, width) - manhattan(left, from, width))[0] ?? from)
      : toNb.centroid;
    if (from === to) continue;
    const draft = { cells, palette: source.palette, glow, stamps, width, height };
    letters.push({
      id: `mail-${letters.length}`,
      from,
      to,
      fromName: fromNb.name,
      toName: toNb.name,
      constraint: pickConstraint(draft, from, to, letters.length, numericSeed),
    });
  }
  if (!letters.length) {
    const far = cells.map((cell, index) => cell === "." ? -1 : index).filter(index => index >= 0).sort((left, right) => manhattan(right, start, width) - manhattan(left, start, width))[0] ?? start;
    letters.push({
      id: "mail-0",
      from: start,
      to: far,
      fromName: "起点",
      toName: "最远的豆子",
      constraint: glow.length ? { kind: "pass-glow" } : { kind: "wind-ride", steps: 2 },
    });
  }

  const encounters: VoyageEncounter[] = [];
  const riddleKind = numericSeed % 3;
  const answer = riddleKind === 0
    ? mostUsedColor(cells)
    : riddleKind === 1
      ? edgeColor(cells, width, height)
      : warmestColor(source.palette);
  const farCell = cells.map((cell, index) => cell === "." || index === start ? -1 : index).filter(index => index >= 0).sort((left, right) => manhattan(right, start, width) - manhattan(left, start, width))[0];
  if (answer && farCell !== undefined) {
    const prompt = riddleKind === 0
      ? "我是这张图里最多的颜色。你猜我是谁？"
      : riddleKind === 1
        ? "我最常站在图案的边上。你猜我是谁？"
        : "我是这里最暖的颜色。你猜我是谁？";
    encounters.push({ id: "enc-riddle", index: farCell, kind: "riddle", prompt, answerColor: answer });
  }
  const restAt = glow.find(index => index !== start && index !== farCell);
  if (restAt !== undefined) encounters.push({ id: "enc-rest", index: restAt, kind: "rest", prompt: "这里的豆子还亮着。要歇一歇吗？" });
  const friendAt = bridges.find(index => index !== start && !encounters.some(item => item.index === index));
  if (friendAt !== undefined) encounters.push({ id: "enc-friend", index: friendAt, kind: "friend", prompt: "这座桥连着两片颜色。走过会把路记下来。" });

  return {
    patternId: source.id,
    name: source.name,
    width,
    height,
    cells,
    palette: source.palette,
    families,
    start,
    neighborhoods,
    stamps,
    letters,
    encounters,
    bridges,
    glow,
    weather,
    seed,
  };
};

const cloneRun = (run: VoyageRun): VoyageRun => ({
  ...run,
  visited: [...run.visited],
  ghosts: [...run.ghosts],
  charges: { ...run.charges },
  stamps: [...run.stamps],
  letters: [...run.letters],
  carryTouched: [...run.carryTouched],
  encounters: [...run.encounters],
});

const revealAround = (world: VoyageWorld, run: VoyageRun, center: number, radius: number) => {
  const visited = new Set(run.visited);
  for (let index = 0; index < world.cells.length; index += 1) {
    if (manhattan(center, index, world.width) <= radius) visited.add(index);
  }
  run.visited = [...visited];
};

export const createVoyageRun = (world: VoyageWorld, colorwayId = "default"): VoyageRun => {
  const startColor = world.cells[world.start];
  const charges = Object.fromEntries(Object.keys(world.palette).map(key => [key, 0]));
  if (startColor && startColor !== ".") charges[startColor] = 1;
  const run: VoyageRun = {
    patternId: world.patternId,
    seed: world.seed,
    colorwayId,
    position: world.start,
    visited: [world.start],
    ghosts: [],
    charges,
    lantern: Math.min(4 + world.weather.moon, lanternMax(world)),
    lastGlow: world.start,
    stamps: [],
    letters: [],
    carrying: null,
    carryTouched: [],
    carryWindSteps: 0,
    carryPassedGlow: isGlowCell(world, world.start),
    encounters: [],
    steps: 0,
    mixA: null,
    mixB: null,
    streakColor: startColor === "." ? null : startColor,
    streakLen: startColor === "." ? 0 : 1,
    complete: false,
  };
  revealAround(world, run, world.start, visionRadius(world, run));
  pickupOrDeliver(world, run);
  return run;
};

export const voyageComplete = (world: VoyageWorld, run: VoyageRun) =>
  world.letters.every(letter => run.letters.includes(letter.id)) && world.stamps.every(stamp => run.stamps.includes(stamp.id));

export const voyageSealCount = (voyages: Record<string, VoyageRun>) =>
  Object.values(voyages).filter(run => run.complete).length;

export const voyageProgress = (world: VoyageWorld, run: VoyageRun) => ({
  letters: run.letters.length,
  letterTotal: world.letters.length,
  stamps: run.stamps.length,
  stampTotal: world.stamps.length,
  encounters: run.encounters.length,
  encounterTotal: world.encounters.length,
  explored: run.visited.filter(index => world.cells[index] !== ".").length,
  walkable: world.cells.filter(cell => cell !== ".").length,
  complete: run.complete || voyageComplete(world, run),
});

const markComplete = (world: VoyageWorld, run: VoyageRun, message: string): VoyageResult => {
  if (!voyageComplete(world, run)) return { run, message, kind: "ok" };
  run.complete = true;
  return { run, message: `${message} 夜航印章盖好了。`, kind: "win" };
};

const pickupOrDeliver = (world: VoyageWorld, run: VoyageRun) => {
  const here = run.position;
  if (!run.carrying) {
    const waiting = world.letters.find(letter => letter.from === here && !run.letters.includes(letter.id));
    if (waiting) {
      run.carrying = waiting.id;
      run.carryTouched = world.cells[here] !== "." ? [world.cells[here]] : [];
      run.carryWindSteps = 0;
      run.carryPassedGlow = isGlowCell(world, here);
      return `信从${waiting.fromName}出发。${constraintLine(world, waiting.constraint)}。`;
    }
  }
  if (run.carrying) {
    const letter = world.letters.find(item => item.id === run.carrying);
    if (letter && letter.to === here) {
      const ok = checkConstraint(world, run, letter);
      if (!ok.ok) {
        run.carrying = null;
        run.carryTouched = [];
        run.carryWindSteps = 0;
        run.carryPassedGlow = false;
        return `信飞回去了。${ok.reason}`;
      }
      run.letters = [...run.letters, letter.id];
      run.carrying = null;
      run.carryTouched = [];
      run.carryWindSteps = 0;
      run.carryPassedGlow = false;
      return `信送到${letter.toName}了。`;
    }
  }
  return "";
};

const checkConstraint = (world: VoyageWorld, run: VoyageRun, letter: VoyageLetter) => {
  const constraint = letter.constraint;
  if (constraint.kind === "avoid" && run.carryTouched.includes(constraint.color)) {
    return { ok: false, reason: `路上踩到了${colorName(world, constraint.color)}。再送一次吧。` };
  }
  if (constraint.kind === "need-stamp" && !run.stamps.includes(constraint.stampId)) {
    return { ok: false, reason: "门口还缺一枚印章。" };
  }
  if (constraint.kind === "min-charge" && (run.charges[constraint.color] ?? 0) < constraint.amount) {
    return { ok: false, reason: `${colorName(world, constraint.color)}的力气还不够。` };
  }
  if (constraint.kind === "pass-glow" && !run.carryPassedGlow) {
    return { ok: false, reason: "路上还没经过发光的豆子。" };
  }
  if (constraint.kind === "wind-ride" && run.carryWindSteps < constraint.steps) {
    return { ok: false, reason: `还要顺着${WIND_LABELS[world.weather.wind]}再走几步。` };
  }
  return { ok: true, reason: "" };
};

const gainCharge = (run: VoyageRun, color: string, amount: number) => {
  if (!color || color === ".") return;
  run.charges[color] = Math.min(CHARGE_CAP, (run.charges[color] ?? 0) + amount);
};

const spendCharge = (run: VoyageRun, color: string, amount: number) => {
  if ((run.charges[color] ?? 0) < amount) return false;
  run.charges[color] -= amount;
  return true;
};

const applyStep = (world: VoyageWorld, run: VoyageRun, index: number): VoyageResult => {
  if (run.complete) return { run, message: "这张夜图的印章已经盖好了。", kind: "soft" };
  if (index === run.position) return { run, message: voyageHint(world, run), kind: "soft" };
  const open = walkableSet(world, run);
  if (!open.has(index)) return { run, message: "那里没有路。试试开一座豆桥。", kind: "block" };
  if (!neighborsOf(run.position, world.width, world.height).includes(index)) {
    return { run, message: "走不到那么远，先走近一点。", kind: "block" };
  }
  const cost = stepCost(world, run, run.position, index);
  const landingGlow = isGlowCell(world, index);
  if (run.lantern < cost && !landingGlow) {
    run.position = run.lastGlow;
    run.lantern = Math.min(4, lanternMax(world));
    revealAround(world, run, run.position, visionRadius(world, run));
    return { run, message: "灯灭了。我们回到上一个亮处。", kind: "soft" };
  }
  run.lantern = Math.max(0, run.lantern - cost);
  const dir = directionBetween(run.position, index, world.width);
  run.position = index;
  run.steps += 1;
  if (!run.visited.includes(index)) run.visited = [...run.visited, index];
  revealAround(world, run, index, visionRadius(world, run));
  const symbol = world.cells[index];
  if (symbol !== ".") {
    const same = run.streakColor === symbol;
    run.streakColor = symbol;
    run.streakLen = same ? run.streakLen + 1 : 1;
    gainCharge(run, symbol, run.streakLen >= 2 ? 2 : 1);
    if (run.carrying && !run.carryTouched.includes(symbol)) run.carryTouched = [...run.carryTouched, symbol];
  } else {
    run.streakColor = null;
    run.streakLen = 0;
  }
  if (dir === world.weather.wind && run.carrying) run.carryWindSteps += 1;
  if (landingGlow) {
    run.lantern = Math.min(lanternMax(world), run.lantern + 2);
    run.lastGlow = index;
    if (run.carrying) run.carryPassedGlow = true;
  }
  const mail = pickupOrDeliver(world, run);
  const hereStamp = world.stamps.find(stamp => stamp.index === index && !run.stamps.includes(stamp.id));
  const hereEncounter = world.encounters.find(item => item.index === index && !run.encounters.includes(item.id));
  const extra = hereStamp
    ? `这里有一枚${colorName(world, hereStamp.color)}印章。点「取印」。`
    : hereEncounter
      ? hereEncounter.prompt
      : "";
  const message = [mail, extra].filter(Boolean).join(" ") || (landingGlow ? "豆子亮着，灯又旺了一点。" : voyageHint(world, run));
  return markComplete(world, run, message);
};

const applyAttune = (world: VoyageWorld, run: VoyageRun): VoyageResult => {
  if (run.complete) return { run, message: "这张夜图的印章已经盖好了。", kind: "soft" };
  const stamp = world.stamps.find(item => item.index === run.position);
  if (!stamp) return { run, message: "这里没有印章。", kind: "block" };
  if (run.stamps.includes(stamp.id)) return { run, message: "这枚印章已经在口袋里。", kind: "soft" };
  if (!spendCharge(run, stamp.color, ATTUNE_COST)) {
    return { run, message: `取印要${ATTUNE_COST}格${colorName(world, stamp.color)}。顺着这种颜色多走几步。`, kind: "block" };
  }
  run.stamps = [...run.stamps, stamp.id];
  return markComplete(world, run, `拿到${colorName(world, stamp.color)}印章了。`);
};

const applyBridge = (world: VoyageWorld, run: VoyageRun, index: number): VoyageResult => {
  if (run.complete) return { run, message: "这张夜图的印章已经盖好了。", kind: "soft" };
  if (!run.mixA || !run.mixB) return { run, message: "先选两种能混在一起的颜色。", kind: "block" };
  if (!canMixColors(world, run.mixA, run.mixB)) return { run, message: "这两种颜色混不出桥。换一对试试。", kind: "block" };
  if ((run.charges[run.mixA] ?? 0) < MIX_COST || (run.charges[run.mixB] ?? 0) < MIX_COST) {
    return { run, message: `开桥各要${MIX_COST}格力气。`, kind: "block" };
  }
  if (!neighborsOf(run.position, world.width, world.height).includes(index)) {
    return { run, message: "豆桥只能搭在身边的空格。", kind: "block" };
  }
  if (!isGapCell(world, run, index)) return { run, message: "这里搭不出桥。找夹在两颗豆子中间的空格。", kind: "block" };
  spendCharge(run, run.mixA, MIX_COST);
  spendCharge(run, run.mixB, MIX_COST);
  run.ghosts = [...run.ghosts, index];
  return { run, message: `${colorName(world, run.mixA)}和${colorName(world, run.mixB)}搭起一座豆桥。`, kind: "ok" };
};

const applyBurst = (world: VoyageWorld, run: VoyageRun): VoyageResult => {
  if (run.complete) return { run, message: "这张夜图的印章已经盖好了。", kind: "soft" };
  const warm = Object.keys(world.palette)
    .filter(key => world.families[key] === "warm" && (run.charges[key] ?? 0) >= BURST_COST)
    .sort((left, right) => (run.charges[right] ?? 0) - (run.charges[left] ?? 0) || colorWarmth(world.palette[right].color) - colorWarmth(world.palette[left].color))[0];
  if (!warm) return { run, message: "点亮要2格暖色力气。", kind: "block" };
  spendCharge(run, warm, BURST_COST);
  revealAround(world, run, run.position, 2);
  run.lantern = Math.min(lanternMax(world), run.lantern + 1);
  return { run, message: `${colorName(world, warm)}闪了一下，附近亮起来了。`, kind: "ok" };
};

const applyAnswer = (world: VoyageWorld, run: VoyageRun, color: string): VoyageResult => {
  const encounter = world.encounters.find(item => item.index === run.position && item.kind === "riddle");
  if (!encounter || run.encounters.includes(encounter.id)) return { run, message: "这里没有要猜的颜色。", kind: "block" };
  if (color !== encounter.answerColor) return { run, message: "还不是这个颜色。", kind: "soft" };
  run.encounters = [...run.encounters, encounter.id];
  if (color) gainCharge(run, color, 2);
  run.lantern = Math.min(lanternMax(world), run.lantern + 2);
  return { run, message: `猜对了，是${colorName(world, color)}。灯和力气都涨了。`, kind: "ok" };
};

const applyRestOrFriend = (world: VoyageWorld, run: VoyageRun) => {
  const encounter = world.encounters.find(item => item.index === run.position && item.kind !== "riddle" && !run.encounters.includes(item.id));
  if (!encounter) return null;
  run.encounters = [...run.encounters, encounter.id];
  if (encounter.kind === "rest") {
    run.lantern = lanternMax(world);
    run.lastGlow = run.position;
    return { run, message: "歇好了。灯又满了。", kind: "ok" as const };
  }
  run.lantern = Math.min(lanternMax(world), run.lantern + 1);
  revealAround(world, run, run.position, 2);
  return { run, message: "桥上的朋友把附近的路指给你看。", kind: "ok" as const };
};

export const reduceVoyage = (world: VoyageWorld, previous: VoyageRun, action: VoyageAction): VoyageResult => {
  const run = cloneRun(previous);
  if (action.type === "select-mix") {
    if (action.slot === "a") run.mixA = action.color;
    else run.mixB = action.color;
    const ready = run.mixA && run.mixB && canMixColors(world, run.mixA, run.mixB);
    return { run, message: ready ? "选好了。点身边夹在豆子中间的空格开桥。" : "再选另一种颜色。", kind: "ok" };
  }
  if (action.type === "step") {
    const stepped = applyStep(world, run, action.index);
    if (stepped.kind === "block" || stepped.message.startsWith("灯灭了")) return stepped;
    const talk = applyRestOrFriend(world, stepped.run);
    if (!talk) return stepped;
    if (stepped.kind === "win" || /信|印章/.test(stepped.message)) {
      return { run: talk.run, message: `${stepped.message} ${talk.message}`, kind: stepped.kind };
    }
    return talk;
  }
  if (action.type === "attune") return applyAttune(world, run);
  if (action.type === "bridge") return applyBridge(world, run, action.index);
  if (action.type === "burst") return applyBurst(world, run);
  return applyAnswer(world, run, action.color);
};

export const currentLetter = (world: VoyageWorld, run: VoyageRun) =>
  world.letters.find(letter => letter.id === run.carrying) ?? world.letters.find(letter => !run.letters.includes(letter.id)) ?? null;

export const currentGoalIndex = (world: VoyageWorld, run: VoyageRun) => {
  if (run.carrying) {
    const letter = world.letters.find(item => item.id === run.carrying);
    if (letter) return letter.to;
  }
  const waiting = world.letters.find(letter => !run.letters.includes(letter.id));
  if (waiting) return waiting.from;
  const stamp = world.stamps.find(item => !run.stamps.includes(item.id));
  return stamp?.index ?? -1;
};

export const hintPath = (world: VoyageWorld, run: VoyageRun) => {
  const goal = currentGoalIndex(world, run);
  if (goal < 0) return null;
  return bfsPath(run.position, goal, walkableSet(world, run), world.width, world.height);
};

export const voyageHint = (world: VoyageWorld, run: VoyageRun) => voyageTask(world, run).how;

export type VoyageTask = {
  title: string;
  how: string;
  nextIndex: number | null;
  action: "walk" | "attune" | "answer" | "bridge" | "done";
};

export const voyageTask = (world: VoyageWorld, run: VoyageRun): VoyageTask => {
  if (run.complete) return { title: "都做完了", how: "信送完了，印章也拿到了。", nextIndex: null, action: "done" };
  const hereStamp = stampAt(world, run);
  if (hereStamp) {
    return {
      title: "点下面黄色大按钮",
      how: `站在${colorName(world, hereStamp.color)}印章上了。点「拿走印章」。`,
      nextIndex: run.position,
      action: "attune",
    };
  }
  const hereTalk = encounterAt(world, run);
  if (hereTalk?.kind === "riddle") {
    return { title: "猜一个颜色", how: hereTalk.prompt, nextIndex: run.position, action: "answer" };
  }
  const path = hintPath(world, run);
  const first = path && path.length > 1 ? path[1] : path && path.length === 1 ? path[0] : null;
  const dir = first !== null && first !== run.position ? directionBetween(run.position, first, world.width) : null;
  const step = dir !== null ? `点带白圈、写着「${DIR_LABELS[dir]}」的那一格。` : "点旁边带白圈的豆子。";
  if (!path) {
    return { title: "路连不上", how: "点下面「搭一座桥」，再点两颗豆子中间的空格。", nextIndex: null, action: "bridge" };
  }
  if (run.carrying) {
    const letter = world.letters.find(item => item.id === run.carrying);
    return {
      title: "去送信",
      how: `手里有信。送到写着「到」的绿点。${constraintLine(world, letter?.constraint ?? { kind: "pass-glow" })}。${step}`,
      nextIndex: first === run.position ? null : first,
      action: "walk",
    };
  }
  const waiting = world.letters.find(letter => !run.letters.includes(letter.id));
  if (waiting) {
    return {
      title: "去拿信",
      how: `先走到写着「信」的豆子。${step}`,
      nextIndex: first === run.position ? null : first,
      action: "walk",
    };
  }
  const stamp = world.stamps.find(item => !run.stamps.includes(item.id));
  if (stamp) {
    return {
      title: "去拿印章",
      how: `再走到写着「印」的豆子。${step}`,
      nextIndex: first === run.position ? null : first,
      action: "walk",
    };
  }
  return { title: "走一步看看", how: step, nextIndex: first === run.position ? null : first, action: "walk" };
};

export const stampAt = (world: VoyageWorld, run: VoyageRun) =>
  world.stamps.find(item => item.index === run.position && !run.stamps.includes(item.id)) ?? null;

export const encounterAt = (world: VoyageWorld, run: VoyageRun) =>
  world.encounters.find(item => item.index === run.position && !run.encounters.includes(item.id)) ?? null;

const asIntList = (value: unknown, max: number) =>
  Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is number => typeof item === "number" && Number.isInteger(item) && item >= 0 && item < max)))
    : [];

const asIdList = (value: unknown, allowed: Set<string>) =>
  Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item))))
    : [];

export const sanitizeVoyageRun = (raw: unknown, world: VoyageWorld): VoyageRun | null => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  if (source.patternId !== world.patternId) return null;
  if (typeof source.seed !== "string" || !source.seed.startsWith(`${world.patternId}:`)) return null;
  const fresh = createVoyageRun(world, typeof source.colorwayId === "string" && source.colorwayId ? source.colorwayId : "default");
  const size = world.cells.length;
  const open = new Set(world.cells.flatMap((cell, index) => cell === "." ? [] : [index]));
  const ghosts = asIntList(source.ghosts, size).filter(index => world.cells[index] === ".");
  ghosts.forEach(index => open.add(index));
  const position = typeof source.position === "number" && open.has(source.position) ? source.position : world.start;
  const lastGlow = typeof source.lastGlow === "number" && open.has(source.lastGlow) ? source.lastGlow : world.start;
  const charges = { ...fresh.charges };
  if (source.charges && typeof source.charges === "object" && !Array.isArray(source.charges)) {
    for (const key of Object.keys(world.palette)) {
      const value = (source.charges as Record<string, unknown>)[key];
      if (typeof value === "number" && Number.isFinite(value)) charges[key] = Math.max(0, Math.min(CHARGE_CAP, Math.floor(value)));
    }
  }
  const stampIds = new Set(world.stamps.map(item => item.id));
  const letterIds = new Set(world.letters.map(item => item.id));
  const encounterIds = new Set(world.encounters.map(item => item.id));
  const carrying = typeof source.carrying === "string" && letterIds.has(source.carrying) && !(Array.isArray(source.letters) && source.letters.includes(source.carrying))
    ? source.carrying
    : null;
  const mixA = typeof source.mixA === "string" && world.palette[source.mixA] ? source.mixA : null;
  const mixB = typeof source.mixB === "string" && world.palette[source.mixB] ? source.mixB : null;
  const streakColor = typeof source.streakColor === "string" && world.palette[source.streakColor] ? source.streakColor : null;
  const run: VoyageRun = {
    patternId: world.patternId,
    seed: source.seed,
    colorwayId: fresh.colorwayId,
    position,
    visited: asIntList(source.visited, size),
    ghosts,
    charges,
    lantern: typeof source.lantern === "number" && Number.isFinite(source.lantern) ? Math.max(0, Math.min(lanternMax(world), Math.floor(source.lantern))) : fresh.lantern,
    lastGlow,
    stamps: asIdList(source.stamps, stampIds),
    letters: asIdList(source.letters, letterIds),
    carrying,
    carryTouched: Array.isArray(source.carryTouched)
      ? Array.from(new Set(source.carryTouched.filter((item): item is string => typeof item === "string" && Boolean(world.palette[item]))))
      : [],
    carryWindSteps: typeof source.carryWindSteps === "number" && Number.isFinite(source.carryWindSteps) ? Math.max(0, Math.min(99, Math.floor(source.carryWindSteps))) : 0,
    carryPassedGlow: source.carryPassedGlow === true,
    encounters: asIdList(source.encounters, encounterIds),
    steps: typeof source.steps === "number" && Number.isFinite(source.steps) ? Math.max(0, Math.min(20000, Math.floor(source.steps))) : 0,
    mixA,
    mixB,
    streakColor,
    streakLen: typeof source.streakLen === "number" && Number.isFinite(source.streakLen) ? Math.max(0, Math.min(99, Math.floor(source.streakLen))) : 0,
    complete: source.complete === true,
  };
  if (!run.visited.includes(run.position)) run.visited = [...run.visited, run.position];
  if (voyageComplete(world, run)) run.complete = true;
  return run;
};

export const sanitizeVoyages = (raw: unknown, patterns: readonly VoyageSource[]) => {
  const voyages: Record<string, VoyageRun> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return voyages;
  const source = raw as Record<string, unknown>;
  for (const pattern of patterns) {
    const candidate = source[pattern.id];
    if (!candidate) continue;
    const seed = candidate && typeof candidate === "object" && !Array.isArray(candidate) && typeof (candidate as Record<string, unknown>).seed === "string"
      ? (candidate as Record<string, unknown>).seed as string
      : voyageSeedFor(pattern.id);
    try {
      const world = buildVoyageWorld(pattern, seed);
      const run = sanitizeVoyageRun(candidate, world);
      if (run) voyages[pattern.id] = run;
    } catch {
      /* drop a broken voyage rather than poisoning the rest of the save */
    }
  }
  return voyages;
};

export const childVoyageCorpus = () => [
  ...WIND_LABELS,
  ...MOON_LABELS,
  ...DIR_LABELS,
  "信从北的红色区出发。送信时不要踩到蓝色。",
  "信送到南的蓝色区了。",
  "信飞回去了。路上踩到了红色。再送一次吧。",
  "门口还缺一枚印章。",
  "蓝色的力气还不够。",
  "路上还没经过发光的豆子。",
  "还要顺着北风再走几步。",
  "灯灭了。我们回到上一个亮处。",
  "那里没有路。试试开一座豆桥。",
  "走不到那么远，先走近一点。",
  "这里有一枚红色印章。点「取印」。",
  "取印要3格红色。顺着这种颜色多走几步。",
  "拿到红色印章了。",
  "先选两种能混在一起的颜色。",
  "这两种颜色混不出桥。换一对试试。",
  "开桥各要2格力气。",
  "豆桥只能搭在身边的空格。",
  "这里搭不出桥。找夹在两颗豆子中间的空格。",
  "红色和蓝色搭起一座豆桥。",
  "点亮要2格暖色力气。",
  "橙色闪了一下，附近亮起来了。",
  "还不是这个颜色。",
  "猜对了，是黄色。灯和力气都涨了。",
  "歇好了。灯又满了。",
  "桥上的朋友把附近的路指给你看。",
  "我是这张图里最多的颜色。你猜我是谁？",
  "我最常站在图案的边上。你猜我是谁？",
  "我是这里最暖的颜色。你猜我是谁？",
  "这里的豆子还亮着。要歇一歇吗？",
  "这座桥连着两片颜色。走过会把路记下来。",
  "夜航印章盖好了。可以等新月亮再走一次。",
  "去北的红色区取信。",
  "把信送到南的蓝色区。",
  "还差红色印章。",
  "先走近发光的豆子，灯会亮一点。",
  "今晚北风，满月 · 潮色是蓝色",
  "夜航探图",
  "提着灯走进图案里",
  "在豆子上走路、送信、开桥",
  "点旁边带白圈的豆子，往下走去拿信。",
  "你是写着「我」的那一格。只能点旁边一格。",
  "先去拿信，再送到写着「到」的地方。",
  "走路时别踩草莓红",
  "先拿到印章才能送到",
  "去拿信",
  "去送信",
  "点下面黄色大按钮",
  "点带白圈、写着「下」的那一格。",
].join("\n");
