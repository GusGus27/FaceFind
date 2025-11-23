import React from 'react';
import '../../styles/admin/TemporalChart.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TemporalChart = ({ data, period }) => {
  if (!data) {
    return (
      <div className="temporal-chart">
        <p className="chart-loading">Cargando datos temporales...</p>
      </div>
    );
  }

  const chartData = {
    labels: data?.data?.map(item => item.date || item.month || item.week_start) || [],
    datasets: [
      {
        label: 'Casos Registrados',
        data: data?.data?.map(item => item.count || item.total || 0) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: `Tendencia Temporal - ${period === 'day' ? 'Diaria' : period === 'week' ? 'Semanal' : 'Mensual'}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="temporal-chart">
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TemporalChart;
