#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'db', 'backups');

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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
  // 從檔名中提取時間戳 (YYYYMMDD_HHMMSS)
  if (timestamp.length === 15) {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(9, 11);
    const minute = timestamp.substring(11, 13);
    const second = timestamp.substring(13, 15);

    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  }
  return timestamp;
}

function analyzeBackupFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    let recordCount = 0;
    let sampleData = null;
    let toolTypes = new Set();
    let categories = new Set();

    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        recordCount = data.length;

        // 取樣分析前幾筆資料
        if (data.length > 0) {
          sampleData = data[0];

          // 分析工具類型和分類
          data.forEach(item => {
            if (item.type) toolTypes.add(item.type);
            if (item.category) categories.add(item.category);
          });
        }
      }
    } catch {
      // 如果不是標準 JSON，可能是 JSONL 格式
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      recordCount = lines.length;

      if (lines.length > 0) {
        try {
          sampleData = JSON.parse(lines[0]);

          // 分析工具類型和分類
          lines.forEach(line => {
            try {
              const item = JSON.parse(line);
              if (item.type) toolTypes.add(item.type);
              if (item.category) categories.add(item.category);
            } catch {
              // 忽略解析錯誤的行
            }
          });
        } catch {
          // 無法解析第一行
        }
      }
    }

    return {
      fileName: path.basename(filePath),
      fileSize: stats.size,
      recordCount,
      toolTypes: Array.from(toolTypes),
      categories: Array.from(categories),
      sampleData,
      modifiedTime: stats.mtime,
    };
  } catch (error) {
    return {
      fileName: path.basename(filePath),
      error: error.message,
    };
  }
}

function main() {
  console.log(colorize('\n🔍 AI Tools 備份檔案分析報告', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));

  if (!fs.existsSync(BACKUP_DIR)) {
    console.log(colorize('❌ 備份目錄不存在！', 'red'));
    return;
  }

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter(
      file => file.startsWith('ai_tools_backup_') && file.endsWith('.json')
    )
    .sort((a, b) => b.localeCompare(a)); // 按時間倒序排列

  if (files.length === 0) {
    console.log(colorize('📂 沒有找到備份檔案', 'yellow'));
    return;
  }

  console.log(colorize(`\n📊 找到 ${files.length} 個備份檔案：\n`, 'green'));

  files.forEach((file, index) => {
    const filePath = path.join(BACKUP_DIR, file);
    const analysis = analyzeBackupFile(filePath);

    // 提取時間戳
    const timestampMatch = file.match(/ai_tools_backup_(\d{8}_\d{6})\.json/);
    const timestamp = timestampMatch ? timestampMatch[1] : 'unknown';

    console.log(colorize(`${index + 1}. ${file}`, 'bright'));
    console.log(`   📅 建立時間: ${colorize(formatDate(timestamp), 'blue')}`);
    console.log(
      `   📏 檔案大小: ${colorize(formatBytes(analysis.fileSize), 'cyan')}`
    );

    if (analysis.error) {
      console.log(`   ❌ 錯誤: ${colorize(analysis.error, 'red')}`);
    } else {
      console.log(
        `   📝 資料筆數: ${colorize(analysis.recordCount.toString(), 'green')}`
      );

      if (analysis.toolTypes && analysis.toolTypes.length > 0) {
        console.log(
          `   🔧 工具類型: ${colorize(analysis.toolTypes.join(', '), 'yellow')}`
        );
      }

      if (analysis.categories && analysis.categories.length > 0) {
        console.log(
          `   📂 分類: ${colorize(analysis.categories.join(', '), 'yellow')}`
        );
      }

      if (analysis.sampleData) {
        const sampleKeys = Object.keys(analysis.sampleData);
        console.log(
          `   🔍 資料欄位: ${colorize(sampleKeys.slice(0, 5).join(', '), 'cyan')}${sampleKeys.length > 5 ? '...' : ''}`
        );
      }
    }

    console.log(); // 空行分隔
  });

  // 顯示摘要統計
  const validAnalyses = files
    .map(file => analyzeBackupFile(path.join(BACKUP_DIR, file)))
    .filter(analysis => !analysis.error);

  if (validAnalyses.length > 0) {
    const totalRecords = validAnalyses.reduce(
      (sum, analysis) => sum + analysis.recordCount,
      0
    );
    const avgRecords = Math.round(totalRecords / validAnalyses.length);
    const allToolTypes = new Set();
    const allCategories = new Set();

    validAnalyses.forEach(analysis => {
      analysis.toolTypes.forEach(type => allToolTypes.add(type));
      analysis.categories.forEach(cat => allCategories.add(cat));
    });

    console.log(colorize('📈 統計摘要:', 'bright'));
    console.log(`   總檔案數: ${colorize(files.length.toString(), 'green')}`);
    console.log(`   平均筆數: ${colorize(avgRecords.toString(), 'green')}`);
    console.log(
      `   工具類型總數: ${colorize(allToolTypes.size.toString(), 'yellow')}`
    );
    console.log(
      `   分類總數: ${colorize(allCategories.size.toString(), 'yellow')}`
    );
  }

  console.log(colorize('\n✅ 分析完成！', 'green'));
}

main();
