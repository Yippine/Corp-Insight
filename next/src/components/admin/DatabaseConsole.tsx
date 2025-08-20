'use client';

import React, { useState, useCallback } from 'react';
import TerminalViewer from './TerminalViewer';
import DatabaseStatsDashboard from './DatabaseStatsDashboard';
import BackupStatsDashboard from './BackupStatsDashboard';
import CollectionStatusCard from './CollectionStatusCard';
import { PlayCircle, Database, Loader2, RotateCw } from 'lucide-react';
import { useDatabaseStatus } from '@/hooks/useDatabaseStatus';

type Task = {
  id: string;
  name: string;
  description: string;
};

const tasks: Task[] = [
  {
    id: 'db:connect',
    name: '連線測試（db:connect）',
    description: '測試與 Docker 中的 MongoDB 資料庫的連線。',
  },
  {
    id: 'db:backup',
    name: '完整備份（db:backup）',
    description: '執行一次當前資料庫的完整備 GZ 壓縮檔。',
  },
  {
    id: 'db:full-restore',
    name: '一鍵還原（db:full-restore）',
    description: '從最新的完整備份中還原所有資料與索引。',
  },
  {
    id: 'db:restore',
    name: '僅還原資料（db:restore）',
    description: '從最新的備份還原資料，但不包含索引。',
  },
  {
    id: 'db:init',
    name: '初始化索引（db:init）',
    description: '根據最新的 Schema 設定，建立或更新所有集合的索引。',
  },
  {
    id: 'db:backup:core',
    name: '核心備份（db:backup:core）',
    description: '僅備份核心資料集合。',
  },
  {
    id: 'db:clean',
    name: '清理過期快取（db:clean）',
    description:
      '遍歷所有快取集合（如 `pcc_api_cache`），並刪除其中超過一天有效期的舊資料。此操作不會刪除集合本身。',
  },
];

export default function DatabaseConsole() {
  const { collectionDetails, stats, isLoading, isInitialized, refresh } =
    useDatabaseStatus();

  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalTitle, setTerminalTitle] = useState('');
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleExecuteScript = useCallback(async (task: Task) => {
    setActiveTask(task);
    setTerminalTitle(task.name);
    setTerminalOutput('');
    setIsTerminalRunning(true);
    setIsTerminalVisible(true);

    const response = await fetch('/api/admin/run-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}`,
      },
      body: JSON.stringify({ scriptName: task.id }),
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setTerminalOutput(prev => prev + chunk);
    }

    setIsTerminalRunning(false);
  }, []);

  const handleTerminalComplete = useCallback(() => {
    if (
      activeTask &&
      ['db:init', 'db:full-restore', 'db:restore', 'db:clean'].includes(
        activeTask.id
      )
    ) {
      console.log(`Script "${activeTask.name}" completed. Refreshing data...`);
      refresh();
    }
  }, [activeTask, refresh]);

  return (
    <div className="space-y-8">
      <DatabaseStatsDashboard
        stats={stats}
        isLoading={isLoading}
        isInitialized={isInitialized}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-2xl font-bold text-gray-900">
            <div className="mr-3 rounded-full bg-blue-500/10 p-2">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            資料集合狀態監控
          </h2>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center justify-center rounded-lg border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-200 disabled:cursor-wait disabled:bg-gray-100 disabled:text-gray-400"
          >
            <RotateCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            重新整理
          </button>
        </div>

        {collectionDetails.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collectionDetails.map(col => (
              <CollectionStatusCard key={col.name} collection={col} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center">
            <Database className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-lg text-gray-500">無法載入資料庫集合資訊。</p>
            <p className="mt-2 text-gray-400">請檢查後端服務或網路連線。</p>
          </div>
        )}
      </div>

      <BackupStatsDashboard />

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          🤖 自動化管理與命令列工具
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className="rounded-lg border bg-gray-50 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-grow">
                    <h3 className="flex items-center break-words font-semibold text-gray-800">
                      <Database
                        size={16}
                        className="mr-2 flex-shrink-0 text-blue-500"
                      />
                      {task.name}
                    </h3>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {task.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecuteScript(task)}
                    disabled={isTerminalRunning || !isInitialized}
                    className={`
                      flex flex-shrink-0 items-center justify-center space-x-2 rounded-lg px-4 py-2 transition-colors
                      ${
                        isTerminalRunning || !isInitialized
                          ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    <span className="flex items-center whitespace-nowrap">
                      {!isInitialized ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          <span>初始化中</span>
                        </>
                      ) : isTerminalRunning ? (
                        <span>執行中...</span>
                      ) : (
                        <>
                          <PlayCircle size={18} />
                          <span className="ml-2">執行</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            {isTerminalVisible && (
              <TerminalViewer
                title={terminalTitle}
                output={terminalOutput}
                isRunning={isTerminalRunning}
                onClose={() => setIsTerminalVisible(false)}
                onComplete={handleTerminalComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
