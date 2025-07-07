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

  // 內容與寫作
  SEO: Search,
  寫作: PenSquare,
  評論: MessageSquare,
  語言: BookOpen,

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

  // 生活與健康
  健康: HeartPulse,
  醫療: HeartPulse,
  美食: Microwave,
  電影: Film,
  音樂: Music,

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
};

export const DEFAULT_ICON = HelpCircle;

/**
 * 根據工具的標籤陣列和預定義的優先級，獲取對應的圖示組件。
 * @param tags - 工具的標籤陣列 (e.g., ['寫作', '創意'])
 * @returns 對應的 LucideIcon 組件，或一個預設圖示。
 */
export function getIconForTool(tags: string[]): LucideIcon {
  if (!tags || tags.length === 0) {
    return DEFAULT_ICON;
  }

  // 1. 根據 TAG_PRIORITY 找到第一個匹配的標籤
  const priorityTag = TAG_PRIORITY.find(priorityTag => tags.includes(priorityTag));
  if (priorityTag && TAG_ICON_MAP[priorityTag]) {
    return TAG_ICON_MAP[priorityTag];
  }

  // 2. 如果優先級列表中沒有，則從工具自身標籤中尋找第一個可用的圖示
  for (const tag of tags) {
    if (TAG_ICON_MAP[tag]) {
      return TAG_ICON_MAP[tag];
    }
  }

  // 3. 如果都找不到，回傳預設圖示
  return DEFAULT_ICON;
}

/**
 * 根據單一標籤，獲取其對應的圖示組件。
 * @param tag - 單一標籤字串 (e.g., '寫作')
 * @returns 對應的 LucideIcon 組件，或一個預設圖示。
 */
export function getIconForTag(tag: string): LucideIcon {
  return TAG_ICON_MAP[tag] || DEFAULT_ICON;
}