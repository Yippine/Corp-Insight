/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const mongoose = require('mongoose');
const fetch = require('node-fetch');

// --- 資料庫模型定義 (與應用程式保持一致) ---
const ApiKeyStatusSchema = new mongoose.Schema({
  keyIdentifier: { type: String, required: true, unique: true },
  status: { type: String, enum: ['HEALTHY', 'UNHEALTHY'], default: 'HEALTHY' },
  failureCount: { type: Number, default: 0 },
  consecutiveFailures: { type: Number, default: 0 },
  retryAt: { type: Date },
  lastCheckedAt: { type: Date, default: Date.now },
  recentErrors: [{
    errorType: String,
    errorMessage: String,
    timestamp: Date,
  }],
}, {
  collection: 'api_key_statuses' // *** 修正: 明確指定正確的集合名稱 ***
});

const ApiKeyStatus = mongoose.models.ApiKeyStatus || mongoose.model('ApiKeyStatus', ApiKeyStatusSchema);

// --- 環境與配置 ---
const MONGODB_URI = process.env.MONGODB_URI;
const TEST_API_URL = 'http://localhost:3000/api/test-gemini';

const PRIMARY_KEY_ID = 'NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY';
const BACKUP_KEY_ID = 'NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP';

// --- 輔助函式 ---

// ANSI 顏色代碼
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  log('✔ 資料庫已連接', colors.green);
}

async function setKeyStatus(keyIdentifier, status, retryMinutes = 1) {
  const update = {
    keyIdentifier,
    status,
    retryAt: status === 'UNHEALTHY' ? new Date(Date.now() + retryMinutes * 60 * 1000) : null,
    failureCount: status === 'UNHEALTHY' ? 5 : 0,
    consecutiveFailures: status === 'UNHEALTHY' ? 5 : 0,
    lastCheckedAt: new Date(),
  };
  await ApiKeyStatus.findOneAndUpdate({ keyIdentifier }, update, { upsert: true });
  log(`🔧 已將金鑰 ${keyIdentifier} 狀態設定為 ${status}`, colors.yellow);
}

async function callTestApi() {
  try {
    const response = await fetch(TEST_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test' }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    return await response.json();
  } catch (error) {
    log(`❌ API 呼叫時發生錯誤: ${error.message}`, colors.red);
    return null;
  }
}

function assert(condition, message) {
  if (condition) {
    log(`✔ PASSED: ${message}`, colors.green);
  } else {
    log(`❌ FAILED: ${message}`, colors.red);
    process.exit(1); // 測試失敗，退出腳本
  }
}

// --- 測試場景 ---

async function runTests() {
  await connectDB();

  log('\n--- 測試場景 1: 節點排除 ---', colors.cyan);
  log(`1. 將 ${PRIMARY_KEY_ID} 設定為 UNHEALTHY...`);
  await setKeyStatus(PRIMARY_KEY_ID, 'UNHEALTHY');

  log('2. 第一次呼叫 API，預期使用備用金鑰...');
  let result = await callTestApi();
  assert(result && result.usedKey === BACKUP_KEY_ID, `預期使用 ${BACKUP_KEY_ID}，實際使用 ${result?.usedKey}`);

  log('3. 第二次呼叫 API，應輪詢回備用金鑰，並跳過主要金鑰...');
  result = await callTestApi();
  assert(result && result.usedKey === BACKUP_KEY_ID, `預期再次使用 ${BACKUP_KEY_ID}，實際使用 ${result?.usedKey}`);


  log('\n--- 測試場景 2: 節點恢復 ---', colors.cyan);
  log(`1. 將 ${PRIMARY_KEY_ID} 狀態重設為 HEALTHY...`);
  await setKeyStatus(PRIMARY_KEY_ID, 'HEALTHY');

  log('2. 呼叫 API，此時輪詢應從主要金鑰開始...');
  result = await callTestApi();
  // 注意：由於 roundRobinIndex 是全域的，它可能從任何一個開始，但 PRIMARY 應該可用
  assert(result && (result.usedKey === PRIMARY_KEY_ID || result.usedKey === BACKUP_KEY_ID), `預期使用任一健康金鑰，實際使用 ${result?.usedKey}`);
  log(`   (觀察: 使用了 ${result?.usedKey})`);

  // 為了確保兩個都能被輪詢到
  log('3. 再次呼叫 API，應輪詢到另一個金鑰...');
  const firstUsedKey = result.usedKey;
  result = await callTestApi();
  assert(result && result.usedKey !== firstUsedKey, `預期輪詢到下一個不同的金鑰，實際使用 ${result?.usedKey}`);
  log(`   (觀察: 使用了 ${result?.usedKey})`);


  log('\n🎉 所有測試案例均已通過！', colors.green);
  await mongoose.disconnect();
}

runTests().catch(err => {
  log(`🔥 測試執行期間發生嚴重錯誤: ${err}`, colors.red);
  mongoose.disconnect();
  process.exit(1);
});