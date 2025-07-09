import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES Module 中，__dirname 並不存在。我們需要用 import.meta.url 來手動實現。
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 參考 test-gemini-key-failover.ts 的方式，載入 .env.local 檔案
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// 輔助函式：解析命令列參數以取得 API 金鑰
function getApiKey() {
  const keyArg = process.argv.find(arg => arg.startsWith('--key='));
  if (keyArg) {
    return keyArg.split('=')[1];
  }

  // 若無參數，則從環境變數中讀取
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY;
  if (apiKey) {
    return apiKey;
  }

  return null;
}

async function validateApiKey() {
  console.log("🚀 正在啟動 Gemini API 金鑰驗證...");
  
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("❌ 錯誤：未提供 API 金鑰。");
    console.log("請使用 --key=YOUR_API_KEY 參數，或在 .env.local 檔案中設定 NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY。");
    process.exit(1);
  }

  console.log(`🔑 正在使用 API Key: ...${apiKey.slice(-4)}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // 更新模型為 Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = "請用一句話簡單自我介紹。";
    
    console.log("🤖 正在向 Gemini API 發送測試請求...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text && text.trim().length > 0) {
      console.log("✅ API 金鑰驗證成功！");
      console.log("💬 Gemini API 回應：");
      console.log("----------------------------------------");
      console.log(text);
      console.log("----------------------------------------");
      console.log("🎉 您的 API 金鑰已準備就緒！");
    } else {
      throw new Error("API 回應為空或無效。");
    }
  } catch (error) {
    console.error("❌ API 金鑰驗證失敗。");
    if (error.message.includes('API key not valid')) {
        console.error("   原因：API 金鑰無效。請檢查您的金鑰是否正確。");
    } else if (error.message.includes('429')) {
        console.error("   原因：請求頻率過高 (Quota Exceeded)。請稍後再試或檢查您的用量限制。");
    } else {
        console.error("   詳細錯誤訊息：", error.message);
    }
    process.exit(1);
  }
}

validateApiKey();