import { Tool } from '../config/tools';
import { CategoryTheme } from '../config/theme';

interface TagStatistics {
  tag: string;
  count: number;
}

export interface TagStats {
  allTags: TagStatistics[];
  mergedTags: TagStatistics[];
}

export interface TagThemes {
  merged: Record<string, CategoryTheme>;
  full: Record<string, CategoryTheme>;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  icon: string;
  hover: string;
  shadow: string;
  gradient: {
    from: string;
    to: string;
  };
}

const colorPalettes: ColorPalette[] = [
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

// 統計工具標籤的分佈情況
export function getTagStatistics(tools: Tool[]): TagStats {
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

  // 過濾計數為 1 的標籤
  const mergedTags = sortedTags.filter(([_, count]) => count > 1);

  return {
    allTags: sortedTags.map(([tag, count]) => ({ tag, count })),
    mergedTags: mergedTags.map(([tag, count]) => ({ tag, count }))
  };
}

// 根據標籤統計生成主題配置
export function generateTagThemes(tools: Tool[]): TagThemes {
  // 步驟 1：生成主題配置的核心邏輯
  const generateThemeConfig = (
    tags: TagStatistics[], 
    createTheme: (tag: string, index: number) => CategoryTheme
  ): Record<string, CategoryTheme> => {
    const themes: Record<string, CategoryTheme> = {
      全部: createTheme('全部', 0)
    };

    tags.forEach((tag, index) => {
      themes[tag.tag] = createTheme(tag.tag, index + 1);
    });

    return themes;
  };

  // 步驟 2：主題生成的輔助函數
  const createTheme = (tag: string, index: number): CategoryTheme => ({
    name: tag,
    ...colorPalettes[index % colorPalettes.length]
  });

  // 步驟 3：執行主題生成
  const tagStats = getTagStatistics(tools);
  const { allTags, mergedTags } = tagStats;

  return {
    merged: generateThemeConfig(mergedTags, createTheme),
    full: generateThemeConfig(allTags, createTheme)
  };
}