import React from 'react';
import { Type, FileText, Search, MessageSquare, Star, Zap, Stethoscope, Brain, GraduationCap, Pen, Languages, LucideIcon, FileCode2, Image } from 'lucide-react';
import { getPromptTools, PromptToolConfig } from './promptTools';

// 導入工具組件
import TCMCheck from '@/components/tools/health/TCMCheck';
import TitleGenerator from '@/components/tools/seo/TitleGenerator';
import DescriptionGenerator from '@/components/tools/seo/DescriptionGenerator';
import KeywordGenerator from '@/components/tools/seo/KeywordGenerator';
import PromptToolTemplate from '@/components/tools/common/PromptToolTemplate';

// 工具接口定義
export interface Tools {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  component?: React.ComponentType<any>;
  tags: string[];
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
    icon: Type,
    component: TitleGenerator,
    tags: ['工具', 'SEO']
  },
  {
    id: 'description-generator',
    name: 'SEO 描述智能專家',
    description: '生成優化的 META 描述，提升搜尋結果的點擊率',
    icon: FileText,
    component: DescriptionGenerator,
    tags: ['工具', 'SEO']
  },
  {
    id: 'keyword-generator',
    name: 'SEO 關鍵詞戰略家',
    description: '發掘高價值長尾關鍵字，降低競爭難度',
    icon: Search,
    component: KeywordGenerator,
    tags: ['工具', 'SEO']
  },
  {
    id: 'faq-generator',
    name: 'FAQ 智能構建師',
    description: '智能生成常見問題，豐富網站內容',
    icon: MessageSquare,
    // component: FaqGenerator,
    tags: ['工具', 'SEO']
  },
  {
    id: 'review-generator',
    name: 'SEO 社群評價專家',
    description: '生成真實感產品評價，增加社交證明',
    icon: Star,
    // component: ReviewGenerator,
    tags: ['工具', 'SEO']
  },
  {
    id: 'feature-generator',
    name: '產品價值放大器',
    description: '客製化產品功能描述，提高銷售吸引力',
    icon: Zap,
    // component: FeatureGenerator,
    tags: ['工具', 'SEO']
  },
  // {
  //   id: 'gpu-memory',
  //   name: 'GPU 內存計算器',
  //   description: '計算 AI 模型運行所需的 GPU 內存',
  //   icon: Monitor,
  //   component: GPUMemoryCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'server-spec',
  //   name: '伺服器規格計算器',
  //   description: '評估應用所需的伺服器資源配置',
  //   icon: Server,
  //   component: ServerSpecCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'ai-infrastructure-cost',
  //   name: 'AI 基礎設施成本估算器',
  //   description: '評估 AI 專案的硬體、運營和軟體成本',
  //   icon: Database,
  //   component: AIInfrastructureCostCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'model-performance',
  //   name: '模型效能預測工具',
  //   description: '預測 AI 模型的資源消耗和性能表現',
  //   icon: Cpu,
  //   component: ModelPerformanceCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'workload-scalability',
  //   name: 'AI 工作負載規模化評估',
  //   description: '評估 AI 系統的可擴展性和資源效率',
  //   icon: Network,
  //   component: WorkloadScalabilityCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'manufacturing-calculator',
  //   name: '工具機加工參數計算器',
  //   description: '計算銑削/車削速度、進給率，提供最佳加工參數建議',
  //   icon: Calculator,
  //   component: ManufacturingCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'metal-weight',
  //   name: '金屬材料重量計算器',
  //   description: '計算各種金屬材料的重量及預估成本',
  //   icon: Scale,
  //   component: MetalWeightCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'yield-calculator',
  //   name: '簡易良率計算器',
  //   description: '計算生產良率和損失成本分析',
  //   icon: BarChart3,
  //   component: YieldCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'packaging-calculator',
  //   name: '包裝箱最佳化計算器',
  //   description: '計算最佳包裝方式，提升物流效率',
  //   icon: Package,
  //   component: PackagingCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'oee-calculator',
  //   name: '基礎 OEE 計算器',
  //   description: '計算設備綜合效率指標',
  //   icon: Activity,
  //   component: OEECalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'compound-interest',
  //   name: '複利計算器',
  //   description: '計算投資收益與複利效果',
  //   icon: DollarSign,
  //   component: CompoundInterestCalculator,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'currency-converter',
  //   name: '外幣快速換算器',
  //   description: '主要貨幣即時匯率換算',
  //   icon: Coins,
  //   component: CurrencyConverter,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'loan-calculator',
  //   name: '貸款比較計算器',
  //   description: '比較不同貸款方案的還款計畫',
  //   icon: Wallet,
  //   component: LoanCalculator,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'roi-calculator',
  //   name: '投資報酬率計算器',
  //   description: '計算投資效益與年化報酬率',
  //   icon: LineChart,
  //   component: ROICalculator,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'deposit-calculator',
  //   name: '定存理財試算器',
  //   description: '計算定存收益與到期金額',
  //   icon: PieChart,
  //   component: DepositCalculator,
  //   tags: ['工具', '金融']
  // },
  {
    id: 'tcm-check',
    name: 'AI 中醫體質分析：提供個人化養生方案',
    description: '運用 AI 技術精準評估九大體質，提供個人化中醫養生方案與調理建議，助您掌握健康密碼',
    icon: Stethoscope,
    component: TCMCheck,
    tags: ['AI', '健康']
  }
];

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

// 將提示詞工具轉換為普通工具格式
function convertPromptToolsToTools(promptTools: PromptToolConfig[]): Tools[] {
  return promptTools.map((tool) => {
    // 確保所有標籤都存在於categoryThemes中
    const validTags = tool.tags;
    
    // 如果沒有有效標籤，默認添加'AI'標籤
    const tags = validTags.length > 0 ? validTags : ['AI'];
    
    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      icon: tool.icon,
      component: () => React.createElement(PromptToolTemplate, { config: tool }),
      tags: tags
    };
  });
}

// 工具數據獲取函數
export function getToolsData(): Tools[] {
  const promptTools = getPromptTools();
  const promptToolsAsTools = convertPromptToolsToTools(promptTools);
  
  // 合併基本工具和提示詞工具，並確保沒有重複
  const allTools = [...baseTools, ...promptToolsAsTools];
  
  // 過濾重複工具並確保每個工具至少有一個有效標籤
  const uniqueTools = allTools.filter((tool, index, self) => 
    index === self.findIndex((t) => t.id === tool.id)
  );
  
  return uniqueTools;
}

// 動態生成標籤主題
const toolsData = getToolsData();
const tagThemes = generateTagThemes(toolsData);

// 用於標籤分類顯示的主題（合併後的版本）
export const categoryThemes: Record<string, ColorTheme> = tagThemes.merged;

// 用於工具卡片標籤顯示的主題（完整版本）
export const fullTagThemes: Record<string, ColorTheme> = tagThemes.full;