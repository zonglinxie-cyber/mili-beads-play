export type BeadColor = { name: string; color: string };

export type Pattern = {
  id: string;
  name: string;
  story: string;
  level: "轻松" | "进阶" | "挑战";
  category: string;
  minutes: number;
  motion: "launch" | "float" | "twist" | "sway" | "hop" | "drum" | "bounce" | "roll" | "glide";
  animation: string;
  motionPlan: { body: string; prop: string; fx: string };
  pieceLabel: string;
  pieceSizes: number[];
  palette: Record<string, BeadColor>;
  rows: string[];
  layers: string[];
};

export const P = {
  K: { name: "墨黑", color: "#29283b" }, W: { name: "奶油白", color: "#fff5df" },
  O: { name: "蜜橘", color: "#ee7b52" }, Y: { name: "星光黄", color: "#f5c95d" },
  P: { name: "樱花粉", color: "#ef91a7" }, R: { name: "莓果红", color: "#cf4e61" },
  B: { name: "湖水蓝", color: "#5daabe" }, N: { name: "深海蓝", color: "#355276" },
  G: { name: "叶子绿", color: "#6ba270" }, L: { name: "嫩芽绿", color: "#a8ca79" },
  C: { name: "可可棕", color: "#8a5d4a" }, T: { name: "焦糖", color: "#c58a5b" },
  V: { name: "葡萄紫", color: "#775f9c" }, S: { name: "浅紫", color: "#b7a0d2" },
};

const rows18 = (lines: string[]) => lines.map(line => {
  const row = line.replaceAll(" ", ".");
  if (row.length > 18) throw new Error(`图纸超过 18 格：${line}`);
  return row.padEnd(18, ".");
});

export const PATTERNS: Pattern[] = [
  { id:"rocket-cat", name:"火箭背包橘猫", story:"橘猫伸爪追星，背包尾焰拖出大弧线。", level:"进阶", category:"冒险", minutes:48, motion:"launch", animation:"橘猫伸爪向上飞；火箭背包和粗尾焰呼吸喷射；右上星星连续闪烁", motionPlan:{"body":"橘猫伸爪向上飞","prop":"火箭背包和粗尾焰呼吸喷射","fx":"右上星星连续闪烁"}, pieceLabel:"2件场景套装", pieceSizes:[166,4], palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,R:P.R,N:P.N}, layers:rows18(["...............F..","........B...B.FFF.",".......BBB.BBB....","......BBBBBBBBB...",".....BBBBBBBBBB...",".....BBBBBBBBBB...","..PPPPPPBBBBBBB...",".PPPPPPPBBBBBBB...",".PPPPPPPBBBBBBB...","PPPPPPPPBBBBBBBB..","PPPPPPPPBBBBBBBB..",".PPPPPPPBBBBBBB...",".PPPPPPPBBBBBB....","PPPPPP.PB..BB.....",".PPPPPPP..BB......","..PPPPP...........","...PPP............","....PP............"]), rows:rows18(["...............Y..","........K...K.YYY.",".......KOK.KOK....","......KOOOOOOOK...",".....KOWOOKWOOK...",".....KOOOWOOOOK...","..RRRKOOOOOOOOK...",".RNNRKOOOOOOKKK...",".RNNRROOOWOOOKK...","RRNNRROOOWWWOOOK..","RNNNRROOOWWWOOOK..",".RRRRRKOOOWOOOK...",".RYYRRKKOOOOKK....","RYYYYR.KK..KK.....",".RYYYRKK..KK......","..RYRRR...........","...RYR............","....RR............"]) },
  { id:"cloud-otter", name:"云朵冲浪水獭", story:"水獭一手撑伞，踩着云浪侧身滑行。", level:"挑战", category:"奇想", minutes:48, motion:"glide", animation:"水獭左右调整平衡；伞面跟随风向倾斜；脚下云浪分层起伏", motionPlan:{"body":"水獭左右调整平衡","prop":"伞面跟随风向倾斜","fx":"脚下云浪分层起伏"}, pieceLabel:"一体成品", pieceSizes:[170], palette:{K:P.K,W:P.W,C:P.C,T:P.T,B:P.B,N:P.N}, layers:rows18(["......PPPPP.......","....PPPPPPPPP.....","...PPPPPPPPPPP....","...PPPPPPPPPPP....",".......PPP........",".......PPP........","......BBBBB.......",".....BBBBBBB......","....BBBBBBBBB.....","....BBBBBBBBB.....","....BBBBBBBB......","..PPPPBBBBBBB.....",".PPPPPBBBBBB.PP...","PPPPPPBBBBBBBPPP..",".PPPPPB.BBBBBPPP..",".FFFFFFFFFFFFF....","FFFFFFFFFFFFFF....","..FFFFFFFF.F......"]), rows:rows18(["......NNNNN.......","....NNBBBBBNN.....","...NBBBBBBBBBN....","...NNNNNNNNNNN....",".......CCC........",".......CCC........","......CCCCC.......",".....CTTTTTC......","....CTTKTTKTC.....","....CTTTWTTTC.....","....CTTTTTTC......","..CCCCCTWWWTC.....",".CCTTCCWWWTC.CC...","CCTTTTCTTTTCTTCC..",".CCTTTT.TTTCCTTC..",".WWWWWWWWWWWWW....","WWWWBBBBBBWWWW....","..WBBBBBBB.W......"]) },
  { id:"star-dragon", name:"追星小青龙", story:"小青龙盘成S弯，伸爪去接掉落的星星。", level:"进阶", category:"国风", minutes:42, motion:"twist", animation:"青龙沿S形身体盘旋；龙角与鬃毛轻摆；星星落向伸出的前爪", motionPlan:{"body":"青龙沿S形身体盘旋","prop":"龙角与鬃毛轻摆","fx":"星星落向伸出的前爪"}, pieceLabel:"2件场景套装", pieceSizes:[128,5], palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,G:P.G,L:P.L}, layers:rows18(["...........PPPP...","..........PPP...F.","..........PPP..FFF",".......PBBBBBB..F.","......BBBBBBBBB...","......BBBBBBBBBB..",".....BBBBBBBPBB...","....BBBBBBBBBB....","...BBBBBBBBBB.....","..BBBB..BBBB......",".BBBB...BBB.......","BBB....BBBB.......","BBB...BBBBB.......","BBB..BBBBB........","BBBBBBBBB.........",".BBBBBBB..........","..BBBBB...........","...BBB............"]), rows:rows18(["...........OOOO...","..........OOO...Y.","..........OOO..YYY",".......OGGGGGG..Y.","......GGGKLGGGG...","......GLLLLGGGGG..",".....GGGWGGGOGG...","....GGGWWWGGGG....","...GGGGWWWGGG.....","..GGGG..WGGG......",".GGGG...WGG.......","GGG....WWGG.......","GGG...WWGGG.......","GGG..WWGGG........","GGGGWWGGG.........",".GGGGGGG..........","..GGGGG...........","...GGG............"]) },
  { id:"bottle-jelly", name:"瓶中发光水母", story:"摇一摇玻璃瓶，水母把海底星光点亮。", level:"进阶", category:"海洋", minutes:45, motion:"sway", animation:"瓶身轻轻晃动；水母伞盖呼吸发光、触手错拍摆动；两颗瓶中星光依次闪烁", motionPlan:{"body":"瓶身轻轻晃动","prop":"水母伞盖呼吸发光、触手错拍摆动","fx":"两颗瓶中星光依次闪烁"}, pieceLabel:"一体成品", pieceSizes:[170], palette:{N:P.N,W:P.W,B:P.B,V:P.V,P:P.P,Y:P.Y}, layers:rows18([".......BBBB.......","......BBBBBB......","......BBBBBB......",".....BBBBBBBB.....","....BBBBBBBBBB....","...BBBFBBBBFBBB...","...BBBPPPPPPBBB...","...BBBPPPPPPBBB...","...BBBPPPPPPBBB...","...BBBPPPPPPBBB...","...BBBBBPPBBBBB...","...BBBBPBBPBBBB...","...BBBPBPBPBBBB...","...BBBPBPBPBBBB...","....BBBPBPBBBB....",".....BBBBBBBB.....","......BBBBBB......",".......BBBB......."]), rows:rows18([".......NNNN.......","......NWWWWN......","......NNNNNN......",".....NBBBBBBN.....","....NBBBBBBBBN....","...NBBYBBBBYBBN...","...NBBVVVVVVBBN...","...NBBVPPPPVBBN...","...NBBVPNNPVBBN...","...NBBVVPPVVBBN...","...NBBBBPPBBBBN...","...NBBBPBBPBBBN...","...NBBPBPBPBBBN...","...NBBPBPBPBBBN...","....NBBPBPBBBN....",".....NBBBBBBN.....","......NNNNNN......",".......NNNN......."]) },
  { id:"frog-post", name:"青蛙邮差跳水坑", story:"青蛙抱紧邮包腾空，两封信在手边展开。", level:"进阶", category:"冒险", minutes:45, motion:"hop", animation:"青蛙收腿跃过水面；邮包和两封信错拍晃动；左右水花同时飞溅", motionPlan:{"body":"青蛙收腿跃过水面","prop":"邮包和两封信错拍晃动","fx":"左右水花同时飞溅"}, pieceLabel:"3件场景套装", pieceSizes:[142,4,4], palette:{K:P.K,W:P.W,G:P.G,L:P.L,B:P.B,N:P.N}, layers:rows18([".......PPPP.......","......PPPPPP......",".....BBBBBBBB.....","....BBBBBBBBBB....","....BBBBBBBBBB....",".....BBBBBBBB.....","...PBBBBBBBBBBP...","..PPPBBPPBBBPPP...","..PPPBBPPPPBBPPP..","....BBPPPPBB......",".....BPPPPBB......","....BBBBBBBB......","..BBBBB..BBBBB....",".BBBBB....BBBBB...",".BBBB......BBBB...",".BBB........BBB...",".....F....F.......","....FFF..FFF......"]), rows:rows18([".......NNNN.......","......NNNNNN......",".....GGGGGGGG.....","....GWKGKGWGGG....","....GGGGGGGGGG....",".....GLLWLLGG.....","...WWGGGGGGGGWW...","..WNNGGNNGGGNNW...","..WNNGGNNNNGGNNW..","....GGNNNNGG......",".....GNNNNGG......","....GGGLLGGG......","..GGGLL..LLGGG....",".GGGLL....LLGGG...",".GGGG......GGGG...",".GGG........GGG...",".....B....B.......","....BBB..BBB......"]) },
  { id:"lion-poles", name:"醒狮飞越梅花桩", story:"锣鼓一响，小醒狮腾空咬住最高的红包。", level:"挑战", category:"国风", minutes:50, motion:"drum", animation:"醒狮眨眼、昂头、四肢收放；三根梅花桩依次亮起；无独立特效散件，避免小零件", motionPlan:{"body":"醒狮眨眼、昂头、四肢收放","prop":"三根梅花桩依次亮起","fx":"无独立特效散件，避免小零件"}, pieceLabel:"4件场景套装", pieceSizes:[130,8,8,8], palette:{K:P.K,W:P.W,Y:P.Y,O:P.O,R:P.R,G:P.G}, layers:rows18(["......BBBB........","....BBBBBBBB......","...BBBBBBBBBB.....","..BBBBBBBBBBBB....","..BBBBBBBBBBBB....","...BBBBBBBBBB.....","....BBBBBBBB......",".....BBBBBB.......","...BBBBBBBBBB.....","..BBBBBBBBBBBB....",".BBBBBBBBBBBBBB...",".BBBBB....BBBBB...","..BBBB....BBBB....","...BBB....BBB.....","PPP....PPP....PPP.","PPP....PPP....PPP.",".P......P......P..",".P......P......P.."]), rows:rows18(["......RRRR........","....RRYYYYRR......","...RRWWYYWWRR.....","..RWWKWWWWKWWR....","..RWWWWOOWWWWR....","...RRYWWWWYRR.....","....YYRRRRYY......",".....OOOOOO.......","...OOOOWWOOOO.....","..ROOOKOOKOOOR....",".RROOOOOOOOOORR...",".RRROO....OORRR...","..RROO....OORR....","...RRR....RRR.....","YYY....YYY....YYY.","GGG....GGG....GGG.",".G......G......G..",".G......G......G.."]) },
  { id:"moon-rabbit", name:"月兔投递星星", story:"月兔坐在弯月邮袋里，把一颗星星抛向夜空。", level:"挑战", category:"童话", minutes:50, motion:"bounce", animation:"月兔在邮袋里轻跳；弯月邮袋左右摇晃；星星沿弧线升向夜空", motionPlan:{"body":"月兔在邮袋里轻跳","prop":"弯月邮袋左右摇晃","fx":"星星沿弧线升向夜空"}, pieceLabel:"2件场景套装", pieceSizes:[163,5], palette:{K:P.K,W:P.W,P:P.P,Y:P.Y,B:P.B,N:P.N}, layers:rows18([".....BB....BB.....","....BBBB..BBBB....","....BBBB..BBBB....","....BBBBBBBBBB....",".....BBBBBBBB.....","....BBBBBBBBBB....","....BBBBBBBBBB....",".....BBBBBBBB...F.","......BBBBBB...FFF","...PPPPBBBBBB...F.","..PPPPPBBBBBB.....","..PPPPPBBBBPPB....","..PPPPBBBBBPPB....","..PPPPBBBBBBPPB...","...PPPBBBBBBPPB...","....PPPPPPPPPPB...",".....PPPPPPBB.....",".......PP........."]), rows:rows18([".....NN....NN.....","....NWWN..NWWN....","....NWPW..NWPW....","....NWWWNNWWWN....",".....NWWWWWWN.....","....NWWKWWKWWN....","....NWWWPWWWWN....",".....NWWWWWWN...Y.","......NNWWNN...YYY","...YYYYNNWWNN...Y.","..YYYYYNWWNNN.....","..YYYYYNWWNBBN....","..YYYYNNWWNBBN....","..YYYYNNWWNNBBN...","...YYYNNWWNNBBN...","....YYYYYYYYBBN...",".....YYYYYYNN.....",".......YY........."]) },
  { id:"sushi-train", name:"寿司列车猫店长", story:"猫店长一挥爪，今日特供就沿着小铁轨出发。", level:"挑战", category:"美食", minutes:48, motion:"roll", animation:"猫店长挥爪，列车车轮循环滚动；两盘寿司轻轻弹跳；无独立特效散件，整车一体更耐用", motionPlan:{"body":"猫店长挥爪，列车车轮循环滚动","prop":"两盘寿司轻轻弹跳","fx":"无独立特效散件，整车一体更耐用"}, pieceLabel:"一体成品", pieceSizes:[165], palette:{K:P.K,W:P.W,O:P.O,R:P.R,G:P.G,N:P.N}, layers:rows18(["...B......B.......","..BBB....BBB......","..BBBBBBBBBB......","..BBBBBBBBBB......","..BBBBBBBBBB......","..BBBBBBBBBB......","...BBBBBBBB.......","....BBBBBB........","..BBBBBBBBBBBBBB..","..BBBBBB.PPPPPPB..",".BBBBBB.PPPPPPPB..",".BBBBBB.PPPPPPPB..","..BBBBBBBBBBBBBB..","...BBBBBBBBBBBB...","...BBB......BBB...","..BBBBB....BBBBB..","...BBB......BBB...",".................."]), rows:rows18(["...K......K.......","..KOK....KOK......","..KOWKKKKWOK......","..KOWWWWWWOK......","..KWKWWWWKWK......","..KWWOOWWWWK......","...KWWWWWWK.......","....KKWWKK........","..NNNNNNNNNNNNNN..","..NNWWNN.WRRWGGN..",".NNWONN.WRRWGGGN..",".NNNNNN.WWWWGGGN..","..NNNNNNNNNNNNNN..","...NNNNNNNNNNNN...","...KKK......KKK...","..KNNNK....KNNNK..","...KKK......KKK...",".................."]) },
  { id:"icecream-rocket", name:"冰淇淋火箭起飞", story:"草莓味燃料装满，下一站是甜甜星。", level:"进阶", category:"奇想", minutes:38, motion:"launch", animation:"冰淇淋火箭左右校准后上升；蓝色舷窗闪出表情；粗尾焰伸缩，右上甜甜星闪烁", motionPlan:{"body":"冰淇淋火箭左右校准后上升","prop":"蓝色舷窗闪出表情","fx":"粗尾焰伸缩，右上甜甜星闪烁"}, pieceLabel:"2件场景套装", pieceSizes:[115,5], palette:{W:P.W,P:P.P,R:P.R,B:P.B,Y:P.Y,C:P.C}, layers:rows18(["..............F...",".............FFF..",".....BBBBBB...F...",".....BBBBBB.......","....BBBBBBBB......","....BBBBBBBB......",".....BBBBBB.......",".....BBBBBB.......",".....BBBBBBB......","...BBBBPPPBBBB....","..BBBBBPPPBBBBB...","..BBBBBBBBBBBBB...","...BB.BBBBB.BB....","......BBBBB.......",".......FFF........","......FFFF........",".....FFFFFF.......","......FFFF........"]), rows:rows18(["..............Y...",".............YYY..",".....WWWWWW...Y...",".....WPPPPW.......","....WPPPPPPW......","....WPRPPRPW......",".....WPPPPW.......",".....WWWWWW.......",".....CCCCCCC......","...RRCCBBBCCRR....","..RRRCCBYBCCRRR...","..RRRCCCCCCCRRR...","...RR.CCCCC.RR....","......CCCCC.......",".......YYY........","......YRRY........",".....YRRRRY.......","......RRRR........"]) },
  { id:"rainbow-duck", name:"滑板鸭飞越彩虹", story:"压低身体，鸭鸭从彩虹坡顶起跳。", level:"轻松", category:"运动", minutes:32, motion:"glide", animation:"鸭子压低、伸翅、抬头；滑板翻半圈，彩虹坡依次亮色；无小散件，以轮子转动表现速度", motionPlan:{"body":"鸭子压低、伸翅、抬头","prop":"滑板翻半圈，彩虹坡依次亮色","fx":"无小散件，以轮子转动表现速度"}, pieceLabel:"2件场景套装", pieceSizes:[84,43], palette:{K:P.K,Y:P.Y,O:P.O,B:P.B,R:P.R,G:P.G}, layers:rows18(["......BBB.........","....BBBBBB........","...BBBBBBB........","..BBBBBBBBB.......","...BBBBBBBB.......","....BBBBBB........","...BBBBBBBB.......","....BBBBB.........",".....BB.BB........","..PPPPPPPPPPP.....","..PPPPPPPPPPP.....","...PPP...PPP......","..................","..........PPPPP...","........PPPPPP....","......PPPPPPPP....","...PPPPPPPPPPP....","PPPPPPPPPPPPP....."]), rows:rows18(["......BBB.........","....BBYYYY........","...BYYKYYY........","..BYYYYYOYY.......","...YYYOOOYY.......","....YYYYYY........","...BBYYYYBB.......","....YYYYY.........",".....YY.YY........","..GGGGGGGGGGG.....","..GGGGGGGGGGG.....","...KKK...KKK......","..................","..........RRRRR...","........RROOOO....","......RROOYYYY....","...RROOYYGGGGG....","RROOYYGGBBBBB....."]) },
  { id:"whale-castle", name:"鲸鱼驮着星星城", story:"鲸鱼一喷水，背上的星星城就亮起一层。", level:"挑战", category:"奇想", minutes:52, motion:"float", animation:"鲸鱼尾鳍摆动、白肚皮上下呼吸；三座塔的黄窗从左到右点亮；右上水花展开再落回", motionPlan:{"body":"鲸鱼尾鳍摆动、白肚皮上下呼吸","prop":"三座塔的黄窗从左到右点亮","fx":"右上水花展开再落回"}, pieceLabel:"2件场景套装", pieceSizes:[164,6], palette:{K:P.K,W:P.W,Y:P.Y,B:P.B,N:P.N,V:P.V}, layers:rows18(["....P...P...P.....","...PPP.PPP.PPP....","...PPP.PPP.PPP....","...PPPPPPPPPPP....","....PPPPPPPPP.....","....PPPPPPPPP.....",".....PPPPPPP...FFF","......PPPPP...FFF.","..BBBBBBBBBBB.....",".BBBBBBBBBBBBBBBB.",".BBBBBBBBBBBBBBBB.",".BBBBBBBBBBBBBBB..","...BBBBBBBBBBBBBBB","....BBBBBBBBBBBBB.",".....BBBBBBBBBB...",".......BBBBBB.....","..................",".................."]), rows:rows18(["....V...V...V.....","...VVV.VVV.VVV....","...VYV.VYV.VYV....","...VVVVVVVVVVV....","....VVYVVYVVV.....","....VVVVVVVVV.....",".....NNNNNNN...BBB","......NNNNN...BBB.","..NNNBBBBBBBN.....",".NNBBBBBBBBBBBBBN.",".NBBBBBBBBBBBBBBN.",".NNBBBBBBBBBBKBN..","...NBBBBBWWBBBBBBN","....NBBBWWWWBBBBN.",".....NNWWWWBBNN...",".......NNNNNN.....","..................",".................."]) },
  { id:"lantern-fox", name:"三尾狐提灯夜游", story:"三尾狐跃过月色，前爪提着一盏发光灯笼。", level:"挑战", category:"国风", minutes:52, motion:"sway", animation:"三尾狐轻盈跃起；前爪灯笼来回摆动；灯光由暗到明呼吸", motionPlan:{"body":"三尾狐轻盈跃起","prop":"前爪灯笼来回摆动","fx":"灯光由暗到明呼吸"}, pieceLabel:"一体成品", pieceSizes:[170], palette:{K:P.K,W:P.W,O:P.O,Y:P.Y,R:P.R}, layers:rows18([".....B.....B......","....BBB...BBB.....","...BBBBBBBBBBB....","...BBBBBBBBBBBB...","...BBBBBBBBBBBB...","....BBBBBBBBB.....",".....BBBBBBB......","....PPBBBBBBBB....","...PPPBBBBBBBB....","..PPPPBBBBBBBB....","..PFFPBBBBBBBB....",".PFFFPBBBBBBBB....","PFFFFPBBBBBBBB....",".PFFFPBBBBBBBB....","..PPPPBBBBBBBB....","...PP..BBBBBBBB...",".......BB.BB......",".................."]), rows:rows18([".....K.....K......","....KOK...KOK.....","...KOOOOOOOOOK....","...KOWKOOOKWOOK...","...KOOOOOWOOOOK...","....KOOOOOOOK.....",".....KOOOOOK......","....RKOOOOKROO....","...RROOOOOROWW....","..RROOWOOOROOW....","..RYYROOOOROOO....",".KYYYROOOOROWW....","KYYYYROOOOROOW....",".KYYYROOOOROOO....","..RRRROOOOROWW....","...RR..KOOOKROW...",".......KK.KK......",".................."]) },
];

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

PATTERNS.forEach(pattern => {
  if (pattern.rows.length !== 18 || pattern.rows.some(row => row.length !== 18)) throw new Error(`图纸尺寸错误：${pattern.id}`);
  const allowed = new Set([".", ...Object.keys(pattern.palette)]);
  if (pattern.rows.some(row => [...row].some(cell => !allowed.has(cell)))) throw new Error(`图纸含未知色号：${pattern.id}`);
  if (targetCount(pattern) < 90 || targetCount(pattern) > 180) throw new Error(`图纸颗数超出儿童友好范围：${pattern.id}`);
  if (pattern.layers.length) {
    const used = new Set(pattern.rows.join("").replaceAll(".", ""));
    if ([...used].some(color => !pattern.palette[color]) || Object.keys(pattern.palette).some(color => !used.has(color))) throw new Error(`图纸色表与实际用色不一致：${pattern.id}`);
    if (pattern.layers.length !== 18 || pattern.layers.some(row => row.length !== 18)) throw new Error(`动画分层尺寸错误：${pattern.id}`);
    if (pattern.layers.join("").split("").some((layer, index) => (pattern.rows.join("")[index] === ".") !== (layer === ".") || !".BPF".includes(layer))) throw new Error(`动画分层未完整覆盖图纸：${pattern.id}`);
    const components = connectedComponents(pattern);
    if (components.some(size => size < 4)) throw new Error(`图纸含无法实物成型的小散件：${pattern.id}`);
    if (pattern.pieceSizes.join(",") !== components.join(",")) throw new Error(`图纸散件声明与实物结构不一致：${pattern.id}`);
  }
});
