import { useState } from 'react';
import Instructions from '../Instructions';
import { Loader2 } from 'lucide-react';
import { productCategories, targetAudiences } from '../../../config/gemini';
import { streamGenerateContent } from '../../../lib/gemini';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function FeatureGenerator() {
  const [productName, setProductName] = useState('');
  const [targetProblem, setTargetProblem] = useState('');
  const [uniquePoints, setUniquePoints] = useState('');
  const [techSpecs, setTechSpecs] = useState('');
  const [category, setCategory] = useState<string>(productCategories[0].id);
  const [audience, setAudience] = useState<string>(targetAudiences[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return '';

    const selectedCategory = productCategories.find(c => c.id === category)?.name;
    const selectedAudience = targetAudiences.find(a => a.id === audience)?.name;

    const basePrompt = `你是一位專業的產品功能描述專家。
${isOptimizing ? '請基於以下現有功能描述進行優化：\n' + result?.content + '\n\n以及參考以下資訊：\n' : ''}
請根據以下輸入：
產品名稱：${productName}
目標問題：${targetProblem}
獨特賣點：${uniquePoints}
技術規格：${techSpecs}
產品類別：${selectedCategory}
目標受眾：${selectedAudience}

請生成5個產品功能描述，符合以下標準：
1. 突出核心價值
2. 描述清晰簡潔
3. 強調獨特性
4. 對應使用者需求
5. 包含技術優勢
6. 提供使用場景
7. 突出競爭優勢
8. 易於理解

請以下列格式輸出（列舉5個）：
功能1：[標題]
描述：[詳細說明]
優勢：[主要優勢]

功能2：[標題]
描述：[詳細說明]
優勢：[主要優勢]
...

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

請以下列語言輸出：
請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。`;

    return basePrompt;
  };

  const handleGenerate = async (isOptimizing: boolean = false) => {
    if (!productName.trim() || !targetProblem.trim() || !uniquePoints.trim()) return;

    setIsGenerating(true);
    if (result) {
      setResult({
        ...result,
        isOptimizing: true
      });
    }

    try {
      const prompt = generatePrompt(isOptimizing);
      let generatedContent = '';
      
      await streamGenerateContent(prompt, (text) => {
        generatedContent = text;
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
        what="AI 功能生成器幫助您撰寫專業的產品功能描述。"
        why="優質的功能描述可以突出產品價值，提高轉換率。"
        how="輸入產品資訊和特點，選擇產品類別和目標受眾，AI 將生成相關的功能描述。"
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              產品名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：AI 智能助理"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              目標問題 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={targetProblem}
              onChange={(e) => setTargetProblem(e.target.value)}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：使用者需要更高效的工作流程自動化解決方案"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              獨特賣點 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={uniquePoints}
              onChange={(e) => setUniquePoints(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：整合多種 AI 模型、支援自然語言互動、可自訂工作流程"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              技術規格（選填）
            </label>
            <textarea
              value={techSpecs}
              onChange={(e) => setTechSpecs(e.target.value)}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：支援 o1-preivew、每秒處理 100 筆請求、API 整合支援"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                產品類別
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {productCategories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                目標受眾
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {targetAudiences.map((option) => (
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
            disabled={isGenerating || !productName.trim() || !targetProblem.trim() || !uniquePoints.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && !result?.isOptimizing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-6 w-6" />
                生成中...
              </span>
            ) : (
              '開始新對話'
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !result || !productName.trim() || !targetProblem.trim() || !uniquePoints.trim()}
            className={`flex-1 border py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
              '延續對話並優化'
            )}
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">對話結果</h3>
            <div className="space-y-4 whitespace-pre-wrap font-mono text-base">
              {result.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}