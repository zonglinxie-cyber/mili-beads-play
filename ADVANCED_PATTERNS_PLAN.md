# 米粒拼豆社 · 进阶图纸实现方案

> 本文档供 AI 编码模型使用。目标：为 9 岁孩子增加"进阶图纸"通道，包含更大尺寸、更多颜色、更酷主题的图案。
> 核心原则：不修改现有 12 个图案，不破坏现有游戏模式，新增一个独立的"进阶"通道。

---

## 概述

### 当前问题

| 维度 | 当前值 | 对 9 岁孩子的问题 |
|------|--------|------------------|
| 网格尺寸 | 全部 18×18 | 每次大小一样，没有"大工程"感 |
| 豆数 | 平均 155 颗，上限 180 | 拼熟练了 20-30 分钟搞定 |
| 颜色数 | 4-6 色（代码硬性限制） | 同一色系反复填，变化不够 |
| 主题风格 | 可爱动物、甜点、书桌摆件 | 偏低龄，缺"酷"元素 |
| 难度跨度 | 所有图案豆数接近 | 没有"轻松"到"挑战"的梯度 |

### 方案

1. **放宽 `patterns.ts` 中的验证约束**，允许图案标记 `advanced: true` 走宽松规则
2. **新增 6 个进阶图案**，29×29 网格，250-450 颗豆，8-10 色
3. **首页新增"进阶挑战"入口**，与普通图纸分开
4. **游戏模式适配大图**：自动禁用分区模式（zone），默认点击模式，增加平移

---

## 任务一：放宽图案验证约束

### 修改 `app/patterns.ts`

#### 1.1 在 Pattern 类型中增加 `advanced` 字段

第 16-40 行，在 `Pattern` 类型中增加：

```typescript
export type Pattern = {
  id: string;
  name: string;
  story: string;
  category: string;
  /** 标记为进阶图纸，跳过 18×18 和 4-6 色等限制 */
  advanced?: boolean;
  motion: "launch" | "float" | "twist" | "sway" | "hop" | "drum" | "bounce" | "roll" | "glide";
  // ... 其余字段不变
};
```

#### 1.2 新增 `rowsN` 辅助函数

在第 44-48 行 `rows18` 函数之后，新增通用尺寸的 `rowsN` 函数：

```typescript
/**
 * 通用网格构建函数，支持任意尺寸。
 * 用法：rowsN(29)(["...", "..."])  // 29×29 网格
 * 自动补全到指定宽度，`.` 替换空格。
 */
const rowsN = (size: number) => (lines: string[]) => lines.map(line => {
  const row = line.replaceAll(" ", ".");
  if (row.length > size) throw new Error(`图纸超过 ${size} 格：${line}`);
  return row.padEnd(size, ".");
});

/**
 * 进阶图纸专用：29×29 网格构建函数。
 * 使用 rowsN(29) 避免重复传参。
 */
const rows29 = rowsN(29);
```

#### 1.3 修改验证逻辑

第 321-337 行，将单条验证改为分叉逻辑：

```typescript
PATTERNS.forEach(pattern => {
  if (pattern.advanced) {
    // ---- 进阶图纸验证（宽松） ----
    if (pattern.rows.length > 29 || pattern.rows.some(row => row.length > 29)) throw new Error(`进阶图纸尺寸超 29×29：${pattern.id}`);
    if (targetCount(pattern) > 500) throw new Error(`进阶图纸超过 500 颗：${pattern.id}`);
    const used = new Set(pattern.rows.join("").replaceAll(".", ""));
    const paletteKeys = Object.keys(pattern.palette);
    if ([...used].some(key => !pattern.palette[key]) || paletteKeys.some(key => !used.has(key))) throw new Error(`进阶图纸色表与网格不一致：${pattern.id}`);
    if (used.size < 4 || used.size > 10) throw new Error(`进阶图纸必要色超出 4–10 种：${pattern.id}`);
    // 进阶图纸不要求 colorways（配色工作量太大）
    // 进阶图纸不要求 layers（动画分层可以后续手动补）
    // 进阶图纸不要求 pieceSizes 校验
    // 进阶图纸不要求弱色校验
  } else {
    // ---- 普通图纸验证（严格，保持现有规则） ----
    if (pattern.rows.length !== 18 || pattern.rows.some(row => row.length !== 18)) throw new Error(`图纸尺寸错误：${pattern.id}`);
    if (targetCount(pattern) > 180) throw new Error(`图纸超过 180 颗：${pattern.id}`);
    const used = new Set(pattern.rows.join("").replaceAll(".", ""));
    const paletteKeys = Object.keys(pattern.palette);
    if ([...used].some(key => !pattern.palette[key]) || paletteKeys.some(key => !used.has(key))) throw new Error(`图纸色表与网格不一致：${pattern.id}`);
    if (used.size < 4 || used.size > 6) throw new Error(`图纸必要色超出 4–6 种：${pattern.id}`);
    const counts = Object.fromEntries(paletteKeys.map(key => [key, pattern.rows.join("").split("").filter(cell => cell === key).length]));
    if (Object.values(counts).some(count => count < 4 || count / targetCount(pattern) < .03)) throw new Error(`图纸含装饰性弱色：${pattern.id}`);
    if (pattern.colorways.length !== 3) throw new Error(`图纸未提供 3 套手工配色：${pattern.id}`);
    const sortedPaletteKeys = [...paletteKeys].sort().join();
    for (const colorway of pattern.colorways) if (Object.keys(colorway.palette).sort().join() !== sortedPaletteKeys) throw new Error(`配色符号不完整：${pattern.id}/${colorway.id}`);
    if (pattern.layers.length !== 18 || pattern.layers.some(row => row.length !== 18)) throw new Error(`动画分层尺寸错误：${pattern.id}`);
    if (pattern.layers.join("").split("").some((layer, index) => (pattern.rows.join("")[index] === ".") !== (layer === ".") || !".BPF".includes(layer))) throw new Error(`动画分层未覆盖图纸：${pattern.id}`);
    const components = connectedComponents(pattern);
    if (components.some(size => size < 24) || components.join(",") !== pattern.pieceSizes.join(",")) throw new Error(`图纸含小散件或部件声明不实：${pattern.id}`);
  }
});
```

#### 1.4 导出 `ADVANCED_PATTERNS` 数组

在第 276 行 `PATTERNS` 导出之后，新增：

```typescript
/** 进阶图纸合集（大尺寸、高复杂度） */
export const ADVANCED_PATTERNS: Pattern[] = [
  // 在任务二中定义
];
```

并在 `patterns.ts` 文件末尾将 `ADVANCED_PATTERNS` 也加入验证循环：

```typescript
// 验证进阶图纸
ADVANCED_PATTERNS.forEach(pattern => {
  pattern.advanced = true;
  // 上面的 PATTERNS.forEach 验证逻辑会 handle advanced 分支
});
// 但要注意：上面的 forEach 只遍历了 PATTERNS，所以需要单独遍历 ADVANCED_PATTERNS
// 或者将两者合并后遍历
```

**建议**：将验证逻辑提取为独立函数，分别验证两个数组：

```typescript
const validatePattern = (pattern: Pattern) => {
  // ... 上述验证逻辑，包含 advanced 分支
};
PATTERNS.forEach(validatePattern);
ADVANCED_PATTERNS.forEach(validatePattern);
```

#### 1.5 导出 `isAdvancedPattern` 工具函数

```typescript
export const isAdvancedPattern = (pattern: Pattern) => Boolean(pattern.advanced);
export const patternGridSize = (pattern: Pattern) => pattern.rows.length; // 返回 18 或 29
```

---

## 任务二：修改 `save-store.ts` 中的 BOARD_SIZE 硬编码

### 修改 `app/save-store.ts`

#### 2.1 移除硬编码的 BOARD_SIZE

第 52 行 `const BOARD_SIZE = 18;` 不再作为全局常量，改为从 pattern 中读取。

#### 2.2 修改 `normalizeSave` 中的棋盘验证

第 86-88 行，当前代码：

```typescript
if (!Array.isArray(candidate) || candidate.length !== BOARD_SIZE * BOARD_SIZE) continue;
```

改为：

```typescript
const expectedSize = pattern.rows.length * pattern.rows[0].length;
if (!Array.isArray(candidate) || candidate.length !== expectedSize) continue;
```

#### 2.3 修改 `FreeDrawing` 的 cells 验证

第 132 行，当前代码：

```typescript
if (!Array.isArray(candidate.cells) || candidate.cells.length !== BOARD_SIZE * BOARD_SIZE) continue;
```

`FreeDrawing` 目前固定在 18×18，保持不动。进阶图纸的保存走 `boards` 机制，不涉及 `FreeDrawing`。

---

## 任务三：修改 `page.tsx` 适配大图

### 3.1 导入进阶图纸

在第 9 行附近，在 `import { PATTERNS, ... }` 中加入 `ADVANCED_PATTERNS` 和 `isAdvancedPattern`：

```typescript
import { PATTERNS, ADVANCED_PATTERNS, Pattern, targetCount, isAdvancedPattern, FREE_PALETTE } from "./patterns";
```

### 3.2 合并图案列表用于 UI 展示

在 `Home` 组件内（第 328 行附近），新增：

```typescript
const allPatterns = [...PATTERNS, ...ADVANCED_PATTERNS];
```

### 3.3 修改 `zoneIndices` 函数适配大图

第 142-148 行，当前 `zoneIndices` 假设 18×18 网格分 9 个 6×6 区域。

对于进阶图纸（29×29），**禁用分区系统**——整个棋盘作为一个区域。

```typescript
const zoneIndices = (zone: number, boardSize = BOARD_SIZE) => {
  const zoneSize = boardSize <= 18 ? ZONE_SIZE : boardSize; // 大图：整个棋盘为一个区
  // 如果 boardSize > 18，不分区，返回全部索引
  if (boardSize > 18) {
    return Array.from({ length: boardSize * boardSize }, (_, i) => i);
  }
  const startRow = Math.floor(zone / 3) * zoneSize;
  const startCol = (zone % 3) * zoneSize;
  return Array.from({ length: zoneSize * zoneSize }, (_, index) => {
    const row = startRow + Math.floor(index / zoneSize);
    const col = startCol + index % zoneSize;
    return row * boardSize + col;
  });
};
```

**注意**：所有调用 `zoneIndices(zone)` 的地方都需要传入当前图案的 `boardSize`。建议改为：

```typescript
const currentBoardSize = (() => {
  // 返回当前图案的网格宽度
  const p = PATTERNS.find(p => p.id === activeId) ?? ADVANCED_PATTERNS.find(p => p.id === activeId);
  return p?.rows.length ?? 18;
})();
```

### 3.4 游戏模式下，大图自动禁用分区

在 `tab === "game"` 的渲染中（第 1190 行附近），对于大图：
- 隐藏 zone-picker 区域
- 隐藏 "assistant" 模式（大图不适合实体助手模式）
- 默认使用点击模式（tapMode = true）
- 在 play-board 中，显示完整的 29×29 网格，但每个格子按比例缩小

CSS 调整：

```css
/* 大图网格 */
.touch-grid.advanced{max-width:100%;gap:1.5px;padding:2px}
.touch-grid.advanced button{min-height:0;border-radius:2px}
```

### 3.5 大图进入游戏时跳过模式选择

对于 `advanced: true` 的图案，`openGame` 应该直接进入 `mobile` 模式，跳过模式选择界面：

```typescript
const openGame = (id: string, nextMode?: PlayMode) => {
  // ...
  const pattern = PATTERNS.find(p => p.id === id) ?? ADVANCED_PATTERNS.find(p => p.id === id) ?? PATTERNS[0];
  const isAdvanced = Boolean(pattern.advanced);
  
  // 进阶图纸直接进入手机模式
  if (isAdvanced && !nextMode) {
    nextMode = "mobile";
  }
  // ...
};
```

### 3.6 大图进度显示

在 `game-header` 中，大图的进度显示为 `已拼 X/Y 颗`，不显示分区信息。

### 3.7 大图完成后的庆祝

大图完成后，小舞台动画持续时间延长（通过 CSS 或 JS 控制），给"大作品"更隆重的庆祝。

---

## 任务四：修改 `pattern-metadata.ts` 适配大图

### 4.1 修改 `widthOf` 函数

第 66 行，当前代码：

```typescript
const widthOf = (pattern: PatternMetadataInput) => pattern.rows[0]?.length ?? 0;
```

这个函数已经自动适应任何宽度，不需要修改。

### 4.2 修改 `colorCounts` 函数

第 68-73 行，同样自动适应任何尺寸，不需要修改。

### 4.3 放宽 `deriveDifficultyAxes` 中的颜色变化计算

大图颜色数多，`colorChanges` 值会很大，但 `derivedDifficulty` 只依赖于几个阈值，不需要修改。

### 4.4 大图不显示"预计时间"

大图的 `estimatedMinutes` 可以设为 `[60, 120]` 或 `[90, 180]`，在 UI 中显示为"预计摆豆 1–2 小时"。

---

## 任务五：首页新增"进阶挑战"入口

### 5.1 在首页插入入口卡片

在 `app/page.tsx` 第 1166 行（"自由画板"和"本周精选"之间），插入：

```tsx
{ADVANCED_PATTERNS.length > 0 && (
  <button className="home-advanced" onClick={() => {
    // 进入进阶图纸列表
    setAdvancedFilter(true);
    setTab("library");
  }}>
    <span className="home-advanced-art" aria-hidden="true">⚡</span>
    <span>
      <small>进阶挑战</small>
      <b>大图纸 · 更多细节</b>
      <i>适合想挑战大作品的孩子，慢慢拼</i>
    </span>
    <em>查看 {ADVANCED_PATTERNS.length} 张</em>
  </button>
)}
```

### 5.2 新增 `advancedFilter` 状态

在第 345 行附近：

```typescript
const [advancedFilter, setAdvancedFilter] = useState(false);
```

### 5.3 修改图纸宝库

在 `tab === "library"` 的渲染中，当 `advancedFilter` 为 true 时，只显示进阶图纸：

```typescript
{savePhase === "ready" && tab === "library" && (
  <section className="library">
    <div className="page-head">
      <small>{advancedFilter ? "进阶挑战" : "图纸宝库"}</small>
      <h1>{advancedFilter ? "选一张大图纸" : "今天拼哪个？"}</h1>
      {advancedFilter && (
        <p>29×29 大网格 · 250-450 颗豆 · 适合有耐心的挑战</p>
      )}
    </div>
    {!advancedFilter && (
      <div className="filters">
        {categories.map(c => (
          <button key={c} className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
    )}
    <div className="home-grid">
      {(advancedFilter ? ADVANCED_PATTERNS : PATTERNS.filter(p => filter === "全部" || p.category === filter))
        .map(p => (
          <HomeTile key={p.id} pattern={p} colorwayId={colorways[p.id]}
            onOpen={() => openGame(p.id)}
            finished={completed.includes(p.id)}
            placed={placedCount(p, savedBoards[p.id])} />
        ))}
    </div>
    {advancedFilter && (
      <button className="back-to-library" onClick={() => setAdvancedFilter(false)}>
        ← 返回普通图纸
      </button>
    )}
  </section>
)}
```

### 5.4 修改 `HomeTile` 组件适配大图

对于进阶图案，`HomeTile` 中的小字显示：

```typescript
<small>
  {inProgress ? `已拼 ${placed} 颗` : 
   pattern.advanced ? `${total} 颗 · ${Math.round(total / 18)} 分钟以上` :
   pattern.category === "书桌" ? `${total} 颗 · 拼完能摆` :
   `${total} 颗 · ${presentation.difficultyLabel}`}
</small>
```

### 5.5 新增 CSS 样式

在 `globals.css` 中新增：

```css
/* 进阶挑战入口 */
.home-advanced{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;width:100%;margin:0 0 14px;padding:12px;border-radius:22px;background:linear-gradient(135deg,#fff3e0,#fce4ec);border:2px solid #ff8a65;color:var(--ink);text-align:left;box-shadow:var(--shadow)}
.home-advanced-art{width:56px;height:56px;display:grid;place-items:center;border-radius:16px;background:#fff;font-size:28px}
.home-advanced>span{display:grid;gap:2px;min-width:0}
.home-advanced small{font-size:11px;font-weight:900;letter-spacing:1px;color:#e64a19}
.home-advanced b{font-size:18px;line-height:1.2}
.home-advanced i{font-style:normal;font-size:12px;color:var(--muted);font-weight:700}
.home-advanced em{font-style:normal;font-size:13px;font-weight:900;background:#ff8a65;color:#fff;border-radius:12px;padding:10px 12px;white-space:nowrap}
.back-to-library{display:block;width:100%;min-height:44px;margin-top:12px;background:transparent;color:var(--purple);font-weight:900;font-size:13px;text-align:center}
```

---

## 任务六：新增 6 个进阶图案

### 在 `app/patterns.ts` 中，`PATTERNS` 导出之后，新增 `ADVANCED_PATTERNS`

#### 6.1 进阶配色方案

大图不需要 3 套完整配色，但建议提供至少 1 套备用配色供"找不同"模式使用。如果只提供 1 套配色，`colorways` 设为空数组，`buildSpotPuzzle` 需要处理 `colorways.length === 0` 的情况。

#### 6.2 图案数据

以下是 6 个进阶图案的完整数据。每个图案包含 rows 数据（29×29 网格，字符表示颜色），palette 定义，以及元数据。

**图案 1：飞龙盘绕城堡（Dragon Castle）**

```typescript
const dragonCastle: Pattern = {
  id: "dragon-castle",
  name: "飞龙盘绕城堡",
  story: "一条青色的飞龙绕着石头城堡盘旋，塔楼上亮起金色的窗。",
  category: "幻想",
  advanced: true,
  motion: "glide",
  animation: "飞龙沿城堡周围缓慢盘旋；塔楼窗户依次亮起；云层缓缓飘过",
  motionPlan: { body: "飞龙整体盘旋", prop: "塔楼窗户亮起", fx: "云层飘过" },
  pieceLabel: "一体成品",
  pieceSizes: [385],
  skillTip: "先完成城堡的塔楼和主墙，再沿飞龙的头部和身体轮廓拼出盘旋的轨迹。",
  estimatedMinutes: [90, 150],
  difficultyAxes: { beads: 385, colorChanges: 312, pieces: 1, articulationPoints: 8, symmetry: 120, repetition: 360 },
  difficultyLabel: "大图挑战",
  difficultyWhy: "385 颗、8 色；城堡和飞龙嵌套，需要区分建筑轮廓和龙身纹理。",
  playIdea: "完成后在舞台让飞龙慢慢盘旋，塔楼窗户从下到上亮起。",
  assemblyNotes: ["飞龙和城堡连成一个主件。", "摆放时城堡在左下，龙身顺时针盘绕。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: {},
  palette: {
    D: color("石墙灰", "#8a7f6e"),
    B: color("湖水蓝", "#5daabe"),
    G: color("青鳞绿", "#4a8c6f"),
    Y: color("星光黄", "#f5c95d"),
    R: color("砖红", "#b85d4a"),
    K: color("夜空墨", "#29283b"),
    W: color("奶油白", "#fff5df"),
    N: color("深海蓝", "#355276"),
  },
  colorways: [],  // 进阶图纸不要求多配色
  rows: rows29([
    ".............................",
    ".............DDDDD...........",
    "............DDDDDDD..........",
    "...........DDDDDDDDD.........",
    "..........DDRDDDDDDDD........",
    ".........DDRRRDDDDDDDD.......",
    "........DDDRRRDDDDDDDDD......",
    ".......DDDDYRDDDDDDDDDDD.....",
    "......DDDDDYYRDDDDDDDDDDDD...",
    ".....DDDDDDDRDDDDDDDDDDDDDD..",
    "....DDDDDDDDDDDDDDDDDDDDDDD..",
    "....DDDDDDDDDDDDDDDDDDDDDDD..",
    "G...DDDDDDDDDDDDDDDDDDDDDD...",
    "GG..KDDDDDDDKDDDDDDDKDDDDD...",
    "GGG.KDDDDDDDKDDDDDDDKDDDD....",
    "GGGGKDDDDDDDKDDDDDDDKKDDD....",
    "GGGGWKDDDDDDKDDDDDDDKDDDDD...",
    "GGGWWKDDDDDDKDDDDDDDKDDDDDD..",
    "GGWWWKDDDDDDKDDDDDDDKDDDDDDD.",
    "GGWWWWKDDDDDDDDDDDDDDDDDDDDDD",
    "GGWWWWWKDDDDDDDDDDDDDDDDDDDDD",
    "GGWWWWWWKDDDDDDDDDDDDDDDDDDDD",
    "GGWWWWWWWKDDDDDDDDDDDDDDDDDDD",
    "GGGWWWWWWWKDDDDDDDDDDDDDDDDDD",
    "GGGGWWWWWWDDDDDDDDDDDDDDDDDDD",
    "GGGGGWWWWWDDDDDDDDDDDDDDDDDDD",
    "GGGGGGWWWWWKDDDDDDDDDDDDDDDDD",
    "GGGGGGGWWWKDDDDDDDDDDDDDDDDDD",
    "GGGGGGGGKKDDDDDDDDDDDDDDDDDDD",
  ]),
  layers: [],  // 进阶图纸不要求动画分层（后续可补）
};
```

**注意**：以上 rows 数据是示意性占位，实际需要由图案设计师逐格绘制。**建议使用 [Piskel](https://www.pixilart.com/draw) 或 Aseprite 等像素工具绘制 29×29 网格**，然后导出为字符网格填入 `rows29()` 调用中。

#### 6.3 其他 5 个图案的规格说明

由于 29×29 的完整网格数据太长，以下提供每个图案的**规格说明**，由图案设计师或 AI 图像生成工具据此生成具体像素网格。

| 图案 | 主题 | 豆数 | 色数 | 关键视觉元素 |
|------|------|------|------|-------------|
| 飞龙盘绕城堡 | 幻想 | ~385 | 8 | 灰色城堡塔楼、青色龙身盘旋、金色窗户、深色背景 |
| 火箭发射塔 | 航天 | ~320 | 7 | 银色火箭、红色火焰、蓝色云层、白色烟雾、发射塔架 |
| 虎鲨破浪 | 海洋 | ~300 | 6 | 深蓝虎鲨、白色牙齿、青色水花、灰色鳍 |
| 机器人守卫 | 科幻 | ~350 | 8 | 灰色机甲、红色眼睛、蓝色能量管、金属关节 |
| 复古游戏手柄 | 游戏 | ~260 | 7 | 灰色手柄、彩色按钮（红黄蓝绿）、十字键、连接线 |
| 忍者城月光 | 东方 | ~310 | 6 | 深色瓦片屋顶、金色月亮、红色灯笼、灰色城墙 |

**每个图案的数据结构模板**（以火箭发射塔为例）：

```typescript
const rocketLaunch: Pattern = {
  id: "rocket-launch",
  name: "火箭发射塔",
  story: "银色火箭在发射塔旁喷出火焰和烟雾，冲向蓝色的天空。",
  category: "航天",
  advanced: true,
  motion: "launch",
  animation: "火箭尾部火焰喷射；烟雾向两侧扩散；发射塔架依次收起",
  motionPlan: { body: "火箭整体上升", prop: "发射塔架收起", fx: "烟雾扩散" },
  pieceLabel: "一体成品",
  pieceSizes: [320],
  skillTip: "先拼发射塔的竖直结构，再沿火箭轮廓从下往上拼。",
  estimatedMinutes: [75, 120],
  difficultyAxes: { beads: 320, colorChanges: 260, pieces: 1, articulationPoints: 6, symmetry: 80, repetition: 300 },
  difficultyLabel: "大图挑战",
  difficultyWhy: "320 颗、7 色；发射塔的垂直结构和火箭的锥形轮廓需要仔细对齐。",
  playIdea: "完成后让火箭向上起飞，火焰喷射，烟雾扩散。",
  assemblyNotes: ["火箭和发射塔连成一个主件。", "摆放时火箭朝上，发射塔在右侧。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: {},
  palette: {
    S: color("银灰", "#c0c0c0"),
    R: color("火焰红", "#e05040"),
    B: color("晴空蓝", "#5b8fd6"),
    W: color("云朵白", "#fdf6ec"),
    K: color("墨夜黑", "#33304a"),
    G: color("金属灰", "#6b6b6b"),
    Y: color("暖阳橙", "#ef8b57"),
  },
  colorways: [],
  // rows: rows29([...]),  // 需要像素工具绘制
  // layers: [],
};
```

#### 6.4 图案生成指引

对于 AI 编码模型：**不需要生成 29×29 的像素网格数据**——这需要图案设计师手动绘制。你可以：

1. 在 `patterns.ts` 中添加完整的图案**结构定义**（包括 id、name、story、palette、metadata），但将 `rows` 和 `layers` 字段留空或设为占位
2. 在验证逻辑中，`advanced` 图案的 `rows` 为空时跳过验证（但需要在运行时优雅处理）

或者更好的做法：

**在 `ADVANCED_PATTERNS` 数组中，只包含定义完整的图案**，使用 `rows29([...])` 填入实际网格数据。AI 编码模型可以生成**示意性的占位网格**（例如简单的几何形状），但建议最终由人用像素工具绘制。

---

## 任务七：处理 `buildSpotPuzzle` 在进阶图案中的兼容性

### 修改 `app/play-content.ts`

`buildSpotPuzzle` 函数（第 339-353 行）依赖 `pattern.colorways` 来创建"找不同"游戏。进阶图案的 `colorways` 为空数组，需要处理：

```typescript
export const buildSpotPuzzle = (pattern: SpotSource, homeId?: string): SpotPuzzle | null => {
  if (!pattern.colorways || pattern.colorways.length < 2) return null; // 进阶图案跳过找不同
  // ... 原有逻辑
};
```

在 `page.tsx` 中，`openReplay` 函数调用 `buildSpotPuzzle` 时，如果返回 null，不应报错，而是提示"这幅图没有配色找不同模式"。

---

## 任务八：大图在小舞台中的展示

### 8.1 修改 `StagePreview` 组件

第 184 行，`StagePreview` 目前假设图案是 18×18 网格。对于大图，需要：

```typescript
function StagePreview({ pattern, selection, compact = false }: { pattern: Pattern; selection: StageSelection; compact?: boolean }) {
  const isAdvanced = pattern.advanced;
  return <div className={`stage-preview${compact ? " compact" : ""}${isAdvanced ? " advanced-stage" : ""}`} ...>
    {/* 大图在 stage 中缩小显示以适应舞台 */}
    <div className={`stage-character${isAdvanced ? " stage-character-advanced" : ""}`}>
      <Art pattern={pattern} bead animated />
    </div>
  </div>;
}
```

CSS 调整：

```css
.stage-character-advanced{left:10%;right:10%;bottom:2%}
.stage-character-advanced>.layered-art{width:80%}
```

### 8.2 大图的海报生成

`makePoster` 函数（第 225 行）中的 `cell` 计算：

```typescript
const cell = Math.floor((isWork ? 650 : 900) / pattern.rows[0].length);
```

对于 29×29 网格，`cell` 会更小，但 1200×1500 的画布仍然可以容纳。不需要修改。

---

## 验证清单

### 代码修改验证

- [ ] `Pattern` 类型新增 `advanced?: boolean`
- [ ] `rowsN` 和 `rows29` 辅助函数已添加
- [ ] 验证逻辑分叉：普通图案走严格规则，进阶图案走宽松规则
- [ ] `ADVANCED_PATTERNS` 数组已导出
- [ ] `isAdvancedPattern` 函数已导出
- [ ] `save-store.ts` 中的 BOARD_SIZE 硬编码已移除
- [ ] `normalizeSave` 从 pattern 读取网格尺寸
- [ ] `page.tsx` 导入 `ADVANCED_PATTERNS`
- [ ] `zoneIndices` 适配大图（不分区）
- [ ] 大图自动禁用分区 UI
- [ ] 大图默认使用点击模式
- [ ] 大图跳过模式选择界面
- [ ] 首页"进阶挑战"入口存在
- [ ] 图纸宝库可切换显示进阶图案
- [ ] `buildSpotPuzzle` 兼容 `colorways` 为空的情况
- [ ] `StagePreview` 适配大图展示
- [ ] 进阶图案 CSS 样式已添加

### 图案数据验证

- [ ] 6 个进阶图案的完整结构定义已添加
- [ ] 每个图案的 `rows` 数据已填入（或标记为占位）
- [ ] 每个图案的 `palette` 定义了所有使用的颜色
- [ ] 每个图案的 `id` 唯一
- [ ] 验证逻辑通过（或已跳过未完成的图案）

### 体验验证

- [ ] 首页能看到"进阶挑战"入口，入口样式与"自由画板""故事绘本"一致
- [ ] 点击进入后看到进阶图案列表
- [ ] 点击进阶图案直接进入手机模式
- [ ] 29×29 网格在手机上可操作（格子足够大）
- [ ] 大图不显示分区，进度条正常
- [ ] 大图可正常保存和恢复进度
- [ ] 大图完成后进入小舞台正常展示
- [ ] 普通图案完全不受影响