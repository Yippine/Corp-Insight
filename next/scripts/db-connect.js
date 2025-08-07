#!/usr/bin/env node
/**
 * Corp Insight MongoDB Connection Test Script
 *
 * 執行方式: node scripts/db-connect.js
 * 注意: 此腳本預期環境變數 `MONGODB_URI` 已由 Docker Compose 或其他方式注入。
 */

const { exec } = require('child_process');
const mongoose = require('mongoose');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

/**
 * 核心連線測試邏輯
 * 這段程式碼只負責一件事：測試 Mongoose 連線。
 */
async function testMongoConnection() {
  console.log(colorize('\n🛰️  正在測試與 MongoDB 的連線...', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error(colorize('❌ 錯誤: 環境中找不到 MONGODB_URI。', 'red'));
    process.exit(1);
  }

  try {
    console.log(
      `📡 嘗試連線至: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`
    );
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(colorize('✅ 連線成功！MongoDB is ready.', 'green'));
  } catch (error) {
    console.error(colorize('\n❌ 連線失敗: ' + error.message, 'red'));
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(colorize('\n🔌 連線已關閉。', 'cyan'));
  }
}

/**
 * 主機執行邏輯 (智慧調度員)
 * 負責偵測環境並呼叫核心測試邏輯。
 */
async function hostDispatch() {
  console.log(colorize('💻 偵測到在主機 (Host) 執行...', 'yellow'));

  // 動態偵測正在運行的 app-dev 或 app-prod 容器
  const findContainerCommand = `docker ps --filter "name=app-" --format "{{.Names}}"`;

  exec(findContainerCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(colorize(`\n❌ 偵測 Docker 容器失敗: ${stderr}`, 'red'));
      process.exit(1);
    }

    const containerName = stdout.trim().split('\n')[0]; // 取第一個找到的容器

    if (!containerName) {
      console.error(
        colorize(
          '\n❌ 錯誤: 找不到任何正在運行的 `app-dev` 或 `app-prod` 容器。',
          'red'
        )
      );
      console.error(
        colorize(
          '💡 提示: 請先執行 `npm run start:dev` 或 `npm run start:prod`。',
          'cyan'
        )
      );
      process.exit(1);
    }

    console.log(
      colorize(
        `✅ 成功偵測到運行中的容器: ${colorize(containerName, 'bright')}`,
        'green'
      )
    );

    // 透過 docker exec 呼叫本腳本，並傳入 --execute-directly 旗標
    const execCommand = `docker exec ${containerName} node scripts/db-connect.js --execute-directly`;

    console.log(colorize(`▶️  準備在容器內執行核心測試...`, 'cyan'));
    console.log(colorize(`  $ ${execCommand}`, 'bright'));
    console.log(colorize('='.repeat(50), 'cyan'));

    // 執行並串流輸出
    const child = exec(execCommand);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
}

/**
 * 主執行緒 (Main)
 * 根據執行參數決定要執行的邏輯。
 */
function main() {
  // 檢查是否由 docker exec 呼叫，並帶有特定旗標
  const isDirectExecution = process.argv.includes('--execute-directly');

  // 檢查是否在 Docker 環境中 (由 Admin Console 呼叫)
  const isInDocker = require('fs').existsSync('/.dockerenv');

  if (isDirectExecution || isInDocker) {
    // 執行核心測試 (從 Admin Console 或從主機的 docker exec 呼叫)
    testMongoConnection();
  } else {
    // 執行主機調度邏輯 (從主機的 npm run db:connect 呼叫)
    hostDispatch();
  }
}

main();
