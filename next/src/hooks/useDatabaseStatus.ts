'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatBytes } from '@/lib/utils/formatters';

export interface CollectionStats {
  name: string;
  description?: string;
  count: number | string;
  size: number;
  avgObjSize: number;
  storageSize: number;
  totalIndexSize: number;
  lastBackupDate: string | null;
  status: 'ok' | 'empty' | 'warning' | 'error' | 'testing';
}

export interface DatabaseOverallStats {
  connection: boolean;
  collections: number;
  objects: string; // Formatted string
  dataSize: { value: string; unit: string };
  latestBackupDate: string;
  backupCount: number;
}

const collectionInitialState: { name: string, description: string }[] = [
    { name: 'companies', description: '企業資料集合' },
    { name: 'tenders', description: '政府標案資料集合' },
    { name: 'ai_tools', description: 'AI 工具資料集合' },
    { name: 'feedbacks', description: '使用者意見回饋' },
    { name: 'pcc_api_cache', description: '政府採購網 API 快取' },
    { name: 'g0v_company_api_cache', description: 'G0V 企業資料 API 快取' },
    { name: 'twincn_api_cache', description: '台灣企業網 API 快取' }
];

const createInitialStatus = (): CollectionStats[] => {
    return collectionInitialState.map(col => ({
        name: col.name,
        description: col.description,
        count: '---',
        size: 0,
        avgObjSize: 0,
        storageSize: 0,
        totalIndexSize: 0,
        lastBackupDate: '---',
        status: 'testing',
    }));
};

const calculateStatus = (count: number): 'ok' | 'empty' | 'warning' => {
    if (count === 0) return 'empty';
    if (count < 10) return 'warning';
    return 'ok';
}

export function useDatabaseStatus() {
  const [collectionDetails, setCollectionDetails] = useState<CollectionStats[]>(createInitialStatus);
  const [stats, setStats] = useState<DatabaseOverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true); // Always set loading to true on fetch
    try {
      const response = await fetch('/api/admin/database-stats', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}` },
        cache: 'no-store', // 確保獲取最新數據
      });

      if (!response.ok) {
        throw new Error(`API 請求失敗，狀態碼：${response.status}`);
      }

      const data = await response.json();

      // 更新狀態，但保留初始的 description
      const updatedDetails = createInitialStatus().map(initialState => {
          const detail = data.collectionDetails?.find((d: CollectionStats) => d.name === initialState.name);
          if (detail) {
            return { 
                ...initialState, 
                ...detail,
                status: calculateStatus(detail.count as number)
            };
          }
          return initialState;
      });
      setCollectionDetails(updatedDetails);

      // 處理儀表板的總體狀態
      const formattedStats: DatabaseOverallStats = {
        connection: data.connection,
        collections: data.collections,
        objects: data.objects.toLocaleString(),
        dataSize: formatBytes(data.dataSize),
        latestBackupDate: data.latestBackupDate ? new Date(data.latestBackupDate).toLocaleString('zh-TW') : '無',
        backupCount: data.backupCount,
      };
      setStats(formattedStats);

    } catch (error) {
      console.error("獲取資料庫狀態失敗:", error);
      // 出錯時重置回初始測試狀態
      setCollectionDetails(createInitialStatus());
      setStats({
        connection: false,
        collections: 0,
        objects: '0',
        dataSize: formatBytes(0),
        latestBackupDate: '獲取失敗',
        backupCount: 0,
      });
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    collectionDetails,
    stats,
    isLoading,
    isInitialized,
    refresh: fetchStats, // 提供一個手動刷新的方法
  };
}