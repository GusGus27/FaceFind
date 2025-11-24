import React from 'react';
import '../../styles/admin/DetectionMetricsCard.css';

const DetectionMetricsCard = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="detection-metrics-card">
        <p>Cargando métricas...</p>
      </div>
    );
  }

  const getStatusColor = (rate) => {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'fair';
    return 'poor';
  };

  const detectionRateColor = getStatusColor(metrics.detection_rate || 0);
  const accuracyColor = getStatusColor(metrics.accuracy || 0);

  return (
    <div className="detection-metrics-card">
      <div className="metrics-summary">
        <div className="summary-item">
          <span className="summary-label">Total Detecciones</span>
          <span className="summary-value">{metrics.total_detections || 0}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Estado</span>
          <span className={`summary-badge ${metrics.status}`}>
            {metrics.status === 'operational' ? '🟢 Operacional' : '⚪ Sin Datos'}
          </span>
        </div>
      </div>

      <div className="metrics-details">
        <div className="metric-row">
          <div className="metric-label">
            <span className="metric-icon">🎯</span>
            <span>Tasa de Detección</span>
          </div>
          <div className="metric-progress">
            <div className="progress-bar">
              <div 
                className={`progress-fill ${detectionRateColor}`}
                style={{ width: `${metrics.detection_rate || 0}%` }}
              />
            </div>
            <span className="metric-percentage">{metrics.detection_rate || 0}%</span>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            <span className="metric-icon">✅</span>
            <span>Verdaderos Positivos</span>
          </div>
          <div className="metric-value-display">
            {metrics.true_positives || 0}
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            <span className="metric-icon">❌</span>
            <span>Falsos Positivos</span>
          </div>
          <div className="metric-value-display">
            {metrics.false_positives || 0}
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">
            <span className="metric-icon">⚠️</span>
            <span>Tasa de Falsos Positivos</span>
          </div>
          <div className="metric-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill poor"
                style={{ width: `${metrics.false_positive_rate || 0}%` }}
              />
            </div>
            <span className="metric-percentage">{metrics.false_positive_rate || 0}%</span>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default DetectionMetricsCard;
