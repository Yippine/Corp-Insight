'use client';

import {
  AreaChart,
  BarChart,
  Database,
  Clock,
  FileArchive,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { DatabaseOverallStats } from '@/hooks/useDatabaseStatus';

interface DatabaseStatsDashboardProps {
  stats: DatabaseOverallStats | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  unit,
  color,
  smallValue = false,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  unit?: string;
  color: string;
  smallValue?: boolean;
}) => (
  <div className="flex items-center space-x-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
    <div className={`rounded-full p-3 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p
        className={`font-bold text-gray-900 ${smallValue ? 'text-base' : 'text-2xl'}`}
      >
        {value}{' '}
        <span className="text-base font-medium text-gray-600">{unit}</span>
      </p>
    </div>
  </div>
);

// 骨架卡片元件
const SkeletonCard = () => (
  <div className="flex animate-pulse items-center space-x-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <div className="h-12 w-12 rounded-full bg-gray-300"></div>
    <div className="flex-1">
      <div className="mb-2 h-4 w-24 rounded bg-gray-300"></div>
      <div className="h-6 w-16 rounded bg-gray-300"></div>
    </div>
  </div>
);

export default function DatabaseStatsDashboard({
  stats,
  isLoading,
  isInitialized,
}: DatabaseStatsDashboardProps) {
  const showSkeleton = !isInitialized || isLoading;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
      {/* 標題區域 - 立即顯示 */}
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        📊 資料庫狀態總覽
      </h2>

      {showSkeleton ? (
        <>
          {/* 骨架屏內容 */}
          <div className="mb-6 grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start space-x-2">
              <span className="text-sm text-blue-500">💡</span>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              className={`flex items-center space-x-4 rounded-2xl border bg-gray-50 p-6 ${stats.connection ? 'border-green-200' : 'border-red-200'}`}
            >
              <div
                className={`rounded-full p-3 ${stats.connection ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {stats.connection ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <XCircle className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">連線狀態</p>
                <p
                  className={`text-2xl font-bold ${stats.connection ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stats.connection ? '已連線' : '連線失敗'}
                </p>
              </div>
            </div>

            <StatCard
              icon={Database}
              title="集合 (Collections)"
              value={stats.collections}
              unit="個"
              color="bg-blue-500"
            />
            <StatCard
              icon={BarChart}
              title="文件 (Objects)"
              value={stats.objects}
              unit="筆"
              color="bg-indigo-500"
            />
            <StatCard
              icon={AreaChart}
              title="資料大小"
              value={stats.dataSize.value}
              unit={stats.dataSize.unit}
              color="bg-sky-500"
            />
            <StatCard
              icon={FileArchive}
              title="備份數量"
              value={stats.backupCount}
              unit="個"
              color="bg-amber-500"
            />
            <StatCard
              icon={Clock}
              title="最新備份時間"
              value={stats.latestBackupDate}
              color="bg-pink-500"
              smallValue={true}
            />
          </div>
        </>
      ) : (
        // 錯誤狀態
        <div className="py-10 text-center">
          <p className="text-red-500">
            無法載入資料庫狀態，請檢查後端服務或網路連線。
          </p>
        </div>
      )}
    </div>
  );
}
