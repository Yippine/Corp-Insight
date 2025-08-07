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
const BACKUP_DIR_HOST = path.join(__dirname, '..', 'db', 'backups');

// 從 MONGODB_URI 解析資料庫名稱，如果失敗則使用預設值
function getDbNameFromUri(uri) {
  if (!uri) return 'corp-insight';
  try {
    const dbName = new URL(uri).pathname.substring(1);
    return dbName || 'corp-insight';
  } catch (e) {
    return 'corp-insight';
  }
}
const DB_NAME = getDbNameFromUri(process.env.MONGODB_URI);

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

function findLatestFullBackup() {
  if (!fs.existsSync(BACKUP_DIR_HOST)) {
    console.error(colorize('❌ 備份目錄不存在: ' + BACKUP_DIR_HOST, 'red'));
    return null;
  }
  const files = fs
    .readdirSync(BACKUP_DIR_HOST)
    .filter(
      file => file.startsWith('db-backup-all-') && file.endsWith('.tar.gz')
    )
    .sort((a, b) => b.localeCompare(a));
  if (files.length === 0) {
    console.error(colorize('❌ 找不到任何 `-all-` 的完整備份檔案。', 'red'));
    return null;
  }
  return files[0];
}

async function main() {
  console.log(colorize('\n🔄 MongoDB 還原工具 (遙控器模式)', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  const backupFile = findLatestFullBackup();
  if (!backupFile) process.exit(1);

  const backupFilePath = path.join(BACKUP_DIR_HOST, backupFile);
  console.log(`[App Container] 📂 準備從最新完整備份還原: ${backupFile}`);

  const tempDirOnHost = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mongodb-restore-')
  );

  try {
    console.log(`[App Container] 📂 正在解壓縮至: ${tempDirOnHost}`);
    await tar.x({ file: backupFilePath, cwd: tempDirOnHost });
    console.log('[App Container] ✅ 解壓縮完成');

    console.log(
      `[App Container] ▶️  發送還原指令至 ${DOCKER_MONGO_CONTAINER} 容器...`,
      'cyan'
    );
    const files = fs
      .readdirSync(tempDirOnHost)
      .filter(f => f.endsWith('.json'));

    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const filePathOnHost = path.join(tempDirOnHost, file);

      const fileContent = fs.readFileSync(filePathOnHost, 'utf8').trim();
      if (fileContent.length === 0 || fileContent === '[]') {
        try {
          // 檢查遠端 collection 是否存在
          const checkCmd = `db.getCollectionNames().includes('${collectionName}')`;
          const { stdout: checkStdout } = await execFileAsync('docker', [
            'exec',
            DOCKER_MONGO_CONTAINER,
            'mongosh',
            process.env.MONGODB_URI,
            '--quiet',
            '--eval',
            checkCmd,
          ]);

          const exists = checkStdout.trim() === 'true';

          if (!exists) {
            // 如果不存在，則建立空集合
            const createCmd = `db.createCollection('${collectionName}')`;
            await execFileAsync('docker', [
              'exec',
              DOCKER_MONGO_CONTAINER,
              'mongosh',
              process.env.MONGODB_URI,
              '--quiet',
              '--eval',
              createCmd,
            ]);
            console.log(
              `  -> 建立空的集合 ${colorize(collectionName, 'yellow')}`
            );
          } else {
            console.log(
              `  -> 偵測到空的備份檔，但遠端集合 ${colorize(collectionName, 'yellow')} 已存在，略過操作`
            );
          }
        } catch (execError) {
          console.error(
            colorize(
              `  -> 檢查或建立空集合 ${collectionName} 時發生錯誤: ${execError.stderr || execError.message}`,
              'red'
            )
          );
        }
        continue;
      }

      // 1. 將解壓後的檔案放到共享目錄
      const sharedPathOnHost = path.join(__dirname, '..', 'db', file);
      fs.copyFileSync(filePathOnHost, sharedPathOnHost);

      // 2. 命令 mongo 容器從共享目錄讀取此檔案並匯入
      const importFilePathInMongo = `/data/db-mount/${file}`;
      console.log(`  -> 正在還原 ${colorize(collectionName, 'yellow')}...`);
      await execFileAsync('docker', [
        'exec',
        DOCKER_MONGO_CONTAINER,
        'mongoimport',
        `--uri=${process.env.MONGODB_URI}`,
        `--collection=${collectionName}`,
        '--type=json',
        `--file=${importFilePathInMongo}`,
        '--jsonArray',
        '--drop',
      ]);

      // 3. 清理共享目錄中的暫存檔案
      fs.unlinkSync(sharedPathOnHost);
    }

    console.log(colorize('\n🎉 資料還原成功完成！', 'bright'));
  } catch (error) {
    console.error(
      colorize(`\n❌ 還原失敗: ${error.stderr || error.message}`, 'red')
    );
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDirOnHost)) {
      fs.rmSync(tempDirOnHost, { recursive: true, force: true });
      console.log(colorize('[App Container] 🧹 臨時檔案清理完成', 'magenta'));
    }
  }
}

main();
