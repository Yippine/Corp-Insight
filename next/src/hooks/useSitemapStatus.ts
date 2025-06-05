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
}

export interface SitemapStatusState {
  [key: string]: SitemapStatusItem;
}

const STORAGE_KEY = 'sitemap-status-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存

// 初始狀態定義
const initialStatus: SitemapStatusState = {
  main: {
    id: 'main',
    name: '主要 Sitemap',
    url: '/sitemap.xml',
    status: 'success',
    description: '靜態頁面 + 動態內容',
    statusText: '隨時可用'
  },
  index: {
    id: 'index',
    name: 'Sitemap Index',
    url: '/sitemap-index.xml',
    status: 'success',
    description: '管理所有 sitemap 索引',
    statusText: '隨時可用'
  },
  companies: {
    id: 'companies',
    name: '企業 Sitemap',
    url: '/sitemap-companies.xml',
    status: 'warning',
    description: '企業詳情頁面',
    statusText: '需資料庫'
  },
  tenders: {
    id: 'tenders',
    name: '標案 Sitemap',
    url: '/sitemap-tenders.xml',
    status: 'warning',
    description: '標案詳情頁面',
    statusText: '需資料庫'
  },
  aitools: {
    id: 'aitools',
    name: 'AI 工具 Sitemap',
    url: '/sitemap-aitools.xml',
    status: 'warning',
    description: 'AI 工具詳情頁面',
    statusText: '需資料庫'
  },
  robots: {
    id: 'robots',
    name: 'robots.txt',
    url: '/robots.txt',
    status: 'success',
    description: '搜索引擎爬蟲指令',
    statusText: '隨時可用'
  }
};

export function useSitemapStatus() {
  const [statusMap, setStatusMap] = useState<SitemapStatusState>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // 從 localStorage 和服務器文件加載緩存
  useEffect(() => {
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
            return true;
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
            
            console.log('📡 同步服務器狀態到本地緩存');
            return true;
          }
        }
      } catch (error) {
        // 服務器文件不存在或網絡錯誤，正常情況
        console.debug('Server status file not available, using local cache');
      }
      return false;
    };

    // 先嘗試從服務器加載，失敗則從本地加載
    loadFromServer().then(success => {
      if (!success) {
        loadFromStorage();
      }
    });
  }, []);

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
      const isXml = text.trim().startsWith('<?xml');

      if (response.ok) {
        updateStatus(id, {
          status: 'success',
          statusText: `✅ 正常 (${responseTime}ms)`,
          responseTime,
          contentLength
        });
      } else {
        updateStatus(id, {
          status: 'error',
          statusText: `❌ 錯誤 ${response.status}`,
          responseTime
        });
      }
    } catch (error) {
      updateStatus(id, {
        status: 'error',
        statusText: '❌ 連接失敗',
        responseTime: undefined
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
    setStatusMap(initialStatus);
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
    updateStatus,
    testSingleSitemap,
    testAllSitemaps,
    resetStatus
  };
}