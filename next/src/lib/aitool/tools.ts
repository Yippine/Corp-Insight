import { Type, FileText, Search, MessageSquare, Star, Zap, Stethoscope, Server, Cpu, Network, HardDrive, Scale, Calculator, ScanLine, Package, Factory, Landmark, PiggyBank, TrendingUp, Repeat, CircleDollarSign, LucideIcon, FileCode2, Image, Pen, Brain, Briefcase, GraduationCap, Languages, HeartPulse, Lightbulb, Globe, Monitor, Heart, Trello, BarChart3, Users, PieChart, DollarSign, Activity, Compass, BookOpen, Laugh, Clapperboard, BookText, Feather, Mic2, MonitorSmartphone, Utensils, MessageSquareText, Newspaper, Trophy, PenTool, ClipboardCheck, Share2, Target, Boxes, HandshakeIcon, FileEdit, Glasses } from 'lucide-react';
import { AIToolModel, AIToolDocument } from '@/lib/database/models/AITool';

export const iconMap: Record<string, LucideIcon> = {
  Type,
  FileText,
  Search,
  MessageSquare,
  Star,
  Zap,
  Stethoscope,
  Server,
  Cpu,
  Network,
  HardDrive,
  Scale,
  Calculator,
  ScanLine,
  Package,
  Factory,
  Landmark,
  PiggyBank,
  TrendingUp,
  Repeat,
  CircleDollarSign,
  FileCode2: FileCode2 || Zap,
  Image: Image || Zap,
  Pen: Pen || Zap,
  Brain: Brain || Zap,
  Briefcase: Briefcase || Zap,
  GraduationCap: GraduationCap || Zap,
  Languages: Languages || Zap,
  HeartPulse: HeartPulse || Zap,
  Lightbulb: Lightbulb || Zap,
  Globe: Globe || Zap,
  Monitor: Monitor || Zap,
  Heart: Heart || Zap,
  Trello: Trello || Zap,
  BarChart3: BarChart3 || Zap,
  Users: Users || Zap,
  PieChart: PieChart || Zap,
  DollarSign: DollarSign || Zap,
  Activity: Activity || Zap,
  Compass: Compass || Zap,
  BookOpen: BookOpen || Zap,
  Laugh: Laugh || Zap,
  Clapperboard: Clapperboard || Zap,
  BookText: BookText || Zap,
  Feather: Feather || Zap,
  Mic2: Mic2 || Zap,
  MonitorSmartphone: MonitorSmartphone || Zap,
  Utensils: Utensils || Zap,
  MessageSquareText: MessageSquareText || Zap,
  Newspaper: Newspaper || Zap,
  Trophy: Trophy || Zap,
  PenTool: PenTool || Zap,
  ClipboardCheck: ClipboardCheck || Zap,
  Share2: Share2 || Zap,
  Target: Target || Zap,
  Boxes: Boxes || Zap,
  HandshakeIcon: HandshakeIcon || Zap,
  FileEdit: FileEdit || Zap,
  Glasses: Glasses || Zap,
};

// 工具接口定義
export interface Tools {
  id: string;
  name: string;
  description: string;
  iconName: keyof typeof iconMap;
  componentId?: string;
  tags: string[];
  category?: string;
  subCategory?: string;
  instructions?: {
    what: string;
    why: string;
    how: string;
  };
  placeholder?: string;
  promptTemplate?: {
    prefix: string;
    suffix: string;
  };
}

// 顏色主題接口
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  icon: string;
  hover: string;
  shadow: string;
  name: string;
  gradient: {
    from: string;
    to: string;
  };
}

// 標籤統計接口
interface TagStatistics {
  tag: string;
  count: number;
}

export interface TagStats {
  allTags: TagStatistics[];
  mergedTags: TagStatistics[];
}

export interface TagThemes {
  merged: Record<string, ColorTheme>;
  full: Record<string, ColorTheme>;
}

// 默認的顏色配色方案
const colorPalettes = [
  {
    primary: 'bg-indigo-500 bg-opacity-85',
    secondary: 'bg-indigo-50',
    accent: 'bg-indigo-100',
    text: 'text-indigo-600 bg-opacity-85',
    icon: 'text-indigo-600 bg-opacity-85',
    hover: 'hover:bg-indigo-50',
    shadow: 'shadow-indigo-300/20',
    gradient: {
      from: 'from-indigo-300 bg-opacity-85',
      to: 'to-indigo-400'
    }
  },
  {
    primary: 'bg-purple-500 bg-opacity-90',
    secondary: 'bg-purple-50',
    accent: 'bg-fuchsia-100',
    text: 'text-purple-500 bg-opacity-90',
    icon: 'text-purple-500 bg-opacity-90',
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-500/10',
    gradient: {
      from: 'from-purple-500 bg-opacity-90',
      to: 'to-fuchsia-500'
    }
  },
  {
    primary: 'bg-pink-500 bg-opacity-85',
    secondary: 'bg-pink-50',
    accent: 'bg-rose-100',
    text: 'text-pink-500 bg-opacity-85',
    icon: 'text-pink-500 bg-opacity-85',
    hover: 'hover:bg-pink-50',
    shadow: 'shadow-pink-500/10',
    gradient: {
      from: 'from-pink-500 bg-opacity-85',
      to: 'to-rose-500'
    }
  },
  {
    primary: 'bg-rose-400 bg-opacity-85',
    secondary: 'bg-rose-50',
    accent: 'bg-rose-50',
    text: 'text-rose-400 bg-opacity-85',
    icon: 'text-rose-400 bg-opacity-85',
    hover: 'hover:bg-rose-50',
    shadow: 'shadow-rose-400/20',
    gradient: {
      from: 'from-rose-400 bg-opacity-85',
      to: 'to-rose-300'
    }
  },
  {
    primary: 'bg-amber-500 bg-opacity-75',
    secondary: 'bg-amber-50',
    accent: 'bg-yellow-100',
    text: 'text-amber-500 bg-opacity-85',
    icon: 'text-amber-500 bg-opacity-85',
    hover: 'hover:bg-amber-50',
    shadow: 'shadow-amber-500/10',
    gradient: {
      from: 'from-amber-500 bg-opacity-85',
      to: 'to-yellow-500'
    }
  },
  {
    primary: 'bg-emerald-500 bg-opacity-85',
    secondary: 'bg-emerald-50',
    accent: 'bg-green-100',
    text: 'text-emerald-500 bg-opacity-85',
    icon: 'text-emerald-500 bg-opacity-85',
    hover: 'hover:bg-emerald-50',
    shadow: 'shadow-emerald-500/10',
    gradient: {
      from: 'from-emerald-500 bg-opacity-85',
      to: 'to-green-500'
    }
  },
  {
    primary: 'bg-sky-400 bg-opacity-85',
    secondary: 'bg-sky-50',
    accent: 'bg-sky-100',
    text: 'text-sky-600 bg-opacity-85',
    icon: 'text-sky-600 bg-opacity-85',
    hover: 'hover:bg-sky-50',
    shadow: 'shadow-sky-400/20',
    gradient: {
      from: 'from-sky-400 bg-opacity-85',
      to: 'to-sky-500'
    }
  }
];

// 基本工具數據
const baseTools: Tools[] = [
  {
    id: 'title-generator',
    name: 'SEO 標題策略大師',
    description: '智能生成 SEO 友好的標題，提高點擊率和搜尋排名',
    iconName: 'Type',
    componentId: 'TitleGenerator',
    tags: ['工具', 'SEO']
  },
  {
    id: 'description-generator',
    name: 'SEO 描述智能專家',
    description: '生成優化的 META 描述，提升搜尋結果的點擊率',
    iconName: 'FileText',
    componentId: 'DescriptionGenerator',
    tags: ['工具', 'SEO']
  },
  {
    id: 'keyword-generator',
    name: 'SEO 關鍵詞戰略家',
    description: '發掘高價值長尾關鍵字，降低競爭難度',
    iconName: 'Search',
    componentId: 'KeywordGenerator',
    tags: ['工具', 'SEO']
  },
  {
    id: 'faq-generator',
    name: 'FAQ 智能構建師',
    description: '智能生成常見問題，豐富網站內容',
    iconName: 'MessageSquare',
    componentId: 'FaqGenerator',
    tags: ['工具', 'SEO']
  },
  {
    id: 'review-generator',
    name: 'SEO 社群評價專家',
    description: '生成真實感產品評價，增加社交證明',
    iconName: 'Star',
    componentId: 'ReviewGenerator',
    tags: ['工具', 'SEO']
  },
  {
    id: 'feature-generator',
    name: '產品價值放大器',
    description: '客製化產品功能描述，提高銷售吸引力',
    iconName: 'Zap',
    componentId: 'FeatureGenerator',
    tags: ['工具', 'SEO']
  },
  {
    id: 'tcm-check',
    name: '中醫體質智能檢測',
    description: '根據問卷分析您的體質類型，提供個性化養生建議',
    iconName: 'Stethoscope',
    componentId: 'TCMCheck',
    tags: ['AI', '健康']
  },
  // Finance Tools
  {
    id: 'roi-calculator',
    name: 'ROI 計算機',
    description: '計算投資回報率，評估投資效益',
    iconName: 'TrendingUp',
    componentId: 'ROICalculator',
    tags: ['工具', '金融']
  },
  {
    id: 'deposit-calculator',
    name: '定存計算機',
    description: '計算定期存款的本利和與總利息',
    iconName: 'PiggyBank',
    componentId: 'DepositCalculator',
    tags: ['工具', '金融']
  },
  {
    id: 'loan-calculator',
    name: '貸款計算機',
    description: '計算貸款的每月還款額、總支付金額與總利息',
    iconName: 'Landmark',
    componentId: 'LoanCalculator',
    tags: ['工具', '金融']
  },
  {
    id: 'currency-converter',
    name: '匯率轉換器',
    description: '實時轉換全球多種貨幣',
    iconName: 'Repeat',
    componentId: 'CurrencyConverter',
    tags: ['工具', '金融']
  },
  {
    id: 'compound-interest-calculator',
    name: '複利計算機',
    description: '計算複利效應下的未來價值與總利息',
    iconName: 'CircleDollarSign',
    componentId: 'CompoundInterestCalculator',
    tags: ['工具', '金融']
  },
  // Manufacturing Tools
  {
    id: 'packaging-calculator',
    name: '包裝成本計算機',
    description: '估算產品包裝的材料和運輸成本',
    iconName: 'Package',
    componentId: 'PackagingCalculator',
    tags: ['工具', '製造']
  },
  {
    id: 'yield-calculator',
    name: '生產良率計算機',
    description: '計算生產過程中的良品率與不良品率',
    iconName: 'ScanLine',
    componentId: 'YieldCalculator',
    tags: ['工具', '製造']
  },
  {
    id: 'oee-calculator',
    name: 'OEE 設備綜合效率計算器',
    description: '評估製造設備的整體有效性',
    iconName: 'Factory',
    componentId: 'OEECalculator',
    tags: ['工具', '製造']
  },
  {
    id: 'metal-weight-calculator',
    name: '金屬材料重量計算器',
    description: '計算各種金屬材料的重量及預估成本',
    iconName: 'Scale',
    componentId: 'MetalWeightCalculator',
    tags: ['工具', '製造']
  },
  {
    id: 'manufacturing-calculator',
    name: '工具機加工參數計算器',
    description: '計算銑削/車削速度、進給率，提供最佳加工參數建議',
    iconName: 'Calculator',
    componentId: 'ManufacturingCalculator',
    tags: ['工具', '製造']
  },
  // Computer Tools
  {
    id: 'server-spec-calculator',
    name: '伺服器規格計算器',
    description: '評估應用所需的伺服器資源配置',
    iconName: 'Server',
    componentId: 'ServerSpecCalculator',
    tags: ['工具', '電腦']
  },
  {
    id: 'workload-scalability-calculator',
    name: 'AI 工作負載規模化評估',
    description: '評估 AI 系統的可擴展性和資源效率',
    iconName: 'Network',
    componentId: 'WorkloadScalabilityCalculator',
    tags: ['工具', '電腦']
  },
  {
    id: 'model-performance-calculator',
    name: '模型效能預測工具',
    description: '預測 AI 模型的資源消耗和性能表現',
    iconName: 'Cpu',
    componentId: 'ModelPerformanceCalculator',
    tags: ['工具', '電腦']
  },
  {
    id: 'ai-infrastructure-cost-calculator',
    name: 'AI 基礎設施成本估算器',
    description: '評估 AI 專案的硬體、運營和軟體成本',
    iconName: 'HardDrive',
    componentId: 'AIInfrastructureCostCalculator',
    tags: ['工具', '電腦']
  },
  {
    id: 'gpu-memory-calculator',
    name: 'GPU 內存計算器',
    description: '計算 AI 模型運行所需的 GPU 內存',
    iconName: 'Zap',
    componentId: 'GPUMemoryCalculator',
    tags: ['工具', '電腦']
  },
];

// 將 MongoDB 工具文檔轉換為 Tools 格式
function convertAIToolDocumentToTools(aiTools: AIToolDocument[]): Tools[] {
  return aiTools.map((tool) => {
    let iconNameString: string = tool.icon || 'Zap';

    // 確保 icon 名稱在 iconMap 中存在
    if (!iconMap[iconNameString]) {
      iconNameString = 'Zap';
    }

    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      iconName: iconNameString as keyof typeof iconMap,
      componentId: 'PromptToolTemplate',
      tags: tool.tags || ['AI'],
      category: tool.category || 'AI 工具',
      subCategory: tool.subCategory,
      instructions: tool.instructions,
      placeholder: tool.placeholder,
      promptTemplate: tool.promptTemplate,
    };
  });
}

// 統計工具標籤的分佈情況
export function getTagStatistics(tools: Tools[]): TagStats {
  // 建立標籤計數映射
  const tagCountMap = new Map<string, number>();

  // 統計每個標籤出現次數
  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
    });
  });

  // 計算單一標籤工具數量，並確保程式碼的健壯性和可維護性
  const singleTagTools = tools.reduce((count, tool) => {
    // 如果工具已經有 AI 標籤，直接返回當前計數
    if (tool.tags.includes('AI')) return count;

    // 過濾出非 AI 的標籤
    const nonAiTags = tool.tags.filter(tag => tag !== 'AI');

    // 檢查是否為唯一標籤的工具
    const isSingleTagTool = nonAiTags.every(tag => (tagCountMap.get(tag) || 0) === 1);
    
    // 如果是唯一標籤工具，添加 AI 標籤並增加計數
    if (isSingleTagTool) {
      tool.tags.push('AI');
      return count + 1;
    }
    
    return count;
  }, 0);

  // 更新 AI 標籤計數
  const aiCount = (tagCountMap.get('AI') || 0) + singleTagTools;
  if (aiCount > 0) {
    tagCountMap.set('AI', aiCount);
  }

  // 依照計數和標籤名稱排序
  const sortedTags = Array.from(tagCountMap.entries())
    .sort((a, b) => {
      const [tagA, countA] = a;
      const [tagB, countB] = b;
      return countB - countA || tagA.localeCompare(tagB);
    });

  // 過濾計數為 1 的標籤並合併AI和ai標籤
  let mergedTags = sortedTags.filter(([tag, count]) => 
    count > 1 || tag.toLowerCase() === 'AI' || tag === 'SEO'
  );
  
  // 確保'全部'標籤總是排在最前
  mergedTags = [['全部', tools.length], ...mergedTags];

  return {
    allTags: sortedTags.map(([tag, count]) => ({ tag, count })),
    mergedTags: mergedTags.map(([tag, count]) => ({ tag, count }))
  };
}

// 根據標籤統計生成主題配置
export function generateTagThemes(tools: Tools[]): TagThemes {
  // 步驟 1：生成主題配置的核心邏輯
  const generateThemeConfig = (
    tags: TagStatistics[], 
    createTheme: (tag: string, index: number) => ColorTheme
  ): Record<string, ColorTheme> => {
    const themes: Record<string, ColorTheme> = {};

    tags.forEach((tagStat, index) => {
      const tag = tagStat.tag;
      
      // 確保標籤名稱顯示正確（適用於特定標籤的自定義名稱）
      let displayName = tag;
      if (tag === '全部') displayName = '全部';
      
      themes[tag] = {
        ...createTheme(tag, index),
        name: displayName
      };
    });

    return themes;
  };

  // 步驟 2：主題生成的輔助函數
  const createTheme = (tag: string, index: number): ColorTheme => {
    const palette = colorPalettes[index % colorPalettes.length];
    return {
      ...palette,
      name: tag
    };
  };

  // 步驟 3：執行主題生成
  const tagStats = getTagStatistics(tools);
  const { allTags, mergedTags } = tagStats;

  return {
    merged: generateThemeConfig(mergedTags, createTheme),
    full: generateThemeConfig(allTags, createTheme)
  };
}

// 工具數據獲取函數（從 MongoDB 獲取 AI 工具）
export async function getToolsData(): Promise<Tools[]> {
  try {
    // 從 MongoDB 獲取 AI 工具
    const aiToolsFromDB = await AIToolModel.getAllActive();
    const aiTools = convertAIToolDocumentToTools(aiToolsFromDB);
    
    // 合併基礎工具和 AI 工具
    const allTools = [...baseTools, ...aiTools];
    
    // 去除重複的工具
    const uniqueTools = allTools.filter((tool, index, self) => 
      index === self.findIndex((t) => t.id === tool.id)
    );
    
    return uniqueTools;
  } catch (error) {
    console.error('Error fetching tools data:', error);
    // 如果 MongoDB 失敗，至少返回基礎工具
    return baseTools;
  }
}

// 客戶端使用的同步版本（使用 API 調用）
export async function getToolsDataFromAPI(): Promise<Tools[]> {
  try {
    const response = await fetch('/api/aitool');
    if (!response.ok) {
      throw new Error('Failed to fetch tools from API');
    }
    
    const { data: aiToolsFromAPI } = await response.json();
    const aiTools = convertAIToolDocumentToTools(aiToolsFromAPI);
    
    // 合併基礎工具和 AI 工具
    const allTools = [...baseTools, ...aiTools];
    
    // 去除重複的工具
    const uniqueTools = allTools.filter((tool, index, self) => 
      index === self.findIndex((t) => t.id === tool.id)
    );
    
    return uniqueTools;
  } catch (error) {
    console.error('Error fetching tools data from API:', error);
    // 如果 API 失敗，至少返回基礎工具
    return baseTools;
  }
}

// 為了向後兼容，保留舊的同步版本（但現在會返回空的 AI 工具列表）
export function getToolsDataSync(): Tools[] {
  console.warn('getToolsDataSync is deprecated. Use getToolsData() or getToolsDataFromAPI() instead.');
  return baseTools;
}

// 新增：用於伺服器端快速判斷工具搜尋結果
export async function hasToolSearchResults(query?: string, tag?: string): Promise<boolean> {
  if (!query && !tag) {
    // 沒有查詢條件時，返回 true (表示有結果，顯示所有工具)
    return true;
  }

  try {
    const allTools = await getToolsData();
    let filtered = [...allTools];
    
    // 如果有查詢詞，篩選名稱或描述中包含查詢詞的工具
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }
    
    // 如果有標籤，篩選包含該標籤的工具
    if (tag && tag !== '全部') {
      filtered = filtered.filter(t => t.tags.includes(tag));
    }
    
    return filtered.length > 0;
  } catch (error) {
    console.error('Error checking search results:', error);
    return false;
  }
}

// 動態生成標籤主題（需要異步）
let cachedCategoryThemes: Record<string, ColorTheme> | null = null;
let cachedFullTagThemes: Record<string, ColorTheme> | null = null;

export async function getCategoryThemes(): Promise<Record<string, ColorTheme>> {
  if (cachedCategoryThemes) {
    return cachedCategoryThemes;
  }
  
  try {
    const toolsData = await getToolsData();
    const tagThemes = generateTagThemes(toolsData);
    cachedCategoryThemes = tagThemes.merged;
    return cachedCategoryThemes;
  } catch (error) {
    console.error('Error generating category themes:', error);
    return {};
  }
}

export async function getFullTagThemes(): Promise<Record<string, ColorTheme>> {
  if (cachedFullTagThemes) {
    return cachedFullTagThemes;
  }
  
  try {
    const toolsData = await getToolsData();
    const tagThemes = generateTagThemes(toolsData);
    cachedFullTagThemes = tagThemes.full;
    return cachedFullTagThemes;
  } catch (error) {
    console.error('Error generating full tag themes:', error);
    return {};
  }
}

// 為了向後兼容，提供同步版本（使用預設主題）
export const categoryThemes: Record<string, ColorTheme> = {};
export const fullTagThemes: Record<string, ColorTheme> = {};