#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 讀取 .env.local 檔案
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\x1b[31m❌ 錯誤：找不到 MONGODB_URI 環境變數。\x1b[0m');
  console.error('\x1b[33m請確保在 /next 目錄下有名為 .env.local 的檔案，且其中包含 MONGODB_URI 的設定。\x1b[0m');
  process.exit(1);
}

console.log('🔌 正在使用 .env.local 中的連線字串啟動 mongosh...');
console.log('==================================================');

try {
  // 使用 spawn 來執行 mongosh，並傳入 URI
  // stdio: 'inherit' 會將子進程的 I/O 直接連接到父進程
  const mongosh = spawn('mongosh', [MONGODB_URI], {
    stdio: 'inherit',
    shell: true // 在 Windows 上，這有助於正確找到 PATH 中的 mongosh
  });

  mongosh.on('error', (err) => {
    console.error('\x1b[31m❌ 啟動 mongosh 失敗。\x1b[0m');
    console.error(`錯誤訊息: ${err.message}`);
    console.error('\x1b[33m請確保您已經安裝了 MongoDB Shell (mongosh) 並且它在系統的 PATH 環境變數中。\x1b[0m');
  });

} catch (error) {
  console.error(`發生未知錯誤: ${error.message}`);
}