import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Director {
  title: string;
  name: string;
  representative: string | [number, string];
  shares: string;
}

interface DirectorsChartProps {
  directors: Director[];
}

export default function DirectorsChart({ directors }: DirectorsChartProps) {
  const chartRef = useRef<ChartJS<"pie", number[], unknown>>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, [directors]);

  const processData = () => {
    const shareholdingData = directors.map((director) => ({
      name: director.name,
      shares: parseFloat((director.shares || "0").replace(/,/g, "")) || 0,
      title: director.title,
      representative: Array.isArray(director.representative)
        ? director.representative[1]
        : director.representative,
    }));

    const totalShares = shareholdingData.reduce(
      (acc, curr) => acc + curr.shares,
      0
    );

    const significantShareholders = shareholdingData
      .filter((data) => data.shares > 0)
      .sort((a, b) => b.shares - a.shares);

    const otherShares = shareholdingData
      .filter((data) => data.shares === 0)
      .reduce((acc, curr) => acc + curr.shares, 0);

    const labels = [
      ...significantShareholders.map((data) => {
        const percentage =
          totalShares > 0
            ? ((data.shares / totalShares) * 100).toFixed(2)
            : "0.00";
        const label = data.representative
          ? `${data.name}(${data.representative})`
          : data.name;
        return `${label} (${percentage}%)`;
      }),
      otherShares > 0 ? "其他" : null,
    ].filter(Boolean);

    // Professional color palette with subtle gradients
    const colors = [
      "rgba(66, 153, 225, 0.9)", // Blue
      "rgba(72, 187, 120, 0.9)", // Green
      "rgba(237, 137, 54, 0.9)", // Orange
      "rgba(159, 122, 234, 0.9)", // Purple
      "rgba(245, 101, 101, 0.9)", // Red
      "rgba(236, 201, 75, 0.9)", // Yellow
      "rgba(129, 230, 217, 0.9)", // Teal
      "rgba(213, 63, 140, 0.9)", // Pink
      "rgba(113, 128, 150, 0.9)", // Gray
    ].slice(0, labels.length);

    const hoverColors = colors.map((color) => color.replace("0.9", "1"));

    return {
      labels,
      datasets: [
        {
          data: [
            ...significantShareholders.map((data) => data.shares),
            otherShares > 0 ? otherShares : null,
          ].filter(Boolean),
          backgroundColor: colors,
          hoverBackgroundColor: hoverColors,
          borderWidth: 2,
          borderColor: "white",
          hoverBorderColor: "white",
          hoverOffset: 8,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            size: 14,
            family: "'Noto Sans TC', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1a202c",
        bodyColor: "#4a5568",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold" as const,
          family: "'Noto Sans TC', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Noto Sans TC', sans-serif",
        },
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `持股數: ${value.toLocaleString()} 股`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeInOutQuart" as const,
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
        <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
        董監事持股比例
      </h3>
      <div className="h-[400px]">
        <Pie ref={chartRef} data={processData()} options={options} />
      </div>
    </div>
  );
}
