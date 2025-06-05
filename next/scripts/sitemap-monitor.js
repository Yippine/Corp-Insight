#!/usr/bin/env node

/**
 * Sitemap 監控與狀態同步系統
 * 支援與前端 localStorage 狀態管理系統同步
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: process.env.SITEMAP_BASE_URL || 'http://localhost:3000',
  storageFile: path.join(process.cwd(), '.sitemap-status.json'),
  interval: 5 * 60 * 1000, // 5 分鐘
  timeout: 10000, // 10 秒超時
  sitemaps: [
    { id: 'main', name: '主要 Sitemap', url: '/sitemap.xml', description: '靜態頁面 + 動態內容' },
    { id: 'index', name: 'Sitemap Index', url: '/sitemap-index.xml', description: '管理所有 sitemap 索引' },
    { id: 'companies', name: '企業 Sitemap', url: '/sitemap-companies.xml', description: '企業詳情頁面' },
    { id: 'tenders', name: '標案 Sitemap', url: '/sitemap-tenders.xml', description: '標案詳情頁面' },
    { id: 'aitools', name: 'AI 工具 Sitemap', url: '/sitemap-aitools.xml', description: 'AI 工具詳情頁面' },
    { id: 'robots', name: 'robots.txt', url: '/robots.txt', description: '搜索引擎爬蟲指令' }
  ]
};

let monitorProcess = null;

/**
 * 測試單個 sitemap
 */
async function testSitemap(sitemap) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = CONFIG.baseUrl + sitemap.url;
    
    const req = http.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const contentLength = data.length;
        const status = res.statusCode === 200 ? 'success' : 'error';
        const statusText = status === 'success' 
          ? `✅ 正常 (${responseTime}ms)`
          : `❌ 錯誤 ${res.statusCode}`;
        
        resolve({
          ...sitemap,
          status,
          statusText,
          responseTime,
          contentLength,
          lastChecked: new Date()
        });
      });
    });
    
    req.on('error', () => {
      resolve({
        ...sitemap,
        status: 'error',
        statusText: '❌ 連接失敗',
        responseTime: undefined,
        contentLength: undefined,
        lastChecked: new Date()
      });
    });
    
    req.setTimeout(CONFIG.timeout, () => {
      req.destroy();
      resolve({
        ...sitemap,
        status: 'error',
        statusText: '❌ 請求超時',
        responseTime: undefined,
        contentLength: undefined,
        lastChecked: new Date()
      });
    });
  });
}

/**
 * 測試所有 sitemap
 */
async function testAllSitemaps() {
  console.log('🔍 開始測試所有 Sitemap...\n');
  
  const results = {};
  const testPromises = CONFIG.sitemaps.map(async (sitemap) => {
    const result = await testSitemap(sitemap);
    results[result.id] = result;
    
    const emoji = result.status === 'success' ? '✅' : '❌';
    console.log(`${emoji} ${result.name}: ${result.statusText}`);
    
    return result;
  });
  
  await Promise.all(testPromises);
  
  // 保存結果到文件
  saveStatus(results);
  
  console.log('\n📊 測試完成！');
  return results;
}

/**
 * 保存狀態到文件
 */
function saveStatus(statusMap) {
  try {
    const data = {
      statusMap,
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString()
    };
    
    fs.writeFileSync(CONFIG.storageFile, JSON.stringify(data, null, 2));
    console.log(`💾 狀態已保存到: ${CONFIG.storageFile}`);
  } catch (error) {
    console.error('❌ 保存狀態失敗:', error.message);
  }
}

/**
 * 讀取狀態文件
 */
function loadStatus() {
  try {
    if (fs.existsSync(CONFIG.storageFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.storageFile, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('❌ 讀取狀態失敗:', error.message);
  }
  return null;
}

/**
 * 啟動監控（Web 友好版本）
 */
async function startMonitor() {
  const pidFile = path.join(process.cwd(), '.sitemap-monitor.pid');
  
  // 檢查是否已經在運行
  if (fs.existsSync(pidFile)) {
    try {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
      // 在 Windows 環境下，簡單檢查 PID 可能不可靠，先清理舊的 PID 文件
      console.log('⚠️ 檢測到已存在的 PID 文件，正在清理...');
      fs.unlinkSync(pidFile);
    } catch (error) {
      // PID 文件損壞，直接刪除
      if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile);
      }
    }
  }
  
  console.log('🚀 啟動 Sitemap 監控系統');
  console.log(`📅 檢測間隔: ${CONFIG.interval / 60000} 分鐘`);
  console.log(`🌐 目標 URL: ${CONFIG.baseUrl}`);
  console.log('');
  
  // 立即執行一次測試
  console.log('🔍 執行初始檢測...');
  await testAllSitemaps();
  
  // 創建監控狀態文件
  const monitorStatus = {
    status: 'running',
    startTime: new Date().toISOString(),
    pid: process.pid,
    interval: CONFIG.interval,
    lastCheck: new Date().toISOString()
  };
  
  try {
    fs.writeFileSync(pidFile, JSON.stringify(monitorStatus, null, 2));
    console.log('✅ 監控狀態已保存');
  } catch (error) {
    console.warn('⚠️ 無法保存監控狀態文件');
  }
  
  // 對於 Web API 調用，只執行一次測試並返回結果
  // 實際的持續監控需要通過系統級定時任務實現（如 cron）
  console.log('');
  console.log('📋 監控系統配置完成！');
  console.log('💡 提示：在生產環境中，建議使用 cron 定時任務來實現持續監控');
  console.log('💡 範例：在 crontab 中添加：');
  console.log('   */5 * * * * cd /path/to/project && npm run sitemap:test');
  console.log('');
  console.log('🔧 立即測試指令：npm run sitemap:test');
  console.log('🔍 檢查狀態指令：npm run sitemap:status');
}

/**
 * 停止監控
 */
function stopMonitor() {
  const pidFile = path.join(process.cwd(), '.sitemap-monitor.pid');
  
  try {
    if (fs.existsSync(pidFile)) {
      // 清除監控狀態文件
      fs.unlinkSync(pidFile);
      console.log('🛑 監控配置已清除');
      console.log('💡 注意：這只是清除了監控狀態文件');
      console.log('💡 如果使用了系統級定時任務（如 cron），請手動停止');
    } else {
      console.log('⚠️ 沒有找到監控配置文件');
    }
  } catch (error) {
    console.log('⚠️ 監控程序可能已經停止');
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile);
    }
  }
}

/**
 * 查看監控狀態
 */
function getMonitorStatus() {
  const pidFile = path.join(process.cwd(), '.sitemap-monitor.pid');
  const statusData = loadStatus();
  
  console.log('📊 Sitemap 監控狀態\n');
  
  // 檢查監控程序狀態
  if (fs.existsSync(pidFile)) {
    try {
      const pidData = fs.readFileSync(pidFile, 'utf8');
      const monitorInfo = JSON.parse(pidData);
      console.log(`🟢 監控程序: 已配置`);
      console.log(`📅 啟動時間: ${new Date(monitorInfo.startTime).toLocaleString()}`);
      console.log(`🔄 檢測間隔: ${monitorInfo.interval / 60000} 分鐘`);
    } catch (error) {
      // 舊版本的 PID 文件格式
      console.log(`🟢 監控程序: 運行中`);
    }
  } else {
    console.log('🔴 監控程序: 未配置');
  }
  
  // 顯示最後檢測結果
  if (statusData) {
    console.log(`📅 最後更新: ${statusData.lastUpdate}`);
    console.log(`⏱️ 數據時間戳: ${new Date(statusData.timestamp).toLocaleString()}\n`);
    
    console.log('📋 詳細狀態:');
    Object.values(statusData.statusMap).forEach(item => {
      const emoji = item.status === 'success' ? '✅' : item.status === 'warning' ? '⚠️' : '❌';
      console.log(`${emoji} ${item.name}: ${item.statusText}`);
    });
  } else {
    console.log('⚠️ 尚無檢測數據');
  }
}

/**
 * 清除緩存
 */
function clearCache() {
  try {
    if (fs.existsSync(CONFIG.storageFile)) {
      fs.unlinkSync(CONFIG.storageFile);
      console.log('🗑️ 緩存已清除');
    } else {
      console.log('⚠️ 沒有找到緩存文件');
    }
  } catch (error) {
    console.error('❌ 清除緩存失敗:', error.message);
  }
}

/**
 * 主程序
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testAllSitemaps();
      break;
    case 'monitor':
      await startMonitor();
      break;
    case 'stop':
      stopMonitor();
      break;
    case 'status':
      getMonitorStatus();
      break;
    case 'clear-cache':
      clearCache();
      break;
    default:
      console.log(`
🗺️ Sitemap 監控工具

使用方法:
  node sitemap-monitor.js <command>

可用命令:
  test         測試所有 sitemap (單次)
  monitor      配置監控系統 (執行初始檢測)
  stop         停止監控
  status       查看監控狀態
  clear-cache  清除緩存

範例:
  node sitemap-monitor.js test
  node sitemap-monitor.js monitor
  node sitemap-monitor.js status
      `);
      break;
  }
}

// 處理程序退出
process.on('SIGINT', () => {
  console.log('\n🛑 收到退出信號，正在停止監控...');
  if (monitorProcess) {
    clearInterval(monitorProcess);
  }
  process.exit(0);
});

// 如果直接執行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testAllSitemaps,
  startMonitor,
  stopMonitor,
  getMonitorStatus,
  clearCache
};