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
import { Loader2, RefreshCw } from 'lucide-react';
import { useTenderChartData } from '../../../hooks/useTenderChartData';

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
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const {
    processedData,
    isProcessing,
    dataVersion,
    refreshData
  } = useTenderChartData(tenders, timeUnit, isFullyLoaded);

  // 處理時間單位切換
  const handleTimeUnitChange = (unit: 'year' | 'month') => {
    setTimeUnit(unit);
    setShouldRefresh(true);
    setTimeout(() => {
      refreshData();
      setShouldRefresh(false);
    }, 300);
  };

  // 圖表動畫效果
  useEffect(() => {
    if (!processedData.counts.length) return;

    const chart = chartRef.current;
    if (!chart) return;

    const targetData = processedData.counts;
    const startData = animatedData.length ? animatedData : new Array(targetData.length).fill(0);
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const newData = targetData.map((target, i) => {
        const start = startData[i];
        return start + (target - start) * easedProgress;
      });

      setAnimatedData(newData);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [processedData.counts, dataVersion]);

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
    animation: {
      duration: 0
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
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-xl leading-6 font-medium text-gray-900 flex items-center">
            <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
            近期得標案件統計（{timeUnit === 'year' ? '年度' : '月份'}）
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
      </div>
      <div className="relative h-[300px]">
        <AnimatePresence>
          {(shouldRefresh || isProcessing) && (
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
    </div>
  );
}