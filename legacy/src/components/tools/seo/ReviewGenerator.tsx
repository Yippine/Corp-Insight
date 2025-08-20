import { useState } from "react";
import Instructions from "../Instructions";
import { productCategories, reviewTypes } from "../../../config/gemini";
import { streamGenerateContent } from "../../../lib/gemini";
import { ButtonLoading } from "../../common/loading";

interface GenerationResult {
  content: string;
  isOptimizing: boolean;
}

export default function ReviewGenerator() {
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [usageScenario, setUsageScenario] = useState("");
  const [category, setCategory] = useState<string>(productCategories[0].id);
  const [reviewType, setReviewType] = useState<string>(reviewTypes[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generatePrompt = (isOptimizing: boolean) => {
    if (isOptimizing && !result?.content) return "";

    const selectedCategory = productCategories.find(
      (c) => c.id === category
    )?.name;
    const selectedType = reviewTypes.find((t) => t.id === reviewType)?.name;

    const basePrompt = `你是一位專業的產品評價撰寫專家。
${isOptimizing ? "請基於以下現有評價進行優化：\n" + result?.content + "\n\n以及參考以下資訊：\n" : ""}
請根據以下輸入：
產品名稱：${productName}
產品特點：${features}
使用場景：${usageScenario}
產品類別：${selectedCategory}
評價類型：${selectedType}

請生成5個真實感的產品評價，符合以下標準：
1. 包含具體使用場景
2. 提及產品特點
3. 描述使用體驗
4. 提供改進建議
5. 突出產品價值
6. 加入數據支持
7. 情感表達真實
8. 符合評價規範

請以下列格式輸出（列舉5個）：
評價1：[評價內容] - 評分：[1-5星]
評價2：[評價內容] - 評分：[1-5星]
...

### CRITICAL WARNING ###
The total output must not exceed 400 Tokens to ensure the content remains engaging and easy to understand. Please adhere to the professional standards within this constraint. Thank you for your attention.

請以下列語言輸出：
請以台灣地區的繁體中文進行回覆，並且適用於台灣道地的字詞和語法。`;

    return basePrompt;
  };

  const handleGenerate = async (isOptimizing: boolean = false) => {
    if (!productName.trim() || !features.trim()) return;

    setIsGenerating(true);
    if (result) {
      setResult({
        ...result,
        isOptimizing: true,
      });
    }

    try {
      const prompt = generatePrompt(isOptimizing);

      await streamGenerateContent(prompt, (text) => {
        setResult({
          content: text,
          isOptimizing: false,
        });
      });
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Instructions
        what="AI 評價生成器幫助您生成真實感的產品評價。"
        why="真實的使用者評價可以增加產品可信度，提升轉換率。"
        how="輸入產品資訊和特點，選擇產品類別和評價類型，AI 將生成相關的產品評價。"
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
              placeholder="例如：智能手錶 Apple Watch Ultra 2"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              產品特點 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：24 小時心率監測、50 米防水、無線充電、智能通知"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              使用場景（選填）
            </label>
            <textarea
              value={usageScenario}
              onChange={(e) => setUsageScenario(e.target.value)}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="例如：運動健身、日常通勤、游泳"
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
                評價類型
              </label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {reviewTypes.map((option) => (
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
            disabled={isGenerating || !productName.trim() || !features.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && !result?.isOptimizing ? (
              <ButtonLoading text="生成中..." />
            ) : (
              "開始新對話"
            )}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={
              isGenerating || !result || !productName.trim() || !features.trim()
            }
            className={`flex-1 border py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              result
                ? "border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
                : "border-gray-300 text-gray-400"
            }`}
          >
            {result?.isOptimizing ? (
              <ButtonLoading text="優化中..." />
            ) : (
              "延續對話並優化"
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
