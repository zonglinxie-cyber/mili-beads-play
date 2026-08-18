# 米粒拼豆社 · 实现方案

> 本文档供 AI 编码模型使用，包含完整的实现规范、代码引用和边界条件。
> 项目技术栈：Next.js (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Capacitor 8
> 核心文件：`app/page.tsx`（1035 行，单组件）、`app/patterns.ts`、`app/save-store.ts`、`app/play-content.ts`、`app/globals.css`

---

## 任务一：修复手机模式擦除 Bug

### 问题描述

在 `mobile` 模式下，孩子点击已放好的豆子无法擦除。

### 根因

`app/page.tsx` 第 745-770 行，`paint()` 函数中有一个错误的短路判断：

```typescript
// 第 745-757 行
const paint = async (index: number) => {
  if (savePhaseRef.current !== "ready" || target[index] === ".") return;
  const previous = boardRef.current;
  if (previous[index] === target[index]) {
    if (drawing || mode !== "mobile" || previous[index] !== selected) return;  // ← 问题在这里
    // ... 擦除逻辑
  }
```

调用链路：
1. `onPointerDown`（第 1003 行）→ `setDrawing(true)` → `void paint(index)`
2. `paint()` 进入时，`drawing` 已经是 `true`
3. 第 749 行 `if (drawing || ...)` 立即短路返回，**擦除代码永远不会执行**

### 修复方案

**方案 A（推荐，最小改动）**：将擦除逻辑从 `paint()` 中分离，在 `onPointerDown` 中先判断是否是擦除操作。

修改 `app/page.tsx`：

**a) 新增 `erase` 函数**，放在 `paint` 函数之前（第 744 行附近）：

```typescript
const erase = async (index: number) => {
  if (savePhaseRef.current !== "ready" || target[index] === ".") return;
  const previous = boardRef.current;
  if (previous[index] !== target[index]) return; // 没有放正确的豆子，不能擦
  // 在 mobile 模式下，只有当前选中的颜色与格子上已放的豆子颜色一致时才能擦
  if (mode !== "mobile" || previous[index] !== selected) return;
  const next = [...previous];
  next[index] = ".";
  boardRef.current = next;
  if (!await saveBoardChange(next, "这颗豆子没有擦掉，请再点一次")) return;
  setUndoStack(stack => [...stack.slice(-19), previous]);
  say(companionLine(pattern.id, "mobile", "erase"), 1600);
};
```

**b) 修改 `paint()` 函数**，去掉擦除逻辑：

```typescript
const paint = async (index: number) => {
  if (savePhaseRef.current !== "ready" || target[index] === ".") return;
  const previous = boardRef.current;
  if (previous[index] === target[index]) {
    // 已放对 → 交给 erase 处理（擦除），paint 只负责放豆
    return;
  }
  // 放错颜色
  if (selected !== target[index]) {
    setMistakes(m => m + 1);
    navigator.vibrate?.(30);
    say(companionLine(pattern.id, mode ?? "mobile", "mistake", { needed: pattern.palette[target[index]].name }), 1600);
    return;
  }
  // 放豆
  const next = [...previous];
  next[index] = selected;
  boardRef.current = next;
  if (!await saveBoardChange(next, "这颗豆子没有保存，请再点一次")) return;
  setUndoStack(stack => [...stack.slice(-19), previous]);
  guideAfterPlacement(previous, next, selected);
};
```

**c) 修改 `onPointerDown` 事件处理**（第 1003 行），将擦除和放豆分开：

```typescript
onPointerDown={e => {
  e.preventDefault();
  if (mode === "spot") { paintSpot(index); return; }
  if (mode === "assistant") {
    if (cell !== selected) setSelected(cell);
    else void toggleZoneColor();
    return;
  }
  // mobile 模式：如果格子上已放了对的豆子 → 擦除；否则 → 放豆
  if (board[index] === target[index]) {
    void erase(index);
  } else {
    setDrawing(true);
    void paint(index);
  }
}}
```

**注意**：`erase` 不应受 `drawing` 状态影响，所以 `onPointerEnter` 中不需要触发擦除。拖动时只放豆，不擦除。

### 边界条件

| 场景 | 期望行为 |
|------|---------|
| 点击空格，选色正确 | 放豆 |
| 点击空格，选色错误 | 提示"这里要放xx色" |
| 点击已放对的豆子，且当前选色与该豆子颜色一致 | 擦除 |
| 点击已放对的豆子，但当前选色不同 | 不擦除（当前行为，保持一致性） |
| 拖动经过空格 | 放豆（保持拖动功能） |
| 拖动经过已放对的豆子 | 不擦除（拖动时只放不擦） |

---

## 任务二：开放自由画板

### 概述

`FREE_PALETTE`（12 色）和 `FreeDrawing` 类型已定义，但 UI 中没有任何入口。需要在首页增加「自由画板」入口，并实现完整的自由绘画交互。

### 涉及文件

- `app/page.tsx` — 新增 tab `"draw"`，新增自由画板 UI
- `app/save-store.ts` — `FreeDrawing` 类型已定义，`SaveSnapshot.drawings` 已定义，`normalizeSave` 已解析 drawings
- `app/patterns.ts` — `FREE_PALETTE` 已定义
- `app/globals.css` — 新增自由画板样式

### 需要修改的代码

#### 1. 新增 tab 类型

在 `app/page.tsx` 第 293 行，修改 `tab` 状态类型：

```typescript
const [tab, setTab] = useState<"home" | "library" | "game" | "works" | "draw">("home");
```

#### 2. 新增自由画板状态

在第 327 行附近（`iosInstallHint` 之后），新增：

```typescript
const [drawCells, setDrawCells] = useState<string[]>(() => Array(324).fill("."));
const [drawSelected, setDrawSelected] = useState("R");
const [drawingName, setDrawingName] = useState("");
const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);
```

#### 3. 在首页添加入口

在首页 `tab === "home"` 部分（第 950 行附近），在「故事绘本」按钮和「本周精选」之间插入：

```tsx
<button className="home-draw" onClick={() => {
  setEditingDrawingId(null);
  setDrawCells(Array(324).fill("."));
  setDrawSelected("R");
  setDrawingName("");
  setTab("draw");
}}>
  <span className="home-draw-art" aria-hidden="true">
    {/* 一个调色板图标或自由涂鸦图标 */}
  </span>
  <span>
    <small>自由画板</small>
    <b>画一个自己的图案</b>
    <i>选颜色涂格子，拼出你的想法</i>
  </span>
  <em>开始画</em>
</button>
```

#### 4. 新增自由画板页面

在 `tab === "draw"` 的渲染部分（在 `tab === "game"` 和 `tab === "works"` 之间，约第 1008 行附近），新增：

```tsx
{savePhase === "ready" && tab === "draw" && (
  <section className="draw-screen">
    <header className="draw-header">
      <button onClick={() => setTab("home")} aria-label="返回首页">
        <ArrowLeft aria-hidden="true" />
      </button>
      <div>
        <b>{editingDrawingId ? "编辑作品" : "自由画板"}</b>
        <small>18×18 · 12 种颜色</small>
      </div>
      <button onClick={() => {
        // 保存自由画板作品
        saveDrawing();
      }} disabled={!drawCells.some(c => c !== ".")}>
        <Check aria-hidden="true" />保存
      </button>
    </header>

    {/* 全网格预览（9×9 只显示有内容的格子，或全网格缩略图） */}
    <div className="draw-canvas">
      <div className="touch-grid" style={{"--cols": 18} as React.CSSProperties}>
        {drawCells.map((cell, index) => (
          <button
            key={index}
            className={cell !== "." ? "filled" : "empty"}
            style={cell !== "." ? { backgroundColor: FREE_PALETTE[cell].color } : undefined}
            aria-label={`第${Math.floor(index / 18) + 1}行第${(index % 18) + 1}格${cell !== "." ? `，${FREE_PALETTE[cell].name}` : ""}`}
            onPointerDown={e => {
              e.preventDefault();
              paintDrawCell(index);
            }}
            onPointerEnter={e => {
              if (drawing) {
                e.preventDefault();
                paintDrawCell(index);
              }
            }}
          />
        ))}
      </div>
    </div>

    {/* 颜色选择器 */}
    <div className="draw-palette">
      <div className="palette-head">
        <b>选颜色</b>
        <button onClick={() => {
          // 清空画板
          if (drawCells.some(c => c !== ".")) {
            setDrawCells(Array(324).fill("."));
          }
        }}>
          <RotateCcw aria-hidden="true" />清空
        </button>
      </div>
      <div className="draw-colors">
        {Object.entries(FREE_PALETTE).map(([key, color]) => (
          <button
            key={key}
            className={drawSelected === key ? "active" : ""}
            onClick={() => setDrawSelected(key)}
            aria-label={color.name}
          >
            <i style={{ background: color.color }} />
            <span>{color.name}</span>
          </button>
        ))}
      </div>
    </div>

    {/* 已保存的作品列表 */}
    {savedDrawings.length > 0 && (
      <div className="draw-saved-list">
        <h3>我的作品</h3>
        <div className="draw-grid">
          {savedDrawings.map(d => (
            <button key={d.id} className="draw-thumb" onClick={() => loadDrawing(d.id)}>
              <div className="art pixels" style={{"--cols": 18} as React.CSSProperties}>
                {d.cells.map((cell, i) => (
                  <i key={i} className={cell === "." ? "empty" : "filled"} 
                     style={cell !== "." ? { backgroundColor: FREE_PALETTE[cell]?.color } : undefined} />
                ))}
              </div>
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      </div>
    )}
  </section>
)}
```

#### 5. 实现自由画板的核心函数

在 `paint` 函数上方（第 744 行附近），新增：

```typescript
const paintDrawCell = (index: number) => {
  const next = [...drawCellsRef.current];
  if (next[index] === drawSelected) {
    // 点击已涂的颜色 → 擦除（像橡皮擦）
    next[index] = ".";
  } else {
    next[index] = drawSelected;
  }
  drawCellsRef.current = next;
  setDrawCells(next);
};
```

需要新增 ref：

```typescript
const drawCellsRef = useRef<string[]>(Array(324).fill("."));
// 在初始化时同步
drawCellsRef.current = drawCells;
```

#### 6. 保存自由画板作品

在 `saveBoardChange` 附近（第 685 行），新增：

```typescript
const saveDrawing = async () => {
  const cells = drawCellsRef.current;
  if (!cells.some(c => c !== ".")) { say("画板上还没有图案", 1600); return; }
  
  let name = drawingName.trim();
  if (!name) {
    // 如果没有输入名字，使用默认名称
    const count = savedDrawings.length + 1;
    name = `我的作品 ${count}`;
  }
  
  const now = new Date().toISOString();
  let nextDrawings: FreeDrawing[];
  
  if (editingDrawingId) {
    // 更新已有作品
    nextDrawings = savedDrawings.map(d =>
      d.id === editingDrawingId
        ? { ...d, cells, name, updatedAt: now }
        : d
    );
  } else {
    // 新建作品
    const id = `draw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newDrawing: FreeDrawing = {
      id,
      name,
      cells,
      scene: "starship-cabin",
      effect: "star-trail",
      updatedAt: now,
    };
    nextDrawings = [...savedDrawings, newDrawing].slice(-FREE_DRAWING_LIMIT);
  }
  
  setSavedDrawings(nextDrawings);
  setDrawingName("");
  setEditingDrawingId(null);
  say("作品已保存", 1000);
  
  // 持久化到 localStorage
  try {
    await persistSaveNow(
      completedRef.current,
      savedBoardsRef.current,
      activityDatesRef.current,
      stagesRef.current,
      colorwaysRef.current,
      storiesRef.current,
      nextDrawings,  // 需要修改 persistSaveNow 签名
    );
  } catch {
    say("保存失败，请再试一次");
  }
};
```

**注意**：`persistSaveNow` 当前有 6 个参数，需要增加第 7 个参数 `nextDrawings`。修改 `persistSaveNow` 函数的签名：

```typescript
const persistSaveNow = async (
  nextCompleted: string[],
  nextBoards: Record<string, string[]>,
  nextActivityDates: string[],
  nextStages = stagesRef.current,
  nextColorways = colorwaysRef.current,
  nextStories = storiesRef.current,
  nextDrawings = drawingsRef.current,
) => {
  // ...
  const snapshot: SaveSnapshot = {
    completed: nextCompleted,
    boards: nextBoards,
    activityDates: nextActivityDates,
    stages: nextStages,
    colorways: nextColorways,
    stories: nextStories,
    drawings: nextDrawings,  // 新增
  };
  // ...
};
```

同时需要新增 `drawingsRef` 和 `savedDrawings` 状态，类似 `completedRef`/`setCompleted` 的模式。

#### 7. 在作品册中展示自由画板作品

在 `tab === "works"` 部分（第 1010 行），在 "已完成图纸" 列表下方，增加自由画板作品区域：

```tsx
{savedDrawings.length > 0 && (
  <section className="works-drawings">
    <h2>自由画板作品</h2>
    <div className="work-grid">
      {savedDrawings.map(d => (
        <article key={d.id}>
          <button onClick={() => {
            // 进入小舞台展示（需要将自由画板作品转换为类似 Pattern 的结构）
            showDrawingOnStage(d);
          }}>
            <div className="stage-preview compact">
              <div className="art pixels" style={{"--cols": 18} as React.CSSProperties}>
                {d.cells.map((cell, i) => (
                  <i key={i} className={cell === "." ? "empty" : "filled"}
                     style={cell !== "." ? { backgroundColor: FREE_PALETTE[cell]?.color } : undefined} />
                ))}
              </div>
            </div>
            <b>{d.name}</b>
            <small>{new Date(d.updatedAt).toLocaleDateString("zh-CN")}</small>
          </button>
          <div className="work-actions">
            <button className="work-play" onClick={() => showDrawingOnStage(d)}>
              <Play aria-hidden="true" />进入小舞台
            </button>
            <button className="work-play secondary" onClick={() => {
              // 编辑
              setEditingDrawingId(d.id);
              setDrawCells(d.cells);
              drawCellsRef.current = d.cells;
              setDrawSelected("R");
              setDrawingName(d.name);
              setTab("draw");
            }}>
              编辑
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
)}
```

#### 8. 自由画板作品进入小舞台

需要将 `FreeDrawing` 转换为 `Pattern` 结构才能复用 `StagePreview`。新增转换函数：

```typescript
const drawingToPattern = (drawing: FreeDrawing): Pattern => {
  const rows: string[] = [];
  for (let i = 0; i < 18; i++) {
    rows.push(drawing.cells.slice(i * 18, (i + 1) * 18).join(""));
  }
  return {
    id: drawing.id,
    name: drawing.name,
    story: "我在自由画板上创作的图案",
    category: "自由画板",
    motion: "float",
    animation: "整体轻轻浮动",
    motionPlan: { body: "整体浮动", prop: "", fx: "" },
    pieceLabel: "自由作品",
    pieceSizes: [drawing.cells.filter(c => c !== ".").length],
    skillTip: "",
    estimatedMinutes: [0, 0],
    difficultyAxes: { beads: 0, colorChanges: 0, pieces: 1, articulationPoints: 0, symmetry: 0, repetition: 0 },
    difficultyLabel: "自由创作",
    difficultyWhy: "",
    playIdea: "这是你自己创作的图案",
    assemblyNotes: ["这是自由画板作品，按自己想法拼豆。"],
    childFinishLine: "拼好后请大人帮忙",
    reserveByColor: {},
    palette: Object.fromEntries(
      [...new Set(drawing.cells.filter(c => c !== "."))].map(key => [key, FREE_PALETTE[key]])
    ),
    colorways: [],
    rows,
    layers: rows.map(row => row.replace(/[^.]/g, "B")),
  };
};
```

然后 `showDrawingOnStage` 函数：

```typescript
const showDrawingOnStage = (drawing: FreeDrawing) => {
  const pattern = drawingToPattern(drawing);
  // 需要临时存储这个 pattern，以便 StagePreview 使用
  // 最简单的方式：复用 animationId 机制，但需要额外存储 pattern 数据
  setAnimationId(drawing.id);  // 使用 drawing.id 作为 key
  // 并且需要一种方式让 StagePreview 获取到这个动态 pattern
  // 建议：在 state 中新增一个字段存储动态 pattern
};
```

**注意**：当前 `StagePreview` 从 `PATTERNS` 常量中查找 pattern。自由画板作品不在 PATTERNS 中，需要修改 `StagePreview` 的渲染逻辑，或新增一个 state 来存储当前展示的动态 pattern。

建议方案：新增 state `dynamicStagePattern`，类型为 `Pattern | null`。在 `showDrawingOnStage` 中设置它，在 `StagePreview` 渲染时优先使用它。

### 样式

在 `app/globals.css` 末尾新增：

```css
/* 自由画板 */
.home-draw{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;width:100%;margin:0 0 14px;padding:12px;border-radius:22px;background:linear-gradient(135deg,#e8f5e9,#e3f2fd);border:2px solid #81c784;color:var(--ink);text-align:left;box-shadow:var(--shadow)}
.home-draw-art{width:64px;height:64px;display:grid;place-items:center;border-radius:16px;background:#fff;font-size:32px}
.home-draw>span{display:grid;gap:2px;min-width:0}
.home-draw small{font-size:11px;font-weight:900;letter-spacing:1px;color:#388e3c}
.home-draw b{font-size:18px;line-height:1.2}
.home-draw i{font-style:normal;font-size:12px;color:var(--muted);font-weight:700}
.home-draw em{font-style:normal;font-size:13px;font-weight:900;background:#66bb6a;color:#fff;border-radius:12px;padding:10px 12px;white-space:nowrap}
.draw-screen{margin:0 -16px;min-height:100dvh;background:#f3f0ea}
.draw-header{height:61px;display:grid;grid-template-columns:42px 1fr 54px;align-items:center;background:#fffdf8;padding:0 10px;position:sticky;top:0;z-index:25;border-bottom:1px solid var(--line)}
.draw-header>button{height:36px;border-radius:11px;background:#eee7f3;color:#59466e;font-size:9px;font-weight:900}
.draw-header>button:first-child{font-size:26px;background:transparent;text-align:left}
.draw-header div{text-align:center}
.draw-header b{display:block;font-size:14px}
.draw-header small{display:block;font-size:8px;color:var(--muted)}
.draw-canvas{max-width:420px;margin:12px auto;padding:8px}
.draw-canvas .touch-grid{grid-template-columns:repeat(18,1fr)!important;gap:2px}
.draw-canvas .touch-grid button{border-radius:3px;min-height:0;aspect-ratio:1;background:#f7efe4}
.draw-canvas .touch-grid button.filled{border-radius:3px;box-shadow:inset 0 -1.5px 1px #0003}
.draw-colors{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:8px 12px 16px}
.draw-colors button{min-height:52px;border-radius:12px;background:#fff;border:2px solid #e2d7e8;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 4px}
.draw-colors button.active{border-color:var(--purple);background:#f1eaf7}
.draw-colors button i{width:24px;height:24px;border-radius:50%;box-shadow:inset 0 -2px #0003}
.draw-colors button span{font-size:10px;font-weight:800}
.draw-saved-list{padding:0 12px 20px}
.draw-saved-list h3{font-size:14px;margin:0 0 10px}
.draw-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.draw-thumb{display:flex;flex-direction:column;gap:4px;padding:6px;border-radius:12px;background:#fff;border:1px solid var(--line);text-align:center}
.draw-thumb .art{width:100%;aspect-ratio:1;border-radius:6px;overflow:hidden}
.draw-thumb span{font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.works-drawings{margin-top:24px}
.works-drawings h2{font-size:14px;margin:0 0 10px;padding:0 4px}
```

### 边界条件

| 场景 | 期望行为 |
|------|---------|
| 首次打开自由画板 | 全空白网格，默认选中红色 |
| 点击空格 | 涂上当前选中的颜色 |
| 点击已涂色的格子 | 擦除该格（像橡皮擦） |
| 拖动涂色 | 沿手指路径连续涂色 |
| 保存空画板 | 提示"画板上还没有图案" |
| 作品达到 24 个上限 | 替换最早的作品（`FREE_DRAWING_LIMIT`） |
| 编辑已有作品 | 加载原有格子状态，保存时覆盖原作品 |
| 在作品册点击自由画板作品 | 进入小舞台展示 |
| 自由画板作品进入小舞台 | 显示画板内容 + 背景/特效选择器 |

---

## 任务三：触控优化（手机模式默认点击模式）

### 问题描述

当前手机模式（`mobile`）使用 `onPointerDown` + `onPointerEnter` + `onPointerUp` 的拖动模型。在安卓微信浏览器中：
1. 手指精度有限，18×18 的格子太小，拖动容易误触相邻格
2. `onPointerEnter` 在部分安卓浏览器上行为不一致
3. 拖动模式对"先选颜色再点格子"的拼豆场景不自然

### 方案

将手机模式（`mobile`）的默认交互改为**点击模式**：孩子先选颜色，再点击格子放置。拖动模式作为可选替代。

### 修改内容

#### 1. 新增交互模式状态

在 `app/page.tsx` 第 297 行附近，新增：

```typescript
const [tapMode, setTapMode] = useState(true); // true=点击模式, false=拖动模式
```

#### 2. 修改游戏界面的模式提示

在 `tab === "game"` 的 header 区域（第 987 行附近），在 `hint` 开关按钮旁增加模式切换按钮：

```typescript
// 在 game-header 中，hint 按钮旁边
{mode === "mobile" && (
  <button onClick={() => setTapMode(v => !v)}>
    {tapMode ? "点击模式" : "拖动模式"}
  </button>
)}
```

#### 3. 修改 `color-goal` 中的提示文字

在第 995 行，根据 `tapMode` 显示不同的提示：

```typescript
<small>
  {mode === "mystery" 
    ? (completedColors.includes(selected) ? "这一层已揭开" : `还差 ${currentColorTotal - currentColorDone} 颗揭开`)
    : mode === "assistant" 
      ? "点这个颜色的豆子，整组会一起记下"
      : tapMode 
        ? "先选颜色，再点格子放豆" 
        : hint 
          ? "点空格放豆，点已放的豆子可擦掉" 
          : "提示已关闭，点已放的豆子可擦掉"}
</small>
```

#### 4. 修改 `onPointerDown` 事件处理

在 `mobile` 模式下，点击模式不应触发 `drawing` 状态，也不应使用 `onPointerEnter`：

```typescript
onPointerDown={e => {
  e.preventDefault();
  if (mode === "spot") { paintSpot(index); return; }
  if (mode === "assistant") {
    if (cell !== selected) setSelected(cell);
    else void toggleZoneColor();
    return;
  }
  if (mode === "mobile") {
    if (tapMode) {
      // 点击模式：每次点击只操作一个格子
      if (board[index] === target[index]) {
        void erase(index);
      } else {
        void paint(index);
      }
      return;
    }
    // 拖动模式：保持现有逻辑
    if (board[index] === target[index]) {
      void erase(index);
    } else {
      setDrawing(true);
      void paint(index);
    }
    return;
  }
  // 其他模式（mystery）保持现有拖动逻辑
  setDrawing(true);
  void paint(index);
}}
```

#### 5. 修改 `onPointerEnter`

在点击模式下，`onPointerEnter` 不应触发任何操作：

```typescript
onPointerEnter={e => {
  if (mode === "mobile" && tapMode) return; // 点击模式忽略拖动
  if (mode !== "assistant" && mode !== "spot" && drawing) {
    e.preventDefault();
    void paint(index);
  }
}}
```

### 边界条件

| 场景 | 期望行为 |
|------|---------|
| 点击模式，点击空格，选色正确 | 放一颗豆 |
| 点击模式，点击空格，选色错误 | 提示"这里要放xx色" |
| 点击模式，点击已放对的豆子 | 擦除（如果选色一致） |
| 点击模式，拖动手指 | 不触发任何操作 |
| 拖动模式，拖动手指 | 沿路径连续放豆（保持现有行为） |
| 在两种模式间切换 | 不影响已放好的豆子 |

---

## 附：启动验证清单

完成以上三个任务后，手动验证以下场景：

### 手机模式擦除 Bug
- [ ] 手机模式，放一颗豆 → 点它 → 豆子被擦除
- [ ] 手机模式，拖动手指 → 连续放豆
- [ ] 手机模式，拖动过程中经过已放好的豆子 → 不擦除
- [ ] 助手模式，不受影响

### 自由画板
- [ ] 首页能看到「自由画板」入口
- [ ] 点击入口进入空白 18×18 网格
- [ ] 选色后点击格子涂色
- [ ] 点击已涂色格子擦除
- [ ] 拖动涂色
- [ ] 保存作品
- [ ] 在作品册看到保存的作品
- [ ] 点击作品进入小舞台
- [ ] 编辑已有作品
- [ ] 清空画板
- [ ] 保存后刷新页面，作品仍在

### 触控优化
- [ ] 手机模式默认是点击模式
- [ ] 点击模式每次只放一颗豆
- [ ] 切换为拖动模式后拖动正常
- [ ] 模式切换不影响已放豆子
- [ ] 提示文字随模式切换变化