"use client";

import type { Tools, ColorTheme, TagStats } from "./types";
import { SITE_CONFIG } from "@/config/site";

// 獲取 API 基礎 URL
function getApiBaseUrl(): string {
  // 檢查是否為本地測試環境
  const isLocalProd = process.env.NEXT_PUBLIC_IS_LOCAL_PROD === 'true';

  // 如果是本地測試環境，永遠使用相對路徑
  if (isLocalProd) {
    return '';
  }

  // 在客戶端環境中，檢查當前域名
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host;

    // 如果是 aitools 域名，API 需要指向主域名
    if (currentHost.includes('aitools.leopilot.com')) {
      return SITE_CONFIG.main.domain;
    }

    // 開發環境或主域名，使用相對路徑
    return '';
  }

  // 服務端渲染時使用相對路徑
  return '';
}

// 從 API 獲取所有工具資料
export async function getToolsDataFromAPI(): Promise<Tools[]> {
  try {
    const apiBase = getApiBaseUrl();
    const apiUrl = apiBase ? `${apiBase}/api/aitool` : '/api/aitool';

    const response = await fetch(apiUrl);
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

    const apiBase = getApiBaseUrl();
    const apiUrl = apiBase ? `${apiBase}/api/aitool?${params.toString()}` : `/api/aitool?${params.toString()}`;

    const response = await fetch(apiUrl);
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
