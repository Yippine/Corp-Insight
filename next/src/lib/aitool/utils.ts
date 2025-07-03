import { AIToolDocument as DBToolDocument } from '@/lib/database/models/AITool';
import { iconMap } from './iconMap';
import type { Tools } from './types';

/**
 * 將單個從資料庫獲取的 AIToolDocument 轉換為前端所需的 Tools 格式。
 * 這是資料轉換的唯一真實來源 (Single Source of Truth)。
 * @param tool - 從 MongoDB 獲取的 AITool 文件。
 * @returns - 轉換後的前端 Tools 物件。
 */
export function mapAiToolDocumentToTool(tool: DBToolDocument): Tools {
  const currentTags = tool.tags || [];

  // 如果工具沒有指定的 componentId，就將其視為通用 AI 工具並自動添加 'AI' 標籤
  if (!tool.componentId && !currentTags.includes('AI')) {
    currentTags.push('AI');
  }

  // 確保 icon 存在於 iconMap 中，否則使用預設的 'Zap' 圖標
  const iconName = tool.icon && tool.icon in iconMap ? tool.icon : 'Zap';

  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    iconName: iconName as keyof typeof iconMap,
    componentId: tool.componentId || 'PromptToolTemplate',
    tags: currentTags,
    category: tool.category || 'AI 工具',
    subCategory: tool.subCategory,
    instructions: tool.instructions,
    placeholder: tool.placeholder,
    promptTemplate: tool.promptTemplate,
  };
}

/**
 * 將 AIToolDocument 陣列轉換為前端所需的 Tools 陣列。
 * @param aiTools - AITool 文件的陣列。
 * @returns - 轉換後的前端 Tools 物件陣列。
 */
export function mapAiToolDocumentsToTools(aiTools: DBToolDocument[]): Tools[] {
  return aiTools.map(mapAiToolDocumentToTool);
}