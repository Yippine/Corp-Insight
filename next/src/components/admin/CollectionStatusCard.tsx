'use client';

import { Cylinder, BarChart, CircleHelp, Loader2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { formatBytes } from '@/lib/utils/formatters';
import { CollectionStats } from '@/hooks/useDatabaseStatus';

const getStatusIndicator = (status: CollectionStats['status']) => {
  switch (status) {
    case 'ok':
      return { Icon: CheckCircle, color: 'text-green-600', badgeBg: 'bg-green-100', label: '正常', bg: 'bg-green-50/70 to-emerald-50/70', border: 'border-green-200' };
    case 'empty':
      return { Icon: AlertTriangle, color: 'text-yellow-600', badgeBg: 'bg-yellow-100', label: '無資料', bg: 'bg-yellow-50/70 to-amber-50/70', border: 'border-yellow-200' };
    case 'warning':
      return { Icon: AlertTriangle, color: 'text-orange-600', badgeBg: 'bg-orange-100', label: '資料稀少', bg: 'bg-orange-50/70 to-red-50/70', border: 'border-orange-200' };
    case 'error':
      return { Icon: CircleHelp, color: 'text-red-600', badgeBg: 'bg-red-100', label: '錯誤', bg: 'bg-red-50/70 to-rose-50/70', border: 'border-red-200' };
    case 'testing':
      return { Icon: Loader2, color: 'text-blue-600', badgeBg: 'bg-blue-100', label: '檢測中', bg: 'bg-blue-50/70 to-indigo-50/70', border: 'border-blue-200' };
    default:
      return { Icon: CircleHelp, color: 'text-gray-500', badgeBg: 'bg-gray-100', label: '未知', bg: 'bg-gray-100/70 to-slate-100/70', border: 'border-gray-200' };
  }
};

interface CollectionStatusCardProps {
  collection: CollectionStats;
}

export default function CollectionStatusCard({ collection }: CollectionStatusCardProps) {
  const styles = getStatusIndicator(collection.status);
  const isLoading = collection.status === 'testing';

  const stats = [
    { label: '文件數量', value: collection.count, unit: '筆', format: (v: number) => v.toLocaleString() },
    { label: '平均大小', value: collection.avgObjSize, unit: 'B', format: (v: number) => formatBytes(v).value, getUnit: (v: number) => formatBytes(v).unit },
    { label: '儲存大小', value: collection.storageSize, unit: 'B', format: (v: number) => formatBytes(v).value, getUnit: (v: number) => formatBytes(v).unit },
    { label: '索引大小', value: collection.totalIndexSize, unit: 'B', format: (v: number) => formatBytes(v).value, getUnit: (v: number) => formatBytes(v).unit },
  ];

  const handleViewDetails = () => {
    const isLocal = window.location.hostname === 'localhost';
    const dbName = 'business-magnifier';
    const prodMongoExpressUrl = process.env.NEXT_PUBLIC_MONGO_EXPRESS_URL;

    let url;
    if (isLocal) {
      url = `http://localhost:8081/db/${dbName}/${collection.name}`;
    } else if (prodMongoExpressUrl) {
      const baseUrl = prodMongoExpressUrl.endsWith('/') ? prodMongoExpressUrl.slice(0, -1) : prodMongoExpressUrl;
      url = `${baseUrl}/db/${dbName}/${collection.name}`;
    } else {
      console.error('Mongo Express URL not configured. Please set NEXT_PUBLIC_MONGO_EXPRESS_URL.');
      alert('無法確定 Mongo Express 的位址。請檢查環境變數設定。');
      return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${styles.bg} ${styles.border} hover:border-blue-300`}>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-white/60 shadow-inner-sm transition-transform duration-300 group-hover:scale-110`}>
                <Cylinder className="h-7 w-7 text-gray-700" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-gray-800 break-all">{collection.name}</h3>
                <p className="text-sm text-gray-500">{collection.description || '核心資料集合'}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${styles.badgeBg} ${styles.color}`}>
              <styles.Icon className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              {styles.label}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-900/10">
            {stats.map(stat => (
              <div key={stat.label} className="flex justify-between items-baseline text-base">
                <span className="text-gray-600">{stat.label}</span>
                {isLoading ? (
                  <span className="h-5 w-16 bg-gray-300/80 rounded-md animate-pulse"></span>
                ) : (
                  <span className="font-semibold text-lg text-gray-800">
                    {stat.format(stat.value as number)}
                    <span className="ml-1 text-xs text-gray-500 font-normal">{stat.getUnit ? stat.getUnit(stat.value as number) : stat.unit}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-5 pt-4 border-t border-gray-900/10">
        <button
          onClick={handleViewDetails}
          className="w-full flex items-center justify-center text-center py-2.5 rounded-lg text-blue-700 bg-white/50 border border-blue-200/80 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 hover:shadow-md transition-all duration-200 font-semibold group"
        >
          <ExternalLink className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
          在 Mongo Express 中查看
        </button>
      </div>
    </div>
  );
}