'use client';

import TaskRunnerCard from '@/components/admin/TaskRunnerCard';

const sitemapTasks = [
  {
    scriptName: 'sitemap:test',
    title: '測試 Sitemap 生成',
    description: '在開發模式下運行，快速測試 Sitemap 的生成邏輯與快取機制是否正常。',
  },
  {
    scriptName: 'sitemap:monitor',
    title: '啟動 Sitemap 監控器',
    description: '在背景啟動一個常駐進程，監控 Sitemap 相關路由的變動並自動更新快取。',
  },
  {
    scriptName: 'sitemap:status',
    title: '檢查監控器狀態',
    description: '檢查 Sitemap 監控器 (pm2 進程) 目前的運行狀態，包含 CPU、記憶體使用情況。',
  },
  {
    scriptName: 'sitemap:stop',
    title: '停止 Sitemap 監控器',
    description: '停止在背景運行的 Sitemap 監控器進程。',
  },
  {
    scriptName: 'sitemap:clear',
    title: '清除 Sitemap 快取',
    description: '強制清除 Redis 中所有與 Sitemap 相關的快取資料。',
  },
]

export default function SitemapManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Sitemap 管理中心</h1>
      <p className="mb-8 text-gray-600">
        在此頁面，您可以執行與網站地圖 (Sitemap) 相關的維運任務，例如手動觸發生成、監控狀態或清除快取。
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sitemapTasks.map((task) => (
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