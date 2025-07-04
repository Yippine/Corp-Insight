"use client";

import type { Tools, ColorTheme, TagStats } from "./types";

// 從 API 獲取所有工具資料
export async function getToolsDataFromAPI(): Promise<Tools[]> {
  try {
    const response = await fetch("/api/aitool");
    if (!response.ok) {
      throw new Error("Failed to fetch tools from MongoDB");
    }
    const { data: allToolsFromAPI } = await response.json();
    // 資料已在 API 端格式化，客戶端直接使用
    return allToolsFromAPI;
  } catch (error) {
    console.error("Error fetching tools data from API:", error);
    return [];
  }
}

// 根據查詢和標籤搜尋工具
export async function searchToolsFromAPI(query: string, tag: string): Promise<Tools[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);

    const response = await fetch(`/api/aitool?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to search tools from API");
    }
    const { data: searchedTools } = await response.json();
    // 資料已在 API 端格式化，客戶端直接使用
    return searchedTools;
  } catch (error) {
    console.error("Error searching tools from API:", error);
    return [];
  }
}

// 生成標籤統計
export function getTagStatistics(tools: Tools[]): TagStats {
  const tagCounts: Record<string, number> = {};

  tools.forEach((tool) => {
    tool.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 篩選掉只出現過一次的標籤，但保留 "AI" 標籤，因其有特殊邏輯
  const filteredTagEntries = Object.entries(tagCounts).filter(([tag, count]) => {
    return count > 1 || tag === "AI";
  });

  const sortedTags = filteredTagEntries.sort(([, a], [, b]) => b - a);

  // 合併標籤邏輯
  const mergedTags = [...sortedTags];

  // 確保'全部'標籤總是排在最前
  mergedTags.unshift(["全部", tools.length]);

  return {
    allTags: sortedTags.map(([tag, count]) => ({ tag, count })),
    mergedTags: mergedTags.map(([tag, count]) => ({ tag, count })),
  };
}

// 預設顏色配色方案
const colorPalettes = [
  {
    primary: "bg-indigo-500 bg-opacity-85",
    secondary: "bg-indigo-50",
    accent: "bg-indigo-100",
    text: "text-indigo-600 bg-opacity-85",
    icon: "text-indigo-600 bg-opacity-85",
    hover: "hover:bg-indigo-50",
    shadow: "shadow-indigo-300/20",
    gradient: {
      from: "from-indigo-300 bg-opacity-85",
      to: "to-indigo-400",
    },
  },
  {
    primary: "bg-purple-500 bg-opacity-90",
    secondary: "bg-purple-50",
    accent: "bg-fuchsia-100",
    text: "text-purple-500 bg-opacity-90",
    icon: "text-purple-500 bg-opacity-90",
    hover: "hover:bg-purple-50",
    shadow: "shadow-purple-500/10",
    gradient: {
      from: "from-purple-500 bg-opacity-90",
      to: "to-fuchsia-500",
    },
  },
  {
    primary: "bg-pink-500 bg-opacity-85",
    secondary: "bg-pink-50",
    accent: "bg-rose-100",
    text: "text-pink-500 bg-opacity-85",
    icon: "text-pink-500 bg-opacity-85",
    hover: "hover:bg-pink-50",
    shadow: "shadow-pink-500/10",
    gradient: {
      from: "from-pink-500 bg-opacity-85",
      to: "to-rose-500",
    },
  },
  {
    primary: "bg-rose-400 bg-opacity-85",
    secondary: "bg-rose-50",
    accent: "bg-rose-50",
    text: "text-rose-400 bg-opacity-85",
    icon: "text-rose-400 bg-opacity-85",
    hover: "hover:bg-rose-50",
    shadow: "shadow-rose-400/20",
    gradient: {
      from: "from-rose-400 bg-opacity-85",
      to: "to-rose-300",
    },
  },
  {
    primary: "bg-amber-500 bg-opacity-75",
    secondary: "bg-amber-50",
    accent: "bg-yellow-100",
    text: "text-amber-500 bg-opacity-85",
    icon: "text-amber-500 bg-opacity-85",
    hover: "hover:bg-amber-50",
    shadow: "shadow-amber-500/10",
    gradient: {
      from: "from-amber-500 bg-opacity-85",
      to: "to-yellow-500",
    },
  },
  {
    primary: "bg-emerald-500 bg-opacity-85",
    secondary: "bg-emerald-50",
    accent: "bg-green-100",
    text: "text-emerald-500 bg-opacity-85",
    icon: "text-emerald-500 bg-opacity-85",
    hover: "hover:bg-emerald-50",
    shadow: "shadow-emerald-500/10",
    gradient: {
      from: "from-emerald-500 bg-opacity-85",
      to: "to-green-500",
    },
  },
  {
    primary: "bg-sky-400 bg-opacity-85",
    secondary: "bg-sky-50",
    accent: "bg-sky-100",
    text: "text-sky-600 bg-opacity-85",
    icon: "text-sky-600 bg-opacity-85",
    hover: "hover:bg-sky-50",
    shadow: "shadow-sky-400/20",
    gradient: {
      from: "from-sky-400 bg-opacity-85",
      to: "to-sky-500",
    },
  },
];

// 私有輔助函式，用於獲取所有標籤及其計數
function _getAllTagCounts(tools: Tools[]): Record<string, number> {
  const tagCounts: Record<string, number> = {};
  tools.forEach((tool) => {
    tool.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return tagCounts;
}

// 此函式用於為工具卡片生成主題。它必須包含所有標籤，以避免渲染錯誤。
function generateFullTagThemes(tools: Tools[]): Record<string, ColorTheme> {
  const tagCounts = _getAllTagCounts(tools);
  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);

  const themes: Record<string, ColorTheme> = {};
  sortedTags.forEach(([tag], index) => {
    const palette = colorPalettes[index % colorPalettes.length];
    themes[tag] = {
      ...palette,
      name: tag,
    };
  });
  return themes;
}

// 此函式用於生成標籤按鈕，其結果是經過策展的。
function generateCuratedCategoryThemes(tools: Tools[]): Record<string, ColorTheme> {
  const tagCounts = _getAllTagCounts(tools);

  // 1. 過濾掉低價值標籤
  let tagEntries = Object.entries(tagCounts).filter(([tag, count]) => {
    return count > 1 || tag === "AI";
  });

  // 2. 按計數排序，同計數則按筆劃/字母排序
  tagEntries.sort(([tagA, countA], [tagB, countB]) => {
    if (countB !== countA) {
      return countB - countA;
    }
    return tagA.localeCompare(tagB);
  });

  // 3. 特殊處理 'AI' 標籤，確保其在第二位
  const aiIndex = tagEntries.findIndex(([tag]) => tag === "AI");
  if (aiIndex > -1) {
    const [aiTag] = tagEntries.splice(aiIndex, 1);
    tagEntries.unshift(aiTag); // 暫時移到最前
  }

  // 4. 手動添加'全部'標籤
  tagEntries.unshift(["全部", tools.length]);

  // 如果 'AI' 標籤存在，將其從第一個位置移到第二個位置
  const aiTagIndex = tagEntries.findIndex(([tag]) => tag === "AI");
  if (aiTagIndex === 0 && tagEntries.length > 1) {
    // 確保不是唯一的標籤
    const [aiTag] = tagEntries.splice(aiTagIndex, 1);
    tagEntries.splice(1, 0, aiTag);
  }

  // 5. 為此策展列表生成主題
  const themes: Record<string, ColorTheme> = {};
  tagEntries.forEach(([tag], index) => {
    const palette = colorPalettes[index % colorPalettes.length];
    themes[tag] = {
      name: tag,
      primary: palette.primary,
      secondary: palette.secondary,
      text: palette.text,
      hover: palette.hover,
      shadow: palette.shadow,
      gradient: palette.gradient,
      accent: palette.accent,
      icon: palette.icon,
    };
  });

  return themes;
}

// 動態生成分類主題
export async function getCategoryThemes(): Promise<Record<string, ColorTheme>> {
  try {
    const toolsData = await getToolsDataFromAPI();
    return generateCuratedCategoryThemes(toolsData);
  } catch (error) {
    console.error("生成分類主題時發生錯誤：", error);
    return {};
  }
}

// 動態生成完整標籤主題
export async function getFullTagThemes(): Promise<Record<string, ColorTheme>> {
  try {
    const toolsData = await getToolsDataFromAPI();
    return generateFullTagThemes(toolsData);
  } catch (error) {
    console.error("生成完整標籤主題時發生錯誤：", error);
    return {};
  }
}

// 重新匯出類型
export type { Tools, ColorTheme, TagStats } from "./types";
