'use client';

import { useState, useEffect } from 'react';
import {
  productCategories,
  targetAudiences,
} from '../../../config/geminiOptions';
import { ButtonLoading } from '../../common/loading/LoadingTypes';
import { useGeminiStream } from '@/hooks/useGeminiStream';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function FaqGenerator() {
  const [product, setProduct] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [category, setCategory] = useState<string>(productCategories[0].id);
  const [audience, setAudience] = useState<string>(targetAudiences[0].id);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const {
    isLoading: isGenerating,
    error: generationError,
    result: generationResult,
    generate,
  } = useGeminiStream();

  useEffect(() => {
    // 當 useGeminiStream 的結果更新時，同步到我們自己的 result 狀態
    if (generationResult) {
      setResult({ content: generationResult, isOptimizing: false });
    }
    if (generationError) {
      setResult({
        content: `生成失敗：${generationError}`,
        isOptimizing: false,
      });
    }
  }, [generationResult, generationError]);

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return '';

    const selectedCategory = productCategories.find(
      c => c.id === category
    )?.name;
    const selectedAudience = targetAudiences.find(a => a.id === audience)?.name;

    const basePrompt = `你是一位專業的 FAQ 內容策劃專家，專注於創造高品質、簡潔且實用的常見問題與解答。

${isOptimizing ? '請基於以下現有 FAQ 進行優化：\n' + result?.content + '\n\n以及參考以下資訊：\n' : ''}
請根據以下輸入：
產品/服務：${product}
使用者痛點：${painPoints}
產品類別：${selectedCategory}
目標受眾：${selectedAudience}

請生成3個常見問題與答案，符合以下專業標準：
1. 問題簡潔明確
2. 答案詳細實用
3. 涵蓋不同角度
4. 包含關鍵字
5. 解決實際問題
6. 提供額外價值
7. 語言通俗易懂
8. 適合結構化數據標記

請以下列格式輸出（列舉3個）：
Q1：[問題]
A1：[答案]

Q2：[問題]
A2：[答案]
...

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

請以下列語言輸出：
請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。`;

    return basePrompt;
  };

  const handleGenerate = async (isOptimizing: boolean = false) => {
    if (!product.trim() || !painPoints.trim() || isGenerating) return;

    // 如果是優化模式，先更新 UI 狀態以顯示"優化中"
    if (isOptimizing && result) {
      setResult(prev => ({ ...prev!, isOptimizing: true }));
    }

    const prompt = generatePrompt(isOptimizing);
    // 呼叫 hook 中的 generate 函式，它會處理 API 請求和所有狀態管理
    await generate(prompt);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              產品／服務名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={product}
              onChange={e => setProduct(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：線上英語學習平台"
            />
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              使用者痛點 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={painPoints}
              onChange={e => setPainPoints(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：學習時間不固定、需要靈活安排課程、想要 Native Speaker 授課"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                產品類別
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {productCategories.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                目標受眾
              </label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {targetAudiences.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || !product.trim() || !painPoints.trim()}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating && !result?.isOptimizing ? (
              <ButtonLoading text="生成中..." />
            ) : (
              '開始新對話'
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={
              isGenerating || !result || !product.trim() || !painPoints.trim()
            }
            className={`flex-1 rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              result
                ? 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {result?.isOptimizing ? (
              <ButtonLoading text="優化中..." />
            ) : (
              '延續對話並優化'
            )}
          </button>
        </div>

        {result && (
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 text-xl font-medium text-gray-900">對話結果</h3>
            <div className="space-y-4 whitespace-pre-wrap font-mono text-base">
              {result.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
