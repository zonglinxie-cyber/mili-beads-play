export type DifficultyAxes = {
  /** 图纸内实际豆子数。 */
  beads: number;
  /** 上下左右相邻且颜色不同的边数。 */
  colorChanges: number;
  /** 四向连通部件数。 */
  pieces: number;
  /** 去掉后会使所属部件断开的单格连接点数。 */
  articulationPoints: number;
  /** 横向或纵向镜像后仍同色的豆子数，取两者较大值。 */
  symmetry: number;
  /** 上下左右相邻且同色的边数。 */
  repetition: number;
};

export type SafePatternMetadata = {
  estimatedMinutes: [number, number];
  difficultyAxes: DifficultyAxes;
  difficultyLabel: string;
  difficultyWhy: string;
  playIdea: string;
  assemblyNotes: string[];
  childFinishLine: string;
  reserveByColor: Record<string, number>;
};

export type PatternMetadataInput = {
  id?: string;
  rows: string[];
  palette: Record<string, { name: string; color: string }>;
  pieceSizes?: number[];
  estimatedMinutes?: [number, number];
  difficultyAxes?: DifficultyAxes;
  difficultyLabel?: string;
  difficultyWhy?: string;
  playIdea?: string;
  assemblyNotes?: string[];
  childFinishLine?: string;
  reserveByColor?: Record<string, number>;
};

export type UnsafeLegacyPatternMetadata = {
  minutes?: number;
  recommendedUse?: string;
  spareBeads?: string;
};

export type MaterialPlanRow = {
  key: string;
  name: string;
  color: string;
  required: number;
  reserve: number;
  recommended: number;
};

/**
 * These words describe adult-only tools or finishing operations. They must not
 * appear in child-facing pattern metadata. The app deliberately provides no
 * temperatures, durations or attachment recipes; adults must use the official
 * instructions for the exact materials they own.
 */
export const CHILD_PATTERN_FORBIDDEN = /温度|低温|高温|\d+\s*秒|熨|磁铁|磁贴|胶水|胶贴|可移胶|透明线|打孔|挂件孔|裁剪|冷却|停留\s*\d+\s*秒|多压(?:一|两|三|\d+)次/u;

const cellsOf = (pattern: PatternMetadataInput) => pattern.rows.join("").split("");
const widthOf = (pattern: PatternMetadataInput) => pattern.rows[0]?.length ?? 0;

export function colorCounts(pattern: PatternMetadataInput) {
  const counts: Record<string, number> = {};
  for (const key of Object.keys(pattern.palette)) counts[key] = 0;
  for (const cell of cellsOf(pattern)) if (cell !== ".") counts[cell] = (counts[cell] ?? 0) + 1;
  return counts;
}

const graphOf = (pattern: PatternMetadataInput) => {
  const width = widthOf(pattern);
  const cells = cellsOf(pattern);
  const nodes = cells.flatMap((cell, index) => cell === "." ? [] : [index]);
  const nodeSet = new Set(nodes);
  const adjacent = (index: number) => {
    const x = index % width;
    const candidates = [index - width, index + width, ...(x > 0 ? [index - 1] : []), ...(x + 1 < width ? [index + 1] : [])];
    return candidates.filter(candidate => nodeSet.has(candidate));
  };
  return { width, cells, nodes, adjacent };
};

export function deriveDifficultyAxes(pattern: PatternMetadataInput): DifficultyAxes {
  const { width, cells, nodes, adjacent } = graphOf(pattern);
  let colorChanges = 0;
  let repetition = 0;
  const nodeSet = new Set(nodes);
  for (const index of nodes) {
    for (const neighbor of [index + 1, index + width]) {
      if (!nodeSet.has(neighbor) || (neighbor === index + 1 && Math.floor(neighbor / width) !== Math.floor(index / width))) continue;
      if (cells[index] === cells[neighbor]) repetition += 1;
      else colorChanges += 1;
    }
  }

  let pieces = 0;
  const unseen = new Set(nodes);
  while (unseen.size) {
    pieces += 1;
    const first = unseen.values().next().value as number;
    unseen.delete(first);
    const stack = [first];
    while (stack.length) {
      for (const neighbor of adjacent(stack.pop()!)) if (unseen.delete(neighbor)) stack.push(neighbor);
    }
  }

  let clock = 0;
  const discovered = new Map<number, number>();
  const low = new Map<number, number>();
  const articulation = new Set<number>();
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
        if (parent === null ? children > 1 : low.get(neighbor)! >= discovered.get(node)!) articulation.add(node);
      } else if (neighbor !== parent) low.set(node, Math.min(low.get(node)!, discovered.get(neighbor)!));
    }
  };
  for (const node of nodes) if (!discovered.has(node)) visit(node, null);

  const height = pattern.rows.length;
  const mirroredMatches = (horizontal: boolean) => nodes.reduce((sum, index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    const mirrorX = horizontal ? width - x - 1 : x;
    const mirrorY = horizontal ? y : height - y - 1;
    return sum + (cells[mirrorY * width + mirrorX] === cells[index] ? 1 : 0);
  }, 0);

  return {
    beads: nodes.length,
    colorChanges,
    pieces,
    articulationPoints: articulation.size,
    symmetry: Math.max(mirroredMatches(true), mirroredMatches(false)),
    repetition,
  };
}

const derivedMinutes = (axes: DifficultyAxes): [number, number] => {
  const effort = axes.beads * 0.14 + axes.colorChanges * 0.04 + axes.pieces * 2 + axes.articulationPoints * 0.35;
  const minimum = Math.max(15, Math.ceil(effort / 5) * 5);
  const spread = Math.max(10, Math.ceil(axes.beads * 0.08 / 5) * 5);
  return [minimum, minimum + spread];
};

const derivedDifficulty = (axes: DifficultyAxes) => {
  let score = 0;
  if (axes.beads >= 125) score += 1;
  if (axes.beads >= 160) score += 1;
  if (axes.colorChanges >= 55) score += 1;
  if (axes.pieces >= 2) score += 1;
  if (axes.articulationPoints >= 3) score += 1;
  if (axes.symmetry >= axes.beads * 0.7) score -= 1;
  if (score <= 1) return "自在摆豆";
  if (score <= 3) return "耐心进阶";
  return "专注挑战";
};

const derivedWhy = (pattern: PatternMetadataInput, axes: DifficultyAxes) => {
  const colors = Object.keys(pattern.palette).length;
  const structure = axes.articulationPoints
    ? `${axes.articulationPoints} 个单格连接点需要留心`
    : "没有单格连接点";
  return `${axes.beads} 颗、${colors} 色、${axes.colorChanges} 处相邻换色；${axes.pieces} 个部件，${structure}。`;
};

const validRange = (value: unknown): value is [number, number] => Array.isArray(value)
  && value.length === 2
  && value.every(item => Number.isInteger(item) && item > 0)
  && value[0] < value[1];

export function patternPresentation(pattern: PatternMetadataInput): SafePatternMetadata {
  const difficultyAxes = pattern.difficultyAxes ?? deriveDifficultyAxes(pattern);
  const estimatedMinutes = validRange(pattern.estimatedMinutes) ? pattern.estimatedMinutes : derivedMinutes(difficultyAxes);
  const playIdea = pattern.playIdea?.trim() || "拼好后放进小舞台，换一个背景讲新故事。";
  const safeAssemblyNotes = pattern.assemblyNotes?.filter(note => note.trim() && !CHILD_PATTERN_FORBIDDEN.test(note)) ?? [];
  const assemblyNotes = safeAssemblyNotes.length
    ? safeAssemblyNotes
    : [`图案由 ${difficultyAxes.pieces} 个部件组成，按完整图纸分开摆放。`, "完成后保持在拼板上，连同拼板一起交给家长。"];
  const childFinishLine = pattern.childFinishLine?.trim() || "拼好后请大人帮忙";
  const counts = colorCounts(pattern);
  const reserveByColor = Object.fromEntries(Object.keys(pattern.palette).map(key => {
    const declared = pattern.reserveByColor?.[key];
    const reserve = Number.isInteger(declared) && declared! >= 0 ? declared! : Math.max(2, Math.ceil((counts[key] ?? 0) * 0.1));
    return [key, reserve];
  }));
  return {
    estimatedMinutes,
    difficultyAxes,
    difficultyLabel: pattern.difficultyLabel?.trim() || derivedDifficulty(difficultyAxes),
    difficultyWhy: pattern.difficultyWhy?.trim() || derivedWhy(pattern, difficultyAxes),
    playIdea,
    assemblyNotes,
    childFinishLine,
    reserveByColor,
  };
}

/**
 * One-way bridge for old local datasets while the catalog is being rewritten.
 * Unsafe prose is intentionally discarded: it is never copied into child-facing
 * fields. New catalog rows must store SafePatternMetadata directly.
 */
export function migrateLegacyPatternMetadata(
  pattern: PatternMetadataInput & UnsafeLegacyPatternMetadata,
  safeText?: Pick<SafePatternMetadata, "playIdea" | "assemblyNotes">,
): SafePatternMetadata {
  const legacyMinutes = Number.isFinite(pattern.minutes) && pattern.minutes! > 0
    ? Math.round(pattern.minutes!)
    : undefined;
  return patternPresentation({
    ...pattern,
    estimatedMinutes: pattern.estimatedMinutes ?? (legacyMinutes ? [Math.max(10, legacyMinutes - 5), legacyMinutes + 10] : undefined),
    playIdea: safeText?.playIdea ?? pattern.playIdea,
    assemblyNotes: safeText?.assemblyNotes ?? pattern.assemblyNotes?.filter(note => !CHILD_PATTERN_FORBIDDEN.test(note)),
  });
}

export const formatEstimatedMinutes = (range: [number, number]) => `预计摆豆 ${range[0]}–${range[1]} 分钟`;

export function materialPlan(pattern: PatternMetadataInput): MaterialPlanRow[] {
  const counts = colorCounts(pattern);
  const presentation = patternPresentation(pattern);
  return Object.keys(pattern.palette).map(key => {
    const required = counts[key] ?? 0;
    const reserve = presentation.reserveByColor[key] ?? 0;
    return {
      key,
      name: pattern.palette[key].name,
      color: pattern.palette[key].color,
      required,
      reserve,
      recommended: required + reserve,
    };
  });
}
