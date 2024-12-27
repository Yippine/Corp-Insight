import { useState, useEffect, useRef, useCallback } from 'react';
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
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
}

export default function TenderStatsChart({ 
  tenders,
  isLoadingMore,
  progress,
  totalPages,
  currentPage
}: TenderStatsChartProps) {
  const [timeUnit, setTimeUnit] = useState<'year' | 'month'>('month');
  const chartRef = useRef<ChartJS<'bar', number[], string>>(null);
  const [animatedData, setAnimatedData] = useState<number[]>([]);
  const [processedData, setProcessedData] = useState<{
    labels: string[];
    counts: number[];
  }>({ labels: [], counts: [] });

  const generateDateRange = useCallback((dates: string[], unit: 'year' | 'month') => {
    if (dates.length === 0) return [];

    const minDate = Math.min(...dates.map(d => parseInt(d.substring(0, 6))));
    const maxDate = Math.max(...dates.map(d => parseInt(d.substring(0, 6))));

    const range: string[] = [];
    if (unit === 'year') {
      const startYear = Math.floor(minDate / 100);
      const endYear = Math.floor(maxDate / 100);
      for (let year = startYear; year <= endYear; year++) {
        range.push(year.toString());
      }
    } else {
      let current = minDate;
      while (current <= maxDate) {
        range.push(current.toString().padStart(6, '0'));
        let year = Math.floor(current / 100);
        let month = current % 100;
        if (month === 12) {
          year++;
          month = 1;
        } else {
          month++;
        }
        current = year * 100 + month;
      }
    }
    return range;
  }, []);

  useEffect(() => {
    if (!isLoadingMore && tenders.length > 0) {
      console.log('圖表資料更新觸發', {
        總筆數: tenders.length,
        時間單位: timeUnit,
        目前頁數: currentPage,
        總頁數: totalPages
      });
      
      const processedTenders = new Set<string>();
      const statsMap: { [key: string]: number } = {};
      
      const validDates = tenders
        .filter(t => t.date && t.status === '得標')
        .map(t => t.date.toString());

      console.log('有效的標案日期數量：', validDates.length);
      
      const dateRange = generateDateRange(validDates, timeUnit);
      console.log(`${timeUnit === 'month' ? '月份' : '年度'}範圍：`, dateRange);

      tenders.forEach(tender => {
        if (!tender.date || tender.status !== '得標' || processedTenders.has(tender.tenderId)) {
          return;
        }

        processedTenders.add(tender.tenderId);
        const date = tender.date.toString();
        const key = timeUnit === 'month' 
          ? date.substring(0, 6)
          : date.substring(0, 4);

        statsMap[key] = (statsMap[key] || 0) + 1;
      });

      const sortedData = dateRange.map(key => ({
        key,
        label: timeUnit === 'month' 
          ? `${key.substring(0, 4)}年${parseInt(key.substring(4, 6))}月`
          : `${key}年`,
        count: statsMap[key] || 0
      }));

      console.log('處理後的統計資料：', {
        標籤數量: sortedData.length,
        統計值: sortedData.map(d => d.count).reduce((a, b) => a + b, 0)
      });

      setProcessedData({
        labels: sortedData.map(d => d.label),
        counts: sortedData.map(d => d.count)
      });
    }
  }, [tenders, timeUnit, isLoadingMore]);

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
      const easedProgress = easeOutCubic(progress);

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
  }, [processedData.counts]);

  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

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
      duration: 0 // 禁用內建動畫，使用自定義動畫
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
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <span>
                正在載入更多資料... ({currentPage}/{totalPages} 頁)
              </span>
              <motion.div 
                className="ml-2 h-1 w-20 bg-gray-200 rounded-full overflow-hidden"
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
            </div>
          )}
        </div>
        <div className="inline-flex rounded-lg shadow-sm">
          <button
            onClick={() => setTimeUnit('month')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeUnit === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            月份
          </button>
          <button
            onClick={() => setTimeUnit('year')}
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
      <div className="h-[300px]">
        <Bar ref={chartRef} options={options} data={data} />
      </div>
    </div>
  );
}