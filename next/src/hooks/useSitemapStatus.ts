'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SitemapStatusItem {
  id: string;
  name: string;
  url: string;
  status: 'success' | 'warning' | 'error' | 'testing';
  description: string;
  lastChecked?: Date;
  statusText?: string;
  responseTime?: number;
  contentLength?: number;
  dataCount?: number;
  expectedMin?: number;
  expectedTarget?: number;
  dataStatus?: 'empty' | 'low' | 'normal' | 'good' | 'excellent';
}

export interface SitemapStatusState {
  [key: string]: SitemapStatusItem;
}

const STORAGE_KEY = 'sitemap-status-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 預期資料量配置
const DATA_EXPECTATIONS = {
  companies: { min: 10000, target: 50000 },
  tenders: { min: 5000, target: 25000 },
  aitools: { min: 1000, target: 5000 }
};

// 初始狀態定義 - 改為未檢測狀態
const createInitialStatus = (): SitemapStatusState => ({
  main: {
    id: 'main',
    name: '主要 Sitemap',
    url: '/sitemap.xml',
    status: 'testing',
    description: '靜態頁面 + 動態內容',
    statusText: '準備檢測...'
  },
  index: {
    id: 'index',
    name: 'Sitemap Index',
    url: '/sitemap-index.xml',
    status: 'testing',
    description: '管理所有 sitemap 索引',
    statusText: '準備檢測...'
  },
  companies: {
    id: 'companies',
    name: '企業 Sitemap',
    url: '/sitemap-companies.xml',
    status: 'testing',
    description: '企業詳情頁面',
    statusText: '準備檢測...',
    expectedMin: DATA_EXPECTATIONS.companies.min,
    expectedTarget: DATA_EXPECTATIONS.companies.target
  },
  tenders: {
    id: 'tenders',
    name: '標案 Sitemap',
    url: '/sitemap-tenders.xml',
    status: 'testing',
    description: '標案詳情頁面',
    statusText: '準備檢測...',
    expectedMin: DATA_EXPECTATIONS.tenders.min,
    expectedTarget: DATA_EXPECTATIONS.tenders.target
  },
  aitools: {
    id: 'aitools',
    name: 'AI 工具 Sitemap',
    url: '/sitemap-aitools.xml',
    status: 'testing',
    description: 'AI 工具詳情頁面',
    statusText: '準備檢測...',
    expectedMin: DATA_EXPECTATIONS.aitools.min,
    expectedTarget: DATA_EXPECTATIONS.aitools.target
  },
  robots: {
    id: 'robots',
    name: 'robots.txt',
    url: '/robots.txt',
    status: 'testing',
    description: '搜索引擎爬蟲指令',
    statusText: '準備檢測...'
  }
});

export function useSitemapStatus() {
  const [statusMap, setStatusMap] = useState<SitemapStatusState>(() => createInitialStatus());
  const [isLoading, setIsLoading] = useState(true); // 改為默認 loading
  const [isInitialized, setIsInitialized] = useState(false);

  // 從 localStorage 和服務器文件加載緩存
  useEffect(() => {
    const initializeStatus = async () => {
      console.log('🚀 正在初始化 Sitemap 狀態...');
      
      const loadFromStorage = () => {
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            // 檢查緩存是否過期
            if (now - timestamp < CACHE_DURATION) {
              // 轉換日期字符串回 Date 對象
              const parsedData = Object.fromEntries(
                Object.entries(data).map(([key, item]: [string, any]) => [
                  key,
                  {
                    ...item,
                    lastChecked: item.lastChecked ? new Date(item.lastChecked) : undefined
                  }
                ])
              );
              setStatusMap(parsedData);
              console.log('📦 從本地緩存載入狀態');
              return true;
            } else {
              console.log('⏰ 本地緩存已過期');
            }
          }
        } catch (error) {
          console.warn('Failed to load sitemap status cache:', error);
        }
        return false;
      };

      // 嘗試從服務器獲取最新狀態（支援 npm run sitemap:test 的結果）
      const loadFromServer = async () => {
        try {
          const response = await fetch('/.sitemap-status.json');
          if (response.ok) {
            const serverData = await response.json();
            const now = Date.now();
            
            // 檢查服務器數據是否比本地緩存新
            const localData = localStorage.getItem(STORAGE_KEY);
            const localTimestamp = localData ? JSON.parse(localData).timestamp : 0;
            
            if (serverData.timestamp > localTimestamp) {
              // 服務器數據更新，同步到本地
              const parsedData = Object.fromEntries(
                Object.entries(serverData.statusMap).map(([key, item]: [string, any]) => [
                  key,
                  {
                    ...item,
                    lastChecked: item.lastChecked ? new Date(item.lastChecked) : undefined
                  }
                ])
              );
              setStatusMap(parsedData);
              
              // 更新本地緩存
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                data: parsedData,
                timestamp: now
              }));
              
              console.log('📡 從服務器載入最新狀態');
              return true;
            } else {
              console.log('📡 服務器狀態不比本地新');
            }
          }
        } catch (error) {
          // 服務器文件不存在或網絡錯誤，正常情況
          console.debug('Server status file not available');
        }
        return false;
      };

      // 🎯 首次自動檢測邏輯
      const performInitialTest = async () => {
        console.log('🔍 執行首次自動檢測...');
        
        // 更新狀態為檢測中
        setStatusMap(prev => {
          const newStatus = { ...prev };
          Object.keys(newStatus).forEach(id => {
            newStatus[id] = {
              ...newStatus[id],
              status: 'testing',
              statusText: '檢測中...'
            };
          });
          return newStatus;
        });

        try {
          // 並行測試所有項目
          const testPromises = Object.keys(statusMap).map(async (id) => {
            const item = statusMap[id];
            if (!item) return;

            try {
              const startTime = Date.now();
              const response = await fetch(item.url);
              const responseTime = Date.now() - startTime;
              const text = await response.text();
              const contentLength = text.length;

              if (response.ok) {
                // 分析內容並判斷狀態
                const { dataCount, dataStatus, statusText } = analyzeXmlContent(text, id);
                
                // 根據資料狀態決定整體狀態
                let overallStatus: 'success' | 'warning' | 'error';
                if (dataStatus === 'empty' || dataStatus === 'low') {
                  overallStatus = 'warning';
                } else {
                  overallStatus = 'success';
                }

                return {
                  id,
                  updates: {
                    status: overallStatus,
                    statusText: `${statusText} (${responseTime}ms)`,
                    responseTime,
                    contentLength,
                    dataCount,
                    dataStatus: dataStatus as any,
                    lastChecked: new Date()
                  }
                };
              } else {
                return {
                  id,
                  updates: {
                    status: 'error' as const,
                    statusText: `❌ HTTP 錯誤 ${response.status}`,
                    responseTime,
                    dataCount: 0,
                    dataStatus: 'empty' as any,
                    lastChecked: new Date()
                  }
                };
              }
            } catch (error) {
              return {
                id,
                updates: {
                  status: 'error' as const,
                  statusText: '❌ 連接失敗',
                  responseTime: undefined,
                  dataCount: 0,
                  dataStatus: 'empty' as any,
                  lastChecked: new Date()
                }
              };
            }
          });

          const results = await Promise.all(testPromises);
          
          // 批量更新狀態
          setStatusMap(prev => {
            const newStatus = { ...prev };
            results.forEach(result => {
              if (result) {
                newStatus[result.id] = {
                  ...prev[result.id],
                  ...result.updates
                };
              }
            });
            
            // 保存到緩存
            const cacheData = {
              data: newStatus,
              timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
            
            return newStatus;
          });
          
          console.log('✅ 自動檢測完成');
        } catch (error) {
          console.error('❌ 自動檢測失敗:', error);
          // 檢測失敗時，設置為錯誤狀態
          setStatusMap(prev => {
            const newStatus = { ...prev };
            Object.keys(newStatus).forEach(id => {
              newStatus[id] = {
                ...newStatus[id],
                status: 'error',
                statusText: '❌ 檢測失敗'
              };
            });
            return newStatus;
          });
        }
      };

      // 執行載入邏輯
      const hasCache = loadFromStorage();
      const hasServerData = await loadFromServer();
      
      // 如果沒有任何快取資料，執行首次自動檢測
      if (!hasCache && !hasServerData) {
        await performInitialTest();
      }
      
      setIsInitialized(true);
      setIsLoading(false);
    };

    if (!isInitialized) {
      initializeStatus();
    }
  }, [isInitialized]);

  // 保存到 localStorage
  const saveToCache = useCallback((data: SitemapStatusState) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save sitemap status cache:', error);
    }
  }, []);

  // 更新單個項目狀態
  const updateStatus = useCallback((id: string, updates: Partial<SitemapStatusItem>) => {
    setStatusMap(prev => {
      const newStatus = {
        ...prev,
        [id]: {
          ...prev[id],
          ...updates,
          lastChecked: new Date()
        }
      };
      saveToCache(newStatus);
      return newStatus;
    });
  }, [saveToCache]);

  // 分析 XML 內容並計算資料量
  const analyzeXmlContent = (text: string, id: string): { dataCount: number; dataStatus: string; statusText: string } => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        return { dataCount: 0, dataStatus: 'empty', statusText: '❌ XML 格式錯誤' };
      }

      const urls = xmlDoc.getElementsByTagName('url');
      const sitemaps = xmlDoc.getElementsByTagName('sitemap');
      const totalItems = urls.length + sitemaps.length;
      
      // 對於靜態檔案（非動態資料），直接回傳成功
      if (!['companies', 'tenders', 'aitools'].includes(id)) {
        return { 
          dataCount: totalItems, 
          dataStatus: 'normal', 
          statusText: `✅ 正常 (${totalItems} 個項目)` 
        };
      }

      // 動態資料的業務邏輯判斷
      const expected = DATA_EXPECTATIONS[id as keyof typeof DATA_EXPECTATIONS];
      if (!expected) {
        return { dataCount: totalItems, dataStatus: 'normal', statusText: `✅ 正常 (${totalItems} 個項目)` };
      }

      let dataStatus: string;
      let statusText: string;
      
      if (totalItems === 0) {
        dataStatus = 'empty';
        statusText = '⚠️ 資料為空，需要資料庫';
      } else if (totalItems < expected.min * 0.1) {
        dataStatus = 'low';
        statusText = `⚠️ 資料太少 (${totalItems}/${expected.min})，需要更多資料`;
      } else if (totalItems < expected.min) {
        dataStatus = 'normal';
        statusText = `✅ 有資料但未達標 (${totalItems}/${expected.min})`;
      } else if (totalItems < expected.target) {
        dataStatus = 'good';
        statusText = `✅ 資料良好 (${totalItems}/${expected.target})`;
      } else {
        dataStatus = 'excellent';
        statusText = `🎉 資料充足 (${totalItems}/${expected.target})`;
      }

      return { dataCount: totalItems, dataStatus, statusText };
    } catch (error) {
      return { dataCount: 0, dataStatus: 'empty', statusText: '❌ 解析失敗' };
    }
  };

  // 測試單個 sitemap
  const testSingleSitemap = useCallback(async (id: string): Promise<void> => {
    const item = statusMap[id];
    if (!item) return;

    updateStatus(id, { status: 'testing', statusText: '測試中...' });

    try {
      const startTime = Date.now();
      const response = await fetch(item.url);
      const responseTime = Date.now() - startTime;
      const text = await response.text();
      const contentLength = text.length;

      if (response.ok) {
        // 分析內容並判斷狀態
        const { dataCount, dataStatus, statusText } = analyzeXmlContent(text, id);
        
        // 根據資料狀態決定整體狀態
        let overallStatus: 'success' | 'warning' | 'error';
        if (dataStatus === 'empty' || dataStatus === 'low') {
          overallStatus = 'warning';
        } else {
          overallStatus = 'success';
        }

        updateStatus(id, {
          status: overallStatus,
          statusText: `${statusText} (${responseTime}ms)`,
          responseTime,
          contentLength,
          dataCount,
          dataStatus: dataStatus as any
        });
      } else {
        updateStatus(id, {
          status: 'error',
          statusText: `❌ HTTP 錯誤 ${response.status}`,
          responseTime,
          dataCount: 0,
          dataStatus: 'empty'
        });
      }
    } catch (error) {
      updateStatus(id, {
        status: 'error',
        statusText: '❌ 連接失敗',
        responseTime: undefined,
        dataCount: 0,
        dataStatus: 'empty'
      });
    }
  }, [statusMap, updateStatus]);

  // 測試所有 sitemap
  const testAllSitemaps = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // 並行測試所有項目
      const testPromises = Object.keys(statusMap).map(id => testSingleSitemap(id));
      await Promise.all(testPromises);
    } finally {
      setIsLoading(false);
    }
  }, [statusMap, testSingleSitemap]);

  // 重置為初始狀態
  const resetStatus = useCallback(() => {
    setStatusMap(createInitialStatus());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 獲取狀態數組（用於渲染）
  const statusList = Object.values(statusMap);

  // 統計信息
  const stats = {
    total: statusList.length,
    success: statusList.filter(item => item.status === 'success').length,
    warning: statusList.filter(item => item.status === 'warning').length,
    error: statusList.filter(item => item.status === 'error').length,
    testing: statusList.filter(item => item.status === 'testing').length
  };

  return {
    statusMap,
    statusList,
    stats,
    isLoading,
    isInitialized,
    updateStatus,
    testSingleSitemap,
    testAllSitemaps,
    resetStatus
  };
}