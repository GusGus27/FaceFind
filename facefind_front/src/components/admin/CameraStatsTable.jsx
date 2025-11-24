import React from 'react';
import '../../styles/admin/CameraStatsTable.css';

const CameraStatsTable = ({ cameras }) => {
  if (!cameras || cameras.length === 0) {
    return (
      <div className="camera-stats-table">
        <div className="table-empty">
          <p>📷 No hay cámaras configuradas en el sistema</p>
          <p className="empty-subtitle">Las estadísticas por cámara aparecerán cuando se agreguen cámaras</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: '🟢 Activa', className: 'status-active' },
      inactive: { label: '⚪ Inactiva', className: 'status-inactive' },
      error: { label: '🔴 Error', className: 'status-error' },
      maintenance: { label: '🟡 Mantenimiento', className: 'status-maintenance' }
    };
    return badges[status] || badges.inactive;
  };

  const getUptimeColor = (uptime) => {
    if (uptime >= 95) return 'excellent';
    if (uptime >= 80) return 'good';
    if (uptime >= 60) return 'fair';
    return 'poor';
  };

  return (
    <div className="camera-stats-table">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de Cámara</th>
              <th>Estado</th>
              <th>Detecciones</th>
              <th>Verdaderos Positivos</th>
              <th>Falsos Positivos</th>
              <th>Precisión</th>
              <th>Tiempo Activo</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera) => {
              const statusBadge = getStatusBadge(camera.status);
              const totalDetections = camera.detections || 0;
              const accuracy = totalDetections > 0 
                ? ((camera.true_positives / totalDetections) * 100).toFixed(1)
                : 0;
              const uptimeColor = getUptimeColor(camera.uptime || 0);

              return (
                <tr key={camera.camera_id}>
                  <td className="cell-id">{camera.camera_id}</td>
                  <td className="cell-name">{camera.camera_name}</td>
                  <td className="cell-status">
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="cell-number">{camera.detections || 0}</td>
                  <td className="cell-number cell-positive">{camera.true_positives || 0}</td>
                  <td className="cell-number cell-negative">{camera.false_positives || 0}</td>
                  <td className="cell-percentage">
                    <div className="accuracy-indicator">
                      <div className="accuracy-bar">
                        <div 
                          className={`accuracy-fill ${accuracy >= 80 ? 'high' : accuracy >= 60 ? 'medium' : 'low'}`}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <span>{accuracy}%</span>
                    </div>
                  </td>
                  <td className="cell-uptime">
                    <span className={`uptime-badge ${uptimeColor}`}>
                      {(camera.uptime || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <div className="summary-stat">
          <span className="stat-label">Total de Cámaras:</span>
          <span className="stat-value">{cameras.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Cámaras Activas:</span>
          <span className="stat-value">
            {cameras.filter(c => c.status === 'active').length}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Total Detecciones:</span>
          <span className="stat-value">
            {cameras.reduce((sum, c) => sum + (c.detections || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CameraStatsTable;
