'use client';

import { useState, useEffect } from 'react';
import {
  questions,
  constitutions,
  Question,
  Constitution,
} from '../../../data/tcm';
import { formatConstitutionTitle } from '../../../utils/tcmFormatter';
import type { ConstitutionScore } from 'tcm-types';
import { ButtonLoading } from '../../common/loading';
import { useGeminiStream } from '@/hooks/useGeminiStream';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function TCMCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
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

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return '';

    // 計算各體質得分
    const scores: Record<string, number> = {};
    constitutions.forEach((constitution: Constitution) => {
      scores[constitution.id] = 0;
    });

    Object.entries(answers).forEach(([questionId, value]) => {
      const question = questions.find((q: Question) => q.id === questionId);
      if (question) {
        Object.entries(question.constitutions).forEach(
          ([constitutionId, weight]: [string, number]) => {
            // 引入非線性加權公式
            const adjustedValue = Math.pow(value, 1.5) * (weight / 2);
            scores[constitutionId] +=
              constitutionId === 'balanced'
                ? adjustedValue * 0.8 // 降低平和質權重
                : adjustedValue * 1.2; // 提高其他體質權重
          }
        );
      }
    });

    // 計算所有體質原始分數
    const allScores: ConstitutionScore[] = constitutions.map(
      (c: Constitution) => ({
        id: c.id,
        score: scores[c.id] || 0,
        threshold: c.threshold,
      })
    );

    // 排除平和質後排序
    const sortedConstitutions = allScores
      .filter((c: ConstitutionScore) => c.id !== 'balanced')
      .sort((a: ConstitutionScore, b: ConstitutionScore) => b.score - a.score);

    // 主要體質判定條件
    const primaryConstitutions = sortedConstitutions
      .filter((c: ConstitutionScore) => {
        const threshold =
          c.id === 'balanced'
            ? c.threshold * 1.2 // 提高平和質門檻
            : c.threshold * 0.9; // 降低其他體質門檻
        return c.score >= threshold;
      })
      .slice(0, 3) // 最多三種體質
      .filter((c: ConstitutionScore, _: number, arr: ConstitutionScore[]) => {
        // 確保主要體質分數不低於最高分60%
        return c.score >= (arr[0]?.score || 0) * 0.6;
      });

    // 平和質特殊條件
    const balancedScore = allScores.find(
      (c: ConstitutionScore) => c.id === 'balanced'
    )!;
    if (
      balancedScore.score >= balancedScore.threshold &&
      balancedScore.score > (sortedConstitutions[0]?.score || 0)
    ) {
      primaryConstitutions.unshift(balancedScore);
    }

    // 最終判定結果
    const matchedConstitutions: ConstitutionScore[] =
      primaryConstitutions.length > 0 ? primaryConstitutions : [balancedScore]; // 預設平和質

    const title = formatConstitutionTitle(matchedConstitutions.map(c => c.id));

    const basePrompt = `您是一位專業的中醫師，請根據以下體質評估結果，提供結構化的養生指南：

# ${title}

## 基礎體質分析
${matchedConstitutions
  .map((c: ConstitutionScore) => {
    const constitution = constitutions.find(
      (ct: Constitution) => ct.id === c.id
    )!;
    return (
      `### ${constitution.name}特徵\n` +
      `• 體質描述：${constitution.description}\n` +
      `• 基礎調理建議：\n${constitution.recommendations.map((r: string) => `  - ${r}`).join('\n')}`
    );
  })
  .join('\n\n')}

## 進階調理建議
### 中藥調理
• 列出 2 - 3 種適合的科學中藥
• 包含劑量與服用方式
• 需註明「請諮詢合格中醫師後使用」

### 食療建議
推薦食材：
- 列出 5 - 8 種台灣常見食材
- 搭配季節性建議
- 附簡單烹調方式

> 注意事項：
{{根據體質類型補充注意事項}}

### 茶飲推薦
• 提供 2 - 3 種台灣常見養生茶飲
• 包含材料比例與沖泡方式
• 註明每日飲用限制

### 經絡調理
• 推薦 2 - 3 個主要穴位
• 包含取穴方法與按摩手法
• 搭配適合的按摩時段

### 起居養生
• 列出 4 - 6 項生活習慣建議
• 包含台灣氣候適應要點
• 睡眠與作息調整

### 運動建議
• 推薦 2 - 3 種適合的傳統養生運動
• 包含每日練習時長
• 注意要點與禁忌

## 養生箴言
> {{根據體質類型撰寫50字內重點提醒}}

${isOptimizing ? '\n需基於現有建議優化：\n' + result?.content + '\n\n參考方向：\n1. 補充台灣在地化食材\n2. 增加穴位按摩圖示說明\n3. 強化季節適應要點' : ''}

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

請以下列語言輸出：
請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。`;

    console.log(`basePrompt: ${basePrompt}`);
    return basePrompt;
  };

  const handleGenerate = async (isOptimizing: boolean = false) => {
    if (isGenerating || Object.keys(answers).length !== questions.length)
      return;

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
      <div className="space-y-6">
        {questions.map((question: Question) => (
          <div
            key={question.id}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          >
            <p className="mb-4 text-lg text-gray-800">{question.text}</p>
            <div className="flex items-center justify-between px-4">
              {[0, 1, 2, 3, 4].map(value => (
                <label
                  key={value}
                  className="group flex cursor-pointer flex-col items-center space-y-2"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={answers[question.id] === value}
                    onChange={() => handleAnswerChange(question.id, value)}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm text-gray-600 transition-colors group-hover:text-blue-600">
                    {value}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 flex justify-between px-2 text-xs text-gray-500">
              <span>正常</span>
              <span>輕度</span>
              <span>中度</span>
              <span>較重</span>
              <span>嚴重</span>
            </div>
          </div>
        ))}

        <div className="flex space-x-4">
          <button
            onClick={() => handleGenerate(false)}
            disabled={
              isGenerating || Object.keys(answers).length !== questions.length
            }
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating && !result?.isOptimizing ? (
              <ButtonLoading text="分析中..." />
            ) : (
              '開始分析'
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={
              isGenerating ||
              !result ||
              Object.keys(answers).length !== questions.length
            }
            className={`flex-1 rounded-md border px-4 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              result
                ? 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {result?.isOptimizing ? (
              <ButtonLoading text="優化中..." />
            ) : (
              '延續分析並優化'
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="mt-6 text-center">
          <p className="text-lg text-blue-600">
            正在生成個人化養生建議，請稍候...
          </p>
        </div>
      )}

      {result && !result.isOptimizing && (
        <div className="mt-8 rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-6 text-2xl font-semibold text-gray-800">
            您的專屬養生方案
          </h2>
          <div
            className="prose prose-blue max-w-none text-base leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: result.content }}
          />
        </div>
      )}
    </div>
  );
}
