import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Trash2, Camera, AlertCircle, Clock } from 'lucide-react';
import { getOffHoursLogs, clearOldLogs, getLogsStatistics } from '../../services/scheduleService';
import '../../styles/OffHoursLogs.css';

const OffHoursLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    cameraId: '',
    startDate: '',
    endDate: '',
    isCritical: ''
  });
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filters]);

  const loadLogs = () => {
    const filterObj = {};
    if (filters.cameraId) filterObj.cameraId = filters.cameraId;
    if (filters.startDate) filterObj.startDate = filters.startDate;
    if (filters.endDate) filterObj.endDate = filters.endDate;
    if (filters.isCritical !== '') filterObj.isCritical = filters.isCritical === 'true';

    const allLogs = getOffHoursLogs(filterObj);
    setLogs(allLogs);
  };

  const loadStats = () => {
    const statistics = getLogsStatistics();
    setStats(statistics);
  };

  const handleClearOldLogs = () => {
    if (window.confirm('¿Eliminar logs mayores a 30 días?')) {
      const result = clearOldLogs(30);
      if (result.success) {
        alert(`Se eliminaron ${result.removedCount} logs`);
        loadLogs();
        loadStats();
      }
    }
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-fuera-horario-${new Date().toISOString()}.json`;
    link.click();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedLogs = [...logs].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'timestamp') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="off-hours-logs">
      <div className="logs-header">
        <h2>
          <FileText size={24} />
          Logs de Alertas Fuera de Horario
        </h2>
        <div className="header-actions">
          <button onClick={handleExportLogs} className="btn-export" title="Exportar logs">
            <Download size={16} />
            Exportar
          </button>
          <button onClick={handleClearOldLogs} className="btn-clear" title="Limpiar logs antiguos">
            <Trash2 size={16} />
            Limpiar Antiguos
          </button>
        </div>
      </div>

      {stats && (
        <div className="logs-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Logs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.last24Hours}</div>
            <div className="stat-label">Últimas 24h</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.last7Days}</div>
            <div className="stat-label">Últimos 7 días</div>
          </div>
          <div className="stat-card critical">
            <div className="stat-value">{stats.byCritical.critical}</div>
            <div className="stat-label">Críticos</div>
          </div>
          <div className="stat-card normal">
            <div className="stat-value">{stats.byCritical.normal}</div>
            <div className="stat-label">Normales</div>
          </div>
        </div>
      )}

      <div className="logs-filters">
        <div className="filter-group">
          <label>
            <Camera size={14} />
            Cámara
          </label>
          <input
            type="text"
            value={filters.cameraId}
            onChange={(e) => setFilters({ ...filters, cameraId: e.target.value })}
            placeholder="ID de cámara"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>
            <AlertCircle size={14} />
            Tipo
          </label>
          <select
            value={filters.isCritical}
            onChange={(e) => setFilters({ ...filters, isCritical: e.target.value })}
            className="filter-select"
          >
            <option value="">Todos</option>
            <option value="true">Críticos</option>
            <option value="false">Normales</option>
          </select>
        </div>

        <button 
          onClick={() => setFilters({ cameraId: '', startDate: '', endDate: '', isCritical: '' })}
          className="btn-clear-filters"
        >
          <Filter size={14} />
          Limpiar Filtros
        </button>
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('timestamp')} className="sortable">
                <Clock size={14} />
                Fecha y Hora {sortBy === 'timestamp' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('cameraId')} className="sortable">
                <Camera size={14} />
                Cámara {sortBy === 'cameraId' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('isCritical')} className="sortable">
                <AlertCircle size={14} />
                Tipo {sortBy === 'isCritical' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th>Razón</th>
              <th>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-logs">
                  <FileText size={40} />
                  <p>No hay logs registrados</p>
                </td>
              </tr>
            ) : (
              sortedLogs.map((log) => (
                <tr key={log.id} className={log.isCritical ? 'critical-row' : ''}>
                  <td>{formatDateTime(log.timestamp)}</td>
                  <td>
                    <span className="camera-badge">{log.cameraName || log.cameraId}</span>
                  </td>
                  <td>
                    {log.isCritical ? (
                      <span className="type-badge critical">Crítico</span>
                    ) : (
                      <span className="type-badge normal">Normal</span>
                    )}
                  </td>
                  <td className="reason-cell">{log.reason || 'Fuera de horario configurado'}</td>
                  <td className="alert-cell">{log.alertMessage || 'Alerta detectada'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedLogs.length > 0 && (
        <div className="logs-footer">
          Mostrando {sortedLogs.length} registro{sortedLogs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default OffHoursLogs;
