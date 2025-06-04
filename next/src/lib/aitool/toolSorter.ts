import type { Tools } from './types';

// 由於我們現在動態生成主題，這裡使用一個基本的排序邏輯
const defaultCategoryOrder = ['全部', 'AI', '工具', 'SEO', '健康', '電腦', '金融', '製造'];

// 根據類別主題順序對標籤進行排序的核心邏輯
function sortTagsByCategory(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const aIndex = defaultCategoryOrder.indexOf(a);
    const bIndex = defaultCategoryOrder.indexOf(b);
    
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
export function sortToolsByTags(tools: Tools[]): Tools[] {
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
      
      // 其次根據類別主題順序排序
      const aIndex = defaultCategoryOrder.indexOf(a.tags[i]);
      const bIndex = defaultCategoryOrder.indexOf(b.tags[i]);
      
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
    }
    
    return a.name.localeCompare(b.name);
  });
}

// 基於選定標籤的排序函數（但會優先使用主要的標籤排序邏輯）
export function sortToolsBySelectedTag(tools: Tools[], selectedTag?: string): Tools[] {
  if (!selectedTag || selectedTag === '全部') return sortToolsByTags(tools);
  
  return [...sortToolsByTags(tools)].sort((a, b) => {
    const aHasTag = a.tags.includes(selectedTag);
    const bHasTag = b.tags.includes(selectedTag);
    
    if (aHasTag && !bHasTag) return -1;
    if (!aHasTag && bHasTag) return 1;
    return 0;
  });
}