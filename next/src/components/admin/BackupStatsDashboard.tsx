'use client';

import { useBackupStatus } from '@/hooks/useBackupStatus';
import BackupStatusCard from './BackupStatusCard';
import { RotateCw, ServerCrash, Archive } from 'lucide-react';

export default function BackupStatsDashboard() {
  const { backups, isLoading, isInitialized, refresh } = useBackupStatus();

  const showSkeleton = isLoading && !isInitialized;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <div className="p-2 rounded-full bg-amber-500/10 mr-3">
            <Archive className="h-6 w-6 text-amber-600" />
          </div>
          資料庫備份狀態
        </h2>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-wait transition-all"
        >
          <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          重新整理
        </button>
      </div>

      {isInitialized && backups.length === 0 && !isLoading && (
         <div className="text-center py-10 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
            <ServerCrash className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">找不到備份檔案</h3>
            <p className="mt-1 text-sm text-gray-500">
                系統未在 <code>db/backups</code> 目錄中找到任何 <code>.tar.gz</code> 格式的備份檔案。
            </p>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {(showSkeleton ? backups : backups).map((backup) => (
          <BackupStatusCard key={backup.fileName} backup={backup} />
        ))}
      </div>
    </div>
  );
}