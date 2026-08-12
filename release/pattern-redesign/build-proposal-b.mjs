import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUT_DIR = path.dirname(fileURLToPath(import.meta.url));

const COLORS = {
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
  const row = line.replaceAll(" ", ".");
  if (row.length > 18) throw new Error(`超过 18 格：${line} (${row.length})`);
  return row.padEnd(18, ".");
});

const definitions = [
  {
    id: "bottle-jelly",
    name: "瓶中发光水母",
    story: "摇一摇玻璃瓶，水母把海底星光点亮。",
    actionRead: "瓶身稳、伞盖宽、三条触手会左右摆动",
    animationPlan: { body: "瓶身轻轻晃动", prop: "水母伞盖呼吸发光、触手错拍摆动", fx: "两颗瓶中星光依次闪烁" },
    palette: ["N", "W", "B", "V", "P", "Y"],
    rows: rows18([
      "       NNNN",
      "      NWWWWN",
      "      NNNNNN",
      "     NBBBBBBN",
      "    NBBBBBBBBN",
      "   NBBYBBBBYBBN",
      "   NBBVVVVVVBBN",
      "   NBBVPPPPVBBN",
      "   NBBVPNNPVBBN",
      "   NBBVVPPVVBBN",
      "   NBBBBPPBBBBN",
      "   NBBBPBBPBBBN",
      "   NBBPBPBPBBBN",
      "   NBBPBPBPBBBN",
      "    NBBPBPBBBN",
      "     NBBBBBBN",
      "      NNNNNN",
      "       NNNN",
    ]),
    layerAt: (x, y, color) => {
      if (color === "Y") return "F";
      if (color === "V" || color === "P" || (color === "N" && y === 8 && x >= 8 && x <= 9)) return "P";
      return "B";
    },
    pieces: [],
  },
  {
    id: "lion-poles",
    name: "醒狮飞越梅花桩",
    story: "锣鼓一响，小醒狮腾空咬住最高的红包。",
    actionRead: "大头醒狮收腿腾空，前低后高三根桩形成跃动路线",
    animationPlan: { body: "醒狮眨眼、昂头、四肢收放", prop: "三根梅花桩依次亮起", fx: "无独立特效散件，避免小零件" },
    palette: ["K", "W", "Y", "O", "R", "G"],
    rows: rows18([
      "      RRRR",
      "    RRYYYYRR",
      "   RRWWYYWWRR",
      "  RWWKWWWWKWWR",
      "  RWWWWOOWWWWR",
      "   RRYWWWWYRR",
      "    YYRRRRYY",
      "     OOOOOO",
      "   OOOOWWOOOO",
      "  ROOOKOOKOOOR",
      " RROOOOOOOOOORR",
      " RRROO    OORRR",
      "  RROO    OORR",
      "   RRR    RRR",
      "YYY    YYY    YYY",
      "GGG    GGG    GGG",
      " G      G      G",
      " G      G      G",
    ]),
    layerAt: (_x, y) => y >= 14 ? "P" : "B",
    pieces: [
      { name: "左梅花桩", kind: "prop", expectedMinBeads: 7, placement: "按图摆在醒狮左下方" },
      { name: "中梅花桩", kind: "prop", expectedMinBeads: 7, placement: "按图摆在醒狮正下方" },
      { name: "右梅花桩", kind: "prop", expectedMinBeads: 7, placement: "按图摆在醒狮右下方" },
    ],
  },
  {
    id: "sushi-train",
    name: "寿司列车猫店长",
    story: "猫店长一挥爪，今日特供就沿着小铁轨出发。",
    actionRead: "猫耳与店长脸占上半部，车头、两盘寿司和双轮在下半部",
    animationPlan: { body: "猫店长挥爪，列车车轮循环滚动", prop: "两盘寿司轻轻弹跳", fx: "无独立特效散件，整车一体更耐用" },
    palette: ["K", "W", "O", "R", "G", "N"],
    rows: rows18([
      "   K      K",
      "  KOK    KOK",
      "  KOWKKKKWOK",
      "  KOWWWWWWOK",
      "  KWKWWWWKWK",
      "  KWWOOWWWWK",
      "   KWWWWWWK",
      "    KKWWKK",
      "  NNNNNNNNNNNNNN",
      "  NNWWNN WRRWGGN",
      " NNWONN WRRWGGGN",
      " NNNNNN WWWWGGGN",
      "  NNNNNNNNNNNNNN",
      "   NNNNNNNNNNNN",
      "   KKK      KKK",
      "  KNNNK    KNNNK",
      "   KKK      KKK",
      "",
    ]),
    layerAt: (x, y, color) => (y >= 9 && y <= 12 && x >= 8 && (color === "W" || color === "R" || color === "G")) ? "P" : "B",
    pieces: [],
  },
  {
    id: "icecream-rocket",
    name: "冰淇淋火箭起飞",
    story: "草莓味燃料装满，下一站是甜甜星。",
    actionRead: "双层草莓冰淇淋像火箭头，甜筒机身带双翼，底部喷出粗尾焰",
    animationPlan: { body: "冰淇淋火箭左右校准后上升", prop: "蓝色舷窗闪出表情", fx: "粗尾焰伸缩，右上甜甜星闪烁" },
    palette: ["W", "P", "R", "B", "Y", "C"],
    rows: rows18([
      "              Y",
      "             YYY",
      "     WWWWWW   Y",
      "     WPPPPW",
      "    WPPPPPPW",
      "    WPRPPRPW",
      "     WPPPPW",
      "     WWWWWW",
      "     CCCCCCC",
      "   RRCCBBBCCRR",
      "  RRRCCBYBCCRRR",
      "  RRRCCCCCCCRRR",
      "   RR CCCCC RR",
      "      CCCCC",
      "       YYY",
      "      YRRY",
      "     YRRRRY",
      "      RRRR",
    ]),
    layerAt: (x, y, color) => {
      if ((x >= 13 && y <= 2) || y >= 14) return "F";
      if ((color === "B" || color === "Y") && y >= 9 && y <= 10) return "P";
      return "B";
    },
    pieces: [{ name: "甜甜星", kind: "fx", expectedMinBeads: 5, placement: "摆在火箭右上方，星尖朝上" }],
  },
  {
    id: "rainbow-duck",
    name: "滑板鸭飞越彩虹",
    story: "压低身体，鸭鸭从彩虹坡顶起跳。",
    actionRead: "戴蓝帽的鸭子前倾，绿滑板悬空，右下彩虹坡形成起跳方向",
    animationPlan: { body: "鸭子压低、伸翅、抬头", prop: "滑板翻半圈，彩虹坡依次亮色", fx: "无小散件，以轮子转动表现速度" },
    palette: ["K", "Y", "O", "B", "R", "G"],
    rows: rows18([
      "      BBB",
      "    BBYYYY",
      "   BYYKYYY",
      "  BYYYYYOYY",
      "   YYYOOOYY",
      "    YYYYYY",
      "   BBYYYYBB",
      "    YYYYY",
      "     YY YY",
      "  GGGGGGGGGGG",
      "  GGGGGGGGGGG",
      "   KKK   KKK",
      "",
      "          RRRRR",
      "        RROOOO",
      "      RROOYYYY",
      "   RROOYYGGGGG",
      "RROOYYGGBBBBB",
    ]),
    layerAt: (_x, y) => y >= 9 ? "P" : "B",
    pieces: [{ name: "彩虹起跳坡", kind: "prop", expectedMinBeads: 40, placement: "摆在滑板鸭右下方，坡顶朝右" }],
  },
  {
    id: "whale-castle",
    name: "鲸鱼驮着星星城",
    story: "鲸鱼一喷水，背上的星星城就亮起一层。",
    actionRead: "三塔城堡稳坐鲸背，鲸尾向左、圆头向右，右上水花标出前进方向",
    animationPlan: { body: "鲸鱼尾鳍摆动、白肚皮上下呼吸", prop: "三座塔的黄窗从左到右点亮", fx: "右上水花展开再落回" },
    palette: ["K", "W", "Y", "B", "N", "V"],
    rows: rows18([
      "    V   V   V",
      "   VVV VVV VVV",
      "   VYV VYV VYV",
      "   VVVVVVVVVVV",
      "    VVYVVYVVV",
      "    VVVVVVVVV",
      "     NNNNNNN   BBB",
      "      NNNNN   BBB",
      "  NNNBBBBBBBN",
      " NNBBBBBBBBBBBBBN",
      " NBBBBBBBBBBBBBBN",
      " NNBBBBBBBBBBKBN",
      "   NBBBBBWWBBBBBBN",
      "    NBBBWWWWBBBBN",
      "     NNWWWWBBNN",
      "       NNNNNN",
      "",
      "",
    ]),
    layerAt: (x, y) => {
      if (y <= 5) return "P";
      if ((y === 6 && x >= 15) || (y === 7 && x >= 14)) return "F";
      if (y === 6) return "P";
      if (y === 7) return "P";
      return "B";
    },
    pieces: [{ name: "喷水水花", kind: "fx", expectedMinBeads: 4, placement: "摆在鲸鱼额头右上方" }],
  },
];

function neighbors(x, y) {
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
}

function cellsFromRows(rows, include = () => true) {
  const cells = new Set();
  rows.forEach((row, y) => [...row].forEach((color, x) => {
    if (color !== "." && include(x, y, color)) cells.add(`${x},${y}`);
  }));
  return cells;
}

function componentsOf(cells) {
  const remaining = new Set(cells);
  const components = [];
  while (remaining.size) {
    const first = remaining.values().next().value;
    remaining.delete(first);
    const component = new Set([first]);
    const stack = [first];
    while (stack.length) {
      const [x, y] = stack.pop().split(",").map(Number);
      for (const [nx, ny] of neighbors(x, y)) {
        const key = `${nx},${ny}`;
        if (remaining.delete(key)) {
          component.add(key);
          stack.push(key);
        }
      }
    }
    components.push(component);
  }
  return components.sort((a, b) => b.size - a.size);
}

function loadBearingNecks(component) {
  const original = new Set(component);
  const critical = [];
  for (const point of original) {
    const rest = new Set(original);
    rest.delete(point);
    const parts = componentsOf(rest);
    if (parts.length > 1 && parts.at(-1).size >= 4) {
      critical.push({ cell: point, splitSizes: parts.map((part) => part.size) });
    }
  }
  return critical;
}

function boundsOf(component) {
  const points = [...component].map((key) => key.split(",").map(Number));
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

function patternMetrics(pattern) {
  const allCells = cellsFromRows(pattern.rows);
  const components = componentsOf(allCells);
  const actualColors = [...new Set(pattern.rows.join("").replaceAll(".", ""))].sort();
  const bodyCells = cellsFromRows(pattern.rows, (x, y, color) => pattern.layerAt(x, y, color) === "B");
  const bodyComponents = componentsOf(bodyCells);
  const layerCounts = { B: 0, P: 0, F: 0 };
  pattern.rows.forEach((row, y) => [...row].forEach((color, x) => {
    if (color !== ".") layerCounts[pattern.layerAt(x, y, color)] += 1;
  }));
  return {
    beadCount: allCells.size,
    actualColors,
    colorCount: actualColors.length,
    componentSizes: components.map((component) => component.size),
    mainPieceBeads: components[0].size,
    detachedPieceCount: components.length - 1,
    bodyComponentSizes: bodyComponents.map((component) => component.size),
    loadBearingNecks: loadBearingNecks(components[0]),
    layerCounts,
  };
}

function validate(pattern, metrics) {
  if (pattern.rows.length !== 18 || pattern.rows.some((row) => row.length !== 18)) throw new Error(`${pattern.id}: 非 18×18`);
  if (metrics.beadCount < 110 || metrics.beadCount > 170) throw new Error(`${pattern.id}: 颗数 ${metrics.beadCount} 不在 110–170`);
  if (metrics.colorCount < 5 || metrics.colorCount > 6) throw new Error(`${pattern.id}: 实际颜色 ${metrics.colorCount}`);
  if (metrics.actualColors.some((key) => !pattern.palette.includes(key))) throw new Error(`${pattern.id}: 使用了 palette 外颜色`);
  if (pattern.palette.some((key) => !metrics.actualColors.includes(key))) throw new Error(`${pattern.id}: palette 含未使用色`);
  if (metrics.detachedPieceCount > 3) throw new Error(`${pattern.id}: 散件超过 3`);
  if (metrics.componentSizes.slice(1).some((size) => size < 4)) throw new Error(`${pattern.id}: 存在少于 4 颗的散件 ${metrics.componentSizes}`);
  // Layer masks are semantic animation masks: cutting prop/fx out of a fused
  // physical piece can split the remaining body mask even when the piece
  // itself is robustly connected. Physical connectivity is audited above.
  if (metrics.loadBearingNecks.length) throw new Error(`${pattern.id}: 主件存在单豆承重颈 ${JSON.stringify(metrics.loadBearingNecks.slice(0, 3))}`);
  if (metrics.detachedPieceCount !== pattern.pieces.length) throw new Error(`${pattern.id}: pieces 声明与连通块不一致`);
}

const patterns = definitions.map((definition) => {
  const layers = definition.rows.map((row, y) => [...row].map((color, x) => color === "." ? "." : definition.layerAt(x, y, color)).join(""));
  const metrics = patternMetrics(definition);
  validate(definition, metrics);
  const detachedComponents = componentsOf(cellsFromRows(definition.rows)).slice(1)
    .sort((a, b) => boundsOf(a).minX - boundsOf(b).minX);
  const pieces = definition.pieces.map((piece, index) => {
    const component = detachedComponents[index];
    if (!component || component.size < piece.expectedMinBeads) throw new Error(`${definition.id}: ${piece.name} 未达到声明颗数`);
    return { ...piece, beadCount: component.size, bounds: boundsOf(component), physicalRelationship: "detached" };
  });
  return {
    id: definition.id,
    name: definition.name,
    story: definition.story,
    grid: { columns: 18, rows: 18 },
    palette: Object.fromEntries(definition.palette.map((key) => [key, COLORS[key]])),
    rows: definition.rows,
    layers,
    layerLegend: { B: "body", P: "prop", F: "fx", ".": "empty" },
    actionRead: definition.actionRead,
    animationPlan: definition.animationPlan,
    pieces,
    metrics: { ...metrics, loadBearingNecks: metrics.loadBearingNecks.length, layerCoverageMatchesBeads: Object.values(metrics.layerCounts).reduce((sum, count) => sum + count, 0) === metrics.beadCount },
  };
});

const proposal = {
  schemaVersion: 1,
  generatedAt: "2026-08-12",
  constraints: {
    grid: "18×18",
    targetBeads: "120–170（110–119 仅在造型需要时接受）",
    actualColors: "5–6",
    connectivity: "四邻域；物理主件单连通；主件无可拆下 ≥4 颗区域的单豆承重颈",
    detachedPieces: "最多 3 件，且每件至少 4 颗",
    layers: "每个有豆格恰好属于 body / prop / fx 之一",
  },
  patterns,
};

fs.writeFileSync(path.join(OUT_DIR, "proposal-b.json"), `${JSON.stringify(proposal, null, 2)}\n`);

const cell = 10;
const grid = 18 * cell;
const cardW = 260;
const cardH = 258;
const margin = 26;
const width = margin * 2 + cardW * 3 + 24 * 2;
const height = margin * 2 + cardH * 2 + 24;
const beadSvg = (pattern, ox, oy) => {
  const gx = ox + 40;
  const gy = oy + 48;
  const beads = [];
  pattern.rows.forEach((row, y) => [...row].forEach((key, x) => {
    if (key === ".") return;
    const color = COLORS[key].color;
    beads.push(`<circle cx="${gx + x * cell + cell / 2}" cy="${gy + y * cell + cell / 2}" r="4.35" fill="${color}" stroke="#453f45" stroke-opacity=".16" stroke-width=".65"/>`);
    beads.push(`<circle cx="${gx + x * cell + 3.7}" cy="${gy + y * cell + 3.45}" r="1.15" fill="#fff" fill-opacity=".42"/>`);
  }));
  const metrics = pattern.metrics;
  return `
    <rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="20" fill="#fffdf8" stroke="#eadfce"/>
    <text x="${ox + 18}" y="${oy + 26}" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif" font-size="16" font-weight="700" fill="#352d31">${pattern.name}</text>
    <text x="${ox + cardW - 18}" y="${oy + 26}" text-anchor="end" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif" font-size="11" fill="#786a6e">${metrics.beadCount} 颗 · ${metrics.colorCount} 色 · ${metrics.detachedPieceCount ? `${metrics.detachedPieceCount} 散件` : "一体"}</text>
    <rect x="${gx}" y="${gy}" width="${grid}" height="${grid}" rx="8" fill="#f6f0e7"/>
    ${beads.join("\n")}
    <text x="${ox + 18}" y="${oy + 244}" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif" font-size="10.5" fill="#786a6e">body ${metrics.layerCounts.B} · prop ${metrics.layerCounts.P} · fx ${metrics.layerCounts.F}</text>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f4ebdc"/>
  ${patterns.map((pattern, index) => beadSvg(pattern, margin + (index % 3) * (cardW + 24), margin + Math.floor(index / 3) * (cardH + 24))).join("\n")}
</svg>`;

const svgPath = path.join(OUT_DIR, "contact-sheet-b.svg");
fs.writeFileSync(svgPath, svg);
await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, "contact-sheet-b.png"));

const smallCell = 96 / 18;
const smallCardW = 196;
const smallCardH = 146;
const smallMargin = 18;
const smallGap = 14;
const smallWidth = smallMargin * 2 + smallCardW * 3 + smallGap * 2;
const smallHeight = smallMargin * 2 + smallCardH * 2 + smallGap;
const smallCardSvg = (pattern, ox, oy) => {
  const gx = ox + 50;
  const gy = oy + 34;
  const beads = [];
  pattern.rows.forEach((row, y) => [...row].forEach((key, x) => {
    if (key === ".") return;
    beads.push(`<circle cx="${gx + x * smallCell + smallCell / 2}" cy="${gy + y * smallCell + smallCell / 2}" r="2.32" fill="${COLORS[key].color}" stroke="#453f45" stroke-opacity=".18" stroke-width=".35"/>`);
  }));
  return `
    <rect x="${ox}" y="${oy}" width="${smallCardW}" height="${smallCardH}" rx="16" fill="#fffdf8" stroke="#eadfce"/>
    <text x="${ox + 12}" y="${oy + 21}" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif" font-size="12" font-weight="700" fill="#352d31">${pattern.name}</text>
    <rect x="${gx}" y="${gy}" width="96" height="96" rx="6" fill="#f6f0e7"/>
    ${beads.join("\n")}
    <text x="${ox + 12}" y="${oy + 138}" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif" font-size="9" fill="#786a6e">96 px · ${pattern.metrics.beadCount} 颗 · ${pattern.metrics.componentSizes.join("+")}</text>`;
};
const smallSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${smallWidth}" height="${smallHeight}" viewBox="0 0 ${smallWidth} ${smallHeight}">
  <rect width="100%" height="100%" fill="#f4ebdc"/>
  ${patterns.map((pattern, index) => smallCardSvg(pattern, smallMargin + (index % 3) * (smallCardW + smallGap), smallMargin + Math.floor(index / 3) * (smallCardH + smallGap))).join("\n")}
</svg>`;
fs.writeFileSync(path.join(OUT_DIR, "contact-sheet-b-96.svg"), smallSvg);
await sharp(Buffer.from(smallSvg)).png().toFile(path.join(OUT_DIR, "contact-sheet-b-96.png"));

console.log(JSON.stringify(patterns.map(({ id, metrics }) => ({ id, ...metrics })), null, 2));
