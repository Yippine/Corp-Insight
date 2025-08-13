import { getDb } from '@/lib/mongodbUtils';
import { Filter } from 'mongodb';
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

// 定義 prompt_templates collection 的文件結構
interface GlobalSetting {
  _id: string;
  description: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

// 轉換 AIToolDocument 到 Tools 格式的輔助函數 (現已代理至 utils)
export function convertAIToolDocumentToTools(
  aiTools: DBToolDocument[]
): Tools[] {
  return mapAiToolDocumentsToTools(aiTools);
}

// 根據 ID 獲取特定工具 (已重構為直接訪問資料庫)
export async function getToolById(toolId: string): Promise<Tools | null> {
  try {
    const db = await getDb();

    // 定義查詢 prompt_templates 的過濾器，並明確指定 _id 的型別
    const systemPromptFilter: Filter<GlobalSetting> = {
      _id: 'template_prompt',
    };

    const [toolDoc, systemPromptDoc] = await Promise.all([
      db
        .collection<DBToolDocument>('ai_tools')
        .findOne({ id: toolId, isActive: true }),
      db
        .collection<GlobalSetting>('prompt_templates')
        .findOne(systemPromptFilter),
    ]);

    if (!toolDoc) {
      return null;
    }

    // 將通用系統提示詞範本附加到工具物件上
    const toolWithSystemPrompt = {
      ...toolDoc,
      systemPromptTemplate: systemPromptDoc?.template || '', // 提供一個預設空字串以防萬一
    };

    // 模型回傳的是單一物件，但 convertAIToolDocumentToTools 預期的是一個陣列
    return (
      convertAIToolDocumentToTools([
        toolWithSystemPrompt as DBToolDocument,
      ])[0] || null
    );
  } catch (error) {
    console.error(`從資料庫直接按 ID 獲取工具時發生錯誤（${toolId}）：`, error);
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

    // 如果提供了標籤，將其作為過濾條件
    if (tag) {
      baseFilter.tags = tag;
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
              instWhyLower: {
                $toLower: { $ifNull: ['$instructions.why', ''] },
              },
              instHowLower: {
                $toLower: { $ifNull: ['$instructions.how', ''] },
              },
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
                        {
                          $regexMatch: {
                            input: '$$nameLower',
                            regex: '$$this',
                            options: 'i',
                          },
                        },
                        5,
                        0,
                      ],
                    },
                    // Tags: +3
                    {
                      $cond: [
                        {
                          $anyElementTrue: {
                            $map: {
                              input: '$$tagsLower',
                              as: 'tag',
                              in: {
                                $regexMatch: {
                                  input: '$$tag',
                                  regex: '$$this',
                                  options: 'i',
                                },
                              },
                            },
                          },
                        },
                        3,
                        0,
                      ],
                    },
                    // Instructions.what: +3
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: '$$instWhatLower',
                            regex: '$$this',
                            options: 'i',
                          },
                        },
                        3,
                        0,
                      ],
                    },
                    // Description: +1
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: '$$descLower',
                            regex: '$$this',
                            options: 'i',
                          },
                        },
                        1,
                        0,
                      ],
                    },
                    // Instructions.why: +1
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: '$$instWhyLower',
                            regex: '$$this',
                            options: 'i',
                          },
                        },
                        1,
                        0,
                      ],
                    },
                    // Instructions.how: +1
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: '$$instHowLower',
                            regex: '$$this',
                            options: 'i',
                          },
                        },
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
        // --- 步驟一：計算最終分數的所有組成部分 ---
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
              // 一旦一個關鍵字在任何欄位中被匹配，我們就可以停止檢查該關鍵字的其他欄位。
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

        // -- 步驟二：計算最終分數 ---
        const finalScore = baseScore * multiplier + exactMatchBonus;

        // --- 步驟三：填充用於 UI 顯示的詳細資訊（不影響分數） ---
        lowerCaseKeywords.forEach(keyword => {
          fieldConfig.forEach(field => {
            const fieldValue = getNestedValue(tool, field.key);
            if (!fieldValue) return;

            const isMatch = Array.isArray(fieldValue)
              ? fieldValue.some(v => String(v).toLowerCase().includes(keyword))
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
          matchDetails.unshift({
            // 置於頂部以方便查看
            field: '完美匹配',
            keyword: originalQuery,
            content: tool.name,
            score: exactMatchBonus,
          });
        }

        return {
          ...tool,
          score: finalScore, // 使用新的最終分數覆蓋原有的分數
          baseScore,
          matchedKeywordCount,
          totalKeywords: lowerCaseKeywords.length,
          multiplier,
          matchDetails,
        } as DBToolDocument & {
          score: number;
          matchDetails?: any[];
          baseScore?: number;
          matchedKeywordCount?: number;
          totalKeywords?: number;
          multiplier?: number;
        };
      });

      // --- 步驟四：根據新的最終分數重新排序整個結果集 ---
      processedResults.sort((a, b) => b.score - a.score);

      return processedResults;
    }

    return results as DBToolDocument[];
  } catch (error) {
    console.error('從資料庫搜尋工具時發生錯誤：', error);
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
