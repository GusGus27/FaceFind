import React from 'react';
import '../../styles/admin/HeatmapCard.css';

const HeatmapCard = ({ data }) => {
  if (!data || !data.locations || data.locations.length === 0) {
    return (
      <div className="heatmap-card">
        <div className="heatmap-empty">
          <p>No hay datos de ubicación disponibles</p>
        </div>
      </div>
    );
  }

  // Obtener el valor máximo para normalizar los colores
  const maxCount = Math.max(...data.locations.map(loc => loc.count));

  // Función para obtener la intensidad del color basada en el conteo
  const getHeatIntensity = (count) => {
    const intensity = (count / maxCount) * 100;
    if (intensity >= 80) return 'very-high';
    if (intensity >= 60) return 'high';
    if (intensity >= 40) return 'medium';
    if (intensity >= 20) return 'low';
    return 'very-low';
  };

  return (
    <div className="heatmap-card">
      <div className="heatmap-legend">
        <span className="legend-label">Menor actividad</span>
        <div className="legend-gradient">
          <span className="gradient-color very-low"></span>
          <span className="gradient-color low"></span>
          <span className="gradient-color medium"></span>
          <span className="gradient-color high"></span>
          <span className="gradient-color very-high"></span>
        </div>
        <span className="legend-label">Mayor actividad</span>
      </div>

      <div className="heatmap-grid">
        {data.locations.map((location, index) => (
          <div 
            key={index}
            className={`heatmap-cell ${getHeatIntensity(location.count)}`}
            title={`${location.location}: ${location.count} casos`}
          >
            <div className="cell-content">
              <span className="cell-location">{location.location}</span>
              <span className="cell-count">{location.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="heatmap-info">
        <p>📍 Total de ubicaciones: {data.total_locations || data.locations.length}</p>
        <p>🔥 Ubicación más activa: {data.locations[0]?.location || 'N/A'} ({data.locations[0]?.count || 0} casos)</p>
      </div>
    </div>
  );
};

export default HeatmapCard;
