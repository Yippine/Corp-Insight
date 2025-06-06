'use client';

import React, { useState } from 'react';
import { useSitemapStatus } from '@/hooks/useSitemapStatus';
import SitemapStatsDashboard from '@/components/sitemap/SitemapStatsDashboard';
import SitemapStatusCard from '@/components/sitemap/SitemapStatusCard';

export default function SitemapManager() {
  const {
    statusList,
    stats,
    isLoading,
    isInitialized,
    testSingleSitemap,
    testAllSitemaps,
    resetStatus
  } = useSitemapStatus();

  const [selectedSitemap, setSelectedSitemap] = useState<string>('');
  const [sitemapData, setSitemapData] = useState<string>('');
  const [loadingData, setLoadingData] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [isRunningCommand, setIsRunningCommand] = useState(false);

  // 查看詳細內容
  const handleViewDetails = async (url: string) => {
    setLoadingData(true);
    try {
      const response = await fetch(url);
      const data = await response.text();
      setSitemapData(data);
      setSelectedSitemap(url);
      // 滾動到內容顯示區域
      document.getElementById('sitemap-content')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error) {
      setSitemapData('載入失敗：' + (error as Error).message);
    } finally {
      setLoadingData(false);
    }
  };

  // 在新視窗中開啟
  const openInNewWindow = (url: string) => {
    window.open(url, '_blank');
  };

  // 驗證內容格式 (XML 或 robots.txt)
  const validateContent = () => {
    if (!sitemapData) return;
    
    // 檢測是否為 robots.txt
    if (selectedSitemap.includes('robots.txt')) {
      validateRobotsTxt();
    } else {
      validateXML();
    }
  };

  // 驗證 robots.txt 格式
  const validateRobotsTxt = () => {
    const lines = sitemapData.trim().split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    let userAgentCount = 0;
    let sitemapCount = 0;
    let allowCount = 0;
    let disallowCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 跳過空行和註釋
      if (!line || line.startsWith('#')) continue;
      
      if (line.toLowerCase().startsWith('user-agent:')) {
        userAgentCount++;
      } else if (line.toLowerCase().startsWith('sitemap:')) {
        sitemapCount++;
        const sitemapUrl = line.split(':', 2)[1].trim();
        if (!sitemapUrl.startsWith('http')) {
          warnings.push(`第 ${i + 1} 行：Sitemap URL 建議使用完整的 HTTP/HTTPS 路徑`);
        }
      } else if (line.toLowerCase().startsWith('allow:')) {
        allowCount++;
      } else if (line.toLowerCase().startsWith('disallow:')) {
        disallowCount++;
      } else if (line.toLowerCase().startsWith('crawl-delay:')) {
        const delay = line.split(':', 2)[1].trim();
        if (isNaN(Number(delay))) {
          errors.push(`第 ${i + 1} 行：Crawl-delay 值必須是數字`);
        }
      } else if (line.includes(':')) {
        // 可能是其他有效指令，暫不報錯
      } else {
        warnings.push(`第 ${i + 1} 行：未識別的指令格式 "${line}"`);
      }
    }

    // 基本驗證
    if (userAgentCount === 0) {
      errors.push('缺少 User-agent 指令');
    }
    
    if (sitemapCount === 0) {
      warnings.push('建議添加 Sitemap 指令');
    }

    // 生成報告
    let report = '';
    if (errors.length === 0) {
      report += '✅ robots.txt 格式驗證通過！\n\n';
    } else {
      report += '❌ 發現格式錯誤：\n' + errors.join('\n') + '\n\n';
    }

    report += `📊 統計信息：\n`;
    report += `- User-agent: ${userAgentCount} 個\n`;
    report += `- Allow: ${allowCount} 個\n`;
    report += `- Disallow: ${disallowCount} 個\n`;
    report += `- Sitemap: ${sitemapCount} 個\n`;
    report += `- 總行數: ${lines.length} 行\n`;

    if (warnings.length > 0) {
      report += `\n⚠️ 建議改進：\n` + warnings.join('\n');
    }

    alert(report);
  };

  // 驗證 XML 格式
  const validateXML = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sitemapData, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        alert('❌ XML 格式錯誤\n\n' + parseError[0].textContent);
      } else {
        const urls = xmlDoc.getElementsByTagName('url');
        const sitemaps = xmlDoc.getElementsByTagName('sitemap');
        const totalItems = urls.length + sitemaps.length;
        alert(`✅ XML 格式正確！\n\n包含 ${totalItems} 個項目\n- URL: ${urls.length}\n- Sitemap: ${sitemaps.length}`);
      }
    } catch (error) {
      alert('❌ 驗證失敗\n\n' + (error as Error).message);
    }
  };

  // 執行 npm 指令 - 加入自動刷新機制
  const executeNpmCommand = async (command: string, description: string) => {
    setIsRunningCommand(true);
    setCommandOutput(`🚀 正在執行：${description}\n\n指令：npm run ${command}\n\n⏳ 請稍候...\n`);
    
    try {
      const response = await fetch('/api/sitemap-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCommandOutput(result.output);
        
        // 🎯 關鍵改進：所有命令執行後都自動刷新狀態
        console.log('✅ 命令執行完成，正在刷新狀態...');
        
        // 短暫延遲後刷新，確保服務器端狀態已更新
        setTimeout(async () => {
          await testAllSitemaps();
          console.log('🔄 狀態刷新完成');
        }, 1000);
        
      } else {
        const errorMessage = result.error || result.details || '未知錯誤';
        setCommandOutput(prev => prev + `❌ 執行失敗：${errorMessage}\n\n💡 請檢查服務器日誌或在終端機中手動執行：npm run ${command}`);
      }
    } catch (error) {
      setCommandOutput(prev => prev + `❌ 網絡錯誤：${(error as Error).message}\n\n💡 請檢查服務器是否正常運行，或在終端機中手動執行：npm run ${command}`);
    } finally {
      setIsRunningCommand(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 統計儀表板 */}
      <SitemapStatsDashboard
        stats={stats}
        isLoading={isLoading}
        isInitialized={isInitialized}
        onTestAll={testAllSitemaps}
        onReset={resetStatus}
      />

      {/* 狀態卡片網格 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📋 詳細狀態監控</h2>
            <p className="text-sm text-gray-600 mt-1">每個 Sitemap 的深度分析與資料量統計</p>
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <span>共 {statusList.length} 個項目</span>
            {!isInitialized && (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-600">初始化中...</span>
              </div>
            )}
            {isInitialized && isLoading && (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-600">更新中...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statusList.map((item) => (
            <SitemapStatusCard
              key={item.id}
              item={item}
              onTest={testSingleSitemap}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      {/* 內容查看器 */}
      {sitemapData && (
        <div id="sitemap-content" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* 頭部工具列 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">📄 內容查看器</h3>
                <p className="text-sm text-gray-600">
                  {selectedSitemap && (
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                      {selectedSitemap}
                    </code>
                  )}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={validateContent}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  ✅ 驗證格式
                </button>
                <button
                  onClick={() => selectedSitemap && openInNewWindow(selectedSitemap)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  🔗 新視窗開啟
                </button>
                <button
                  onClick={() => {
                    setSitemapData('');
                    setSelectedSitemap('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  ✕ 關閉
                </button>
              </div>
            </div>
          </div>

          {/* 內容區域 */}
          <div className="p-6">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">載入中...</span>
                </div>
              </div>
            ) : (
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border max-h-96 whitespace-pre-wrap break-words">
                {sitemapData}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* 技術文檔與更新頻率 */}
      <div className="space-y-6">
        {/* 技術文檔 - 設計為 2x2 網格佈局 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 flex items-center">
            📚 技術文檔與架構說明
          </h2>
          
          {/* 2x2 網格佈局，確保完美對齊 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 第一行 */}
            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                🗂️ Sitemap 架構
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="text-base text-gray-700 font-mono leading-relaxed">
{`sitemap-index.xml (主索引)
├── sitemap.xml (靜態頁面)
├── sitemap-companies.xml (企業頁面)
├── sitemap-tenders.xml (標案頁面)
└── sitemap-aitools.xml (AI工具頁面)`}
                </pre>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                📊 狀態說明
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 text-sm">✅</span>
                  <span className="text-green-700 text-base"><strong>正常</strong>：狀態良好，隨時可用</span>
                </div>
                <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 text-sm">⚠️</span>
                  <span className="text-yellow-700 text-base"><strong>警告</strong>：需要 MongoDB 數據</span>
                </div>
                <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-sm">❌</span>
                  <span className="text-red-700 text-base"><strong>錯誤</strong>：需要修復</span>
                </div>
                <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-sm">🔄</span>
                  <span className="text-blue-700 text-base"><strong>測試中</strong>：正在檢測狀態</span>
                </div>
              </div>
            </div>

            {/* 第二行 */}
            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                ⚡ 緩存策略
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">狀態緩存</span>
                  <span className="text-blue-600 font-medium">5 分鐘 (localStorage)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">靜態頁面</span>
                  <span className="text-blue-600 font-medium">1 小時</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">動態內容</span>
                  <span className="text-blue-600 font-medium">2-4 小時</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">開發環境</span>
                  <span className="text-blue-600 font-medium">即時更新</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                🔧 使用說明
              </h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-base text-gray-700">點擊卡片上的「重新測試」檢測單個項目</span>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-base text-gray-700">使用「測試所有 Sitemap」批次檢測</span>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-base text-gray-700">點擊「查看」按鈕檢視詳細內容</span>
                </div>
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-base text-gray-700">狀態會自動快取，避免重複請求</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 更新頻率設定 - 加入業務邏輯里程碑 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-8 flex items-center">
            ⏰ 更新頻率與業務里程碑
          </h2>
          
          {/* 2x2 網格佈局，確保完美對齊 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 第一行 */}
            <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                🏠 靜態頁面
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">首頁</span>
                  <span className="text-green-600 font-medium">daily (每日更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">搜尋頁面</span>
                  <span className="text-green-600 font-medium">hourly (每小時更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">FAQ</span>
                  <span className="text-green-600 font-medium">monthly (每月更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">隱私政策</span>
                  <span className="text-green-600 font-medium">monthly (每月更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">回饋頁面</span>
                  <span className="text-green-600 font-medium">weekly (每週更新)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                🏢 企業資料頁面
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">企業詳情</span>
                  <span className="text-green-600 font-medium">weekly (每週更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">企業搜尋結果</span>
                  <span className="text-green-600 font-medium">daily (每日更新)</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">里程碑 1</span>
                    <span className="text-blue-700 font-medium">1,000+ 企業</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">基礎資料庫建立</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-800">里程碑 2</span>
                    <span className="text-yellow-700 font-medium">10,000+ 企業</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">達到最低運營標準</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">里程碑 3</span>
                    <span className="text-green-700 font-medium">50,000+ 企業</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">達到目標資料規模</p>
                </div>
              </div>
            </div>

            {/* 第二行 */}
            <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                📋 標案資料頁面
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">標案詳情</span>
                  <span className="text-green-600 font-medium">monthly (每月更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">標案搜尋結果</span>
                  <span className="text-green-600 font-medium">weekly (每週更新)</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">里程碑 1</span>
                    <span className="text-blue-700 font-medium">500+ 標案</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">基礎標案資料庫</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-800">里程碑 2</span>
                    <span className="text-yellow-700 font-medium">5,000+ 標案</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">達到最低運營標準</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">里程碑 3</span>
                    <span className="text-green-700 font-medium">25,000+ 標案</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">達到目標資料規模</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                🤖 AI 工具頁面
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">AI 工具詳情</span>
                  <span className="text-green-600 font-medium">weekly (每週更新)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">AI 工具搜尋結果</span>
                  <span className="text-green-600 font-medium">daily (每日更新)</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">里程碑 1</span>
                    <span className="text-blue-700 font-medium">100+ 工具</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">基礎工具資料庫</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-800">里程碑 2</span>
                    <span className="text-yellow-700 font-medium">1,000+ 工具</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">達到最低運營標準</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">里程碑 3</span>
                    <span className="text-green-700 font-medium">5,000+ 工具</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">達到目標資料規模</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 自動化管理 - 重新設計為兩行佈局 */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-8 flex items-center">
            🤖 自動化管理與命令列工具
          </h2>
          
          {/* 第一行：可用命令 + 自動化特性 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 可用命令區塊 */}
            <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                🔄 可用命令
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="text-base text-gray-700 font-mono leading-relaxed">
{`# 測試所有 Sitemap
npm run sitemap:test

# 啟動自動監控
npm run sitemap:monitor

# 停止自動監控
npm run sitemap:stop

# 查看監控狀態
npm run sitemap:status

# 清除緩存
npm run sitemap:clear`}
                </pre>
              </div>
            </div>

            {/* 自動化特性區塊 */}
            <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                ⚙️ 自動化特性
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800 text-base mb-1">🔄 狀態同步</h4>
                  <p className="text-base text-purple-700">終端機測試結果自動同步到儀表板</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800 text-base mb-1">💾 持久化存儲</h4>
                  <p className="text-base text-purple-700">使用 localStorage 保存測試結果</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800 text-base mb-1">⚡ 即時更新</h4>
                  <p className="text-base text-purple-700">頁面重新開啟時自動檢查最新狀態</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800 text-base mb-1">🧠 智能緩存</h4>
                  <p className="text-base text-purple-700">5 分鐘緩存避免重複檢測</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800 text-base mb-1">☁️ AWS EC2 就緒</h4>
                  <p className="text-base text-purple-700">支援雲端環境自動化部署</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-800 text-base mb-1">🔧 錯誤恢復</h4>
                  <p className="text-base text-purple-700">自動重試機制，確保穩定性</p>
                </div>
              </div>
            </div>
          </div>

          {/* 第二行：快速操作 + 終端機輸出 */}
          <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-800 mb-6 flex items-center">
              🎛️ 快速操作
            </h3>
            
            {/* 五個按鈕一排 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <button
                onClick={() => executeNpmCommand('sitemap:test', '測試所有 Sitemap')}
                disabled={isRunningCommand}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-all duration-200 text-base font-semibold flex items-center justify-center hover:shadow-lg hover:scale-105"
              >
                🧪 測試
              </button>
              <button
                onClick={() => executeNpmCommand('sitemap:status', '查看監控狀態')}
                disabled={isRunningCommand}
                className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all duration-200 text-base font-semibold flex items-center justify-center hover:shadow-lg hover:scale-105"
              >
                📊 狀態
              </button>
              <button
                onClick={() => executeNpmCommand('sitemap:monitor', '啟動自動監控')}
                disabled={isRunningCommand}
                className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-all duration-200 text-base font-semibold flex items-center justify-center hover:shadow-lg hover:scale-105"
              >
                🚀 啟動
              </button>
              <button
                onClick={() => executeNpmCommand('sitemap:stop', '停止自動監控')}
                disabled={isRunningCommand}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-all duration-200 text-base font-semibold flex items-center justify-center hover:shadow-lg hover:scale-105"
              >
                🛑 停止
              </button>
              <button
                onClick={() => executeNpmCommand('sitemap:clear', '清除所有緩存')}
                disabled={isRunningCommand}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-all duration-200 text-base font-semibold flex items-center justify-center hover:shadow-lg hover:scale-105 md:col-span-1 col-span-2"
              >
                🧹 清除緩存
              </button>
            </div>

            {/* 整合的終端機輸出區域 */}
            {commandOutput && (
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm border-2 border-purple-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-300 font-semibold">💻 終端機輸出</span>
                  <button
                    onClick={() => setCommandOutput('')}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                  >
                    ✕ 關閉
                  </button>
                </div>
                {isRunningCommand && (
                  <div className="flex items-center mb-2">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>執行中...</span>
                  </div>
                )}
                <pre className="whitespace-pre-wrap break-words">
                  {commandOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}