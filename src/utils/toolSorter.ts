import { Tool } from '../config/tools';

// 計算標籤權重的函數
function calculateTagWeights(tools: Tool[]): Map<string, number> {
  const tagCounts = new Map<string, number>();
  
  // 計算每個標籤出現的次數
  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return tagCounts;
}

// 根據標籤權重對工具進行排序
export function sortToolsByTags(tools: Tool[]): Tool[] {
  const tagWeights = calculateTagWeights(tools);
  
  return [...tools].sort((a, b) => {
    // 獲取兩個工具的最高權重標籤
    const aMaxWeight = Math.max(...a.tags.map(tag => tagWeights.get(tag) || 0));
    const bMaxWeight = Math.max(...b.tags.map(tag => tagWeights.get(tag) || 0));
    
    // 首先按照最高權重標籤排序
    if (bMaxWeight !== aMaxWeight) {
      return bMaxWeight - aMaxWeight;
    }
    
    // 如果最高權重相同，按照標籤數量排序
    if (b.tags.length !== a.tags.length) {
      return b.tags.length - a.tags.length;
    }
    
    // 如果標籤數量也相同，按照名稱字母順序排序
    return a.name.localeCompare(b.name);
  });
}