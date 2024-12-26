import { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TenderStatsChartProps {
  tenders: Array<{
    tenderId: string;
    date: string;
    title: string;
    unitName: string;
    status: string;
  }>;
}

type TimeUnit = 'month' | 'year';

export default function TenderStatsChart({ tenders }: TenderStatsChartProps) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('month');
  const chartRef = useRef<ChartJS<"bar", number[], string>>(null);

  const processData = () => {
    const winningTenders = tenders.filter(tender => tender.status === '得標');
    
    const now = new Date();
    const periods = 6;
    const labels: string[] = [];
    const data = new Array(periods).fill(0);
    
    for (let i = periods - 1; i >= 0; i--) {
      if (timeUnit === 'month') {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        labels.push(`${year}年${month}月`);
      } else {
        const year = now.getFullYear() - i;
        labels.push(`${year}年`);
      }
    }

    winningTenders.forEach(tender => {
      let tenderDate;
      if (typeof tender.date === 'string') {
        const dateStr = tender.date.replace(/\//g, '-');
        const parts = dateStr.split('-').map(Number);
        
        if (parts.length >= 2) {
          if (parts[0] < 1911) {
            parts[0] = parts[0] + 1911;
          }
          tenderDate = new Date(parts[0], parts[1] - 1);
        } else {
          return;
        }
      } else {
        return;
      }

      if (timeUnit === 'month') {
        const monthDiff = (now.getFullYear() - tenderDate.getFullYear()) * 12 + 
                         (now.getMonth() - tenderDate.getMonth());
        if (monthDiff < periods && monthDiff >= 0) {
          data[periods - 1 - monthDiff]++;
        }
      } else {
        const yearDiff = now.getFullYear() - tenderDate.getFullYear();
        if (yearDiff < periods && yearDiff >= 0) {
          data[periods - 1 - yearDiff]++;
        }
      }
    });

    return {
      labels,
      datasets: [{
        label: '得標案件數',
        data,
        backgroundColor: 'rgba(66, 153, 225, 0.8)',
        borderColor: 'rgba(66, 153, 225, 1)',
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(66, 153, 225, 1)',
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
          family: "'Noto Sans TC', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Noto Sans TC', sans-serif"
        },
        callbacks: {
          title: (tooltipItems: any) => {
            return tooltipItems[0].label;
          },
          label: (context: any) => {
            return `得標案件：${context.parsed.y} 件`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: "'Noto Sans TC', sans-serif"
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Noto Sans TC', sans-serif"
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl leading-6 font-medium text-gray-900 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
          得標案件統計圖
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeUnit('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeUnit === 'month'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            月度統計
          </button>
          <button
            onClick={() => setTimeUnit('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeUnit === 'year'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            年度統計
          </button>
        </div>
      </div>
      <div className="h-[400px]">
        <Bar ref={chartRef} data={processData()} options={options} />
      </div>
    </div>
  );
}