import React, { useEffect, useRef } from 'react';
import '../../styles/admin/TemporalChart.css';

// NOTE: Chart.js needs to be installed: npm install chart.js react-chartjs-2
// For now, this component will render a placeholder
// Once Chart.js is installed, uncomment the import below and use the Chart component

// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

const TemporalChart = ({ data, period }) => {
  const canvasRef = useRef(null);

  // Placeholder: Dibujar un gráfico simple con Canvas API nativo
  useEffect(() => {
    if (!canvasRef.current || !data?.data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    const chartData = data.data;
    if (chartData.length === 0) {
      // Mostrar mensaje de "sin datos"
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos disponibles', width / 2, height / 2);
      return;
    }

    // Preparar datos
    const values = chartData.map(item => item.count || item.total || 0);
    const maxValue = Math.max(...values, 1);
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Dibujar ejes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Dibujar línea de datos
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = padding + (index / (values.length - 1)) * chartWidth;
      const y = height - padding - (value / maxValue) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dibujar puntos
    ctx.fillStyle = '#3b82f6';
    values.forEach((value, index) => {
      const x = padding + (index / (values.length - 1)) * chartWidth;
      const y = height - padding - (value / maxValue) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Etiquetas
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Periodo: ${period}`, width / 2, 20);
    ctx.fillText(`Total de puntos: ${values.length}`, width / 2, height - 10);

  }, [data, period]);

  if (!data) {
    return (
      <div className="temporal-chart">
        <p className="chart-loading">Cargando datos temporales...</p>
      </div>
    );
  }

  return (
    <div className="temporal-chart">
      <div className="chart-info">
        <p className="chart-period">Período: {period === 'day' ? 'Diario' : period === 'week' ? 'Semanal' : 'Mensual'}</p>
        <p className="chart-datapoints">Puntos de datos: {data?.data?.length || 0}</p>
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400}
        className="chart-canvas"
      />
      <div className="chart-note">
        <p>📊 Para gráficos avanzados, instale Chart.js: <code>npm install chart.js react-chartjs-2</code></p>
      </div>
    </div>
  );

  /* Una vez instalado Chart.js, usar esto:
  
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
  */
};

export default TemporalChart;
