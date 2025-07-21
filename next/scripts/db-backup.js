#!/usr/bin/env node

require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env.local'),
});

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const os = require('os');
const tar = require('tar');

const execFileAsync = util.promisify(execFile);

// --- 設定 ---
const DOCKER_MONGO_CONTAINER = 'mongo';
// backupDir 是相對於 /app 的路徑，因為此腳本總是在 app-dev 容器中執行
const BACKUP_DIR_HOST = path.join(__dirname, '..', 'db', 'backups');
// mongoContainerBackupPath 是相對於 mongo 容器根目錄的路徑
const MONGO_CONTAINER_BACKUP_PATH = '/data/db-mount/backups';

const COLLECTIONS_CONFIG = {
  core: ['companies', 'tenders', 'ai_tools', 'feedbacks'],
  cache: ['pcc_api_cache', 'g0v_company_api_cache', 'twincn_api_cache'],
  system: ['api_key_statuses', 'global_settings'],
};
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};
const colorize = (text, color) =>
  `${colors[color] || colors.reset}${text}${colors.reset}`;

async function main() {
  console.log(colorize('\n🔄 MongoDB 備份工具 (遙控器模式)', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const args = process.argv.slice(2);
  const scopeArg =
    args.find(arg => arg.startsWith('--scope=')) || '--scope=all';
  const scope = scopeArg.split('=')[1];

  let collectionsToBackup;
  if (scope === 'core') {
    collectionsToBackup = COLLECTIONS_CONFIG.core;
  } else {
    // scope === 'all'
    collectionsToBackup = [
      ...COLLECTIONS_CONFIG.core,
      ...COLLECTIONS_CONFIG.cache,
      ...COLLECTIONS_CONFIG.system,
    ];
  }

  let tempDirOnHost;

  try {
    // 1. 在主機(app-dev)建立臨時目錄
    tempDirOnHost = fs.mkdtempSync(path.join(os.tmpdir(), 'mongodb-backup-'));
    console.log(
      colorize(`[App Container] 📂 建立臨時目錄: ${tempDirOnHost}`, 'magenta')
    );

    // 2. 透過 `docker exec` 命令 mongo 容器進行備份
    console.log(
      colorize(
        `[App Container] ▶️  發送備份指令至 ${DOCKER_MONGO_CONTAINER} 容器...`,
        'cyan'
      )
    );
    for (const collection of collectionsToBackup) {
      console.log(`  -> 正在匯出 ${colorize(collection, 'yellow')}...`);
      // 導出到共享 Volume 中，以 collection 名命名
      const tempBackupFilePathInMongo = `/data/db-mount/${collection}.json`;

      await execFileAsync('docker', [
        'exec',
        DOCKER_MONGO_CONTAINER,
        'mongoexport',
        `--uri=${process.env.MONGODB_URI}`,
        `--collection=${collection}`,
        '--jsonArray',
        '--pretty',
        `--out=${tempBackupFilePathInMongo}`,
      ]);

      const sourcePathOnHost = path.join(
        __dirname,
        '..',
        'db',
        `${collection}.json`
      );

      // Poll for file existence to avoid race conditions with Docker volumes
      const maxRetries = 10;
      const retryInterval = 500; // ms
      let fileExists = false;
      for (let i = 0; i < maxRetries; i++) {
        if (fs.existsSync(sourcePathOnHost)) {
          fileExists = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }

      if (!fileExists) {
        throw new Error(
          `Timeout: Exported file ${sourcePathOnHost} did not appear in time.`
        );
      }

      const destPathOnHost = path.join(tempDirOnHost, `${collection}.json`);
      // fs.renameSync might fail on Windows if source and destination are on different drives.
      // Use copy + unlink for a more robust move operation.
      fs.copyFileSync(sourcePathOnHost, destPathOnHost);
      fs.unlinkSync(sourcePathOnHost);
    }
    console.log(
      colorize('[App Container] ✅ 所有 Collections 匯出完成', 'green')
    );

    // 3. 在主機(app-dev)端進行壓縮
    if (!fs.existsSync(BACKUP_DIR_HOST)) {
      fs.mkdirSync(BACKUP_DIR_HOST, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `db-backup-${scope}-${timestamp}.tar.gz`;
    const archivePath = path.join(BACKUP_DIR_HOST, archiveName);

    console.log(
      colorize(`[App Container] 📦 正在壓縮檔案... ${archiveName}`, 'magenta')
    );
    await tar.c(
      { gzip: true, file: archivePath, cwd: tempDirOnHost },
      fs.readdirSync(tempDirOnHost)
    );

    console.log(colorize('\n🎉 備份成功完成！', 'bright'));
    console.log(colorize(`📄 備份檔案: ${archivePath}`, 'green'));
  } catch (error) {
    console.error(
      colorize(`\n❌ 備份失敗: ${error.stderr || error.message}`, 'red')
    );
    process.exit(1);
  } finally {
    // 4. 清理主機(app-dev)端的臨時目錄
    if (tempDirOnHost && fs.existsSync(tempDirOnHost)) {
      fs.rmSync(tempDirOnHost, { recursive: true, force: true });
      console.log(colorize('[App Container] 🧹 臨時檔案清理完成', 'magenta'));
    }
  }
}

main();
