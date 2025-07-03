'use client';

import type { Tools, ColorTheme, TagStats } from './types';

// 從 API 獲取所有工具資料
export async function getToolsDataFromAPI(): Promise<Tools[]> {
  try {
    const response = await fetch('/api/aitool');
    if (!response.ok) {
      throw new Error('Failed to fetch tools from MongoDB');
    }
    const { data: allToolsFromAPI } = await response.json();
    // 資料已在 API 端格式化，客戶端直接使用
    return allToolsFromAPI;
  } catch (error) {
    console.error('Error fetching tools data from API:', error);
    return [];
  }
}

// 根據查詢和標籤搜尋工具
export async function searchToolsFromAPI(
  query: string,
  tag: string
): Promise<Tools[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tag) params.set('tag', tag);

    const response = await fetch(`/api/aitool?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to search tools from API');
    }
    const { data: searchedTools } = await response.json();
    // 資料已在 API 端格式化，客戶端直接使用
    return searchedTools;
  } catch (error) {
    console.error('Error searching tools from API:', error);
    return [];
  }
}

// 生成標籤統計
export function getTagStatistics(tools: Tools[]): TagStats {
  const tagCounts: Record<string, number> = {};

  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);

  // 合併標籤邏輯
  const mergedTags = [...sortedTags];

  // 確保'全部'標籤總是排在最前
  mergedTags.unshift(['全部', tools.length]);

  return {
    allTags: sortedTags.map(([tag, count]) => ({ tag, count })),
    mergedTags: mergedTags.map(([tag, count]) => ({ tag, count })),
  };
}

// 預設顏色配色方案
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
      to: 'to-indigo-400',
    },
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
      to: 'to-fuchsia-500',
    },
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
      to: 'to-rose-500',
    },
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
      to: 'to-rose-300',
    },
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
      to: 'to-yellow-500',
    },
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
      to: 'to-green-500',
    },
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
      to: 'to-sky-500',
    },
  },
];

// 生成標籤主題
export function generateTagThemes(tools: Tools[]): Record<string, ColorTheme> {
  const tagStats = getTagStatistics(tools);
  const themes: Record<string, ColorTheme> = {};

  tagStats.mergedTags.forEach((tagStat, index) => {
    const tag = tagStat.tag;
    const palette = colorPalettes[index % colorPalettes.length];

    themes[tag] = {
      ...palette,
      name: tag,
    };
  });

  return themes;
}

// 動態生成分類主題
export async function getCategoryThemes(): Promise<Record<string, ColorTheme>> {
  try {
    const toolsData = await getToolsDataFromAPI();
    const tagThemes = generateTagThemes(toolsData);
    return tagThemes;
  } catch (error) {
    console.error('Error generating category themes:', error);
    return {};
  }
}

// 動態生成完整標籤主題
export async function getFullTagThemes(): Promise<Record<string, ColorTheme>> {
  try {
    const toolsData = await getToolsDataFromAPI();
    const tagThemes = generateTagThemes(toolsData);
    return tagThemes;
  } catch (error) {
    console.error('Error generating full tag themes:', error);
    return {};
  }
}

// 重新匯出類型
export type { Tools, ColorTheme, TagStats } from './types';
