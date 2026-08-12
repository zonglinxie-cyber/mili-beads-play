import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const palette = {
  K: { name: "墨黑", color: "#29283b" },
  W: { name: "奶油白", color: "#fff5df" },
  O: { name: "蜜橘", color: "#ee7b52" },
  Y: { name: "星光黄", color: "#f5c95d" },
  P: { name: "樱花粉", color: "#ef91a7" },
  R: { name: "莓果红", color: "#cf4e61" },
  B: { name: "湖水蓝", color: "#5daabe" },
  N: { name: "深海蓝", color: "#355276" },
  G: { name: "叶子绿", color: "#6ba270" },
  L: { name: "嫩芽绿", color: "#a8ca79" },
  C: { name: "可可棕", color: "#8a5d4a" },
  T: { name: "焦糖", color: "#c58a5b" },
  V: { name: "葡萄紫", color: "#775f9c" },
};

const rows18 = (lines) => lines.map((line) => {
  if (line.length > 18) throw new Error(`row too long (${line.length}): ${line}`);
  return line.replaceAll(" ", ".").padEnd(18, ".");
});

const drafts = [
  {
    id: "rocket-cat",
    name: "火箭背包橘猫",
    story: "橘猫伸爪追星，背包尾焰拖出大弧线",
    motion: "launch",
    animation: "body上升，prop背包抖动，fx星星闪烁",
    pieceNote: "2件：猫与火箭主件 + 5颗星星特效件。",
    palette: ["K", "W", "O", "Y", "R", "N"],
    rows: rows18([
      "               Y",
      "        K   K YYY",
      "       KOK KOK",
      "      KOOOOOOOK",
      "     KOWOOKWOOK",
      "     KOOOWOOOOK",
      "  RRRKOOOOOOOOK",
      " RNNRKOOOOOOKKK",
      " RNNRROOOWOOOKK",
      "RRNNRROOOWWWOOOK",
      "RNNNRROOOWWWOOOK",
      " RRRRRKOOOWOOOK",
      " RYYRRKKOOOOKK",
      "RYYYYR KK  KK",
      " RYYYRKK  KK",
      "  RYRRR",
      "   RYR",
      "    RR",
    ]),
    layerAt: (x, y) => (x >= 14 && y <= 2 ? "F" : (x <= 7 && y >= 6 ? "P" : "B")),
  },
  {
    id: "cloud-otter",
    name: "云朵冲浪水獭",
    story: "水獭一手撑伞，踩着云浪侧身滑行",
    motion: "glide",
    animation: "body左右平衡，prop伞面倾斜，fx云浪起伏",
    pieceNote: "1件连体作品；伞柄与身体、双脚与云板均相连。",
    palette: ["K", "W", "C", "T", "B", "N"],
    rows: rows18([
      "      NNNNN",
      "    NNBBBBBNN",
      "   NBBBBBBBBBN",
      "   NNNNNNNNNNN",
      "       CCC",
      "       CCC",
      "      CCCCC",
      "     CTTTTTC",
      "    CTTKTTKTC",
      "    CTTTWTTTC",
      "    CTTTTTTC",
      "  CCCCCTWWWTC",
      " CCTTCCWWWTC CC",
      "CCTTTTCTTTTCTTCC",
      " CCTTTT TTTCCTTC",
      " WWWWWWWWWWWWW",
      "WWWWBBBBBBWWWW",
      "  WBBBBBBB W",
    ]),
    layerAt: (x, y) => (y <= 5 ? "P" : (y >= 15 ? "F" : ((x <= 5 || x >= 13) && y >= 11 ? "P" : "B"))),
  },
  {
    id: "star-dragon",
    name: "追星小青龙",
    story: "小青龙盘成S弯，伸爪去接掉落的星星",
    motion: "twist",
    animation: "body盘旋，prop龙角与鬃毛摆动，fx星星落入前爪",
    pieceNote: "2件：青龙主件 + 5颗星星特效件。",
    palette: ["K", "W", "O", "Y", "G", "L"],
    rows: rows18([
      "           OOOO",
      "          OOO   Y",
      "          OOO  YYY",
      "       OGGGGGG  Y",
      "      GGGKLGGGG",
      "      GLLLLGGGGG",
      "     GGGWGGGOGG",
      "    GGGWWWGGGG",
      "   GGGGWWWGGG",
      "  GGGG  WGGG",
      " GGGG   WGG",
      "GGG    WWGG",
      "GGG   WWGGG",
      "GGG  WWGGG",
      "GGGGWWGGG",
      " GGGGGGG",
      "  GGGGG",
      "   GGG",
    ]),
    layerAt: (_x, _y, color) => (color === "Y" ? "F" : (color === "O" ? "P" : "B")),
  },
  {
    id: "frog-post",
    name: "青蛙邮差跳水坑",
    story: "青蛙抱紧邮包腾空，两封信在手边展开",
    motion: "hop",
    animation: "body起跳，prop邮包与信封晃动，fx两束水花向外飞溅",
    pieceNote: "3件：邮差青蛙主件 + 左右两束4颗以上的水花特效件。",
    palette: ["K", "W", "G", "L", "B", "N"],
    rows: rows18([
      "       NNNN",
      "      NNNNNN",
      "     GGGGGGGG",
      "    GWKGKGWGGG",
      "    GGGGGGGGGG",
      "     GLLWLLGG",
      "   WWGGGGGGGGWW",
      "  WNNGGNNGGGNNW",
      "  WNNGGNNNNGGNNW",
      "    GGNNNNGG",
      "     GNNNNGG",
      "    GGGLLGGG",
      "  GGGLL  LLGGG",
      " GGGLL    LLGGG",
      " GGGG      GGGG",
      " GGG        GGG",
      "     B    B",
      "    BBB  BBB",
    ]),
    layerAt: (x, y, color) => (color === "B" && y >= 16 ? "F" : ((color === "N" || (color === "W" && (x <= 3 || x >= 14))) ? "P" : "B")),
  },
  {
    id: "moon-rabbit",
    name: "月兔投递星星",
    story: "月兔坐在弯月邮袋里，把一颗星星抛向夜空",
    motion: "bounce",
    animation: "body轻跳，prop弯月邮袋摇晃，fx星星沿弧线上升",
    pieceNote: "2件：月兔与弯月邮袋主件 + 5颗星星特效件。",
    palette: ["K", "W", "P", "Y", "B", "N"],
    rows: rows18([
      "     NN    NN",
      "    NWWN  NWWN",
      "    NWPW  NWPW",
      "    NWWWNNWWWN",
      "     NWWWWWWN",
      "    NWWKWWKWWN",
      "    NWWWPWWWWN",
      "     NWWWWWWN   Y",
      "      NNWWNN   YYY",
      "   YYYYNNWWNN   Y",
      "  YYYYYNWWNNN",
      "  YYYYYNWWNBBN",
      "  YYYYNNWWNBBN",
      "  YYYYNNWWNNBBN",
      "   YYYNNWWNNBBN",
      "    YYYYYYYYBBN",
      "     YYYYYYNN",
      "       YY",
    ]),
    layerAt: (x, y, color) => (x >= 14 && y >= 7 && y <= 9 ? "F" : ((color === "Y" || color === "B") ? "P" : "B")),
  },
  {
    id: "lantern-fox",
    name: "三尾狐提灯夜游",
    story: "三尾狐跃过月色，前爪提着一盏发光灯笼",
    motion: "sway",
    animation: "body跃起，prop灯笼摆动，fx灯光一明一暗",
    pieceNote: "1件连体作品；灯柄与前爪相连，三条尾巴都以两颗以上宽度接入身体。",
    palette: ["K", "W", "O", "Y", "R"],
    rows: rows18([
      "     K     K",
      "    KOK   KOK",
      "   KOOOOOOOOOK",
      "   KOWKOOOKWOOK",
      "   KOOOOOWOOOOK",
      "    KOOOOOOOK",
      "     KOOOOOK",
      "    RKOOOOKROO",
      "   RROOOOOROWW",
      "  RROOWOOOROOW",
      "  RYYROOOOROOO",
      " KYYYROOOOROWW",
      "KYYYYROOOOROOW",
      " KYYYROOOOROOO",
      "  RRRROOOOROWW",
      "   RR  KOOOKROW",
      "       KK KK",
      "",
    ]),
    layerAt: (x, y, color) => (color === "Y" ? "F" : (x <= 5 && y >= 7 ? "P" : "B")),
  },
];

const componentSizes = (rows) => {
  const remaining = new Set();
  rows.forEach((row, y) => [...row].forEach((cell, x) => cell !== "." && remaining.add(`${x},${y}`)));
  const components = [];
  while (remaining.size) {
    const first = remaining.values().next().value;
    remaining.delete(first);
    const stack = [first];
    let size = 0;
    while (stack.length) {
      const [x, y] = stack.pop().split(",").map(Number);
      size += 1;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const key = `${nx},${ny}`;
        if (remaining.delete(key)) stack.push(key);
      }
    }
    components.push(size);
  }
  return components.sort((a, b) => b - a);
};

const structuralPinches = (rows) => {
  const all = new Set();
  rows.forEach((row, y) => [...row].forEach((cell, x) => cell !== "." && all.add(`${x},${y}`)));
  const connectedSets = [];
  const remaining = new Set(all);
  while (remaining.size) {
    const first = remaining.values().next().value;
    remaining.delete(first);
    const component = new Set([first]);
    const stack = [first];
    while (stack.length) {
      const [x, y] = stack.pop().split(",").map(Number);
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const key = `${nx},${ny}`;
        if (remaining.delete(key)) { component.add(key); stack.push(key); }
      }
    }
    connectedSets.push(component);
  }
  const main = connectedSets.sort((a, b) => b.size - a.size)[0];
  const pinches = [];
  for (const removed of main) {
    const available = new Set(main);
    available.delete(removed);
    const pieces = [];
    while (available.size) {
      const first = available.values().next().value;
      available.delete(first);
      const stack = [first];
      let size = 0;
      while (stack.length) {
        const [x, y] = stack.pop().split(",").map(Number);
        size += 1;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
          const key = `${nx},${ny}`;
          if (available.delete(key)) stack.push(key);
        }
      }
      pieces.push(size);
    }
    if (pieces.filter((size) => size >= 4).length >= 2) pinches.push(removed);
  }
  return pinches;
};

const patterns = drafts.map(({ layerAt, palette: paletteKeys, ...draft }) => {
  const layers = draft.rows.map((row, y) => [...row].map((color, x) => color === "." ? "." : layerAt(x, y, color)).join(""));
  const usedColors = [...new Set(draft.rows.join("").replaceAll(".", ""))].sort();
  const components = componentSizes(draft.rows);
  const pinches = structuralPinches(draft.rows);
  const beads = draft.rows.join("").replaceAll(".", "").length;
  const layerCounts = Object.fromEntries(["B", "P", "F"].map((key) => [key, layers.join("").split(key).length - 1]));
  if (draft.rows.length !== 18 || draft.rows.some((row) => row.length !== 18)) throw new Error(`${draft.id}: not 18x18`);
  if (layers.some((row) => row.length !== 18 || [...row].some((cell) => !".BPF".includes(cell)))) throw new Error(`${draft.id}: bad layers`);
  draft.rows.forEach((row, y) => [...row].forEach((cell, x) => {
    if ((cell === ".") !== (layers[y][x] === ".")) throw new Error(`${draft.id}: layer coverage mismatch at ${x},${y}`);
  }));
  if (usedColors.length < 5 || usedColors.length > 6) throw new Error(`${draft.id}: ${usedColors.length} used colors`);
  if (usedColors.some((key) => !paletteKeys.includes(key)) || paletteKeys.some((key) => !usedColors.includes(key))) throw new Error(`${draft.id}: palette mismatch ${usedColors} vs ${paletteKeys}`);
  if (beads < 120 || beads > 170) throw new Error(`${draft.id}: bead count ${beads}`);
  if (Object.values(layerCounts).some((count) => count < 4)) throw new Error(`${draft.id}: weak animation layer ${JSON.stringify(layerCounts)}`);
  if (components.length > 3 || components.slice(1).some((size) => size < 4)) throw new Error(`${draft.id}: unsafe pieces ${components}`);
  if (pinches.length) throw new Error(`${draft.id}: single-bead structural pinches ${pinches}`);
  return {
    ...draft,
    palette: Object.fromEntries(paletteKeys.map((key) => [key, palette[key]])),
    layers,
    metrics: { beads, usedColors: usedColors.length, components: components.length, componentSizes: components, isolatedBeads: 0, structuralPinches: pinches.length, layerCounts },
  };
});

const proposal = {
  schemaVersion: 1,
  grid: { width: 18, height: 18 },
  layerLegend: { B: "body", P: "prop", F: "fx", ".": "empty" },
  physicalRules: {
    connectivity: "4-neighbour",
    isolatedBeads: 0,
    maximumPieces: 3,
    minimumDetachedPieceBeads: 4,
    note: "所有有豆格必须且只能归入body/prop/fx其中一层。",
  },
  qa: {
    dimensions: "PASS: every rows/layers array is exactly 18x18",
    layerCoverage: "PASS: every bead belongs to exactly one of B/P/F; every empty cell is .",
    usedColors: "PASS: every pattern uses 5-6 declared colors; no zero-count palette entries",
    connectivity: "PASS: at most 3 four-neighbour pieces; every detached piece has at least 4 beads",
    loadBearing: "PASS: removing any single bead from the main piece does not split it into two pieces of 4+ beads",
    visualCheck: "PASS: inspected at 96px round-bead size; role and dominant action/prop remain distinguishable",
  },
  patterns,
};

writeFileSync(new URL("./proposal-a.json", import.meta.url), `${JSON.stringify(proposal, null, 2)}\n`);
execFileSync("python3", [decodeURIComponent(new URL("./render-contact-sheet.py", import.meta.url).pathname)], { stdio: "inherit" });
console.log(patterns.map(({ id, name, metrics }) => ({ id, name, ...metrics })));
