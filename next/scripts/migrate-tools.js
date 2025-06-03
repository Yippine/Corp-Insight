#!/usr/bin/env node

/**
 * AI 工具資料遷移腳本
 * 將 promptTools.ts 中的資料遷移到 MongoDB
 * 
 * 使用方式：
 * npm run migrate-tools
 * 或
 * node scripts/migrate-tools.js
 */

const https = require('https');
const http = require('http');

// 從環境變數或預設值讀取配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_MIGRATE_ENDPOINT = `${API_BASE_URL}/api/aitool/migrate`;

// 顏色輸出函數
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP 請求工具函數
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const requestModule = isHttps ? https : http;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    const req = requestModule.request(url, finalOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 檢查遷移狀態
async function checkMigrationStatus() {
  try {
    colorLog('🔍 檢查遷移狀態...', 'cyan');
    
    const response = await makeRequest(API_MIGRATE_ENDPOINT);
    
    if (response.status === 200 && response.data.success) {
      const { migrationStatus } = response.data;
      
      colorLog('\n📊 遷移狀態報告:', 'blue');
      colorLog(`   資料庫中的工具數量: ${migrationStatus.toolsInDatabase}`, 'white');
      colorLog(`   原始檔案中的工具數量: ${migrationStatus.toolsInPromptFile}`, 'white');
      colorLog(`   是否已遷移: ${migrationStatus.isMigrated ? '是' : '否'}`, migrationStatus.isMigrated ? 'green' : 'yellow');
      colorLog(`   需要遷移: ${migrationStatus.needsMigration ? '是' : '否'}`, migrationStatus.needsMigration ? 'yellow' : 'green');
      
      return migrationStatus;
    } else {
      colorLog('❌ 無法檢查遷移狀態', 'red');
      console.log('回應:', response);
      return null;
    }
  } catch (error) {
    colorLog(`❌ 檢查遷移狀態時發生錯誤: ${error.message}`, 'red');
    return null;
  }
}

// 執行遷移
async function executeMigration() {
  try {
    colorLog('🚀 開始執行資料遷移...', 'cyan');
    
    const response = await makeRequest(API_MIGRATE_ENDPOINT, {
      method: 'POST'
    });
    
    if (response.status === 200 && response.data.success) {
      colorLog('✅ 資料遷移成功完成！', 'green');
      colorLog(`📦 已遷移 ${response.data.migratedCount} 個工具`, 'green');
      
      if (response.data.tools && response.data.tools.length > 0) {
        colorLog('\n🛠️  已遷移的工具列表:', 'blue');
        response.data.tools.forEach((tool, index) => {
          colorLog(`   ${index + 1}. ${tool.name} (ID: ${tool.id})`, 'white');
        });
      }
      
      return true;
    } else {
      colorLog('❌ 資料遷移失敗', 'red');
      
      if (response.status === 409) {
        colorLog('⚠️  資料庫中已有工具資料，可能已經遷移過了', 'yellow');
      } else {
        colorLog(`   狀態碼: ${response.status}`, 'red');
        colorLog(`   錯誤信息: ${response.data.error || '未知錯誤'}`, 'red');
      }
      
      return false;
    }
  } catch (error) {
    colorLog(`❌ 執行遷移時發生錯誤: ${error.message}`, 'red');
    return false;
  }
}

// 清理資料庫（重新遷移用）
async function cleanDatabase() {
  try {
    colorLog('🗑️  清理資料庫中的工具資料...', 'yellow');
    
    const response = await makeRequest(API_MIGRATE_ENDPOINT, {
      method: 'DELETE'
    });
    
    if (response.status === 200 && response.data.success) {
      colorLog('✅ 資料庫清理完成', 'green');
      return true;
    } else {
      colorLog('❌ 資料庫清理失敗', 'red');
      console.log('回應:', response);
      return false;
    }
  } catch (error) {
    colorLog(`❌ 清理資料庫時發生錯誤: ${error.message}`, 'red');
    return false;
  }
}

// 主程序
async function main() {
  colorLog('🎯 AI 工具資料遷移程序', 'bright');
  colorLog('=====================================', 'dim');
  
  // 檢查命令行參數
  const args = process.argv.slice(2);
  const forceClean = args.includes('--clean') || args.includes('-c');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    colorLog('\n使用方式:', 'blue');
    colorLog('  node scripts/migrate-tools.js           # 執行遷移', 'white');
    colorLog('  node scripts/migrate-tools.js --clean   # 清理並重新遷移', 'white');
    colorLog('  node scripts/migrate-tools.js --help    # 顯示幫助', 'white');
    return;
  }
  
  // 1. 檢查當前狀態
  const status = await checkMigrationStatus();
  if (!status) {
    colorLog('\n❌ 無法連接到 API，請確認：', 'red');
    colorLog('   1. Next.js 開發伺服器是否正在運行 (npm run dev)', 'yellow');
    colorLog('   2. MongoDB 是否已連接', 'yellow');
    colorLog('   3. API 路由是否正確配置', 'yellow');
    return;
  }
  
  // 2. 根據狀態決定操作
  if (forceClean) {
    colorLog('\n🔄 強制重新遷移模式', 'yellow');
    const cleaned = await cleanDatabase();
    if (!cleaned) {
      colorLog('❌ 清理失敗，停止遷移', 'red');
      return;
    }
  }
  
  if (status.isMigrated && !forceClean) {
    colorLog('\n✅ 資料已經遷移完成，無需重複遷移', 'green');
    colorLog('   如需重新遷移，請使用 --clean 參數', 'yellow');
    return;
  }
  
  if (!status.needsMigration && !forceClean) {
    colorLog('\n⚠️  沒有找到需要遷移的資料', 'yellow');
    return;
  }
  
  // 3. 執行遷移
  const success = await executeMigration();
  
  if (success) {
    colorLog('\n🎉 遷移完成！', 'green');
    colorLog('現在你可以：', 'blue');
    colorLog('   1. 刪除 promptTools.ts 檔案', 'white');
    colorLog('   2. 更新相關引用以使用 API', 'white');
    colorLog('   3. 測試工具搜尋頁面功能', 'white');
  } else {
    colorLog('\n💔 遷移失敗，請檢查錯誤信息並重試', 'red');
  }
  
  // 4. 再次檢查狀態
  colorLog('\n🔍 遷移後狀態檢查...', 'cyan');
  await checkMigrationStatus();
  
  colorLog('\n🏁 遷移程序結束', 'dim');
}

// 執行主程序
if (require.main === module) {
  main().catch((error) => {
    colorLog(`💥 程序執行時發生未預期的錯誤: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}