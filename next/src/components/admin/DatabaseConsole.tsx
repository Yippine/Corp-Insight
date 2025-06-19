'use client';

import React, { useState, useCallback } from 'react';
import TerminalViewer from './TerminalViewer';
import DatabaseStatsDashboard from './DatabaseStatsDashboard';
import CollectionStatusCard from './CollectionStatusCard';
import { PlayCircle, Database, Loader2 } from 'lucide-react';
import { useDatabaseStatus } from '@/hooks/useDatabaseStatus';

const SCRIPT_COMMANDS = [
    { name: 'db:init', title: '初始化資料庫', description: '根據 scripts/init-mongodb-collections.js 腳本建立所有集合。' },
    { name: 'db:connect', title: '測試資料庫連線', description: '執行一個簡單的腳本來驗證與 MongoDB 的連線。' },
    { name: 'db:list', title: '列出所有 Collections', description: '顯示當前資料庫中的所有集合列表。' },
    { name: 'db:backup', title: '完整備份資料庫', description: '備份所有集合到 db/backups 目錄。' },
    { name: 'db:backup:core', title: '核心資料備份', description: '僅備份核心業務資料集合。' },
    { name: 'db:restore', title: '還原最新備份', description: '從最新的備份檔案還原資料庫。' },
    { name: 'db:clean', title: '清理過期備份', description: '刪除超過保留期限的舊備份檔案。' },
];

export default function DatabaseConsole() {
  const {
    collectionDetails,
    stats,
    isLoading,
    isInitialized,
    refresh,
  } = useDatabaseStatus();

  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalTitle, setTerminalTitle] = useState('');
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  const handleExecuteScript = useCallback(async (scriptName: string, title: string) => {
    setTerminalTitle(title);
    setTerminalOutput('');
    setIsTerminalRunning(true);
    setIsTerminalVisible(true);

    const response = await fetch('/api/admin/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}` },
      body: JSON.stringify({ scriptName }),
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

    // 當執行的是可能改變資料庫狀態的指令時，刷新儀表板
    if (['db:init', 'db:restore', 'db:clean', 'db:backup', 'db:backup:core', 'db:list'].includes(scriptName)) {
      await refresh();
    }
  }, [refresh]);

  return (
    <div className="space-y-8">
      <DatabaseStatsDashboard stats={stats} isLoading={isLoading} isInitialized={isInitialized} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 詳細狀態監控</h2>
        
        {/* 動態內容區域 */}
        {collectionDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionDetails.map((col) => (
              <CollectionStatusCard key={col.name} collection={col} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">無法載入資料庫集合資訊。</p>
            <p className="text-gray-400 mt-2">請檢查後端服務或網路連線。</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">🤖 自動化管理與命令列工具</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {SCRIPT_COMMANDS.map((cmd) => (
              <div key={cmd.name} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800 flex items-center break-words"><Database size={16} className="mr-2 text-blue-500 flex-shrink-0" />{cmd.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 break-words">{cmd.description}</p>
                  </div>
                  <button
                    onClick={() => handleExecuteScript(cmd.name, cmd.title)}
                    disabled={isTerminalRunning || !isInitialized}
                    className={`
                      flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0
                      ${isTerminalRunning || !isInitialized
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    <span className="whitespace-nowrap flex items-center">
                      {!isInitialized ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}