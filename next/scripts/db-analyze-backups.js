#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const tar = require('tar');

// --- 配置 ---
const BACKUP_DIR = path.join(__dirname, '..', 'db', 'backups');
const COLLECTIONS_CONFIG = {
  core: ['companies', 'tenders', 'ai_tools', 'feedbacks'],
  cache: ['pcc_api_cache', 'g0v_company_api_cache', 'twincn_api_cache'],
  system: ['api_key_statuses'],
};

// 建立一個反向對應，方便快速查找 collection 的類型
const collectionTypeMap = {};
for (const type in COLLECTIONS_CONFIG) {
  for (const collection of COLLECTIONS_CONFIG[type]) {
    collectionTypeMap[collection] = type;
  }
}

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function analyzeBackupFile(filePath) {
  const collections = {};
  let totalRecords = 0;

  try {
    await tar.t({
      file: filePath,
      onentry: entry => {
        if (entry.type === 'File' && entry.path.endsWith('.json')) {
          const collectionName = path.basename(entry.path, '.json');
          let recordCount = 0;
          
          const content = [];
          entry.on('data', chunk => {
            content.push(chunk);
          });
          entry.on('end', () => {
            try {
              const fileContent = Buffer.concat(content).toString('utf8');
              const data = JSON.parse(fileContent);
              if (Array.isArray(data)) {
                recordCount = data.length;
              }
            } catch (e) {
                // Not a valid JSON array, might be JSONL or malformed
                const fileContent = Buffer.concat(content).toString('utf8');
                recordCount = fileContent.split('\n').filter(line => line.trim().startsWith('{')).length;
            }
            collections[collectionName] = recordCount;
            totalRecords += recordCount;
          });
        }
      },
    });

    const stats = fs.statSync(filePath);
    return {
      fileName: path.basename(filePath),
      fileSize: stats.size,
      collections,
      totalRecords,
      modifiedTime: stats.mtime,
    };
  } catch (error) {
    return {
      fileName: path.basename(filePath),
      error: error.message,
    };
  }
}

async function main() {
  console.log(colorize('\n🔍 MongoDB 備份檔案分析報告', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  if (!fs.existsSync(BACKUP_DIR)) {
    console.log(colorize('❌ 備份目錄不存在！', 'red'));
    return;
  }

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.tar.gz'))
    .sort((a, b) => b.localeCompare(a)); // 按時間倒序排列

  if (files.length === 0) {
    console.log(colorize('📂 沒有找到 .tar.gz 備份檔案', 'yellow'));
    return;
  }

  console.log(colorize(`\n📊 找到 ${files.length} 個備份檔案：\n`, 'green'));

  for (const file of files) {
    const filePath = path.join(BACKUP_DIR, file);
    const analysis = await analyzeBackupFile(filePath);

    console.log(colorize(file, 'bright'));
    console.log(
      `   📏 檔案大小: ${colorize(formatBytes(analysis.fileSize), 'cyan')}`
    );
    console.log(
        `   📅 修改時間: ${colorize(new Date(analysis.modifiedTime).toLocaleString(), 'magenta')}`
    );

    if (analysis.error) {
      console.log(`   ❌ 錯誤: ${colorize(analysis.error, 'red')}`);
    } else {
      console.log('   包含的 Collections:');
      for (const [name, count] of Object.entries(analysis.collections)) {
        const type = collectionTypeMap[name] || 'unknown';
        let typeColor = 'yellow';
        if (type === 'core') typeColor = 'cyan';
        if (type === 'cache') typeColor = 'green';
        if (type === 'system') typeColor = 'magenta';
        console.log(`     - ${colorize(name, 'yellow')} (${colorize(type, typeColor)}): ${colorize(count.toString(), 'green')} 筆記錄`);
      }
    }
    console.log(); // 空行分隔
  }

  console.log(colorize('✅ 分析完成！', 'green'));
}

main();