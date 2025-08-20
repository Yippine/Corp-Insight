// next/scripts/test-gemini-key-failover.ts
import path from 'path';
// 使用 dotenv 從指定的 .env.local 檔案載入環境變數
import dotenv from 'dotenv';
// [修正] 將路徑從 ../../.env.local 改為 ../.env.local，以正確指向 next/.env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

// 使用 @/ 絕對路徑，ts-node 會透過 tsconfig.json 自動解析
import { streamGenerateContent } from '@/lib/gemini.server';

const TEST_PROMPT = '你好，請做個自我介紹';

async function testFailoverStrategy() {
  console.log('--- 🧪 開始測試 Failover 策略 ---');

  // 覆寫環境變數，模擬主 Key 失效
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY = 'FAKE_KEY_FOR_TESTING';
  const realBackupKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP;

  if (!realBackupKey) {
    console.error(
      '❌ 測試失敗：找不到備用金鑰 (NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP)，無法進行測試。'
    );
    return;
  }

  console.log('1. 模擬主 Key 失效，預期會自動切換至備用 Key...');

  let output = '';
  try {
    await streamGenerateContent(TEST_PROMPT, text => {
      // 在 stream 過程中僅更新變數，不印出日誌
      output = text;
    });
    console.log('\n[完整回應]', output);
    console.log('✅ 測試成功：Failover 機制成功切換到備用金鑰並生成內容。');
  } catch (error) {
    console.error(
      '\n❌ 測試失敗：即使有備用金鑰，Failover 策略依然執行失敗。',
      error
    );
  }
}

async function testRoundRobinStrategy() {
  console.log('--- 🧪 開始測試 Round-Robin 策略 ---');

  const key1 = process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY;
  const key2 = process.env.NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP;

  if (!key1 || !key2) {
    console.error(
      '❌ 測試失敗：需要設定 NEXT_PUBLIC_GEMINI_API_KEY_DEV_PRIMARY 和 NEXT_PUBLIC_GEMINI_API_KEY_DEV_BACKUP 才能進行輪詢測試。'
    );
    return;
  }

  console.log('1. 連續發起 4 次請求，預期金鑰會輪流使用 (0 -> 1 -> 0 -> 1)...');

  for (let i = 0; i < 4; i++) {
    console.log(`\n--- 第 ${i + 1} 次請求 ---`);
    let output = '';
    try {
      await streamGenerateContent(TEST_PROMPT, text => {
        // 在 stream 過程中僅更新變數，不印出日誌
        output = text;
      });
      console.log('[完整回應]', output);
      console.log(`✅ 第 ${i + 1} 次請求成功。`);
    } catch (error) {
      console.error(`\n❌ 第 ${i + 1} 次請求失敗。`, error);
      break; // 如果有一次請求失敗，就停止測試
    }
  }
  console.log(
    '\n✅ 測試完成：請檢查上方日誌，確認 "正在嘗試使用金鑰" 的標示符是否在 [DEV_RR_0] 和 [DEV_RR_1] 之間輪換。'
  );
}

async function main() {
  const args = process.argv.slice(2);
  const strategyArg = args.find(arg => arg.startsWith('--strategy='));
  const strategy = strategyArg ? strategyArg.split('=')[1] : 'failover';

  // 設置策略環境變數
  process.env.NEXT_PUBLIC_GEMINI_KEY_STRATEGY = strategy;

  if (strategy === 'round-robin') {
    await testRoundRobinStrategy();
  } else {
    await testFailoverStrategy();
  }
}

main().catch(console.error);
