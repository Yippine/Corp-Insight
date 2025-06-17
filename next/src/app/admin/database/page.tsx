'use client';

import TaskRunnerCard from '@/components/admin/TaskRunnerCard';

const databaseTasks = [
  {
    scriptName: 'db:init',
    title: '初始化資料庫',
    description: '根據 `init-mongodb-collections.js` 腳本，建立所有必要的 collections 並設定索引。',
  },
  {
    scriptName: 'db:connect',
    title: '測試資料庫連線',
    description: '從應用程式伺服器測試到 MongoDB 的網路連線是否正常。',
  },
  {
    scriptName: 'db:list',
    title: '列出所有備份',
    description: '分析 `db/backups` 目錄，顯示所有可用的備份檔案及其時間戳。',
  },
  {
    scriptName: 'db:backup',
    title: '備份所有資料',
    description: '執行完整資料庫備份，包含核心資料與快取，儲存為一個新的 .tar.gz 檔案。',
  },
  {
    scriptName: 'db:backup:core',
    title: '僅備份核心資料',
    description: '僅備份核心業務資料 (排除快取、日誌等)，用於系統遷移或重要還原點。',
  },
  {
    scriptName: 'db:restore',
    title: '還原最新備份',
    description: '【高風險】使用最新的備份檔案覆蓋當前資料庫。請在執行前確認操作。',
  },
  {
    scriptName: 'db:clean',
    title: '清理快取資料',
    description: '【高風險】執行資料庫維護，清理所有可再生的快取資料。',
  },
];

export default function DatabaseOperationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">資料庫維運中心</h1>
      <p className="mb-8 text-gray-600">
        執行與資料庫相關的日常維護任務。部分操作具有高風險性，執行前請務必確認。
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {databaseTasks.map((task) => (
          <TaskRunnerCard
            key={task.scriptName}
            title={task.title}
            description={task.description}
            scriptName={task.scriptName}
          />
        ))}
      </div>
    </div>
  );
}