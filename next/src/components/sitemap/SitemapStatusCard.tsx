'use client';

import React from 'react';
import { SitemapStatusItem } from '@/hooks/useSitemapStatus';

interface SitemapStatusCardProps {
  item: SitemapStatusItem;
  onTest: (id: string) => void;
  onViewDetails: (url: string) => void;
}

const getStatusStyles = (status: SitemapStatusItem['status']) => {
  switch (status) {
    case 'success':
      return {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-200',
        icon: '✅',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        textColor: 'text-green-700'
      };
    case 'warning':
      return {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        icon: '⚠️',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-700'
      };
    case 'error':
      return {
        bg: 'bg-gradient-to-br from-red-50 to-rose-50',
        border: 'border-red-200',
        icon: '❌',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-700'
      };
    case 'testing':
      return {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        icon: '🔄',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-700'
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
        border: 'border-gray-200',
        icon: '⚪',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-700'
      };
  }
};

export default function SitemapStatusCard({ 
  item, 
  onTest, 
  onViewDetails 
}: SitemapStatusCardProps) {
  const styles = getStatusStyles(item.status);
  const isLoading = item.status === 'testing';

  const formatLastChecked = (date?: Date) => {
    if (!date) return '未檢測';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} 小時前`;
    return date.toLocaleDateString('zh-TW');
  };

  // 取得資料狀態的樣式
  const getDataStatusStyles = (dataStatus?: string) => {
    switch (dataStatus) {
      case 'empty':
        return { color: 'text-red-600', bg: 'bg-red-100', label: '無資料' };
      case 'low':
        return { color: 'text-orange-600', bg: 'bg-orange-100', label: '資料不足' };
      case 'normal':
        return { color: 'text-blue-600', bg: 'bg-blue-100', label: '有資料' };
      case 'good':
        return { color: 'text-green-600', bg: 'bg-green-100', label: '資料良好' };
      case 'excellent':
        return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '資料充足' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: '未知' };
    }
  };

  // 計算進度百分比
  const getProgressPercentage = () => {
    if (!item.dataCount || !item.expectedTarget) return 0;
    return Math.min((item.dataCount / item.expectedTarget) * 100, 100);
  };

  const dataStatusStyles = getDataStatusStyles(item.dataStatus);
  const progressPercentage = getProgressPercentage();
  const hasBusinessLogic = ['companies', 'tenders', 'aitools'].includes(item.id);

  return (
    <div className={`
      group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 ease-out
      hover:shadow-lg hover:-translate-y-1 hover:border-opacity-60
      ${styles.bg} ${styles.border}
    `}>
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 主要內容 */}
      <div className="relative z-10">
        {/* 頭部：圖標 + 標題 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-xl
              transition-transform duration-200 group-hover:scale-110
              ${styles.iconBg}
            `}>
              <span className={isLoading ? 'animate-spin' : ''}>{styles.icon}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {item.name}
              </h3>
              <p className="text-base text-gray-500">
                {item.description}
              </p>
            </div>
          </div>
          
          {/* 資料狀態標籤 */}
          {hasBusinessLogic && item.dataStatus && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${dataStatusStyles.bg} ${dataStatusStyles.color}`}>
              {dataStatusStyles.label}
            </div>
          )}
        </div>

        {/* 狀態資訊 */}
        <div className="space-y-3">
          {/* 狀態文字 */}
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-600">狀態</span>
            <span className={`text-base font-semibold ${styles.textColor}`}>
              {item.statusText || '未知'}
            </span>
          </div>

          {/* 資料量信息 - 只針對有業務邏輯的 sitemap */}
          {hasBusinessLogic && typeof item.dataCount === 'number' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-600">資料量</span>
                <span className="text-base font-medium text-gray-700">
                  {item.dataCount.toLocaleString()} 筆
                </span>
              </div>
              
              {/* 進度條 */}
              {item.expectedTarget && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>進度</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progressPercentage >= 100 ? 'bg-green-500' :
                        progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>最少: {item.expectedMin?.toLocaleString()}</span>
                    <span>目標: {item.expectedTarget?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL */}
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-600">路徑</span>
            <code className="text-base bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
              {item.url}
            </code>
          </div>

          {/* 技術資訊 */}
          {(item.responseTime || item.contentLength) && (
            <div className="pt-2 border-t border-gray-200/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {item.responseTime && (
                  <div>
                    <span className="text-gray-500">回應時間</span>
                    <div className="font-medium text-gray-700">{item.responseTime}ms</div>
                  </div>
                )}
                {item.contentLength && (
                  <div>
                    <span className="text-gray-500">內容大小</span>
                    <div className="font-medium text-gray-700">
                      {(item.contentLength / 1024).toFixed(1)}KB
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 最後檢測時間 */}
          <div className="text-sm text-gray-500 text-center pt-2 border-t border-gray-200/50">
            最後檢測: {formatLastChecked(item.lastChecked)}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200/50">
          <button
            onClick={() => onTest(item.id)}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-2 rounded-lg text-base font-medium transition-all duration-200
              ${isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm hover:border-gray-300'
              }
            `}
          >
            {isLoading ? '測試中...' : '🔍 重新測試'}
          </button>
          
          <button
            onClick={() => onViewDetails(item.url)}
            className="px-4 py-2 rounded-lg text-base font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 hover:shadow-sm"
          >
            📋 查看
          </button>
        </div>
      </div>
    </div>
  );
}