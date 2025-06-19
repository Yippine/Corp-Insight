#!/usr/bin/env node
/**
 * Business Magnifier MongoDB Connection Test Script
 * 
 * 執行方式: node scripts/db-connect.js
 * 注意: 此腳本預期環境變數 `MONGODB_URI` 已由 Docker Compose 或其他方式注入。
 */

const mongoose = require('mongoose');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function testConnection() {
  console.log(colorize('\n🛰️  正在測試與 MongoDB 的連線...', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error(colorize('❌ 錯誤: 在環境中找不到 MONGODB_URI 變數。', 'red'));
    console.error(colorize('💡 提示: 請確保 Docker 容器已透過 .env.local 檔案正確啟動。', 'red'));
    process.exit(1);
  }

  try {
    console.log(`📡 嘗試連線至: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(colorize('✅ 連線成功！MongoDB is ready.', 'green'));
  } catch (error) {
    console.error(colorize('\n❌ 連線失敗。', 'red'));
    console.error(colorize(`   錯誤訊息: ${error.message}`, 'red'));
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(colorize('\n🔌 連線已關閉。', 'cyan'));
  }
}

testConnection();