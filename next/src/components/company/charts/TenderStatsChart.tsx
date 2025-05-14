'use client';

import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Award, Clock } from 'lucide-react';
import { useTenderChartData } from '@/lib/hooks/useTenderChartData';
import NoDataFound from '@/components/common/NoDataFound';
import { InlineLoading } from '@/components/common/loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface TenderStatsChartProps {
  tenders: Array<{
    tenderId: string;
    date: string;
    title: string;
    unitName: string;
    status: string;
  }>;
  isLoadingMore: boolean;
  progress: number;
  totalPages: number;
  currentPage: number;
  isFullyLoaded: boolean;
}

export default function TenderStatsChart({ 
  tenders,
  isLoadingMore,
  progress,
  totalPages,
  currentPage,
  isFullyLoaded
}: TenderStatsChartProps) {
  const [timeUnit, setTimeUnit] = useState<'year' | 'month'>('month');
  const chartRef = useRef<ChartJS<'bar', number[], string>>(null);
  const [animatedData, setAnimatedData] = useState<number[]>([]);

  const {
    processedData,
    isProcessing,
    refreshData,
    statistics
  } = useTenderChartData(tenders, timeUnit, isFullyLoaded);

  // 處理時間單位切換
  const handleTimeUnitChange = (unit: 'year' | 'month') => {
    setTimeUnit(unit);
    setAnimatedData([]);
    refreshData();
  };

  // 圖表動畫效果
  useEffect(() => {
    if (!processedData.counts.length) {
      setAnimatedData([]);
      return;
    }
    setAnimatedData(processedData.counts);
  }, [processedData.counts]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
          family: "'Noto Sans TC', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Noto Sans TC', sans-serif"
        },
        callbacks: {
          label: (context: any) => {
            return `得標案件數：${Math.round(context.raw)} 件`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 14,
            family: "'Noto Sans TC', sans-serif"
          },
          color: '#4a5568'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 14,
            family: "'Noto Sans TC', sans-serif"
          },
          color: '#4a5568'
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeOutQuart' as const
    },
    transitions: {
      active: {
        animation: {
          duration: 300
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  const data = {
    labels: processedData.labels,
    datasets: [
      {
        data: animatedData,
        backgroundColor: 'rgba(72, 187, 120, 0.9)',
        borderColor: 'rgba(72, 187, 120, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(72, 187, 120, 1)',
        barThickness: 24,
        maxBarThickness: 32
      }
    ]
  };

  // 檢查是否有得標案件
  const hasWinningTenders = tenders.some(t => t.status === '得標');

  return (
    <div className="bg-white p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg">
      {hasWinningTenders ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-xl leading-6 font-medium text-gray-900 flex items-center">
                <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                {timeUnit === 'year' ? '歷年' : '近三年'}得標案件{timeUnit === 'year' ? '年統計' : '月統計'}
              </h3>
              {isLoadingMore && (
                <motion.div 
                  className="flex items-center text-sm text-gray-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span>
                    正在載入更多資料... ({currentPage}/{totalPages} 頁)
                  </span>
                  <motion.div 
                    className="ml-2 h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="inline-flex rounded-lg shadow-sm">
                <button
                  onClick={() => handleTimeUnitChange('month')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-all duration-200 ${
                    timeUnit === 'month'
                      ? 'bg-blue-600 text-white shadow-inner'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  月份
                </button>
                <button
                  onClick={() => handleTimeUnitChange('year')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-all duration-200 ${
                    timeUnit === 'year'
                      ? 'bg-blue-600 text-white shadow-inner'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  年度
                </button>
              </div>
            </div>
          </div>

          {/* 統計資訊卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">總得標數</p>
                  <p className="text-xl font-semibold text-gray-900">{statistics.totalWins} 件</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-lg border border-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    最高得標{timeUnit === 'month' ? '月份' : '年度'}
                  </p>
                  <p className="text-xl font-semibold text-gray-900">{statistics.peakPeriod}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">最近得標</p>
                  <p className="text-xl font-semibold text-gray-900">{statistics.lastWinDate}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative h-[300px]">
            <AnimatePresence>
              {isProcessing && <InlineLoading />}
            </AnimatePresence>
            <Bar ref={chartRef} options={options} data={data} />
          </div>
        </>
      ) : (
        <NoDataFound
          message="查無得標案件資料"
        />
      )}
    </div>
  );
}