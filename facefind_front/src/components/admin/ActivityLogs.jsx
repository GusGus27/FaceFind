import React, { useState, useEffect } from 'react';
import '../../styles/ActivityLogs.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    // Simulación de logs de actividad
    setLogs([
      {
        id: 1,
        type: 'login',
        action: 'Inicio de sesión',
        user: 'admin@facefind.com',
        details: 'Acceso exitoso al panel administrativo',
        timestamp: '2025-10-05 14:35:22',
        ip: '192.168.1.100',
        status: 'success'
      },
      {
        id: 2,
        type: 'case',
        action: 'Creación de caso',
        user: 'maria@facefind.com',
        details: 'Nuevo caso reportado: Persona desaparecida #156',
        timestamp: '2025-10-05 14:20:15',
        ip: '192.168.1.105',
        status: 'success'
      },
      {
        id: 3,
        type: 'user',
        action: 'Modificación de usuario',
        user: 'admin@facefind.com',
        details: 'Cambio de rol de usuario: Juan Pérez',
        timestamp: '2025-10-05 13:45:30',
        ip: '192.168.1.100',
        status: 'success'
      },
      {
        id: 4,
        type: 'system',
        action: 'Actualización de sistema',
        user: 'sistema',
        details: 'Actualización automática de base de datos',
        timestamp: '2025-10-05 13:00:00',
        ip: 'localhost',
        status: 'success'
      },
      {
        id: 5,
        type: 'login',
        action: 'Intento de inicio de sesión',
        user: 'unknown@example.com',
        details: 'Intento de acceso fallido - Credenciales incorrectas',
        timestamp: '2025-10-05 12:30:45',
        ip: '203.45.67.89',
        status: 'error'
      },
      {
        id: 6,
        type: 'case',
        action: 'Actualización de caso',
        user: 'moderator@facefind.com',
        details: 'Estado de caso #145 cambiado a "Resuelto"',
        timestamp: '2025-10-05 11:15:20',
        ip: '192.168.1.110',
        status: 'success'
      },
      {
        id: 7,
        type: 'delete',
        action: 'Eliminación de registro',
        user: 'admin@facefind.com',
        details: 'Usuario eliminado: cuenta inactiva #234',
        timestamp: '2025-10-05 10:30:12',
        ip: '192.168.1.100',
        status: 'warning'
      },
      {
        id: 8,
        type: 'system',
        action: 'Backup automático',
        user: 'sistema',
        details: 'Respaldo de base de datos completado',
        timestamp: '2025-10-05 09:00:00',
        ip: 'localhost',
        status: 'success'
      }
    ]);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getLogIcon = (type) => {
    switch (type) {
      case 'login': return '🔐';
      case 'case': return '📁';
      case 'user': return '👤';
      case 'system': return '⚙️';
      case 'delete': return '🗑️';
      default: return '📝';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success': return 'status-success';
      case 'error': return 'status-error';
      case 'warning': return 'status-warning';
      default: return 'status-info';
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs_facefind_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="activity-logs">
      <div className="logs-header">
        <div>
          <h1>Logs de Actividad del Sistema</h1>
          <p>Registro de auditoría y seguimiento de acciones</p>
        </div>
        <button className="btn-export" onClick={exportLogs}>
          📥 Exportar Logs
        </button>
      </div>

      <div className="logs-filters">
        <input
          type="text"
          placeholder="Buscar en logs..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Todos los tipos</option>
          <option value="login">Inicios de sesión</option>
          <option value="case">Casos</option>
          <option value="user">Usuarios</option>
          <option value="system">Sistema</option>
          <option value="delete">Eliminaciones</option>
        </select>
        <select
          className="filter-select"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el tiempo</option>
        </select>
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Acción</th>
              <th>Usuario</th>
              <th>Detalles</th>
              <th>Fecha y Hora</th>
              <th>IP</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td>
                  <span className="log-icon">{getLogIcon(log.type)}</span>
                </td>
                <td><strong>{log.action}</strong></td>
                <td>{log.user}</td>
                <td>{log.details}</td>
                <td>{log.timestamp}</td>
                <td><code>{log.ip}</code></td>
                <td>
                  <span className={`status-badge ${getStatusClass(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="logs-summary">
        <p>Mostrando <strong>{filteredLogs.length}</strong> registros</p>
      </div>
    </div>
  );
};

export default ActivityLogs;
