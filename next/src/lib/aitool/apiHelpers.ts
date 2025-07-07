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

  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 篩選掉只出現過一次的標籤，但保留 "AI" 標籤，因其有特殊邏輯
  const filteredTagEntries = Object.entries(tagCounts).filter(([tag, count]) => {
    return count > 1 || tag === 'AI';
  });

  const sortedTags = filteredTagEntries.sort(([, a], [, b]) => b - a);

  // 合併標籤邏輯
  const mergedTags = [...sortedTags];

  // 確保'全部'標籤總是排在最前
  mergedTags.unshift(['全部', tools.length]);

  return {
    allTags: sortedTags.map(([tag, count]) => ({ tag, count })),
    mergedTags: mergedTags.map(([tag, count]) => ({ tag, count })),
  };
}

// 重新匯出類型
export type { Tools, ColorTheme, TagStats } from "./types";
