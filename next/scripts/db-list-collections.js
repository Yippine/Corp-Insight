#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function listCollections() {
  console.log(
    colorize('\n📜 正在列出資料庫中的所有集合...', 'bright')
  );
  console.log(colorize('='.repeat(50), 'cyan'));

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error(
      colorize(
        '❌ 錯誤：未在 .env.local 檔案中定義 MONGODB_URI。',
        'red'
      )
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 秒連線超時
    });
    console.log(colorize('✅ 成功連接至 MongoDB。', 'green'));

    const collections = await mongoose.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log(colorize('📂 資料庫中找不到任何集合。', 'yellow'));
    } else {
      console.log(colorize(`\n📂 找到 ${collections.length} 個集合：`, 'green'));
      collections.forEach(collection => {
        console.log(`  - ${colorize(collection.name, 'yellow')}`);
      });
    }
  } catch (error) {
    console.error(
      colorize(`\n❌ 無法連接至 MongoDB 或列出集合。`, 'red')
    );
    console.error(colorize(`錯誤訊息: ${error.message}`, 'red'));
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(colorize('\n🔌 已關閉與 MongoDB 的連線。', 'green'));
  }
}

listCollections();