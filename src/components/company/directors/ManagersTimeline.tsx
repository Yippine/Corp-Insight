import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

export default function ManagersTimeline({ managers, established }: ManagersTimelineProps) {
  const chartRef = useRef<ChartJS<'line', { x: Date; y: number; }[], unknown>>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, [managers]);

  const processData = () => {
    const sortedManagers = [...managers].sort((a, b) => {
      const dateA = new Date(a.到職日期.year, a.到職日期.month - 1, a.到職日期.day);
      const dateB = new Date(b.到職日期.year, b.到職日期.month - 1, b.到職日期.day);
      return dateA.getTime() - dateB.getTime();
    });

    const data = sortedManagers.map((manager, index) => ({
      x: new Date(manager.到職日期.year, manager.到職日期.month - 1, manager.到職日期.day),
      y: index
    }));

    return {
      labels: sortedManagers.map(m => m.姓名),
      datasets: [
        {
          label: '經理人到職時間軸',
          data,
          borderColor: 'rgba(66, 153, 225, 0.8)',
          backgroundColor: 'rgba(190, 227, 248, 0.5)',
          pointRadius: 8,
          pointHoverRadius: 12,
          pointBackgroundColor: 'rgba(66, 153, 225, 0.9)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: 'rgba(66, 153, 225, 1)',
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 3,
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  const options = {
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
        title: {
          display: true,
          text: '到職時間',
          font: {
            size: 14,
            family: "'Noto Sans TC', sans-serif"
          }
        },
        min: established ? new Date(established.split('/').join('-')).getTime() : undefined,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      },
      y: {
        title: {
          display: true,
          text: '經理人',
          font: {
            size: 14,
            family: "'Noto Sans TC', sans-serif"
          }
        },
        ticks: {
          callback: function(this: any, tickValue: number | string) {
            return managers[Number(tickValue)]?.姓名 || '';
          },
          font: {
            size: 12,
            family: "'Noto Sans TC', sans-serif"
          }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        }
      }
    },
    plugins: {
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
          label: (context: any) => {
            const manager = managers[context.dataIndex];
            const date = `${manager.到職日期.year}/${manager.到職日期.month}/${manager.到職日期.day}`;
            return `${manager.姓名}: ${date}`;
          }
        }
      },
      legend: {
        display: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
        <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
        經理人到職時間軸
      </h3>
      <div className="h-[400px]">
        <Line ref={chartRef} data={processData()} options={options} />
      </div>
    </div>
  );
}