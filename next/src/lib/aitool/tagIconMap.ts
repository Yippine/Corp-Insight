import {
  LucideIcon,
  HelpCircle,
  Sparkles,
  Search,
  PenSquare,
  Calculator,
  HeartPulse,
  Server,
  Briefcase,
  GraduationCap,
  Wrench,
  Lightbulb,
  Building,
  Microwave,
  Film,
  Music,
  AreaChart,
  PieChart,
  Target,
  Wallet,
  BookOpen,
  Users,
  BrainCircuit,
  Scale,
  MessageSquare,
  Network,
  Palette,
  ClipboardList,
  Flame,
  UserCheck,
  BriefcaseBusiness,
  Home,
  Package,
  Factory,
  Clapperboard,
  Star,
  Church,
  Zap,
} from 'lucide-react';

export const TAG_PRIORITY: string[] = [
  '金融',
  'SEO',
  '寫作',
  '製造',
  '電腦',
  '健康',
  '法律',
  '醫療',
  '商業',
  '企業',
  '管理',
  '專案',
  '投資',
  '市場',
  '行銷',
  '客戶',
  '評論',
  '社群',
  '學習',
  '教育',
  '學術',
  '語言',
  '求職',
  '面試',
  '科技',
  'AI',
  '數據',
  '設計',
  '思維',
  '哲學',
  '心理',
  '高效',
  '工作流',
  '工具',
  '提示詞',
  '越獄',
  '角色',
  '美食',
  '電影',
  '音樂',
  '人力',
  '創業',
  '圖表',
  '分析',
  '策略',
  '生活',
  '產品',
  '產業',
  '劇本',
  '網紅',
  '宗教',
  '自動化',
];

export const TAG_ICON_MAP: Record<string, LucideIcon> = {
  // 核心業務與金融
  金融: Wallet,
  投資: Calculator,
  商業: BriefcaseBusiness,
  企業: Building,
  管理: ClipboardList,
  專案: Wrench,
  市場: Search,
  行銷: Sparkles,
  分析: PieChart,
  圖表: AreaChart,
  策略: Target,
  創業: Flame,
  產品: Package,
  產業: Factory,

  // 內容與寫作
  SEO: Search,
  寫作: PenSquare,
  評論: MessageSquare,
  語言: BookOpen,
  劇本: Clapperboard,
  網紅: Star,

  // 技術與開發
  電腦: Server,
  科技: BrainCircuit,
  AI: BrainCircuit,
  數據: Network,
  工具: Wrench,
  製造: Wrench,
  工作流: Network,

  // 個人與專業發展
  學習: GraduationCap,
  教育: GraduationCap,
  學術: BookOpen,
  求職: Briefcase,
  面試: UserCheck,
  高效: Flame,
  自動化: Zap,

  // 生活與健康
  健康: HeartPulse,
  醫療: HeartPulse,
  美食: Microwave,
  電影: Film,
  音樂: Music,
  生活: Home,

  // 創意與設計
  設計: Palette,
  思維: BrainCircuit,
  哲學: BrainCircuit,
  心理: Users,

  // 其他
  客戶: Users,
  社群: Users,
  角色: Users,
  人力: Users,
  提示詞: Lightbulb,
  越獄: Flame,
  法律: Scale,
  宗教: Church,
};

export const DEFAULT_ICON = HelpCircle;

/**
 * [私有] 根據優先級系統，找出最能代表工具的單一標籤。
 * 此函式是決定工具圖示及其主色調的唯一真實來源。
 * @param tags - 工具的標籤陣列。
 * @returns 最高優先級的標籤字串，若無標籤則返回 null。
 */
function _findPrimaryTag(tags: string[]): string | null {
  if (!tags || tags.length === 0) {
    return null;
  }

  // 1. 從優先級列表中尋找第一個匹配的標籤。
  const priorityTag = TAG_PRIORITY.find(tag => tags.includes(tag));
  if (priorityTag) {
    return priorityTag;
  }

  // 2. 如果優先級列表中沒有，則尋找第一個有定義圖示的標籤。
  const firstTagWithIcon = tags.find(tag => TAG_ICON_MAP[tag]);
  if (firstTagWithIcon) {
    return firstTagWithIcon;
  }

  // 3. 作為最終的後備（主要用於顏色主題），返回第一個標籤。
  return tags[0];
}

/**
 * 根據工具的標籤陣列和預定義的優先級，獲取對應的圖示組件。
 * @param tags - 工具的標籤陣列 (e.g., ['寫作', '創意'])
 * @returns 對應的 LucideIcon 組件，或一個預設圖示。
 */
export function getIconForTool(tags: string[]): LucideIcon {
  const primaryTag = _findPrimaryTag(tags);

  if (primaryTag && TAG_ICON_MAP[primaryTag]) {
    return TAG_ICON_MAP[primaryTag];
  }

  return DEFAULT_ICON;
}

/**
 * 根據工具的標籤陣列，找出其最主要的標籤。
 * 邏輯與 getIconForTool 一致，但返回的是標籤字串。
 * @param tags - 工具的標籤陣列。
 * @returns - 最高優先級的標籤字串，或標籤列表中的第一個，如果都沒有則返回 null。
 */
export function getPrimaryTagForTool(tags: string[]): string | null {
  return _findPrimaryTag(tags);
}

/**
 * 根據預定義的優先級列表對標籤進行排序。
 * @param tags - 需要排序的標籤陣列。
 * @returns - 排序後的標籤陣列。
 */
export function sortTagsByPriority(tags: string[]): string[] {
  const priorityMap = new Map(TAG_PRIORITY.map((tag, index) => [tag, index]));
  return [...tags].sort((a, b) => {
    const priorityA = priorityMap.get(a) ?? Infinity;
    const priorityB = priorityMap.get(b) ?? Infinity;
    return priorityA - priorityB;
  });
}

/**
 * 根據單一標籤，獲取其對應的圖示組件。
 * @param tag - 單一標籤字串 (e.g., '寫作')
 * @returns 對應的 LucideIcon 組件，或一個預設圖示。
 */
export function getIconForTag(tag: string): LucideIcon {
  return TAG_ICON_MAP[tag] || DEFAULT_ICON;
}
