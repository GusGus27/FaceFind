import React, { useState, useEffect } from 'react';
import '../../styles/CaseManagement.css';

const CaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulación de casos
    setCases([
      {
        id: 1,
        title: 'Persona desaparecida - Juan Carlos',
        status: 'activo',
        priority: 'high',
        reportDate: '2025-10-01',
        location: 'Ciudad de México',
        reporter: 'María López'
      },
      {
        id: 2,
        title: 'Menor desaparecido - Ana Pérez',
        status: 'activo',
        priority: 'urgent',
        reportDate: '2025-10-03',
        location: 'Guadalajara',
        reporter: 'Pedro Sánchez'
      },
      {
        id: 3,
        title: 'Adulto mayor - José Martínez',
        status: 'resuelto',
        priority: 'medium',
        reportDate: '2025-09-25',
        location: 'Monterrey',
        reporter: 'Laura García'
      },
      {
        id: 4,
        title: 'Caso de extravío - Carmen Ruiz',
        status: 'pendiente',
        priority: 'low',
        reportDate: '2025-09-30',
        location: 'Puebla',
        reporter: 'Roberto Torres'
      }
    ]);
  }, []);

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (caseId, newStatus) => {
    setCases(cases.map(caseItem =>
      caseItem.id === caseId ? { ...caseItem, status: newStatus } : caseItem
    ));
  };

  const handlePriorityChange = (caseId, newPriority) => {
    setCases(cases.map(caseItem =>
      caseItem.id === caseId ? { ...caseItem, priority: newPriority } : caseItem
    ));
  };

  const handleDeleteCase = (caseId) => {
    if (window.confirm('¿Está seguro de eliminar este caso?')) {
      setCases(cases.filter(caseItem => caseItem.id !== caseId));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffc107';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  return (
    <div className="case-management">
      <div className="management-header">
        <h1>Gestión de Casos</h1>
        <button className="btn-primary">+ Nuevo Caso</button>
      </div>

      <div className="management-filters">
        <input
          type="text"
          placeholder="Buscar por título o ubicación..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
          <option value="resuelto">Resuelto</option>
        </select>
      </div>

      <div className="cases-grid">
        {filteredCases.map(caseItem => (
          <div key={caseItem.id} className="case-card-admin">
            <div className="case-card-header">
              <h3>{caseItem.title}</h3>
              <div
                className="priority-indicator"
                style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
              >
                {getPriorityLabel(caseItem.priority)}
              </div>
            </div>
            <div className="case-card-body">
              <div className="case-info">
                <p><strong>📍 Ubicación:</strong> {caseItem.location}</p>
                <p><strong>📅 Fecha:</strong> {caseItem.reportDate}</p>
                <p><strong>👤 Reportado por:</strong> {caseItem.reporter}</p>
              </div>
              <div className="case-controls">
                <label>Estado:</label>
                <select
                  value={caseItem.status}
                  onChange={(e) => handleStatusChange(caseItem.id, e.target.value)}
                  className="status-select"
                >
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>
              <div className="case-controls">
                <label>Prioridad:</label>
                <select
                  value={caseItem.priority}
                  onChange={(e) => handlePriorityChange(caseItem.id, e.target.value)}
                  className="priority-select"
                >
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>
            <div className="case-card-footer">
              <button className="btn-view">👁️ Ver Detalles</button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteCase(caseItem.id)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cases-summary">
        <p>Total de casos: <strong>{filteredCases.length}</strong></p>
      </div>
    </div>
  );
};

export default CaseManagement;
