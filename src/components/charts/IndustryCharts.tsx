'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Radar, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
);

interface QualityData {
  dimensions: string[];
  values: number[];
  limits: number[];
}

interface MaintenanceData {
  parameters: string[];
  currentValues: number[];
  normalRanges: { min: number; max: number }[];
  history?: { timestamp: string; values: number[] }[];
}

interface SchedulingData {
  products: string[];
  quantities: number[];
  dueDays: number[];
  machineHours: number[];
}

export function QualityChart({ data }: { data: QualityData }) {
  const chartData = {
    labels: data.dimensions,
    datasets: [
      {
        label: '測量值',
        data: data.values,
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
      },
      {
        label: '規格限制',
        data: data.limits,
        fill: false,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">品質分析圖</h3>
      <Radar
        data={chartData}
        options={{
          scales: {
            r: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          plugins: {
            legend: {
              position: 'top' as const,
            },
          },
        }}
      />
    </div>
  );
}

export function MaintenanceChart({ data }: { data: MaintenanceData }) {
  // 當前狀態圖（量規圖）
  const gaugeData = {
    labels: data.parameters,
    datasets: [
      {
        label: '當前值',
        data: data.currentValues,
        backgroundColor: data.currentValues.map((value, index) => {
          const range = data.normalRanges[index];
          return value >= range.min && value <= range.max
            ? 'rgba(75, 192, 192, 0.5)'
            : 'rgba(255, 99, 132, 0.5)';
        }),
        borderColor: data.currentValues.map((value, index) => {
          const range = data.normalRanges[index];
          return value >= range.min && value <= range.max
            ? 'rgb(75, 192, 192)'
            : 'rgb(255, 99, 132)';
        }),
        borderWidth: 1,
      },
    ],
  };

  // 歷史趨勢圖
  const historyData = data.history ? {
    labels: data.history.map(h => h.timestamp),
    datasets: data.parameters.map((param, index) => ({
      label: param,
      data: data.history!.map(h => h.values[index]),
      borderColor: `hsl(${index * 360 / data.parameters.length}, 70%, 50%)`,
      tension: 0.1,
      fill: false,
    })),
  } : null;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">當前狀態</h3>
        <Bar
          data={gaugeData}
          options={{
            indexAxis: 'y' as const,
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>
      {historyData && (
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">參數趨勢</h3>
          <Line
            data={historyData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export function SchedulingChart({ data }: { data: SchedulingData }) {
  // 產品分配圖
  const allocationData = {
    labels: data.products,
    datasets: [
      {
        data: data.quantities,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
      },
    ],
  };

  // 機台使用圖
  const machineData = {
    labels: data.products,
    datasets: [
      {
        label: '機台使用時數',
        data: data.machineHours,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">產品分配</h3>
        <Doughnut
          data={allocationData}
          options={{
            plugins: {
              legend: {
                position: 'right' as const,
              },
            },
          }}
        />
      </div>
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">機台使用時數</h3>
        <Bar
          data={machineData}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>
    </div>
  );
} 