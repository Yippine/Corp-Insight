import { useState } from 'react';
import Instructions from '../Instructions';
import { Loader2 } from 'lucide-react';
import { questions, constitutions } from '../../../data/tcm';
import { streamGenerateContent } from '../../../lib/gemini';
import { formatConstitutionTitle } from '../../../utils/tcmFormatter';
import type { ConstitutionScore } from 'tcm-types';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function TCMCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return '';

    // 計算各體質得分
    const scores: Record<string, number> = {};
    constitutions.forEach(constitution => {
      scores[constitution.id] = 0;
    });

    Object.entries(answers).forEach(([questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        Object.entries(question.constitutions).forEach(([constitutionId, weight]) => {
          // 引入非線性加權公式
          const adjustedValue = Math.pow(value, 1.5) * (weight / 2);
          scores[constitutionId] += constitutionId === 'balanced' 
            ? adjustedValue * 0.8  // 降低平和質權重
            : adjustedValue * 1.2; // 提高其他體質權重
        });
      }
    });

    // 計算所有體質原始分數
    const allScores = constitutions.map(c => ({
      id: c.id,
      score: scores[c.id],
      threshold: c.threshold
    }));

    // 排除平和質後排序
    const sortedConstitutions = allScores
      .filter(c => c.id !== 'balanced')
      .sort((a, b) => b.score - a.score);

    // 主要體質判定條件
    const primaryConstitutions = sortedConstitutions
      .filter(c => {
        const threshold = c.id === 'balanced' 
          ? c.threshold * 1.2  // 提高平和質門檻
          : c.threshold * 0.9; // 降低其他體質門檻
        return c.score >= threshold;
      })
      .slice(0, 3) // 最多三種體質
      .filter((c, _, arr) => {
        // 確保主要體質分數不低於最高分60%
        return c.score >= (arr[0]?.score || 0) * 0.6;
      });

    // 平和質特殊條件
    const balancedScore = allScores.find(c => c.id === 'balanced')!;
    if (
      balancedScore.score >= balancedScore.threshold &&
      balancedScore.score > (sortedConstitutions[0]?.score || 0)
    ) {
      primaryConstitutions.unshift(balancedScore);
    }

    // 最終判定結果
    const matchedConstitutions: ConstitutionScore[] = primaryConstitutions.length > 0 
      ? primaryConstitutions 
      : [balancedScore]; // 預設平和質

    let titleType = '';
    if (matchedConstitutions.length === 1) {
      titleType = '主要體質';
    } else if (matchedConstitutions.length === 2) {
      titleType = '複合型體質';
    } else {
      titleType = '特殊體質組合';
    }

    const title = formatConstitutionTitle(
      matchedConstitutions.map(c => c.id)
    );

    const basePrompt = `您是一位專業的中醫師，請根據以下體質評估結果，提供結構化的養生指南：

# ${title}

## 基礎體質分析
${matchedConstitutions.map(c => {
  const constitution = constitutions.find(ct => ct.id === c.id)!;
  return `### ${constitution.name}特徵\n` +
  `• 體質描述：${constitution.description}\n` +
  `• 基礎調理建議：\n${constitution.recommendations.map(r => `  - ${r}`).join('\n')}`;
}).join('\n\n')}

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
    if (Object.keys(answers).length !== questions.length) return;

    setIsGenerating(true);
    if (result) {
      setResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isOptimizing: true
        };
      });
    }

    try {
      const prompt = generatePrompt(isOptimizing);
      
      await streamGenerateContent(prompt, (text) => {
        setResult({
          content: text,
          isOptimizing: false
        });
      });
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Instructions
        what="中醫體質評估系統幫助您了解自身體質特點。"
        why="了解體質類型可以更好地調理身心，預防疾病。"
        how="回答一系列問題，系統會分析您的體質類型並提供個性化建議。評分標準：0 分（無）到 4 分（嚴重）。"
      />

      <div className="space-y-6">
        {questions.map(question => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-lg text-gray-800 mb-4">{question.text}</p>
            <div className="flex items-center justify-between px-4">
              {[0, 1, 2, 3, 4].map(value => (
                <label key={value} className="flex flex-col items-center space-y-2 cursor-pointer group">
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={answers[question.id] === value}
                    onChange={() => handleAnswerChange(question.id, value)}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                    {value}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500 px-2">
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
            disabled={isGenerating || Object.keys(answers).length !== questions.length}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isGenerating && !result?.isOptimizing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-6 w-6" />
                分析中...
              </span>
            ) : (
              '開始分析'
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !result || Object.keys(answers).length !== questions.length}
            className={`flex-1 border py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
              result
                ? 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {result?.isOptimizing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-6 w-6" />
                優化中...
              </span>
            ) : (
              '延續分析並優化'
            )}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-medium text-gray-900 mb-4">體質分析結果</h3>
            <div className="prose prose-blue max-w-none">
              <div className="space-y-4 whitespace-pre-wrap font-mono text-base">
                {typeof result.content === 'string' ? 
                 result.content.split('\n').map((line, i) => (
                   <p key={i}>{line}</p>
                 )) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}