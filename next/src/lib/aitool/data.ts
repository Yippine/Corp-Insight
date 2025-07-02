import type { AIToolDocument as DBToolDocument } from '@/lib/database/models/AITool';
import { iconMap } from './iconMap';
import type { Tools } from './types';
import { AIToolModel } from '@/lib/database/models/AITool';

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

// 根據 ID 獲取特定工具 (已重構為直接訪問資料庫)
export async function getToolById(toolId: string): Promise<Tools | null> {
  try {
    const tool = await AIToolModel.getById(toolId);

    if (tool) {
      // The model returns a single object, but convertAIToolDocumentToTools expects an array
      return convertAIToolDocumentToTools([tool])[0] || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching tool by ID directly from DB (${toolId}):`, error);
    return null;
  }
}