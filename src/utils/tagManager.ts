import { Tool } from '../config/tools';
import { CategoryTheme } from '../config/theme';

interface TagStatistics {
  tag: string;
  count: number;
}

export interface TagStats {
  tagCountMap: Map<string, number>;
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
  // 步驟 1：計算每個標籤的出現次數
  const tagCounts = tools.reduce((counts, tool) => {
    tool.tags.forEach(tag => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
    return counts;
  }, new Map<string, number>());

  // 步驟 2：將標籤計數轉換為排序後的統計陣列
  const tagStats = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      // 如果是 'AI' 標籤，強制放在第二個位置
      if (a.tag === 'AI') return -1;
      if (b.tag === 'AI') return 1;
      
      // 原有的排序邏輯：先按數量降序，再按字母順序
      return b.count - a.count || a.tag.localeCompare(b.tag);
    });

  // 步驟 3：特殊處理 AI 標籤的邏輯
  const singleTags = tagStats.filter(t => t.count === 1);
  const multipleTags = tagStats.filter(t => t.count > 1);

  // 計算 AI 標籤的總數，包括已存在的和單一出現的標籤
  const existingAiTag = multipleTags.find(tag => tag.tag === 'AI');
  const aiTagCount = (existingAiTag?.count || 0) + singleTags.length;

  // 準備處理 AI 標籤的插入
  const tagWithAICounts = multipleTags.filter(tag => tag.tag !== 'AI');
  const aiTagIndex = tagWithAICounts.findIndex(tag => tag.count <= aiTagCount);
  const aiTag = { tag: 'AI', count: aiTagCount };
  
  // 根據計算的 AI 標籤數量進行插入
  if (aiTagCount > 0) {
    if (aiTagIndex === -1) {
      tagWithAICounts.push(aiTag);
    } else {
      tagWithAICounts.splice(aiTagIndex, 0, aiTag);
    }
  }

  // 步驟 4：對標籤進行最終排序
  tagWithAICounts.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return {
    tagCountMap: tagCounts,    // 原始標籤計數映射
    allTags: tagStats,          // 所有標籤的統計資訊
    mergedTags: tagWithAICounts // 合併後的標籤統計資訊
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