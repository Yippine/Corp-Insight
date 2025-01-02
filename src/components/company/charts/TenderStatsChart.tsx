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
import { Loader2, RefreshCw, TrendingUp, Award, Clock } from 'lucide-react';
import { useTenderChartData } from '../../../hooks/useTenderChartData';
import NoDataFound from '../../common/NoDataFound';


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
  // const [shouldRefresh, setShouldRefresh] = useState(false);

  const {
    processedData,
    isProcessing,
    // dataVersion,
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

  // const handleRefresh = () => {
  //   setShouldRefresh(true);
  //   setTimeout(() => {
  //     refreshData();
  //     setShouldRefresh(false);
  //   }, 300);
  // };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `得標案件數: ${Math.round(context.raw)} 件`;
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
            size: 14
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 14
          }
        }
      }
    },
    // animation: false,
    // transitions: {
    //   active: {
    //     animation: {
    //       duration: 0
    //     }
    //   }
    // },
    animation: {
      duration: 0,
    },
  };

  const data = {
    labels: processedData.labels,
    datasets: [
      {
        data: animatedData,
        backgroundColor: 'rgba(72, 187, 120, 0.9)',
        borderColor: 'rgba(72, 187, 120, 1)',
        borderWidth: 1,
        borderRadius: 4,
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
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    timeUnit === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  月份
                </button>
                <button
                  onClick={() => handleTimeUnitChange('year')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    timeUnit === 'year'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  年度
                </button>
              </div>
              {/* <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="重新整理資料"
              >
                <RefreshCw className={`h-4 w-4 ${shouldRefresh ? 'animate-spin' : ''}`} />
              </button> */}
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

          {/* 警告提示
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center py-3 px-4 mb-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 shadow-sm backdrop-blur-[2px]"
          >
            <div className="flex items-center justify-center p-1.5 bg-amber-100 rounded-md mr-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-700 leading-5">
              資料載入可能尚未完整，建議點選右上角「詳細資訊」按鈕，再返回「視覺圖表」區域，即可確保資料更新完整。
            </span>
          </motion.div> */}

          <div className="relative h-[300px]">
            <AnimatePresence>
              {/* {(shouldRefresh || isProcessing) && ( */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-8 h-8 text-blue-500" />
                  </motion.div>
                </motion.div>
              )}
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