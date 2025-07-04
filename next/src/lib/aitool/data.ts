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
): Promise<(DBToolDocument & { matchDetails?: any[] })[]> {
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
    // 建立一個正規化版本的查詢字串，用於後續的完美匹配計算
    const normalizedQueryForExactMatch = originalQuery.replace(
      /[\s:：,、;_.-]+/g,
      ''
    );

    // 智慧型中英文斷詞 (處理 "AI指令" -> "AI 指令")
    const segmentedQuery = query
      .replace(/([a-zA-Z0-9]+)([\u4e00-\u9fa5]+)/g, '$1 $2')
      .replace(/([\u4e00-\u9fa5]+)([a-zA-Z0-9]+)/g, '$1 $2');
    
    // 多分隔符號處理，並過濾掉空字串
    const keywords = segmentedQuery.split(/[\s,、;_.-]+/).filter(k => k);

    // 關鍵字簡轉繁處理
    const traditionalKeywords = keywords.map(k =>
      /[\u4e00-\u9fa5]/.test(k) ? toTraditional(k) : k
    );

    const keywordRegexList = traditionalKeywords.map(
      k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    );

    // 2. 實施多欄位加權搜尋查詢 (Aggregation Pipeline)
    const pipeline: any[] = [];

    // 階段 1: $match - 擴大召回，撈出所有可能相關的結果
    // 任何一個關鍵字出現在任何一個目標欄位中即可
    pipeline.push({
      $match: {
        $and: [
          baseFilter,
          {
            $or: keywordRegexList.flatMap(regex => [
              { name: regex },
              { description: regex },
              { tags: regex },
              { 'instructions.what': regex },
              { 'instructions.why': regex },
              { 'instructions.how': regex },
            ]),
          },
        ],
      },
    });

    // 階段 2: $addFields - 計算加權相關性分數
    pipeline.push({
      $addFields: {
        score: {
          $let: {
            vars: {
              // 將所有目標欄位轉為小寫，並處理 null 的情況
              nameLower: { $toLower: { $ifNull: ['$name', ''] } },
              descLower: { $toLower: { $ifNull: ['$description', ''] } },
              tagsLower: {
                $map: {
                  input: { $ifNull: ['$tags', []] },
                  as: 'tag',
                  in: { $toLower: '$$tag' },
                },
              },
              instWhatLower: {
                $toLower: { $ifNull: ['$instructions.what', ''] },
              },
              instWhyLower: { $toLower: { $ifNull: ['$instructions.why', ''] } },
              instHowLower: { $toLower: { $ifNull: ['$instructions.how', ''] } },
              keywordsLower: traditionalKeywords.map(k => k.toLowerCase()),
            },
            in: {
              $reduce: {
                input: '$$keywordsLower',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    // Name: +5
                    {
                      $cond: [
                        { $regexMatch: { input: '$$nameLower', regex: '$$this', options: 'i' } },
                        5,
                        0,
                      ],
                    },
                    // Tags: +3
                    {
                      $cond: [
                        { $anyElementTrue: {
                          $map: {
                            input: '$$tagsLower',
                            as: 'tag',
                            in: { $regexMatch: { input: '$$tag', regex: '$$this', options: 'i' } }
                          }
                        }},
                        3,
                        0
                      ]
                    },
                    // Instructions.what: +3
                    {
                      $cond: [
                        { $regexMatch: { input: '$$instWhatLower', regex: '$$this', options: 'i' } },
                        3,
                        0,
                      ],
                    },
                    // Description: +1
                    {
                      $cond: [
                        { $regexMatch: { input: '$$descLower', regex: '$$this', options: 'i' } },
                        1,
                        0,
                      ],
                    },
                    // Instructions.why: +1
                    {
                      $cond: [
                        { $regexMatch: { input: '$$instWhyLower', regex: '$$this', options: 'i' } },
                        1,
                        0,
                      ],
                    },
                    // Instructions.how: +1
                    {
                      $cond: [
                        { $regexMatch: { input: '$$instHowLower', regex: '$$this', options: 'i' } },
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

    // 階段 3: $addFields - 給予 `name` 完全匹配的結果額外加分
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            '$score',
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $reduce: {
                        input: [' ', ':', '：', ',', '、', ';', '_', '.', '-'],
                        initialValue: { $toLower: { $ifNull: ['$name', ''] } },
                        in: {
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
                then: 10, // 完美匹配
                else: 0,
              },
            },
          ],
        },
      },
    });

    // 階段 4: $sort - 根據總分數降序、匹配關鍵字數量降序、名稱升序排序
    pipeline.push({
      $sort: {
        score: -1,
        matchedKeywordCount: -1,
        name: 1,
      },
    });

    const results = await collection.aggregate(pipeline).toArray();

    if (process.env.NODE_ENV === 'development') {
      const fieldConfig = [
        { key: 'name', score: 5, label: '名稱' },
        { key: 'tags', score: 3, label: '標籤' },
        { key: 'instructions.what', score: 3, label: 'WHAT' },
        { key: 'description', score: 1, label: '描述' },
        { key: 'instructions.why', score: 1, label: 'WHY' },
        { key: 'instructions.how', score: 1, label: 'HOW' },
      ];

      const processedResults = results.map(tool => {
        // --- Step 1: Calculate all components for the final score ---
        const baseScore = tool.score;
        const lowerCaseKeywords = traditionalKeywords.map(k => k.toLowerCase());
        const matchedKeywords = new Set<string>();

        lowerCaseKeywords.forEach(keyword => {
          for (const field of fieldConfig) {
            const fieldValue = getNestedValue(tool, field.key);
            if (!fieldValue) continue;

            const isMatch = Array.isArray(fieldValue)
              ? fieldValue.some(v => String(v).toLowerCase().includes(keyword))
              : String(fieldValue).toLowerCase().includes(keyword);

            if (isMatch) {
              matchedKeywords.add(keyword);
              // Once a keyword is matched in any field, we can stop checking other fields for it.
              break; 
            }
          }
        });

        const matchedKeywordCount = matchedKeywords.size;
        let multiplier = 1.0;
        switch (matchedKeywordCount) {
          case 2:
            multiplier = 2.0;
            break;
          case 3:
            multiplier = 3.5;
            break;
          case 4:
          default:
            if (matchedKeywordCount >= 4) {
              multiplier = 5.0;
            }
            break;
        }

        const matchDetails: any[] = [];
        let exactMatchBonus = 0;
        const normalizedName = String(tool.name || '')
          .toLowerCase()
          .replace(/[\s:：,、;_.-]+/g, '');
        if (normalizedName === normalizedQueryForExactMatch) {
          exactMatchBonus = 10;
        }

        // --- Step 2: Calculate final score ---
        const finalScore = (baseScore * multiplier) + exactMatchBonus;

        // --- Step 3: Populate details for UI display (does not affect score) ---
        lowerCaseKeywords.forEach(keyword => {
          fieldConfig.forEach(field => {
            const fieldValue = getNestedValue(tool, field.key);
            if (!fieldValue) return;

            const isMatch = Array.isArray(fieldValue)
              ? fieldValue.some(v =>
                  String(v).toLowerCase().includes(keyword)
                )
              : String(fieldValue).toLowerCase().includes(keyword);

            if (isMatch) {
              matchDetails.push({
                field: field.label,
                keyword: keyword,
                content: Array.isArray(fieldValue)
                  ? fieldValue.join(', ')
                  : String(fieldValue),
                score: field.score,
              });
            }
          });
        });

        if (exactMatchBonus > 0) {
          matchDetails.unshift({ // Put it at the top for visibility
            field: '完美匹配',
            keyword: originalQuery,
            content: tool.name,
            score: exactMatchBonus,
          });
        }
        
        return { 
          ...tool,
          score: finalScore, // Override original score with the new final score
          baseScore,
          matchedKeywordCount,
          totalKeywords: lowerCaseKeywords.length,
          multiplier,
          matchDetails,
        } as (DBToolDocument & { score: number; matchDetails?: any[], baseScore?: number, matchedKeywordCount?: number, totalKeywords?: number, multiplier?: number });
      });

      // --- Step 4: Re-sort the entire result set based on the new finalScore ---
      processedResults.sort((a, b) => b.score - a.score);

      return processedResults;
    }

    return results as DBToolDocument[];
  } catch (error) {
    console.error('Error searching tools from DB:', error);
    return [];
  }
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// 檢查搜尋結果是否存在
export async function hasToolSearchResults(
  query?: string,
  tag?: string
): Promise<boolean> {
  if (!query && !tag) {
    // 當沒有任何篩選條件時，我們假設總有工具存在
    // 避免在頁面初始加載時進行不必要的資料庫查詢
    const db = await getDb();
    const collection = db.collection<DBToolDocument>('ai_tools');
    const count = await collection.countDocuments({ isActive: true });
    return count > 0;
  }

  const results = await searchTools(query || '', tag || '');
  return results.length > 0;
}