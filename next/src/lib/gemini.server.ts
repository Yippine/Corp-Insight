import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from './database/connection';
import ApiKeyStatus, { IApiKeyStatus } from './database/models/ApiKeyStatus';

// 維護一個 API Key 到 GenAI 實例的映射，避免對同一個 Key 重複初始化
const genAIInstances = new Map<string, GoogleGenerativeAI>();

/**
 * 根據環境變數，決定使用哪個金鑰池。
 * 優先使用 GEMINI_ENV_TYPE，若未設定則根據 NODE_ENV 降級相容。
 * @returns {{pool: string[], envType: string}} 一個包含 API 金鑰陣列和當前環境類型的物件。
 */
function getApiKeyPool(): { pool: string[]; envType: string } {
  const envType = process.env.GEMINI_ENV_TYPE || process.env.NODE_ENV;
  let pool: string[] = [];

  switch (envType) {
    case 'batch':
      console.log('[Gemini] 正在使用 [批次環境] 的 API 金鑰池。');
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_PRIMARY) pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_PRIMARY);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_BACKUP) pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_BACKUP);
      break;
    case 'production':
      console.log('[Gemini] 正在使用 [生產環境] 的 API 金鑰池。');
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_PRIMARY) pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_PRIMARY);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_BACKUP) pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_BACKUP);
      break;
    default: // 'development' or any other value
      console.log('[Gemini] 正在使用 [開發環境] 的 API 金鑰池。');
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY) pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP) pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP);
      break;
  }
  // 過濾掉任何可能的空字串或 undefined 值
  return { pool: pool.filter(key => key), envType: envType || 'development' };
}

/**
 * 根據傳入的 API 金鑰字串，反向查找其在 process.env 中的變數名稱。
 * 這對於後續需要使用唯一識別符來操作資料庫中的金鑰狀態至關重要。
 * @param apiKey - 要查找的 API 金鑰值。
 * @returns {string | undefined} 金鑰對應的環境變數名稱，如果找不到則返回 undefined。
 */
function getKeyIdentifier(apiKey: string): string | undefined {
  for (const key in process.env) {
    if (key.startsWith('NEXT_PUBLIC_GEMINI_API_KEY_') && process.env[key] === apiKey) {
      return key;
    }
  }
  return undefined;
}

/**
 * 在 API 呼叫前檢查金鑰的健康狀態。
 * 如果金鑰被標記為 UNHEALTHY 且尚未到達重試時間，則會拋出錯誤以跳過此金鑰。
 * @param keyIdentifier - 金鑰的環境變數名稱。
 */
async function checkKeyState(keyIdentifier: string): Promise<void> {
  await dbConnect();
  const keyStatus = await ApiKeyStatus.findOne({ keyIdentifier }).lean();

  if (keyStatus) {
    console.log(`[CircuitBreaker] 檢查金鑰 ${keyIdentifier} 狀態：${keyStatus.status}, 重試時間：${keyStatus.retryAt}`);
    if (keyStatus.status === 'UNHEALTHY' && keyStatus.retryAt && new Date() < new Date(keyStatus.retryAt)) {
      throw new Error(`金鑰 ${keyIdentifier} 目前處於熔斷狀態，將在 ${keyStatus.retryAt} 後重試。`);
    }
  }
}

/**
 * 非同步地更新金鑰在資料庫中的狀態 (採用 Fire-and-Forget 模式)。
 * @param keyIdentifier - 金鑰的環境變數名稱。
 * @param type - 更新類型：'success' 或 'failure'。
 * @param error - (可選) 如果是失敗類型，傳入的錯誤物件。
 */
function updateKeyState(keyIdentifier: string, type: 'success' | 'failure', error?: unknown): void {
  const update = async () => {
    try {
      await dbConnect();
      const failureThreshold = 3;
      const retryMinutes = 5;

      if (type === 'success') {
        await ApiKeyStatus.findOneAndUpdate(
          { keyIdentifier },
          { 
            $set: { 
              status: 'HEALTHY', 
              failureCount: 0,
              lastCheckedAt: new Date(),
            } 
          },
          { upsert: true, new: true }
        );
      } else if (type === 'failure') {
        const keyStatus = await ApiKeyStatus.findOne({ keyIdentifier });
        const newFailureCount = (keyStatus?.failureCount || 0) + 1;
        
        let errorType = 'UnknownError';
        let errorMessage = 'An unknown error occurred';

        if (error instanceof Error) {
          errorType = error.constructor.name;
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        const updatePayload: Partial<IApiKeyStatus> = {
          failureCount: newFailureCount,
          lastCheckedAt: new Date(),
          recentErrors: [
            ...((keyStatus?.recentErrors || []).slice(-2)), // 保留最近的 2 個
            {
              errorType,
              errorMessage,
              timestamp: new Date(),
            }
          ]
        };

        if (newFailureCount >= failureThreshold) {
          updatePayload.status = 'UNHEALTHY';
          updatePayload.retryAt = new Date(Date.now() + retryMinutes * 60 * 1000);
          console.error(`🚨 [CircuitBreaker] 金鑰 ${keyIdentifier} 連續失敗已達 ${newFailureCount} 次，狀態更新為 UNHEALTHY，將在 ${retryMinutes} 分鐘後重試。`);
        }

        await ApiKeyStatus.findOneAndUpdate(
          { keyIdentifier },
          { $set: updatePayload },
          { upsert: true, new: true }
        );
      }
    } catch (dbError) {
      console.error(`[CircuitBreaker] 更新金鑰 ${keyIdentifier} 狀態時發生資料庫錯誤：`, dbError);
    }
  };

  update().catch(err => console.error('背景狀態更新失敗：', err)); // 確保即使背景任務出錯也不會崩潰主程序
}

/**
 * 根據環境決定金鑰使用策略。
 * 生產環境強制使用 'failover'。
 * 其他環境則遵循 NEXT_PUBLIC_GEMINI_KEY_STRATEGY 的設定，預設為 'failover'。
 * @returns {'failover' | 'round-robin'} 當前應用的金鑰策略。
 */
function getApiKeyStrategy(): 'failover' | 'round-robin' {
  if (process.env.NODE_ENV === 'production') {
    return 'failover';
  }
  const strategy = process.env.NEXT_PUBLIC_GEMINI_KEY_STRATEGY;
  if (strategy === 'round-robin') {
    return 'round-robin';
  }
  return 'failover';
}

/**
 * 根據給定的 API Key 取得或建立一個 GoogleGenerativeAI 實例。
 * @param apiKey - 要使用的 API 金鑰。
 * @returns {GoogleGenerativeAI} Gemini AI 的實例。
 */
function getGenAIInstance(apiKey: string): GoogleGenerativeAI {
  if (!genAIInstances.has(apiKey)) {
    console.log(`[Gemini] 正在為一個新的金鑰初始化 GenAI 實例。`);
    genAIInstances.set(apiKey, new GoogleGenerativeAI(apiKey));
  }
  return genAIInstances.get(apiKey)!;
}

export const isGeminiAvailable = () => getApiKeyPool().pool.length > 0;

// Round-robin 策略的記憶體計數器
let roundRobinIndex = 0;

async function logTokenUsage(result: any) {
  const response = await result.response;

  const tokenUsage = {
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
    totalTokens: response.usageMetadata?.totalTokenCount || 0,
  };

  console.log(`[Gemini] Token 用量: ${JSON.stringify(tokenUsage, null, 2)}`);
}

async function attemptApiCall(
  apiKey: string,
  keyIdentifier: string,
  prompt: string,
  onStream: (text: string) => void,
  shouldLogTokens: boolean
) {
  console.log(`[Gemini] 正在嘗試使用金鑰進行生成: ${keyIdentifier}`);
  const aiInstance = getGenAIInstance(apiKey);
  const model = aiInstance.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContentStream(prompt);

  if (shouldLogTokens) await logTokenUsage(result);
  
  let fullText = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onStream(fullText);
  }
  
  console.log(`[Gemini] 使用金鑰 ${keyIdentifier} 成功生成內容。`);
  return fullText;
}

export async function streamGenerateContent(
  prompt: string,
  onStream: (text: string) => void,
  shouldLogTokens: boolean = false
) {
  const { pool: apiKeyPool, envType } = getApiKeyPool();
  const strategy = getApiKeyStrategy();

  if (apiKeyPool.length === 0) {
    console.error(`[Gemini] 在 '${envType}' 環境中找不到任何已設定的 API 金鑰。AI 功能將被停用。`);
    const errorMessage = '無法初始化 AI 功能，請檢查對應環境的 API 金鑰設定。';
    onStream(errorMessage);
    return;
  }

  console.log(`[Gemini] 當前金鑰策略: ${strategy.toUpperCase()}`);

  let lastError: any = null;

  // 根據策略執行不同的金鑰處理邏輯
  if (strategy === 'round-robin') {
    // Round-Robin 邏輯: 嘗試所有 key，從上次的位置開始
    const startIndex = roundRobinIndex % apiKeyPool.length;
    for (let i = 0; i < apiKeyPool.length; i++) {
      const currentIndex = (startIndex + i) % apiKeyPool.length;
      const apiKey = apiKeyPool[currentIndex];
      // 更新全域索引，以便下次從下一個 key 開始
      roundRobinIndex = currentIndex + 1;
      
      const keyIdentifier = `[${envType.toUpperCase()}_RR_${currentIndex}]`;
      try {
        const result = await attemptApiCall(apiKey, keyIdentifier, prompt, onStream, shouldLogTokens);
        return result; // 成功後立即返回
      } catch (error) {
        lastError = error; // 記錄錯誤
        const isRetriable = isRetriableError(error);
        if (isRetriable && i < apiKeyPool.length - 1) {
          console.warn(`🚨 [Gemini] 金鑰 ${keyIdentifier} 發生可重試錯誤。輪詢至下一個金鑰...`);
          continue;
        }
        // 如果是不可重試的錯誤，或所有金鑰都已嘗試失敗，則跳出迴圈
        break;
      }
    }
  } else {
    // Failover 邏輯 (整合斷路器)
    for (let i = 0; i < apiKeyPool.length; i++) {
      const apiKey = apiKeyPool[i];
      const keyIdentifier = getKeyIdentifier(apiKey);
      
      if (!keyIdentifier) {
        console.warn(`[Gemini] 警告：無法為一個 API 金鑰找到對應的環境變數名稱，將跳過此金鑰。`);
        continue;
      }

      const keyRole = i === 0 ? '主要' : '備用';
      const logIdentifier = `[${envType.toUpperCase()}_${keyRole}]`;

      try {
        // 1. 呼叫前檢查狀態
        await checkKeyState(keyIdentifier);

        const result = await attemptApiCall(apiKey, logIdentifier, prompt, onStream, shouldLogTokens);
        
        // 2. 成功後更新狀態
        updateKeyState(keyIdentifier, 'success');
        
        return result; // 成功後立即返回
      } catch (error: unknown) {
        lastError = error;
        
        // 檢查是否是斷路器跳過的錯誤
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('處於熔斷狀態')) {
            console.warn(`[CircuitBreaker] ${errorMessage}`);
            continue; // 繼續嘗試下一個金鑰
        }

        // 3. 失敗後更新狀態
        updateKeyState(keyIdentifier, 'failure', error);
        
        const isRetriable = isRetriableError(error);
        if (isRetriable && i < apiKeyPool.length - 1) {
          console.warn(`🚨 [Gemini] 金鑰 ${logIdentifier} 發生可重試錯誤。正在啟動容錯移轉至備用金鑰...`);
          continue;
        }
        // 如果是不可重試的錯誤，或所有金鑰都已嘗試失敗，則跳出迴圈
        break;
      }
    }
  }

  // 統一處理最終的失敗情況
  console.error(`[Gemini] 所有金鑰嘗試均失敗。最後一個錯誤:`, lastError?.message || lastError?.toString());
  const errorMessage = `[系統訊息] 所有 AI 服務金鑰皆暫時無法使用，請稍後再試或聯繫管理員。`;
  onStream(errorMessage);
  if (lastError) {
    throw lastError;
  }
}

/**
 * 判斷一個 API 錯誤是否值得重試。
 * 這包括：配額問題、認證金鑰問題、以及一般網路請求失敗。
 * 我們不重試由使用者輸入錯誤導致的 400 Bad Request 等問題。
 */
function isRetriableError(error: any): boolean {
  const errString = (error.toString() + (error.message || '')).toLowerCase();
  return (
    // 1. 配額錯誤
    errString.includes('429') || // Too Many Requests
    errString.includes('quota') ||
    errString.includes('resource exhausted') ||
    // 2. 認證/權限錯誤 (偽造金鑰會觸發)
    errString.includes('401') || // Unauthorized
    errString.includes('403') || // Forbidden
    errString.includes('permission') ||
    errString.includes('api key not valid') ||
    // 3. 測試中觀察到的一般網路/請求失敗錯誤
    errString.includes('fetch failed')
  );
}
