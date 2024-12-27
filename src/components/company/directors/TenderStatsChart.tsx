import { useMemo, useState } from 'react';
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

export default function TenderStatsChart({ tenders }: TenderStatsChartProps) {
  const [timeUnit, setTimeUnit] = useState<'year' | 'month'>('month');

  const stats = useMemo(() => {
    const statsMap = tenders.reduce((acc: { [key: string]: number }, tender) => {
      if (!tender.date || tender.status !== '得標') return acc;

      const date = tender.date.toString();
      const key = timeUnit === 'month' 
        ? date.substring(0, 6)
        : date.substring(0, 4);

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sortedKeys = Object.keys(statsMap).sort();

    return {
      labels: sortedKeys.map(key => timeUnit === 'month' 
        ? `${key.substring(0, 4)}年${parseInt(key.substring(4, 6))}月`
        : `${key}年`
      ),
      counts: sortedKeys.map(key => statsMap[key])
    };
  }, [tenders, timeUnit]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
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
    }
  };

  const data = {
    labels: stats.labels,
    datasets: [
      {
        data: stats.counts,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl leading-6 font-medium text-gray-900 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
          近期得標案件統計 ({timeUnit === 'year' ? '年度' : '月份'})
        </h3>
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
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
