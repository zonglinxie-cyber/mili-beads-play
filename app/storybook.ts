import { PATTERNS } from "./patterns";

export type StoryPage = {
  kicker: string;
  title: string;
  text: string;
  patternId: string;
};

export const STORYBOOK_TITLE = "星邮号出发了";
export const STORYBOOK_AUTHOR = "米粒拼豆社";

export const STORYBOOK_PAGES: StoryPage[] = [
  {
    kicker: "封面",
    title: "星邮号出发了",
    text: "有一封会发光的信，要从船舱送到星星城。路上的朋友，都可以用小豆子拼出来。",
    patternId: "scarf-sprint",
  },
  {
    kicker: "第一站",
    title: "围巾猫接到信",
    text: "追风围巾猫探出尖耳。蓝黄围巾一扬，信就轻轻落在船上。",
    patternId: "scarf-sprint",
  },
  {
    kicker: "第二站",
    title: "月兔认得地址",
    text: "月兔从弯月邮袋里探出头：这封信要送到鲸鱼背上的星星城。",
    patternId: "moon-rabbit",
  },
  {
    kicker: "第三站",
    title: "小熊载大家起飞",
    text: "热气球小熊把篮筐放低。大家坐进去，气球慢慢升上云层。",
    patternId: "balloon-bear",
  },
  {
    kicker: "第四站",
    title: "猫店长送来餐盒",
    text: "路上遇见餐盒小火车。猫店长一挥爪，今天的彩色餐盒就出发了。",
    patternId: "sushi-train",
  },
  {
    kicker: "第五站",
    title: "鲸鱼亮起星星城",
    text: "鲸鱼摆了摆尾巴。背上三座塔一扇扇亮起来，信安全送到了。",
    patternId: "whale-castle",
  },
  {
    kicker: "彩虹坡",
    title: "滑板鸭来接风",
    text: "半空中冲来一只滑板鸭。它踩着彩虹坡，把信稳稳送到下一站。",
    patternId: "skate-duck",
  },
  {
    kicker: "下一封信",
    title: "狐狸把鲸鱼放上天空",
    text: "信里还画着新朋友：小狐狸拉着鲸鱼风筝，风一吹，风筝就游上了天。",
    patternId: "fox-kite",
  },
  {
    kicker: "海底邮局",
    title: "水獭开潜艇去送信",
    text: "最后一站在海里。水獭探出圆窗，开着泡泡潜艇，去找会发光的海底邮局。",
    patternId: "otter-sub",
  },
  {
    kicker: "回到书桌",
    title: "把做好的摆出来",
    text: "信送到了。回家后，爱心相框可以立在桌上，中间空着放一张小照片。",
    patternId: "heart-frame",
  },
  {
    kicker: "书桌展览",
    title: "小猫、甜筒和奶茶",
    text: "蝴蝶结小猫、草莓甜筒和珍珠奶茶也想站成一排。拼完就能摆在书桌上。",
    patternId: "bow-cat",
  },
];

export const storybookPattern = (patternId: string) =>
  PATTERNS.find(pattern => pattern.id === patternId) ?? PATTERNS[0];
