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
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  storageFile: path.join(__dirname, '..', '.sitemap-status.json'),
  pidFile: path.join(__dirname, '..', '.sitemap-monitor.pid'),
  lockFile: path.join(__dirname, '..', '.sitemap-monitor.lock'),
  interval: 24 * 60 * 60 * 1000, // 每日執行
  cronSchedule: '0 6 * * *', // 每天早上 6:00 (台灣時間)
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

let monitorInterval = null;

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
 * 檢查是否已在監控
 */
function isMonitorRunning() {
  if (!fs.existsSync(CONFIG.pidFile)) {
    return { running: false };
  }
  
  try {
    const pidData = JSON.parse(fs.readFileSync(CONFIG.pidFile, 'utf8'));
    return {
      running: true,
      info: pidData
    };
  } catch (error) {
    // PID 文件損壞，清除它
    fs.unlinkSync(CONFIG.pidFile);
    return { running: false };
  }
}

/**
 * 監控執行函數
 */
async function runMonitorCycle() {
  try {
    console.log(`\n🔄 [${new Date().toLocaleString()}] 執行定期檢測`);
    await testAllSitemaps();
    
    // 更新 PID 文件的最後檢查時間
    if (fs.existsSync(CONFIG.pidFile)) {
      const monitorStatus = JSON.parse(fs.readFileSync(CONFIG.pidFile, 'utf8'));
      monitorStatus.lastCheck = new Date().toISOString();
      fs.writeFileSync(CONFIG.pidFile, JSON.stringify(monitorStatus, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 監控週期執行失敗:', error.message);
  }
}

/**
 * 啟動監控系統 (背景模式)
 */
async function startMonitor() {
  const monitorStatus = isMonitorRunning();
  
  if (monitorStatus.running) {
    console.log('⚠️ 監控系統已在運行中');
    console.log(`📅 啟動時間: ${new Date(monitorStatus.info.startTime).toLocaleString()}`);
    console.log('🔄 檢測間隔: 每日');
    console.log('💡 如需重啟，請先執行停止指令');
    return;
  }
  
  console.log('🚀 啟動 Sitemap 監控系統 (背景模式)');
  console.log('📅 執行時間: 每天早上 6:00 (台灣時間)');
  console.log(`🌐 目標 URL: ${CONFIG.baseUrl}`);
  
  // 使用 child_process.fork 啟動背景進程
  const { fork } = require('child_process');
  const child = fork(__filename, ['--daemon'], {
    detached: true,
    stdio: 'ignore',
    cwd: process.cwd()
  });

  // 脫離父進程
  child.unref();

  // 創建 PID 文件
  const pidData = {
    status: 'running',
    startTime: new Date().toISOString(),
    pid: child.pid,
    interval: CONFIG.interval,
    lastCheck: new Date().toISOString(),
    mode: 'background'
  };
  
  try {
    fs.writeFileSync(CONFIG.pidFile, JSON.stringify(pidData, null, 2));
    console.log('✅ 監控狀態已保存');
  } catch (error) {
    console.warn('⚠️ 無法保存監控狀態文件');
    return;
  }

  console.log(`📍 背景進程 PID: ${child.pid}`);
  console.log('✅ 監控系統已啟動！背景進程正在運行');
  console.log('🔧 查看狀態：npm run sitemap:status');
  console.log('🛑 停止監控：npm run sitemap:stop');
  
  // 立即退出主進程，釋放終端
  process.exit(0);
}

/**
 * 背景監控進程主函數
 */
async function runDaemon() {
  console.log('🚀 Sitemap 監控背景進程啟動');
  console.log('🔄 檢測間隔: 每日');
  console.log('📅 執行時間: 每天早上 6:00 (台灣時間)');
  console.log(`🌐 目標 URL: ${CONFIG.baseUrl}`);
  console.log(`📍 進程 PID: ${process.pid}\n`);
  
  // 立即執行一次檢測
  await runMonitorCycle();
  
  // 啟動定時器
  monitorInterval = setInterval(() => {
    runMonitorCycle();
  }, CONFIG.interval);
  
  // 優雅關閉處理
  process.on('SIGINT', () => {
    console.log('\n🛑 收到停止信號 (SIGINT)，正在關閉監控...');
    cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 收到終止信號 (SIGTERM)，正在關閉監控...');
    cleanup();
    process.exit(0);
  });
  
  process.on('exit', () => {
    cleanup();
  });
  
  console.log('💡 背景監控程序已啟動，將定期執行檢測');
  console.log('🔧 可通過 npm run sitemap:stop 停止監控\n');
}

/**
 * 清理資源
 */
function cleanup() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('✅ 定時器已停止');
  }
}

/**
 * 停止監控
 */
function stopMonitor() {
  const monitorStatus = isMonitorRunning();
  
  if (!monitorStatus.running) {
    console.log('ℹ️ 監控系統未在運行');
    return;
  }
  
  console.log('🛑 正在停止 Sitemap 監控系統...');
  
  try {
    // 嘗試發送停止信號給監控進程
    if (monitorStatus.info.pid) {
      try {
        // 先嘗試優雅關閉
        process.kill(monitorStatus.info.pid, 'SIGTERM');
        console.log(`🛑 已發送停止信號給進程 ${monitorStatus.info.pid}`);
        
        // 等待一段時間後檢查進程是否還在運行
        setTimeout(() => {
          try {
            // 檢查進程是否還存在
            process.kill(monitorStatus.info.pid, 0);
            // 如果進程還在，強制終止
            console.log('⚠️ 進程仍在運行，執行強制終止...');
            process.kill(monitorStatus.info.pid, 'SIGKILL');
            console.log('🔨 已強制終止進程');
          } catch (error) {
            // 進程已經停止
            console.log('✅ 進程已正常停止');
          }
        }, 2000);
        
      } catch (error) {
        console.log('⚠️ 進程可能已經停止');
      }
    }
    
    // 清除監控狀態文件
    if (fs.existsSync(CONFIG.pidFile)) {
      fs.unlinkSync(CONFIG.pidFile);
      console.log('✅ 監控配置已清除');
    }
    
    console.log('🏁 監控系統已停止');
    
  } catch (error) {
    console.error('❌ 停止監控失敗:', error.message);
    
    // 強制清除狀態文件
    if (fs.existsSync(CONFIG.pidFile)) {
      fs.unlinkSync(CONFIG.pidFile);
      console.log('🧹 已強制清除監控狀態文件');
    }
  }
}

/**
 * 查看監控狀態
 */
function getMonitorStatus() {
  const monitorStatus = isMonitorRunning();
  const statusData = loadStatus();
  
  console.log('📊 Sitemap 監控狀態\n');
  
  // 檢查監控程序狀態
  if (monitorStatus.running) {
    console.log(`🟢 監控程序: 運行中`);
    console.log(`📅 啟動時間: ${new Date(monitorStatus.info.startTime).toLocaleString()}`);
    console.log(`🔄 檢測間隔: ${monitorStatus.info.interval / 60000} 分鐘`);
    console.log(`📍 進程 PID: ${monitorStatus.info.pid}`);
    if (monitorStatus.info.lastCheck) {
      console.log(`⏰ 最後檢測: ${new Date(monitorStatus.info.lastCheck).toLocaleString()}`);
    }
  } else {
    console.log('🔴 監控程序: 未運行');
  }
  
  console.log('\n' + '='.repeat(50));
  
  // 顯示最後檢測結果
  if (statusData) {
    console.log(`📅 數據更新時間: ${statusData.lastUpdate}`);
    console.log(`⏱️ 數據時間戳: ${new Date(statusData.timestamp).toLocaleString()}\n`);
    
    console.log('📋 Sitemap 詳細狀態:');
    Object.values(statusData.statusMap).forEach(item => {
      const emoji = item.status === 'success' ? '✅' : item.status === 'warning' ? '⚠️' : '❌';
      console.log(`${emoji} ${item.name}: ${item.statusText}`);
    });
  } else {
    console.log('⚠️ 尚無檢測數據，請先執行測試');
    console.log('💡 執行指令：npm run sitemap:test');
  }
}

/**
 * 清除緩存
 */
function clearCache() {
  try {
    const cacheFiles = [
      { file: CONFIG.storageFile, name: '狀態緩存' },
      { file: CONFIG.pidFile, name: '監控配置' },
      { file: CONFIG.lockFile, name: '鎖定文件' }
    ];
    
    let clearedCount = 0;
    
    cacheFiles.forEach(({ file, name }) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`🗑️ 已清除：${name} (${path.basename(file)})`);
          clearedCount++;
        } catch (error) {
          console.warn(`⚠️ 清除 ${name} 失敗:`, error.message);
        }
      }
    });
    
    if (clearedCount > 0) {
      console.log(`✅ 成功清除 ${clearedCount} 個緩存文件`);
      console.log('💡 所有緩存和監控狀態已重置');
    } else {
      console.log('ℹ️ 沒有找到需要清除的緩存文件');
      console.log('💡 系統已是乾淨狀態');
    }
    
  } catch (error) {
    console.error('❌ 清除緩存失敗:', error.message);
  }
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 檢查是否為背景進程模式
  if (args.includes('--daemon')) {
    await runDaemon();
    return;
  }
  
  const command = args[0];
  
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
      console.log('📋 Sitemap 監控系統\n');
      console.log('使用方法:');
      console.log('  npm run sitemap:test        - 執行單次檢測');
      console.log('  npm run sitemap:monitor     - 啟動背景監控');
      console.log('  npm run sitemap:stop        - 停止監控');
      console.log('  npm run sitemap:status      - 查看監控狀態');
      console.log('  npm run sitemap:clear - 清除所有緩存');
      break;
  }
}

// 當直接執行此腳本時運行主函數
if (require.main === module) {
  main().catch(console.error);
}