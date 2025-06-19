'use client';

import { AreaChart, BarChart, Database, Clock, FileArchive, CheckCircle, XCircle } from 'lucide-react';
import { DatabaseOverallStats } from '@/hooks/useDatabaseStatus';

interface DatabaseStatsDashboardProps {
  stats: DatabaseOverallStats | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const StatCard = ({ icon: Icon, title, value, unit, color, smallValue = false }: { icon: React.ElementType, title: string, value: string | number, unit?: string, color: string, smallValue?: boolean }) => (
  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`font-bold text-gray-900 ${smallValue ? 'text-base' : 'text-2xl'}`}>
        {value} <span className="text-base font-medium text-gray-600">{unit}</span>
      </p>
    </div>
  </div>
);

// 骨架卡片元件
const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 animate-pulse flex items-center space-x-4">
    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
    <div className="flex-1">
      <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
      <div className="w-16 h-6 bg-gray-300 rounded"></div>
    </div>
  </div>
);

export default function DatabaseStatsDashboard({ stats, isLoading, isInitialized }: DatabaseStatsDashboardProps) {
  const showSkeleton = !isInitialized || isLoading;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* 標題區域 - 立即顯示 */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 資料庫狀態總覽</h2>
      
      {showSkeleton ? (
        <>
          {/* 骨架屏內容 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 text-sm">💡</span>
              <div className="text-sm text-blue-700">
                <strong>提示：</strong>
                <span className="ml-1">正在檢測資料庫即時狀態，請稍候...</span>
              </div>
            </div>
          </div>
        </>
      ) : stats ? (
        <>
          {/* 真實數據內容 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`bg-gray-50 p-6 rounded-2xl border flex items-center space-x-4 ${stats.connection ? 'border-green-200' : 'border-red-200'}`}>
              <div className={`p-3 rounded-full ${stats.connection ? 'bg-green-500' : 'bg-red-500'}`}>
                {stats.connection ? <CheckCircle className="h-6 w-6 text-white" /> : <XCircle className="h-6 w-6 text-white" />}
              </div>
              <div>
                <p className="text-sm text-gray-500">連線狀態</p>
                <p className={`text-2xl font-bold ${stats.connection ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.connection ? '已連線' : '連線失敗'}
                </p>
              </div>
            </div>
            
            <StatCard icon={Database} title="集合 (Collections)" value={stats.collections} unit="個" color="bg-blue-500" />
            <StatCard icon={BarChart} title="文件 (Objects)" value={stats.objects} unit="筆" color="bg-indigo-500" />
            <StatCard icon={AreaChart} title="資料大小" value={stats.dataSize.value} unit={stats.dataSize.unit} color="bg-sky-500" />
            <StatCard icon={FileArchive} title="備份數量" value={stats.backupCount} unit="個" color="bg-amber-500" />
            <StatCard icon={Clock} title="最新備份時間" value={stats.latestBackupDate} color="bg-pink-500" smallValue={true} />
          </div>
        </>
      ) : (
        // 錯誤狀態
        <div className="text-center py-10">
            <p className="text-red-500">無法載入資料庫狀態，請檢查後端服務或網路連線。</p>
        </div>
      )}
    </div>
  );
}