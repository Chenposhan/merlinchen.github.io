
export enum HeavenlyStem {
  Jia = '甲',
  Yi = '乙',
  Bing = '丙',
  Ding = '丁',
  Wu = '戊',
  Ji = '己',
  Geng = '庚',
  Xin = '辛',
  Ren = '壬',
  Gui = '癸'
}

export enum EarthlyBranch {
  Zi = '子',
  Chou = '丑',
  Yin = '寅',
  Mao = '卯',
  Chen = '辰',
  Si = '巳',
  Wu = '午',
  Wei = '未',
  Shen = '申',
  You = '酉',
  Xu = '戌',
  Hai = '亥'
}

export enum PalaceName {
  Life = '命宮',
  Siblings = '兄弟',
  Spouse = '夫妻',
  Children = '子女',
  Wealth = '財帛',
  Health = '疾厄',
  Travel = '遷移',
  Friends = '交友',
  Career = '官祿',
  Property = '田宅',
  Mental = '福德',
  Parents = '父母'
}

export enum MajorStar {
  ZiWei = '紫微',
  TianJi = '天機',
  TaiYang = '太陽',
  WuQu = '武曲',
  TianTong = '天同',
  LianZhen = '廉貞',
  TianFu = '天府',
  TaiYin = '太陰',
  TanLang = '貪狼',
  JuMen = '巨門',
  TianXiang = '天相',
  TianLiang = '天梁',
  QiSha = '七殺',
  PoJun = '破軍'
}

export interface Star {
  name: MajorStar | string;
  brightness?: string; // Miao, Wang, De, Xian, Bu
  isMajor: boolean;
  color?: string; // Helper for UI
  transformation?: '祿' | '權' | '科' | '忌'; // Si Hua
}

export interface PalaceData {
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  name: PalaceName | string; // Can be Life/Body
  stars: Star[];
  isLifePalace: boolean;
  isBodyPalace: boolean;
  gridIndex: number; // 0-11 for the UI mapping
  ageRange: string; // e.g., 6-15
}

export type Gender = 'M' | 'F';

export interface ChartData {
  palaces: PalaceData[];
  metadata: {
    gender: Gender;
    bureau: string; // e.g. Wood 3
    lunarDateStr: string; // Formatted string
    solarDateStr: string; // Formatted string
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    zodiac: string;
    lifeMaster: string;
    bodyMaster: string;
    yearStem: HeavenlyStem;
    yearBranch: EarthlyBranch;
  }
}

// --- Account System Types ---

export interface User {
  username: string;
  passwordHash: string;
}

export interface SavedChart {
  id: string;
  username: string;
  name: string;
  birthDate: string;
  birthTime: string;
  gender: Gender;
  createdAt: number;
}
