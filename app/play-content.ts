export type BuildMode = "assistant" | "mobile" | "mystery";
export type PlayMode = BuildMode | "spot";
export type CompanionEvent =
  | "start"
  | "colorDone"
  | "mysteryReveal"
  | "zoneNext"
  | "zoneDone"
  | "mistake"
  | "erase"
  | "groupCancel"
  | "spotHit"
  | "spotMiss"
  | "spotDone";

export type StoryOption = { id: string; label: string };
export type StorySelection = { who: string; doing: string };
export type StoryCard = { who: string; where: string; doing: string; line: string; closer: string; text: string };

type CompanionVars = {
  color?: string;
  nextColor?: string;
  zone?: string;
  needed?: string;
  count?: string;
};

export const SPOT_DIFF_COUNT = 8;

export type SpotColorway = { id: string; name: string; palette: Record<string, { name: string; color: string }> };
export type SpotSource = { id: string; rows: string[]; colorways: SpotColorway[] };
export type SpotPuzzle = {
  patternId: string;
  homeId: string;
  otherId: string;
  homeName: string;
  otherName: string;
  swapped: number[];
};

const SCENE_LABELS: Record<string, string> = {
  "starship-cabin": "星空船舱",
  "cloud-post": "云端邮局",
  "candy-park": "糖果游乐园",
};

const EFFECT_CLOSERS: Record<string, string> = {
  "star-trail": "金色星光绕着它转了一圈。",
  "bubble-orbit": "小泡泡轻轻飘过身边。",
  "confetti-rain": "彩纸从天上慢慢落下。",
};

const WHO: Record<string, StoryOption[]> = {
  "scarf-sprint": [
    { id: "wind-cat", label: "追风围巾猫" },
    { id: "flight-captain", label: "飞行队长" },
    { id: "scarf-kit", label: "围巾小猫" },
  ],
  "balloon-bear": [
    { id: "balloon-bear", label: "热气球小熊" },
    { id: "sky-traveler", label: "旅行小熊" },
    { id: "basket-rider", label: "篮筐乘客" },
  ],
  "moon-rabbit": [
    { id: "moon-mailer", label: "月兔邮差" },
    { id: "star-bunny", label: "星月兔子" },
    { id: "bag-sitter", label: "送信月兔" },
  ],
  "sushi-train": [
    { id: "cat-chef", label: "猫店长" },
    { id: "bento-conductor", label: "餐盒列车长" },
    { id: "train-driver", label: "小火车司机" },
  ],
  "whale-castle": [
    { id: "star-whale", label: "星星城鲸鱼" },
    { id: "parade-whale", label: "巡游鲸鱼" },
    { id: "tower-carrier", label: "驮城旅人" },
  ],
  "fox-kite": [
    { id: "kite-fox", label: "放风筝的小狐狸" },
    { id: "wind-fox", label: "追风狐狸" },
    { id: "sky-fox", label: "天空小狐狸" },
  ],
  "otter-sub": [
    { id: "pilot-otter", label: "潜艇水獭" },
    { id: "bubble-otter", label: "泡泡船长" },
    { id: "mail-otter", label: "海底邮差" },
  ],
  "skate-duck": [
    { id: "slope-duck", label: "滑板鸭" },
    { id: "rush-duck", label: "冲坡队长" },
    { id: "rainbow-duck", label: "彩虹坡鸭鸭" },
  ],
  "heart-frame": [
    { id: "heart-frame", label: "爱心相框" },
    { id: "desk-frame", label: "书桌相框" },
    { id: "photo-window", label: "照片窗" },
  ],
  "bow-cat": [
    { id: "bow-cat", label: "蝴蝶结小猫" },
    { id: "desk-cat", label: "书桌立牌猫" },
    { id: "collar-cat", label: "领结小猫" },
  ],
  "berry-sundae": [
    { id: "berry-cone", label: "草莓甜筒" },
    { id: "triple-scoop", label: "三球冰淇淋" },
    { id: "desk-treat", label: "书桌甜品" },
  ],
  "berry-boba": [
    { id: "berry-tea", label: "草莓奶茶" },
    { id: "pearl-cup", label: "珍珠茶杯" },
    { id: "desk-drink", label: "书桌饮品" },
  ],
};

const DOING: Record<string, StoryOption[]> = {
  "scarf-sprint": [
    { id: "lift-scarf", label: "把围巾扬起来" },
    { id: "chase-wind", label: "追着风跑" },
    { id: "race-ahead", label: "往前冲一程" },
    { id: "party", label: "开了一场小派对" },
  ],
  "balloon-bear": [
    { id: "rise-up", label: "慢慢升上天空" },
    { id: "look-down", label: "低头看地面" },
    { id: "count-stars", label: "数着窗外的星星" },
    { id: "chase-wind", label: "追着风跑" },
  ],
  "moon-rabbit": [
    { id: "pack-letter", label: "把信装进邮袋" },
    { id: "send-mail", label: "把信送出去" },
    { id: "wait-night", label: "等夜色再出发" },
    { id: "count-stars", label: "数着窗外的星星" },
  ],
  "sushi-train": [
    { id: "deliver-bento", label: "送出今日餐盒" },
    { id: "ring-bell", label: "摇铃准备开车" },
    { id: "send-mail", label: "把信送出去" },
    { id: "party", label: "开了一场小派对" },
  ],
  "whale-castle": [
    { id: "light-towers", label: "让塔楼亮起灯" },
    { id: "slow-swim", label: "慢慢游过舞台" },
    { id: "count-stars", label: "数着窗外的星星" },
    { id: "party", label: "开了一场小派对" },
  ],
  "fox-kite": [
    { id: "hold-line", label: "拉紧风筝线" },
    { id: "let-whale-fly", label: "把鲸鱼放上天空" },
    { id: "lean-back", label: "被风轻轻拉得后仰" },
    { id: "party", label: "开了一场小派对" },
  ],
  "otter-sub": [
    { id: "peek-window", label: "从圆窗探出头" },
    { id: "spin-prop", label: "让螺旋桨转起来" },
    { id: "find-post", label: "去找海底邮局" },
    { id: "party", label: "开了一场小派对" },
  ],
  "skate-duck": [
    { id: "crouch-low", label: "压低身体准备冲坡" },
    { id: "ride-down", label: "从彩虹坡冲下去" },
    { id: "kick-flip", label: "在空中翻一个板" },
    { id: "party", label: "开了一场小派对" },
  ],
  "heart-frame": [
    { id: "hold-photo", label: "把小照片装进去" },
    { id: "stand-desk", label: "站在书桌上看着你" },
    { id: "keep-today", label: "给今天留一张纪念" },
    { id: "party", label: "开了一场小派对" },
  ],
  "bow-cat": [
    { id: "stand-guard", label: "站在书桌上看着你" },
    { id: "lift-bow", label: "把蝴蝶结扬起来" },
    { id: "keep-door", label: "给今天当小守卫" },
    { id: "party", label: "开了一场小派对" },
  ],
  "berry-sundae": [
    { id: "top-berry", label: "把草莓放上头顶" },
    { id: "wait-desk", label: "站在书桌上等你来" },
    { id: "add-sweet", label: "给今天加一勺甜" },
    { id: "party", label: "开了一场小派对" },
  ],
  "berry-boba": [
    { id: "drop-straw", label: "把吸管插进杯子" },
    { id: "wait-sip", label: "站在书桌上等你喝" },
    { id: "shake-pearls", label: "摇一摇杯子里的珍珠" },
    { id: "party", label: "开了一场小派对" },
  ],
};

const START_LINES: Record<string, Record<BuildMode, string>> = {
  "scarf-sprint": {
    assistant: "尖耳先对齐，围巾会带着我们往右跑。",
    mobile: "从尖耳开始。点错了没关系，换一颗再放。",
    mystery: "先看我的剪影。拼完一种颜色，围巾就会亮起来。",
  },
  "balloon-bear": {
    assistant: "先记下气球的色带，再顺着绳子找到我。",
    mobile: "气球是对称的。一边拼好，另一边就好找了。",
    mystery: "剪影里藏着气球。揭开一层，我就会露出一点。",
  },
  "moon-rabbit": {
    assistant: "先记下双耳和脸，再沿着弯月口袋往右收。",
    mobile: "耳朵朝上。口袋是弯的，沿着外圈慢慢走。",
    mystery: "邮袋还是剪影。拼完一种颜色，我就露出一点。",
  },
  "sushi-train": {
    assistant: "先记下我的耳朵和脸，再沿着底盘向右开。",
    mobile: "车头是我。车厢一格一格往后拼就好。",
    mystery: "先认剪影里的耳朵。揭开一层，餐盒就会亮。",
  },
  "whale-castle": {
    assistant: "先记下我的大轮廓，再让背上三座塔对齐。",
    mobile: "先画出鲸鱼的身体，塔楼会自己站上来。",
    mystery: "先认剪影里的鲸背。揭开一层，窗户就会亮。",
  },
  "fox-kite": {
    assistant: "先记下狐狸尖耳，再沿黄线向右上。",
    mobile: "狐狸在左下。沿线去找鲸鱼风筝。",
    mystery: "剪影里有一条斜线。揭开就看见风筝。",
  },
  "otter-sub": {
    assistant: "先记下圆窗小脸，再沿外壳收到螺旋桨。",
    mobile: "先认圆窗里的小脸，再拼黄潜艇。",
    mystery: "先认剪影里的圆窗。揭开一层潜艇会亮。",
  },
  "skate-duck": {
    assistant: "先记下朝右的鸭头，再沿滑板找到彩虹坡。",
    mobile: "鸭头朝右。顺着滑板冲下彩虹坡。",
    mystery: "剪影里有一只冲坡的鸭子。揭开就看见坡。",
  },
  "heart-frame": {
    assistant: "先记下爱心外框，中间空着给照片。",
    mobile: "先拼爱心外框。中间空着，以后放照片。",
    mystery: "剪影是一颗爱心。揭开就看见相框。",
  },
  "bow-cat": {
    assistant: "先记下头顶大蝴蝶结，再画出小猫的脸。",
    mobile: "先拼蝴蝶结，再往下画出小猫。",
    mystery: "剪影里有蝴蝶结。揭开就看见小猫。",
  },
  "berry-sundae": {
    assistant: "先记下顶上的草莓，再一层层做到杯底。",
    mobile: "从上头草莓开始，再往下做甜筒。",
    mystery: "剪影是一支甜筒。揭开一层就亮一点。",
  },
  "berry-boba": {
    assistant: "先记下吸管，再画出杯子和珍珠。",
    mobile: "先插吸管，再画出杯子和珍珠。",
    mystery: "剪影是一杯奶茶。揭开就看见珍珠。",
  },
};

const COLOR_DONE_LINES: Record<string, string> = {
  "scarf-sprint": "{color}这块好了。围巾还在等{nextColor}。",
  "balloon-bear": "{color}拼完了。顺着绳子，下一种是{nextColor}。",
  "moon-rabbit": "{color}揭了一层。接着把{nextColor}放进邮袋。",
  "sushi-train": "{color}这一厢好了。下一站是{nextColor}。",
  "whale-castle": "{color}亮起来了。接着点亮{nextColor}。",
  "fox-kite": "{color}好了。沿线继续找{nextColor}。",
  "otter-sub": "{color}亮了。潜艇还在等{nextColor}。",
  "skate-duck": "{color}冲过去了。下一段是{nextColor}。",
  "heart-frame": "{color}好了。相框还在等{nextColor}。",
  "bow-cat": "{color}这块好了。小猫还在等{nextColor}。",
  "berry-sundae": "{color}这一层好了。下一球是{nextColor}。",
  "berry-boba": "{color}倒进去了。杯子还在等{nextColor}。",
};

const MYSTERY_LINES: Record<string, string> = {
  "scarf-sprint": "揭开了{color}！再猜猜{nextColor}藏在哪。",
  "balloon-bear": "{color}露出来了。{nextColor}还藏在剪影里。",
  "moon-rabbit": "揭开了{color}！再猜猜{nextColor}是什么。",
  "sushi-train": "{color}的餐盒亮了。下一种是{nextColor}。",
  "whale-castle": "{color}的窗亮了。还差{nextColor}这一层。",
  "fox-kite": "揭开了{color}！风筝还藏着{nextColor}。",
  "otter-sub": "{color}露出来了。再猜猜{nextColor}在哪。",
  "skate-duck": "揭开了{color}！彩虹坡还藏着{nextColor}。",
  "heart-frame": "揭开了{color}！相框还藏着{nextColor}。",
  "bow-cat": "揭开了{color}！蝴蝶结还藏着{nextColor}。",
  "berry-sundae": "揭开了{color}！甜筒还藏着{nextColor}。",
  "berry-boba": "揭开了{color}！珍珠还藏着{nextColor}。",
};

const fill = (template: string, vars: CompanionVars) =>
  template.replace(/\{(\w+)\}/g, (_, key: keyof CompanionVars) => vars[key] ?? "");

const optionById = (options: StoryOption[], id?: string) =>
  options.find(option => option.id === id) ?? options[0];

export const storyWhoOptions = (patternId: string) => WHO[patternId] ?? [];
export const storyDoingOptions = (patternId: string) => DOING[patternId] ?? [];
export const storySceneLabel = (sceneId: string) => SCENE_LABELS[sceneId] ?? SCENE_LABELS["starship-cabin"];
export const storyEffectCloser = (effectId: string) => EFFECT_CLOSERS[effectId] ?? EFFECT_CLOSERS["star-trail"];

export const defaultStorySelection = (patternId: string): StorySelection => ({
  who: storyWhoOptions(patternId)[0]?.id ?? "",
  doing: storyDoingOptions(patternId)[0]?.id ?? "",
});

export const isAllowedStorySelection = (patternId: string, value: unknown): value is StorySelection => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.who !== "string" || typeof candidate.doing !== "string") return false;
  return storyWhoOptions(patternId).some(option => option.id === candidate.who)
    && storyDoingOptions(patternId).some(option => option.id === candidate.doing);
};

export const composeStory = (
  patternId: string,
  selection: StorySelection | undefined,
  sceneId: string,
  effectId: string,
): StoryCard => {
  const who = optionById(storyWhoOptions(patternId), selection?.who);
  const doing = optionById(storyDoingOptions(patternId), selection?.doing);
  const where = storySceneLabel(sceneId);
  const line = who && doing ? `${who.label}在${where}${doing.label}。` : `${where}里，新的故事还在等你。`;
  const closer = storyEffectCloser(effectId);
  return { who: who?.id ?? "", where, doing: doing?.id ?? "", line, closer, text: `${line}${closer}` };
};

const hashSeed = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return hash >>> 0;
};

const seededShuffle = <T,>(items: T[], seed: number) => {
  const next = [...items];
  let state = seed || 1;
  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
};

export const buildSpotPuzzle = (pattern: SpotSource, homeId?: string): SpotPuzzle | null => {
  const home = pattern.colorways.find(option => option.id === homeId) ?? pattern.colorways[0];
  const other = pattern.colorways.find(option => option.id !== home?.id);
  if (!home || !other) return null;
  const cells = pattern.rows.join("").split("");
  const candidates = cells.flatMap((cell, index) => {
    if (cell === ".") return [];
    const homeColor = home.palette[cell]?.color;
    const otherColor = other.palette[cell]?.color;
    return homeColor && otherColor && homeColor !== otherColor ? [index] : [];
  });
  if (candidates.length < 4) return null;
  const swapped = seededShuffle(candidates, hashSeed(`${pattern.id}:${home.id}:${other.id}`)).slice(0, Math.min(SPOT_DIFF_COUNT, candidates.length));
  return { patternId: pattern.id, homeId: home.id, otherId: other.id, homeName: home.name, otherName: other.name, swapped };
};

export const spotZoneOf = (index: number, boardSize = 18, zoneSize = 6) =>
  Math.floor(Math.floor(index / boardSize) / zoneSize) * 3 + Math.floor((index % boardSize) / zoneSize);

export const companionLine = (
  patternId: string,
  mode: PlayMode,
  event: CompanionEvent,
  vars: CompanionVars = {},
) => {
  if (event === "start" && mode === "spot") return "有几颗豆子换了队服。对着我的配色，把它们点出来。";
  if (event === "start") return START_LINES[patternId]?.[mode] ?? "我们开始摆豆。看一看现在这一区。";
  if (event === "mysteryReveal") return fill(MYSTERY_LINES[patternId] ?? "揭开了{color}！接着猜{nextColor}。", vars);
  if (event === "colorDone") return fill(COLOR_DONE_LINES[patternId] ?? "{color}拼完了，接着拼{nextColor}。", vars);
  if (event === "zoneNext") return fill("接着拼{zone}的{color}。", vars);
  if (event === "zoneDone") return fill("太棒了！接着拼{zone}。", vars);
  if (event === "mistake") return fill("这里要放{needed}。换一颗再试试。", vars);
  if (event === "erase") return "已擦掉一颗。想放回去再点一次。";
  if (event === "groupCancel") return fill("已取消这一组{color}。", vars);
  if (event === "spotHit") return fill("找到一颗！还差{count}颗。", vars);
  if (event === "spotMiss") return "这颗还是原来的颜色。";
  if (event === "spotDone") return "全部找齐了！换队服的豆子可以回家了。";
  return "";
};

export const companionIdle = (patternId: string, colorName: string) =>
  fill(patternId === "moon-rabbit" ? "现在拼{color}。我在邮袋里等你。" : "现在拼{color}。我在旁边看着。", { color: colorName });

export const companionIdleSpot = (left: number) =>
  left <= 0 ? "全部找齐了。" : `还差${left}颗换了队服的豆子。`;

export const childPlayContentCorpus = () => {
  const texts: string[] = [...Object.values(SCENE_LABELS), ...Object.values(EFFECT_CLOSERS)];
  for (const lines of Object.values(START_LINES)) texts.push(...Object.values(lines));
  texts.push(...Object.values(COLOR_DONE_LINES), ...Object.values(MYSTERY_LINES));
  for (const options of [...Object.values(WHO), ...Object.values(DOING)]) texts.push(...options.map(option => `${option.id} ${option.label}`));
  texts.push(
    companionLine("unknown", "mobile", "start"),
    companionLine("unknown", "mobile", "colorDone", { color: "红", nextColor: "蓝" }),
    companionLine("unknown", "mystery", "mysteryReveal", { color: "红", nextColor: "蓝" }),
    companionLine("unknown", "assistant", "zoneNext", { zone: "左上", color: "红" }),
    companionLine("unknown", "assistant", "zoneDone", { zone: "正中" }),
    companionLine("unknown", "mobile", "mistake", { needed: "蓝" }),
    companionLine("unknown", "mobile", "erase"),
    companionLine("unknown", "assistant", "groupCancel", { color: "红" }),
    companionIdle("unknown", "红"),
    companionIdleSpot(3),
    companionLine("unknown", "spot", "start"),
    companionLine("unknown", "spot", "spotHit", { count: "3" }),
    companionLine("unknown", "spot", "spotMiss"),
    companionLine("unknown", "spot", "spotDone"),
    composeStory("unknown", undefined, "starship-cabin", "star-trail").text,
  );
  return texts.join("\n");
};
