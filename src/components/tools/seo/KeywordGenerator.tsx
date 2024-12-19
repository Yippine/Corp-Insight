import { useState } from 'react';
import Instructions from '../Instructions';
import { Loader2 } from 'lucide-react';
import { searchIntents, competitionLevels } from '../../../config/gemini';
import { streamGenerateContent } from '../../../lib/gemini';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function KeywordGenerator() {
  const [mainKeyword, setMainKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [searchIntent, setSearchIntent] = useState<string>(searchIntents[0].id);
  const [competition, setCompetition] = useState<string>(competitionLevels[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return '';

    const selectedIntent = searchIntents.find(i => i.id === searchIntent)?.name;
    const selectedCompetition = competitionLevels.find(c => c.id === competition)?.name;

    const basePrompt = `你是一位專業的SEO關鍵字研究專家。
${isOptimizing ? '請基於以下現有關鍵字進行優化：\n' + result?.content + '\n\n以及參考以下資訊：\n' : ''}
請根據以下輸入：
主要關鍵字：${mainKeyword}
產業領域：${industry}
搜尋意圖：${selectedIntent}
競爭程度：${selectedCompetition}

請生成4-6個相關的長尾關鍵字，符合以下標準：
1. 搜尋意圖明確
2. 競爭度較低
3. 具有商業價值
4. 符合使用者搜尋習慣
5. 包含相關修飾詞
6. 考慮地域特性
7. 結合時事熱點
8. 關注使用者痛點

請以下列格式輸出（列舉4-6個）：
關鍵字1：[關鍵字] - 搜尋意圖：[意圖說明]
關鍵字2：[關鍵字] - 搜尋意圖：[意圖說明]
...

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

請以下列語言輸出：
請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。`;

    return basePrompt;
  };

  const handleGenerate = async (isOptimizing: boolean = false) => {
    if (!mainKeyword.trim() || !industry.trim()) return;

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
        what="AI 關鍵字生成器幫助您發掘高價值的長尾關鍵字。"
        why="長尾關鍵字競爭較小，轉化率高，是 SEO 優化的重要策略。"
        how="輸入主要關鍵字和產業資訊，選擇搜尋意圖和競爭程度，AI將生成相關的長尾關鍵字建議。"
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              主要關鍵字 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：人工智慧"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              產業領域 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：教育科技"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                搜尋意圖
              </label>
              <select
                value={searchIntent}
                onChange={(e) => setSearchIntent(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {searchIntents.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                競爭程度
              </label>
              <select
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {competitionLevels.map((option) => (
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
            disabled={isGenerating || !mainKeyword.trim() || !industry.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && !result?.isOptimizing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-6 w-6" />
                生成中...
              </span>
            ) : (
              '生成描述'
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !result || !mainKeyword.trim() || !industry.trim()}
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
              '優化結果'
            )}
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">生成結果</h3>
            <div className="space-y-4 whitespace-pre-wrap font-mono text-base">
              {result.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}