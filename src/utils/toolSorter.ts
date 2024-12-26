import { Tool } from '../config/tools';
import { getTagStatistics } from './tagManager';
import { categoryThemes } from '../config/theme';

// 依照 categoryThemes 的順序對 tags 進行排序
function sortTagsByCategory(tags: string[]): string[] {
  const categoryOrder = Object.keys(categoryThemes);
  
  return [...tags].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    // 如果標籤不在 categoryThemes 中，則排在最後
    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
}

// 主排序函式
export function sortToolsByTags(tools: Tool[]): Tool[] {
  const { tagCountMap } = getTagStatistics(tools);
  
  // 先對每個 Tool 的 tags 進行排序
  const toolsWithSortedTags = tools.map(tool => ({
    ...tool,
    tags: sortTagsByCategory(tool.tags)
  }));

  // 再依照 Tag 權重對 Tools 進行排序
  return toolsWithSortedTags.sort((a, b) => {
    // 比較每個標籤的權重
    const maxLength = Math.max(a.tags.length, b.tags.length);
    
    for (let i = 0; i < maxLength; i++) {
      // 如果其中一個工具沒有這個位置的標籤，將沒有標籤的排後面
      if (!a.tags[i] && b.tags[i]) return 1;
      if (a.tags[i] && !b.tags[i]) return -1;
      if (!a.tags[i] && !b.tags[i]) continue;

      const aTagCount = tagCountMap.get(a.tags[i]) || 0;
      const bTagCount = tagCountMap.get(b.tags[i]) || 0;
      
      // 先比較標籤數量
      if (aTagCount !== bTagCount) {
        return bTagCount - aTagCount;
      }
      
      // 如果標籤數量相同，比較標籤在 categoryThemes 中的順序
      const aIndex = Object.keys(categoryThemes).indexOf(a.tags[i]);
      const bIndex = Object.keys(categoryThemes).indexOf(b.tags[i]);
      
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
    }
    
    // 如果所有標籤都相同，最後才比較工具名稱
    return a.name.localeCompare(b.name);
  });
}