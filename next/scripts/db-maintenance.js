#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// 智慧載入環境變數
// 1. 如果 MONGODB_URI 已由外部環境 (如 Docker) 設定，則直接使用。
// 2. 如果沒有，則根據 NODE_ENV 載入對應的 .env 檔案。
// 3. 這是為了同時兼顧「容器內執行(由 Docker 注入變數)」和「本地終端機執行(需自行讀取 .env)」。
if (!process.env.MONGODB_URI) {
  const envFile =
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
  const envPath = path.resolve(__dirname, '..', envFile);

  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
}

const mongoose = require('mongoose');

// 從環境變數讀取 MongoDB 連線 URI
const MONGODB_URI = process.env.MONGODB_URI;

// 如果缺少 URI，則立即拋出錯誤並終止程式
if (!MONGODB_URI) {
  console.error('\x1b[31m❌ 錯誤：找不到 MONGODB_URI 環境變數。\x1b[0m');
  console.error(
    '\x1b[33m請確保在 /next 目錄下有名為 .env.local 或 .env.production 的檔案，或該變數已由執行環境提供。\x1b[0m'
  );
  process.exit(1);
}

const CACHE_COLLECTIONS = {
  pcc_api_cache: { days: 1, dateField: 'expires_at' },
  g0v_company_api_cache: { days: 1, dateField: 'expires_at' },
  twincn_api_cache: { days: 1, dateField: 'expires_at' },
};

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 為了使用 Mongoose 的模型抽象層，我們定義一個通用的、非嚴格的 Schema。
// 這讓我們可以對任何集合使用 Mongoose 的健壯方法，而無需預先定義其完整結構。
const GenericCacheSchema = new mongoose.Schema({}, { strict: false });

async function cleanCollection(collectionName, days, dateField) {
  console.log(
    `  -> 正在清理 ${colorize(
      collectionName,
      'yellow'
    )} 中超過 ${colorize(String(days), 'cyan')} 天的資料...`
  );
  try {
    const CacheModel =
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, GenericCacheSchema, collectionName);

    // 刪除所有 `expires_at` 早於此刻的文件
    const result = await CacheModel.deleteMany({
      [dateField]: { $lt: new Date() },
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
    // 使用從 .env 讀取的 URI 進行連線，並在連線層級強制寫入確認
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      // 強制此連線上的所有寫入操作都必須等待日誌寫入，確保操作的持久性和回報的準確性
      writeConcern: { j: true },
    });
    console.log(colorize('✅ 資料庫連接成功', 'green'));

    if (scope === 'cache' || scope === 'all') {
      console.log(colorize('\n🧹 開始清理快取 (Caches)...', 'magenta'));
      for (const [name, config] of Object.entries(CACHE_COLLECTIONS)) {
        totalDeleted += await cleanCollection(
          name,
          config.days,
          config.dateField
        );
      }
    } else {
      console.log(
        colorize(
          `\n⚠️  無效的 scope: "${scope}"。只接受 'cache' 或 'all'。`,
          'yellow'
        )
      );
    }

    console.log(colorize('\n🎉 維護作業完成！', 'bright'));
    console.log(
      colorize(`📊 總共清理了 ${String(totalDeleted)} 筆過期記錄。`, 'green')
    );
  } catch (error) {
    console.error(colorize(`\n❌ 維護失敗: ${error.message}`, 'red'));
  } finally {
    await mongoose.disconnect();
    console.log(colorize('\n🔌 資料庫連接已關閉', 'magenta'));
  }
}

main();
