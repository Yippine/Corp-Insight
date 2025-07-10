import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 使用 dotenv 從指定的 .env.local 檔案載入環境變數
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

// 使用 @/ 絕對路徑，ts-node 會透過 tsconfig.json 自動解析
import ApiKeyStatus from '@/lib/database/models/ApiKeyStatus';

const MONGO_URI = process.env.MONGODB_URI;

async function resetApiKeyStats() {
  console.log('🔑 [Cron-Reset-Keys] 開始執行每日 API 金鑰狀態重置任務...');

  if (!MONGO_URI) {
    console.error('❌ [Cron-Reset-Keys] 錯誤：未找到 MONGODB_URI 環境變數。');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🟢 [Cron-Reset-Keys] 成功連接到 MongoDB。');

    const result = await ApiKeyStatus.updateMany(
      {}, // 空 filter 表示更新所有文件
      {
        $set: {
          failureCount: 0,
          dailyFailureCount: 0,
          status: 'HEALTHY',
        },
        $unset: {
          retryAt: "", // 移除 retryAt 欄位，使其恢復預設狀態
        }
      }
    );

    console.log(`✅ [Cron-Reset-Keys] 重置完成。成功更新 ${result.modifiedCount} 個金鑰狀態。`);

  } catch (error) {
    console.error('❌ [Cron-Reset-Keys] 執行重置任務時發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 [Cron-Reset-Keys] 與 MongoDB 的連線已關閉。');
  }
}

// 為了與 sitemap-monitor.js 的模式保持一致，我們也使用一個無限循環和定時器
async function runDaily() {
  const CRON_SCHEDULE_MS = 24 * 60 * 60 * 1000; // 24 小時
  while (true) {
    await resetApiKeyStats();
    console.log(`🕒 [Cron-Reset-Keys] 下一次重置將在 24 小時後執行...`);
    await new Promise(resolve => setTimeout(resolve, CRON_SCHEDULE_MS));
  }
}

// 啟動任務
runDaily().catch(console.error);