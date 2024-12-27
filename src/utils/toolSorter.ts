import { Tool } from '../config/tools';
import { getTagStatistics } from './tagManager';
import { categoryThemes } from '../config/theme';

// 根據類別主題順序對標籤進行排序的核心邏輯
function sortTagsByCategory(tags: string[]): string[] {
  const categoryOrder = Object.keys(categoryThemes);
  
  return [...tags].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    // 處理未定義類別的標籤排序邏輯
    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
}

// 根據標籤權重和類別排序工具的主要排序策略
export function sortToolsByTags(tools: Tool[]): Tool[] {
  const { tagCountMap } = getTagStatistics(tools);
  
  const toolsWithSortedTags = tools.map(tool => ({
    ...tool,
    tags: sortTagsByCategory(tool.tags)
  }));

  // 執行複雜的多維度排序邏輯
  return toolsWithSortedTags.sort((a, b) => {
    const maxLength = Math.max(a.tags.length, b.tags.length);
    
    for (let i = 0; i < maxLength; i++) {
      // 處理標籤缺失的邊界情況
      if (!a.tags[i] && b.tags[i]) return 1;
      if (a.tags[i] && !b.tags[i]) return -1;
      if (!a.tags[i] && !b.tags[i]) continue;

      // 比較標籤的出現頻率，優先根據標籤出現頻率排序
      const aTagCount = tagCountMap.get(a.tags[i]) || 0;
      const bTagCount = tagCountMap.get(b.tags[i]) || 0;
      
      if (aTagCount !== bTagCount) {
        return bTagCount - aTagCount;
      }
      
      // 其次根據類別主題順序排序
      const aIndex = Object.keys(categoryThemes).indexOf(a.tags[i]);
      const bIndex = Object.keys(categoryThemes).indexOf(b.tags[i]);
      
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
    }
    
    return a.name.localeCompare(b.name);
  });
}