#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const os = require('os');
const tar = require('tar');

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

const COLLECTIONS_CONFIG = {
  core: ['companies', 'tenders', 'ai_tools', 'feedbacks'],
  cache: ['pcc_api_cache', 'g0v_company_api_cache', 'twincn_api_cache'],
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

// --- 輔助函式 ---
function getCollectionsToBackup(scope) {
  switch (scope) {
    case 'core':
      return COLLECTIONS_CONFIG.core;
    case 'all':
    default:
      return [...COLLECTIONS_CONFIG.core, ...COLLECTIONS_CONFIG.cache];
  }
}

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

async function main() {
  console.log(colorize('\n🔄 MongoDB 全面備份工具', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const args = process.argv.slice(2);
  const scopeArg = args.find(arg => arg.startsWith('--scope='));
  const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

  let tempDir;
  try {
    // 1. 檢查 Docker 容器
    await checkDockerContainer();
    console.log(colorize('✅ Docker 容器檢查通過', 'green'));

    // 2. 決定要備份的 Collections
    const collectionsToBackup = getCollectionsToBackup(scope);
    if (collectionsToBackup.length === 0) {
      console.log(colorize('🤔 無需備份的 Collections', 'yellow'));
      return;
    }
    console.log(
      colorize(`🎯 備份範圍: ${scope}`, 'blue') +
        ` (${collectionsToBackup.length} 個集合)`
    );

    // 3. 建立臨時目錄
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongodb-backup-'));
    console.log(colorize(`📂 建立臨時目錄: ${tempDir}`, 'blue'));

    // 4. 逐一匯出 Collection
    for (const collection of collectionsToBackup) {
      console.log(
        `  -> 正在匯出 ${colorize(collection, 'yellow')}...`
      );
      const output_file = path.join(tempDir, `${collection}.json`);
      const command = [
        `docker exec ${DOCKER_CONTAINER_NAME}`,
        'mongoexport',
        `--host=${DB_HOST}:${DB_PORT}`,
        `--db=${DB_NAME}`,
        `--collection=${collection}`,
        `--username=${DB_USER}`,
        `--password=${DB_PASS}`,
        '--authenticationDatabase=admin',
        '--jsonArray',
        '--pretty',
        `--out=/tmp/${collection}.json`,
      ].join(' ');

      await execAsync(command);

      // 從 Docker 容器中複製出來
      await execAsync(
        `docker cp ${DOCKER_CONTAINER_NAME}:/tmp/${collection}.json "${output_file}"`
      );

      // 清理容器內的臨時檔案
      await execAsync(
        `docker exec ${DOCKER_CONTAINER_NAME} rm /tmp/${collection}.json`
      );
    }
    console.log(colorize('✅ 所有 Collections 匯出完成', 'green'));

    // 5. 壓縮成 .tar.gz
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `db-backup-${scope}-${timestamp}.tar.gz`;
    const archivePath = path.join(BACKUP_DIR, archiveName);

    console.log(colorize(`📦 正在壓縮檔案... ${archiveName}`, 'blue'));
    await tar.c(
      {
        gzip: true,
        file: archivePath,
        cwd: tempDir,
      },
      fs.readdirSync(tempDir)
    );

    console.log(colorize('\n🎉 備份成功完成！', 'bright'));
    console.log(colorize(`📄 備份檔案: ${archivePath}`, 'green'));
  } catch (error) {
    console.error(colorize(`\n❌ 備份失敗: ${error.message}`, 'red'));
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