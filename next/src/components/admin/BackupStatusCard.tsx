'use client';

import {
  Archive,
  Database,
  Hash,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils/formatters';
import type { BackupAnalysis } from '@/hooks/useBackupStatus';

interface BackupStatusCardProps {
  backup: BackupAnalysis;
}

const BackupInfoRow = ({
  icon: Icon,
  label,
  value,
  unit,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  isLoading: boolean;
}) => (
  <div className="flex items-baseline justify-between text-base">
    <span className="flex items-center text-gray-600">
      <Icon className="mr-2 h-4 w-4 text-gray-400" />
      {label}
    </span>
    {isLoading ? (
      <span className="h-5 w-24 animate-pulse rounded-md bg-gray-300/80"></span>
    ) : (
      <span className="text-lg font-semibold text-gray-800">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-gray-500">{unit}</span>
        )}
      </span>
    )}
  </div>
);

export default function BackupStatusCard({ backup }: BackupStatusCardProps) {
  const isLoading = backup.error === 'loading';
  const isError = !isLoading && !!backup.error;

  const getStatusIndicator = () => {
    if (isLoading)
      return {
        Icon: Loader2,
        color: 'text-blue-600',
        label: '讀取中',
        bg: 'bg-blue-50/70 to-indigo-50/70',
        border: 'border-blue-200',
      };
    if (isError)
      return {
        Icon: AlertTriangle,
        color: 'text-red-600',
        label: '讀取失敗',
        bg: 'bg-red-50/70 to-rose-50/70',
        border: 'border-red-200',
      };
    return {
      Icon: CheckCircle,
      color: 'text-green-600',
      label: '讀取成功',
      bg: 'bg-blue-50/70 to-teal-50/70',
      border: 'border-blue-200',
    };
  };

  const styles = getStatusIndicator();
  const formattedSize = formatBytes(backup.fileSize);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl ${styles.bg} ${styles.border} hover:border-blue-300`}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="break-all text-lg font-bold text-gray-800">
                {isLoading ? '讀取備份檔案...' : backup.fileName}
              </h3>
              <div
                className={`mt-2 inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${styles.color.replace('text-', 'bg-').replace('600', '100')} ${styles.color}`}
              >
                <styles.Icon
                  className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                {styles.label}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-900/10 pt-4">
            <BackupInfoRow
              icon={Calendar}
              label="備份時間"
              value={
                isLoading
                  ? '---'
                  : new Date(backup.modifiedTime).toLocaleString('zh-TW')
              }
              isLoading={isLoading}
            />
            <BackupInfoRow
              icon={Archive}
              label="檔案大小"
              value={formattedSize.value}
              unit={formattedSize.unit}
              isLoading={isLoading}
            />
            <BackupInfoRow
              icon={Hash}
              label="總記錄數"
              value={isLoading ? '---' : backup.totalRecords.toLocaleString()}
              unit="筆"
              isLoading={isLoading}
            />
          </div>

          <div className="mt-4 border-t border-gray-900/10 pt-4">
            <h4 className="mb-2 flex items-center text-gray-600">
              <Database className="mr-2 h-4 w-4 text-gray-400" />
              包含的資料集合
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-300/80"></div>
                <div className="h-4 w-1/2 animate-pulse rounded-md bg-gray-300/80"></div>
              </div>
            ) : isError ? (
              <p className="text-sm text-red-600">無法分析檔案內容。</p>
            ) : Object.keys(backup.collections).length > 0 ? (
              <ul className="list-inside list-disc space-y-1 pl-2 text-base">
                {Object.entries(backup.collections).map(([name, count]) => (
                  <li key={name} className="text-gray-700">
                    <span className="font-medium text-gray-800">{name}</span>：
                    {count.toLocaleString()} 筆
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                此備份不包含可分析的資料集合。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
