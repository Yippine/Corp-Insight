#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const os = require('os');
const tar = require('tar');
const readline = require('readline');

// 在所有其他代碼之前加載環境變數
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const execAsync = util.promisify(exec);

// --- 從環境變數解析資料庫設定 ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\x1b[31m❌ 錯誤：找不到 MONGODB_URI 環境變數。\x1b[0m');
  console.error('\x1b[33m請確保在 /next 目錄下有名為 .env.local 的檔案，且其中包含 MONGODB_URI 的設定。\x1b[0m');
  process.exit(1);
}

let DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT;
try {
  const uri = new URL(MONGODB_URI);
  DB_NAME = uri.pathname.substring(1); // 移除開頭的 '/'
  DB_USER = uri.username;
  DB_PASS = uri.password;
  DB_HOST = uri.hostname;
  DB_PORT = uri.port;
} catch (error) {
  console.error('\x1b[31m❌ 錯誤：MONGODB_URI 格式不正確。\x1b[0m');
  console.error(error);
  process.exit(1);
}

// --- 備份設定 ---
const BACKUP_DIR = path.join(__dirname, '..', 'db', 'backups');
const DOCKER_CONTAINER_NAME = 'mongo';

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

// --- 輔助函式 ---
async function checkDockerContainer() {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter "name=${DOCKER_CONTAINER_NAME}" --format "{{.Names}}"`
    );
    if (!stdout.trim().includes(DOCKER_CONTAINER_NAME)) {
      throw new Error(
        `MongoDB 容器 '${DOCKER_CONTAINER_NAME}' 未運行！請先啟動 Docker 服務。`
      );
    }
  } catch (error) {
    throw new Error(`Docker 容器檢查失敗：${error.message}`);
  }
}

function getBackupFiles() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }
  return fs
    .readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.tar.gz'))
    .sort((a, b) => b.localeCompare(a)); // 按時間倒序
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  console.log(colorize('\n🔄 MongoDB 全面還原工具', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  let tempDir;
  try {
    // 1. 檢查 Docker
    await checkDockerContainer();
    console.log(colorize('✅ Docker 容器檢查通過', 'green'));

    // 2. 尋找並列出備份檔案
    const backupFiles = getBackupFiles();
    if (backupFiles.length === 0) {
      throw new Error(`在 ${BACKUP_DIR} 中找不到任何 '.tar.gz' 備份檔案`);
    }

    console.log(colorize('\n🔍 請選擇要還原的備份檔案:', 'yellow'));
    backupFiles.forEach((file, index) => {
      console.log(`  ${colorize(`[${index + 1}]`, 'cyan')} ${file}`);
    });
    console.log(`  ${colorize('[0]', 'cyan')} 取消`);

    // 3. 獲取使用者選擇
    const choice = await askQuestion(
      colorize('\n請輸入選項編號: ', 'bright')
    );
    const choiceIndex = parseInt(choice, 10);

    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex > backupFiles.length) {
      throw new Error('無效的選項');
    }
    if (choiceIndex === 0) {
      console.log(colorize('操作已取消', 'yellow'));
      return;
    }

    const selectedFile = backupFiles[choiceIndex - 1];
    const archivePath = path.join(BACKUP_DIR, selectedFile);
    console.log(colorize(`\n📂 準備還原: ${selectedFile}`, 'blue'));

    // 4. 建立臨時目錄並解壓縮
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongodb-restore-'));
    console.log(colorize(`📂 正在解壓縮至: ${tempDir}`, 'blue'));
    await tar.x({
      file: archivePath,
      cwd: tempDir,
    });
    const collectionFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));
    console.log(colorize('✅ 解壓縮完成', 'green'));

    // 5. 逐一還原 Collection
    console.log(colorize('🔄 開始匯入資料...', 'blue'));
    for (const file of collectionFiles) {
      const collectionName = path.basename(file, '.json');
      const filePath = path.join(tempDir, file);
      
      console.log(`  -> 正在還原 ${colorize(collectionName, 'yellow')}...`);
      
      // 先複製到容器內
      const containerFilePath = `/tmp/${file}`;
      await execAsync(`docker cp "${filePath}" ${DOCKER_CONTAINER_NAME}:${containerFilePath}`);
      
      const command = [
        `docker exec ${DOCKER_CONTAINER_NAME}`,
        'mongoimport',
        `--host=${DB_HOST}:${DB_PORT}`,
        `--db=${DB_NAME}`,
        `--collection=${collectionName}`,
        `--username=${DB_USER}`,
        `--password=${DB_PASS}`,
        '--authenticationDatabase=admin',
        '--jsonArray',
        '--drop', // 清空目標 collection
        `--file=${containerFilePath}`,
      ].join(' ');

      await execAsync(command);

      // 清理容器內的檔案
      await execAsync(`docker exec ${DOCKER_CONTAINER_NAME} rm ${containerFilePath}`);
    }

    console.log(colorize('\n🎉 資料還原成功完成！', 'bright'));
    console.log(colorize(`📄 使用檔案: ${selectedFile}`, 'green'));
  } catch (error) {
    console.error(colorize(`\n❌ 還原失敗: ${error.message}`, 'red'));
    process.exit(1);
  } finally {
    // 6. 清理臨時目錄
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rm(tempDir, { recursive: true, force: true }, () => {
        console.log(colorize('🧹 臨時檔案清理完成', 'blue'));
      });
    }
  }
}

// 確保有安裝 tar
async function checkDependencies() {
  try {
    require.resolve('tar');
  } catch (e) {
    console.error(colorize('❌ 缺少 `tar` 依賴套件。', 'red'));
    console.log(colorize('請執行 `npm install tar` 或 `yarn add tar`', 'yellow'));
    process.exit(1);
  }
}

checkDependencies().then(main);