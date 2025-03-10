import { useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface Manager {
  序號: string;
  姓名: string;
  到職日期: {
    year: number;
    month: number;
    day: number;
  };
}

interface ManagersTimelineProps {
  managers: Manager[];
  established: string;
}

export default function ManagersTimeline({ managers }: ManagersTimelineProps) {
  const chartRef = useRef<ChartJS<'bar', { x: Date[]; y: string; }[], unknown>>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, [managers]);

  const processData = () => {
    const sortedManagers = [...managers]
      .sort((a, b) => {
        const dateA = new Date(a.到職日期.year, a.到職日期.month - 1, a.到職日期.day);
        const dateB = new Date(b.到職日期.year, b.到職日期.month - 1, b.到職日期.day);
        return dateA.getTime() - dateB.getTime();
      });

    return {
      labels: sortedManagers.map(m => m.姓名),
      datasets: [
        {
          label: '經理人任期',
          data: sortedManagers.map((manager, index) => {
            const startDate = new Date(
              manager.到職日期.year,
              manager.到職日期.month - 1,
              manager.到職日期.day
            );
            
            let endDate;
            let nextIndex = index + 1;
            while (nextIndex < sortedManagers.length) {
              const nextManager = sortedManagers[nextIndex];
              const nextDate = new Date(
                nextManager.到職日期.year,
                nextManager.到職日期.month - 1,
                nextManager.到職日期.day
              );
              
              if (nextDate.getTime() !== startDate.getTime()) {
                endDate = nextDate;
                break;
              }
              nextIndex++;
            }
            
            if (!endDate) {
              endDate = new Date();
            }

            return {
              x: [startDate, endDate],
              y: manager.姓名
            };
          }),
          backgroundColor: 'rgba(66, 153, 225, 0.8)',
          borderColor: 'rgba(66, 153, 225, 1)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.3
        }
      ]
    };
  };

  const processedData = useMemo(() => processData(), [managers]);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'year' as const,
          displayFormats: {
            year: 'yyyy'
          }
        },
        min: managers.length > 0 ? Math.min(
          ...managers.map(m => new Date(m.到職日期.year, m.到職日期.month - 1, m.到職日期.day).getTime())
        ) : undefined,
        max: new Date().getTime(),
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dates = context.raw.x;
            return `任期: ${dates[0].getFullYear()}/${dates[0].getMonth() + 1} - ${dates[1].getFullYear()}/${dates[1].getMonth() + 1}`;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
        <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
        經理人到職時間軸
      </h3>
      <div className="h-[500px]">
        <Bar ref={chartRef} data={processedData} options={options} />
      </div>
    </div>
  );
}