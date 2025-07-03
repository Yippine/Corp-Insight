import { getDb } from '@/lib/mongodbUtils';
import {
  AIToolModel,
  AIToolDocument as DBToolDocument,
} from '@/lib/database/models/AITool';
import type { Tools } from './types';
import { mapAiToolDocumentsToTools } from './utils';
const OpenCC = require('opencc-js');

// 初始化 OpenCC 轉換器
const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
const toTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' });

// 轉換 AIToolDocument 到 Tools 格式的輔助函數 (現已代理至 utils)
export function convertAIToolDocumentToTools(
  aiTools: DBToolDocument[]
): Tools[] {
  return mapAiToolDocumentsToTools(aiTools);
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

// 根據查詢條件和標籤搜尋工具
export async function searchTools(
  query: string,
  tag: string
): Promise<DBToolDocument[]> {
  try {
    const db = await getDb();
    const collection = db.collection<DBToolDocument>('ai_tools');

    // 基本過濾條件
    const baseFilter: any = { isActive: true };

    // 針對 'AI' 標籤的特殊處理
    if (tag) {
      if (tag === 'AI') {
        // 查詢沒有指定 componentId 的通用 AI 工具
        baseFilter.componentId = { $in: [null, undefined] };
      } else {
        baseFilter.tags = tag;
      }
    }

    // 如果沒有任何查詢條件，返回所有符合基本過濾的工具
    if (!query) {
      return await collection
        .find(baseFilter)
        .sort({ name: 1 }) // 預設按名稱排序
        .toArray();
    }

    // --- 智慧型搜尋邏輯 ---

    // 1. 關鍵字預處理
    const originalQuery = query.trim().toLowerCase();
    // 建立一個正規化版本的查詢字串，移除所有空格和常見的中英文標點符號
    const normalizedQueryForExactMatch = originalQuery.replace(
      /[\s:：,、;_.-]+/g,
      ''
    );

    // 智慧型中英文斷詞
    const segmentedQuery = query
      .replace(/([a-zA-Z0-9]+)([\u4e00-\u9fa5]+)/g, '$1 $2')
      .replace(/([\u4e00-\u9fa5]+)([a-zA-Z0-9]+)/g, '$1 $2');

    // 多分隔符號處理，並過濾掉空字串
    const originalKeywords = segmentedQuery
      .split(/[\s,、;_.-]+/)
      .filter(k => k);

    // 簡繁關鍵字擴展
    const expandedKeywords = new Set<string>();
    for (const keyword of originalKeywords) {
      expandedKeywords.add(keyword);
      if (/[\u4e00-\u9fa5]/.test(keyword)) {
        expandedKeywords.add(toSimplified(keyword));
        expandedKeywords.add(toTraditional(keyword));
      }
    }
    const keywordRegexList = Array.from(expandedKeywords).map(
      k => new RegExp(k, 'i')
    );

    // 2. 實施混合搜尋查詢 (Aggregation Pipeline)
    const pipeline = [];

    // 階段 1: $match - 執行基礎的 OR 邏輯篩選
    pipeline.push({
      $match: {
        $and: [
          baseFilter,
          {
            $or: keywordRegexList.map(regex => ({ name: regex })),
          },
        ],
      },
    });

    // 階段 2: $addFields - 計算相關性分數 (score)
    pipeline.push({
      $addFields: {
        score: {
          $let: {
            vars: {
              nameLower: { $toLower: '$name' },
              // 建立一個包含所有原始關鍵字(小寫)的陣列
              keywordsLower: originalKeywords.map(k => k.toLowerCase()),
            },
            in: {
              // 遍歷所有原始關鍵字，如果 name 包含該關鍵字，則 +1
              $reduce: {
                input: '$$keywordsLower',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    {
                      $cond: [
                        { $regexMatch: { input: '$$nameLower', regex: '$$this' } },
                        1,
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    });

    // 階段 3: $addFields - 給予完全匹配的結果額外加分 (Bonus)
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            '$score',
            {
              $cond: {
                if: {
                  // 比較正規化後的 name 和正規化後的查詢字串
                  $eq: [
                    // 使用 $reduce 優雅地鏈式替換所有 client regex 中定義的符號
                    {
                      $reduce: {
                        input: [
                          ' ',
                          ':',
                          '：',
                          ',',
                          '、',
                          ';',
                          '_',
                          '.',
                          '-',
                        ], // 要移除的字元列表
                        initialValue: { $toLower: '$name' }, // 初始值為小寫的 name
                        in: {
                          // 在上一步的結果中，替換掉當前的字元
                          $replaceAll: {
                            input: '$$value',
                            find: '$$this',
                            replacement: '',
                          },
                        },
                      },
                    },
                    normalizedQueryForExactMatch,
                  ],
                },
                then: 10, // 精準匹配，分數 +10
                else: 0,
              },
            },
          ],
        },
      },
    });
    
    // 階段 4: $sort - 根據分數降序排序
    pipeline.push({
      $sort: {
        score: -1,
        name: 1, // 分數相同時，按名稱排序，確保結果穩定
      },
    });

    const results = await collection.aggregate(pipeline).toArray();
    return results as DBToolDocument[];
  } catch (error) {
    console.error('Error searching tools from DB:', error);
    return [];
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

  const results = await searchTools(query || '', tag || '');
  return results.length > 0;
}