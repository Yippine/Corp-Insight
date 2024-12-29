import { useState } from 'react';
import Instructions from '../Instructions';
import { Loader2 } from 'lucide-react';
import { targetAudiences, contentTypes } from '../../../config/gemini';
import { streamGenerateContent } from '../../../lib/gemini';

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function TitleGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState<string>(targetAudiences[0].id);
  const [contentType, setContentType] = useState<string>(contentTypes[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return '';

    const selectedAudience = targetAudiences.find(a => a.id === audience)?.name;
    const selectedType = contentTypes.find(t => t.id === contentType)?.name;

    const basePrompt = `你是一位專業的SEO標題撰寫專家。
${isOptimizing ? '請基於以下現有標題進行優化：\n' + result?.content + '\n\n以及參考以下資訊：\n' : ''}
請根據以下輸入：
主題：${topic}
關鍵字：${keywords}
目標受眾：${selectedAudience}
文章類型：${selectedType}

生成4-6個符合以下標準的SEO友好標題：
1. 包含主要關鍵字
2. 吸引目標受眾
3. 長度控制在55-60字元
4. 觸發點擊慾望
5. 確保標題簡潔有力
6. 使用數字或具體數據（如適用）
7. 加入情感觸發詞
8. 保持自然且易讀

請以下列格式輸出（列舉4-6個）：
標題1：[標題內容]
標題2：[標題內容]
...

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

請以下列語言輸出：
請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。`;

    return basePrompt;
  };

  const handleGenerate = async (isOptimizing: boolean = false) => {
    if (!topic.trim()) return;

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
        what="AI 標題生成器幫助您快速生成 SEO 友好的標題。"
        why="好的標題能提高點擊率、改善搜尋排名，是內容優化的關鍵。"
        how="輸入主題和關鍵字，選擇目標受眾和文章類型，AI 將生成多個優化的標題供您選擇。"
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              主題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：SEO 優化指南"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              關鍵字（選填）
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：SEO 優化、搜尋引擎優化、網站排名"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                文章類型
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {contentTypes.map((option) => (
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
            disabled={isGenerating || !topic.trim()}
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
            disabled={isGenerating || !result || !topic.trim()}
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