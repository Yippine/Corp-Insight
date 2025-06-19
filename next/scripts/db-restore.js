#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const fs = require('fs');
const path = require('path');
const os = require('os');
const tar = require('tar');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { MongoClient } = require('mongodb');

// --- 配置 ---
const BACKUP_DIR = path.join(__dirname, '..', 'db', 'backups');
const MONGO_CONTAINER_NAME = 'mongo';
// ---

async function checkDockerContainer() {
  try {
    const { stdout } = await exec(`docker ps -f "name=${MONGO_CONTAINER_NAME}" --format "{{.Names}}"`);
    if (!stdout.trim().includes(MONGO_CONTAINER_NAME)) {
      throw new Error();
    }
  } catch (error) {
    console.error(`❌ 錯誤: 找不到名為 "${MONGO_CONTAINER_NAME}" 的 Docker 容器。請確保 MongoDB 正在運行 (npm run docker:mongo)。`);
    process.exit(1);
  }
}

async function findLatestFullBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ 備份目錄不存在:', BACKUP_DIR);
    return null;
  }
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('db-backup-all-') && file.endsWith('.tar.gz'))
    .sort((a, b) => b.localeCompare(a));

  if (files.length === 0) {
    console.error('❌ 找不到任何 `-all-` 的完整備份檔案。');
    return null;
  }
  return files[0];
}

// 增加一個獨立的清理函數
async function cleanup(directory) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
    console.log('🧹 臨時檔案清理完成');
  }
}

async function restore() {
  console.log('\n🔄 MongoDB 全面還原工具');
  console.log('='.repeat(50));

  await checkDockerContainer();
  console.log('✅ Docker 容器檢查通過');

  const backupFile = await findLatestFullBackup();
  if (!backupFile) {
    process.exit(1);
  }

  const backupFilePath = path.join(BACKUP_DIR, backupFile);
  console.log(`📂 準備從最新完整備份還原: ${backupFile}`);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongodb-restore-'));
  
  let client;
  try {
    console.log('-'.repeat(50));
    console.log('Connecting to MongoDB...');
    const DB_NAME = process.env.DB_NAME || 'business-magnifier';
    // 連線 URI 不應包含 db name
    const connectionUri = process.env.MONGODB_URI.split('/').slice(0, 3).join('/');
    client = new MongoClient(connectionUri);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('Connection successful.');
    console.log('-'.repeat(50));
    
    console.log(`📂 正在解壓縮至: ${tempDir}`);
    await tar.x({ file: backupFilePath, cwd: tempDir });
    console.log('✅ 解壓縮完成');

    console.log('🔄 開始匯入資料...');
    const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const isFileEmpty = stats.size < 5;

      if (isFileEmpty) {
        console.log(`  -> 偵測到空備份 '${collectionName}'，將建立新集合...`);
        // 先檢查遠端集合是否存在
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length > 0) {
          console.log(`     ➡️ [跳過] 集合 '${collectionName}' 已存在，無需更動。`);
        } else {
          await db.createCollection(collectionName);
          console.log(`     ✅ [新建] 空集合 '${collectionName}' 已成功建立。`);
        }
      } else {
        console.log(`  -> 正在還原 ${collectionName}...`);
        const tempContainerPath = `/tmp/${file}`;
        await exec(`docker cp "${filePath}" ${MONGO_CONTAINER_NAME}:${tempContainerPath}`);
        
        const importCmd = [
          'docker exec',
          MONGO_CONTAINER_NAME,
          'mongoimport',
          `--db=${DB_NAME}`,
          `--collection="${collectionName}"`,
          '--type=json',
          `--file=${tempContainerPath}`,
          '--jsonArray',
          '--drop',
          `--username=${process.env.MONGO_INITDB_ROOT_USERNAME || 'admin'}`,
          `--password=${process.env.MONGO_INITDB_ROOT_PASSWORD || 'password'}`,
          '--authenticationDatabase=admin'
        ].join(' ');
        
        try {
          await exec(importCmd);
        } catch (importError) {
          console.error(`\n❌ 匯入 '${collectionName}' 失敗.`);
          // mongoimport 的錯誤通常在 stderr
          console.error(`Error Details: ${importError.stderr || importError.message}`);
          throw importError; // 拋出錯誤以停止整個流程
        }
        
        await exec(`docker exec ${MONGO_CONTAINER_NAME} rm ${tempContainerPath}`);
      }
    }

    console.log('\n🎉 資料還原成功完成！');
    console.log('\n💡 後續步驟建議:');
    console.log('   請執行 `npm run db:init` 或 `npm run db:full-restore` 來確保所有索引都已建立。');

  } catch (error) {
    console.error(`\n❌ 還原期間發生致命錯誤。`);
    // 不需要再次打印錯誤訊息，因為它已在內部被捕獲和記錄
    process.exit(1);
  } finally {
    if (client) await client.close();
    await cleanup(tempDir);
  }
}

restore();