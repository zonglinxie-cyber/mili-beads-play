import type { DifficultyAxes } from "./pattern-metadata";
export type BeadColor = { name: string; color: string };
export type PatternColorway = { id: string; name: string; palette: Record<string, BeadColor> };
export type PatternProvenance = {
  creationDate: string;
  method: string;
  referenceBoundary: string;
  authoringDisclosure: string;
  rightsReview: string;
  revision: string;
  gridHash: string;
  sourceHash: string;
};

export type Pattern = {
  id: string;
  name: string;
  story: string;
  category: string;
  /** 标记为进阶图纸，跳过 18×18 和 4-6 色等限制 */
  advanced?: boolean;
  motion: "launch" | "float" | "twist" | "sway" | "hop" | "drum" | "bounce" | "roll" | "glide";
  animation: string;
  motionPlan: { body: string; prop: string; fx: string };
  pieceLabel: string;
  pieceSizes: number[];
  skillTip: string;
  estimatedMinutes: [number, number];
  difficultyAxes: DifficultyAxes;
  difficultyLabel: string;
  difficultyWhy: string;
  playIdea: string;
  assemblyNotes: string[];
  childFinishLine: string;
  reserveByColor: Record<string, number>;
  palette: Record<string, BeadColor>;
  colorways: PatternColorway[];
  rows: string[];
  layers: string[];
  provenance?: PatternProvenance;
};

const color = (name: string, hex: string): BeadColor => ({ name, color: hex.toLowerCase() });
const way = (id: string, name: string, palette: Record<string, BeadColor>): PatternColorway => ({ id, name, palette });
const rows18 = (lines: string[]) => lines.map(line => {
  const row = line.replaceAll(" ", ".");
  if (row.length > 18) throw new Error(`图纸超过 18 格：${line}`);
  return row.padEnd(18, ".");
});

const scarfSprint: Pattern = {
  id: "scarf-sprint",
  name: "追风围巾猫",
  story: "小猫迎着风探出脑袋，蓝黄围巾向右飞起。",
  category: "品牌猫",
  motion: "sway",
  animation: "小猫轻轻探头；蓝黄围巾迎风摆动；几条风线从身后飘过",
  motionPlan: { body: "整体轻微探头", prop: "右侧围巾小幅摆动", fx: "舞台风线从左向右掠过" },
  pieceLabel: "一体成品",
  pieceSizes: [153],
  skillTip: "先拼两只尖耳和脸部轮廓，再沿下巴向右追踪围巾。",
  estimatedMinutes: [30, 45],
  difficultyAxes: { beads: 153, colorChanges: 99, pieces: 1, articulationPoints: 0, symmetry: 100, repetition: 177 },
  difficultyLabel: "表情与动势",
  difficultyWhy: "153 颗、6 色；猫脸需对齐眼鼻，围巾则需追踪向右的连续色块。",
  playIdea: "完成后在小舞台让围巾摆动，给猫选一条追风路线。",
  assemblyNotes: ["猫脸、颈圈和向右伸出的围巾连成一个主件。", "摆放时让两只尖耳朝上，蓝黄围巾朝右。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { K: 4, O: 7, W: 2, P: 2, B: 4, Y: 2 },
  palette: {
    K: color("墨黑", "#29283b"), O: color("蜜橘", "#ee7b52"), W: color("奶油白", "#fff5df"),
    P: color("樱花粉", "#ef91a7"), B: color("湖水蓝", "#5daabe"), Y: color("星光黄", "#f5c95d"),
  },
  colorways: [
    way("orange-sky", "蜜橘飞行队", { K:color("墨黑","#29283b"), O:color("蜜橘","#ee7b52"), W:color("奶油白","#fff5df"), P:color("樱花粉","#ef91a7"), B:color("湖水蓝","#5daabe"), Y:color("星光黄","#f5c95d") }),
    way("grape-mint", "葡萄汽水队", { K:color("深海蓝","#2c355b"), O:color("薰衣草紫","#9a82cc"), W:color("奶油白","#fff5df"), P:color("珊瑚粉","#f28a9a"), B:color("薄荷绿","#78c9b2"), Y:color("柠檬黄","#f2d25b") }),
    way("moon-coral", "月光珊瑚队", { K:color("炭黑","#30303a"), O:color("暖月灰","#b9b3ad"), W:color("雪白","#f8f7f2"), P:color("莓果粉","#d96a83"), B:color("珊瑚红","#e86f61"), Y:color("奶油黄","#f5cd76") }),
  ],
  rows: rows18(["..................","..................","....KKK....KKK....","...KOPOK..KOPOK...","...KOPOOKKOOPOK...","..KOOOOOOOOOOOOK..","..KOOOOOOOOOOOOK..","..KOOWOOOOWOOOOK..","..KOOKOOOOKOOOBBBB","..KOPOOWKWWOPBBBYY","...KOOOWKKWOBBBYYY","....KBBBBBBBBBBYYY",".....KBBBBBBBBBYYY",".....KKBBBBBBB....","..................","..................","..................",".................."]),
  layers: rows18(["..................","..................","....BBB....BBB....","...BBFBB..BBFBB...","...BBFBBBBBBFBB...","..BBBBBBBBBBBBBB..","..BBBBBBBBBBBBBB..","..BBBFBBBBFBBBBB..","..BBBFBBBBFBBBPPPP","..BBFBBFFFFBFPPPPP","...BBBBFFFFBPPPPPP","....BPPPPPPPPPPPPP",".....BPPPPPPPPPPPP",".....BBPPPPPPP....","..................","..................","..................",".................."]),
  provenance: {
    creationDate: "2026-08-13", method: "从空白 18×18 网格开始逐格构图；用四邻域、割点、缩略图与剪影反复校验。",
    referenceBoundary: "只使用‘迎风的猫和一体围巾’通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "人工网格创作；生成式图片未参与轮廓或逐格配色。", rightsReview: "通用题材；发布前仍需责任主体完成权利台账签字。",
    revision: "v5-r2", gridHash: "dfa203e47796a3a70787f3fcafd9512dcb53899aa75a5881ac6152c0647c7083", sourceHash: "f716dae973c8291046f78f10b51a5b587fa5d35a64ec89a5c201c4f6f3449cd8",
  },
};

const balloonBear: Pattern = {
  id:"balloon-bear", name:"热气球旅行小熊", story:"小熊坐进篮筐，跟着彩色热气球升上天空。", category:"童话", motion:"float",
  animation:"小熊与篮筐轻摆；热气球缓慢上浮；色带从中间向外亮起", motionPlan:{body:"熊与篮筐轻摆",prop:"气球缓慢上浮",fx:"色带由中间向外依次亮起"}, pieceLabel:"一体成品", pieceSizes:[167],
  skillTip:"先完成热气球的对称色带，再沿两条绳子向下找到小熊。", estimatedMinutes:[28,40], difficultyAxes:{beads:167,colorChanges:112,pieces:1,articulationPoints:0,symmetry:160,repetition:172}, difficultyLabel:"双绳追踪", difficultyWhy:"气球是重复色带，熊脸需要局部换色；两条连接路径可练习从上到下检查。", playIdea:"完成后让气球慢慢上浮，篮筐和熊轻轻错拍摆动。", assemblyNotes:["气球、两条绳、熊和篮筐连成一个主件。","摆放时气球在上，熊脸朝正面。"], childFinishLine:"拼好后请大人帮忙", reserveByColor:{K:3,C:4,Y:4,R:5,B:5,N:3},
  palette:{K:color("夜空墨","#29283b"),C:color("可可棕","#8a5d4a"),Y:color("星光黄","#f5c95d"),R:color("莓果红","#cf4e61"),B:color("湖水蓝","#5daabe"),N:color("深海蓝","#355276")},
  colorways:[
    way("sunrise-trip","日出旅行",{K:color("夜空墨","#29283b"),C:color("可可棕","#8a5d4a"),Y:color("星光黄","#f5c95d"),R:color("莓果红","#cf4e61"),B:color("湖水蓝","#5daabe"),N:color("深海蓝","#355276")}),
    way("berry-sky","莓果晴空",{K:color("深莓紫","#40324f"),C:color("蜜桃粉","#f4aa91"),Y:color("奶油白","#fff5df"),R:color("莓果红","#b73d63"),B:color("晴空蓝","#69b4d0"),N:color("深葡萄","#51416f")}),
    way("forest-parade","森林巡游",{K:color("夜空墨","#29283b"),C:color("深栗棕","#6b4538"),Y:color("柠檬叶","#d6d765"),R:color("珊瑚橘","#ed826e"),B:color("冰川蓝","#bde3e2"),N:color("深青玉","#285e57")}),
  ],
  rows:rows18([".....RRRRRRRR.....","...RRYYYYYYYYRR...","..RYYYBBBBBBYYYR..",".RYYBBBBBBBBBBYYR.",".RYYBBBBBBBBBBYYR.","..RYYYBBBBBBYYYR..","...RRYYYYYYYYRR...",".....RRRRRRRR.....",".....C......C.....",".....CC....CC.....","......C....C......",".....KK....KK.....","....KCCK..KCCK....","....KCCKCCKCCK....","....KCKCCKCCK.....","....KCCCCCCCCK....","....NNNNNNNNNN....",".....NNNNNNNN....."]),
  layers:rows18([".....PPPPPPPP.....","...PPPPPPPPPPPP...","..PPPPPPPPPPPPPP..",".PPPPPPPPPPPPPPPP.",".PPPPPPPPPPPPPPPP.","..PPPPPPPPPPPPPP..","...PPPPPPPPPPPP...",".....PPPPPPPP.....",".....P......P.....",".....PP....PP.....","......P....P......",".....BB....BB.....","....BBBB..BBBB....","....BBBBBBBBBB....","....BBBBBBBBB.....","....BBBBBBBBBB....","....BBBBBBBBBB....",".....BBBBBBBB....."]),
  provenance:{creationDate:"2026-08-13",method:"从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。",referenceBoundary:"只使用‘熊乘坐热气球’这一通用题材；未描摹、像素化或复制第三方图样、角色或标识。",authoringDisclosure:"人工网格创作；生成式图片未参与轮廓或逐格配色。",rightsReview:"通用题材；发布前仍需责任主体完成权利台账签字。",revision:"v13-r2",gridHash:"f1a6bf31f358a6787ff3f95907258a801b16212e481ef62910d9bab6c29830ca",sourceHash:"d8bc7b99ae0714b91bc8237320d87492c01fd0d549885747d508fa82cae39f11"},
};

const moonRabbit: Pattern = {
  id:"moon-rabbit",name:"月兔坐进星月邮袋",story:"月兔坐在弯月形邮袋里，露出长耳朵望向夜空。",category:"童话",motion:"bounce",animation:"双耳错拍弹起；弯月邮袋左右摆动；星光沿袋口移动",motionPlan:{body:"双耳错拍弹起",prop:"弯月邮袋左右摆动",fx:"袋口星光沿弧线移动"},pieceLabel:"一体成品",pieceSizes:[163],skillTip:"先拼兔子的双耳和脸，再沿左下的弯月外轮廓向右收口。",estimatedMinutes:[35,50],difficultyAxes:{beads:163,colorChanges:110,pieces:1,articulationPoints:0,symmetry:94,repetition:176},difficultyLabel:"内外轮廓",difficultyWhy:"兔脸与弯月口袋相互嵌套，需要区分内轮廓、外轮廓和袋口色带。",playIdea:"完成后让弯月邮袋轻轻摇摆，给月兔选一个送信的舞台。",assemblyNotes:["兔子与弯月邮袋连成一个主件。","摆放时长耳朝上，弯月从左下方托住兔子。"],childFinishLine:"拼好后请大人帮忙",reserveByColor:{N:5,W:6,Y:6,B:3},
  palette:{N:color("深海蓝","#355276"),W:color("奶油白","#fff5df"),Y:color("星光黄","#f5c95d"),B:color("湖水蓝","#5daabe")},colorways:[
    way("moon-mail","月夜邮袋",{N:color("深海蓝","#355276"),W:color("奶油白","#fff5df"),Y:color("星光黄","#f5c95d"),B:color("湖水蓝","#5daabe")}),
    way("berry-moon","莓果月亮",{N:color("深莓紫","#4f315d"),W:color("雪花白","#fffdf7"),Y:color("莓果红","#b73d63"),B:color("薰衣草紫","#b7a0d2")}),
    way("mint-crescent","薄荷弯月",{N:color("深青玉","#285e57"),W:color("奶油白","#fff5df"),Y:color("湖水蓝","#468ca6"),B:color("星光黄","#f5c95d")}),
  ],
  rows:rows18([".....NN....NN.....","....NWWN..NWWN....","....NWBW..NWBW....","....NWWWNNWWWN....",".....NWWWWWWN.....","....NWWBWWBWWN....","....NWWWBWWWWN....",".....NWWWWWWN.....","......NNWBNN......","...YYYYNNWWNN.....","..YYYYYNWWNNN.....","..YYYYYNWWNBBN....","..YYYYNNWWNBBN....","..YYYYNNWWNNBBN...","...YYYNNWWNNBBN...","....YYYYYYYYBBN...",".....YYYYYYNN.....",".......YY........."]),layers:rows18([".....BB....BB.....","....BBBB..BBBB....","....BBBB..BBBB....","....BBBBBBBBBB....",".....BBBBBBBB.....","....BBBBBBBBBB....","....BBBBBBBBBB....",".....BBBBBBBB.....","......BBBBBB......","...PPPPPPPPPP.....","..PPPPPPPPPPP.....","..PPPPPPPPPPPP....","..PPPPPPPPPPPP....","..PPPPPPPPPPPPP...","...PPPPPPPPPPPP...","....PPPPPPPPPPP...",".....PPPPPPPP.....",".......PP........."]),
  provenance:{creationDate:"2026-08-13",method:"从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。",referenceBoundary:"只使用‘兔子坐在弯月形口袋中’这一通用题材；未描摹、像素化或复制第三方图样、角色或标识。",authoringDisclosure:"人工网格创作；生成式图片未参与轮廓或逐格配色。",rightsReview:"通用题材；发布前仍需责任主体完成权利台账签字。",revision:"v13-r2",gridHash:"0d75b55fceca27703f023825f31fd04a76fda247d8d829b1e16075aa05c7c417",sourceHash:"e890d258f65baf2adcb93df7ca0a545a35da1070b21957e1f0d78840d7be604d"},
};

const sushiTrain: Pattern = {
  id:"sushi-train",name:"猫店长餐盒小火车",story:"猫店长一挥爪，彩色餐盒就沿着小火车出发。",category:"美食",motion:"roll",animation:"猫爪抬起招手；三组车轮循环滚动；车厢餐盒依次轻跳",motionPlan:{body:"猫爪抬起招手",prop:"三组车轮循环滚动",fx:"车厢餐盒依次轻跳"},pieceLabel:"一体成品",pieceSizes:[165],skillTip:"先拼车头的猫耳和脸，再沿深色底盘向右完成车厢与车轮。",estimatedMinutes:[35,50],difficultyAxes:{beads:165,colorChanges:120,pieces:1,articulationPoints:6,symmetry:86,repetition:160},difficultyLabel:"横带换色",difficultyWhy:"猫、车厢、餐盒和车轮分成清楚横带，颜色切换多但轮廓稳定。",playIdea:"完成后让小火车开过舞台，由猫店长送出今天的彩色餐盒。",assemblyNotes:["猫、车厢、餐盒和车轮连成一个主件。","摆放时车轮朝下，猫耳位于车头上方。"],childFinishLine:"拼好后请大人帮忙",reserveByColor:{K:4,W:4,O:3,G:3,N:6},
  palette:{K:color("夜空墨","#29283b"),W:color("奶油白","#fff5df"),O:color("蜜橘","#ee7b52"),G:color("叶子绿","#6ba270"),N:color("深海蓝","#355276")},colorways:[
    way("harbor-bento","港口餐车",{K:color("夜空墨","#29283b"),W:color("奶油白","#fff5df"),O:color("蜜橘","#ee7b52"),G:color("叶子绿","#6ba270"),N:color("深海蓝","#355276")}),
    way("berry-express","莓果快车",{K:color("深莓紫","#40324f"),W:color("雪花白","#fffdf7"),O:color("珊瑚橘","#e86f61"),G:color("薰衣草紫","#b7a0d2"),N:color("深葡萄","#51416f")}),
    way("mint-market","薄荷市集",{K:color("夜空墨","#29283b"),W:color("奶油白","#fff5df"),O:color("莓果红","#b73d63"),G:color("薄荷水晶","#aee4d5"),N:color("深青玉","#285e57")}),
  ],
  rows:rows18(["...K......K.......","..KOK....KOK......","..KOWKKKKWOK......","..KOWWWWWWOK......","..KWKWWWWKWK......","..KWWOOWWWWK......","...KWWWWWWK.......","....KKWWKK........","..NNNNNNNNNNNNNN..","..NNWWNN.WOOWGGN..",".NNWONN.WOOWGGGN..",".NNNNNN.WWWWGGGN..","..NNNNNNNNNNNNNN..","...NNNNNNNNNNNN...","...KKK......KKK...","..KNNNK....KNNNK..","...KKK......KKK...",".................."]),layers:rows18(["...B......B.......","..BBB....BBB......","..BBBBBBBBBB......","..BBBBBBBBBB......","..BBBBBBBBBB......","..BBBBBBBBBB......","...BBBBBBBB.......","....BBBBBB........","..PPPPPPPPPPPPPP..","..PPPPPP.PPPPPPP..",".PPPPPP.PPPPPPPP..",".PPPPPP.PPPPPPPP..","..PPPPPPPPPPPPPP..","...PPPPPPPPPPPP...","...PPP......PPP...","..PPPPP....PPPPP..","...PPP......PPP...",".................."]),
  provenance:{creationDate:"2026-08-13",method:"从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。",referenceBoundary:"只使用‘猫店长驾驶运送餐盒的小火车’这一通用题材；未描摹、像素化或复制第三方图样、角色或标识。",authoringDisclosure:"人工网格创作；生成式图片未参与轮廓或逐格配色。",rightsReview:"通用题材；发布前仍需责任主体完成权利台账签字。",revision:"v13-r2",gridHash:"c84e3646985ce6136a914d9274e9f45f31e5b64527c4baf89e67540705f5c0dd",sourceHash:"8aa1359df085fee024db25dbe2a995b8aeeaf8ca94dd5fa314b0b6fae5d20c18"},
};

const whaleCastle: Pattern = {
  id:"whale-castle",name:"鲸鱼驮着星星城",story:"鲸鱼摆动尾巴，背上的三座星星塔亮起窗户。",category:"奇想",motion:"float",animation:"鲸尾左右摆动；三座塔轻微错拍；蓝色窗格从左到右亮起",motionPlan:{body:"鲸尾左右摆动",prop:"三座塔轻微错拍",fx:"蓝色窗格从左到右亮起"},pieceLabel:"一体成品",pieceSizes:[165],skillTip:"先完成鲸鱼的大轮廓，再从中间向两侧对齐背上三座塔。",estimatedMinutes:[38,55],difficultyAxes:{beads:165,colorChanges:76,pieces:1,articulationPoints:4,symmetry:106,repetition:209},difficultyLabel:"大轮廓分层",difficultyWhy:"鲸身面积大且重复度高，三座塔带来上半区对位与颜色切换。",playIdea:"完成后让鲸尾左右摆动，三座塔的窗从左到右亮起。",assemblyNotes:["鲸鱼与背上的三座塔连成一个主件。","摆放时鲸头朝右，三座塔保持朝上。"],childFinishLine:"拼好后请大人帮忙",reserveByColor:{N:6,W:3,B:7,V:5},
  palette:{N:color("深海蓝","#355276"),W:color("奶油白","#fff5df"),B:color("湖水蓝","#5daabe"),V:color("葡萄紫","#775f9c")},colorways:[
    way("night-city","夜航星城",{N:color("深海蓝","#355276"),W:color("奶油白","#fff5df"),B:color("湖水蓝","#5daabe"),V:color("葡萄紫","#775f9c")}),
    way("coral-city","珊瑚星城",{N:color("深莓紫","#4f315d"),W:color("雪花白","#fffdf7"),B:color("珊瑚橘","#e86f61"),V:color("深葡萄","#623a78")}),
    way("mint-city","薄荷云城",{N:color("深青玉","#285e57"),W:color("奶油白","#fff5df"),B:color("晴空蓝","#69b4d0"),V:color("星光黄","#f5c95d")}),
  ],
  rows:rows18(["....V...V...V.....","...VVV.VVV.VVV....","...VBV.VBV.VBV....","...VVVVVVVVVVV....","....VVBVVBVVV.....","....VVVVVVVVV.....",".....NNNNNNN......","......NNNNN.......","..NNNBBBBBBBN.....",".NNBBBBBBBBBBBBBN.",".NBBBBBBBBBBBBBBN.",".NNBBBBBBBBBBBBBN.","...NBBBBBWWBBBBBBN","....NBBBWWWWBBBBN.",".....NNWWWWBBNN...",".......NNNNNN.....","..................",".................."]),layers:rows18(["....P...P...P.....","...PPP.PPP.PPP....","...PPP.PPP.PPP....","...PPPPPPPPPPP....","....PPPPPPPPP.....","....PPPPPPPPP.....",".....BBBBBBB......","......BBBBB.......","..BBBBBBBBBBB.....",".BBBBBBBBBBBBBBBB.",".BBBBBBBBBBBBBBBB.",".BBBBBBBBBBBBBBBB.","...BBBBBBBBBBBBBBB","....BBBBBBBBBBBBB.",".....BBBBBBBBBB...",".......BBBBBB.....","..................",".................."]),
  provenance:{creationDate:"2026-08-13",method:"从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。",referenceBoundary:"只使用‘鲸鱼背负三塔星城’这一通用题材；未描摹、像素化或复制第三方图样、角色或标识。",authoringDisclosure:"人工网格创作；生成式图片未参与轮廓或逐格配色。",rightsReview:"通用题材；发布前仍需责任主体完成权利台账签字。",revision:"v13-r2",gridHash:"2ddffc2af200aed5e0d95ae5044907403c19ef6781c3a40fd06618147f892195",sourceHash:"6ec04c963c19a3792078b183f9a70b4fed050193ffa4bf451b8495c76da66c72"},
};

const foxKite: Pattern = {
  id: "fox-kite", name: "小狐狸放飞鲸鱼风筝", story: "风一吹，小狐狸拉紧风筝线，鲸鱼风筝就游上了天空。", category: "奇想", motion: "launch",
  animation: "狐狸后仰再站稳；鲸鱼风筝沿斜线摆动；风从左下向右上吹过", motionPlan: { body: "狐狸后仰再站稳", prop: "鲸鱼风筝沿斜线摆动", fx: "风从左下向右上吹过" },
  pieceLabel: "一体成品", pieceSizes: [121], skillTip: "先拼左下狐狸的尖耳和脸，再沿黄色风筝线追到右上的鲸鱼风筝。",
  estimatedMinutes: [30, 45], difficultyAxes: { beads: 121, colorChanges: 45, pieces: 1, articulationPoints: 4, symmetry: 14, repetition: 156 },
  difficultyLabel: "斜线追踪", difficultyWhy: "狐狸、风筝线和鲸鱼风筝连成一个主件；斜线方向与两端大色块需要持续核对。",
  playIdea: "完成后让狐狸先后仰再站稳，鲸鱼风筝沿右上方向摆动。",
  assemblyNotes: ["狐狸、风筝线和鲸鱼风筝连成一个主件。", "摆放时狐狸在左下，鲸鱼风筝朝右上。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { K: 5, O: 6, W: 4, B: 5, Y: 3 },
  palette: { K: color("夜空墨", "#29283b"), O: color("蜜橘", "#ee7b52"), W: color("奶油白", "#fff5df"), B: color("湖水蓝", "#5daabe"), Y: color("星光黄", "#f5c95d") },
  colorways: [
    way("sunset-kite", "晚霞风筝", { K: color("夜空墨", "#29283b"), O: color("蜜橘", "#ee7b52"), W: color("奶油白", "#fff5df"), B: color("湖水蓝", "#5daabe"), Y: color("星光黄", "#f5c95d") }),
    way("berry-kite", "莓果风筝", { K: color("梅子紫", "#624663"), O: color("樱花粉", "#ef91a7"), W: color("雪花白", "#fffdf7"), B: color("葡萄紫", "#775f9c"), Y: color("星光黄", "#f5c95d") }),
    way("forest-kite", "森林风筝", { K: color("深海蓝", "#355276"), O: color("焦糖", "#c58a5b"), W: color("奶油白", "#fff5df"), B: color("薄荷蓝", "#58b7ad"), Y: color("嫩芽绿", "#a8ca79") }),
  ],
  rows: rows18(["..........BBBB....", "........BBBBBBBB..", ".......BBBWWBBBBB.", "........BBBBBBBBBB", ".........BBBBBBBB.", "..........BBBBBB..", ".........YYYY.....", "........YYYY......", ".......YYYY.......", "......YYYY........", "...K.YYYY.........", "..KOKKYYY.........", ".KOOOOKYY.........", "KKOWOOKYY.........", "KOWWWOKK..........", ".KOOOOKK..........", ".KOOOOKK..........", "KKOOOOKK.........."]),
  layers: rows18(["..........PPPP....", "........PPPPPPPP..", ".......PPPPPPPPPP.", "........PPPPPPPPPP", ".........PPPPPPPP.", "..........PPPPPP..", ".........FFFF.....", "........FFFF......", ".......FFFF.......", "......FFFF........", "...F.FFFF.........", "..BBBBBBB.........", ".BBBBBBBB.........", "BBBBBBBBB.........", "BBBBBBBB..........", ".BBBBBBB..........", ".BBBBBBB..........", "BBBBBBBB.........."]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“狐狸拉着鲸鱼形风筝”这一通用题材。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v14-r1", gridHash: "98e55a7879b6dfc33aa9a010e8d742b3ac78c000035d343367336f1cf1b5a03b", sourceHash: "13ad7eddcbd0cde746f26ec9ed31a9b9a8126d101230e29441d944cd94c20474" },
};

const otterSub: Pattern = {
  id: "otter-sub", name: "水獭开泡泡潜艇", story: "小水獭探出圆窗，开着潜艇去寻找会发光的海底邮局。", category: "奇想", motion: "glide",
  animation: "水獭探头点动；尾部螺旋桨循环转动；圆窗和舱灯依次亮起", motionPlan: { body: "水獭探头点动", prop: "尾部螺旋桨循环转动", fx: "圆窗和舱灯依次亮起" },
  pieceLabel: "一体成品", pieceSizes: [175], skillTip: "先拼圆窗里的水獭脸，再沿黄色外壳收到左后方的螺旋桨。",
  estimatedMinutes: [34, 50], difficultyAxes: { beads: 175, colorChanges: 93, pieces: 1, articulationPoints: 3, symmetry: 96, repetition: 213 },
  difficultyLabel: "舱体分区", difficultyWhy: "潜艇外壳是稳定大轮廓，水獭脸、圆窗与尾部螺旋桨构成多段有意义换色。",
  playIdea: "完成后让螺旋桨循环转动，水獭探头上下点动，圆窗从暗到亮。",
  assemblyNotes: ["水獭、潜艇和螺旋桨连成一个主件。", "摆放时潜艇头朝右，螺旋桨在左后方。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { K: 5, Y: 7, B: 5, C: 5, W: 4, R: 3 },
  palette: { K: color("夜空墨", "#29283b"), Y: color("星光黄", "#f5c95d"), B: color("湖水蓝", "#5daabe"), C: color("可可棕", "#8a5d4a"), W: color("奶油白", "#fff5df"), R: color("莓果红", "#cf4e61") },
  colorways: [
    way("yellow-sub", "阳光潜艇", { K: color("夜空墨", "#29283b"), Y: color("星光黄", "#f5c95d"), B: color("湖水蓝", "#5daabe"), C: color("可可棕", "#8a5d4a"), W: color("奶油白", "#fff5df"), R: color("莓果红", "#cf4e61") }),
    way("coral-sub", "珊瑚潜艇", { K: color("梅子紫", "#624663"), Y: color("珊瑚橙", "#ed826e"), B: color("葡萄紫", "#775f9c"), C: color("焦糖", "#c58a5b"), W: color("雪花白", "#fffdf7"), R: color("樱花粉", "#ef91a7") }),
    way("mint-sub", "薄荷潜艇", { K: color("深海蓝", "#355276"), Y: color("薄荷蓝", "#58b7ad"), B: color("湖水蓝", "#5daabe"), C: color("焦糖", "#c58a5b"), W: color("奶油白", "#fff5df"), R: color("蜜橘", "#ee7b52") }),
  ],
  rows: rows18(["......CC....CC....", "......CCC..CCC....", ".....CCWWCCWWCC...", "......CCKWWKCC....", ".......CCCCCC.....", "......KKCCCCKK....", "....KKYYYYYYKK....", "..KKYYYYYYYYYYKK..", ".KKYYYBBBYYYYYKK..", "KKYYYBBBBBYYYYYYKK", "KKYYYBBBBBYYYYYYKK", ".KKYYYBBBYYYYYKK..", "..KKYYYY.YYYYYKK..", "....KKYYYYYYKK....", "....RRKKYYYYKK....", "...RRRRKKKK.......", "....RR............", ".................."]),
  layers: rows18(["......BB....BB....", "......BBB..BBB....", ".....BBBBBBBBBB...", "......BBBBBBBB....", ".......BBBBBB.....", "......BBBBBBBB....", "....BBBBBBBBBB....", "..BBBBBBBBBBBBBB..", ".BBBBBFFFBBBBBBB..", "BBBBBFFFFFBBBBBBBB", "BBBBBFFFFFBBBBBBBB", ".BBBBBFFFBBBBBBB..", "..BBBBBB.BBBBBBB..", "....BBBBBBBBBB....", "....PPBBBBBBBB....", "...PPPPBBBB.......", "....PP............", ".................."]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“水獭从圆窗探头驾驶小潜艇”这一通用题材。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v14-r1", gridHash: "89a2aa9cc5e2da8968b6effc987190faca30ba44954f7ee0e094686877a49f4d", sourceHash: "91a50e15b63fe33f092b3d0d379931717a4ac8f4b734b2ad834965aa77740dc7" },
};

const skateDuck: Pattern = {
  id: "skate-duck", name: "滑板鸭冲下彩虹坡", story: "鸭鸭弯下身体踩稳滑板，从彩虹坡顶冲向下一段冒险。", category: "运动", motion: "roll",
  animation: "鸭子先压低再抬头；两组轮子滚动并带动滑板下坡；坡道色带从上到下依次亮起", motionPlan: { body: "鸭子先压低再抬头", prop: "两组轮子滚动并带动滑板下坡", fx: "坡道色带从上到下依次亮起" },
  pieceLabel: "一体成品", pieceSizes: [155], skillTip: "先拼朝右的鸭头，再沿滑板找到右下的彩虹坡。",
  estimatedMinutes: [30, 44], difficultyAxes: { beads: 155, colorChanges: 56, pieces: 1, articulationPoints: 3, symmetry: 68, repetition: 203 },
  difficultyLabel: "坡顶冲刺", difficultyWhy: "鸭与滑板、彩虹坡连成一个主件；斜坡色带和轮组需要逐行核对。",
  playIdea: "完成后让鸭与滑板沿坡顶向右滑下，再在舞台上接一个腾空翻板动作。",
  assemblyNotes: ["鸭、滑板和彩虹坡连成一个主件。", "摆放时鸭头朝右，彩虹坡从板头下方向右下延伸。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { K: 4, Y: 6, O: 3, B: 3, R: 3 },
  palette: { K: color("夜空墨", "#29283b"), Y: color("星光黄", "#f5c95d"), O: color("蜜橘", "#ee7b52"), B: color("湖水蓝", "#5daabe"), R: color("莓果红", "#cf4e61") },
  colorways: [
    way("sunny-rush", "晴日冲坡", { K: color("夜空墨", "#29283b"), Y: color("星光黄", "#f5c95d"), O: color("蜜橘", "#ee7b52"), B: color("湖水蓝", "#5daabe"), R: color("莓果红", "#cf4e61") }),
    way("berry-rush", "莓果冲坡", { K: color("梅子紫", "#624663"), Y: color("奶油白", "#fff5df"), O: color("珊瑚橙", "#ed826e"), B: color("葡萄紫", "#775f9c"), R: color("樱花粉", "#ef91a7") }),
    way("mint-rush", "薄荷冲坡", { K: color("深海蓝", "#355276"), Y: color("雪花白", "#fffdf7"), O: color("蜜橘", "#ee7b52"), B: color("薄荷蓝", "#58b7ad"), R: color("莓果红", "#cf4e61") }),
  ],
  rows: rows18(["..................", ".....BBBB.........", "...BBYYYYY........", "..BBYYYYKYYYOO....", "..BBYYYYYYYYOOO...", "...YYYYOOYYYY.....", "..YYYYYYYYYYY.....", "...YYYYYYYYY......", "...YYYY.YYYY......", "....YY...YY.......", "..KKKKKKKKKKKKK...", "..KKKKKKKKKKKKK...", "...KKK.....KKK....", "...........RRRRRRR", "..........RRRRRRRR", ".........OOOOOOOOO", "........YYYYYYYYYY", ".......BBBBBBBBBBB"]),
  layers: rows18(["..................", ".....BBBB.........", "...BBBBBBB........", "..BBBBBBBBBBBB....", "..BBBBBBBBBBBBB...", "...BBBBBBBBBB.....", "..BBBBBBBBBBB.....", "...BBBBBBBBB......", "...BBBB.BBBB......", "....BB...BB.......", "..PPPPPPPPPPPPP...", "..PPPPPPPPPPPPP...", "...PPP.....PPP....", "...........FFFFFFF", "..........FFFFFFFF", ".........FFFFFFFFF", "........FFFFFFFFFF", ".......FFFFFFFFFFF"]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“鸭子踩滑板冲下彩色坡道”这一通用题材。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v14-r1", gridHash: "83fbbb58360309eada53527b8da60417dc911a1fb18c7657233be4bd2591704b", sourceHash: "9a222060ef0de58d55c801da22d9538c845c9b1e73103d5a84a53be004b7baeb" },
};

const heartFrame: Pattern = {
  id: "heart-frame", name: "爱心小相框", story: "一颗爱心中间空着，拼完可以立在桌上，塞进一张小照片。", category: "书桌", motion: "sway",
  animation: "爱心外框轻轻左右晃；金边沿内圈亮起；底座稳住不动", motionPlan: { body: "爱心外框轻轻左右晃", prop: "金边沿内圈亮起", fx: "底座稳住不动" },
  pieceLabel: "一体成品", pieceSizes: [106], skillTip: "先拼左右两瓣爱心外框，中间空着，再向下接到底座。",
  estimatedMinutes: [20, 30], difficultyAxes: { beads: 106, colorChanges: 70, pieces: 1, articulationPoints: 0, symmetry: 106, repetition: 75 },
  difficultyLabel: "镂空爱心", difficultyWhy: "106 颗、4 色；中间必须空着，外框要连成一颗爱心再接到底座。",
  playIdea: "拼好后把相框立在书桌上，中间空窗可以放一张小照片。",
  assemblyNotes: ["爱心外框和底座连成一个主件，中间空着。", "摆放时底座朝下，尖角朝下，空窗朝自己。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { R: 4, W: 4, Y: 2, N: 3 },
  palette: { R: color("莓果红", "#cf4e61"), W: color("奶油白", "#fff5df"), Y: color("星光黄", "#f5c95d"), N: color("深海蓝", "#355276") },
  colorways: [
    way("berry-frame", "草莓相框", { R: color("莓果红", "#cf4e61"), W: color("奶油白", "#fff5df"), Y: color("星光黄", "#f5c95d"), N: color("深海蓝", "#355276") }),
    way("grape-frame", "葡萄相框", { R: color("葡萄紫", "#8d6bc0"), W: color("雪花白", "#fffdf7"), Y: color("樱花粉", "#ef91a7"), N: color("深海蓝", "#2c355b") }),
    way("mint-frame", "薄荷相框", { R: color("薄荷绿", "#58b7ad"), W: color("奶油白", "#fff5df"), Y: color("柠檬黄", "#f2d25b"), N: color("深青玉", "#285e57") }),
  ],
  rows: rows18(["...RRRRR..RRRRR...", "..RWWWWWRRWWWWWR..", ".RWYYYYWWWWYYYYWR.", ".RWY..........YWR.", ".RW............WR.", ".RW............WR.", ".RW............WR.", "..RW..........WR..", "...RW........WR...", "....RW......WR....", ".....RW....WR.....", "......RW..WR......", ".......RWWR.......", "........RR........", ".......NNNN.......", "......NNNNNN......", ".....NN....NN.....", ".....NNNNNNNN....."]),
  layers: rows18(["...PPPPP..PPPPP...", "..PBBBBBPPBBBBBP..", ".PBFFFFBBBBFFFFBP.", ".PBF..........FBP.", ".PB............BP.", ".PB............BP.", ".PB............BP.", "..PB..........BP..", "...PB........BP...", "....PB......BP....", ".....PB....BP.....", "......PB..BP......", ".......PBBP.......", "........PP........", ".......BBBB.......", "......BBBBBB......", ".....BB....BB.....", ".....BBBBBBBB....."]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“爱心形小相框立在底座上”这一通用题材；未描摹或复制第三方图样、角色或标识。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v15-r1", gridHash: "d05f3b50240254eccfb54d6fe686fc06fd4363401940fc93f9669301e1886f8d", sourceHash: "bb44e11105d7527ef1a960508e8c8c3c1935937786323787c338d793287859fa" },
};

const bowCat: Pattern = {
  id: "bow-cat", name: "蝴蝶结小猫立牌", story: "小猫头顶一只大蝴蝶结，脚下有底座，拼完可以立在书桌上。", category: "书桌", motion: "hop",
  animation: "蝴蝶结轻轻弹跳；小猫点头；底座稳住不动", motionPlan: { body: "小猫点头", prop: "蝴蝶结轻轻弹跳", fx: "底座稳住不动" },
  pieceLabel: "一体成品", pieceSizes: [174], skillTip: "先拼头顶大蝴蝶结，再画出两只尖耳和脸，最后接到底座。",
  estimatedMinutes: [35, 50], difficultyAxes: { beads: 174, colorChanges: 112, pieces: 1, articulationPoints: 2, symmetry: 174, repetition: 185 },
  difficultyLabel: "立牌小猫", difficultyWhy: "174 颗、6 色；蝴蝶结、猫脸和底座要上下对齐，尖耳不能歪。",
  playIdea: "拼好后把小猫立在书桌上，让大蝴蝶结朝向门口欢迎你。",
  assemblyNotes: ["蝴蝶结、小猫和底座连成一个主件。", "摆放时底座朝下，尖耳朝上，蝴蝶结在头顶。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { P: 4, W: 4, Y: 2, K: 4, O: 3, N: 3 },
  palette: { P: color("樱花粉", "#ef91a7"), W: color("奶油白", "#fff5df"), Y: color("星光黄", "#f5c95d"), K: color("墨黑", "#29283b"), O: color("蜜橘", "#ee7b52"), N: color("深海蓝", "#355276") },
  colorways: [
    way("honey-bow", "蜜橘领结", { P: color("樱花粉", "#ef91a7"), W: color("奶油白", "#fff5df"), Y: color("星光黄", "#f5c95d"), K: color("墨黑", "#29283b"), O: color("蜜橘", "#ee7b52"), N: color("深海蓝", "#355276") }),
    way("grape-bow", "葡萄领结", { P: color("葡萄紫", "#9a82cc"), W: color("雪花白", "#fffdf7"), Y: color("柠檬黄", "#f2d25b"), K: color("深海蓝", "#2c355b"), O: color("薰衣草紫", "#b7a0d2"), N: color("深葡萄", "#51416f") }),
    way("moon-bow", "月光领结", { P: color("莓果粉", "#d96a83"), W: color("雪白", "#f8f7f2"), Y: color("奶油黄", "#f5cd76"), K: color("炭黑", "#30303a"), O: color("暖月灰", "#b9b3ad"), N: color("夜空墨", "#29283b") }),
  ],
  rows: rows18([".....PPPPPPPP.....", "....PPWYYYYWPP....", "...PPWWYYYYWWPP...", "....PPPPPPPPPP....", ".....KK....KK.....", "....KWWK..KWWK....", "...KOWWWWWWWWOK...", "...KOWKWWWWKWOK...", "...KOWWWKKWWWOK...", "...KOWWWWWWWWOK...", "....KOPPPPPPOK....", "...KOOOOOOOOOOK...", "...KOOOOOOOOOOK...", "....KKKKKKKKKK....", "......NNNNNN......", ".....NNNNNNNN.....", "....NNN....NNN....", "....NNNNNNNNNN...."]),
  layers: rows18([".....PPPPPPPP.....", "....PPFFFFFFPP....", "...PPFFFFFFFFPP...", "....PPPPPPPPPP....", ".....BB....BB.....", "....BFFB..BFFB....", "...BBFFFFFFFFBB...", "...BBFBFFFFBFBB...", "...BBFFFBBFFFBB...", "...BBFFFFFFFFBB...", "....BBPPPPPPBB....", "...BBBBBBBBBBBB...", "...BBBBBBBBBBBB...", "....BBBBBBBBBB....", "......BBBBBB......", ".....BBBBBBBB.....", "....BBB....BBB....", "....BBBBBBBBBB...."]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“头顶蝴蝶结的小猫立牌”这一通用题材；未描摹或复制第三方图样、角色或标识。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v15-r1", gridHash: "eb1cd37072c849e05767340068bdad1912d370f4334a8f96a281fca9f5af8da9", sourceHash: "c362d4aa774f4f9146c155962417a07a6fac21418eeb15663426663f05c54d38" },
};

const berrySundae: Pattern = {
  id: "berry-sundae", name: "草莓三球甜筒", story: "草莓、奶油和橘子三球叠在甜筒上，底下有底座，拼完可以立在桌上。", category: "书桌", motion: "bounce",
  animation: "顶上草莓轻轻弹跳；三球错拍晃动；底座稳住不动", motionPlan: { body: "三球错拍晃动", prop: "顶上草莓轻轻弹跳", fx: "底座稳住不动" },
  pieceLabel: "一体成品", pieceSizes: [149], skillTip: "先拼顶上的草莓，再一层层往下做三球和甜筒，最后接到底座。",
  estimatedMinutes: [30, 45], difficultyAxes: { beads: 149, colorChanges: 96, pieces: 1, articulationPoints: 8, symmetry: 126, repetition: 162 },
  difficultyLabel: "分层甜筒", difficultyWhy: "149 颗、6 色；三球和锥形甜筒要上下对齐，底座不能歪。",
  playIdea: "拼好后把甜筒立在书桌上，当作今天的一份不会化的点心。",
  assemblyNotes: ["草莓、三球、甜筒和底座连成一个主件。", "摆放时底座朝下，草莓在最上面。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { R: 2, W: 4, P: 2, Y: 5, O: 3, N: 2 },
  palette: { R: color("莓果红", "#cf4e61"), W: color("奶油白", "#fff5df"), P: color("樱花粉", "#ef91a7"), Y: color("星光黄", "#f5c95d"), O: color("蜜橘", "#ee7b52"), N: color("深海蓝", "#355276") },
  colorways: [
    way("berry-cone", "草莓甜筒", { R: color("莓果红", "#cf4e61"), W: color("奶油白", "#fff5df"), P: color("樱花粉", "#ef91a7"), Y: color("星光黄", "#f5c95d"), O: color("蜜橘", "#ee7b52"), N: color("深海蓝", "#355276") }),
    way("grape-cone", "葡萄甜筒", { R: color("葡萄紫", "#8d6bc0"), W: color("雪花白", "#fffdf7"), P: color("薰衣草紫", "#b7a0d2"), Y: color("薄荷绿", "#78c9b2"), O: color("珊瑚粉", "#f28a9a"), N: color("深葡萄", "#51416f") }),
    way("mint-cone", "薄荷甜筒", { R: color("珊瑚橘", "#ed826e"), W: color("奶油白", "#fff5df"), P: color("薄荷绿", "#58b7ad"), Y: color("柠檬黄", "#f2d25b"), O: color("蜜橘", "#ee7b52"), N: color("深青玉", "#285e57") }),
  ],
  rows: rows18(["........RR........", ".......RWWWR......", "......RWWWWWR.....", ".....PPPPPPPPP....", "....PPWWPWWWWPP...", "...PPWWWWWWWWWPP..", "....YYYYYYYYYYY...", "...YYYWYYYYYWYY...", "..YYYYYYYYYYYYYY..", "...OOOOOOOOOOO....", "..OOOOWWWWWWOOO...", "...OOOOOOOOOOO....", ".....WYYYYYYW.....", "......WYYYYW......", ".......WYYW.......", "........WW........", ".......NNNN.......", "......NNNNNN......"]),
  layers: rows18(["........FF........", ".......FBBBF......", "......FBBBBBF.....", ".....PPPPPPPPP....", "....PPBBPBBBBPP...", "...PPBBBBBBBBBPP..", "....BBBBBBBBBBB...", "...BBBBBBBBBBBB...", "..BBBBBBBBBBBBBB..", "...BBBBBBBBBBB....", "..BBBBBBBBBBBBB...", "...BBBBBBBBBBB....", ".....BBBBBBBB.....", "......BBBBBB......", ".......BBBB.......", "........BB........", ".......BBBB.......", "......BBBBBB......"]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“三球冰淇淋甜筒立在底座上”这一通用题材；未描摹或复制第三方图样、角色或标识。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v15-r1", gridHash: "238a5bffca5fbcd0d5b4879649c1d858def810359449c1f044b52181b30d290e", sourceHash: "dd27c0021b788861def25e3d03e776d66e6d3cb6a42796dad2e9ffb7eeb989df" },
};

const berryBoba: Pattern = {
  id: "berry-boba", name: "草莓珍珠奶茶", story: "一杯插着吸管的草莓奶茶，杯底有珍珠，拼完可以立在书桌上。", category: "书桌", motion: "float",
  animation: "吸管轻轻晃动；杯口奶油起伏；珍珠在杯底错拍亮起", motionPlan: { body: "杯子稳住", prop: "吸管轻轻晃动", fx: "珍珠在杯底错拍亮起" },
  pieceLabel: "一体成品", pieceSizes: [162], skillTip: "先拼吸管，再画出杯口奶油、杯子和珍珠，最后接到底座。",
  estimatedMinutes: [30, 45], difficultyAxes: { beads: 162, colorChanges: 90, pieces: 1, articulationPoints: 0, symmetry: 162, repetition: 204 },
  difficultyLabel: "珍珠杯", difficultyWhy: "162 颗、6 色；吸管、杯口和杯底珍珠要上下对齐。",
  playIdea: "拼好后把奶茶立在书桌上，当作今天的一杯不会洒的小饮品。",
  assemblyNotes: ["吸管、杯子、珍珠和底座连成一个主件。", "摆放时底座朝下，吸管朝上。"],
  childFinishLine: "拼好后请大人帮忙", reserveByColor: { G: 2, W: 8, P: 2, Y: 5, K: 2, N: 2 },
  palette: { G: color("叶子绿", "#6ba270"), W: color("奶油白", "#fff5df"), P: color("樱花粉", "#ef91a7"), Y: color("星光黄", "#f5c95d"), K: color("墨黑", "#29283b"), N: color("深海蓝", "#355276") },
  colorways: [
    way("berry-tea", "草莓奶茶", { G: color("叶子绿", "#6ba270"), W: color("奶油白", "#fff5df"), P: color("樱花粉", "#ef91a7"), Y: color("星光黄", "#f5c95d"), K: color("墨黑", "#29283b"), N: color("深海蓝", "#355276") }),
    way("grape-tea", "葡萄奶茶", { G: color("薄荷绿", "#58b7ad"), W: color("雪花白", "#fffdf7"), P: color("葡萄紫", "#9a82cc"), Y: color("薰衣草紫", "#b7a0d2"), K: color("深海蓝", "#2c355b"), N: color("深葡萄", "#51416f") }),
    way("matcha-tea", "抹茶奶茶", { G: color("叶子绿", "#6ba270"), W: color("奶油白", "#fff5df"), P: color("薄荷绿", "#78c9b2"), Y: color("柠檬叶", "#d6d765"), K: color("夜空墨", "#29283b"), N: color("深青玉", "#285e57") }),
  ],
  rows: rows18(["........GG........", "........GG........", "........GG........", "......WWWWWW......", ".....WPPPPPPW.....", "....WPPWWWWPPW....", "...WPPWWWWWWPPW...", "...WPPWWWWWWPPW...", "...WWWWWWWWWWWW...", "...WYYYYYYYYYYW...", "...WYYYYYYYYYYW...", "...WYYKKYYKKYYW...", "...WYYKKYYKKYYW...", "...WYYYYYYYYYYW...", "...WWWWWWWWWWWW...", "....WWWWWWWWWW....", ".....NNNNNNNN.....", "......NNNNNN......"]),
  layers: rows18(["........FF........", "........FF........", "........FF........", "......BBBBBB......", ".....BPPPPPPB.....", "....BPPBBBBPPB....", "...BPPBBBBBBPPB...", "...BPPBBBBBBPPB...", "...BBBBBBBBBBBB...", "...BBBBBBBBBBBB...", "...BBBBBBBBBBBB...", "...BBBFFBBFFBBB...", "...BBBFFBBFFBBB...", "...BBBBBBBBBBBB...", "...BBBBBBBBBBBB...", "....BBBBBBBBBB....", ".....BBBBBBBB.....", "......BBBBBB......"]),
  provenance: { creationDate: "2026-08-13", method: "从空白 18×18 网格开始人工逐格构图；用四邻域、割点、缩略图与剪影脚本反复校验。", referenceBoundary: "只使用“插吸管的珍珠奶茶杯立在底座上”这一通用题材；未描摹或复制第三方图样、角色或标识。", authoringDisclosure: "人工网格创作。", rightsReview: "家庭自用。", revision: "v15-r1", gridHash: "1b017aa8d57e02a8affc087e844f61e5881a5e52e68a00c2da033e9cc1de896e", sourceHash: "1f0aa47c4abbe2a2ee3ace0febb2ac9bc7c3b50a4f4ae0a5b3f5fe14e34d0267" },
};

export const PATTERNS: Pattern[] = [scarfSprint, heartFrame, bowCat, berrySundae, berryBoba, balloonBear, moonRabbit, sushiTrain, whaleCastle, foxKite, otterSub, skateDuck];

const dragonCastle: Pattern = {
  id: "dragon-castle",
  name: "飞龙盘绕城堡",
  story: "一条青色飞龙绕着石头城堡转了一圈，塔楼上的金窗一扇扇亮着。",
  category: "幻想",
  advanced: true,
  motion: "glide",
  animation: "飞龙沿城堡外圈缓慢盘旋；塔楼金窗依次亮起；翅膀轻轻扇动",
  motionPlan: { body: "城堡稳住", prop: "飞龙沿外圈盘旋", fx: "金窗依次亮起" },
  pieceLabel: "一体成品",
  pieceSizes: [480],
  skillTip: "先拼两座塔楼、城门和金窗，再从龙头沿着外圈拼到尾巴。",
  estimatedMinutes: [85, 125],
  difficultyAxes: { beads: 480, colorChanges: 275, pieces: 1, articulationPoints: 4, symmetry: 159, repetition: 602 },
  difficultyLabel: "龙绕城堡",
  difficultyWhy: "480 颗、8 色；飞龙把城堡圈在中间，塔楼窗户和龙身要分开认。",
  playIdea: "完成后让飞龙绕着城堡慢慢盘旋，金窗从下往上亮起来。",
  assemblyNotes: ["飞龙、两座塔楼和城门连成一个主件。", "摆放时城门朝下，龙头在左侧，龙尾绕回城底。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { D:7, R:3, G:13, Y:3, K:2, W:2, B:3, N:2 },
  palette: { D: color("石墙灰", "#8a7f6e"), R: color("砖红", "#b85d4a"), G: color("青鳞绿", "#3e9a74"), Y: color("星光黄", "#f5c95d"), K: color("夜空墨", "#29283b"), W: color("奶油白", "#fff5df"), B: color("湖水蓝", "#5daabe"), N: color("深海蓝", "#355276") },
  colorways: [],
  rows: [
    ".............................",
    ".............................",
    "...............GGGGGG........",
    ".............GGGGGGGGGGG.....",
    "...........GGGGGGGNGGGGGG....",
    "..........GGNGGGG..GGGGGGG...",
    "..........GGGYG.......GYGGG..",
    ".........GGGG.........RYGGGG.",
    ".......BGGGG.........RRRGGGG.",
    "...B..BBBGGR.........RRRRGGG.",
    "..BBBBBBGGGRR.......RRRRRGGG.",
    ".BBBBBBBGYRRR.......WDDDDGYG.",
    "BBBBBBBBGYRRRR...R..WDDDDNYG.",
    ".BBBBBBBGGDDDD..RR..WDYYDGGG.",
    ".....BBBGDDDDDDRDRDRWDYYDGGG.",
    "....YYBGGYYDDRDRDRDRWDDDDGGG.",
    "...GGYGYGYYDDDDDDDDDWDDDDGGG.",
    ".GWGGGGYWDDDDDDDDDDDWDYYGGYG.",
    ".RKKGGGGWDDDDDDYYYYDWDYYGGYG.",
    ".GGGGGY.WYYDDDDYYYYDWDDDGGGG.",
    "...GGGY.WYYDDDDKKKKDWDDDNGG..",
    "....G...WDDDDDDKYYKDWDDGGGG..",
    "........WDDDDDDKKKKDWDGGYGG..",
    "........GGGGDDDKKKKDGGGGYG...",
    "........GGGGGGDDGGGGGGGGDD...",
    "........RGGGGGGGGGYGGGGNNN...",
    "........NRGGYGGGGGYGGGNNNN...",
    "........BBBBYGGGGGGBBBBBBB...",
    ".............................",
  ],
  layers: [
    ".............................",
    ".............................",
    "...............PPPPPP........",
    ".............PPPPPPPPPPP.....",
    "...........PPPPPPPPPPPPPP....",
    "..........PPPPPPP..PPPPPPP...",
    "..........PPPPP.......PPPPP..",
    ".........PPPP.........BPPPPP.",
    ".......PPPPP.........BBBPPPP.",
    "...P..PPPPPB.........BBBBPPP.",
    "..PPPPPPPPPBB.......BBBBBPPP.",
    ".PPPPPPPPPBBB.......BBBBBPPP.",
    "PPPPPPPPPPBBBB...B..BBBBBPPP.",
    ".PPPPPPPPPBBBB..BB..BBFFBPPP.",
    ".....PPPPBBBBBBBBBBBBBFFBPPP.",
    "....PPPPPFFBBBBBBBBBBBBBBPPP.",
    "...PPPPPPFFBBBBBBBBBBBBBBPPP.",
    ".PPPPPPPBBBBBBBBBBBBBBFFPPPP.",
    ".PPPPPPPBBBBBBBFFFFBBBFFPPPP.",
    ".PPPPPP.BFFBBBBFFFFBBBBBPPPP.",
    "...PPPP.BFFBBBBBBBBBBBBBPPP..",
    "....P...BBBBBBBBFFBBBBBPPPP..",
    "........BBBBBBBBBBBBBBPPPPP..",
    "........PPPPBBBBBBBBPPPPPP...",
    "........PPPPPPBBPPPPPPPPBB...",
    "........FPPPPPPPPPPPPPPBBB...",
    "........BFPPPPPPPPPPPPBBBB...",
    "........BBBBPPPPPPPBBBBBBB...",
    ".............................",
  ],
  provenance: {
    creationDate: "2026-10-01",
    method: "29×29 逐格手绘构图；按四邻域收成一个主件，并用缩略图核对主题轮廓。",
    referenceBoundary: "只使用通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "逐格手绘构图。生成式图片未参与逐格描摹。",
    rightsReview: "家庭自用。",
    revision: "adv-r2",
    gridHash: "cca646d8a0d840c7bfbc4edf106cf38c32e73d78533e4be321f813cc78893391",
    sourceHash: "4a9ab8ea1d7626c244742fe9af7d861a84cd6ed060cb8aeb8b769aa4d414e996",
  },
};

const rocketLaunch: Pattern = {
  id: "rocket-launch",
  name: "火箭发射塔",
  story: "银色火箭靠在发射塔上，窗户是蓝的，尾巴喷出橙红的火和白烟。",
  category: "航天",
  advanced: true,
  motion: "launch",
  animation: "火箭整体轻轻上升；发射塔留在原地；尾焰和白烟向上窜",
  motionPlan: { body: "火箭整体上升", prop: "发射塔架留在原地", fx: "尾焰和白烟向上窜" },
  pieceLabel: "一体成品",
  pieceSizes: [303],
  skillTip: "先拼火箭尖头和蓝窗户，再顺着右边的发射塔接到尾部的火焰。",
  estimatedMinutes: [50, 75],
  difficultyAxes: { beads: 303, colorChanges: 106, pieces: 1, articulationPoints: 3, symmetry: 75, repetition: 410 },
  difficultyLabel: "发射对准",
  difficultyWhy: "303 颗、7 色；火箭要对准旁边的发射塔，火焰和白烟接在尾巴下面。",
  playIdea: "完成后让火箭往上起飞，火焰喷射，白烟在两边散开。",
  assemblyNotes: ["火箭、发射塔、火焰和烟雾连成一个主件。", "摆放时火箭尖头朝上，发射塔在右侧。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { S:5, R:3, B:2, W:3, K:3, G:6, Y:2 },
  palette: { S: color("银灰", "#c0c4cc"), R: color("火焰红", "#e05040"), B: color("晴空蓝", "#5b8fd6"), W: color("云朵白", "#fdf6ec"), K: color("墨夜黑", "#33304a"), G: color("金属灰", "#6d727a"), Y: color("暖阳橙", "#ef8b57") },
  colorways: [],
  rows: [
    ".............................",
    "..........WW.................",
    "...........S.................",
    "..........SS.................",
    "..........SS.................",
    ".........SSSS................",
    ".........SSSS.....GGGGG......",
    "........SSSSSS....GGGGG......",
    "........SWBKBSGGGGGGKG.......",
    "........SBBBBSGGGGGGKG.......",
    "........SBBBBS.....GGG.......",
    "........SBBBBS.....GGG.......",
    "........SSSSSS....GGGGG......",
    "........RRRRRR....GGGGG......",
    "........RRRRRR.....GKG.......",
    "........SSSSSS.....GKG.......",
    ".....RSRSSSSSSRSRGGGGG.......",
    ".....RRRSSSSSSRRRGGGGG.......",
    ".....RRRSSSSSSRRR.GGGGG......",
    ".....RRRSSSSSSRRR.GGGGG......",
    ".....RRR.YYYY.RRR..GGG.......",
    ".........YYYY......GKG.......",
    ".........YYYY......GKG.......",
    ".....WWW.YRRY......GGG.......",
    "....WWWWWWRR..WWW..GGG.......",
    "....WWWWWWRRWWWWWW.GGG.......",
    "....WWWGGGGGGGGWWW...........",
    "....KKKKKKKKKKKKKKKKKK.......",
    "....KKKKKKKKKKKKKKKKKK.......",
  ],
  layers: [
    ".............................",
    "..........BB.................",
    "...........B.................",
    "..........BB.................",
    "..........BB.................",
    ".........BBBB................",
    ".........BBBB.....BBBBB......",
    "........BBBBBB....BBBBB......",
    "........BFFFFBPPPPPBBB.......",
    "........BFFFFBPPPPPBBB.......",
    "........BFFFFB.....BBB.......",
    "........BFFFFB.....BBB.......",
    "........BBBBBB....BBBBB......",
    "........BBBBBB....BBBBB......",
    "........BBBBBB.....BBB.......",
    "........BBBBBB.....BBB.......",
    ".....BBBBBBBBBBBBPPBBB.......",
    ".....BBBBBBBBBBBBPPBBB.......",
    ".....BBBBBBBBBBBB.BBBBB......",
    ".....BBBBBBBBBBBB.BBBBB......",
    ".....BBB.FFFF.BBB..BBB.......",
    ".........FFFF......BBB.......",
    ".........FFFF......BBB.......",
    ".....FFF.FFFF......BBB.......",
    "....FFFFFFFF..FFF..BBB.......",
    "....FFFFFFFFFFFFFF.BBB.......",
    "....FFFBBBBBBBBFFF...........",
    "....BBBBBBBBBBBBBBBBBB.......",
    "....BBBBBBBBBBBBBBBBBB.......",
  ],
  provenance: {
    creationDate: "2026-10-01",
    method: "29×29 逐格手绘构图；按四邻域收成一个主件，并用缩略图核对主题轮廓。",
    referenceBoundary: "只使用通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "逐格手绘构图。生成式图片未参与逐格描摹。",
    rightsReview: "家庭自用。",
    revision: "adv-r2",
    gridHash: "3b897b36e5738099a10f09d8dc1ec48cd0d8a2457c890dc3c54b46ee1426d541",
    sourceHash: "63a37cb11f0f81a70a44e5eecf69a682f655f4d16d70f64f2a063f94cb90b4be",
  },
};

const tigerShark: Pattern = {
  id: "tiger-shark",
  name: "虎鲨破浪",
  story: "一条深蓝色的虎鲨破开浪花，灰鳍竖在背上，嘴里露出一排白牙。",
  category: "海洋",
  advanced: true,
  motion: "glide",
  animation: "鲨身向前滑行；背鳍轻轻摆动；浪花和浮标跟着起伏",
  motionPlan: { body: "鲨身向前滑行", prop: "背鳍轻轻摆动", fx: "浪花和浮标起伏" },
  pieceLabel: "一体成品",
  pieceSizes: [484],
  skillTip: "先拼鲨鱼的大轮廓和白肚皮，再补背鳍、条纹和底下的浪。",
  estimatedMinutes: [80, 120],
  difficultyAxes: { beads: 484, colorChanges: 221, pieces: 1, articulationPoints: 1, symmetry: 285, repetition: 664 },
  difficultyLabel: "破浪追踪",
  difficultyWhy: "484 颗、7 色；鲨鱼横在浪上，背鳍、牙齿和浪花要顺着身体找。",
  playIdea: "完成后让鲨鱼贴着浪面向前游，浪花在身边溅开。",
  assemblyNotes: ["鲨鱼、背鳍、浮标和海浪连成一个主件。", "摆放时鲨鱼头朝右，浪花在下面。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { N:15, W:5, B:6, D:3, K:2, R:2, Y:2 },
  palette: { N: color("深海蓝", "#23406e"), W: color("浪花白", "#f7f3ea"), B: color("海水青", "#3ec4d4"), D: color("鳍灰", "#8aa0b5"), K: color("墨纹", "#2a2838"), R: color("珊瑚红", "#d46558"), Y: color("浮标黄", "#f2c14b") },
  colorways: [],
  rows: [
    ".............................",
    ".............................",
    ".............................",
    "..............DDD............",
    "..............DDD............",
    ".............DDDDD...........",
    ".............DDDDD...........",
    "NNN..........DDDDD...........",
    "NNN.........DDDDDDD..........",
    "NNNN....NNNNDDDDDDDNNNN......",
    ".NNNN.NNNNKNDKDDKDDNWNNNN....",
    ".NNNNNNNNNKNDKDNKDDWKKNNNN...",
    "..NNNNNNNNKNDKDNKDKNWWWWWW...",
    "..NNNNNNNNKWWKWWKWKWNRRRRRN..",
    "..NNNNNNWWWWWWWWWWKWWRRRRR...",
    ".NNNNNNWWWWWWWWNNNWWWWWWNN...",
    ".NNNNNNNWWWWWWWNNNNBWWWNN....",
    "NNNNN...NWWWWWWNNNBBBWN......",
    "YYYY........NNNNNNNBBBWWW....",
    "YRRY..............NBBBWWW....",
    "YYYY...............NBBWWW....",
    "YYYYBBBBWWBBBBWWBBBBWBBBBWWBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "NNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    ".............................",
  ],
  layers: [
    ".............................",
    ".............................",
    ".............................",
    "..............BBB............",
    "..............BBB............",
    ".............BBBBB...........",
    ".............BBBBB...........",
    "BBB..........BBBBB...........",
    "BBB.........BBBBBBB..........",
    "BBBB....BBBBBBBBBBBBBBB......",
    ".BBBB.BBBBBBBBBBBBBBBBBBB....",
    ".BBBBBBBBBBBBBBBBBBBBBBBBB...",
    "..BBBBBBBBBBBBBBBBBBBBBBBB...",
    "..BBBBBBBBBBBBBBBBBBBBBBBBB..",
    "..BBBBBBBBBBBBBBBBBBBBBBBB...",
    ".BBBBBBBBBBBBBBBBBBBBBBBBB...",
    ".BBBBBBBBBBBBBBBBBBFBBBBB....",
    "BBBBB...BBBBBBBBBBFFFBB......",
    "FFFF........BBBBBBBFFFFFF....",
    "FFFF..............BFFFFFF....",
    "FFFF...............BFFFFF....",
    "FFFFBBBBBBBBBBBBBBBBBFFFBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBFBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    ".............................",
  ],
  provenance: {
    creationDate: "2026-10-01",
    method: "29×29 逐格手绘构图；按四邻域收成一个主件，并用缩略图核对主题轮廓。",
    referenceBoundary: "只使用通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "逐格手绘构图。生成式图片未参与逐格描摹。",
    rightsReview: "家庭自用。",
    revision: "adv-r2",
    gridHash: "d9becd8021811eb120080191add9cd7d05ec8ea0702f4264c42251d6b337b260",
    sourceHash: "0c229c05123e6ec462e6381456f7698965927f762cb9b79f0f2b1b157058ab5c",
  },
};

const robotGuard: Pattern = {
  id: "robot-guard",
  name: "机器人守卫",
  story: "一个方头机器人站得笔直，红眼睛亮着，胸口有一颗蓝色能量核。",
  category: "科幻",
  advanced: true,
  motion: "hop",
  animation: "身体轻轻点头；红眼睛和胸口能量核一起闪；天线尖尖亮一下",
  motionPlan: { body: "身体轻轻点一下", prop: "红眼睛和能量核闪烁", fx: "天线尖尖亮一下" },
  pieceLabel: "一体成品",
  pieceSizes: [393],
  skillTip: "先拼方方的头和两只红眼睛，再往下拼胸口、手臂和双脚。",
  estimatedMinutes: [70, 105],
  difficultyAxes: { beads: 393, colorChanges: 215, pieces: 1, articulationPoints: 3, symmetry: 377, repetition: 491 },
  difficultyLabel: "机甲分块",
  difficultyWhy: "393 颗、7 色；头、手臂和双腿都连在身体上，胸口的蓝核是中心。",
  playIdea: "完成后让机器人轻轻点一下头，红眼睛和胸口一起亮。",
  assemblyNotes: ["头、身体、手臂和双腿连成一个主件。", "摆放时天线朝上，两只脚踩在最下面。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { D:11, K:9, R:2, B:2, Y:2, W:2, G:2 },
  palette: { D: color("装甲灰", "#9aa3ad"), K: color("墨夜黑", "#2c3144"), R: color("信号红", "#e24b4b"), B: color("能量蓝", "#4aa3e0"), Y: color("警示黄", "#f0c14d"), W: color("高光白", "#f4f1ea"), G: color("状态绿", "#6fbf7a") },
  colorways: [],
  rows: [
    "..............R..............",
    ".............YYY.............",
    "..............Y..............",
    "........KKKKKKKKKKKKK........",
    "........KDDDDDDDDDDDK........",
    "........KDRRRDDDRRRDK........",
    "........KDRWRDDDRWRDK........",
    "........KDRRRDDDRRRDK........",
    "........KDDWWWWWWWDDK........",
    "........KDDKKKKKKKDDK........",
    "........KKKKKKKKKKKKK........",
    "............KKKKK............",
    "............KKKKK............",
    ".......KKKKKKKKKKKKKKK.......",
    "...DDDDDDDDGGGGGGGDDDDDDDD...",
    "...DDDDDDDDDDBBBDDDDDDDDDD...",
    "...DDDDDDDDDBBWBBDDDDDDDDD...",
    "...KKKKDDDDDBBBBBDDDDDKKKK...",
    "...KKKKDDGGGDBBBDYYYDDKKKK...",
    "...KKKKDDGGGDDDDDYYYDDKKKK...",
    "..DDDD.KKKKKKKKKKKKKKK.DDDD..",
    "..DYDD...DDDDKKKDDDD...DYDD..",
    "..DDDD...DDDDKKKDDDD...DDDD..",
    ".........DDDD...DDDD.........",
    ".........DDDD...DDDD.........",
    ".........DDDD...DDDD.........",
    "........KKKKKK.KKKKKK........",
    "........KWWWWK.KWWWWK........",
    "........KKKKKK.KKKKKK........",
  ],
  layers: [
    "..............F..............",
    ".............FFF.............",
    "..............F..............",
    "........BBBBBBBBBBBBB........",
    "........BBBBBBBBBBBBB........",
    "........BBPPPBBBPPPBB........",
    "........BBPPPBBBPPPBB........",
    "........BBPPPBBBPPPBB........",
    "........BBBPPPPPPPBBB........",
    "........BBBBBBBBBBBBB........",
    "........BBBBBBBBBBBBB........",
    "............BBBBB............",
    "............BBBBB............",
    ".......BBBBBBBBBBBBBBB.......",
    "...BBBBBBBBFFFFFFFBBBBBBBB...",
    "...BBBBBBBBBBPPPBBBBBBBBBB...",
    "...BBBBBBBBBPPPPPBBBBBBBBB...",
    "...BBBBBBBBBPPPPPBBBBBBBBB...",
    "...BBBBBBFFFBPPPBFFFBBBBBB...",
    "...BBBBBBFFFBBBBBFFFBBBBBB...",
    "..BBBB.BBBBBBBBBBBBBBB.BBBB..",
    "..BFBB...BBBBBBBBBBB...BFBB..",
    "..BBBB...BBBBBBBBBBB...BBBB..",
    ".........BBBB...BBBB.........",
    ".........BBBB...BBBB.........",
    ".........BBBB...BBBB.........",
    "........BBBBBB.BBBBBB........",
    "........BBBBBB.BBBBBB........",
    "........BBBBBB.BBBBBB........",
  ],
  provenance: {
    creationDate: "2026-10-01",
    method: "29×29 逐格手绘构图；按四邻域收成一个主件，并用缩略图核对主题轮廓。",
    referenceBoundary: "只使用通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "逐格手绘构图。生成式图片未参与逐格描摹。",
    rightsReview: "家庭自用。",
    revision: "adv-r2",
    gridHash: "8ae61032bbde5956b5e95cb61b5b0ef92ad36c948e1e11d7a1f2d78cea75b86b",
    sourceHash: "ce436f68665e5230991588dc566bfc81cfa2dd2b6133255ac4392ac32521f59c",
  },
};

const retroGamepad: Pattern = {
  id: "retro-gamepad",
  name: "复古游戏手柄",
  story: "一只灰色手柄，左边是十字键，右边是四颗彩色按钮，底下拖着一根线。",
  category: "游戏",
  advanced: true,
  motion: "twist",
  animation: "手柄轻轻左右扭一下；四颗按钮轮流亮起；连线跟着晃",
  motionPlan: { body: "手柄轻轻扭动", prop: "四颗按钮轮流亮起", fx: "连线跟着晃" },
  pieceLabel: "一体成品",
  pieceSizes: [404],
  skillTip: "先拼灰色外壳，再把左边十字键和右边四色按钮对齐。",
  estimatedMinutes: [65, 100],
  difficultyAxes: { beads: 404, colorChanges: 143, pieces: 1, articulationPoints: 1, symmetry: 240, repetition: 595 },
  difficultyLabel: "左右分键",
  difficultyWhy: "404 颗、8 色；十字键和四色按钮分在两边，线从手柄底下拖出来。",
  playIdea: "完成后让四颗按钮轮流亮起，手柄轻轻扭一下。",
  assemblyNotes: ["手柄外壳、按键和连线连成一个主件。", "摆放时十字键在左，彩色按钮在右，线朝下。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { D:16, K:3, R:2, Y:2, B:2, G:2, W:2, N:4 },
  palette: { D: color("手柄灰", "#7b8190"), K: color("墨夜黑", "#2a2838"), R: color("按钮红", "#e24b4b"), Y: color("按钮黄", "#f0c14d"), B: color("按钮蓝", "#4a8ce0"), G: color("按钮绿", "#5cba70"), W: color("高光白", "#f4f1ea"), N: color("连线蓝", "#355276") },
  colorways: [],
  rows: [
    ".............................",
    ".............................",
    ".............................",
    ".............................",
    ".............................",
    ".............................",
    "............DDDDD............",
    "........DDDDDDDDDDDDD........",
    "......DDDDDDDDDDDDDDDDD......",
    "....DDDDDDDDDDDDDDYYYYDDD....",
    "...DDDKKKDDKKDKKDDYYYYDDDD...",
    "...DDDKKKDDDDDDDDDYYYYDDDD...",
    "..DDDKKWKKDWWWDBBBDDDDRRRDD..",
    "..DDDKKKKKDWWWDBBBDDDDRRRDD..",
    "..DDDDKKKDDDDDDBBBDDDDRRRDD..",
    "...DDDKKKDDDDDDBBBDDDDRRRD...",
    "...DDDDDDDDDWWWWDDGGGGDDDD...",
    "....DDDDDDDDWWWWDDGGGGDDD....",
    "...DDDDDDDDDDDDDDDGGGGDDDD...",
    "...DDDDDDDDDDDNDDDDDDDDDDD...",
    "...DDDDDDDDD.NNN.DDDDDDDDD...",
    "....DDDDDDD..NNN..DDDDDDD....",
    "....DDKKKKK..NNN..KKKKKDD....",
    ".....DKKKKK..NNN..KKKKKD..N..",
    "......DDD....NNNN...DDD.NNNN.",
    "..............NNNNNNNNNNNNN..",
    "................NNNNNNNNNN...",
    "..................NNNNNN.....",
    ".............................",
  ],
  layers: [
    ".............................",
    ".............................",
    ".............................",
    ".............................",
    ".............................",
    ".............................",
    "............BBBBB............",
    "........BBBBBBBBBBBBB........",
    "......BBBBBBBBBBBBBBBBB......",
    "....BBBBBBBBBBBBBBPPPPBBB....",
    "...BBBBBBBBBBBBBBBPPPPBBBB...",
    "...BBBBBBBBBBBBBBBPPPPBBBB...",
    "..BBBBBBBBBBBBBPPPBBBBPPPBB..",
    "..BBBBBBBBBBBBBPPPBBBBPPPBB..",
    "..BBBBBBBBBBBBBPPPBBBBPPPBB..",
    "...BBBBBBBBBBBBPPPBBBBPPPB...",
    "...BBBBBBBBBBBBBBBPPPPBBBB...",
    "....BBBBBBBBBBBBBBPPPPBBB....",
    "...BBBBBBBBBBBBBBBPPPPBBBB...",
    "...BBBBBBBBBBBFBBBBBBBBBBB...",
    "...BBBBBBBBB.FFF.BBBBBBBBB...",
    "....BBBBBBB..FFF..BBBBBBB....",
    "....BBBBBBB..FFF..BBBBBBB....",
    ".....BBBBBB..FFF..BBBBBB..F..",
    "......BBB....FFFF...BBB.FFFF.",
    "..............FFFFFFFFFFFFF..",
    "................FFFFFFFFFF...",
    "..................FFFFFF.....",
    ".............................",
  ],
  provenance: {
    creationDate: "2026-10-01",
    method: "29×29 逐格手绘构图；按四邻域收成一个主件，并用缩略图核对主题轮廓。",
    referenceBoundary: "只使用通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "逐格手绘构图。生成式图片未参与逐格描摹。",
    rightsReview: "家庭自用。",
    revision: "adv-r2",
    gridHash: "0769963635787d38e50be8d72d727df3df0d172b9ecbfc0c841fc5a71a0c0876",
    sourceHash: "244fa672235825fa98178a59c4049c30a424f9832ab48a9dcb8a17bfc7f9aa8b",
  },
};

const ninjaMoon: Pattern = {
  id: "ninja-moon",
  name: "忍者城月光",
  story: "深色屋顶的小城楼立在水边，背后升起一轮金色月亮，两盏红灯笼亮着。",
  category: "东方",
  advanced: true,
  motion: "sway",
  animation: "城楼稳住；月亮轻轻起伏；红灯笼和水面月光一起闪",
  motionPlan: { body: "城楼稳住", prop: "月亮轻轻起伏", fx: "灯笼和水面月光闪一下" },
  pieceLabel: "一体成品",
  pieceSizes: [494],
  skillTip: "先拼三层屋顶和城门，再补背后的月亮、左边的树和红灯笼。",
  estimatedMinutes: [85, 125],
  difficultyAxes: { beads: 494, colorChanges: 225, pieces: 1, articulationPoints: 3, symmetry: 244, repetition: 679 },
  difficultyLabel: "月下城楼",
  difficultyWhy: "494 颗、8 色；城楼叠着屋顶，月亮在后面，红灯笼挂在墙边。",
  playIdea: "完成后让月亮慢慢升高，两盏红灯笼一起亮。",
  assemblyNotes: ["城楼、月亮、松树、灯笼和水连成一个主件。", "摆放时月亮在右上，城楼和水在下面。"],
  childFinishLine: "拼好后请大人帮忙",
  reserveByColor: { Y:7, W:2, K:5, D:7, R:2, B:5, G:4, N:2 },
  palette: { Y: color("月黄金", "#f3c85a"), W: color("月白", "#fff6df"), K: color("瓦片墨", "#2a2838"), D: color("城墙棕", "#8d735c"), R: color("灯笼红", "#e15b4a"), B: color("夜水蓝", "#355e92"), G: color("松叶绿", "#3f7d55"), N: color("夜影紫", "#5a4e70") },
  colorways: [],
  rows: [
    ".............................",
    ".............................",
    "..................YYY........",
    "...............YYYYYYYYY.....",
    "..............KYYYYYYYYYY....",
    "............KKKKYYYYYYYYYY...",
    "..........KKKKKKKKYYYYYYYY...",
    "...........DDDDDDWWYYKKYYY...",
    "...........DDDDDDWWWYKYYYYY..",
    "...GGG.....KKKKKKWWYYYYYYYY..",
    "...GGG...KKKKKKKKKKYYWWWYYY..",
    "..GGGGG......YKYYYYYYWWWYY...",
    "..GGGGGG....KKKKYYYYYWWWYY...",
    "..GGGGGG.KKKKKKKKKKYYYYYYY...",
    "...GGGGKYKKKKKKKKKKYKYYYY....",
    "..GGGGGRRRDDDDDDDDRRRYYY.....",
    ".GGGGGGRYRDDKKKDDDRYR........",
    "GGGGGGGRRRDDKKKYYDRRR........",
    "GGGGDDGRRRDDKYKYYDRRR........",
    "GGGDDDGGGDDDKKKDDDD..........",
    "...DDD...DDDKKKDDDD..........",
    "...DDDDDDDDDKKKDDDDDDD.......",
    "...DDDDDDDDDDDDDDDDDDD.......",
    "....D.DDDDDDDDDDDDDDDD.......",
    "BWWBBBWWBBBWWBBBWYYYYWWBBBWWB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBYYBBBBBBBBB",
    "NNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
    ".............................",
  ],
  layers: [
    ".............................",
    ".............................",
    "..................PPP........",
    "...............PPPPPPPPP.....",
    "..............BPPPPPPPPPP....",
    "............BBBBPPPPPPPPPP...",
    "..........BBBBBBBBPPPPPPPP...",
    "...........BBBBBBPPPPPPPPP...",
    "...........BBBBBBPPPPPPPPPP..",
    "...BBB.....BBBBBBPPPPPPPPPP..",
    "...BBB...BBBBBBBBBBPPPPPPPP..",
    "..BBBBB......PBPPPPPPPPPPP...",
    "..BBBBBB....BBBBPPPPPPPPPP...",
    "..BBBBBB.BBBBBBBBBBPPPPPPP...",
    "...BBBBBFBBBBBBBBBBFBPPPP....",
    "..BBBBBFFFBBBBBBBBFFFPPP.....",
    ".BBBBBBFFFBBBBBBBBFFF........",
    "BBBBBBBFFFBBBBBFFBFFF........",
    "BBBBBBBFFFBBBFBFFBFFF........",
    "BBBBBBBBBBBBBBBBBBB..........",
    "...BBB...BBBBBBBBBB..........",
    "...BBBBBBBBBBBBBBBBBBB.......",
    "...BBBBBBBBBBBBBBBBBBB.......",
    "....B.BBBBBBBBBBBBBBBB.......",
    "BBBBBBBBBBBBBBBBBFFFFBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBFFBBBBBBBBB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    ".............................",
  ],
  provenance: {
    creationDate: "2026-10-01",
    method: "29×29 逐格手绘构图；按四邻域收成一个主件，并用缩略图核对主题轮廓。",
    referenceBoundary: "只使用通用题材；未描摹或复制第三方图样、角色或标识。",
    authoringDisclosure: "逐格手绘构图。生成式图片未参与逐格描摹。",
    rightsReview: "家庭自用。",
    revision: "adv-r2",
    gridHash: "65b5bcd37a17068221bbdc1d7b54571ea080185fe7ec280ddc013a38adcba1bf",
    sourceHash: "6f82ba8b83135ed2e3cc20c96baf9b20cd20a2a23237d6dc40f0312b22b5045d",
  },
};

export const ADVANCED_PATTERNS: Pattern[] = [dragonCastle, rocketLaunch, tigerShark, robotGuard, retroGamepad, ninjaMoon];

export const isAdvancedPattern = (pattern: Pattern) => Boolean(pattern.advanced);
export const findPattern = (id: string) => PATTERNS.find(pattern => pattern.id === id) ?? ADVANCED_PATTERNS.find(pattern => pattern.id === id) ?? PATTERNS[0];
export const PLAYABLE_PATTERNS: Pattern[] = [...PATTERNS, ...ADVANCED_PATTERNS];


export const targetCount = (pattern: Pattern) => pattern.rows.join("").split("").filter(cell => cell !== ".").length;

export const connectedComponents = (pattern: Pattern) => {
  const remaining = new Set<string>();
  pattern.rows.forEach((row, y) => [...row].forEach((cell, x) => { if (cell !== ".") remaining.add(`${x},${y}`); }));
  const components: number[] = [];
  while (remaining.size) {
    const first = remaining.values().next().value as string;
    remaining.delete(first);
    const stack = [first];
    let size = 0;
    while (stack.length) {
      const [x, y] = stack.pop()!.split(",").map(Number);
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

/**
 * 自由画板专用色盘。它不属于任何图纸，孩子在空白 18×18 上用这些颜色自由创作。
 * "W" 保持白色语义：海报渲染会给白色豆加深色描边，防止在纸上看不见。
 */
export const FREE_PALETTE: Record<string, BeadColor> = {
  R: color("番茄红", "#e2574c"),
  O: color("暖阳橙", "#ef8b57"),
  Y: color("柠檬黄", "#f4c95f"),
  G: color("嫩草绿", "#7cb96d"),
  T: color("湖水青", "#5fc2c7"),
  B: color("晴空蓝", "#5b8fd6"),
  N: color("深海蓝", "#3f5f9e"),
  P: color("葡萄紫", "#8d6bc0"),
  K: color("樱花粉", "#f2a3c0"),
  D: color("可可棕", "#9c6b4a"),
  W: color("云朵白", "#fdf6ec"),
  X: color("墨夜黑", "#33304a"),
};

const validatePattern = (pattern: Pattern) => {
  if (pattern.advanced) {
    if (pattern.rows.length > 29 || pattern.rows.some(row => row.length > 29)) throw new Error(`进阶图纸尺寸超 29×29：${pattern.id}`);
    if (targetCount(pattern) > 500) throw new Error(`进阶图纸超过 500 颗：${pattern.id}`);
    const used = new Set(pattern.rows.join("").replaceAll(".", ""));
    const paletteKeys = Object.keys(pattern.palette);
    if ([...used].some(key => !pattern.palette[key]) || paletteKeys.some(key => !used.has(key))) throw new Error(`进阶图纸色表与网格不一致：${pattern.id}`);
    if (used.size < 4 || used.size > 10) throw new Error(`进阶图纸必要色超出 4–10 种：${pattern.id}`);
    if (pattern.layers.length && (pattern.layers.length !== pattern.rows.length || pattern.layers.some(row => row.length !== pattern.rows[0]?.length))) {
      throw new Error(`进阶图纸动画分层尺寸错误：${pattern.id}`);
    }
    if (pattern.layers.length && pattern.layers.join("").split("").some((layer, index) => (pattern.rows.join("")[index] === ".") !== (layer === ".") || !".BPF".includes(layer))) {
      throw new Error(`进阶图纸动画分层未覆盖图纸：${pattern.id}`);
    }
    return;
  }
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
};
PATTERNS.forEach(validatePattern);
ADVANCED_PATTERNS.forEach(validatePattern);
