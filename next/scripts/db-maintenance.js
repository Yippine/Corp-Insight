#!/usr/bin/env node

const path = require('path');
// 在所有其他代碼之前加載環境變數，並明確指定 .env.local 的路徑
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const mongoose = require('mongoose');

// 從環境變數讀取 MongoDB 連線 URI
const MONGODB_URI = process.env.MONGODB_URI;

// 如果缺少 URI，則立即拋出錯誤並終止程式
if (!MONGODB_URI) {
  console.error('\x1b[31m❌ 錯誤：找不到 MONGODB_URI 環境變數。\x1b[0m');
  console.error('\x1b[33m請確保在 /next 目錄下有名為 .env.local 的檔案，且其中包含 MONGODB_URI 的設定。\x1b[0m');
  process.exit(1);
}

const CACHE_COLLECTIONS = {
  pcc_api_cache: { days: 1, dateField: 'createdAt' },
  g0v_company_api_cache: { days: 1, dateField: 'createdAt' },
  twincn_api_cache: { days: 1, dateField: 'createdAt' },
};

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function cleanCollection(collectionName, days, dateField) {
  console.log(
    `  -> 正在清理 ${colorize(collectionName, 'yellow')} 中超過 ${colorize(String(days), 'cyan')} 天的資料...`
  );
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const db = mongoose.connection;
    const result = await db.collection(collectionName).deleteMany({
      [dateField]: { $lt: cutoffDate },
    });

    console.log(
      `     ${colorize('完成', 'green')}: 刪除了 ${colorize(
        String(result.deletedCount),
        'green'
      )} 筆記錄。`
    );
    return result.deletedCount;
  } catch (error) {
    console.error(
      `     ${colorize('錯誤', 'red')}: 清理 ${collectionName} 失敗: ${error.message}`
    );
    return 0;
  }
}

async function main() {
  console.log(colorize('\n🔧 MongoDB 資料庫維護工具', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const args = process.argv.slice(2);
  const scopeArg = args.find(arg => arg.startsWith('--scope='));
  const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

  let totalDeleted = 0;

  try {
    // 使用從 .env.local 讀取的 URI 進行連線
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(colorize('✅ 資料庫連接成功', 'green'));

    if (scope === 'cache' || scope === 'all') {
      console.log(colorize('\n🧹 開始清理快取 (Caches)...', 'blue'));
      for (const [name, config] of Object.entries(CACHE_COLLECTIONS)) {
        totalDeleted += await cleanCollection(name, config.days, config.dateField);
      }
    } else {
      console.log(colorize(`\n⚠️  無效的 scope: "${scope}"。只接受 'cache' 或 'all'。`, 'yellow'));
    }

    console.log(colorize('\n🎉 維護作業完成！', 'bright'));
    console.log(
      colorize(`📊 總共清理了 ${String(totalDeleted)} 筆過期記錄。`, 'green')
    );
  } catch (error) {
    console.error(colorize(`\n❌ 維護失敗: ${error.message}`, 'red'));
  } finally {
    await mongoose.disconnect();
    console.log(colorize('\n🔌 資料庫連接已關閉', 'blue'));
  }
}

main();