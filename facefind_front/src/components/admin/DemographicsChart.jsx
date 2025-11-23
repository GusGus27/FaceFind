import React, { useEffect, useRef } from 'react';
import '../../styles/admin/DemographicsChart.css';

const DemographicsChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data?.age_distribution) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    const ageGroups = Object.entries(data.age_distribution);
    if (ageGroups.length === 0) return;

    // Colores para cada grupo de edad
    const colors = [
      '#3b82f6', // Azul
      '#8b5cf6', // Púrpura
      '#ec4899', // Rosa
      '#f59e0b', // Ámbar
      '#10b981', // Verde
      '#6366f1', // Índigo
      '#94a3b8'  // Gris
    ];

    // Calcular total
    const total = ageGroups.reduce((sum, [_, value]) => sum + value.count, 0);

    // Dibujar gráfico de barras
    const barWidth = (width - 100) / ageGroups.length;
    const maxCount = Math.max(...ageGroups.map(([_, value]) => value.count), 1);
    const chartHeight = height - 80;

    ageGroups.forEach(([group, value], index) => {
      const barHeight = (value.count / maxCount) * chartHeight;
      const x = 50 + index * barWidth;
      const y = height - 60 - barHeight;

      // Dibujar barra
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // Dibujar etiqueta del grupo
      ctx.fillStyle = '#666';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + (barWidth - 10) / 2, height - 45);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(group, 0, 0);
      ctx.restore();

      // Dibujar valor
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.count.toString(), x + (barWidth - 10) / 2, y - 5);

      // Dibujar porcentaje
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(`${value.percentage}%`, x + (barWidth - 10) / 2, y - 18);
    });

    // Título
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distribución por Grupo de Edad', width / 2, 20);

  }, [data]);

  if (!data || !data.age_distribution) {
    return (
      <div className="demographics-chart">
        <p className="chart-loading">Cargando datos demográficos...</p>
      </div>
    );
  }

  return (
    <div className="demographics-chart">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400}
        className="chart-canvas"
      />
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
