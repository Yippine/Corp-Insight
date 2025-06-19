'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BackupAnalysis } from '@/app/api/admin/backup-stats/route';

export type { BackupAnalysis };

const createInitialStatus = (): BackupAnalysis[] => {
    return Array.from({ length: 3 }).map((_, i) => ({
      fileName: `backup-placeholder-${i}.tar.gz`,
      fileSize: 0,
      collections: {},
      totalRecords: 0,
      modifiedTime: new Date(),
      error: 'loading', // 使用 'loading' 狀態來觸發骨架屏
    }));
};

export function useBackupStatus() {
  const [backups, setBackups] = useState<BackupAnalysis[]>(createInitialStatus());
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchStatus = useCallback(async (isRefreshing = false) => {
    setIsLoading(true);
    if (isRefreshing) {
      setBackups(createInitialStatus());
    }

    try {
      const response = await fetch('/api/admin/backup-stats', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: BackupAnalysis[] = await response.json();
      setBackups(data.length > 0 ? data : []);

    } catch (error) {
      console.error("Failed to fetch backup status:", error);
      setBackups([]); // On error, clear backups
    } finally {
      setIsLoading(false);
      if (!isInitialized) setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    fetchStatus(false);
  }, [fetchStatus]);

  return {
    backups,
    isLoading,
    isInitialized,
    refresh: () => fetchStatus(true),
  };
}