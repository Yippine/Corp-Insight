import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from './database/connection';
import ApiKeyStatus, { IApiKeyStatus } from './database/models/ApiKeyStatus';
import { AIToolModel } from './database/models/AITool';
import fs from 'fs/promises';
import path from 'path';

// 斷路器與指數退避策略設定
const MAX_BACKOFF_MINUTES = 120; // 最長冷凍時間 (分鐘) - 根據分析調整為一個更合理的中期值
// 從環境變數讀取每日失敗次數上限，若未設定則預設為 10
const DAILY_FAILURE_THRESHOLD = parseInt(
  process.env.GEMINI_DAILY_FAILURE_THRESHOLD || '10',
  10
);

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
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_PRIMARY)
        pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_PRIMARY);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_BACKUP)
        pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_BATCH_BACKUP);
      break;
    case 'production':
      console.log('[Gemini] 正在使用 [生產環境] 的 API 金鑰池。');
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_PRIMARY)
        pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_PRIMARY);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_BACKUP)
        pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_PROD_BACKUP);
      break;
    default: // 'development' or any other value
      console.log('[Gemini] 正在使用 [開發環境] 的 API 金鑰池。');
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY)
        pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP)
        pool.push(process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP);
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
    if (
      key.startsWith('NEXT_PUBLIC_GEMINI_API_KEY_') &&
      process.env[key] === apiKey
    ) {
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
    console.log(
      `[CircuitBreaker] 檢查金鑰 ${keyIdentifier} 狀態：${keyStatus.status}, 重試時間：${keyStatus.retryAt}`
    );
    if (
      keyStatus.status === 'UNHEALTHY' &&
      keyStatus.retryAt &&
      new Date() < new Date(keyStatus.retryAt)
    ) {
      throw new Error(
        `金鑰 ${keyIdentifier} 目前處於熔斷狀態，將在 ${keyStatus.retryAt} 後重試。`
      );
    }
  }
}

/**
 * 非同步地更新金鑰在資料庫中的狀態 (採用 Fire-and-Forget 模式)。
 * @param keyIdentifier - 金鑰的環境變數名稱。
 * @param type - 更新類型：'success' 或 'failure'。
 * @param error - (可選) 如果是失敗類型，傳入的錯誤物件。
 */
export async function updateKeyState(
  keyIdentifier: string,
  type: 'success' | 'failure',
  error?: unknown
): Promise<void> {
  try {
    await dbConnect();

    if (type === 'success') {
      const keyStatus = await ApiKeyStatus.findOne({ keyIdentifier });
      if (keyStatus && keyStatus.status === 'UNHEALTHY') {
        console.log(
          `[CircuitBreaker] 金鑰 ${keyIdentifier} 在重試後成功，狀態恢復為 HEALTHY。`
        );
      }
      await ApiKeyStatus.findOneAndUpdate(
        { keyIdentifier },
        {
          $set: {
            status: 'HEALTHY',
            failureCount: 0,
            // 注意：成功的請求不會重置 dailyFailureCount，它只由每日排程重置
            lastCheckedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    } else if (type === 'failure') {
      const keyStatus = await ApiKeyStatus.findOne({ keyIdentifier });

      // 更新失敗計數器
      const newFailureCount = (keyStatus?.failureCount || 0) + 1;
      const newDailyFailureCount = (keyStatus?.dailyFailureCount || 0) + 1;

      let errorType = 'UnknownError';
      let errorMessage = 'An unknown error occurred';

      if (error instanceof Error) {
        errorType = error.constructor.name;
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      let finalCooldownMs: number;
      let cooldownReason: string;

      // Phase 6: 智慧熔斷層 (RPD 每日配額)
      if (newDailyFailureCount > DAILY_FAILURE_THRESHOLD) {
        // 計算到下一個太平洋時間 (PT) 午夜的時間
        const now = new Date();
        const targetTimezone = 'America/Los_Angeles';

        // 1. 取得在目標時區的 "現在" 是什麼樣子
        const nowInTargetTimezone = new Date(
          now.toLocaleString('en-US', { timeZone: targetTimezone })
        );

        // 2. 建立一個代表目標時區 "今天午夜" 的物件
        const todayMidnightInTargetTimezone = new Date(nowInTargetTimezone);
        todayMidnightInTargetTimezone.setHours(0, 0, 0, 0);

        // 3. 計算下一個午夜的時間戳
        let nextMidnightTimestamp = todayMidnightInTargetTimezone.getTime();
        if (
          nowInTargetTimezone.getTime() >=
          todayMidnightInTargetTimezone.getTime()
        ) {
          // 如果已經過了今天的午夜，就加 24 小時
          nextMidnightTimestamp += 24 * 60 * 60 * 1000;
        }

        finalCooldownMs = nextMidnightTimestamp - nowInTargetTimezone.getTime();
        cooldownReason = `RPD (每日配額) 耗盡`;
      } else {
        // Phase 5: 指數退避策略 (臨時錯誤)
        const ONE_MINUTE_MS = 60 * 1000;
        let cooldownMs;

        if (newFailureCount === 1) {
          // 首次失敗，給予一個較短的基礎冷凍期
          cooldownMs = ONE_MINUTE_MS;
        } else {
          // 從第二次失敗開始，指數增長
          const basePeriodMs = 2 * ONE_MINUTE_MS;
          const growthFactor = Math.pow(2, newFailureCount - 2);
          cooldownMs = basePeriodMs * growthFactor;
        }

        // 加入最多 10% 的隨機抖動
        const jitter = Math.random() * 0.1 * cooldownMs;
        finalCooldownMs = Math.min(
          cooldownMs + jitter,
          MAX_BACKOFF_MINUTES * ONE_MINUTE_MS
        );
        cooldownReason = `指數退避`;
      }

      const finalCooldownMinutes = finalCooldownMs / (60 * 1000);

      const updatePayload: Partial<IApiKeyStatus> = {
        failureCount: newFailureCount,
        dailyFailureCount: newDailyFailureCount,
        lastCheckedAt: new Date(),
        status: 'UNHEALTHY', // 只要失敗就標記為不健康，並設定退避
        retryAt: new Date(Date.now() + finalCooldownMs),
        recentErrors: [
          ...(keyStatus?.recentErrors || []).slice(-2),
          {
            errorType,
            errorMessage,
            timestamp: new Date(),
          },
        ],
      };

      console.error(
        `🚨 [CircuitBreaker] 金鑰 ${keyIdentifier} 失敗，連續失敗次數: ${newFailureCount}, 每日失敗: ${newDailyFailureCount}。原因: ${cooldownReason}。狀態更新為 UNHEALTHY，將在 ${finalCooldownMinutes.toFixed(2)} 分鐘後重試。`
      );

      await ApiKeyStatus.findOneAndUpdate(
        { keyIdentifier },
        { $set: updatePayload },
        { upsert: true, new: true }
      );
    }
  } catch (dbError) {
    console.error(
      `[CircuitBreaker] 更新金鑰 ${keyIdentifier} 狀態時發生資料庫錯誤：`,
      dbError
    );
  }
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

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      onStream(chunkText);
    }
  }

  // 將 Token 用量記錄移至串流處理完成之後，避免阻塞串流本身
  if (shouldLogTokens) {
    await logTokenUsage(result);
  }

  console.log(`[Gemini] 使用金鑰 ${keyIdentifier} 成功生成內容。`);
}

export async function streamGenerateContent(
  prompt: string,
  onStream: (text: string) => void,
  shouldLogTokens: boolean = false
) {
  const { pool: apiKeyPool, envType } = getApiKeyPool();
  const strategy = getApiKeyStrategy();

  if (apiKeyPool.length === 0) {
    console.error(
      `[Gemini] 在 '${envType}' 環境中找不到任何已設定的 API 金鑰。AI 功能將被停用。`
    );
    const errorMessage = '無法初始化 AI 功能，請檢查對應環境的 API 金鑰設定。';
    onStream(errorMessage);
    return;
  }

  console.log(`[Gemini] 當前金鑰策略: ${strategy.toUpperCase()}`);

  let lastError: any = null;

  if (strategy === 'round-robin') {
    await dbConnect();
    const keyStatusesFromDB = await ApiKeyStatus.find({
      keyIdentifier: {
        $in: apiKeyPool
          .map(k => getKeyIdentifier(k))
          .filter(Boolean) as string[],
      },
    }).lean();

    const keyStatusMap = new Map(
      keyStatusesFromDB.map(s => [s.keyIdentifier, s])
    );

    const healthyKeys = apiKeyPool.filter(apiKey => {
      const keyIdentifier = getKeyIdentifier(apiKey);
      if (!keyIdentifier) return false;

      const status = keyStatusMap.get(keyIdentifier);
      if (!status) return true; // DB 無記錄，視為健康

      const isUnhealthyAndCoolingDown =
        status.status === 'UNHEALTHY' &&
        status.retryAt &&
        new Date() < new Date(status.retryAt);

      return !isUnhealthyAndCoolingDown;
    });

    if (healthyKeys.length === 0) {
      console.error('[RoundRobin] 錯誤：金鑰池中已無任何健康的金鑰可供使用。');
      onStream('所有 AI 服務節點暫時過載，請稍後再試。');
      return;
    }

    console.log(
      `[RoundRobin] 發現 ${healthyKeys.length} 個健康金鑰，準備輪詢。`
    );

    const totalHealthyKeys = healthyKeys.length;
    // 確保索引不會超出健康金鑰池的範圍
    roundRobinIndex = roundRobinIndex % totalHealthyKeys;

    for (let i = 0; i < totalHealthyKeys; i++) {
      const currentIndex = (roundRobinIndex + i) % totalHealthyKeys;
      const apiKey = healthyKeys[currentIndex];
      const keyIdentifier = getKeyIdentifier(apiKey)!;

      try {
        await attemptApiCall(
          apiKey,
          keyIdentifier,
          prompt,
          onStream,
          shouldLogTokens
        );
        roundRobinIndex = (currentIndex + 1) % totalHealthyKeys; // 更新索引
        await updateKeyState(keyIdentifier, 'success'); // 成功後更新狀態
        return; // 成功後立即返回
      } catch (error: any) {
        console.error(
          `[RoundRobin] 使用金鑰 ${keyIdentifier} 呼叫 API 時發生錯誤:`,
          error
        );
        lastError = error;
        await updateKeyState(keyIdentifier, 'failure', error);
        // 繼續迴圈以嘗試下一個健康的金鑰
      }
    }
  } else {
    // Failover 邏輯 (整合斷路器)
    for (let i = 0; i < apiKeyPool.length; i++) {
      const apiKey = apiKeyPool[i];
      const keyIdentifier = getKeyIdentifier(apiKey);

      if (!keyIdentifier) {
        console.warn(
          `[Gemini] 警告：無法為一個 API 金鑰找到對應的環境變數名稱，將跳過此金鑰。`
        );
        continue;
      }

      const keyRole = i === 0 ? '主要' : '備用';
      console.log(`[Failover] 正在準備嘗試 ${keyRole} 金鑰: ${keyIdentifier}`);

      try {
        // 1. 呼叫前檢查狀態
        await checkKeyState(keyIdentifier);

        const result = await attemptApiCall(
          apiKey,
          keyIdentifier,
          prompt,
          onStream,
          shouldLogTokens
        );

        // 2. 成功後更新狀態
        await updateKeyState(keyIdentifier, 'success');

        return result; // 成功後立即返回
      } catch (error: unknown) {
        lastError = error;

        // 檢查是否是斷路器跳過的錯誤
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('處於熔斷狀態')) {
          console.warn(`[CircuitBreaker] ${errorMessage}`);
          continue; // 繼續嘗試下一個金鑰
        }

        // 3. 失敗後更新狀態
        await updateKeyState(keyIdentifier, 'failure', error);

        const isRetriable = isRetriableError(error);
        if (isRetriable && i < apiKeyPool.length - 1) {
          console.warn(
            `🚨 [Gemini] 金鑰 ${keyIdentifier} 發生可重試錯誤。正在啟動容錯移轉至備用金鑰...`
          );
          continue;
        }
        // 如果是不可重試的錯誤，或所有金鑰都已嘗試失敗，則跳出迴圈
        break;
      }
    }

    console.error(
      `[Gemini] 所有金鑰嘗試均失敗。最後一個錯誤:`,
      lastError?.message || lastError?.toString()
    );
    const errorMessage = `[系統訊息] 所有 AI 服務金鑰皆暫時無法使用，請稍後再試或聯繫管理員。`;
    onStream(errorMessage);
    if (lastError) {
      throw lastError;
    }
  }
}

/**
 * [新增] 專為提示詞優化器設計的非串流生成函式。
 * 整合了元提示詞讀取、資料庫查詢、超級提示詞組合，並複用金鑰池策略。
 * @returns {Promise<string>} 優化後的純文字提示詞。
 */
export async function generateOptimizedPrompt(
  type: 'system' | 'prefix' | 'suffix',
  currentPromptData: any,
  philosophy: string,
  framework: string,
  toolId: string
): Promise<string> {
  // 1. 讀取元提示詞
  const isSystemPrompt = type === 'system';
  let fileName;
  if (isSystemPrompt) {
    fileName = 'system-optimizer.md';
  } else if (type === 'prefix') {
    fileName = 'prefix-optimizer.md';
  } else { // type === 'suffix'
    fileName = 'suffix-optimizer.md';
  }
  const filePath = path.join(process.cwd(), 'src', 'data', 'meta-prompts', fileName);
  const metaPromptTemplate = await fs.readFile(filePath, 'utf-8');

  // 2. 查詢資料庫
  const tool = await AIToolModel.getById(toolId);
  if (!tool) {
    throw new Error(`Tool with ID ${toolId} not found.`);
  }

  // 3. 組合超級提示詞
  let current_prompt = '';
  let target = type;
  if (isSystemPrompt) {
    current_prompt = currentPromptData.currentContent;
  } else {
    current_prompt = `// Prefix\n${currentPromptData.prefix}\n\n// Suffix\n${currentPromptData.suffix}`;
    target = currentPromptData.target;
  }
  const variables =
    tool.promptTemplate?.prefix.match(/\$\{[^}]+\}/g)?.join(', ') || '無';

  // 輔助函式：替換模板變數
  const replacePlaceholders = (
    template: string,
    replacements: Record<string, any>
  ): string => {
    let result = template;
    for (const key in replacements) {
      const value =
        typeof replacements[key] === 'object'
          ? JSON.stringify(replacements[key], null, 2)
          : String(replacements[key]);
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  };

  const replacements = {
    'tool.id': tool.id,
    'tool.name': tool.name,
    'tool.description': tool.description,
    'tool.instructions.what': tool.instructions?.what || '',
    'tool.instructions.why': tool.instructions?.why || '',
    'tool.instructions.how': tool.instructions?.how || '',
    'current_prompt': current_prompt,
    'chosen_philosophy': philosophy,
    'chosen_framework': framework,
    'variables': variables,
    'target': target,
  };

  const finalPrompt = replacePlaceholders(metaPromptTemplate, replacements);

  // 根據使用者需求，列印最終發送給 Gemini 的完整提示詞
  console.log('🚀 --- [Prompt Optimizer] 最終發送的超級提示詞 --- 🚀');
  console.log(finalPrompt);
  console.log('----------------------------------------------------');

  // 4. 複用金鑰池和斷路器進行非串流生成
  const { pool: apiKeyPool, envType } = getApiKeyPool();
  if (apiKeyPool.length === 0) {
    throw new Error(`在 '${envType}' 環境中找不到任何已設定的 API 金鑰。`);
  }

  // 內部非同步函式，用於單次 API 呼叫
  const attemptNonStreamApiCall = async (
    apiKey: string,
    keyIdentifier: string
  ): Promise<string> => {
    console.log(
      `[Gemini Optimizer] 正在嘗試使用金鑰進行生成：${keyIdentifier}`
    );
    const aiInstance = getGenAIInstance(apiKey);
    const model = aiInstance.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
    });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    console.log(`[Gemini Optimizer] 使用金鑰 ${keyIdentifier} 成功生成內容。`);
    return text;
  };

  // 這裡我們直接複用 failover 邏輯，因為優化請求是一次性的關鍵操作
  let lastError: any = null;
  for (let i = 0; i < apiKeyPool.length; i++) {
    const apiKey = apiKeyPool[i];
    const keyIdentifier = getKeyIdentifier(apiKey);
    if (!keyIdentifier) continue;

    try {
      await checkKeyState(keyIdentifier);
      const resultText = await attemptNonStreamApiCall(apiKey, keyIdentifier);
      await updateKeyState(keyIdentifier, 'success');
      return resultText;
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('處於熔斷狀態')) {
        console.warn(`[CircuitBreaker] ${errorMessage}`);
        continue;
      }
      await updateKeyState(keyIdentifier, 'failure', error);
      if (isRetriableError(error) && i < apiKeyPool.length - 1) {
        console.warn(
          `🚨 [Gemini Optimizer] 金鑰 ${keyIdentifier} 發生可重試錯誤。正在啟動容錯移轉...`
        );
        continue;
      }
      break;
    }
  }

  console.error(
    `[Gemini Optimizer] 所有金鑰嘗試均失敗。最後一個錯誤：`,
    lastError
  );
  throw new Error('所有 AI 服務金鑰皆暫時無法使用，請稍後再試。');
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
