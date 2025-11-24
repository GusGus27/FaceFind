import React from 'react';
import '../../styles/admin/DemographicsChart.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DemographicsChart = ({ data }) => {
  if (!data || !data.age_distribution) {
    return (
      <div className="demographics-chart">
        <p className="chart-loading">Cargando datos demográficos...</p>
      </div>
    );
  }

  const ageGroups = Object.entries(data.age_distribution);
  
  const chartData = {
    labels: ageGroups.map(([group]) => group),
    datasets: [
      {
        label: 'Casos por Grupo de Edad',
        data: ageGroups.map(([_, value]) => value.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(148, 163, 184, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(99, 102, 241)',
          'rgb(148, 163, 184)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Distribución por Grupo de Edad',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const percentage = ageGroups[context.dataIndex][1].percentage;
            return `${percentage}% del total`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Número de Casos'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Grupo de Edad'
        }
      }
    }
  };

  return (
    <div className="demographics-chart">
      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="demographics-info">
        <div className="info-item">
          <span className="info-label">Total de Casos:</span>
          <span className="info-value">{data.total_cases || 0}</span>
        </div>
        {data.most_common_group && (
          <div className="info-item">
            <span className="info-label">Grupo Más Común:</span>
            <span className="info-value">{data.most_common_group}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemographicsChart;
