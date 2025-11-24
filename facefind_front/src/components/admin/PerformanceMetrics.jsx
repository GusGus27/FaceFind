import React from 'react';
import '../../styles/admin/PerformanceMetrics.css';

const PerformanceMetrics = ({ data }) => {
  if (!data) {
    return (
      <div className="performance-metrics">
        <p>Cargando métricas de rendimiento...</p>
      </div>
    );
  }

  const getHealthColor = (health) => {
    const colors = {
      excellent: { color: '#10b981', label: '🟢 Excelente' },
      good: { color: '#3b82f6', label: '🔵 Bueno' },
      needs_improvement: { color: '#f59e0b', label: '🟡 Necesita Mejora' },
      poor: { color: '#ef4444', label: '🔴 Pobre' }
    };
    return colors[health] || colors.needs_improvement;
  };

  const healthInfo = getHealthColor(data.system_health);

  return (
    <div className="performance-metrics">
      <div className="metrics-overview">
        <div className="system-health">
          <h3>Estado del Sistema</h3>
          <div className="health-indicator" style={{ color: healthInfo.color }}>
            <span className="health-label">{healthInfo.label}</span>
            <div className="health-description">
              Basado en eficiencia de resolución del {data.resolution_efficiency || 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📈</span>
            <h4>Eficiencia de Resolución</h4>
          </div>
          <div className="metric-value-large">{data.resolution_efficiency || 0}%</div>
          <div className="metric-progress-bar">
            <div 
              className="metric-progress-fill"
              style={{ 
                width: `${data.resolution_efficiency || 0}%`,
                backgroundColor: data.resolution_efficiency >= 70 ? '#10b981' : data.resolution_efficiency >= 50 ? '#3b82f6' : '#f59e0b'
              }}
            />
          </div>
          <p className="metric-description">
            Porcentaje de casos resueltos exitosamente
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⏱️</span>
            <h4>Tiempo Promedio de Resolución</h4>
          </div>
          <div className="metric-value-large">
            {data.avg_resolution_time_days || 0} días
          </div>
          <div className="metric-details">
            <div className="detail-row">
              <span className="detail-label">⚡ Más rápido:</span>
              <span className="detail-value">{data.fastest_resolution_days || 0} días</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🐌 Más lento:</span>
              <span className="detail-value">{data.slowest_resolution_days || 0} días</span>
            </div>
          </div>
          <p className="metric-description">
            Tiempo desde el registro hasta la resolución
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">👥</span>
            <h4>Compromiso de Usuarios</h4>
          </div>
          <div className="metric-value-large">{data.user_engagement || 0}%</div>
          <div className="metric-progress-bar">
            <div 
              className="metric-progress-fill"
              style={{ 
                width: `${data.user_engagement || 0}%`,
                backgroundColor: '#8b5cf6'
              }}
            />
          </div>
          <p className="metric-description">
            Porcentaje de usuarios con casos registrados
          </p>
        </div>
      </div>

      <div className="performance-insights">
        <h4>💡 Insights de Rendimiento</h4>
        <ul className="insights-list">
          {data.resolution_efficiency >= 70 && (
            <li className="insight-item positive">
              ✅ Excelente tasa de resolución de casos
            </li>
          )}
          {data.resolution_efficiency < 50 && (
            <li className="insight-item warning">
              ⚠️ La tasa de resolución está por debajo del objetivo
            </li>
          )}
          {data.avg_resolution_time_days <= 7 && (
            <li className="insight-item positive">
              ✅ Tiempo de resolución óptimo (≤ 7 días)
            </li>
          )}
          {data.avg_resolution_time_days > 30 && (
            <li className="insight-item warning">
              ⚠️ El tiempo de resolución promedio es alto (&gt; 30 días)
            </li>
          )}
          {data.user_engagement >= 60 && (
            <li className="insight-item positive">
              ✅ Alto nivel de compromiso de usuarios
            </li>
          )}
          {data.user_engagement < 30 && (
            <li className="insight-item info">
              ℹ️ Oportunidad de aumentar el compromiso de usuarios
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
