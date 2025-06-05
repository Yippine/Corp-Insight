'use client';

import { AIToolDocument as DBToolDocument } from '@/lib/database/models/AITool';
import { iconMap } from './iconMap';
import type { Tools, ColorTheme, TagStats } from './types';

// 從 API 獲取所有工具資料
export async function getToolsDataFromAPI(): Promise<Tools[]> {
  try {
    // 統一從 MongoDB 獲取所有工具（AI 工具 + 基礎工具）
    const response = await fetch('/api/aitool');

    if (!response.ok) {
      throw new Error('Failed to fetch tools from MongoDB');
    }

    const { data: allToolsFromAPI } = await response.json();
    
    // 轉換為前端使用的格式
    const allTools: Tools[] = allToolsFromAPI.map((tool: DBToolDocument) => {
      const currentTags = tool.tags || [];

      // 檢查是否為 AI 工具
      const isAITool = tool.isAITool !== false && tool.renderType !== 'component';

      // 確保 AI 工具有 'AI' 標籤
      if (isAITool && !currentTags.includes('AI')) {
        currentTags.push('AI');
      }

      // 確保 icon 存在於 iconMap 中，否則使用 'Zap'
      const iconName = tool.icon in iconMap ? tool.icon : 'Zap';

      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        iconName: iconName as keyof typeof iconMap,
        componentId: tool.componentId || (isAITool ? 'PromptToolTemplate' : undefined),
        tags: currentTags,
        category: tool.category || 'AI 工具',
        subCategory: tool.subCategory,
        instructions: tool.instructions,
        placeholder: tool.placeholder,
        promptTemplate: tool.promptTemplate,
      };
    });

    return allTools;
  } catch (error) {
    console.error('Error fetching tools data from API:', error);
    return [];
  }
}

// 根據 ID 獲取特定工具
export async function getToolById(toolId: string): Promise<Tools | null> {
  try {
    const response = await fetch(
      `/api/aitool?id=${encodeURIComponent(toolId)}`
    );
    if (response.ok) {
      const { data: tool } = await response.json();
      if (tool) {
        return convertAIToolDocumentToTools([tool])[0] || null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching tool by ID:', error);
    return null;
  }
}

// 檢查搜尋結果是否存在
export async function hasToolSearchResults(
  query?: string,
  tag?: string
): Promise<boolean> {
  if (!query && !tag) {
    return true; // 沒有查詢條件時返回 true
  }

  try {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('q', query);
    if (tag) searchParams.append('tag', tag);

    const response = await fetch(`/api/aitool?${searchParams.toString()}`);
    if (response.ok) {
      const { data } = await response.json();
      return Array.isArray(data) && data.length > 0;
    }
    return false;
  } catch (error) {
    console.error('Error checking search results:', error);
    return false;
  }
}

// 轉換 AIToolDocument 到 Tools 格式的輔助函數
export function convertAIToolDocumentToTools(
  aiTools: DBToolDocument[]
): Tools[] {
  return aiTools.map(tool => {
    const currentTags = tool.tags || [];

    // 根據工具類型決定是否添加 'AI' 標籤
    const isAITool = tool.isAITool !== false && tool.renderType !== 'component';
    if (isAITool && !currentTags.includes('AI')) {
      currentTags.push('AI');
    }

    // 確保 icon 存在於 iconMap 中，否則使用 'Zap'
    const iconName = tool.icon in iconMap ? tool.icon : 'Zap';

    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      iconName: iconName as keyof typeof iconMap,
      componentId:
        tool.componentId || (isAITool ? 'PromptToolTemplate' : undefined),
      tags: currentTags,
      category: tool.category,
      subCategory: tool.subCategory,
      instructions: tool.instructions,
      placeholder: tool.placeholder,
      promptTemplate: tool.promptTemplate,
    };
  });
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
